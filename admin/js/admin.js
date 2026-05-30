/* =========================================
   ADMIN — Painel administrativo Pistori & Associados
   Keycloak auth + Supabase REST (service_role)
   ========================================= */

// --- Config ---
const KC_CONFIG = {
    url: 'https://login.imobiliariapistori.com.br',
    realm: 'imobiliaria',
    clientId: 'site-admin'
};

const SUPABASE_URL = 'https://supabase.imobiliariapistori.com.br';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.Bo7sSl2Nv7Gb3vzOAPYesu83kkZc1oz-cHe_EMslt00';

// DOM refs
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const contatosBody = document.getElementById('contatos-body');
const imoveisBody = document.getElementById('imoveis-body');
const modalTitle = document.getElementById('modal-title');
const imovelForm = document.getElementById('imovel-form');
const modalClose = document.getElementById('modal-close');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const deleteConfirmOverlay = document.getElementById('delete-confirm-overlay');
const deleteConfirmYes = document.getElementById('delete-confirm-yes');
const deleteConfirmNo = document.getElementById('delete-confirm-no');

let keycloak = null;
let editingId = null;
let deletingId = null;

/* ---------- Supabase REST helper ---------- */
async function supabaseRequest(method, path, body) {
    const url = SUPABASE_URL + path;
    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
    };
    if (method === 'GET') {
        headers['Prefer'] = 'count=exact';
    }
    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    if (method === 'DELETE') {
        if (!res.ok && res.status !== 204) {
            throw new Error('DELETE failed: ' + res.status);
        }
        return null;
    }
    // For PATCH, 204 means success with no content
    if (method === 'PATCH' && res.status === 204) return null;
    // For POST with 201
    if (method === 'POST' && (res.status === 201 || res.status === 200)) {
        return res.headers.get('content-type')?.includes('json') ? res.json() : null;
    }
    if (!res.ok) {
        const text = await res.text();
        throw new Error('HTTP ' + res.status + ': ' + text);
    }
    return res.headers.get('content-type')?.includes('json') ? res.json() : null;
}

/* ---------- Tabs ---------- */
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabContents.forEach(tc => tc.classList.remove('active'));
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

/* ---------- Toast notifications ---------- */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: 'ri-checkbox-circle-line', error: 'ri-close-circle-line', info: 'ri-information-line' };
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<i class="' + (icons[type] || icons.info) + '"></i>'
        + '<span>' + escHtml(message) + '</span>'
        + '<button class="toast-close" onclick="this.parentElement.remove()">✕</button>';

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/* ---------- Result count helper ---------- */
function updateResultCount(id, count) {
    const el = document.getElementById(id);
    if (el) el.textContent = count + ' registro' + (count !== 1 ? 's' : '');
}

/* ---------- Contatos (read-only) ---------- */
async function loadContatos() {
    contatosBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--muted-foreground);">Carregando...</td></tr>';
    try {
        const data = await supabaseRequest('GET', '/rest/v1/formcontsite?order=created_at.desc&limit=500');
        if (!data || data.length === 0) {
            contatosBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--muted-foreground);">Nenhum contato encontrado.</td></tr>';
            updateResultCount('contatos-count', 0);
            return;
        }
        contatosBody.innerHTML = data.map(c => `
            <tr>
                <td>${escHtml(c.nome || '')}</td>
                <td><a href="mailto:${escHtml(c.email)}" style="color:var(--gold);">${escHtml(c.email)}</a></td>
                <td>${c.whatsapp ? `<a href="https://wa.me/${c.whatsapp.replace(/\D/g, '')}" target="_blank" style="color:var(--gold);">${escHtml(c.whatsapp)}</a>` : '-'}</td>
                <td>${escHtml(c.mensagem ? c.mensagem.substring(0, 80) + (c.mensagem.length > 80 ? '...' : '') : '-')}</td>
                <td style="white-space:nowrap;font-size:0.8rem;">${formatDate(c.created_at)}</td>
            </tr>
        `).join('');
        updateResultCount('contatos-count', data.length);
    } catch (err) {
        contatosBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:#ef4444;">Erro ao carregar: ' + escHtml(err.message) + '</td></tr>';
    }
}

/* ---------- Imóveis (CRUD) ---------- */
function renderThumb(url) {
    if (!url) return '<div class="thumb-placeholder"><i class="ri-image-line"></i></div>';
    return `<img class="thumb-img" src="${url}" alt="" loading="lazy">`;
}

