const fs = require('fs');
const appJsPath = 'app.js';
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

// 1. empty state Category
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
} else {
    // maybe it already has the button?
    if (appJsContent.includes('Da de alta el primer vehículo')) {
        console.log("emptyStateCategory already injected");
    } else {
        console.log("Failed emptyStateCategory");
    }
}

// 2. empty state Todos
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
} else {
    if (appJsContent.includes('Da de alta tu vehículo')) {
        console.log("emptyStateTodos already injected");
    } else {
        console.log("Failed emptyStateTodos");
    }
}

// 3. appendCarouselRegex
const regexCarousel = /catHTML \+= \`[\s\S]*?<div class="horizontal-scroll hide-scrollbar" style="display: flex; gap: 16px; padding: 0 20px; overflow-x: auto; scroll-snap-type: x mandatory;">[\s\S]*?\`;\s*catItems\.forEach\(item => \{/;
if (appJsContent.match(regexCarousel)) {
    const matchStr = appJsContent.match(regexCarousel)[0];
    const replacement = matchStr.replace('`;', `\`;\n\n                    // ETAPA 2: Inyectar tarjeta estática en carrusel horizontal\n                    catHTML += createSellCarCardHTML('Publica<br>tu auto', '<span>🚀</span> Alta demanda en tu zona');\n`);
    appJsContent = appJsContent.replace(regexCarousel, replacement);
    console.log("appendCarousel injected");
} else {
    console.log("Failed appendCarousel");
}

fs.writeFileSync(appJsPath, appJsContent, 'utf8');
console.log('Script injection v2 completed');
