const fs = require('fs');
const appJsPath = 'app.js';
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

// 1. empty state Todos
const regexEmptyTodos = /No hay vehículos publicados en tu zona todavía\.\s*<\/h2>\s*<\/div>/;
if (appJsContent.match(regexEmptyTodos)) {
    const replacement = `No hay vehículos publicados en tu zona todavía.
                        </h2>
                        <button data-action="open-new-listing" class="primary-btn" style="padding: 12px 24px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-rounded">add_circle</span> Da de alta tu vehículo
                        </button>
                    </div>`;
    appJsContent = appJsContent.replace(regexEmptyTodos, replacement);
    console.log("emptyStateTodos injected");
}

// 2. empty state Category
const regexEmptyCategory = /No hay vehículos disponibles en esta categoría por el momento\.\s*<\/h2>\s*<\/div>/;
if (appJsContent.match(regexEmptyCategory)) {
    const replacement = `No hay vehículos disponibles en esta categoría por el momento.
                        </h2>
                        <button data-action="open-new-listing" class="primary-btn" style="padding: 12px 24px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-rounded">add_circle</span> Da de alta el primer vehículo
                        </button>
                    </div>`;
    appJsContent = appJsContent.replace(regexEmptyCategory, replacement);
    console.log("emptyStateCategory injected");
}

// 3. append to Grid
const gridRegex = /const freq = db\.adFrequencyScroll \|\| 10;\s*let finalHTML = '';/g;
if (appJsContent.match(gridRegex) && !appJsContent.includes('ETAPA 2: Inyectar tarjeta estática en grid')) {
    const gridReplacement = `const freq = db.adFrequencyScroll || 10;
            let finalHTML = '';
            
            // ETAPA 2: Inyectar tarjeta estática en grid al inicio de la primera página
            if (window.activeFeedListings.length === newItems.length) {
                finalHTML += createSellCarCardHTML('Publica<br>tu auto', '<span>🚀</span> Alta demanda en tu zona');
            }`;
    appJsContent = appJsContent.replace(gridRegex, gridReplacement);
    console.log("grid injected");
}

// 4. append to Carousel
const carouselRegex = /let rowCardsHTML = '';\s*for \(let i = 0; i < grouped\[type\]\.length; i\+\+\) \{/g;
if (appJsContent.match(carouselRegex) && !appJsContent.includes('ETAPA 2: Inyectar tarjeta estática en carrusel horizontal')) {
    const carouselReplacement = `let rowCardsHTML = '';

                // ETAPA 2: Inyectar tarjeta estática en carrusel horizontal
                if (existingCountForType === 0) {
                    rowCardsHTML += createSellCarCardHTML('Publica<br>tu auto', '<span>🚀</span> Alta demanda en tu zona');
                }

                for (let i = 0; i < grouped[type].length; i++) {`;
    appJsContent = appJsContent.replace(carouselRegex, carouselReplacement);
    console.log("carousel injected");
}

fs.writeFileSync(appJsPath, appJsContent, 'utf8');
console.log('Script injection v3 completed');
