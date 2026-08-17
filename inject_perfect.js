const fs = require('fs');
const appJsPath = 'app.js';
let content = fs.readFileSync(appJsPath, 'utf8');

// 1. Session start time
if (!content.includes('window.sessionStartTime')) {
    content = content.replace("document.addEventListener('DOMContentLoaded', () => {", "window.sessionStartTime = Date.now();\ndocument.addEventListener('DOMContentLoaded', () => {");
}

// 2. Empty States
const regexEmptyCategory = /No hay vehículos disponibles en esta categoría por el momento\.\s*<\/h2>\s*<\/div>/;
if (content.match(regexEmptyCategory)) {
    content = content.replace(regexEmptyCategory, `No hay vehículos disponibles en esta categoría por el momento.
                        </h2>
                        <button data-action="open-new-listing" class="primary-btn" style="padding: 12px 24px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-rounded">add_circle</span> Da de alta el primer vehículo
                        </button>
                    </div>`);
}

const regexEmptyTodos = /No hay vehículos publicados en tu zona todavía\.\s*<\/h2>\s*<\/div>/;
if (content.match(regexEmptyTodos)) {
    content = content.replace(regexEmptyTodos, `No hay vehículos publicados en tu zona todavía.
                        </h2>
                        <button data-action="open-new-listing" class="primary-btn" style="padding: 12px 24px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-rounded">add_circle</span> Da de alta tu vehículo
                        </button>
                    </div>`);
}

// 3. Carousel Logic
const carouselRegex = /let rowCardsHTML = '';\s*for \(let i = 0; i < grouped\[type\]\.length; i\+\+\) \{/;
if (content.match(carouselRegex)) {
    content = content.replace(carouselRegex, `let rowCardsHTML = '';
                let ctaLogicCarousel = null;
                let targetCtaIndexCarousel = -1;
                if (existingCountForType === 0) {
                    ctaLogicCarousel = getSmartCTALogic(grouped[type]);
                    if (ctaLogicCarousel.show) {
                        targetCtaIndexCarousel = Math.floor(Math.random() * Math.min(3, grouped[type].length + 1));
                    }
                }
                for (let i = 0; i < grouped[type].length; i++) {
                    if (i === targetCtaIndexCarousel) {
                        rowCardsHTML += createSellCarCardHTML(ctaLogicCarousel.mainHTML, ctaLogicCarousel.messageHTML);
                    }`);
}

const carouselEndRegex = /rowCardsHTML \+= createAdCardHTML\(ad, item\.id, item\.id\);\s*\}\s*\}/;
if (content.match(carouselEndRegex)) {
    content = content.replace(carouselEndRegex, `rowCardsHTML += createAdCardHTML(ad, item.id, item.id);
                    }
                }
                if (targetCtaIndexCarousel === grouped[type].length) {
                    rowCardsHTML += createSellCarCardHTML(ctaLogicCarousel.mainHTML, ctaLogicCarousel.messageHTML);
                }`);
}

// 4. Grid Logic
const gridRegex = /let finalHTML = '';\s*for \(let i = 0; i < newItems\.length; i\+\+\) \{/;
if (content.match(gridRegex)) {
    content = content.replace(gridRegex, `let finalHTML = '';
            let ctaLogicGrid = null;
            let targetCtaIndexGrid = -1;
            if (window.activeFeedListings.length === newItems.length) {
                ctaLogicGrid = getSmartCTALogic(newItems);
                if (ctaLogicGrid.show) {
                    targetCtaIndexGrid = Math.floor(Math.random() * Math.min(3, newItems.length + 1));
                }
            }
            for (let i = 0; i < newItems.length; i++) {
                if (i === targetCtaIndexGrid) {
                    finalHTML += createSellCarCardHTML(ctaLogicGrid.mainHTML, ctaLogicGrid.messageHTML);
                }`);
}

const gridEndRegex = /finalHTML \+= createAdCardHTML\(ad, newItems\[i\]\.id, newItems\[i\]\.id\);\s*\}\s*\}/;
if (content.match(gridEndRegex)) {
    content = content.replace(gridEndRegex, `finalHTML += createAdCardHTML(ad, newItems[i].id, newItems[i].id);
                }
            }
            if (targetCtaIndexGrid === newItems.length) {
                finalHTML += createSellCarCardHTML(ctaLogicGrid.mainHTML, ctaLogicGrid.messageHTML);
            }`);
}


// 5. Append Functions
const appendData = `
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
                <div style="width: 100%; background: var(--primary-color); color: white; border-radius: 8px; padding: 6px 4px; text-align: center; font-weight: 700; font-size: 0.75rem; line-height: 1.2; display: flex; align-items: center; justify-content: center; gap: 4px;">
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

// ==========================================
// SMART CTA: LOGIC
// ==========================================
function getSmartCTALogic(itemsList) {
    console.log("getSmartCTALogic called with", itemsList ? itemsList.length : 0, "items");
    // 1. Regla de Perfil: Si el usuario ya tiene al menos 1 vehículo activo -> Ocultar
    const myActiveListings = typeof db !== 'undefined' && db.getMyListings ? db.getMyListings().filter(l => l.status === 'autorizado' || l.status === 'pendiente') : [];
    if (myActiveListings.length > 0) {
        console.log("Hiding due to Rule 1: Profile has listings", myActiveListings.length);
        return { show: false };
    }

    // 2. Regla de Fatiga Visual: > 5 minutos navegando -> Ocultar
    if (window.sessionStartTime) {
        const elapsedMins = (Date.now() - window.sessionStartTime) / (1000 * 60);
        if (elapsedMins > 5) {
            console.log("Hiding due to Rule 2: Fatigue > 5 mins");
            return { show: false };
        }
    }

    const count = itemsList ? itemsList.length : 0;
    
    // 3. Textos por defecto (Bajo Inventario)
    let mainHTML = 'Publica<br>tu auto';
    let messageHTML = '<span>🚀</span> Alta demanda en tu zona';
    let show = false;

    if (count === 0) {
        mainHTML = 'Vende<br>tu vehículo';
        messageHTML = '<span>🔥</span> ¡Sé el primero!';
        show = true;
    } else if (count < 10) {
        show = true;
    } else {
        // >= 10 items. Check newest.
        let newestTime = 0;
        itemsList.forEach(item => {
            if (item.date) {
                const t = new Date(item.date).getTime();
                if (t > newestTime) newestTime = t;
            }
        });
        
        const daysSinceNewest = (Date.now() - newestTime) / (1000 * 60 * 60 * 24);
        
        if (daysSinceNewest >= 2) {
            mainHTML = 'Destaca<br>tu auto';
            messageHTML = '<span>👀</span> Compradores buscando';
            show = true;
        } else {
            const day = new Date().getDay();
            if (day === 5 || day === 6 || day === 0) { // 5=Fri, 6=Sat, 0=Sun
                if (Math.random() < 0.5) {
                    mainHTML = 'Publica<br>tu auto';
                    messageHTML = '<span>📸</span> Aprovecha el fin de semana ';
                    show = true;
                }
            } else {
                console.log("Hiding because >= 10 items, <2 days old, and NOT weekend.");
            }
        }
    }

    return { show, mainHTML, messageHTML };
}
`;

if (!content.includes('function getSmartCTALogic')) {
    content += "\n" + appendData;
}

fs.writeFileSync(appJsPath, content, 'utf8');
console.log("Inject perfect done");
