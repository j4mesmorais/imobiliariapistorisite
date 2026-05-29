const SUPABASE_URL = 'https://supabase.imobiliariapistori.com.br';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.Bo7sSl2Nv7Gb3vzOAPYesu83kkZc1oz-cHe_EMslt00';

const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;

// @ts-ignore
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const header = document.querySelector('header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const propertiesContainer = document.getElementById('properties-container');
const contactForm = document.getElementById('contact-form');

// --- Functions ---

// 1. Initial Data Fetch from Supabase
async function fetchProperties() {
    try {
        console.log('Buscando imóveis no Supabase...');
        const { data, error } = await _supabase
            .from('imoveis')
            .select('*')
            .eq('ativo', true);

        if (error) throw error;

        if (data && data.length > 0) {
            renderProperties(data);
        } else {
            // Fallback para dados locais se o banco estiver vazio
            renderProperties(getMockProperties());
        }
    } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
        renderProperties(getMockProperties());
    }
}

// 2. Render Property Cards
function renderProperties(properties) {
    if (!propertiesContainer) return;
    
    propertiesContainer.innerHTML = properties.map((prop, index) => `
        <div class="property-card reveal" style="transition-delay: ${index * 150}ms">
            <img src="${prop.imagem_url ? '/img/' + prop.imagem_url.split('/').pop() : 'https://img.usecurling.com/p/800/600?q=modern%20house'}" alt="${prop.titulo}" class="property-img">
            <div class="property-content">
                <span class="property-location" style="color: var(--gold); font-weight: 600; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.1em; margin-bottom: 4px; display: block;">${prop.subtitulo || ''}</span>
                <h3 class="property-title">${prop.titulo}</h3>
                <p class="property-desc">${prop.resumo || 'Excelente oportunidade de investimento.'}</p>
                <div class="property-footer">
                    <span class="property-price" style="font-weight: 600; color: white;">${prop.preco || 'A consultar'}</span>
                    <a href="https://wa.me/556239141992?text=Tenho%20interesse%20no%20imóvel:%20${encodeURIComponent(prop.titulo)}" target="_blank" class="btn btn-outline" style="height: 2.5rem; padding: 0 1rem; font-size: 0.8rem;">Tenho Interesse</a>
                </div>
            </div>
        </div>
    `).join('');

    // Re-initialize reveals for new elements
    initScrollReveal();
}

// 3. Scroll Effects
function handleScroll() {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// 4. Mobile Menu Toggle
function toggleMenu() {
    menuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : 'auto';
}

// 5. Scroll Reveal Logic
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// 6. Mock Data Fallback
function getMockProperties() {
    return [
        {
            id: 1,
            titulo: 'Aldeia do Lago',
            subtitulo: 'Chácaras de Lazer',
            resumo: 'Lotes em condomínio fechado com infraestrutura de alto padrão na região de Santa Bárbara de Goiás.',
            preco: 'Desde R$ 439,90/mês'
        },
        {
            id: 2,
            titulo: 'Quintas do Cerrado',
            subtitulo: 'Condomínio-fazenda',
            resumo: 'Um autêntico condomínio-fazenda exclusivo no coração do Cerrado, com área verde de 250 mil m².',
            preco: 'A consultar'
        },
        {
            id: 3,
            titulo: 'Reserva dos Ipês',
            subtitulo: 'Loteamento Premium',
            resumo: 'Loteamento premium com localização privilegiada. Infraestrutura completa e segurança 24h.',
            preco: 'A consultar'
        }
    ];
}

// --- Event Listeners ---

window.addEventListener('scroll', handleScroll);
menuToggle.addEventListener('click', toggleMenu);

// Fechar menu mobile ao clicar em link
document.querySelectorAll('.mobile-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Form Submission — Supabase + Email
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerHTML;

        btn.innerHTML = 'Enviando...';
        btn.disabled = true;

        const formData = new FormData(contactForm);
        const nome = formData.get('nome');
        const email = formData.get('email');
        const whatsapp = formData.get('whatsapp');
        const mensagem = formData.get('mensagem') || '';

        try {
            // 1. Salvar no Supabase
            const { error } = await _supabase.from('formcontsite').insert({
                nome,
                email,
                whatsapp,
                mensagem,
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            // 2. Enviar e-mail via SMTP.js (Elastic Email)
            const emailBody = `
                <h2>Novo contato do site - Pistori & Associados</h2>
                <p><strong>Nome:</strong> ${nome}</p>
                <p><strong>E-mail:</strong> ${email}</p>
                <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                <p><strong>Mensagem:</strong> ${mensagem || '(não informada)'}</p>
                <hr>
                <p style="color:#999;font-size:12px;">Enviado pelo formulário de contato do site.</p>
            `;

            await Email.send({
                Host: 'smtp.elasticemail.com',
                Username: 'vendas.pistori@gmail.com',
                Password: 'abeawtsjseuklqlh',
                To: 'vendas.pistori@gmail.com',
                From: 'vendas.pistori@gmail.com',
                Subject: 'Novo Contato Site — ' + nome,
                Body: emailBody
            });

            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            contactForm.reset();
        } catch (err) {
            console.error('Erro ao enviar formulário:', err);
            alert('Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// Initial Run
initScrollReveal();
fetchProperties();
