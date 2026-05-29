/* =========================================
   CONFIGURAÇÃO E DADOS GLOBAIS
   ========================================= */
const map = L.map('map').setView([-16.69, -49.25], 9);

// Dica: Para produção, considere Mapbox ou Stadia Maps para tiles mais bonitos.
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Referências DOM (Cache)
const dom = {
    card: document.getElementById('propertyCard'),
    cardImg: document.getElementById('cardImage'),
    cardTitle: document.getElementById('cardTitle'),
    cardDesc: document.getElementById('cardDesc'),
    cardPrice: document.getElementById('cardPrice'),
    cardLink: document.getElementById('cardLink'),
    cardClose: document.querySelector(".card-close"),
    listMobile: document.getElementById("productList"),
    listDesktop: document.getElementById("productListDesktop"),
    sheet: document.getElementById("bottomSheet"),
    layoutDesktop: document.getElementById("layoutDesktop"),
    btnToggleMap: document.getElementById("toggleMap")
};

/* =========================================
   FUNÇÕES DE UI (CARD & LISTA)
   ========================================= */

function openCard(p) {
    if (window.collapseSheet) window.collapseSheet(); // Fecha sheet no mobile
    
    dom.cardImg.src = p.image;
    dom.cardTitle.textContent = p.title;
    dom.cardDesc.textContent = p.desc;
    dom.cardPrice.textContent = p.price;
    dom.cardLink.href = p.link;
    
    dom.card.classList.remove("hidden"); // Garante que remove hidden se houver
    requestAnimationFrame(() => dom.card.classList.add("visible"));
}

function closeCard() {
    dom.card.classList.remove("visible");
}

dom.cardClose.addEventListener("click", closeCard);

/* =========================================
   RENDERIZAÇÃO OTIMIZADA (MAPA E LISTA)
   ========================================= */

// 1. Otimização de Marcadores: Cria um grupo para adicionar ao mapa de uma só vez
const markersGroup = L.layerGroup();

// 2. Otimização de DOM: Usa Fragmentos para evitar reflows constantes
const fragmentMobile = document.createDocumentFragment();
const fragmentDesktop = document.createDocumentFragment();

function createProductItem(p) {
    const item = document.createElement("div");
    item.className = "product-item";
    
    // Using innerHTML is fine if data is trusted. 
    item.innerHTML = `
        <img src="${p.image}" alt="${p.title}" loading="lazy">
        <div class="product-body">
            <div class="product-title">${p.title}</div>
            <div class="product-desc">${p.desc}</div>
        </div>
    `;

    item.addEventListener("click", () => {
        map.setView([p.lat, p.lng], 15);
        openCard(p);
    });

    return item;
}

