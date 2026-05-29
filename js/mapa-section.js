/* =========================================
   MAPA SECTION — Homepage integrated Leaflet map
   Uses the same Supabase instance from app.js
   ========================================= */

(function () {
    'use strict';

    const SUPABASE_URL = 'https://uowelimfpijhjwjwqkyk.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_0bJhjtXlNL0-d5cT2c3J2A_7hbwC5Ox';

    // DOM refs
    const mapContainer = document.getElementById('mapHome');
    if (!mapContainer) return;

    const card = document.getElementById('propertyCardMap');
    const cardImg = document.getElementById('cardImageMap');
    const cardTitle = document.getElementById('cardTitleMap');
    const cardDesc = document.getElementById('cardDescMap');
    const cardPrice = document.getElementById('cardPriceMap');
    const cardLink = document.getElementById('cardLinkMap');
    const cardClose = card?.querySelector('.card-close');
    const listContainer = document.getElementById('productListMap');
    const searchInput = document.getElementById('searchInputMap');
    const searchClear = document.getElementById('searchClearBtn');

    /* ---------- Init Map ---------- */
    const map = L.map('mapHome', {
        center: [-16.69, -49.25],
        zoom: 9,
        zoomControl: true,
        attributionControl: true
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    /* ---------- Marker group (for search filtering) ---------- */
    const markersGroup = L.layerGroup();
    let allProperties = [];

    /* ---------- Floating Card ---------- */
    function openCard(p) {
        if (!card) return;
        cardImg.src = p.image;
        cardTitle.textContent = p.title;
        cardDesc.textContent = p.desc;
        cardPrice.textContent = p.price;
        cardLink.href = 'https://wa.me/556239141992?text=Tenho%20interesse%20no%20imóvel:%20' + encodeURIComponent(p.title);

        card.classList.remove('hidden');
        requestAnimationFrame(() => card.classList.add('visible'));
    }

    function closeCard() {
        if (!card) return;
        card.classList.remove('visible');
    }

    if (cardClose) cardClose.addEventListener('click', closeCard);

    /* ---------- Create product list item ---------- */
    function createProductItem(p) {
        const item = document.createElement('div');
        item.className = 'product-item';
        item.dataset.title = p.title.toLowerCase();
        item.innerHTML = `
            <img src="${p.image}" alt="${p.title}" loading="lazy">
            <div class="product-body">
                <div class="product-title">${p.title}</div>
                <div class="product-desc">${p.desc}</div>
            </div>
        `;
        item.addEventListener('click', () => {
            map.setView([p.lat, p.lng], 15);
            openCard(p);
            filterByTerm(p.title);
        });
        return item;
    }

    /* ---------- Render markers and list ---------- */
    function renderAll(properties) {
        // Clear previous
        markersGroup.clearLayers();
        listContainer.innerHTML = '';
        allProperties = properties;

        const fragment = document.createDocumentFragment();

        properties.forEach(p => {
            // Marker
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `
                    <div class="marker-content">
                        <img src="${p.image}" alt="${p.title}" loading="lazy">
                        <div class="marker-title">${p.title}</div>
                    </div>
                `,
                iconSize: [140, 60],
                iconAnchor: [70, 60]
            });

            const marker = L.marker([p.lat, p.lng], { icon: customIcon });
            marker.on('click', () => {
                openCard(p);
                filterByTerm(p.title);
            });
            markersGroup.addLayer(marker);

            // List item
            fragment.appendChild(createProductItem(p));
        });

        markersGroup.addTo(map);
        listContainer.appendChild(fragment);

        // Fit bounds
        if (properties.length > 0) {
            const bounds = L.featureGroup(
                properties.map(p => L.marker([p.lat, p.lng]))
            ).getBounds();
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
        }
    }

    /* ---------- Create "show all" item ---------- */
    function createShowAllItem() {
        const item = document.createElement('div');
        item.className = 'product-item show-all-item';
        item.innerHTML = `
            <div class="product-body" style="text-align:center; padding:24px 20px;">
                <div class="product-title" style="color:var(--gold); font-size:1.1rem;"><i class="ri-search-line" style="margin-right:8px;"></i>Mostrar Todos</div>
            </div>
        `;
        item.addEventListener('click', () => {
            searchInput.value = '';
            filterByTerm('');
        });
        return item;
    }

    /* ---------- Search filtering ---------- */
    let showAllItem = null;

    function filterByTerm(term) {
        const lower = term.toLowerCase();
        const hasFilter = lower.length > 0;

        // Remove/show show-all item
        if (showAllItem && showAllItem.parentNode) {
            showAllItem.remove();
            showAllItem = null;
        }

        // Filter list items
        [...listContainer.children].forEach(item => {
            const title = item.dataset.title || '';
            item.style.display = title.includes(lower) ? 'block' : 'none';
        });

        // Insert "Mostrar Todos" if filtered
        if (hasFilter) {
            showAllItem = createShowAllItem();
            listContainer.insertBefore(showAllItem, listContainer.firstChild);
        }

        // Rebuild markers
        markersGroup.clearLayers();

        (hasFilter
            ? allProperties.filter(p => p.title.toLowerCase().includes(lower))
            : allProperties
        ).forEach(p => {
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `
                    <div class="marker-content">
                        <img src="${p.image}" alt="${p.title}" loading="lazy">
                        <div class="marker-title">${p.title}</div>
                    </div>
                `,
                iconSize: [140, 60],
                iconAnchor: [70, 60]
            });
            const marker = L.marker([p.lat, p.lng], { icon: customIcon });
            marker.on('click', () => {
                openCard(p);
                filterByTerm(p.title);
            });
            markersGroup.addLayer(marker);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterByTerm(searchInput.value);
            if (searchClear) {
                searchClear.style.display = searchInput.value.length > 0 ? 'flex' : 'none';
            }
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.style.display = 'none';
            filterByTerm('');
            searchInput.focus();
        });
    }

    /* ---------- Fetch & Render ---------- */
    async function loadMapData() {
        try {
            let data = null;
            if (typeof _supabase !== 'undefined' && _supabase) {
                const { data: sbData, error } = await _supabase
                    .from('imoveis')
                    .select('*')
                    .eq('ativo', true);

                if (!error && sbData && sbData.length > 0) {
                    data = sbData;
                }
            }

            if (!data) {
                const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                const { data: sbData, error } = await sb
                    .from('imoveis')
                    .select('*')
                    .eq('ativo', true);

                if (!error && sbData && sbData.length > 0) {
                    data = sbData;
                }
            }

            if (data) {
                const properties = data.map(p => ({
                    id: p.id,
                    title: p.titulo,
                    desc: p.subtitulo || '',
                    price: p.preco || 'A consultar',
                    lat: p.latitude,
                    lng: p.longitude,
                    image: p.imagem_url
                        ? (p.imagem_url.startsWith('http') ? p.imagem_url : 'img/' + p.imagem_url.replace(/^img\//, ''))
                        : 'https://img.usecurling.com/p/400/300?q=real%20estate',
                    link: p.links?.find(l => l.texto === 'Site')?.url || '#'
                })).filter(p => p.lat && p.lng);

                renderAll(properties);
            } else {
                console.warn('Mapa-section: Nenhum imóvel encontrado no Supabase');
            }
        } catch (err) {
            console.warn('Mapa-section: Erro ao carregar dados, usando fallback local');
            renderAll(getFallbackProperties());
        }
    }

    function getFallbackProperties() {
        return [
            { id: 1, title: 'Quintas do Cerrado', desc: 'Chácaras acima de 1000 m²', price: 'R$ a partir de 290.000,00', lat: -16.6769904, lng: -49.6232455, image: 'img/QuintasCerrado.jpg', link: '#' },
            { id: 2, title: 'Terra Vermelha', desc: 'Chácaras acima de 500 m²', price: 'R$ 680.000', lat: -16.4526819, lng: -49.31034345, image: 'img/IconeTerraVermelha.png', link: '#' },
            { id: 3, title: 'Aldeia Santo Antônio', desc: 'Chácaras acima de 600 m²', price: 'R$ 680.000', lat: -16.4904629, lng: -49.27481865, image: 'img/AldeiaSantoAntonio.jpg', link: '#' },
            { id: 4, title: 'Quintas das Araras', desc: '', price: 'R$ 680.000', lat: -16.9287313, lng: -49.25213065, image: 'img/QuintasAraras.png', link: '#' },
            { id: 5, title: 'Quintas do Lago', desc: '', price: 'R$ 680.000', lat: -16.9172876, lng: -49.41646745, image: 'img/QuintasLago.jpg', link: '#' },
            { id: 6, title: 'Casa Uvva', desc: '', price: 'R$ 680.000', lat: -16.7872097, lng: -49.1052104, image: 'img/CasaUva.png', link: '#' }
        ];
    }

    /* ---------- Invalidate size on section visibility ---------- */
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => map.invalidateSize(), 200);
            }
        });
    }, { threshold: 0.1 });

    sectionObserver.observe(mapContainer);

    window.addEventListener('resize', () => {
        setTimeout(() => map.invalidateSize(), 200);
    });

    /* ---------- Start ---------- */
    loadMapData();
})();
