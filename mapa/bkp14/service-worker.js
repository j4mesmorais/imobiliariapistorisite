// ===========================================
// PISTORI MAP - SERVICE WORKER (SAFE MODE)
// Cache baseado nas imagens do data.js
// ===========================================

const CACHE_NAME = 'pistori-cache-v4';

// Arquivos principais obrigatórios
const CORE_FILES = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/data.js',
    'https://unpkg.com/leaflet/dist/leaflet.css',
    'https://unpkg.com/leaflet/dist/leaflet.js'
];

// -----------------------------
// Ler as imagens diretamente do data.js
// -----------------------------
async function getImagesFromDataJS() {
    try {
        const res = await fetch('/data.js');
        const text = await res.text();

        // Captura qualquer caminho dentro de image: "alguma-coisa"
        const regex = /image:\s*["'`](.*?)["'`]/g;

        let match;
        const images = [];

        while ((match = regex.exec(text)) !== null) {
            // exemplo: img/QuintasCerrado.jpg
            images.push('/' + match[1]);
        }

        return images;
    } catch (err) {
        console.warn("Erro ao ler data.js para extrair imagens:", err);
        return [];
    }
}

// -----------------------------
// INSTALL
// -----------------------------
self.addEventListener('install', event => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            // Cache dos arquivos core
            await cache.addAll(CORE_FILES);

            // Cache das imagens extraídas do data.js
            const images = await getImagesFromDataJS();

            if (images.length > 0) {
                await cache.addAll(images);
                console.log("Imagens adicionadas ao cache:", images);
            } else {
                console.log("Nenhuma imagem encontrada no data.js.");
            }
        })()
    );
});

// -----------------------------
// ACTIVATE - remove caches antigos
// -----------------------------
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        )
    );
});

// -----------------------------
// FETCH - offline-first
// -----------------------------
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request);
        })
    );
});
