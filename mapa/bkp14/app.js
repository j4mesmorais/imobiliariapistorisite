// Corrige 100vh no mobile
function updateVH() {
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const vh = viewportHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Inicializa
updateVH();

// Atualiza quando o viewport muda (teclado abre/fecha, barra some, orientação muda)
if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
        setTimeout(updateVH, 50); // pequeno delay para estabilizar
    });
} else {
    window.addEventListener("resize", () => {
        setTimeout(updateVH, 50);
    });
}


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
const sheetContent = document.querySelector(".sheet-content");

dom.sheet.addEventListener("touchstart", (e) => {
    dragStartY = e.touches[0].clientY;
    sheetStartH = dom.sheet.offsetHeight;
    
    // Só ativamos o dragging se:
    // 1. Estivermos tocando no "handle" (alça)
    // 2. OU se a lista estiver no topo e o usuário tentar puxar para baixo
    // 3. OU se o sheet não estiver totalmente aberto (sheet-max)
    const isAtTop = sheetContent.scrollTop <= 0;
    const isMaximized = dom.sheet.classList.contains("sheet-max");

    if (e.target.closest('.sheet-handle') || isAtTop || !isMaximized) {
        dragging = true;
        dom.sheet.style.transition = "none";
    }
}, { passive: true });

dom.sheet.addEventListener("touchmove", (e) => {
    if (!dragging) return;

    const currentY = e.touches[0].clientY;
    const delta = dragStartY - currentY; // Positivo = Sobe, Negativo = Desce
    
    const isMaximized = dom.sheet.classList.contains("sheet-max");
    const isAtTop = sheetContent.scrollTop <= 0;

    // Bloqueio de conflito:
    // Se estiver maximizado e o usuário quiser rolar a lista pra baixo (delta > 0),
    // não arrastamos o sheet, deixamos o scroll natural do CSS acontecer.
    if (isMaximized && delta > 0) {
        dragging = false;
        return;
    }

    // Se estiver tentando descer o sheet, mas a lista não está no topo, cancela o drag
    if (delta < 0 && !isAtTop) {
        dragging = false;
        return;
    }

    const newHeight = sheetStartH + delta;

    // Impede que o sheet passe do limite máximo ou mínimo
    if (newHeight > sheetMetrics.maxH + 20 || newHeight < sheetMetrics.minH - 20) return;

    // Se chegamos aqui, o movimento é do Sheet, então evitamos o scroll da página
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

/* =========================================
   BUSCA POR TÍTULO
   ========================================= */

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();

    // Filtrar lista (mobile)
    [...dom.listMobile.children].forEach(item => {
        const title = item.querySelector(".product-title").textContent.toLowerCase();
        item.style.display = title.includes(term) ? "block" : "none";
    });

    // Filtrar lista (desktop)
    [...dom.listDesktop.children].forEach(item => {
        const title = item.querySelector(".product-title").textContent.toLowerCase();
        item.style.display = title.includes(term) ? "block" : "none";
    });

    // Filtrar marcadores do mapa
    markersGroup.clearLayers();

    properties
        .filter(p => p.title.toLowerCase().includes(term))
        .forEach(p => {
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
        });
       
});