// Loop único para processar dados
properties.forEach(p => {
    // A. Marcadores do Mapa
    const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
            <div class="marker-content">
                <img src="${p.image}" alt="marker">
                <div class="marker-title">${p.title}</div>
            </div>
        `,
        iconSize: [140, 60],
        iconAnchor: [70, 60]
    });

    const marker = L.marker([p.lat, p.lng], { icon: customIcon });
    marker.on("click", () => openCard(p));
    markersGroup.addLayer(marker);

    // B. Itens da Lista
    // Clonamos o nó para não perder a referência do evento de click ao adicionar em dois lugares
    const itemMobile = createProductItem(p);
    const itemDesktop = itemMobile.cloneNode(true); 
    
    // Re-adicionando evento ao clone (cloneNode não copia event listeners)
    itemDesktop.addEventListener("click", () => {
        map.setView([p.lat, p.lng], 15);
        openCard(p);
    });

    fragmentMobile.appendChild(itemMobile);
    fragmentDesktop.appendChild(itemDesktop);
});

// Adiciona tudo ao DOM e Mapa de uma vez só
markersGroup.addTo(map);
dom.listMobile.appendChild(fragmentMobile);
dom.listDesktop.appendChild(fragmentDesktop);


/* =========================================
   BOTTOM SHEET (LÓGICA AIRBNB)
   ========================================= */
let sheetMetrics = {
    minH: 40,
    midH: window.innerHeight * 0.5,
    maxH: window.innerHeight * 0.88
};

let dragStartY = 0;
let sheetStartH = 0;
let dragging = false;

function updateSheetMetrics() {
    sheetMetrics.midH = window.innerHeight * 0.5;
    sheetMetrics.maxH = window.innerHeight * 0.88;
}

function setSheetState(state) {
    dom.sheet.classList.remove("sheet-min", "sheet-mid", "sheet-max");
    dom.sheet.classList.add(state);
    dom.sheet.style.height = ""; // Limpa altura inline após transição
}

// Exposto globalmente para ser chamado no openCard
window.collapseSheet = function () {
    setSheetState("sheet-min");
};

// Eventos de Touch
/* ===========================
   BOTTOM SHEET CORRIGIDO
   =========================== */
const sheetContent = document.querySelector(".sheet-content"); // Referência à lista interna

dom.sheet.addEventListener("touchstart", (e) => {
    // Verifica se deve iniciar o arrasto
    if (sheetContent.scrollTop <= 0 || e.target.closest('.sheet-handle')) {
        dragging = true;
        dragStartY = e.touches[0].clientY;
        sheetStartH = dom.sheet.offsetHeight;
        dom.sheet.style.transition = "none"; // Remove animação enquanto arrasta
    } else {
        dragging = false;
    }
}, { passive: true });
dom.sheet.addEventListener("touchmove", (e) => {
    if (!dragging) return;

    const currentY = e.touches[0].clientY;
    const delta = dragStartY - currentY;
    
    // Se estiver puxando para baixo mas a lista ainda tem scroll, não move o sheet
    if (delta < 0 && sheetContent.scrollTop > 0) return; 

    const newHeight = sheetStartH + delta;

    // Limites para não sumir da tela
    if (newHeight > sheetMetrics.maxH + 40 || newHeight < sheetMetrics.minH - 20) return;

    if (e.cancelable) e.preventDefault();
    dom.sheet.style.height = `${newHeight}px`;
}, { passive: false });

dom.sheet.addEventListener("touchend", (e) => {
    if (!dragging) return;
    dragging = false;
    
    dom.sheet.style.transition = "height 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)";

    const endY = e.changedTouches[0].clientY;
    const delta = dragStartY - endY;
    const h = dom.sheet.offsetHeight;

    // Lógica de decisão (O que estava faltando no seu código)
    const isSwipeUp = delta > 50;
    const isSwipeDown = delta < -50;

    // Identifica o estado atual baseado na classe
    const current = dom.sheet.classList.contains("sheet-min") ? "min"
                  : dom.sheet.classList.contains("sheet-mid") ? "mid"
                  : "max";

    if (isSwipeUp) {
        if (current === "min") setSheetState("sheet-mid");
        else setSheetState("sheet-max");
    } 
    else if (isSwipeDown) {
        if (current === "max") setSheetState("sheet-mid");
        else setSheetState("sheet-min");
    } 
    else {
        // Se foi um movimento curto, faz o snap para o ponto mais próximo
        const dMin = Math.abs(h - sheetMetrics.minH);
        const dMid = Math.abs(h - sheetMetrics.midH);
        const dMax = Math.abs(h - sheetMetrics.maxH);
        const closest = Math.min(dMin, dMid, dMax);

        if (closest === dMin) setSheetState("sheet-min");
        else if (closest === dMid) setSheetState("sheet-mid");
        else setSheetState("sheet-max");
    }
    
    // Limpa a altura inline para o CSS assumir
    setTimeout(() => {
        if (!dragging) dom.sheet.style.height = "";
    }, 300);
});


// Listener para redimensionamento da janela (rotação de tela)
window.addEventListener("resize", () => {
    updateSheetMetrics();
    // Opcional: forçar um estado para evitar bugs visuais
    if(dom.sheet.offsetHeight > 100) setSheetState("sheet-mid");
});


/* =========================================
   CONTROLE DE LAYOUT DESKTOP
   ========================================= */
dom.btnToggleMap.addEventListener("click", () => {
    const isFullscreen = dom.layoutDesktop.classList.toggle("map-fullscreen");
    dom.btnToggleMap.textContent = isFullscreen ? "x" : "⤢";

    // Aguarda a transição CSS terminar para ajustar o mapa
    setTimeout(() => {
        map.invalidateSize();
    }, 300);
});