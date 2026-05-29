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
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UifQ.E64OFGjihkIjMrTmbqeErLD3upsX92ObgfTq5RSw1RU';

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
const modalOverlay = document.getElementById('modal-overlay');
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
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
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

/* ---------- Contatos (read-only) ---------- */
async function loadContatos() {
    contatosBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--muted-foreground);">Carregando...</td></tr>';
    try {
        const data = await supabaseRequest('GET', '/rest/v1/formcontsite?order=created_at.desc&limit=500');
        if (!data || data.length === 0) {
            contatosBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--muted-foreground);">Nenhum contato encontrado.</td></tr>';
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
    } catch (err) {
        contatosBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:#ef4444;">Erro ao carregar: ' + escHtml(err.message) + '</td></tr>';
    }
}

/* ---------- Imóveis (CRUD) ---------- */
async function loadImoveis() {
    imoveisBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--muted-foreground);">Carregando...</td></tr>';
    try {
        const data = await supabaseRequest('GET', '/rest/v1/imoveis?order=titulo.asc');
        if (!data || data.length === 0) {
            imoveisBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--muted-foreground);">Nenhum imóvel cadastrado.</td></tr>';
            return;
        }
        imoveisBody.innerHTML = data.map(p => `
            <tr>
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

        // Attach edit events
        imoveisBody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
        });
        imoveisBody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => openDeleteConfirm(parseInt(btn.dataset.id)));
        });
    } catch (err) {
        imoveisBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:#ef4444;">Erro ao carregar: ' + escHtml(err.message) + '</td></tr>';
    }
}

/* ---------- Modal CRUD ---------- */
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
    } catch (err) {
        alert('Erro ao carregar imóvel: ' + err.message);
        closeModal();
        return;
    }

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openCreateModal() {
    editingId = null;
    modalTitle.textContent = 'Novo Imóvel';
    saveBtn.textContent = 'Criar';
    imovelForm.reset();
    document.getElementById('edit-ativo').checked = true;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    editingId = null;
}

modalClose.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
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
        loadImoveis();
    } catch (err) {
        alert('Erro ao salvar: ' + err.message);
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
        deleteConfirmOverlay.classList.remove('active');
        loadImoveis();
    } catch (err) {
        alert('Erro ao excluir: ' + err.message);
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
    userName.textContent = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || 'Admin';
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

/* ---------- Start ---------- */
document.addEventListener('DOMContentLoaded', () => {
    // Load keycloak JS from CDN then init
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/keycloak-js@26/dist/keycloak.min.js';
    script.onload = initKeycloak;
    script.onerror = () => {
        loginScreen.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;">Erro ao carregar Keycloak. Verifique sua conexão.</div>';
    };
    document.head.appendChild(script);
});
