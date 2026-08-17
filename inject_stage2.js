const fs = require('fs');
const appJsPath = 'app.js';
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

// 1. Agregar createSellCarCardHTML al final de app.js (si no existe)
if (!appJsContent.includes('createSellCarCardHTML')) {
    const fnHtml = `

// ==========================================
// SMART CTA: UI ELEMENTS
// ==========================================
function createSellCarCardHTML(mainHTML, messageHTML) {
    return \`
        <div class="card ad-card" data-action="open-new-listing" style="cursor: pointer; border: 2px solid var(--primary-color); border-radius: 16px; display: flex; flex-direction: column; position: relative; overflow: hidden; z-index: 10; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);">
            <div class="card-img-wrapper" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.16) 0%, rgba(59, 130, 246, 0.04) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; border-top: none;">
                <span class="material-symbols-rounded" style="font-size: 50px; color: var(--primary-color); filter: drop-shadow(0 2px 8px rgba(59, 130, 246, 0.5)); margin-bottom: 6px;">add_circle</span>
                <strong style="color: var(--primary-color); font-size: 1.1rem; text-align: center; line-height: 1.2; font-weight: 700; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">\${mainHTML}</strong>
            </div>
            <div class="card-content" style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; padding: 12px; background: rgba(59, 130, 246, 0.05);">
                <div style="width: 100%; background: var(--primary-color); color: white; border-radius: 8px; padding: 6px 4px; text-align: center; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 4px;">
                    \${messageHTML}
                </div>
            </div>
        </div>
    \`;
}

// Global Delegation for Modal
document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action="open-new-listing"]');
    if (trigger) {
        e.preventDefault();
        const btnNewListing = document.getElementById('btn-new-listing');
        if (btnNewListing) {
            btnNewListing.click();
        }
    }
});
`;
    appJsContent += fnHtml;
}

// 2. Modificar el empty state para agregar el boton de llamada a la accion
const emptyStateCategory = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; width: 100%; grid-column: 1 / -1; gap: 16px;">
                        <span class="material-symbols-rounded" style="font-size: 64px; color: var(--text-muted); opacity: 0.5;">directions_car</span>
                        <h2 style="color: var(--text-muted); text-align: center; font-size: 1.2rem; font-weight: 500;">
                            No hay vehículos disponibles en esta categoría por el momento.
                        </h2>
                    </div>`;
                    
const emptyStateCategoryNew = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; width: 100%; grid-column: 1 / -1; gap: 16px;">
                        <span class="material-symbols-rounded" style="font-size: 64px; color: var(--text-muted); opacity: 0.5;">directions_car</span>
                        <h2 style="color: var(--text-muted); text-align: center; font-size: 1.2rem; font-weight: 500;">
                            No hay vehículos disponibles en esta categoría por el momento.
                        </h2>
                        <button data-action="open-new-listing" class="primary-btn" style="padding: 12px 24px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-rounded">add_circle</span> Da de alta el primer vehículo
                        </button>
                    </div>`;

const emptyStateTodos = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; width: 100%; gap: 16px;">
                        <span class="material-symbols-rounded" style="font-size: 64px; color: var(--text-muted); opacity: 0.5;">search_off</span>
                        <h2 style="color: var(--text-muted); text-align: center; font-size: 1.2rem; font-weight: 500;">
                            No hay vehículos publicados en tu zona todavía.
                        </h2>
                    </div>`;
                    
const emptyStateTodosNew = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; width: 100%; gap: 16px;">
                        <span class="material-symbols-rounded" style="font-size: 64px; color: var(--text-muted); opacity: 0.5;">search_off</span>
                        <h2 style="color: var(--text-muted); text-align: center; font-size: 1.2rem; font-weight: 500;">
                            No hay vehículos publicados en tu zona todavía.
                        </h2>
                        <button data-action="open-new-listing" class="primary-btn" style="padding: 12px 24px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-rounded">add_circle</span> Da de alta tu vehículo
                        </button>
                    </div>`;

if (appJsContent.includes(emptyStateCategory)) {
    appJsContent = appJsContent.replace(emptyStateCategory, emptyStateCategoryNew);
} else {
    console.log("No se encontró emptyStateCategory, puede que el espaciado sea distinto");
}

if (appJsContent.includes(emptyStateTodos)) {
    appJsContent = appJsContent.replace(emptyStateTodos, emptyStateTodosNew);
} else {
    console.log("No se encontró emptyStateTodos, puede que el espaciado sea distinto");
}

// 3. Modificar appendFeedListingsToDOM (Grid mode)
const appendGridRegex = /const freq = db\.adFrequencyScroll \|\| 10;\s*let finalHTML = '';/g;
const appendGridReplacement = `const freq = db.adFrequencyScroll || 10;
            let finalHTML = '';
            
            // ETAPA 2: Inyectar tarjeta estática en grid al inicio de la primera página
            if (window.activeFeedListings.length === newItems.length) {
                finalHTML += createSellCarCardHTML('Publica<br>tu auto', '<span>🚀</span> Alta demanda en tu zona');
            }`;
if (appJsContent.match(appendGridRegex)) {
    appJsContent = appJsContent.replace(appendGridRegex, appendGridReplacement);
} else {
    console.log("No se encontró appendGridRegex");
}

// 4. Modificar appendFeedListingsToDOM (Horizontal carousels mode)
const appendCarouselRegex = /<div class="horizontal-scroll hide-scrollbar" style="display: flex; gap: 16px; padding: 0 20px; overflow-x: auto; scroll-snap-type: x mandatory;">\s*`;\s*catItems\.forEach\(item => {/g;

const appendCarouselReplacement = `<div class="horizontal-scroll hide-scrollbar" style="display: flex; gap: 16px; padding: 0 20px; overflow-x: auto; scroll-snap-type: x mandatory;">
                    \`;

                    // ETAPA 2: Inyectar tarjeta estática en carrusel horizontal
                    catHTML += createSellCarCardHTML('Publica<br>tu auto', '<span>🚀</span> Alta demanda en tu zona');

                    catItems.forEach(item => {`;
if (appJsContent.match(appendCarouselRegex)) {
    appJsContent = appJsContent.replace(appendCarouselRegex, appendCarouselReplacement);
} else {
    console.log("No se encontró appendCarouselRegex");
}

fs.writeFileSync(appJsPath, appJsContent, 'utf8');
console.log('Script injection completed');
