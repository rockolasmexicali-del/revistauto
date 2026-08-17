const fs = require('fs');
const appJsPath = 'app.js';
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

// 1. Add session start time
if (!appJsContent.includes('window.sessionStartTime')) {
    appJsContent = appJsContent.replace('document.addEventListener(\'DOMContentLoaded\', () => {', "window.sessionStartTime = Date.now();\ndocument.addEventListener('DOMContentLoaded', () => {");
}

// 2. Add getSmartCTALogic
const getSmartCTALogicStr = `// ==========================================
// SMART CTA: LOGIC
// ==========================================
function getSmartCTALogic(itemsList) {
    // 1. Regla de Perfil: Si el usuario ya tiene al menos 1 vehículo activo -> Ocultar
    const myActiveListings = typeof db !== 'undefined' && db.getAllListings ? db.getAllListings().filter(l => l.status === 'autorizado' || l.status === 'pendiente') : [];
    if (myActiveListings.length > 0) {
        return { show: false };
    }

    // 2. Regla de Fatiga Visual: > 5 minutos navegando -> Ocultar
    if (window.sessionStartTime) {
        const elapsedMins = (Date.now() - window.sessionStartTime) / (1000 * 60);
        if (elapsedMins > 5) {
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
        
        // Regla de Estancamiento
        if (daysSinceNewest >= 2) {
            mainHTML = 'Destaca<br>tu auto';
            messageHTML = '<span>👀</span> Compradores buscando';
            show = true;
        } else {
            // Regla Weekend Boost (Viernes, Sabado, Domingo)
            const day = new Date().getDay();
            if (day === 5 || day === 6 || day === 0) { // 5=Fri, 6=Sat, 0=Sun
                if (Math.random() < 0.5) {
                    mainHTML = 'Publica<br>tu auto';
                    messageHTML = '<span>📸</span> Aprovecha el finde';
                    show = true;
                }
            }
        }
    }

    return { show, mainHTML, messageHTML };
}
`;

if (!appJsContent.includes('function getSmartCTALogic')) {
    appJsContent += "\n" + getSmartCTALogicStr;
}

// 3. Replace Static CTA in Grid
const staticGridRegex = /\/\/ ETAPA 2: Inyectar tarjeta estática en grid al inicio de la primera página\s*if \(window\.activeFeedListings\.length === newItems\.length\) \{\s*finalHTML \+= createSellCarCardHTML\('Publica<br>tu auto', '<span>🚀<\/span> Alta demanda en tu zona'\);\s*\}/;
const smartGridReplacement = `// ETAPA 3: Inyectar tarjeta inteligente en grid al inicio de la primera página
            if (window.activeFeedListings.length === newItems.length) {
                const ctaLogic = getSmartCTALogic(newItems);
                if (ctaLogic.show) {
                    finalHTML += createSellCarCardHTML(ctaLogic.mainHTML, ctaLogic.messageHTML);
                }
            }`;
if (appJsContent.match(staticGridRegex)) {
    appJsContent = appJsContent.replace(staticGridRegex, smartGridReplacement);
    console.log("Grid logic replaced with Smart CTA");
} else {
    console.log("Grid static regex not found");
}

// 4. Replace Static CTA in Carousel
const staticCarouselRegex = /\/\/ ETAPA 2: Inyectar tarjeta estática en carrusel horizontal\s*if \(existingCountForType === 0\) \{\s*rowCardsHTML \+= createSellCarCardHTML\('Publica<br>tu auto', '<span>🚀<\/span> Alta demanda en tu zona'\);\s*\}/;
const smartCarouselReplacement = `// ETAPA 3: Inyectar tarjeta inteligente en carrusel horizontal
                if (existingCountForType === 0) {
                    const ctaLogic = getSmartCTALogic(grouped[type]);
                    if (ctaLogic.show) {
                        rowCardsHTML += createSellCarCardHTML(ctaLogic.mainHTML, ctaLogic.messageHTML);
                    }
                }`;
if (appJsContent.match(staticCarouselRegex)) {
    appJsContent = appJsContent.replace(staticCarouselRegex, smartCarouselReplacement);
    console.log("Carousel logic replaced with Smart CTA");
} else {
    console.log("Carousel static regex not found");
}

fs.writeFileSync(appJsPath, appJsContent, 'utf8');
console.log("Script inject stage 3 completed.");
