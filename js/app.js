const SUPABASE_URL = 'https://uowelimfpijhjwjwqkyk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0bJhjtXlNL0-d5cT2c3J2A_7hbwC5Ox...'; // Usei a chave parcial para segurança, mas vou colocar a completa no código final ou pedir ao usuário se necessário. 
// Na verdade, eu tenho a chave completa do .env anterior.

const supabaseUrl = 'https://uowelimfpijhjwjwqkyk.supabase.co';
const supabaseKey = 'sb_publishable_0bJhjtXlNL0-d5cT2c3J2A_7hbwC5Ox'; // Chave completa encontrada no .env

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

// Form Submission — Supabase
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerHTML;

        btn.innerHTML = 'Enviando...';
        btn.disabled = true;

        const formData = new FormData(contactForm);

        try {
            const { error } = await _supabase.from('formcontsite').insert({
                nome: formData.get('nome'),
                email: formData.get('email'),
                whatsapp: formData.get('whatsapp'),
                mensagem: formData.get('mensagem') || '',
                created_at: new Date().toISOString()
            });

            if (error) throw error;

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