async function loadImoveis() {
    imoveisBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--muted-foreground);">Carregando...</td></tr>';
    try {
        const data = await supabaseRequest('GET', '/rest/v1/imoveis?order=titulo.asc');
        if (!data || data.length === 0) {
            imoveisBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--muted-foreground);">Nenhum imóvel cadastrado.</td></tr>';
            updateResultCount('imoveis-count', 0);
            return;
        }
        imoveisBody.innerHTML = data.map(p => `
            <tr>
                <td>${renderThumb(p.imagem_url)}</td>
                <td><strong>${escHtml(p.titulo)}</strong></td>
                <td>${escHtml(p.subtitulo || '-')}</td>
                <td>${escHtml(p.preco || 'A consultar')}</td>
                <td>${p.ativo ? '<span style="color:#22c55e;">Sim</span>' : '<span style="color:#ef4444;">Não</span>'}</td>
                <td>
                    <button class="btn-table btn-edit" data-id="${p.id}" title="Editar"><i class="ri-edit-line"></i></button>
                    <button class="btn-table btn-delete" data-id="${p.id}" title="Excluir"><i class="ri-delete-bin-line"></i></button>
                </td>
            </tr>
        `).join('');
        updateResultCount('imoveis-count', data.length);

        // Attach edit events
        imoveisBody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
        });
        imoveisBody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => openDeleteConfirm(parseInt(btn.dataset.id)));
        });
    } catch (err) {
        imoveisBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:#ef4444;">Erro ao carregar: ' + escHtml(err.message) + '</td></tr>';
    }
}

/* ---------- Slide Panel CRUD ---------- */
const slidePanel = document.getElementById('slide-panel');
const slidePanelOverlay = document.getElementById('slide-panel-overlay');

async function openEditModal(id) {
    editingId = id;
    modalTitle.textContent = 'Editar Imóvel';
    saveBtn.textContent = 'Salvar';

    try {
        const data = await supabaseRequest('GET', '/rest/v1/imoveis?id=eq.' + id);
        const item = data && data[0];
        if (!item) throw new Error('Imóvel não encontrado');

        document.getElementById('edit-titulo').value = item.titulo || '';
        document.getElementById('edit-subtitulo').value = item.subtitulo || '';
        document.getElementById('edit-resumo').value = item.resumo || '';
        document.getElementById('edit-preco').value = item.preco || '';
        document.getElementById('edit-latitude').value = item.latitude || '';
        document.getElementById('edit-longitude').value = item.longitude || '';
        document.getElementById('edit-imagem_url').value = item.imagem_url || '';
        document.getElementById('edit-ativo').checked = item.ativo !== false;

        // Show preview if there's an existing image
        const currentUrl = item.imagem_url;
        if (currentUrl) {
            showImagePreview(currentUrl);
        } else {
            imagePreview.style.display = 'none';
        }
    } catch (err) {
        showToast('Erro ao carregar imóvel: ' + err.message, 'error');
        closeModal();
        return;
    }

    slidePanel.classList.add('open');
    slidePanelOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openCreateModal() {
    editingId = null;
    modalTitle.textContent = 'Novo Imóvel';
    saveBtn.textContent = 'Criar';
    imovelForm.reset();
    document.getElementById('edit-ativo').checked = true;
    selectedImageUrl = '';
    imagePreview.style.display = 'none';
    slidePanel.classList.add('open');
    slidePanelOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    slidePanel.classList.remove('open');
    slidePanelOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    editingId = null;
}

modalClose.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
slidePanelOverlay.addEventListener('click', (e) => {
    if (e.target === slidePanelOverlay) closeModal();
});

imovelForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';

    const payload = {
        titulo: document.getElementById('edit-titulo').value.trim(),
        subtitulo: document.getElementById('edit-subtitulo').value.trim(),
        resumo: document.getElementById('edit-resumo').value.trim(),
        preco: document.getElementById('edit-preco').value.trim(),
        latitude: parseFloat(document.getElementById('edit-latitude').value) || null,
        longitude: parseFloat(document.getElementById('edit-longitude').value) || null,
        imagem_url: document.getElementById('edit-imagem_url').value.trim(),
        ativo: document.getElementById('edit-ativo').checked
    };

    try {
        if (editingId) {
            await supabaseRequest('PATCH', '/rest/v1/imoveis?id=eq.' + editingId, payload);
        } else {
            await supabaseRequest('POST', '/rest/v1/imoveis', payload);
        }
        closeModal();
        showToast(editingId ? 'Imóvel atualizado com sucesso.' : 'Imóvel criado com sucesso.', 'success');
        loadImoveis();
    } catch (err) {
        showToast('Erro ao salvar: ' + err.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = editingId ? 'Salvar' : 'Criar';
    }
});

/* ---------- Delete confirmation ---------- */
function openDeleteConfirm(id) {
    deletingId = id;
    deleteConfirmOverlay.classList.add('active');
}

deleteConfirmYes.addEventListener('click', async () => {
    if (!deletingId) return;
    deleteConfirmYes.disabled = true;
    deleteConfirmYes.textContent = 'Excluindo...';
    try {
        await supabaseRequest('DELETE', '/rest/v1/imoveis?id=eq.' + deletingId);
        showToast('Imóvel excluído com sucesso.', 'success');
        deleteConfirmOverlay.classList.remove('active');
        loadImoveis();
    } catch (err) {
        showToast('Erro ao excluir: ' + err.message, 'error');
    } finally {
        deleteConfirmYes.disabled = false;
        deleteConfirmYes.textContent = 'Sim, Excluir';
        deletingId = null;
    }
});

deleteConfirmNo.addEventListener('click', () => {
    deleteConfirmOverlay.classList.remove('active');
    deletingId = null;
});

deleteConfirmOverlay.addEventListener('click', (e) => {
    if (e.target === deleteConfirmOverlay) {
        deleteConfirmOverlay.classList.remove('active');
        deletingId = null;
    }
});

/* ---------- Keycloak Auth ---------- */
function initKeycloak() {
    keycloak = new Keycloak(KC_CONFIG);

    keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/admin/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false
    }).then(authenticated => {
        if (authenticated) {
            showDashboard();
        } else {
            showLogin();
        }
    }).catch(err => {
        console.error('Keycloak init error:', err);
        // If silent-check-sso fails (404 etc), fallback to check-sso without iframe
        keycloak.init({
            onLoad: 'check-sso',
            pkceMethod: 'S256',
            checkLoginIframe: false
        }).then(authenticated => {
            if (authenticated) {
                showDashboard();
            } else {
                showLogin();
            }
        }).catch(err2 => {
            console.error('Keycloak fallback init error:', err2);
            showLogin();
        });
    });
}

function showLogin() {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    userName.textContent = (keycloak?.tokenParsed?.name || keycloak?.tokenParsed?.preferred_username || 'Admin');
    loadContatos();
    loadImoveis();
}

loginBtn.addEventListener('click', () => {
    keycloak.login({ redirectUri: window.location.origin + '/admin/' });
});

logoutBtn.addEventListener('click', () => {
    keycloak.logout({ redirectUri: window.location.origin + '/admin/' });
});

// Expose openCreateModal globally for HTML onclick
window.openCreateModal = openCreateModal;

/* ---------- Utils ---------- */
function escHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

function formatDate(iso) {
    if (!iso) return '-';
    try {
        return new Date(iso).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (_) {
        return iso;
    }
}

/* =========================================
   NextCloud Image Selector
   ========================================= */

// DOM refs for image selector
const btnSelectImage = document.getElementById('btn-select-image');
const imagePreview = document.getElementById('image-preview');
const imagePreviewImg = imagePreview?.querySelector('img');
const btnRemoveImage = document.getElementById('btn-remove-image');
const imgSelectorOverlay = document.getElementById('image-selector-overlay');
const imgSelectorGrid = document.getElementById('image-selector-grid');
const imgSelectorStatus = document.getElementById('image-selector-status');
const imgSelectorClose = document.getElementById('image-selector-close');
const imgSelectorCancel = document.getElementById('image-selector-cancel');
const editImagemUrl = document.getElementById('edit-imagem_url');

let selectedImageUrl = '';

/** Fetch image list from media-api */
async function listNextCloudImages() {
    const baseUrl = ADMIN_CONFIG.mediaApi.baseUrl;
    const path = ADMIN_CONFIG.mediaApi.imagesPath;
    const url = `${baseUrl}/list?path=${encodeURIComponent(path)}&type=image`;

    const response = await fetch(url);

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'HTTP ' + response.status);
    }

    const data = await response.json();
    // media-api returns { files: [{ name, ... }] }, map to { filename, url }
    return (data.files || []).map(f => ({
        filename: f.name,
        url: `${baseUrl}/raw/${path}/${encodeURIComponent(f.name)}`
    }));
}

/** Render image grid in the selector modal */
function renderImageGrid(images) {
    imgSelectorGrid.innerHTML = '';
    imgSelectorStatus.style.display = 'none';

    if (images.length === 0) {
        imgSelectorStatus.style.display = 'block';
        imgSelectorStatus.innerHTML = `
            <div class="img-empty">
                <i class="ri-folder-image-line"></i>
                <span>Nenhuma imagem encontrada em /Documents/Site/Imagens/</span>
                <span style="font-size:0.8rem;opacity:0.6;">Formatos aceitos: JPG, PNG, WebP, GIF</span>
            </div>
        `;
        return;
    }

    images.forEach(img => {
        const item = document.createElement('div');
        item.className = 'img-selector-item';
        if (selectedImageUrl === img.url) item.classList.add('selected');

        item.innerHTML = `
            <img src="${img.url}" alt="${img.filename}" loading="lazy">
            <div class="img-check"><i class="ri-check-line"></i></div>
            <div class="img-name">${escHtml(img.filename)}</div>
        `;

        item.addEventListener('click', () => {
            // Deselect all
            imgSelectorGrid.querySelectorAll('.img-selector-item').forEach(el => el.classList.remove('selected'));
            // Select this one
            item.classList.add('selected');
            // Save as media-api URL
            selectedImageUrl = img.url;
        });

        imgSelectorGrid.appendChild(item);
    });
}

/** Open the image selector modal */
async function openImageSelector() {
    imgSelectorOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    imgSelectorGrid.innerHTML = '';
    imgSelectorStatus.style.display = 'block';
    imgSelectorStatus.innerHTML = '<div class="img-loading"><i class="ri-loader-4-line ri-spin"></i> Carregando imagens...</div>';

    try {
        const images = await listNextCloudImages();
        renderImageGrid(images);
    } catch (err) {
        console.error('Erro ao carregar imagens do NextCloud:', err);
        imgSelectorStatus.style.display = 'block';
        imgSelectorStatus.innerHTML = `
            <div class="img-error">
                <i class="ri-error-warning-line" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
                Erro ao carregar imagens: ${escHtml(err.message)}
                <br>
                <button class="retry-btn" onclick="window.retryLoadImages()">Tentar Novamente</button>
            </div>
        `;
    }
}

window.retryLoadImages = openImageSelector;

function closeImageSelector() {
    imgSelectorOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function confirmImageSelection() {
    if (selectedImageUrl) {
        editImagemUrl.value = selectedImageUrl;
        showImagePreview(selectedImageUrl);
    }
    closeImageSelector();
}

function showImagePreview(url) {
    if (!url) {
        imagePreview.style.display = 'none';
        return;
    }
    imagePreviewImg.src = url;
    imagePreview.style.display = 'block';
}

// Event listeners for image selector
if (btnSelectImage) {
    btnSelectImage.addEventListener('click', openImageSelector);
}
if (imgSelectorClose) {
    imgSelectorClose.addEventListener('click', confirmImageSelection);
}
if (imgSelectorCancel) {
    imgSelectorCancel.addEventListener('click', closeImageSelector);
}
const imgSelectorOk = document.getElementById('image-selector-ok');
if (imgSelectorOk) {
    imgSelectorOk.addEventListener('click', confirmImageSelection);
}
if (imgSelectorOverlay) {
    imgSelectorOverlay.addEventListener('click', (e) => {
        if (e.target === imgSelectorOverlay) confirmImageSelection();
    });
}
if (btnRemoveImage) {
    btnRemoveImage.addEventListener('click', () => {
        editImagemUrl.value = '';
        selectedImageUrl = '';
        imagePreview.style.display = 'none';
    });
}


/* ---------- Start ---------- */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof ADMIN_CONFIG !== 'undefined' && ADMIN_CONFIG.devMode) {
        showDashboard();
        return;
    }
    // Load keycloak JS from CDN then init
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/keycloak-js/dist/keycloak.min.js';
    script.onload = initKeycloak;
    script.onerror = () => {
        loginScreen.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;">Erro ao carregar Keycloak. Verifique sua conexão.</div>';
    };
    document.head.appendChild(script);
});
