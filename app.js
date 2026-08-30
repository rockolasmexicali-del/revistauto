
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.parseAndFormatPhone = function (phoneStr, context = null) {
    let rawStr = phoneStr ? String(phoneStr).trim() : '';

    if (!rawStr && context && typeof context === 'object') {
        rawStr = context.phone || context.seller_phone || context.whatsapp || context.seller_whatsapp || '';
    }

    if (!rawStr) {
        return {
            raw: '',
            prefix: '+52',
            countryLabel: 'MEX',
            nationalDigits: '',
            telUrl: '',
            displayFormatted: 'MEX +52'
        };
    }

    let digits = rawStr.replace(/[^0-9]/g, '');
    let lowerStr = rawStr.toLowerCase();

    let isUSA = false;
    let isMEX = false;

    // 1. Evaluación directa sobre el número enviado
    if (
        rawStr.startsWith('+1') ||
        rawStr.startsWith('1 ') ||
        rawStr.startsWith('1-') ||
        rawStr.startsWith('+ 1') ||
        lowerStr.startsWith('usa') ||
        lowerStr.startsWith('us +1') ||
        (digits.length === 11 && digits.startsWith('1'))
    ) {
        isUSA = true;
    } else if (
        rawStr.startsWith('+52') ||
        rawStr.startsWith('52 ') ||
        rawStr.startsWith('52-') ||
        rawStr.startsWith('+ 52') ||
        lowerStr.startsWith('mex') ||
        lowerStr.startsWith('mx ') ||
        (digits.length >= 12 && digits.startsWith('52'))
    ) {
        isMEX = true;
    }

    // 2. Si es de 10 dígitos sin prefijo explícito, consultar contexto (WhatsApp o LADA elegida)
    if (!isUSA && !isMEX && digits.length === 10) {
        if (context) {
            if (typeof context === 'string') {
                const cUpper = context.toUpperCase();
                if (cUpper === '+1' || cUpper === 'US' || cUpper === 'USA' || cUpper.includes('+1')) {
                    isUSA = true;
                }
            } else if (typeof context === 'object') {
                const wa = String(context.whatsapp || context.seller_whatsapp || '').trim();
                const waDigits = wa.replace(/[^0-9]/g, '');

                if (
                    wa.startsWith('+1') ||
                    wa.startsWith('1 ') ||
                    wa.startsWith('1-') ||
                    wa.toLowerCase().startsWith('usa') ||
                    (waDigits.length === 11 && waDigits.startsWith('1'))
                ) {
                    isUSA = true;
                } else if (
                    wa.startsWith('+52') ||
                    wa.startsWith('52 ') ||
                    (waDigits.length >= 12 && waDigits.startsWith('52'))
                ) {
                    isMEX = true;
                }
            }
        }
    }

    // Si no fue identificado como USA de forma estricta, por defecto es México (+52)
    let prefix = isUSA ? '+1' : '+52';
    let countryLabel = isUSA ? 'USA' : 'MEX';

    let nationalDigits = digits;
    if (isUSA && digits.length === 11 && digits.startsWith('1')) {
        nationalDigits = digits.substring(1);
    } else if (isMEX && digits.length === 13 && digits.startsWith('521')) {
        nationalDigits = digits.substring(3);
    } else if (isMEX && digits.length === 12 && digits.startsWith('52')) {
        nationalDigits = digits.substring(2);
    } else if (digits.length > 10) {
        nationalDigits = digits.slice(-10);
    }

    if (nationalDigits.length > 10) {
        nationalDigits = nationalDigits.slice(-10);
    }

    let formattedNational = nationalDigits;
    if (nationalDigits.length === 10) {
        formattedNational = `(${nationalDigits.substring(0, 3)}) ${nationalDigits.substring(3, 6)}-${nationalDigits.substring(6)}`;
    }

    let fullTelNumber = prefix + nationalDigits;
    let displayFormatted = `${countryLabel} ${prefix} ${formattedNational}`;

    return {
        raw: rawStr,
        prefix: prefix,
        countryLabel: countryLabel,
        nationalDigits: nationalDigits,
        telUrl: `tel:${fullTelNumber}`,
        displayFormatted: displayFormatted
    };
};

function getListingCurrencyLabel(listing) {
    if (!listing) return 'Pesos';
    const curr = typeof listing === 'string' ? listing : (listing.currency || 'MXN');
    return String(curr).toUpperCase().trim() === 'USD' ? 'Dlls' : 'Pesos';
}
window.getListingCurrencyLabel = getListingCurrencyLabel;

function usePriceFormatterHook(listing, options = {}) {
    if (!listing) return '<span class="price-negotiable">Precio a tratar</span>';
    const priceNum = typeof listing === 'number' ? listing : Number(listing.price);
    
    if (isNaN(priceNum) || priceNum <= 0) {
        return `<span class="price-negotiable">Precio a tratar</span>`;
    }
    
    const currLabel = getListingCurrencyLabel(listing);
    let html = `$${priceNum.toLocaleString('es-MX')} <span class="price-currency">${currLabel}</span>`;
    
    if (!options.skipOldPrice && listing.old_price && Number(listing.old_price) > priceNum) {
        html += `<span style="font-size: 0.85rem; color: #ef4444; text-decoration: line-through; margin-left: 6px; font-weight: bold;">$${Number(listing.old_price).toLocaleString('es-MX')}</span>`;
    }
    
    return html;
}
window.usePriceFormatterHook = usePriceFormatterHook;
window.formatListingPriceHTML = usePriceFormatterHook;

function getListingPriceText(listing) {
    if (!listing) return 'Precio a tratar';
    const priceNum = typeof listing === 'number' ? listing : Number(listing.price);
    if (isNaN(priceNum) || priceNum <= 0) {
        return 'Precio a tratar';
    }
    const currLabel = getListingCurrencyLabel(listing) === 'Dlls' ? 'USD' : 'MXN';
    return `$${priceNum.toLocaleString('es-MX')} ${currLabel}`;
}
window.getListingPriceText = getListingPriceText;

window.appConfirm = function (message, onConfirm, title = '¿Estás seguro?') {
    const modal = document.getElementById('custom-confirm-modal');
    if (!modal) {
        if (confirm(message)) onConfirm();
        return;
    }

    document.getElementById('confirm-modal-title').textContent = title;
    document.getElementById('confirm-modal-message').textContent = message;

    const btnCancel = document.getElementById('btn-confirm-cancel');
    const btnAccept = document.getElementById('btn-confirm-accept');

    btnCancel.onclick = () => {
        modal.classList.remove('active');
    };

    btnAccept.onclick = async () => {
        btnAccept.disabled = true;
        try {
            await onConfirm();
        } finally {
            modal.classList.remove('active');
            btnAccept.disabled = false;
        }
    };

    modal.classList.add('active');
};

window.buildWhatsAppUrl = function (phone, title, context = null) {
    if (!phone) return '#';
    const waData = parseAndFormatPhone(phone, context);
    const cleanPhone = waData.prefix.replace('+', '') + waData.nationalDigits;
    const message = encodeURIComponent(`Hola, vi tu anuncio de "${title}" en RevistAuto y me interesa.`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
};
window.sessionStartTime = Date.now();
setTimeout(() => {
    document.querySelectorAll('.netflix-row-cta-container button').forEach(btn => {
        btn.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        btn.style.opacity = '0';
        btn.style.transform = 'scale(0.95)';
    });
    setTimeout(() => {
        document.querySelectorAll('.netflix-row-cta-container').forEach(el => el.innerHTML = '');
    }, 800);
    console.log("40 seconds elapsed, CTAs fading out smoothly.");
}, 40000);
// --- HOOK: Precios y Promociones por Ciudad ---
window.useCityPricingHook = (function() {
    let settingsRef = null;

    function init(settings) {
        settingsRef = settings;
    }

    function getCityPrice(cityName, stateName = '') {
        if (!settingsRef) return 500; // Fallback extremo
        const cityPrices = settingsRef.cityPrices || {};
        const key = cityName;
        if (cityPrices[key] !== undefined) {
            return Number(cityPrices[key]);
        }
        // Si no hay regla específica para la ciudad, por default es Gratis ($0)
        return 0;
    }

    function isCityMissing(cityName) {
        if (!settingsRef) return false;
        const cityPrices = settingsRef.cityPrices || {};
        return cityPrices[cityName] === undefined;
    }

    async function registerNewCityAsFree(cityName) {
        if (!settingsRef || !cityName) return;
        if (isCityMissing(cityName)) {
            settingsRef.cityPrices = settingsRef.cityPrices || {};
            settingsRef.cityPrices[cityName] = 0; // Gratis por defecto
            if (typeof db !== 'undefined' && db.saveSettings) {
                await db.saveSettings(settingsRef);
            }
        }
    }

    function isCityFree(cityName, stateName = '') {
        return getCityPrice(cityName, stateName) === 0;
    }

    return {
        init,
        getCityPrice,
        isCityMissing,
        registerNewCityAsFree,
        isCityFree
    };
})();

// --- HOOK: Precios de Publicidad (Ads) ---
window.useAdPricingHook = (function() {
    let settingsRef = null;

    function init(settings) {
        settingsRef = settings;
    }

    function getAdPrice(ad = null) {
        if (ad && ad.checkout_price !== undefined && ad.checkout_price !== null) {
            return Number(ad.checkout_price);
        }
        if (settingsRef && settingsRef.adMonthlyPrice !== undefined) {
            return Number(settingsRef.adMonthlyPrice);
        }
        return typeof globalAdMonthlyPrice !== 'undefined' ? Number(globalAdMonthlyPrice) : 500;
    }

    return { init, getAdPrice };
})();

// ====================================================================
// HOOK: useAnalyticsHook — Manejo unificado de analíticas y visitas
// Registra visitas globales y vistas por tarjeta de forma limpia y segura
// ====================================================================
function useAnalyticsHook() {
    return {
        recordGlobalVisit: (city, state) => {
            if (city && city !== 'Desconocida' && window._fallbackUnknownVisitTimeout) {
                clearTimeout(window._fallbackUnknownVisitTimeout);
                window._fallbackUnknownVisitTimeout = null;
            }
            if (typeof db !== 'undefined' && db && typeof db.recordGlobalVisit === 'function') {
                db.recordGlobalVisit(city, state);
            }
        },
        incrementListingView: async (listingId) => {
            if (typeof db !== 'undefined' && db && typeof db.incrementViews === 'function') {
                return await db.incrementViews(listingId);
            }
            return 0;
        }
    };
}
window.useAnalyticsHook = useAnalyticsHook;

document.addEventListener('DOMContentLoaded', () => {
    // --- Silent Direct Browser Redirect (Facebook -> Native Browser) ---
    useDirectBrowserRedirect();

    // --- Registrar visita global del sitio (una vez por sesión) ---
    // Si ya existe ubicación conocida en caché, se registra de inmediato.
    // Si es modo incógnito / primera visita, esperamos 25 segundos a que el usuario lea y acepte el GPS o elija ciudad.
    const cachedLocStr = localStorage.getItem('revista_last_location');
    let hasKnownCity = false;
    if (cachedLocStr) {
        try {
            const parsedLoc = JSON.parse(cachedLocStr);
            if (parsedLoc && parsedLoc.city && parsedLoc.city !== 'Desconocida') {
                hasKnownCity = true;
                if (typeof useAnalyticsHook === 'function') {
                    useAnalyticsHook().recordGlobalVisit(parsedLoc.city, parsedLoc.state);
                }
            }
        } catch (e) {}
    }

    if (!hasKnownCity) {
        window._fallbackUnknownVisitTimeout = setTimeout(() => {
            const today = (typeof getLocalDateString === 'function') ? getLocalDateString() : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
            if (!sessionStorage.getItem('revista_global_visit_recorded_' + today)) {
                if (typeof useAnalyticsHook === 'function') {
                    useAnalyticsHook().recordGlobalVisit('Desconocida', 'Desconocido');
                }
            }
            window._fallbackUnknownVisitTimeout = null;
        }, 25000); // 25 segundos para que el usuario lea con calma y elija su opción
    }

    // --- State ---
    window.sessionSeed = Math.random(); // Semilla para mezcla aleatoria congelada por sesión
    window.getSessionRandomValue = function (id) {
        // Genera un número pseudo-aleatorio consistente basado en el ID y la semilla de la sesión
        let hash = 0;
        const str = String(id) + '_' + window.sessionSeed;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    };

    // ====================================================================
    // HOOK: isAdminLoggedIn — Protección de carga Admin para usuarios normales
    // Solo ejecuta código del panel de administración si hay sesión de admin activa.
    // Esto evita peticiones de red, procesamiento DOM y datos innecesarios
    // para el 99% de los usuarios que nunca verán el panel de admin.
    // ====================================================================
    function isAdminLoggedIn() {
        return !!(window.adminToken || localStorage.getItem('admin_token'));
    }
    window.isAdminLoggedIn = isAdminLoggedIn;

    let savedListingsIds = JSON.parse(localStorage.getItem('revista_autos_saved') || '[]');
    let currentFeedCategory = 'Todos';

    // --- DOM Elements ---
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    // Feed
    // Inicialización completada.
    const feedContainer = document.getElementById('feed-container');
    const homeCategories = document.getElementById('home-categories');
    const userStateSelect = document.getElementById('user-state');
    const btnUserCities = document.getElementById('btn-user-cities');
    const btnLocateMe = document.getElementById('btn-locate-me');

    // Cities Modal
    const citiesModal = document.getElementById('cities-modal');
    const btnCloseCitiesModal = document.getElementById('btn-close-cities-modal');
    const citiesCheckboxesContainer = document.getElementById('cities-checkboxes-container');
    const btnApplyCities = document.getElementById('btn-apply-cities');

    let selectedCities = []; // Holds the active cities filter

    // Search
    const searchResults = document.getElementById('search-results');
    const btnSearch = document.getElementById('btn-search');

    // Saved
    const savedListingsContainer = document.getElementById('saved-listings-container');

    // My Listings & Form
    const myListingsContainer = document.getElementById('my-listings-container');
    const btnNewListing = document.getElementById('btn-new-listing');
    const newListingModal = document.getElementById('new-listing-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const newListingForm = document.getElementById('new-listing-form');
    let editingListingId = null;
    let populateMakesForType = function (selectedType) {};
    let tryAutoAdvanceWizardStep = function () {};

    function buildAdminWhatsAppUrl(phone, listingTitle, context = null) {
        if (!phone) return '#';
        const waData = typeof parseAndFormatPhone === 'function' ? parseAndFormatPhone(phone, context) : { prefix: '+52', nationalDigits: phone.replace(/\D/g, '') };
        const cleanPhone = (waData.prefix || '+52').replace('+', '') + (waData.nationalDigits || '');
        const text = encodeURIComponent(`Hola, te contactamos de RevistAuto sobre tu publicación '${listingTitle || 'vehículo'}'. Te recordamos que tu anuncio está próximo a vencer. ¿Te gustaría renovarlo por 30 días más?`);
        return `https://wa.me/${cleanPhone}?text=${text}`;
    }
    window.buildAdminWhatsAppUrl = buildAdminWhatsAppUrl;

    const adFullscreenModal = document.getElementById('ad-fullscreen-modal');
    const btnCloseAdModal = document.getElementById('btn-close-ad-modal');
    if (btnCloseAdModal && adFullscreenModal) {
        btnCloseAdModal.addEventListener('click', () => {
            // Guardar ID siguiente si es que existe antes de que se limpie
            const nextId = window.pendingNextListingIdAfterAd;

            if (history.state && history.state.page === 'ad-modal') {
                // Si venimos del historial normal, usar history.back()
                // Esto disparará popstate, que a su vez cerrará el modal limpiamente.
                history.back();
            } else {
                // Fallback por si acaso no hay history
                adFullscreenModal.classList.remove('active');
                adFullscreenModal.style.display = 'none';
                window.pendingNextListingIdAfterAd = null;
                window.pendingPrevListingIdAfterAd = null;
                requestAnimationFrame(() => {
                    window.scrollTo(0, savedScrollPosition);
                });
            }

            if (nextId) {
                setTimeout(() => {
                    window.openListingDetails(nextId);
                }, 100);
            }
        });
    }

    // Form Selects
    const formType = document.getElementById('form-type');
    const formMake = document.getElementById('form-make');
    const formModel = document.getElementById('form-model');
    const formColor = document.getElementById('form-color');
    const formState = document.getElementById('form-state');
    const formCity = document.getElementById('form-city');
    const formPhoneLada = document.getElementById('form-phone-lada');
    const formPhone = document.getElementById('form-phone');
    const formWhatsApp = document.getElementById('form-whatsapp');
    const formEngineText = document.getElementById('form-engine-text');
    const formEngineSelectContainer = document.getElementById('form-engine-select-container');
    const formEngineSelect = document.getElementById('form-engine-select');
    const formCustomEngine = document.getElementById('form-custom-engine');
    const formCarEngineContainer = document.getElementById('form-car-engine-container');
    const formCylindersSelect = document.getElementById('form-cylinders-select');
    const formCustomCylinders = document.getElementById('form-custom-cylinders');
    const formEngineDisplacement = document.getElementById('form-engine-displacement');
    const formFreeEngineContainer = document.getElementById('form-free-engine-container');
    const formFreeEngineLabel = document.getElementById('form-free-engine-label');
    const formTruckEngineContainer = document.getElementById('form-truck-engine-container');
    const formTransmission = document.getElementById('form-transmission');
    const formBoxContainer = document.getElementById('form-box-container');
    const formBoxSelect = document.getElementById('form-box-select');
    const formCustomBox = document.getElementById('form-custom-box');
    const formAc = document.getElementById('form-ac');
    const formMileage = document.getElementById('form-mileage');
    const formLegal = document.getElementById('form-legal');
    const formCustomMake = document.getElementById('form-custom-make');
    const formCustomModel = document.getElementById('form-custom-model');
    const formCustomColor = document.getElementById('form-custom-color');
    let whatsappModified = false;
    let phoneModified = false;
    let selectedImageFiles = [];

    // Lógica dinámica para mostrar el precio al usuario si regresa al Paso 1 después de elegir ciudad
    if (formCity) {
        formCity.addEventListener('change', () => {
            const vehiclePriceNote = document.getElementById('vehicle-dynamic-price');
            if (vehiclePriceNote && window.useCityPricingHook) {
                const finalCityPrice = window.useCityPricingHook.getCityPrice(formCity.value, formState.value);
                if (finalCityPrice === 0) {
                    vehiclePriceNote.textContent = 'Gratis';
                    vehiclePriceNote.style.color = '#10b981';
                } else {
                    vehiclePriceNote.textContent = `$${Number(finalCityPrice).toFixed(2)} MXN`;
                    vehiclePriceNote.style.color = '#f59e0b';
                }

                // Novedad: Si el usuario ya avanzó al Paso 2 (o más) y cambia la ciudad,
                // lo regresamos automáticamente al Paso 1 para que vea el nuevo costo.
                if (typeof currentWizardStep !== 'undefined' && currentWizardStep >= 2) {
                    currentWizardStep = 1;
                    if (typeof updateWizardUI === 'function') {
                        updateWizardUI();
                    }
                }
            }
        });
    }

    // Filter Selects
    const filterState = document.getElementById('filter-state');
    const filterCity = document.getElementById('filter-city');
    const filterYear = document.getElementById('filter-year');
    const filterTransmission = document.getElementById('filter-transmission');
    const filterLegal = document.getElementById('filter-legal');

    // Admin Dashboard
    const adminDashboardModal = document.getElementById('admin-dashboard-modal');
    const btnCloseDashboard = document.getElementById('btn-close-dashboard');
    const btnAdminAddListing = document.getElementById('btn-admin-add-listing');
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    const dashboardViews = document.querySelectorAll('.dashboard-view');

    function updateAdminVersionDisplay() {
        const ver = typeof APP_VERSION !== 'undefined' ? `v${APP_VERSION}` : 'v1.2.1';
        const badge = document.getElementById('admin-app-version-badge');
        if (badge) badge.textContent = ver;
        document.querySelectorAll('.admin-app-version-text').forEach(el => el.textContent = ver);
    }
    window.updateAdminVersionDisplay = updateAdminVersionDisplay;
    updateAdminVersionDisplay();

    // Detalles
    const viewDetalle = document.getElementById('view-detalle');
    const detalleContent = document.getElementById('detalle-content');
    let previousViewId = 'view-inicio';
    let savedScrollPosition = 0;

    // Salida / History
    const exitModal = document.getElementById('exit-modal');
    const btnExitYes = document.getElementById('btn-exit-yes');
    const btnExitNo = document.getElementById('btn-exit-no');

    // Custom Alert Logic
    const customAlertModal = document.getElementById('custom-alert-modal');
    const customAlertMessage = document.getElementById('custom-alert-message');
    const customAlertTitle = document.getElementById('custom-alert-title');
    let customAlertTimeout;

    let onCustomAlertClose = null;

    window.showAlert = function (message, title = 'Notificación', icon = 'info', onClose = null) {
        onCustomAlertClose = onClose;
        customAlertMessage.textContent = message;
        customAlertTitle.textContent = title;
        document.getElementById('custom-alert-icon').innerHTML = `<span class="material-symbols-rounded">${icon}</span>`;
        if (icon === 'error' || icon === 'warning') {
            document.getElementById('custom-alert-icon').style.color = 'var(--danger-color)';
            document.getElementById('custom-alert-modal').querySelector('.modal-content').style.borderColor = 'var(--danger-color)';
        } else {
            document.getElementById('custom-alert-icon').style.color = 'var(--primary-color)';
            document.getElementById('custom-alert-modal').querySelector('.modal-content').style.borderColor = 'var(--primary-color)';
        }

        customAlertModal.classList.add('active');

        // Auto-cierre
        if (customAlertTimeout) clearTimeout(customAlertTimeout);
        customAlertTimeout = setTimeout(() => {
            customAlertModal.classList.remove('active');
            if (typeof onCustomAlertClose === 'function') {
                const cb = onCustomAlertClose;
                onCustomAlertClose = null;
                cb();
            }
        }, 9000); // Se cierra en 9 segundos
    };
    let isExiting = false;

    const btnCustomAlertOk = document.getElementById('btn-custom-alert-ok');
    if (btnCustomAlertOk) {
        btnCustomAlertOk.addEventListener('click', () => {
            customAlertModal.classList.remove('active');
            if (customAlertTimeout) clearTimeout(customAlertTimeout);
            if (typeof onCustomAlertClose === 'function') {
                const cb = onCustomAlertClose;
                onCustomAlertClose = null;
                cb();
            }
        });

        // Permitir cerrar la alerta presionando Enter
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && customAlertModal.classList.contains('active')) {
                e.preventDefault();
                btnCustomAlertOk.click();
            }
        });
    }
    // --- Custom Select Logic ---
    class CustomSelectWrapper {
        constructor(selectElement, opts = {}) {
            this.select = selectElement;
            this.opts = opts;
            this.options = [];

            // Ocultar select original
            this.select.style.display = 'none';

            // Crear contenedor
            this.wrapper = document.createElement('div');
            this.wrapper.className = 'custom-select-wrapper' + (opts.dropUp ? ' drop-up' : '');
            this.select.parentNode.insertBefore(this.wrapper, this.select);
            this.wrapper.appendChild(this.select);

            // Crear trigger
            this.trigger = document.createElement('div');
            this.trigger.className = 'custom-select-trigger';
            this.wrapper.appendChild(this.trigger);

            // Crear dropdown
            this.dropdown = document.createElement('div');
            this.dropdown.className = 'custom-select-dropdown';
            this.wrapper.appendChild(this.dropdown);

            // Eventos principales
            this.trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.select.disabled || this.dropdown.children.length === 0) {
                    return;
                }
                const isOpen = this.dropdown.classList.contains('open');
                // Cerrar todos los demás primero
                document.querySelectorAll('.custom-select-dropdown.open').forEach(d => {
                    d.classList.remove('open');
                    d.previousElementSibling.classList.remove('open');
                });
                if (!isOpen) {
                    this.dropdown.classList.add('open');
                    this.trigger.classList.add('open');
                }
            });

            this.update();

            // Actualizar visualmente si el select cambia programáticamente
            this.select.addEventListener('change', () => {
                const selectedOpt = this.select.options[this.select.selectedIndex];
                if (selectedOpt) {
                    this.trigger.innerHTML = `<span>${selectedOpt.text}</span><span class="material-symbols-rounded">expand_more</span>`;

                    // Actualizar estado selected en el dropdown
                    Array.from(this.dropdown.children).forEach(child => {
                        if (child.dataset.value === this.select.value) {
                            child.classList.add('selected');
                        } else {
                            child.classList.remove('selected');
                        }
                    });
                }
                if (this.select.value && this.select.value !== '') {
                    this.trigger.classList.remove('input-error');
                    this.select.classList.remove('input-error');
                }
            });
        }

        update() {
            this.dropdown.innerHTML = '';
            const selectedOpt = this.select.options[this.select.selectedIndex];
            this.trigger.innerHTML = `<span>${selectedOpt ? selectedOpt.text : 'Selecciona una opción'}</span><span class="material-symbols-rounded">expand_more</span>`;

            Array.from(this.select.options).forEach(option => {
                // Omitir placeholders y opciones deshabilitadas para que solo aparezcan las opciones reales seleccionables (en blanco)
                if (option.disabled || option.value === '') {
                    return;
                }

                const optDiv = document.createElement('div');
                optDiv.className = 'custom-select-option';
                optDiv.textContent = option.text;
                optDiv.dataset.value = option.value;

                optDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.select.value = option.value;
                    this.trigger.innerHTML = `<span>${option.text}</span><span class="material-symbols-rounded">expand_more</span>`;
                    this.dropdown.classList.remove('open');
                    this.trigger.classList.remove('open');
                    this.trigger.classList.remove('input-error');
                    this.select.classList.remove('input-error');

                    // Disparar change con bubbling para el resto del sistema
                    this.select.dispatchEvent(new Event('change', { bubbles: true }));

                    // Actualizar selección visual
                    Array.from(this.dropdown.children).forEach(c => c.classList.remove('selected'));
                    optDiv.classList.add('selected');

                    if (typeof tryAutoAdvanceWizardStep === 'function') {
                        tryAutoAdvanceWizardStep();
                    }
                });

                if (this.select.value === option.value) {
                    optDiv.classList.add('selected');
                }

                this.dropdown.appendChild(optDiv);
            });
        }
    }

    // Cerrar custom selects al hacer clic fuera
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select-dropdown.open').forEach(d => {
            d.classList.remove('open');
            d.previousElementSibling.classList.remove('open');
        });
    });

    // Limpieza dinámica de bordes rojos (.input-error) conforme el usuario interactúa
    const clearInputError = (target) => {
        if (!target) return;
        const val = target.value ? String(target.value).trim() : '';
        if (val !== '' || (target.checkValidity && target.checkValidity())) {
            target.classList.remove('input-error');
            if (target.tagName && target.tagName.toLowerCase() === 'select' && target.parentNode && target.parentNode.classList.contains('custom-select-wrapper')) {
                const trigger = target.parentNode.querySelector('.custom-select-trigger');
                if (trigger) trigger.classList.remove('input-error');
            }
        }
    };
    document.addEventListener('input', (e) => clearInputError(e.target));
    document.addEventListener('change', (e) => clearInputError(e.target));

    // Global utility to compress image to base64
    window.compressImage = function (file, maxWidth = 800) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let scaleSize = 1;
                    if (img.width > maxWidth) {
                        scaleSize = maxWidth / img.width;
                    }
                    canvas.width = img.width * scaleSize;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/webp', 0.75));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    // ==========================================
    // HOOK DE OPTIMIZACIÓN Y MINIATURAS (THUMBNAILS)
    // ==========================================
    function useImageOptimizerHook() {
        function createThumbnailFile(sourceUrlOrFile, fileName = 'thumb.webp', maxWidth = 360, quality = 0.65) {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let scaleSize = 1;
                    if (img.width > maxWidth) {
                        scaleSize = maxWidth / img.width;
                    }
                    canvas.width = Math.round(img.width * scaleSize);
                    canvas.height = Math.round(img.height * scaleSize);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], fileName, { type: 'image/webp' }));
                        } else {
                            resolve(null);
                        }
                    }, 'image/webp', quality);
                };
                img.onerror = () => resolve(null);

                if (sourceUrlOrFile instanceof File || sourceUrlOrFile instanceof Blob) {
                    img.src = URL.createObjectURL(sourceUrlOrFile);
                } else if (typeof sourceUrlOrFile === 'string') {
                    img.src = sourceUrlOrFile;
                } else {
                    resolve(null);
                }
            });
        }

        function getThumbnailUrl(listing) {
            if (!listing) return 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80';
            if (listing.thumbnail) return listing.thumbnail;
            if (listing.thumb) return listing.thumb;

            const images = listing.images || (listing.image ? [listing.image] : []);
            const firstImage = images[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80';

            return firstImage;
        }

        return {
            createThumbnailFile,
            getThumbnailUrl
        };
    }
    window.useImageOptimizerHook = useImageOptimizerHook;


    // --- NoSleep.js para evitar que la pantalla se apague ---
    if (window.NoSleep) {
        const noSleep = new NoSleep();
        let wakeLockEnabled = false;

        const enableNoSleep = () => {
            if (!wakeLockEnabled) {
                noSleep.enable();
                wakeLockEnabled = true;
                document.removeEventListener('click', enableNoSleep, false);
                document.removeEventListener('touchstart', enableNoSleep, false);
            }
        };

        // El navegador requiere que el usuario toque la pantalla al menos una vez para activar esto
        document.addEventListener('click', enableNoSleep, false);
        document.addEventListener('touchstart', enableNoSleep, false);
    }

    // --- Initialization ---
    initNavigation();
    initHistoryState();

    let globalMonthlyPrice = 500;
    let globalAdMonthlyPrice = 500;
    let globalMpEnabled = false;
    let globalMpPublicKey = '';

    async function loadSettings() {
        try {
            const data = await db.getSettings();
            if (data.success && data.settings) {
                if (window.useCityPricingHook) {
                    window.useCityPricingHook.init(data.settings);
                }
                if (window.useAdPricingHook) {
                    window.useAdPricingHook.init(data.settings);
                }
                globalMonthlyPrice = data.settings.monthlyPrice;
                globalMpEnabled = data.settings.mercadoPagoEnabled;
                globalMpPublicKey = data.settings.mpPublicKey;

                const costDisclaimer = document.getElementById('monthly-cost-disclaimer');
                if (costDisclaimer) {
                    costDisclaimer.innerHTML = '';
                }

                const vehiclePriceNote = document.getElementById('vehicle-dynamic-price');
                if (vehiclePriceNote) {
                    if (Number(globalMonthlyPrice) === 0) {
                        vehiclePriceNote.textContent = 'Gratis';
                        vehiclePriceNote.style.color = '#10b981';
                    } else {
                        vehiclePriceNote.textContent = `$${Number(globalMonthlyPrice).toFixed(2)} MXN`;
                        vehiclePriceNote.style.color = '#f59e0b';
                    }
                }

                const inputPrice = document.getElementById('admin-monthly-price');
                if (inputPrice) inputPrice.value = globalMonthlyPrice;

                globalAdMonthlyPrice = data.settings.adMonthlyPrice !== undefined ? data.settings.adMonthlyPrice : 500;

                const inputAdPrice = document.getElementById('admin-ad-monthly-price');
                if (inputAdPrice) inputAdPrice.value = globalAdMonthlyPrice;

                const adPaymentNote = document.getElementById('ad-payment-note-price');
                if (adPaymentNote) {
                    if (Number(globalAdMonthlyPrice) === 0) {
                        adPaymentNote.textContent = 'Gratis';
                    } else {
                        adPaymentNote.textContent = `$${Number(globalAdMonthlyPrice).toFixed(2)} MXN`;
                    }
                }

                const publishPriceText = document.getElementById('publish-price-text');
                if (publishPriceText) publishPriceText.textContent = `$${Number(globalMonthlyPrice).toFixed(2)} MXN`;

                const mpToggle = document.getElementById('admin-mp-enabled');
                const mpCreds = document.getElementById('admin-mp-credentials');
                const mpPubKey = document.getElementById('admin-mp-public-key');
                const mpAccToken = document.getElementById('admin-mp-access-token');

                if (mpToggle) {
                    mpToggle.checked = globalMpEnabled;
                    if (mpCreds) mpCreds.style.display = globalMpEnabled ? 'flex' : 'none';
                    mpToggle.addEventListener('change', (e) => {
                        if (mpCreds) mpCreds.style.display = e.target.checked ? 'flex' : 'none';
                    });
                }
                if (mpPubKey) mpPubKey.value = globalMpPublicKey || '';
                if (mpAccToken) mpAccToken.value = data.settings.mpAccessToken || '';

                const adToggle = document.getElementById('admin-ad-toggle');
                const adFreq = document.getElementById('admin-ad-frequency');
                const adFallbackLimitContainer = document.getElementById('admin-ad-fallback-limit-container');
                const adFallbackLimit = document.getElementById('admin-ad-fallback-limit');
                if (adToggle) adToggle.checked = data.settings.ads_enabled !== undefined ? data.settings.ads_enabled : true;
                if (adFreq) adFreq.value = data.settings.ad_frequency_scroll !== undefined ? data.settings.ad_frequency_scroll : 10;
                if (adFallbackLimit) adFallbackLimit.value = data.settings.ad_fallback_limit !== undefined ? data.settings.ad_fallback_limit : 21;

                // Hide fallback limit setting for non-admins
                if (adFallbackLimitContainer) {
                    const currentUser = window.currentAdminUser || JSON.parse(localStorage.getItem('admin_user') || 'null');
                    if (currentUser && currentUser.role === 'admin') {
                        adFallbackLimitContainer.style.display = 'flex';
                    } else {
                        adFallbackLimitContainer.style.display = 'none';
                    }
                }

                if (window.db) {
                    window.db.adsEnabled = data.settings.ads_enabled !== undefined ? data.settings.ads_enabled : true;
                    window.db.adFrequencyScroll = data.settings.ad_frequency_scroll !== undefined ? data.settings.ad_frequency_scroll : 10;
                    window.db.adFallbackLimit = data.settings.ad_fallback_limit !== undefined ? data.settings.ad_fallback_limit : 21;
                }

                const btnAdvertise = document.getElementById('btn-advertise');
                const btnAdvertiseMobile = document.getElementById('btn-advertise-mobile');
                const adsActive = data.settings.ads_enabled !== undefined ? data.settings.ads_enabled : true;
                if (btnAdvertise) {
                    btnAdvertise.style.display = adsActive ? 'flex' : 'none';
                }
                if (btnAdvertiseMobile) {
                    btnAdvertiseMobile.style.display = adsActive ? 'flex' : 'none';
                }

                if (typeof renderMyListings === 'function') {
                    // Force refresh just in case the tab is open
                    const myListingsContainer = document.getElementById('my-listings-container');
                    if (myListingsContainer) delete myListingsContainer.dataset.lastState;
                    renderMyListings();
                }
            }
        } catch (e) { console.error('Error loading settings', e); }
    }

    window.getListingPaymentInfo = function (listing, isRenewalTab = false) {
        // Rolling billing: siempre se cobra 1 mes completo al precio configurado por ciudad.
        // La fecha de vencimiento es exactamente 1 mes después del pago (ej: 27/julio → 27/agosto).
        // No hay prorrateo por días del mes.
        
        let targetPrice = globalMonthlyPrice;
        
        // 1. Si el vehículo tiene un precio de checkout sellado, respetarlo siempre
        if (listing && listing.checkout_price !== undefined) {
            targetPrice = Number(listing.checkout_price);
        } 
        // 2. Si ya está marcado como gratis históricamente, respetar 0
        else if (listing && listing.paymentStatus === 'free') {
            targetPrice = 0;
        }
        // 3. De lo contrario (ej. autos pre-actualización), usar el hook en vivo
        else if (window.useCityPricingHook && listing) {
            targetPrice = window.useCityPricingHook.getCityPrice(listing.city || '', listing.state || '');
        }

        let calculatedPrice = 0;
        let textDesc = '';

        if (Number(targetPrice) === 0) {
            textDesc = 'Total a pagar: Gratis';
        } else if (isRenewalTab) {
            calculatedPrice = targetPrice;
            const formattedPrice = calculatedPrice.toFixed(2);
            textDesc = `Total a pagar por renovación: $${formattedPrice} MXN`;
        } else {
            calculatedPrice = targetPrice;
            const formattedPrice = calculatedPrice.toFixed(2);
            textDesc = `Total a pagar: $${formattedPrice} MXN (1 mes)`;
        }
        return {
            calculatedPrice,
            textDesc
        };
    };

    // Initial local render
    window.isWaitingForInitialGps = true;
    populateHomeCategories();
    renderFeed();
    // Solo cargar datos administrativos si hay sesión de admin activa
    if (isAdminLoggedIn()) {
        if (typeof updateAdminStats === 'function') updateAdminStats();
        if (typeof updateAdminApprovals === 'function') updateAdminApprovals();
    }

    // Background server load
    (async () => {
        await Promise.all([
            loadSettings(),
            populateSelects()
        ]);

        // Re-render UI after settings and selects update
        populateHomeCategories();
        renderFeed();
    })();

    // Hook up database sync event to refresh the UI automatically
    window.onServerDataSynced = function () {
        const viewInicio = document.getElementById('view-inicio');
        // Evitamos barajear los autos si el usuario está viendo la pantalla de inicio
        if (viewInicio && !viewInicio.classList.contains('active')) {
            renderFeed(true);
        }

        if (typeof renderMyListings === 'function') renderMyListings();
        // Solo actualizar panel admin si hay sesión de admin activa
        if (isAdminLoggedIn()) {
            if (typeof updateAdminStats === 'function') updateAdminStats();
            if (typeof updateAdminApprovals === 'function') updateAdminApprovals();
            if (typeof renderAdminInventory === 'function') renderAdminInventory();
        }
    };

    window.onAdsSynced = function () {
        // Solo actualizar tablas de admin de publicidad si hay sesión de admin activa
        if (isAdminLoggedIn()) {
            if (typeof updateAdminAdsApprovals === 'function') updateAdminAdsApprovals();
            if (typeof renderAdminAdsTable === 'function') renderAdminAdsTable();
        }
        
        // Invalidar caché de Mis Publicaciones para asegurar redibujado
        const myListingsContainer = document.getElementById('my-listings-container');
        if (myListingsContainer) delete myListingsContainer.dataset.lastState;
        if (typeof renderMyListings === 'function') renderMyListings();

        // Opcional: si queremos que los anuncios se refresquen en el feed
        const viewInicio = document.getElementById('view-inicio');
        if (viewInicio && !viewInicio.classList.contains('active')) {
            renderFeed(true);
        }
    };


    // --- Core Functions ---

    window.switchView = function (viewId) {
        // Cancelar comparativa si está activa
        if (window.disableComparisonMode) window.disableComparisonMode();

        // Close any open modals
        document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));

        // If detalle is open, close it first
        const viewDetalle = document.getElementById('view-detalle');
        if (viewDetalle && viewDetalle.classList.contains('active')) {
            if (window.closeListingDetails) window.closeListingDetails();
        }

        // Update active nav
        navItems.forEach(nav => {
            if (nav.getAttribute('data-target') === viewId) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });

        // Update active view
        views.forEach(view => {
            if (view.id === viewId) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        // Trigger specific logic per view
        if (viewId === 'view-inicio') renderFeed();
        if (viewId === 'view-biblioteca') renderSavedListings();
        if (viewId === 'view-alta') renderMyListings();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    function initNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Cancelar comparativa si está activa
                if (window.disableComparisonMode) window.disableComparisonMode();

                // Close any open modals
                document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));

                // If detalle is open, close it first
                if (viewDetalle.classList.contains('active')) {
                    if (window.closeListingDetails) window.closeListingDetails();
                }

                // Update active nav
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Update active view
                const targetViewId = item.getAttribute('data-target');
                views.forEach(view => {
                    view.classList.remove('active');
                    if (view.id === targetViewId) {
                        view.classList.add('active');
                    }
                });

                // Trigger specific logic per view
                if (targetViewId === 'view-inicio') renderFeed();
                if (targetViewId === 'view-busqueda') { if (window.syncSearchLocationWithHome) window.syncSearchLocationWithHome(); }
                if (targetViewId === 'view-biblioteca') renderSavedListings();
                if (targetViewId === 'view-alta') renderMyListings();
            });
        });

        if (btnAdminAddListing) {
            btnAdminAddListing.addEventListener('click', () => {
                if (adminDashboardModal) adminDashboardModal.classList.remove('active');

                navItems.forEach(nav => nav.classList.remove('active'));
                const altaNav = Array.from(navItems).find(n => n.getAttribute('data-target') === 'view-alta');
                if (altaNav) altaNav.classList.add('active');

                views.forEach(view => {
                    view.classList.remove('active');
                    if (view.id === 'view-alta') {
                        view.classList.add('active');
                    }
                });

                renderMyListings();
            });
        }
    }

    async function populateSelects() {
        // ... (resto intacto) ...

        // Asignar el evento para abrir el Panel de Admin
        const userProfileBtn = document.querySelector('.user-profile');
        if (userProfileBtn) {
            userProfileBtn.addEventListener('click', () => {
                if (typeof window.openAdminPanel === 'function') {
                    window.openAdminPanel();
                } else if (adminDashboardModal) {
                    adminDashboardModal.classList.add('active');
                }
            });
        }

        // Populating states (para el Form de Dar de Alta, todo México)
        catalogData.states.forEach(state => {
            formState.innerHTML += `<option value="${state}">${state}</option>`;
        });

        // Fetch active locations (para los filtros de Inicio)
        try {
            const data = await db.getActiveLocations();
            const serverLocations = (data && data.success && data.locations) ? data.locations : {};
            const allCitiesByState = { ...catalogData.citiesByState, ...serverLocations };
            const inventoryStates = Object.keys(serverLocations);
            window.activeLocations = { states: inventoryStates, citiesByState: allCitiesByState };
        } catch (e) {
            console.error('Error fetching active locations', e);
            window.activeLocations = { states: [], citiesByState: { ...catalogData.citiesByState } };
        }

        userStateSelect.innerHTML = '<option value="Todos">Todos los estados</option>';
        filterState.innerHTML = '<option value="Todos">Todos los estados</option>';

        window.activeLocations.states.forEach(state => {
            userStateSelect.innerHTML += `<option value="${state}">${state}</option>`;
            filterState.innerHTML += `<option value="${state}">${state}</option>`;
        });

        // Dynamic cities based on state (for form)
        formState.addEventListener('change', (e) => {
            const state = e.target.value;
            formCity.innerHTML = '<option value="" disabled selected>Selecciona una ciudad</option>';
            if (catalogData.citiesByState[state]) {
                catalogData.citiesByState[state].forEach(city => {
                    formCity.innerHTML += `<option value="${city}">${city}</option>`;
                });
            } else {
                formCity.innerHTML = '<option value="" disabled selected>No hay ciudades</option>';
            }
            
            // Logic for USD currency availability based on border states
            const formCurrency = document.getElementById('form-currency');
            if (formCurrency) {
                const borderStates = ["Baja California", "Baja California Sur", "Sonora", "Chihuahua", "Coahuila", "Nuevo León", "Tamaulipas"];
                const usdOption = formCurrency.querySelector('option[value="USD"]');
                if (borderStates.includes(state)) {
                    if (usdOption) usdOption.disabled = false;
                    formCurrency.disabled = false;
                    formCurrency.style.appearance = 'auto';
                    formCurrency.style.webkitAppearance = 'auto';
                    formCurrency.style.mozAppearance = 'auto';
                } else {
                    if (usdOption) usdOption.disabled = true;
                    formCurrency.value = "MXN"; // Reset to MXN if state is not border
                    formCurrency.disabled = true;
                    formCurrency.style.appearance = 'none';
                    formCurrency.style.webkitAppearance = 'none';
                    formCurrency.style.mozAppearance = 'none';
                }
            }
        });
        if (formState.value && formState.value !== "") formState.dispatchEvent(new Event('change'));

        // ==========================================
        // Populating states (para el Form de Publicidad, solo donde hay autos)
        // ==========================================
        const clientAdState = document.getElementById('client-ad-state');
        const clientAdCity = document.getElementById('client-ad-city');
        if (clientAdState && clientAdCity) {
            window.activeLocations.states.forEach(state => {
                clientAdState.innerHTML += `<option value="${state}">${state}</option>`;
            });

            clientAdState.addEventListener('change', (e) => {
                const state = e.target.value;
                clientAdCity.innerHTML = '<option value="" disabled selected>Selecciona una ciudad</option>';
                if (window.activeLocations.citiesByState[state]) {
                    window.activeLocations.citiesByState[state].forEach(city => {
                        clientAdCity.innerHTML += `<option value="${city}">${city}</option>`;
                    });
                } else {
                    clientAdCity.innerHTML = '<option value="" disabled selected>No hay ciudades</option>';
                }
            });
            if (clientAdState.value && clientAdState.value !== "") clientAdState.dispatchEvent(new Event('change'));
        }

        // Feed State changes -> updates selectedCities to all cities in that state
        userStateSelect.addEventListener('change', (e) => {
            const state = e.target.value;
            if (state === 'Todos') {
                selectedCities = [];
                localStorage.removeItem('revista_last_location');
            } else {
                selectedCities = [...(window.activeLocations.citiesByState[state] || [])];
                // Reset text just in case it had a city appended
                const option = Array.from(userStateSelect.options).find(opt => opt.value === state);
                if (option) option.textContent = state;
                localStorage.setItem('revista_last_location', JSON.stringify({ state: state, city: selectedCities[0] || '' }));
                if (typeof useAnalyticsHook === 'function') {
                    useAnalyticsHook().recordGlobalVisit(selectedCities[0] || 'Desconocida', state);
                }
            }
            // Al cambiar de estado, resetear el botón de ciudades
            if (window.updateCitiesBtn) window.updateCitiesBtn();
            if (window.syncSearchLocationWithHome) window.syncSearchLocationWithHome();
            renderFeed(true);
        });

        function applyDetectedLocation(stateName, cityName, isManualClick = false) {
            if (!stateName) return;
            const matchedState = catalogData.states.find(s => s.toLowerCase() === stateName.toLowerCase() || stateName.toLowerCase().includes(s.toLowerCase()));
            if (matchedState) {
                // Agregar al dropdown dinámicamente si no existe
                if (!window.activeLocations.states.includes(matchedState)) {
                    window.activeLocations.states.push(matchedState);
                    userStateSelect.innerHTML += `<option value="${matchedState}">${matchedState}</option>`;
                    filterState.innerHTML += `<option value="${matchedState}">${matchedState}</option>`;
                }

                const stateCities = window.activeLocations.citiesByState[matchedState] || catalogData.citiesByState[matchedState] || [];
                const matchedCity = stateCities.find(c =>
                    c.toLowerCase() === cityName.toLowerCase() ||
                    cityName.toLowerCase().includes(c.toLowerCase()) ||
                    c.toLowerCase().includes(cityName.toLowerCase())
                );

                if (matchedCity) {
                    selectedCities = [matchedCity];
                } else {
                    selectedCities = [...stateCities];
                }

                userStateSelect.value = matchedState;
                const option = Array.from(userStateSelect.options).find(opt => opt.value === matchedState);
                if (option) {
                    option.textContent = matchedState;
                }

                if (window.customUserFilterStateSelect) window.customUserFilterStateSelect.update();
                if (window.updateCitiesBtn) window.updateCitiesBtn();
                if (window.syncSearchLocationWithHome) window.syncSearchLocationWithHome();

                renderFeed(true);

                // Guardar en caché local
                localStorage.setItem('revista_last_location', JSON.stringify({ state: stateName, city: cityName }));

                // Registrar visita asignada a la ciudad real detectada
                if (typeof useAnalyticsHook === 'function') {
                    useAnalyticsHook().recordGlobalVisit(matchedCity || cityName, matchedState || stateName);
                }

                // Cargar stats de popularidad para la ciudad detectada (dropdowns inteligentes)
                if (db && db.fetchPopularityStats) {
                    db.fetchPopularityStats(matchedCity || cityName);
                }
            } else if (isManualClick) {
                // Si la ciudad no tiene autos activos, lo dejamos en "Todos"
                userStateSelect.value = 'Todos';
                filterState.value = 'Todos';
                filterState.dispatchEvent(new Event('change'));
                if (window.customUserFilterStateSelect) window.customUserFilterStateSelect.update();
                if (window.customFilterStateSelect) window.customFilterStateSelect.update();
                renderFeed(true);
            }
        }

        function forceAllStatesAndRender() {
            // Requisito: Siempre debe haber una ciudad. Si falla todo, asignamos ciudad por defecto
            applyDetectedLocation('Baja California', 'Mexicali', false);
        }

        function detectUserLocation(isManualClick = false) {
            if (!("geolocation" in navigator)) {
                if (isManualClick) showAlert('Tu navegador no soporta geolocalización.', 'Error', 'error');
                if (window.isWaitingForInitialGps) {
                    window.isWaitingForInitialGps = false;
                    forceAllStatesAndRender();
                }
                return;
            }

            if (btnLocateMe) {
                btnLocateMe.innerHTML = '<span class="material-symbols-rounded" style="animation: spin 1s linear infinite;">refresh</span>';
            }

            // Opciones de GPS sin timeout para esperar la respuesta del usuario
            const options = {
                enableHighAccuracy: false,
                maximumAge: 300000
            };

            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await res.json();

                    if (data && data.address) {
                        const stateName = data.address.state || '';
                        const cityName = data.address.city || data.address.town || data.address.village || data.address.municipality || data.address.county || '';

                        window.isWaitingForInitialGps = false;
                        applyDetectedLocation(stateName, cityName, isManualClick);
                    } else {
                        if (window.isWaitingForInitialGps) {
                            window.isWaitingForInitialGps = false;
                            forceAllStatesAndRender();
                        }
                    }
                } catch (e) {
                    console.error('Error detectando ubicación:', e);
                    if (window.isWaitingForInitialGps) {
                        window.isWaitingForInitialGps = false;
                        forceAllStatesAndRender();
                    }
                } finally {
                    if (btnLocateMe) btnLocateMe.innerHTML = '<span class="material-symbols-rounded">location_on</span>';
                }
            }, () => {
                if (window._fallbackUnknownVisitTimeout) {
                    clearTimeout(window._fallbackUnknownVisitTimeout);
                    window._fallbackUnknownVisitTimeout = null;
                }
                const today = (typeof getLocalDateString === 'function') ? getLocalDateString() : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
                if (!sessionStorage.getItem('revista_global_visit_recorded_' + today)) {
                    if (typeof useAnalyticsHook === 'function') {
                        useAnalyticsHook().recordGlobalVisit('Desconocida', 'Desconocido');
                    }
                }
                if (isManualClick) showAlert('Permiso de ubicación denegado o no disponible.', 'Ubicación', 'warning');
                if (btnLocateMe) btnLocateMe.innerHTML = '<span class="material-symbols-rounded">location_on</span>';

                if (window.isWaitingForInitialGps) {
                    window.isWaitingForInitialGps = false;
                    forceAllStatesAndRender();
                }
            }, options);
        }

        if (btnLocateMe) {
            btnLocateMe.addEventListener('click', () => detectUserLocation(true));
        }

        // 1. Carga inmediata desde caché
        const cachedLocationStr = localStorage.getItem('revista_last_location');
        if (cachedLocationStr) {
            try {
                const cachedLocation = JSON.parse(cachedLocationStr);
                window.isWaitingForInitialGps = false;
                applyDetectedLocation(cachedLocation.state, cachedLocation.city, false);
            } catch (e) { }
        } else {
            // No hay ubicación en caché -> Mostramos Pantalla de Bienvenida GPS
            const gpsModal = document.getElementById('gps-welcome-modal');
            const btnActivateGps = document.getElementById('btn-activate-gps');
            if (gpsModal && btnActivateGps) {
                gpsModal.classList.add('active');

                // Conectar el botón azul
                btnActivateGps.addEventListener('click', () => {
                    gpsModal.classList.remove('active'); // Ocultar rápido para mejor UX
                    detectUserLocation(true); // El true asegura que se marque como clic manual
                });
            } else {
                // Fallback de seguridad por si el modal no existe
                setTimeout(() => detectUserLocation(false), 300);
            }
        }

        populateMakesForType = function (selectedType) {
            window.populateMakesForType = populateMakesForType;
            if (!selectedType || selectedType === '') {
                formMake.innerHTML = '<option value="" disabled selected>Selecciona un tipo primero</option>';
                formModel.innerHTML = '<option value="" disabled selected>Selecciona una marca primero</option>';
                if (formCustomMake) {
                    formCustomMake.style.display = 'none';
                    formCustomMake.required = false;
                    formCustomMake.value = '';
                }
                if (formCustomModel) {
                    formCustomModel.style.display = 'none';
                    formCustomModel.required = false;
                    formCustomModel.value = '';
                }
                if (window.customMakeSelect) window.customMakeSelect.update();
                if (window.customModelSelect) window.customModelSelect.update();
                return;
            }

            formMake.innerHTML = '<option value="" disabled selected>Selecciona una marca</option>';

            const filteredMakes = db.getMakesForType(selectedType);

            filteredMakes.forEach(make => {
                formMake.innerHTML += `<option value="${make}">${make}</option>`;
            });
            formMake.innerHTML += `<option value="Otros">Otros...</option>`;

            // Reset model
            formModel.innerHTML = '<option value="" disabled selected>Selecciona una marca primero</option>';
            if (formCustomMake) {
                formCustomMake.style.display = 'none';
                formCustomMake.required = false;
                formCustomMake.value = '';
            }
            if (formCustomModel) {
                formCustomModel.style.display = 'none';
                formCustomModel.required = false;
                formCustomModel.value = '';
            }

            if (window.customMakeSelect) window.customMakeSelect.update();
            if (window.customModelSelect) window.customModelSelect.update();
        }

        // Populating types (ordenados por popularidad de la ciudad)
        const sortedTypes = db.sortByPopularity ? db.sortByPopularity([...catalogData.types], 'types') : catalogData.types;
        sortedTypes.forEach(type => {
            formType.innerHTML += `<option value="${type}">${type}</option>`;
        });
        formType.innerHTML += `<option value="Otros">Otros...</option>`;

        // Populating initial makes based on type
        populateMakesForType(formType.value);

        // Populating colors (ordenados por popularidad de la ciudad)
        if (formColor) {
            const sortedColors = db.sortByPopularity ? db.sortByPopularity([...catalogData.colors], 'colors') : catalogData.colors;
            sortedColors.forEach(color => {
                formColor.innerHTML += `<option value="${color}">${color}</option>`;
            });
            formColor.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'Otro' || val === 'Otros') {
                    if (formCustomColor) {
                        formCustomColor.style.display = 'block';
                        formCustomColor.required = true;
                    }
                } else {
                    if (formCustomColor) {
                        formCustomColor.style.display = 'none';
                        formCustomColor.required = false;
                        formCustomColor.value = '';
                    }
                }
            });
        }

        const filterColor = document.getElementById('filter-color');
        if (filterColor) {
            catalogData.colors.forEach(color => {
                filterColor.innerHTML += `<option value="${color}">${color}</option>`;
            });
        }

        // Dynamic cities based on state (for search filter)
        filterState.addEventListener('change', (e) => {
            const state = e.target.value;
            filterCity.innerHTML = '<option value="Todas">Todas</option>';
            if (state !== 'Todos' && window.activeLocations.citiesByState[state]) {
                window.activeLocations.citiesByState[state].forEach(city => {
                    filterCity.innerHTML += `<option value="${city}">${city}</option>`;
                });
            }
        });

        const formCustomType = document.getElementById('form-custom-type');

        function updateLegalOptions() {
            if (!formLegal) return;
            const typeVal = formType ? formType.value : '';
            const customTypeVal = formCustomType ? formCustomType.value : '';
            const rawType = (typeVal === 'Otros' ? customTypeVal : typeVal);
            const typeNormalized = rawType
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

            const isTruck = (typeNormalized.includes('camion') || typeNormalized.includes('tracto')) && !typeNormalized.includes('camioneta');
            const isRecreational = typeNormalized.includes('barco') || 
                                   typeNormalized.includes('lancha') || 
                                   typeNormalized.includes('moto') || 
                                   typeNormalized.includes('atv') || 
                                   typeNormalized.includes('cuatrimoto') || 
                                   typeNormalized.includes('rzr') || 
                                   typeNormalized.includes('razor') || 
                                   typeNormalized.includes('can-am') || 
                                   typeNormalized.includes('canam') || 
                                   typeNormalized.includes('jetski') || 
                                   typeNormalized.includes('jet ski');

            const currentSelected = formLegal.value;

            let optionsHTML = '<option value="" disabled selected>Selecciona una opción</option>';
            if (isTruck) {
                optionsHTML += `
                    <option value="Nacional A1">Nacional A1</option>
                    <option value="Nacional VU">Nacional VU</option>
                    <option value="Americano">Americano</option>
                `;
            } else if (isRecreational) {
                optionsHTML += `
                    <option value="Nacional">Nacional</option>
                    <option value="Americano">Americano</option>
                `;
            } else {
                optionsHTML += `
                    <option value="Nacional">Nacional</option>
                    <option value="Fronterizo">Fronterizo</option>
                    <option value="Americano">Americano</option>
                    <option value="Decreto">Decreto</option>
                `;
            }

            formLegal.innerHTML = optionsHTML;

            if (currentSelected) {
                const matchingOpt = Array.from(formLegal.options).find(o => o.value === currentSelected);
                if (matchingOpt) {
                    formLegal.value = currentSelected;
                } else {
                    formLegal.value = '';
                }
            } else {
                formLegal.value = '';
            }

            if (window.customLegalSelect) {
                window.customLegalSelect.update();
            }
        }

        formType.addEventListener('change', (e) => {
            const selectedType = e.target.value;
            if (selectedType === 'Otros') {
                if (formCustomType) {
                    formCustomType.style.display = 'block';
                    formCustomType.required = true;
                }
            } else {
                if (formCustomType) {
                    formCustomType.style.display = 'none';
                    formCustomType.required = false;
                    formCustomType.value = '';
                }
            }
            populateMakesForType(selectedType);
            if (formMake.value && formMake.value !== '') {
                formMake.dispatchEvent(new Event('change'));
            }
            updateLegalOptions();
            window.updateTruckMechanicsUI();
        });

        if (formCustomType) {
            formCustomType.addEventListener('input', () => {
                updateLegalOptions();
                window.updateTruckMechanicsUI();
            });
            formCustomType.addEventListener('change', () => {
                updateLegalOptions();
                window.updateTruckMechanicsUI();
            });
        }

        // Dynamic models based on make and type (for form)
        formMake.addEventListener('change', (e) => {
            const make = e.target.value;
            const selectedType = formType ? formType.value : null;

            if (!selectedType || selectedType === '') {
                formModel.innerHTML = '<option value="" disabled selected>Selecciona un tipo primero</option>';
                if (window.customModelSelect) window.customModelSelect.update();
                return;
            }

            if (!make || make === '') {
                formModel.innerHTML = '<option value="" disabled selected>Selecciona una marca primero</option>';
                if (window.customModelSelect) window.customModelSelect.update();
                return;
            }

            formModel.innerHTML = '<option value="" disabled selected>Selecciona un modelo</option>';

            if (make === 'Otros') {
                formCustomMake.style.display = 'block';
                formCustomMake.required = true;

                formModel.innerHTML += `<option value="Otros">Otros...</option>`;
                formModel.value = 'Otros'; // Force 'Otros' model
                formModel.dispatchEvent(new Event('change'));
            } else {
                formCustomMake.style.display = 'none';
                formCustomMake.required = false;
                formCustomMake.value = '';

                const models = db.getModelsForTypeAndMake(selectedType, make);

                if (models && models.length > 0) {
                    models.forEach(model => {
                        formModel.innerHTML += `<option value="${model}">${model}</option>`;
                    });
                } else {
                    formModel.innerHTML = '<option value="" disabled selected>No hay modelos definidos</option>';
                }
                formModel.innerHTML += `<option value="Otros">Otros...</option>`;
            }
            if (window.customModelSelect) window.customModelSelect.update();
            window.updateTruckMechanicsUI();
        });

        formModel.addEventListener('change', (e) => {
            if (e.target.value === 'Otros') {
                formCustomModel.style.display = 'block';
                formCustomModel.required = true;
            } else {
                formCustomModel.style.display = 'none';
                formCustomModel.required = false;
                formCustomModel.value = '';
            }
        });

        window.updateTruckMechanicsUI = function() {
            if (!formType) return;
            const truckTypes = ['Camión', 'Tractocamión', 'Rabón', 'Torton', 'Chasis', 'Autobús', 'Camiones', 'Tractocamiones'];
            const freeEngineTypes = ['Motocicleta', 'Cuatrimoto / ATV', 'Barco'];
            
            const selectedType = formType.value || '';
            const customTypeVal = formCustomType ? formCustomType.value.trim().toLowerCase() : '';
            const isTruck = truckTypes.includes(selectedType);
            const isFreeEngine = freeEngineTypes.includes(selectedType) || selectedType === 'Otros' || customTypeVal.length > 0;
            const make = formMake ? formMake.value : '';
            
            const currentCylinders = formCylindersSelect ? formCylindersSelect.value : '';
            const currentEngine = formEngineSelect ? formEngineSelect.value : '';
            const currentBox = formBoxSelect ? formBoxSelect.value : '';
            
            if (isTruck && make && make !== 'Otros') {
                // 1. MODO CAMIÓN / TRACTOCAMIÓN
                if (formCarEngineContainer) formCarEngineContainer.style.display = 'none';
                if (formCylindersSelect) formCylindersSelect.required = false;
                if (formCustomCylinders) { formCustomCylinders.required = false; formCustomCylinders.style.display = 'none'; }
                
                if (formFreeEngineContainer) formFreeEngineContainer.style.display = 'none';
                if (formEngineText) formEngineText.required = false;
                
                if (formTruckEngineContainer) formTruckEngineContainer.style.display = 'block';
                if (formEngineSelect) {
                    formEngineSelect.required = true;
                    const engines = (typeof catalogData !== 'undefined' ? catalogData.truckEngines[make] : []) || [];
                    formEngineSelect.innerHTML = '<option value="" disabled selected>Selecciona un motor</option>';
                    engines.forEach(eng => {
                        formEngineSelect.innerHTML += `<option value="${eng}">${eng}</option>`;
                    });
                    formEngineSelect.innerHTML += '<option value="Otros">Otro...</option>';
                    if (currentEngine) formEngineSelect.value = currentEngine;
                }
                if (window.customEngineSelect) window.customEngineSelect.update();
                
                // Caja para Camiones Manuales
                if (formTransmission && formTransmission.value === 'Manual') {
                    formBoxContainer.style.display = 'block';
                    formBoxSelect.required = true;
                    formAc.parentElement.style.width = '100%';
                    const boxes = (typeof catalogData !== 'undefined' ? catalogData.truckBoxes[make] : []) || [];
                    formBoxSelect.innerHTML = '<option value="" disabled selected>Selecciona una caja</option>';
                    boxes.forEach(box => {
                        formBoxSelect.innerHTML += `<option value="${box}">${box}</option>`;
                    });
                    formBoxSelect.innerHTML += '<option value="Otros">Otra...</option>';
                    if (currentBox) formBoxSelect.value = currentBox;
                } else {
                    formBoxContainer.style.display = 'none';
                    formBoxSelect.required = false;
                    formCustomBox.style.display = 'none';
                    formCustomBox.required = false;
                    formCustomBox.value = '';
                }
                if (window.customBoxSelect) window.customBoxSelect.update();
            } else if (isFreeEngine) {
                // 2. MODO TEXTO LIBRE (Motos, Barcos, Can-Am, Razor, Cuatrimoto/ATV, Otros)
                if (formCarEngineContainer) formCarEngineContainer.style.display = 'none';
                if (formCylindersSelect) formCylindersSelect.required = false;
                if (formCustomCylinders) { formCustomCylinders.required = false; formCustomCylinders.style.display = 'none'; }
                
                if (formTruckEngineContainer) formTruckEngineContainer.style.display = 'none';
                if (formEngineSelect) formEngineSelect.required = false;
                if (formCustomEngine) { formCustomEngine.required = false; formCustomEngine.style.display = 'none'; }
                
                if (formFreeEngineContainer) formFreeEngineContainer.style.display = 'block';
                if (formEngineText) formEngineText.required = true;
                
                // Adaptar placeholder y label según el tipo
                if (formFreeEngineLabel && formEngineText) {
                    if (selectedType === 'Motocicleta') {
                        formFreeEngineLabel.textContent = 'Motor / Cilindrada';
                        formEngineText.placeholder = 'Ej. 250cc, 600cc, 1200cc...';
                    } else if (selectedType === 'Cuatrimoto / ATV') {
                        formFreeEngineLabel.textContent = 'Motor';
                        formEngineText.placeholder = 'Ej. 1000cc Turbo, Rotax 900, 450cc...';
                    } else if (selectedType === 'Barco') {
                        formFreeEngineLabel.textContent = 'Motor / Potencia';
                        formEngineText.placeholder = 'Ej. 150 HP Fuera de borda, 300 HP Yamaha...';
                    } else {
                        formFreeEngineLabel.textContent = 'Motor';
                        formEngineText.placeholder = 'Ej. 250cc, 1000cc Turbo, 150 HP, V8...';
                    }
                }
                
                formBoxContainer.style.display = 'none';
                formBoxSelect.required = false;
                formCustomBox.style.display = 'none';
                formCustomBox.required = false;
                formCustomBox.value = '';
                if (window.customBoxSelect) window.customBoxSelect.update();
            } else {
                // 3. MODO AUTOS / CAMIONETAS (2 columnas: Cilindros + Detalle opcional)
                if (formTruckEngineContainer) formTruckEngineContainer.style.display = 'none';
                if (formEngineSelect) formEngineSelect.required = false;
                if (formCustomEngine) { formCustomEngine.required = false; formCustomEngine.style.display = 'none'; }
                
                if (formFreeEngineContainer) formFreeEngineContainer.style.display = 'none';
                if (formEngineText) formEngineText.required = false;
                
                if (formCarEngineContainer) formCarEngineContainer.style.display = 'block';
                if (formCylindersSelect) formCylindersSelect.required = true;
                
                if (formCylindersSelect && formCylindersSelect.value === 'Otros') {
                    if (formCustomCylinders) {
                        formCustomCylinders.style.display = 'block';
                        formCustomCylinders.required = true;
                    }
                } else {
                    if (formCustomCylinders) {
                        formCustomCylinders.style.display = 'none';
                        formCustomCylinders.required = false;
                    }
                }
                if (window.customCylindersSelect) window.customCylindersSelect.update();
                
                formBoxContainer.style.display = 'none';
                formBoxSelect.required = false;
                formCustomBox.style.display = 'none';
                formCustomBox.required = false;
                formCustomBox.value = '';
                if (window.customBoxSelect) window.customBoxSelect.update();
            }
        };
        window.updateMechanicsUI = window.updateTruckMechanicsUI;

        if (formCylindersSelect) {
            formCylindersSelect.addEventListener('change', (e) => {
                if (e.target.value === 'Otros') {
                    if (formCustomCylinders) {
                        formCustomCylinders.style.display = 'block';
                        formCustomCylinders.required = true;
                    }
                } else {
                    if (formCustomCylinders) {
                        formCustomCylinders.style.display = 'none';
                        formCustomCylinders.required = false;
                        formCustomCylinders.value = '';
                    }
                }
            });
        }

        if (formEngineSelect) {
            formEngineSelect.addEventListener('change', (e) => {
                if (e.target.value === 'Otros') {
                    formCustomEngine.style.display = 'block';
                    formCustomEngine.required = true;
                } else {
                    formCustomEngine.style.display = 'none';
                    formCustomEngine.required = false;
                    formCustomEngine.value = '';
                }
            });
        }
        
        if (formTransmission) {
            formTransmission.addEventListener('change', () => {
                window.updateTruckMechanicsUI();
            });
        }
        
        if (formBoxSelect) {
            formBoxSelect.addEventListener('change', (e) => {
                if (e.target.value === 'Otros') {
                    formCustomBox.style.display = 'block';
                    formCustomBox.required = true;
                } else {
                    formCustomBox.style.display = 'none';
                    formCustomBox.required = false;
                    formCustomBox.value = '';
                }
            });
        }

        // Trigger change to set initial models if make is pre-selected (but not placeholder)
        if (formMake.value && formMake.value !== "") formMake.dispatchEvent(new Event('change'));

        // === INICIALIZACIÓN DE CUSTOM SELECTS ===
        window.customStateSelect = new CustomSelectWrapper(formState, { isLocation: true });
        window.customCitySelect = new CustomSelectWrapper(formCity, { isLocation: true });
        window.customMakeSelect = new CustomSelectWrapper(formMake);
        window.customModelSelect = new CustomSelectWrapper(formModel);
        window.customTypeSelect = new CustomSelectWrapper(formType);
        window.customTransmissionSelect = new CustomSelectWrapper(formTransmission);
        window.customAcSelect = new CustomSelectWrapper(formAc);
        window.customLegalSelect = new CustomSelectWrapper(formLegal, { dropUp: true });
        window.customUserFilterStateSelect = new CustomSelectWrapper(userStateSelect);
        window.customFilterStateSelect = new CustomSelectWrapper(filterState);
        window.customFilterCitySelect = new CustomSelectWrapper(filterCity);
        window.customFilterTransmissionSelect = new CustomSelectWrapper(filterTransmission);
        window.customFilterLegalSelect = new CustomSelectWrapper(filterLegal);


        const formColorEl = document.getElementById('form-color');
        if (formColorEl) window.customColorSelect = new CustomSelectWrapper(formColorEl, { dropUp: true });
        if (formCylindersSelect) window.customCylindersSelect = new CustomSelectWrapper(formCylindersSelect);
        if (formEngineSelect) window.customEngineSelect = new CustomSelectWrapper(formEngineSelect);
        if (formBoxSelect) window.customBoxSelect = new CustomSelectWrapper(formBoxSelect);

        const filterColorEl = document.getElementById('filter-color');
        if (filterColorEl) window.customFilterColorSelect = new CustomSelectWrapper(filterColorEl);

        // Actualizar visualmente al cambiar los selects dinámicos
        formState.addEventListener('change', () => { if (window.customCitySelect) window.customCitySelect.update(); });
        formMake.addEventListener('change', () => { if (window.customModelSelect) window.customModelSelect.update(); });
        filterState.addEventListener('change', () => { if (window.customFilterCitySelect) window.customFilterCitySelect.update(); });

        // Phone and WhatsApp auto-fill logic
        function extractCleanDigits(raw, lada) {
            if (!raw) return '';
            let digits = String(raw).trim();
            if (digits.startsWith('+52')) digits = digits.substring(3);
            else if (digits.startsWith('+1')) digits = digits.substring(2);
            else if (lada && digits.startsWith(lada)) digits = digits.substring(lada.length);

            digits = digits.replace(/[^0-9]/g, '');
            if (digits.length === 12 && digits.startsWith('52')) digits = digits.substring(2);
            else if (digits.length === 11 && digits.startsWith('1')) digits = digits.substring(1);
            return digits.slice(0, 10);
        }

        if (formPhone) {
            formPhone.addEventListener('input', (e) => {
                phoneModified = true;
                const lada = formPhoneLada ? formPhoneLada.value : '+52';
                const digits = extractCleanDigits(e.target.value, lada);
                formPhone.value = digits;
                if (!whatsappModified && formWhatsApp) {
                    formWhatsApp.value = digits ? `${lada} ${digits}` : '';
                }
            });
        }

        if (formWhatsApp) {
            formWhatsApp.addEventListener('input', (e) => {
                whatsappModified = true;
                const lada = formPhoneLada ? formPhoneLada.value : '+52';
                const digits = extractCleanDigits(e.target.value, lada);
                
                if (digits.length > 0) {
                    formWhatsApp.value = `${lada} ${digits}`;
                } else {
                    formWhatsApp.value = '';
                }

                if (!phoneModified && formPhone) {
                    formPhone.value = digits;
                }
            });
        }

        if (formPhoneLada) {
            formPhoneLada.addEventListener('change', () => {
                const newLada = formPhoneLada.value;
                if (formWhatsApp && formWhatsApp.value.trim()) {
                    const digits = extractCleanDigits(formWhatsApp.value, newLada);
                    if (digits) {
                        formWhatsApp.value = `${newLada} ${digits}`;
                    }
                }
            });
        }

        window.renderImagePreviews = function () {
            const container = document.getElementById('image-preview-container');
            const textElement = document.getElementById('file-chosen-text');
            if (!container) return;
            container.innerHTML = '';

            if (selectedImageFiles.length === 0) {
                if (textElement) {
                    textElement.textContent = 'Sin archivos seleccionados';
                    textElement.style.color = 'var(--text-muted)';
                }
                return;
            }

            if (textElement) {
                textElement.textContent = `${selectedImageFiles.length} foto(s) lista(s)`;
                textElement.style.color = 'var(--text-main)';
            }

            selectedImageFiles.forEach((itemObj, index) => {
                const item = document.createElement('div');
                item.className = 'image-preview-item';

                const img = document.createElement('img');
                img.src = itemObj.url;
                img.style.border = index === 0 ? '2px solid #f59e0b' : 'none';

                if (index === 0) {
                    const badge = document.createElement('div');
                    badge.textContent = 'PORTADA';
                    badge.style.position = 'absolute';
                    badge.style.bottom = '0';
                    badge.style.left = '0';
                    badge.style.right = '0';
                    badge.style.background = '#f59e0b';
                    badge.style.color = 'white';
                    badge.style.fontSize = '0.7rem';
                    badge.style.textAlign = 'center';
                    badge.style.fontWeight = 'bold';
                    badge.style.borderRadius = '0 0 10px 10px';
                    badge.style.padding = '2px 0';
                    badge.style.zIndex = '2';
                    item.appendChild(badge);
                } else {
                    const badge = document.createElement('div');
                    badge.className = 'preview-badge';
                    badge.textContent = index + 1;
                    badge.style.display = 'none'; // Keep it hidden but keep it in DOM for Sortable
                    item.appendChild(badge);
                }

                const btnRemove = document.createElement('button');
                btnRemove.type = 'button';
                btnRemove.innerHTML = '<span class="material-symbols-rounded" style="font-size: 16px;">close</span>';
                btnRemove.style.position = 'absolute';
                btnRemove.style.top = '-8px';
                btnRemove.style.right = '-8px';
                btnRemove.style.background = '#ef4444';
                btnRemove.style.color = 'white';
                btnRemove.style.border = '2px solid var(--surface-color)';
                btnRemove.style.borderRadius = '50%';
                btnRemove.style.width = '24px';
                btnRemove.style.height = '24px';
                btnRemove.style.display = 'flex';
                btnRemove.style.alignItems = 'center';
                btnRemove.style.justifyContent = 'center';
                btnRemove.style.cursor = 'pointer';
                btnRemove.style.zIndex = '3';
                btnRemove.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

                btnRemove.onclick = (ev) => {
                    ev.preventDefault();
                    const idxToRemove = Array.from(container.children).indexOf(item);
                    if (idxToRemove > -1) {
                        selectedImageFiles.splice(idxToRemove, 1);
                        renderImagePreviews();

                        if (textElement) {
                            if (selectedImageFiles.length === 0) {
                                textElement.textContent = 'Sin archivos seleccionados';
                                textElement.style.color = 'var(--text-muted)';
                            } else {
                                textElement.textContent = `${selectedImageFiles.length} foto(s) lista(s)`;
                            }
                        }
                    }
                };

                item.appendChild(img);
                item.appendChild(btnRemove);
                container.appendChild(item);
            });
            if (typeof updateWizardUI === 'function') updateWizardUI();
        };

        // Init SortableJS
        if (typeof Sortable !== 'undefined') {
            Sortable.create(document.getElementById('image-preview-container'), {
                animation: 150,
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                onEnd: function (evt) {
                    if (evt.oldIndex === evt.newIndex) return;
                    const movedItem = selectedImageFiles.splice(evt.oldIndex, 1)[0];
                    selectedImageFiles.splice(evt.newIndex, 0, movedItem);

                    if (typeof renderImagePreviews === 'function') {
                        renderImagePreviews();
                    }
                }
            });
        }

        document.getElementById('form-image').addEventListener('change', function () {
            if (this.files && this.files.length > 0) {
                let newFiles = Array.from(this.files).map(f => ({ file: f, url: URL.createObjectURL(f) }));
                const slotsLeft = 8 - selectedImageFiles.length;
                if (slotsLeft <= 0) {
                    showAlert('Has alcanzado el límite máximo de 8 fotos.', 'Límite alcanzado', 'warning');
                } else {
                    if (newFiles.length > slotsLeft) {
                        showAlert(`Solo se pueden subir 8 fotos en total. Se omitieron ${newFiles.length - slotsLeft} foto(s).`, 'Límite de fotos', 'warning');
                        newFiles = newFiles.slice(0, slotsLeft);
                    }
                    selectedImageFiles.push(...newFiles);
                    renderImagePreviews();
                }
            }
            this.value = ''; // Permite volver a seleccionar el mismo archivo si se elimina
        });

        const formImageCamera = document.getElementById('form-image-camera');
        const morePhotosModal = document.getElementById('more-photos-modal');
        const btnMorePhotosYes = document.getElementById('btn-more-photos-yes');
        const btnMorePhotosNo = document.getElementById('btn-more-photos-no');

        if (formImageCamera) {
            formImageCamera.addEventListener('change', function () {
                if (this.files && this.files.length > 0) {
                    if (selectedImageFiles.length >= 8) {
                        showAlert('Has alcanzado el límite máximo de 8 fotos.', 'Límite alcanzado', 'warning');
                        this.value = '';
                        return;
                    }

                    const newFiles = Array.from(this.files).map(f => ({ file: f, url: URL.createObjectURL(f) }));
                    selectedImageFiles.push(newFiles[0]); // Normalmente la cámara toma 1 sola foto
                    renderImagePreviews();

                    if (selectedImageFiles.length >= 8) {
                        showAlert('Has llegado al límite de 8 fotos. Esta es la última foto.', 'Límite alcanzado', 'info');
                    } else {
                        // Mostrar modal preguntando si desea otra foto
                        if (morePhotosModal) {
                            morePhotosModal.classList.add('active');
                        }
                    }
                }
                this.value = '';
            });
        }

        if (btnMorePhotosNo) {
            btnMorePhotosNo.addEventListener('click', () => {
                if (morePhotosModal) morePhotosModal.classList.remove('active');
            });
        }

        if (btnMorePhotosYes) {
            btnMorePhotosYes.addEventListener('click', () => {
                if (morePhotosModal) morePhotosModal.classList.remove('active');
                if (formImageCamera) formImageCamera.click();
            });
        }

        // --- Cities Modal Logic ---
        // Helper para actualizar el texto del botón de ciudades
        function updateCitiesBtn() {
            const arrow = `<span class="material-symbols-rounded" style="font-size:18px; color:var(--text-muted)">expand_more</span>`;
            if (selectedCities.length === 1) {
                btnUserCities.innerHTML = `${selectedCities[0]} ${arrow}`;
            } else if (selectedCities.length > 1) {
                btnUserCities.innerHTML = `${selectedCities.length} ciudades ${arrow}`;
            } else {
                btnUserCities.innerHTML = `Ciudades ${arrow}`;
            }
            // Sincronizar con el módulo UpNext para asegurar que la cápsula solo muestre autos de esta zona
            window.selectedCitiesForUpNext = [...selectedCities];
        }
        window.updateCitiesBtn = updateCitiesBtn;

        // Forzar actualización inicial por si la ubicación se cargó de caché antes de montar esta función
        updateCitiesBtn();

        btnUserCities.addEventListener('click', () => {
            const state = userStateSelect.value;
            if (state === 'Todos') {
                showAlert('Por favor selecciona un Estado primero para ver sus ciudades.', 'Filtro Incompleto', 'warning');
                return;
            }

            const stateCities = window.activeLocations.citiesByState[state] || [];
            const isAll = selectedCities.length === 0 || selectedCities.length === stateCities.length;

            // Generar opción "Todas" + checkboxes de ciudades
            citiesCheckboxesContainer.innerHTML = `
                <label class="custom-checkbox">
                    <input type="checkbox" value="__todas__" ${isAll ? 'checked' : ''} id="cb-todas-ciudades">
                    <span><strong>Todas las ciudades</strong></span>
                </label>
            ` + stateCities.map(city => `
                <label class="custom-checkbox">
                    <input type="checkbox" value="${city}" class="cb-city-item" ${isAll || selectedCities.includes(city) ? 'checked' : ''}>
                    <span>${city}</span>
                </label>
            `).join('');

            // Lógica de selección con cambio rápido en el primer clic
            let isFirstCityClick = true;
            const cbTodas = citiesCheckboxesContainer.querySelector('#cb-todas-ciudades');
            const cbCities = Array.from(citiesCheckboxesContainer.querySelectorAll('.cb-city-item'));

            function evalCityCheckboxes() {
                const checkedCount = cbCities.filter(c => c.checked).length;
                if (checkedCount === 0) {
                    // Si no está tildada ninguna, se tildan automático todas
                    cbTodas.checked = true;
                    cbCities.forEach(c => c.checked = true);
                } else if (checkedCount === cbCities.length) {
                    // Si se tildan todas manualmente, se tilda la principal
                    cbTodas.checked = true;
                } else {
                    // Si se tilda solo una (o algunas), se destilda la principal
                    cbTodas.checked = false;
                }
            }

            cbTodas.addEventListener('change', () => {
                isFirstCityClick = false;
                // Si la presionan para tildar, marcamos todas. 
                // Si la presionan para destildar, desmarcamos todas (lo que activa la regla de 0 y vuelve a marcar todas)
                cbCities.forEach(cb => cb.checked = cbTodas.checked);
                evalCityCheckboxes();
            });

            cbCities.forEach(cb => {
                cb.addEventListener('change', () => {
                    if (isFirstCityClick) {
                        isFirstCityClick = false;
                        // Intención de cambio rápido: en el 1er clic, desmarcamos las demás ciudades
                        // y dejamos únicamente seleccionada la que el usuario acaba de tocar
                        cbCities.forEach(c => {
                            if (c !== cb) c.checked = false;
                        });
                        cb.checked = true;
                        cbTodas.checked = false;
                        evalCityCheckboxes();
                        return;
                    }
                    evalCityCheckboxes();
                });
            });

            citiesModal.classList.add('active');
        });

        if (btnCloseCitiesModal) btnCloseCitiesModal.addEventListener('click', () => citiesModal.classList.remove('active'));

        if (btnApplyCities) btnApplyCities.addEventListener('click', () => {
            const checkboxes = citiesCheckboxesContainer.querySelectorAll('input[type="checkbox"]:not(#cb-todas-ciudades):checked');
            selectedCities = Array.from(checkboxes).map(cb => cb.value);
            citiesModal.classList.remove('active');
            updateCitiesBtn();

            const state = userStateSelect.value;
            if (state !== 'Todos' && selectedCities.length > 0) {
                localStorage.setItem('revista_last_location', JSON.stringify({ state: state, city: selectedCities[0] }));
            }

            if (window.syncSearchLocationWithHome) window.syncSearchLocationWithHome();
            renderFeed(true);
        });
    }

    function syncSearchLocationWithHome() {
        if (!filterState || !filterCity || !userStateSelect) return;
        const homeState = userStateSelect.value || 'Todos';

        filterState.value = homeState;

        filterCity.innerHTML = '';
        if (homeState === 'Todos') {
            filterCity.innerHTML = '<option value="Todas" selected>Todas las ciudades</option>';
        } else {
            const stateCities = (window.activeLocations && window.activeLocations.citiesByState[homeState])
                || (catalogData && catalogData.citiesByState[homeState])
                || [];

            if (selectedCities.length > 1 && homeState === userStateSelect.value) {
                filterCity.innerHTML = `<option value="Todas" selected>${selectedCities.length} ciudades</option>`;
            } else {
                filterCity.innerHTML = '<option value="Todas">Todas las ciudades</option>';
            }

            stateCities.forEach(city => {
                const isSel = (selectedCities.length === 1 && selectedCities[0] === city);
                filterCity.innerHTML += `<option value="${city}" ${isSel ? 'selected' : ''}>${city}</option>`;
            });
        }

        if (selectedCities.length === 1 && homeState === userStateSelect.value) {
            filterCity.value = selectedCities[0];
        } else {
            filterCity.value = 'Todas';
        }

        if (window.customFilterStateSelect) window.customFilterStateSelect.update();
        if (window.customFilterCitySelect) window.customFilterCitySelect.update();
    }
    window.syncSearchLocationWithHome = syncSearchLocationWithHome;



    window.cachedCategoryStats = null;

    window.refreshCategoryRanking = async function (cities) {
        if (typeof db.fetchCategoryStats === 'function') {
            window.cachedCategoryStats = await db.fetchCategoryStats(cities);
        }
    };

    function getSortedCategoriesByPopularity() {
        const viewCounts = {};

        if (window.cachedCategoryStats && window.cachedCategoryStats.length > 0) {
            // Usar datos reales y completos del servidor
            window.cachedCategoryStats.forEach(item => {
                if (!viewCounts[item.type]) viewCounts[item.type] = 0;
                viewCounts[item.type] += (item.views || 0);
            });
        } else {
            // Fallback al muestreo local si el caché aún no está listo
            const localListings = db.getAllListings().filter(l => db.isListingActive(l));
            const feedListings = typeof window.activeFeedListings !== 'undefined' ? window.activeFeedListings : [];
            let listings = [...localListings];
            feedListings.forEach(fl => {
                if (!listings.some(l => String(l.id) === String(fl.id))) {
                    listings.push(fl);
                }
            });

            if (selectedCities.length > 0) {
                listings = listings.filter(l => selectedCities.includes(l.city));
            }

            listings.forEach(l => {
                if (!viewCounts[l.type]) viewCounts[l.type] = 0;
                viewCounts[l.type] += (l.views || 0);
            });
        }

        const sortedTypes = catalogData && catalogData.types ? [...catalogData.types] : [];
        sortedTypes.sort((a, b) => {
            const viewsA = viewCounts[a] || 0;
            const viewsB = viewCounts[b] || 0;
            return viewsB - viewsA; // Mayor a menor
        });
        return sortedTypes;
    }

    function centerCategoryChip(chip, smooth = true) {
        if (!chip || !homeCategories) return;
        const containerWidth = homeCategories.clientWidth;
        const chipLeft = chip.offsetLeft;
        const chipWidth = chip.offsetWidth;
        const targetScroll = chipLeft - (containerWidth / 2) + (chipWidth / 2);
        const maxScroll = homeCategories.scrollWidth - containerWidth;
        const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));

        homeCategories.scrollTo({
            left: clampedScroll,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }

    function populateHomeCategories() {
        if (!homeCategories) return;
        const smartCategories = getSortedCategoriesByPopularity();
        const expectedTypes = ['Todos', ...smartCategories];

        const existingChips = Array.from(homeCategories.querySelectorAll('.category-chip'));
        const existingTypes = existingChips.map(c => c.getAttribute('data-type'));

        // Si las categorías en el DOM ya coinciden, solo actualizamos el estado activo sin destruir el DOM
        const isSameStructure = existingTypes.length === expectedTypes.length &&
            existingTypes.every((t, idx) => t === expectedTypes[idx]);

        if (isSameStructure) {
            existingChips.forEach(chip => {
                const type = chip.getAttribute('data-type');
                if (type === currentFeedCategory) {
                    chip.classList.add('active');
                } else {
                    chip.classList.remove('active');
                }
            });
            return;
        }

        // Reconstruir el DOM solo si la estructura cambió, preservando la posición del scroll
        const currentScroll = homeCategories.scrollLeft;
        homeCategories.innerHTML = '';

        expectedTypes.forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'category-chip';
            if (type === currentFeedCategory) {
                btn.classList.add('active');
            }
            btn.setAttribute('data-type', type);
            btn.textContent = type;
            homeCategories.appendChild(btn);
        });

        homeCategories.scrollLeft = currentScroll;
    }

    window.advanceCategoryRow = function (categoryType) {
        const row = document.querySelector(`.netflix-row[data-category="${categoryType}"]`);
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            const scrollContainer = row.querySelector('.netflix-row-scroll');
            if (scrollContainer) {
                const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
                if (scrollContainer.scrollLeft >= maxScroll - 20) {
                    scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    const scrollAmount = Math.max(scrollContainer.clientWidth * 0.75, 160);
                    scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }
        }
    };

    // Event delegation para hacer que funcione tanto en los nuevos botones como en el 'Todos' original
    homeCategories.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-chip');
        if (!btn) return;

        const type = btn.getAttribute('data-type');
        currentFeedCategory = type;

        // Actualizar la clase activa al instante
        homeCategories.querySelectorAll('.category-chip').forEach(chip => {
            if (chip.getAttribute('data-type') === type) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        // Centrar el chip seleccionado suavemente
        centerCategoryChip(btn, true);

        // Actualizar el feed
        renderFeed(true);
    });

    function createListingCardHTML(listing, hideHeart = false) {
        const isSaved = savedListingsIds.includes(listing.id);
        const savedClass = isSaved ? 'saved' : '';
        const savedIcon = isSaved ? 'favorite' : 'favorite_border';

        const images = listing.images || (listing.image ? [listing.image] : ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80']);
        const firstImage = images[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80';
        const optimizer = typeof window.useImageOptimizerHook === 'function' ? window.useImageOptimizerHook() : null;
        const cardImage = optimizer ? optimizer.getThumbnailUrl(listing) : firstImage;
        const imageElements = `<img src="${cardImage}" alt="Auto" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='${firstImage}';}">`;

        let navArrows = '';

        return `
            <div class="card" data-id="${listing.id}" style="cursor: pointer;" onclick="if(!event.target.closest('.card-save-btn')) openListingDetails(${listing.id})">
                <div class="card-img-wrapper">
                    <div class="card-img-carousel" style="overflow-x: hidden;">
                        ${imageElements}
                    </div>
                    ${navArrows}
                    ${(listing.old_price && listing.old_price > listing.price) ? `<div style="position: absolute; bottom: 0; left: 0; background: #ef4444; color: white; font-size: 0.7rem; font-weight: 700; padding: 4px 8px; border-radius: 0 8px 0 0; z-index: 3;">REBAJADO</div>` : ''}
                    <button class="card-save-btn ${savedClass}" style="${(hideHeart && !isSaved) ? 'display: none;' : ''}" onclick="event.stopPropagation(); window.toggleSave(${listing.id}, this)">
                        <span class="material-symbols-rounded" style="font-variation-settings: 'FILL' ${isSaved ? '1' : '0'};">${savedIcon}</span>
                    </button>
                </div>
                <div class="card-content">
                    <h4 class="card-title">${(listing.title || `${listing.make} ${listing.model} ${listing.year}`).replace(listing.year, '').replace(/\s+/g, ' ').trim()}</h4>
                    <p class="card-price">
                        ${usePriceFormatterHook(listing, { skipOldPrice: true })}
                    </p>
                    <div class="card-meta">
                        <span>${listing.year}</span>
                        <span><span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle; margin-right:2px; margin-top:-2px;">location_on</span>${listing.city}</span>
                    </div>
                </div>
            </div>
        `;
    }

    window.openAdFromCatalog = function (adId, prevListingId, nextListingId) {
        if (prevListingId && prevListingId !== 'null' && prevListingId !== 'undefined') {
            window.pendingPrevListingIdAfterAd = parseInt(prevListingId, 10) || prevListingId;
        }
        if (nextListingId && nextListingId !== 'null' && nextListingId !== 'undefined') {
            window.pendingNextListingIdAfterAd = parseInt(nextListingId, 10) || nextListingId;
        }
        window.openAdDetails(adId);
    };

    function createAdCardHTML(ad, prevId = null, nextId = null) {
        if (!ad) {
            // Fallback ad if no ads are available for this city
            return `
            <div class="card ad-card" style="cursor: pointer; border: 2px solid #f59e0b; border-radius: 16px; display: flex; flex-direction: column; position: relative; overflow: hidden; z-index: 10; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25);" onclick="if(window.openClientAdModal) window.openClientAdModal();">
                <div class="card-img-wrapper" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0.04) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; border-top: none;">
                    <span class="material-symbols-rounded" style="font-size: 50px; color: #f59e0b; filter: drop-shadow(0 2px 8px rgba(245, 158, 11, 0.5)); margin-bottom: 6px;">storefront</span>
                    <strong style="color: #fbbf24; font-size: 1.1rem; text-align: center; line-height: 1.2; font-weight: 700; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">Anúnciate Aquí</strong>
                </div>
                <div class="card-content" style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; padding: 12px; background: rgba(245, 158, 11, 0.05);">
                    <div style="width: 100%; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 8px; padding: 6px 4px; text-align: center; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <span>👆</span> Toca para publicar
                    </div>
                </div>
            </div>
            `;
        }

        const firstImage = (ad.images && ad.images.length > 0) ? ad.images[0] : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80';

        const clickAction = (prevId && nextId)
            ? `window.openAdFromCatalog('${ad.id}', '${prevId}', '${nextId}')`
            : `window.openAdDetails('${ad.id}')`;

        return `
            <div class="card ad-card" style="cursor: pointer; border: 2px solid #f59e0b; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; position: relative; z-index: 10; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25);" onclick="${clickAction}">
                <div style="background: linear-gradient(90deg, #d97706, #f59e0b); color: #ffffff; text-align: center; padding: 4px 0; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; z-index: 5; box-shadow: 0 2px 4px rgba(0,0,0,0.3); flex-shrink: 0;">
                    Patrocinador
                </div>
                <div style="flex-grow: 1; width: 100%; position: relative;">
                    <img src="${firstImage}" alt="Anuncio" loading="lazy" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                </div>
            </div>
        `;
    }

    window.openAdDetails = async function (adId) {

        let ad = db.getAllAds().find(a => String(a.id) === String(adId));
        if (!ad) {
            ad = await db.incrementAdViews(adId);
        } else {
            db.incrementAdViews(adId); // fire and forget para evitar parpadeo
        }
        if (!ad) return;

        // Establecer contexto para navegación
        if (!window.currentAdsArray) {
            window.currentAdsArray = db.getAllAds().filter(a => a.is_active);
        }
        window.currentAdObj = ad;

        window.navigateAdGlobal = (direction) => {
            // Si el anuncio se activó durante la navegación de vehículos en la vista de detalle
            if (window.pendingNextListingIdAfterAd || window.pendingPrevListingIdAfterAd) {
                const targetId = direction === 1 ? window.pendingNextListingIdAfterAd : window.pendingPrevListingIdAfterAd;
                window.pendingNextListingIdAfterAd = null;
                window.pendingPrevListingIdAfterAd = null;

                const adModal = document.getElementById('ad-fullscreen-modal');
                const animOutClass = direction === 1 ? 'slide-out-left' : 'slide-out-right';
                const animInClass = direction === 1 ? 'slide-in-right' : 'slide-in-left';

                // 1. Anuncio hace slide-out
                const contentDiv = adModal && (adModal.querySelector('.modal-content') || adModal.querySelector('.detalle-wrapper'));
                if (contentDiv) contentDiv.classList.add(animOutClass);

                setTimeout(() => {
                    // 2. Quitar el modal
                    if (contentDiv) contentDiv.classList.remove(animOutClass);

                    if (targetId) {
                        // Cargar el auto mientras el modal AÚN cubre la pantalla (sin parpadeo)
                        window.openListingDetails(targetId);
                        const detalleContent = document.getElementById('detalle-content');
                        // Quitar modal y arrancar slide-in al mismo tiempo (sin gap de 50ms)
                        if (adModal) adModal.classList.remove('active');
                        if (detalleContent) {
                            void detalleContent.offsetWidth;
                            detalleContent.classList.add(animInClass);
                            setTimeout(() => detalleContent.classList.remove(animInClass), 260);
                        }
                    } else {
                        if (adModal) adModal.classList.remove('active');
                        window.closeListingDetails();
                    }
                }, 200);
                return;
            }

            const arr = window.currentAdsArray;
            if (!arr || arr.length <= 1) return;
            const currentIndex = arr.findIndex(a => String(a.id) === String(window.currentAdObj.id));
            if (currentIndex === -1) return;

            let nextIndex = currentIndex + direction;
            if (nextIndex >= arr.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = arr.length - 1;

            const nextId = arr[nextIndex].id;
            const modal = document.getElementById('ad-fullscreen-modal');
            const animOutClass = direction === 1 ? 'slide-out-left' : 'slide-out-right';
            const animInClass = direction === 1 ? 'slide-in-right' : 'slide-in-left';

            const contentDiv = modal.querySelector('.modal-content') || modal.querySelector('.detalle-wrapper');
            if (contentDiv) contentDiv.classList.add(animOutClass);

            setTimeout(() => {
                if (contentDiv) contentDiv.classList.remove(animOutClass);
                window.openAdDetails(nextId);
                if (contentDiv) {
                    void contentDiv.offsetWidth; // Forzar reflow para reiniciar la animación
                    contentDiv.classList.add(animInClass);
                    setTimeout(() => contentDiv.classList.remove(animInClass), 260);
                }
            }, 200);
        };

        const modal = document.getElementById('ad-fullscreen-modal');
        if (!modal) return;

        // Guardar la posición de scroll actual antes de mostrar el modal (igual que en los autos)
        savedScrollPosition = window.scrollY || document.documentElement.scrollTop;

        // Render Carousel
        const carousel = document.getElementById('ad-image-carousel');
        carousel.innerHTML = '';
        if (ad.images && ad.images.length > 0) {
            carousel.innerHTML = ad.images.map((img, i) => `
                <img src="${img}" style="display: ${i === 0 ? 'block' : 'none'}; width: 100%;" class="ad-carousel-img" data-index="${i}">
            `).join('');

            if (ad.images.length > 1) {
                // Add arrows
                carousel.innerHTML += `
                    <button class="carousel-nav-btn prev" onclick="event.stopPropagation(); scrollAdCarousel(-1)" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.5); border:none; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:5;"><span class="material-symbols-rounded">chevron_left</span></button>
                    <button class="carousel-nav-btn next" onclick="event.stopPropagation(); scrollAdCarousel(1)" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.5); border:none; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:5;"><span class="material-symbols-rounded">chevron_right</span></button>
                    <div class="image-counter" style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.6); color:white; padding:4px 8px; border-radius:12px; font-size:0.8rem; z-index:5;">1 / ${ad.images.length}</div>
                `;
            }

            // Habilitar pinch zoom en estas imágenes
            const imgs = carousel.querySelectorAll('img');
            imgs.forEach(img => window.enablePinchZoom(img));

            // Añadir soporte para deslizar (swipe)
            let touchStartX = 0;
            let touchStartY = 0;
            let touchEndX = 0;
            let touchEndY = 0;

            carousel.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            carousel.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                const swipeDistX = touchStartX - touchEndX;
                const diffX = Math.abs(swipeDistX);
                const diffY = Math.abs(touchStartY - touchEndY);

                // Solo avanzar fotos si el movimiento es predominantemente HORIZONTAL
                if (diffX > 40 && diffX > diffY) {
                    if (swipeDistX > 40) {
                        if (ad.images && ad.images.length > 1) {
                            if (typeof scrollAdCarousel === 'function') scrollAdCarousel(1);
                        }
                    } else if (swipeDistX < -40) {
                        if (ad.images && ad.images.length > 1) {
                            if (typeof scrollAdCarousel === 'function') scrollAdCarousel(-1);
                        }
                    }
                }
            }, { passive: true });
        }

        window.currentAdImagesCount = ad.images ? ad.images.length : 0;
        window.currentAdImageIndex = 0;

        document.getElementById('ad-detail-title').textContent = ad.title || 'Negocio';
        if (document.getElementById('ad-detail-loc-text')) {
            const rawCity = (ad.city || '').split(',')[0].trim();
            const formattedCity = rawCity ? rawCity.toLowerCase().replace(/(?:^|\s|-)\S/g, char => char.toUpperCase()) : '';
            document.getElementById('ad-detail-loc-text').textContent = formattedCity || 'Ubicación no especificada';
        }
        document.getElementById('ad-detail-description').textContent = ad.description || '';

        // Dirección
        const addrContainer = document.getElementById('ad-detail-address-container');
        if (ad.address) {
            addrContainer.style.display = 'block';
            document.getElementById('ad-detail-address').textContent = ad.address;
        } else {
            addrContainer.style.display = 'none';
        }

        // Horarios
        const schedContainer = document.getElementById('ad-detail-schedule-container');
        if (ad.scheduleMF || ad.scheduleSat || ad.scheduleSun) {
            schedContainer.style.display = 'block';

            const mfRow = document.getElementById('ad-schedule-mf-row');
            if (ad.scheduleMF) {
                mfRow.style.display = 'flex';
                document.getElementById('ad-detail-schedule-mf').textContent = ad.scheduleMF;
            } else { mfRow.style.display = 'none'; }

            const satRow = document.getElementById('ad-schedule-sat-row');
            if (ad.scheduleSat) {
                satRow.style.display = 'flex';
                document.getElementById('ad-detail-schedule-sat').textContent = ad.scheduleSat;
            } else { satRow.style.display = 'none'; }

            const sunRow = document.getElementById('ad-schedule-sun-row');
            if (ad.scheduleSun) {
                sunRow.style.display = 'flex';
                document.getElementById('ad-detail-schedule-sun').textContent = ad.scheduleSun;
            } else { sunRow.style.display = 'none'; }

        } else {
            schedContainer.style.display = 'none';
        }

        // Contact button
        const btnContact = document.getElementById('btn-ad-contactar');
        btnContact.style.display = 'none';

        if (ad.whatsapp || ad.phone) {
            btnContact.style.display = 'flex';
            btnContact.style.background = '';
            btnContact.style.color = '';
            btnContact.style.fontWeight = '';
            btnContact.style.boxShadow = '';
            btnContact.innerHTML = '<span class="material-symbols-rounded">chat</span> Contactar';
            btnContact.onclick = () => {
                const btnCall = document.getElementById('btn-contact-call');
                const btnWhatsApp = document.getElementById('btn-contact-whatsapp');

                btnCall.style.display = ad.phone ? 'flex' : 'none';
                btnWhatsApp.style.display = ad.whatsapp ? 'flex' : 'none';

                if (ad.phone) {
                    const phoneData = parseAndFormatPhone(ad.phone, ad);

                    if (window.innerWidth >= 768) {
                        btnCall.innerHTML = `<span class="material-symbols-rounded">phone_iphone</span> ${phoneData.displayFormatted}`;
                        btnCall.style.cursor = 'pointer';
                        btnCall.onclick = () => {
                            db.incrementAdClicks(adId);
                            window.open(phoneData.telUrl, '_self');
                            document.getElementById('contact-modal').classList.remove('active');
                        };
                    } else {
                        btnCall.innerHTML = `<span class="material-symbols-rounded">call</span> Llamar`;
                        btnCall.style.cursor = 'pointer';
                        btnCall.onclick = () => {
                            db.incrementAdClicks(adId);
                            window.open(phoneData.telUrl, '_self');
                            document.getElementById('contact-modal').classList.remove('active');
                        };
                    }
                }

                if (ad.whatsapp) {
                    const waData = parseAndFormatPhone(ad.whatsapp, ad);
                    const cleanPhoneWa = waData.prefix.replace('+', '') + waData.nationalDigits;
                    const message = encodeURIComponent(`Hola, vi su anuncio "${ad.title}" en RevistAuto.`);
                    btnWhatsApp.onclick = () => {
                        db.incrementAdClicks(adId);
                        window.open(`https://wa.me/${cleanPhoneWa}?text=${message}`, '_blank');
                        document.getElementById('contact-modal').classList.remove('active');
                    };
                }

                document.getElementById('contact-modal').classList.add('active');
            };
        }

        // Social Links Grid
        const grid = document.getElementById('ad-links-grid');
        const titleLinks = document.getElementById('ad-links-title');
        grid.innerHTML = '';
        if (titleLinks) titleLinks.style.display = 'none';

        if (ad.social_links && Array.isArray(ad.social_links) && ad.social_links.length > 0) {
            ad.social_links.forEach(link => {
                let url = typeof link === 'string' ? link : link.url;
                if (url) {
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = 'https://' + url;
                    }
                    let icon = 'link';
                    let title = (typeof link === 'object' && link.title) ? link.title : 'Visitar';

                    let bgColor = 'rgba(255,255,255,0.05)';
                    let textColor = 'var(--text-main)';
                    let border = '1px solid var(--border-color)';

                    if (url.includes('facebook.com') || url.includes('fb.me')) {
                        icon = 'thumb_up';
                        if (title === 'Visitar') title = 'Facebook';
                        bgColor = '#1877f2'; // Facebook blue
                        textColor = '#ffffff';
                        border = 'none';
                    }
                    else if (url.includes('instagram.com') || url.includes('instagr.am')) {
                        icon = 'photo_camera';
                        if (title === 'Visitar') title = 'Instagram';
                        bgColor = 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'; // Instagram gradient
                        textColor = '#ffffff';
                        border = 'none';
                    }
                    else if (url.includes('tiktok.com')) {
                        icon = 'music_note';
                        if (title === 'Visitar') title = 'TikTok';
                        bgColor = '#000000'; // TikTok black
                        textColor = '#ffffff';
                        border = '1px solid #ffffff33';
                    }
                    else if (url.includes('x.com') || url.includes('twitter.com')) {
                        icon = 'close';
                        if (title === 'Visitar') title = 'X (Twitter)';
                        bgColor = '#000000';
                        textColor = '#ffffff';
                        border = '1px solid #ffffff33';
                    }
                    else if (url.includes('youtube.com') || url.includes('youtu.be')) {
                        icon = 'play_arrow';
                        if (title === 'Visitar') title = 'YouTube';
                        bgColor = '#FF0000';
                        textColor = '#ffffff';
                        border = 'none';
                    }
                    else {
                        // Es una página web general (Visitar)
                        if (title === 'Visitar') {
                            try {
                                const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
                                title = urlObj.hostname.replace(/^www\./, '');
                            } catch (e) {
                                title = 'Sitio Web';
                            }
                        }
                        bgColor = '#ffffff'; // Botón blanco
                        textColor = '#000000'; // Texto negro
                        border = 'none';
                    }

                    grid.innerHTML += `
                        <a href="${url}" target="_blank" onclick="this.classList.add('flash-active'); setTimeout(() => this.classList.remove('flash-active'), 400); try{window.db.incrementAdClicks('${adId}');}catch(e){}" class="primary-btn social-btn-link" style="background: ${bgColor}; color: ${textColor}; font-size: 0.88rem; padding: 9px 14px; border-radius: 20px; display: flex; align-items: center; justify-content: center; gap: 8px; border: ${border}; font-weight: 700; text-decoration: none; cursor: pointer; width: 100%; box-shadow: 0 3px 10px rgba(0,0,0,0.25);">
                            <span class="material-symbols-rounded" style="font-size: 17px;">${icon}</span> ${title}
                        </a>
                    `;
                }
            });
        }

        const infoDiv = modal.querySelector('.detalle-info');
        if (infoDiv && !infoDiv.dataset.swipeInitialized) {
            infoDiv.dataset.swipeInitialized = 'true';
            let startX = 0;
            let startY = 0;
            let endX = 0;
            let endY = 0;

            infoDiv.addEventListener('touchstart', (e) => {
                startX = e.changedTouches[0].screenX;
                startY = e.changedTouches[0].screenY;
            }, { passive: true });

            infoDiv.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].screenX;
                endY = e.changedTouches[0].screenY;
                const diffX = Math.abs(endX - startX);
                const diffY = Math.abs(endY - startY);
                const threshold = 50;

                // Solo navegamos si es un gesto predominantemente HORIZONTAL (ignorar scroll vertical)
                if (diffX > threshold && diffX > diffY) {
                    if (endX < startX - threshold) {
                        if (window.navigateAdGlobal) window.navigateAdGlobal(1);
                    } else if (endX > startX + threshold) {
                        if (window.navigateAdGlobal) window.navigateAdGlobal(-1);
                    }
                }
            }, { passive: true });
        }

        history.pushState({ page: 'ad-modal' }, '');
        modal.style.display = ''; // Remover cualquier display: none que haya puesto switchView
        modal.classList.add('active');

        const carouselAd = document.getElementById('ad-image-carousel');
        if (carouselAd && ad.images && ad.images.length > 1) {
            carouselAd.addEventListener('touchstart', window.stopFullscreenAutoplay, { passive: true });
            carouselAd.addEventListener('mousedown', window.stopFullscreenAutoplay);
            window.startFullscreenAutoplay(true, ad.images.length);
        }
    };

    window.scrollAdCarousel = function (direction) {
        const carousel = document.getElementById('ad-image-carousel');
        const images = carousel.querySelectorAll('.ad-carousel-img');
        if (images.length <= 1) return;

        images[window.currentAdImageIndex].style.display = 'none';

        let nextIndex = window.currentAdImageIndex + direction;
        if (nextIndex < 0 || nextIndex >= images.length) {
            images[window.currentAdImageIndex].style.display = 'block';
            return;
        }

        window.currentAdImageIndex = nextIndex;
        images[window.currentAdImageIndex].style.display = 'block';

        const counter = carousel.querySelector('.image-counter');
        if (counter) {
            counter.textContent = `${window.currentAdImageIndex + 1} / ${images.length}`;
        }
    };

    window.updateCounter = function (element) {
        const wrapper = element.parentElement;
        const counter = wrapper.querySelector('.image-counter');
        const prevBtn = wrapper.querySelector('.carousel-nav-btn.prev');
        const nextBtn = wrapper.querySelector('.carousel-nav-btn.next');

        const index = Math.round(element.scrollLeft / element.clientWidth) + 1;
        const total = element.children.length;

        if (counter) {
            counter.textContent = `${index} / ${total}`;
        }

        if (prevBtn) {
            prevBtn.style.display = index === 1 ? 'none' : 'flex';
        }
        if (nextBtn) {
            nextBtn.style.display = index === total ? 'none' : 'flex';
        }
    };

    window.scrollCarousel = function (e, btn, direction) {
        e.stopPropagation();
        const wrapper = btn.parentElement;
        const carousel = wrapper.querySelector('.detalle-img-carousel') || wrapper.querySelector('.card-img-carousel');
        if (carousel) {
            const scrollAmount = carousel.clientWidth;
            carousel.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
        }
    };

    window.scrollNetflixRow = function (e, btn, direction) {
        e.stopPropagation();
        const row = btn.parentElement;
        const scrollContainer = row.querySelector('.netflix-row-scroll');
        if (scrollContainer) {
            const scrollAmount = Math.max(scrollContainer.clientWidth * 0.8, 150);
            scrollContainer.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
        }
    };

    window.updateNetflixNav = function (scrollContainer) {
        const row = scrollContainer.parentElement;
        const prevBtn = row.querySelector('.row-nav-btn.prev');
        const nextBtn = row.querySelector('.row-nav-btn.next');

        // Lazy loading dinámico por fila
        const category = row.getAttribute('data-category');
        if (category && window.netflixRowData && window.netflixRowData[category]) {
            const rowData = window.netflixRowData[category];
            // Si nos acercamos al final (75% del scroll) y aún hay autos por mostrar
            const scrollPercentage = (scrollContainer.scrollLeft + scrollContainer.clientWidth) / scrollContainer.scrollWidth;
            if (scrollPercentage > 0.75 && rowData.renderedCount < rowData.allListings.length) {
                const nextBatch = rowData.allListings.slice(rowData.renderedCount, rowData.renderedCount + 15);

                const freq = window.db.adFrequencyScroll || 10;
                let newCardsHTML = '';
                for (let i = 0; i < nextBatch.length; i++) {
                    newCardsHTML += createListingCardHTML(nextBatch[i], true);
                    // Also inject ads in lazy load based on overall count
                    const totalIndex = rowData.renderedCount + i + 1;
                    if (totalIndex % freq === 0 && window.db.adsEnabled) {
                        // Assuming we want to show a random ad (for simplicity here, since adPool is out of scope)
                        // It will render the fallback "Anunciate" ad since we don't have adPool locally without await
                        // To improve this, we would need to pass adPool to window, or just let it render fallback.
                        // For now we'll render fallback to encourage more advertisers!
                        newCardsHTML += createAdCardHTML(null);
                    }
                }

                scrollContainer.insertAdjacentHTML('beforeend', newCardsHTML);
                rowData.renderedCount += 15;
            }
        }

        if (prevBtn) {
            if (scrollContainer.scrollLeft <= 10) {
                prevBtn.classList.add('hidden');
            } else {
                prevBtn.classList.remove('hidden');
            }
        }

        if (nextBtn) {
            if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 10) {
                nextBtn.classList.add('hidden');
            } else {
                nextBtn.classList.remove('hidden');
            }
        }
    };

    // --- Búsqueda en Cascada (3 niveles) ---
    // Construye la lista ordenada para el swipe en fullscreen cuando viene de Búsqueda Avanzada.
    // Nivel 1: resultados exactos de la búsqueda
    // Nivel 2: mismo modelo, no en nivel 1
    // Nivel 3: misma categoría/tipo, no en nivel 1 ni 2
    function buildSearchSwipeQueue(startingId, ctx) {
        if (!ctx || !ctx.level1) return null;

        // Unir datos disponibles localmente para hacer la cascada
        const localListings = db.getAllListings().filter(l => db.isListingActive(l));
        const feedListings = typeof window.activeFeedListings !== 'undefined' ? window.activeFeedListings : [];
        const level1 = ctx.level1;

        const allActiveMap = new Map();
        [...localListings, ...feedListings, ...level1].forEach(l => {
            allActiveMap.set(String(l.id), l);
        });
        const allActive = Array.from(allActiveMap.values());

        const startingListing = allActive.find(l => String(l.id) === String(startingId));
        if (!startingListing) return null;

        const level1Ids = new Set(level1.map(l => String(l.id)));

        // Nivel 2: mismo modelo, no está en el nivel 1
        const level2 = allActive.filter(l =>
            !level1Ids.has(String(l.id)) &&
            l.model && startingListing.model &&
            l.model.toLowerCase() === startingListing.model.toLowerCase()
        );

        // Nivel 3: misma categoría/tipo, no está en nivel 1 ni nivel 2
        const level2Ids = new Set(level2.map(l => String(l.id)));
        const level3 = allActive.filter(l =>
            !level1Ids.has(String(l.id)) &&
            !level2Ids.has(String(l.id)) &&
            l.type === startingListing.type
        );

        return [...level1, ...level2, ...level3];
    }

    var currentFeedPage = 1;
    var isLoadingFeed = false;
    var hasMoreFeedItems = true;
    window.activeFeedListings = [];
    // PAGE_SIZE responsivo: en PC las filas horizontales son más anchas y necesitan
    // más tarjetas por categoría para verse llenas. En móvil, menos tarjetas bastan.
    // PC (≥768px): ~100 autos → ~10+ por cada categoría
    // Móvil (<768px): ~40 autos → ~4-5 por cada categoría
    var PAGE_SIZE = window.innerWidth >= 768 ? 100 : 40;

    // ==========================================
    // HOOK DE PRE-CARGA EN SEGUNDO PLANO (PREFETCHING)
    // ==========================================
    function usePrefetchHook() {
        let prefetchTimer = null;
        window.prefetchedFeedData = null;

        function schedulePrefetch() {
            if (prefetchTimer) clearTimeout(prefetchTimer);
            prefetchTimer = setTimeout(async () => {
                if (isLoadingFeed || !hasMoreFeedItems) return;
                const state = userStateSelect ? userStateSelect.value : null;
                const reqCities = [...selectedCities]; // clonamos
                const reqCategory = currentFeedCategory;
                const reqPage = currentFeedPage;

                try {
                    const res = await db.fetchFeedPaginated({
                        page: reqPage,
                        pageSize: PAGE_SIZE,
                        state: state,
                        cities: reqCities,
                        filters: { category: reqCategory }
                    });
                    if (res && res.data && res.data.length > 0) {
                        window.prefetchedFeedData = {
                            res: res,
                            context: { state, cities: reqCities.join(','), category: reqCategory, page: reqPage }
                        };
                    }
                } catch (e) { }
            }, 600);
        }

        return { schedulePrefetch };
    }
    window.usePrefetchHook = usePrefetchHook;

    async function fetchNextFeedBlock() {
        if (isLoadingFeed || !hasMoreFeedItems) return;
        isLoadingFeed = true;

        // Mostrar spinner de carga si existe el centinela
        const sentinel = document.getElementById('feed-infinite-scroll-sentinel');
        if (sentinel) sentinel.style.display = 'block';

        const state = userStateSelect ? userStateSelect.value : null;
        const currentContextHash = { state, cities: selectedCities.join(','), category: currentFeedCategory, page: currentFeedPage };

        let res = null;
        if (window.prefetchedFeedData && window.prefetchedFeedData.context &&
            window.prefetchedFeedData.context.state === currentContextHash.state &&
            window.prefetchedFeedData.context.cities === currentContextHash.cities &&
            window.prefetchedFeedData.context.category === currentContextHash.category &&
            window.prefetchedFeedData.context.page === currentContextHash.page) {
            
            // Consumir datos pre-cargados porque son 100% compatibles
            res = window.prefetchedFeedData.res;
            window.prefetchedFeedData = null;
        } else {
            window.prefetchedFeedData = null; // Descartar datos obsoletos si los hay
            res = await db.fetchFeedPaginated({
                page: currentFeedPage,
                pageSize: PAGE_SIZE,
                state: state,
                cities: selectedCities,
                filters: { category: currentFeedCategory },
                forceRefresh: currentFeedPage === 1 // Renovar barajado al cambiar ciudad o en la página 1
            });
        }

        if (res && res.data && res.data.length > 0) {
            // Eliminar duplicados por id
            const newItems = res.data.filter(newItem => !window.activeFeedListings.some(existing => existing.id === newItem.id));
            window.activeFeedListings = [...window.activeFeedListings, ...newItems];

            // Añadir al DOM
            appendFeedListingsToDOM(newItems);

            currentFeedPage++;
        } else if (currentFeedPage === 1) {
            // No hay elementos en la primera página
            const feedContainer = document.getElementById('feed-container');
            if (feedContainer && currentFeedCategory !== 'Todos') {
                feedContainer.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; width: 100%; grid-column: 1 / -1; gap: 16px;">
                        <span class="material-symbols-rounded" style="font-size: 64px; color: var(--text-muted); opacity: 0.5;">directions_car</span>
                        <h2 style="color: var(--text-muted); text-align: center; font-size: 1.2rem; font-weight: 500;">
                            No hay vehículos disponibles en esta categoría por el momento.
                        </h2>
                        <button data-action="open-new-listing" class="primary-btn" style="padding: 12px 24px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-rounded">add_circle</span> Da de alta el primer vehículo
                        </button>
                    </div>
                `;
            } else if (feedContainer && currentFeedCategory === 'Todos') {
                feedContainer.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; width: 100%; gap: 16px;">
                        <span class="material-symbols-rounded" style="font-size: 64px; color: var(--text-muted); opacity: 0.5;">search_off</span>
                        <h2 style="color: var(--text-muted); text-align: center; font-size: 1.2rem; font-weight: 500;">
                            No hay vehículos publicados en tu zona todavía.
                        </h2>
                        <button data-action="open-new-listing" class="primary-btn" style="padding: 12px 24px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-rounded">add_circle</span> Da de alta tu vehículo
                        </button>
                    </div>
                `;
            }
        }

        hasMoreFeedItems = res.hasMore;
        isLoadingFeed = false;

        if (sentinel) {
            sentinel.style.display = hasMoreFeedItems ? 'block' : 'none';
        }

        // Programar pre-carga de la siguiente página en segundo plano
        if (hasMoreFeedItems && typeof window.usePrefetchHook === 'function') {
            window.usePrefetchHook().schedulePrefetch();
        }
    }

    async function renderFeed(forceReload = false) {
        const feedContainer = document.getElementById('feed-container');

        if (window.isWaitingForInitialGps) {
            if (feedContainer) {
                feedContainer.classList.remove('listings-grid');
                feedContainer.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; width: 100%; gap: 16px;">
                        <span class="material-symbols-rounded" style="animation: spin 1s linear infinite; font-size: 48px; color: var(--primary-color);">my_location</span>
                        <h2 style="color: var(--text-muted); text-align: center; font-size: 1.5rem; font-weight: 500;">
                            Esperando ubicación...
                        </h2>
                    </div>`;
            }
            return;
        }

        // Si los vehículos del feed ya se encuentran renderizados en pantalla y no se fuerza recarga,
        // retenemos el DOM existente sin vaciar el contenedor para evitar cualquier parpadeo al cambiar de pestaña.
        if (!forceReload && window.activeFeedListings && window.activeFeedListings.length > 0 && feedContainer && feedContainer.children.length > 0) {
            return;
        }

        // Refrescar ranking desde el servidor antes de renderizar
        if (typeof window.refreshCategoryRanking === 'function') {
            await window.refreshCategoryRanking(selectedCities);
        }

        populateHomeCategories();

        // Reset pagination state
        currentFeedPage = 1;
        window.activeFeedListings = [];
        hasMoreFeedItems = true;
        if (feedContainer) feedContainer.innerHTML = '';

        // Add sentinel
        let sentinel = document.getElementById('feed-infinite-scroll-sentinel');
        if (!sentinel) {
            sentinel = document.createElement('div');
            sentinel.id = 'feed-infinite-scroll-sentinel';
            sentinel.style.padding = '20px';
            sentinel.style.textAlign = 'center';
            sentinel.style.width = '100%';
            sentinel.innerHTML = '<div class="spinner" style="color: var(--primary-color);">Cargando vehículos...</div>';
            feedContainer.after(sentinel);

            const observer = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    fetchNextFeedBlock();
                }
            }, { rootMargin: '300px' });
            observer.observe(sentinel);
        }

        // Setup container layout based on category
        if (currentFeedCategory !== 'Todos') {
            feedContainer.classList.add('listings-grid');
        } else {
            feedContainer.classList.remove('listings-grid');
            window.netflixRowData = {}; // Initialize for lazy loading horizontal rows

            // Pre-crear las filas en el DOM en el orden EXACTO de popularidad
            // Inicialmente estarán ocultas (display: none)
            const popularCategories = getSortedCategoriesByPopularity();
            let emptyRowsHTML = '';
            popularCategories.forEach(type => {
                if (type !== 'Todos') {
                    emptyRowsHTML += `
                    <div class="netflix-row" data-category="${type}" style="display: none;">
                        <div class="netflix-row-header" style="display: flex; justify-content: flex-start; align-items: center; gap: 8px; padding-left: 5px; margin-bottom: 8px;">
                            <h3 class="netflix-row-title" onclick="window.advanceCategoryRow('${type}')" style="cursor: pointer; margin-bottom: 0; padding-left: 0;">
                                ${type} <span class="material-symbols-rounded" style="font-size: 20px; color: var(--primary-color);">chevron_right</span>
                            </h3>
                            <div class="netflix-row-cta-container"></div>
                        </div>
                        <button class="row-nav-btn prev hidden" onclick="scrollNetflixRow(event, this, -1)">
                            <span class="material-symbols-rounded">chevron_left</span>
                        </button>
                        <button class="row-nav-btn next" onclick="scrollNetflixRow(event, this, 1)">
                            <span class="material-symbols-rounded">chevron_right</span>
                        </button>
                        <div class="netflix-row-scroll" onscroll="updateNetflixNav(this)"></div>
                    </div>`;
                }
            });
            feedContainer.innerHTML = emptyRowsHTML;
        }

        await fetchNextFeedBlock();
    }

    async function appendFeedListingsToDOM(newItems) {
        if (!newItems || newItems.length === 0) {
            if (window.activeFeedListings.length === 0) {
                feedContainer.classList.remove('listings-grid');
                feedContainer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; min-height: 40vh; width: 100%;">
                        <h2 style="color: var(--text-muted); text-align: center; font-size: 1.8rem; font-weight: 600; line-height: 1.4; opacity: 0.6;">
                            No se encontraron<br>vehículos en esta<br>zona.
                        </h2>
                    </div>`;
            }
            return;
        }

        let adPool = [];
        if (db.adsEnabled) {
            const activeCities = (selectedCities && selectedCities.length > 0) ? selectedCities : null;
            adPool = await db.getRandomAds(5, activeCities) || [];
        }

        if (currentFeedCategory !== 'Todos') {
            // Append to Grid
            const freq = db.adFrequencyScroll || 10;
            let finalHTML = '';
            
            for (let i = 0; i < newItems.length; i++) {
                finalHTML += createListingCardHTML(newItems[i], true);
                if ((window.activeFeedListings.length - newItems.length + i + 1) % freq === 0 && db.adsEnabled) {
                    const ad = adPool.length > 0 ? adPool[Math.floor(Math.random() * adPool.length)] : null;
                    finalHTML += createAdCardHTML(ad, newItems[i].id, newItems[i].id);
                }
            }
            feedContainer.insertAdjacentHTML('beforeend', finalHTML);
        } else {
            // Append to Netflix Rows
            const grouped = {};
            newItems.forEach(l => {
                const normType = (l.type === 'Camioneta') ? 'SUV / Camioneta' : (l.type || 'Otros');
                l.type = normType;
                if (!grouped[normType]) grouped[normType] = [];
                grouped[normType].push(l);
            });
            const freq = db.adFrequencyScroll || 10;

            const sortedTypes = getSortedCategoriesByPopularity();

            for (const type of sortedTypes) {
                if (!grouped[type] || grouped[type].length === 0) continue;

                let existingRow = feedContainer.querySelector(`.netflix-row[data-category="${type}"]`);

                const typeListings = window.activeFeedListings.filter(l => l.type === type || (type === 'SUV / Camioneta' && l.type === 'Camioneta'));
                const existingCountForType = typeListings.length - grouped[type].length;

                let rowCardsHTML = '';
                
                // Smart CTA Logic para la fila (Botón flotante)
                if (existingCountForType === 0 && existingRow) {
                    let ctaLogicCarousel = getSmartCTALogic(grouped[type]);
                    if (ctaLogicCarousel.show) {
                        const ctaContainer = existingRow.querySelector('.netflix-row-cta-container');
                        if (ctaContainer) {
                            ctaContainer.innerHTML = `
                                <button class="btn btn-sm" data-action="open-new-listing" style="background-color: var(--primary-color); color: white; border: none; border-radius: 20px; display: flex; align-items: center; gap: 4px; font-size: 0.65rem; padding: 3px 8px; font-weight: 600; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4); text-transform: uppercase; cursor: pointer; white-space: nowrap;">
                                    <span class="material-symbols-rounded" style="font-size: 14px; color: white;">add_circle</span>
                                    ${ctaLogicCarousel.mainHTML} <span class="smart-cta-secondary"><span style="opacity: 0.6; margin: 0 2px;">|</span> <span style="text-transform: none;">${ctaLogicCarousel.messageHTML}</span></span>
                                </button>
                            `;
                        }
                    }
                }

                for (let i = 0; i < grouped[type].length; i++) {
                    const item = grouped[type][i];
                    rowCardsHTML += createListingCardHTML(item, true);

                    if (db.adsEnabled && (existingCountForType + i + 1) % freq === 0) {
                        const ad = adPool.length > 0 ? adPool[Math.floor(Math.random() * adPool.length)] : null;
                        rowCardsHTML += createAdCardHTML(ad, item.id, item.id);
                    }
                }

                if (existingRow) {
                    const scroller = existingRow.querySelector('.netflix-row-scroll');
                    if (scroller) scroller.insertAdjacentHTML('beforeend', rowCardsHTML);
                    existingRow.style.display = 'block'; // Mostrar la fila si estaba oculta
                }
            }
            // Initialize nav buttons visibility after DOM update
            setTimeout(() => {
                feedContainer.querySelectorAll('.netflix-row-scroll').forEach(scrollContainer => {
                    if (window.updateNetflixNav) window.updateNetflixNav(scrollContainer);
                    if (window.initAutoScroll) window.initAutoScroll(scrollContainer);
                });
            }, 50);
        }
    }


    window.toggleSave = function (id, btnElement) {
        try {
            id = Number(id);
            const index = savedListingsIds.indexOf(id);
            const btn = btnElement.tagName === 'BUTTON' ? btnElement : btnElement.closest('button');
            const span = btn ? btn.querySelector('span') : null;

            if (index > -1) {
                // Dislike
                savedListingsIds.splice(index, 1);
                if (btn) {
                    btn.classList.remove('saved');
                    btn.style.color = 'white';
                    btn.innerHTML = `<span class="material-symbols-rounded" style="font-variation-settings: 'FILL' 0; animation: heartPulse 0.3s ease-in-out;">favorite_border</span>`;
                }
            } else {
                // Like
                savedListingsIds.push(id);
                if (btn) {
                    btn.classList.add('saved');
                    btn.style.color = '#EF4444';
                    btn.innerHTML = `<span class="material-symbols-rounded" style="font-variation-settings: 'FILL' 1; animation: heartPulse 0.3s ease-in-out; color: #EF4444;">favorite</span>`;
                }
            }
            localStorage.setItem('revista_autos_saved', JSON.stringify(savedListingsIds));

            // Sync with feed cards visually without re-rendering everything
            const feedBtn = document.querySelector(`.card-save-btn[onclick*="toggleSave(${id}"]`);
            if (feedBtn) {
                if (index > -1) {
                    feedBtn.classList.remove('saved');
                    feedBtn.innerHTML = `<span class="material-symbols-rounded" style="font-variation-settings: 'FILL' 0; animation: heartPulse 0.3s ease-in-out;">favorite_border</span>`;
                } else {
                    feedBtn.classList.add('saved');
                    feedBtn.innerHTML = `<span class="material-symbols-rounded" style="font-variation-settings: 'FILL' 1; animation: heartPulse 0.3s ease-in-out; color: #EF4444;">favorite</span>`;
                }
            }

            // Re-render library if it's the active view
            const biblio = document.getElementById('view-biblioteca');
            if (biblio && biblio.classList.contains('active')) {
                try { renderSavedListings(); } catch (e) { }
            }
            // Sync nav icon
            if (window.updateNavFavoriteIcon) window.updateNavFavoriteIcon();

        } catch (err) {
            console.error('Error toggling save (card):', err);
        }
    };

    window.updateNavFavoriteIcon = function () {
        const hasFavorites = Array.isArray(savedListingsIds) && savedListingsIds.length > 0;
        const favNavBtns = document.querySelectorAll('.nav-item[data-target="view-biblioteca"] .material-symbols-rounded');

        favNavBtns.forEach(icon => {
            if (hasFavorites) {
                icon.style.setProperty('color', '#EF4444', 'important');
                icon.style.fontVariationSettings = "'FILL' 1";
            } else {
                icon.style.removeProperty('color');
                icon.style.fontVariationSettings = "'FILL' 0";
            }
        });
    };

    // --- History / Back Button Trap ---
    function initHistoryState() {
        history.replaceState({ page: 'root' }, '');
        history.pushState({ page: 'root' }, '');
        window.addEventListener('popstate', handlePopState);
    }

    function handlePopState(e) {
        if (isExiting) return;

        // 1. Check Fullscreen Ad Modal
        const adModal = document.getElementById('ad-fullscreen-modal');
        if (adModal && (adModal.classList.contains('active') || adModal.style.display === 'flex' || adModal.style.display === 'block')) {
            if (window.stopFullscreenAutoplay) window.stopFullscreenAutoplay();
            adModal.classList.remove('active');
            adModal.style.display = '';
            window.pendingNextListingIdAfterAd = null;
            window.pendingPrevListingIdAfterAd = null;

            // Restaurar scroll position
            requestAnimationFrame(() => {
                window.scrollTo(0, savedScrollPosition);
            });

            history.pushState({ page: 'root' }, '');
            return;
        }

        // 2. Check Other Specific Modals
        if (citiesModal && (citiesModal.style.display === 'flex' || citiesModal.classList.contains('active'))) {
            citiesModal.style.display = '';
            citiesModal.classList.remove('active');
            history.pushState({ page: 'root' }, '');
            return;
        }
        if (newListingModal && (newListingModal.style.display === 'flex' || newListingModal.classList.contains('active'))) {
            newListingModal.style.display = '';
            newListingModal.classList.remove('active');
            history.pushState({ page: 'root' }, '');
            return;
        }
        if (adminDashboardModal && (adminDashboardModal.style.display === 'flex' || adminDashboardModal.classList.contains('active'))) {
            adminDashboardModal.style.display = '';
            adminDashboardModal.classList.remove('active');
            history.pushState({ page: 'root' }, '');
            return;
        }

        // 3. Generic active modals check (e.g. contact-modal, client-ad-modal)
        const activeModal = document.querySelector('.modal.active');
        if (activeModal && activeModal.id !== 'exit-modal') {
            activeModal.classList.remove('active');
            activeModal.style.display = '';
            history.pushState({ page: 'root' }, '');
            return;
        }

        // 4. Check Detailed View (Cars)
        if (viewDetalle && viewDetalle.classList.contains('active')) {
            closeListingDetails();
            history.pushState({ page: 'root' }, '');
            return;
        }

        // 5. Check if active view is not view-inicio (return to view-inicio first)
        const viewInicio = document.getElementById('view-inicio');
        const isInicioActive = viewInicio && viewInicio.classList.contains('active');

        if (!isInicioActive) {
            navItems.forEach(nav => nav.classList.remove('active'));
            const inicioNav = Array.from(navItems).find(n => n.getAttribute('data-target') === 'view-inicio');
            if (inicioNav) inicioNav.classList.add('active');

            views.forEach(v => {
                v.classList.remove('active');
                if (v.id === 'view-inicio') v.classList.add('active');
            });
            if (typeof renderFeed === 'function') renderFeed();
            history.pushState({ page: 'root' }, '');
            return;
        }

        // 6. User wants to exit (only if at root view / view-inicio)
        if (exitModal) {
            if (exitModal.classList.contains('active') || exitModal.style.display === 'flex') {
                exitModal.classList.remove('active');
                exitModal.style.display = '';
                history.pushState({ page: 'root' }, '');
            } else {
                exitModal.classList.add('active');
                exitModal.style.display = 'flex';
                history.pushState({ page: 'root' }, '');
            }
        }
    }

    // Garantizar pila de historial tras primer toque en móviles
    function ensureHistoryStack() {
        if (!history.state || history.state.page !== 'root') {
            try { history.pushState({ page: 'root' }, ''); } catch (e) { }
        }
    }
    document.addEventListener('touchstart', ensureHistoryStack, { passive: true });
    document.addEventListener('click', ensureHistoryStack, { passive: true });

    // Escuchar atajos globales de teclado (Backspace / Escape)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' || e.key === 'Escape') {
            const activeEl = document.activeElement;
            const isInput = activeEl && (
                activeEl.tagName === 'INPUT' ||
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.isContentEditable
            );
            if (!isInput) {
                e.preventDefault();
                handlePopState(e);
            }
        }
    });

    if (btnExitNo) {
        btnExitNo.addEventListener('click', () => {
            exitModal.classList.remove('active');
            exitModal.style.display = '';
            if (!history.state || history.state.page !== 'root') {
                try { history.pushState({ page: 'root' }, ''); } catch (e) { }
            }
        });
    }

    if (btnExitYes) {
        btnExitYes.addEventListener('click', () => {
            isExiting = true;
            exitModal.classList.remove('active');
            exitModal.style.display = '';
            history.back();
        });
    }

    // --- Search ---
    const searchInput = document.getElementById('search-input');
    const searchFiltersContainer = document.getElementById('search-filters-container');
    const searchDropdown = document.getElementById('search-suggestions-dropdown');
    const btnClearSearch = document.getElementById('btn-clear-search');

    if (searchInput && searchDropdown) {
        useSearchAutocompleteHook(searchInput, searchDropdown);
    }
    if (searchInput && btnClearSearch) {
        useClearSearchInputHook(searchInput, btnClearSearch, searchDropdown);
    }

    const filterYearEl = document.getElementById('filter-year');
    if (filterYearEl) {
        useAutoBlurYearHook(filterYearEl);
    }

    searchInput.addEventListener('focus', () => {
        if (searchFiltersContainer.style.height === '0px') {
            searchFiltersContainer.style.height = searchFiltersContainer.scrollHeight + 'px';
            searchFiltersContainer.style.opacity = '1';
            searchFiltersContainer.style.pointerEvents = 'auto';

            // Limpiar resultados anteriores y palabra de búsqueda
            searchResults.innerHTML = '';
            searchInput.value = '';

            // Resetear los filtros secundarios
            const filterYearEl = document.getElementById('filter-year');
            if (filterYearEl) filterYearEl.value = '';

            filterTransmission.value = 'Todas';
            if (window.customFilterTransmissionSelect) window.customFilterTransmissionSelect.update();

            filterLegal.value = 'Todas';
            if (window.customFilterLegalSelect) window.customFilterLegalSelect.update();

            const filterColorEl = document.getElementById('filter-color');
            if (filterColorEl) {
                filterColorEl.value = 'Todos';
                if (window.customFilterColorSelect) window.customFilterColorSelect.update();
            }

            // Resetear ubicación con la de INICIO (Unidireccional)
            if (window.syncSearchLocationWithHome) window.syncSearchLocationWithHome();

            setTimeout(() => {
                searchFiltersContainer.style.height = 'auto';
                searchFiltersContainer.style.overflow = 'visible';
            }, 300);
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation(); // Evita que este mismo Enter cierre el modal accidentalmente
            btnSearch.click();
        }
    });

    btnSearch.addEventListener('click', async () => {
        const queryText = searchInput.value.trim();
        const filterColor = document.getElementById('filter-color');

        const yearRaw = filterYear ? filterYear.value.trim() : '';
        const colorVal = filterColor ? filterColor.value : 'Todos';
        const transmissionVal = filterTransmission ? filterTransmission.value : 'Cualquiera';
        const legalVal = filterLegal ? filterLegal.value : 'Cualquiera';

        // Validation Hook: permite buscar si hay texto O si se seleccionó al menos un detalle (Año, Color, Transmisión, Situación Legal)
        const validation = useAdvancedSearchValidationHook(queryText, yearRaw, colorVal, transmissionVal, legalVal);

        if (!validation.isValid) {
            showAlert('Por favor, escribe la Marca o Modelo que buscas o selecciona al menos un detalle (Año, Color, Transmisión o Situación Legal).', 'Búsqueda Vacía', 'warning');
            return;
        }

        const stateVal = filterState.value;
        const cityVal = filterCity.value;

        let searchCities = [];
        if (stateVal === 'Todos') {
            searchCities = []; // No city filter
        } else if (cityVal === 'Todas') {
            searchCities = (window.activeLocations && window.activeLocations.citiesByState[stateVal])
                || (catalogData && catalogData.citiesByState[stateVal])
                || [];
        } else {
            searchCities = [cityVal];
        }

        const criteria = {
            query: queryText,
            cities: searchCities,
            year: yearRaw ? (Number(yearRaw) || null) : null,
            transmission: transmissionVal,
            legal: legalVal,
            color: colorVal
        };

        // Mostrar spinner
        searchResults.innerHTML = '<div class="spinner" style="color: var(--primary-color); margin: 2rem auto; text-align: center;">Buscando vehículos...</div>';
        const originalBtnHTML = btnSearch.innerHTML;
        btnSearch.innerHTML = '<span class="material-symbols-rounded" style="animation: spin 1s linear infinite;">refresh</span>';
        btnSearch.disabled = true;

        const results = await db.search(criteria);

        btnSearch.innerHTML = originalBtnHTML;
        btnSearch.disabled = false;

        if (results.length === 0) {
            // Mostrar modal temporal
            showAlert('Por el momento no contamos con vehículos que coincidan con tu búsqueda. ¡Intenta ajustando los filtros o seleccionando otra ciudad!', 'Sin inventario disponible', 'info');
            setTimeout(() => {
                const alertModal = document.getElementById('custom-alert-modal');
                if (alertModal) alertModal.classList.remove('active');
            }, 3000); // Se cierra solo en 3 segundos

            // Y limpiar el HTML para que no queden cosas raras
            searchResults.innerHTML = '';
            return;
        }

        // Modo Enfoque: Ocultar filtros si hay resultados
        searchFiltersContainer.style.overflow = 'hidden';
        searchFiltersContainer.style.height = searchFiltersContainer.scrollHeight + 'px';
        void searchFiltersContainer.offsetWidth; // force reflow
        searchFiltersContainer.style.height = '0px';
        searchFiltersContainer.style.opacity = '0';
        searchFiltersContainer.style.pointerEvents = 'none';

        searchResults.innerHTML = results.map(l => createListingCardHTML(l, false)).join('');

        // Guardar contexto de búsqueda para el swipe en cascada (3 niveles) en fullscreen
        window.currentSearchContext = { criteria, level1: [...results], searchQuery: queryText };
        window.searchCascadeList = null; // Resetear para que se reconstruya al abrir la siguiente tarjeta
    });

    // ==========================================
    // HOOK DE NAVEGACIÓN EXCLUSIVA DE FAVORITOS
    // ==========================================
    function useFavoritesNavigationHook() {
        function getFavoriteListings() {
            const allLocal = (typeof db !== 'undefined' && db.getAllListings) ? db.getAllListings() : [];
            const allFeed = typeof window.activeFeedListings !== 'undefined' ? window.activeFeedListings : [];
            const allMap = new Map();
            [...allLocal, ...allFeed].forEach(l => {
                if (l && l.id) allMap.set(String(l.id), l);
            });
            const all = Array.from(allMap.values());
            const favIds = typeof savedListingsIds !== 'undefined' ? savedListingsIds : [];
            return all.filter(l => favIds.includes(Number(l.id)) && (l.status === 'autorizado' || (typeof db !== 'undefined' && db.isListingActive && db.isListingActive(l))));
        }

        return { getFavoriteListings };
    }
    window.useFavoritesNavigationHook = useFavoritesNavigationHook;

    // --- Saved / Library ---
    function renderSavedListings() {
        const allLocal = db.getAllListings();
        const allFeed = typeof window.activeFeedListings !== 'undefined' ? window.activeFeedListings : [];

        // Combinar ambas fuentes evitando duplicados
        const allMap = new Map();
        [...allLocal, ...allFeed].forEach(l => {
            allMap.set(String(l.id), l);
        });
        const all = Array.from(allMap.values());

        const saved = all.filter(l => savedListingsIds.includes(Number(l.id)) && l.status === 'autorizado');

        if (saved.length === 0) {
            savedListingsContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <span class="material-symbols-rounded">favorite_border</span>
                    <p>Aún no has guardado vehículos</p>
                </div>
            `;
        } else {
            savedListingsContainer.innerHTML = saved.map(l => createListingCardHTML(l, false)).join('');
        }
        
        if (typeof window.updateCompareButtonVisibility === 'function') {
            window.updateCompareButtonVisibility();
        }
    }

    // --- Modal de Publicación Vendida o No Disponible ---
    window.showUnavailableListingModal = function (type = 'sold') {
        const modal = document.getElementById('modal-unavailable-listing');
        const titleEl = document.getElementById('unavailable-modal-title');
        const msgEl = document.getElementById('unavailable-modal-message');
        const iconEl = document.getElementById('unavailable-modal-icon');
        const acceptBtn = document.getElementById('btn-unavailable-accept');

        if (!modal) return;

        if (type === 'sold') {
            if (titleEl) titleEl.textContent = '¡Este vehículo ya fue vendido!';
            if (msgEl) msgEl.textContent = 'El automóvil que intentas ver ya se ha vendido. Te invitamos a explorar las opciones activas disponibles en tu ciudad.';
            if (iconEl) iconEl.textContent = 'sell';
        } else {
            if (titleEl) titleEl.textContent = 'Publicación no disponible';
            if (msgEl) msgEl.textContent = 'El vehículo que intentas ver ya no se encuentra disponible o fue retirado. Te invitamos a explorar otras opciones en tu ciudad.';
            if (iconEl) iconEl.textContent = 'visibility_off';
        }

        modal.classList.add('active');

        if (acceptBtn) {
            acceptBtn.onclick = () => {
                modal.classList.remove('active');
                
                // Redirigir al usuario al INICIO
                const viewInicio = document.getElementById('view-inicio');
                const allViews = document.querySelectorAll('.view');
                allViews.forEach(v => v.classList.remove('active'));
                if (viewInicio) viewInicio.classList.add('active');

                const allNavItems = document.querySelectorAll('.nav-item');
                allNavItems.forEach(n => {
                    if (n.getAttribute('data-target') === 'view-inicio') {
                        n.classList.add('active');
                    } else {
                        n.classList.remove('active');
                    }
                });

                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        }
    };

    // --- Detalles ---
    window.openListingDetails = async function (id) {
        window.showListingDetails = window.openListingDetails;
        let listing = null;
        const strId = String(id);

        // 1. Buscar en Caché Local (Favoritos o Mis Anuncios)
        const allListings = db.getAllListings();
        listing = allListings.find(l => String(l.id) === strId);

        // 2. Buscar en Feed Activo (Paginado)
        if (!listing && typeof window.activeFeedListings !== 'undefined') {
            listing = window.activeFeedListings.find(l => String(l.id) === strId);
        }

        // 3. Buscar en contexto de búsqueda (si venimos de una búsqueda reciente)
        if (!listing && window.currentSearchContext && window.currentSearchContext.level1) {
            listing = window.currentSearchContext.level1.find(l => String(l.id) === strId);
        }

        // 4. Si aún no está, intentar buscar en Supabase directamente (fuente de la verdad)
        if (!listing && typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const queryId = !isNaN(strId) ? Number(strId) : strId;
                let { data, error } = await supabaseClient
                    .from('listings')
                    .select('*')
                    .eq('id', queryId)
                    .maybeSingle();

                if ((!data || error) && typeof queryId === 'number') {
                    const fallback = await supabaseClient
                        .from('listings')
                        .select('*')
                        .eq('id', strId)
                        .maybeSingle();
                    if (fallback.data && !fallback.error) {
                        data = fallback.data;
                        error = null;
                    }
                }

                if (data && !error) {
                    listing = {
                        ...data,
                        reactions: typeof data.reactions === 'string' ? (function(){ try { return JSON.parse(data.reactions); } catch(e) { return data.reactions; } })() : (data.reactions || { like: 0, love: 0, fire: 0, angry: 0 }),
                        notes: Array.isArray(data.notes) ? data.notes : (typeof data.notes === 'string' ? JSON.parse(data.notes || '[]') : []),
                        payments: Array.isArray(data.payments) ? data.payments : (typeof data.payments === 'string' ? JSON.parse(data.payments || '[]') : []),
                        isMyListing: data.publisher_id === window.db.uuid || data.publisherId === window.db.uuid
                    };

                    // Reconciliar con la memoria viva: si el usuario ya reaccionó en esta sesión,
                    // preferir esos datos para no resetear el contador al regresar a la tarjeta.
                    const liveItem = (typeof window.activeFeedListings !== 'undefined' && window.activeFeedListings.find(l => String(l.id) === strId))
                                  || (window.searchCascadeList && window.searchCascadeList.find(l => String(l.id) === strId))
                                  || (window.currentSearchContext && window.currentSearchContext.level1 && window.currentSearchContext.level1.find(l => String(l.id) === strId));
                    if (liveItem && liveItem.reactions && typeof liveItem.reactions === 'object') {
                        listing.reactions = liveItem.reactions;
                    }
                }
            } catch (err) {
                console.error("Error fetching individual listing:", err);
            }
        }

        // ── Reconciliación Universal de Reacciones ──
        // Sin importar de dónde se obtuvo el listing (localStorage, feed, búsqueda, Supabase),
        // SIEMPRE reconciliar con la memoria viva para que los contadores de emojis
        // no se reseteen al cambiar de tarjeta y regresar.
        if (listing) {
            const liveItemForReactions = 
                (typeof window.activeFeedListings !== 'undefined' && window.activeFeedListings.find(l => String(l.id) === strId))
                || (window.searchCascadeList && window.searchCascadeList.find(l => String(l.id) === strId))
                || (window.currentSearchContext && window.currentSearchContext.level1 && window.currentSearchContext.level1.find(l => String(l.id) === strId));
            
            if (liveItemForReactions && liveItemForReactions.reactions && typeof liveItemForReactions.reactions === 'object') {
                listing.reactions = liveItemForReactions.reactions;
            }
        }

        const isSold = listing && (
            String(listing.status || '').toLowerCase() === 'vendido' || 
            listing.sold_at || 
            listing.soldAt || 
            listing.isSold
        );
        const isUnavailable = !listing || String(listing.status || '').toLowerCase() === 'eliminado';

        if (isSold || isUnavailable) {
            if (typeof window.showUnavailableListingModal === 'function') {
                window.showUnavailableListingModal(isSold ? 'sold' : 'unavailable');
            }
            return;
        }

        // Incremento optimista de vistas para reflejo inmediato en pantalla si es nueva sesión
        let viewedThisSession = [];
        try {
            viewedThisSession = JSON.parse(sessionStorage.getItem('revista_autos_viewed_session') || '[]');
        } catch (e) { }

        if (!viewedThisSession.includes(strId)) {
            listing.views = (listing.views || 0) + 1;
            const liveItem = (typeof window.activeFeedListings !== 'undefined' && window.activeFeedListings.find(l => String(l.id) === strId))
                          || (window.searchCascadeList && window.searchCascadeList.find(l => String(l.id) === strId))
                          || (window.currentSearchContext && window.currentSearchContext.level1 && window.currentSearchContext.level1.find(l => String(l.id) === strId));
            if (liveItem) {
                liveItem.views = listing.views;
            }
        }

        // Incrementar vistas usando hook analítico en segundo plano
        if (typeof useAnalyticsHook === 'function') {
            useAnalyticsHook().incrementListingView(id).then(updatedViews => {
                if (updatedViews && updatedViews > listing.views) {
                    listing.views = updatedViews;
                    const viewEl = document.getElementById('detalle-views-count');
                    if (viewEl) viewEl.textContent = updatedViews;
                }
                updateStats();
            });
        } else if (typeof db !== 'undefined' && db && typeof db.incrementViews === 'function') {
            db.incrementViews(id).then(updatedViews => {
                if (updatedViews && updatedViews > listing.views) {
                    listing.views = updatedViews;
                    const viewEl = document.getElementById('detalle-views-count');
                    if (viewEl) viewEl.textContent = updatedViews;
                }
                updateStats();
            });
        }

        // Encontrar vista activa actual
        const activeView = Array.from(views).find(v => v.classList.contains('active') && v.id !== 'view-detalle');
        if (activeView) {
            previousViewId = activeView.id;

            const isAlreadyInDetalle = viewDetalle.classList.contains('active');
            if (!isAlreadyInDetalle) {
                // Guardamos el scroll de la ventana antes de mostrar la vista de detalle
                savedScrollPosition = window.scrollY || document.documentElement.scrollTop;
                window.detailSwipesCount = 0; // Reiniciar contador de deslizamientos al abrir desde catálogo
            }

            // Modo cascada: si viene de Búsqueda Avanzada, activar swipe en 3 niveles
            if (activeView.id === 'view-busqueda' && window.currentSearchContext) {
                // Construir la cola de 3 niveles (se construye una vez por búsqueda)
                if (!window.searchCascadeList) {
                    window.searchCascadeList = buildSearchSwipeQueue(id, window.currentSearchContext);
                }
            } else {
                // Viene de Inicio, Favoritos u otra sección: usar navegación normal
                window.searchCascadeList = null;
            }
        }

        const isSaved = savedListingsIds.includes(id);

        // Construir Contenido
        const images = listing.images || (listing.image ? [listing.image] : ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80']);
        const imageElements = images.map(img => `<img src="${img}" alt="Auto" loading="lazy">`).join('');

        let navArrows = '';
        if (images.length > 1) {
            navArrows = `
                <button class="carousel-nav-btn prev" style="display: none;" onclick="scrollCarousel(event, this, -1)"><span class="material-symbols-rounded">chevron_left</span></button>
                <button class="carousel-nav-btn next" onclick="scrollCarousel(event, this, 1)"><span class="material-symbols-rounded">chevron_right</span></button>
            `;
        }
        const hasPhone = (listing.phone || listing.whatsapp || listing.seller_phone || listing.seller_whatsapp) ? true : false;
        const hasFbUrl = listing.fb_chat_url ? true : false;
        
        let btnContactarHtml = '';
        if (!hasPhone && hasFbUrl) {
            btnContactarHtml = `<button class="btn-contactar fb-btn" onclick="window.contactSeller('${listing.id}')" style="margin-top: 0; padding: 10px 24px; font-size: 0.95rem; border-radius: 24px; flex-shrink: 0; width: auto; background: linear-gradient(135deg, #1877F2 0%, #0C5EBF 100%); box-shadow: 0 4px 15px rgba(24,119,242,0.3);">
                            <span class="material-symbols-rounded" style="font-size: 18px;">forum</span> Facebook
                          </button>`;
        } else {
            btnContactarHtml = `<button class="btn-contactar" onclick="window.contactSeller('${listing.id}')" style="margin-top: 0; padding: 10px 24px; font-size: 0.95rem; border-radius: 24px; flex-shrink: 0; width: auto;">
                            <span class="material-symbols-rounded" style="font-size: 18px;">chat</span> Contactar
                          </button>`;
        }

        detalleContent.innerHTML = `
            <button class="global-nav-btn prev desktop-only-btn" onclick="event.stopPropagation(); if(window.navigateListingGlobal) window.navigateListingGlobal(-1);"><span class="material-symbols-rounded">arrow_back_ios_new</span></button>
            <button class="global-nav-btn next desktop-only-btn" onclick="event.stopPropagation(); if(window.navigateListingGlobal) window.navigateListingGlobal(1);"><span class="material-symbols-rounded">arrow_forward_ios</span></button>
            <div style="position: relative; width: 100%; height: 100%; border-radius: 0 0 16px 16px; overflow: hidden;">
                <div class="detalle-img-carousel" onscroll="updateCounter(this)" ondblclick="window.handleDoubleTapLike(event, '${listing.id}')">
                    ${imageElements}
                </div>
                ${navArrows}
                ${images.length > 1 ? `<div class="image-counter" style="position: absolute; bottom: 8px; right: 8px;">1 / ${images.length}</div>` : ''}
                
                ${window.generateSocialToolbarHTML ? window.generateSocialToolbarHTML(listing.id, listing.reactions, listing.views, listing.title, listing.price, listing.city) : ''}
                
                <button id="detalle-heart-btn-${id}" class="detalle-floating-btn ${isSaved ? 'saved' : ''}" onclick="event.stopPropagation(); window.toggleSaveDetalle('${id}', this)" style="right: 16px; color: ${isSaved ? '#EF4444' : 'white'}; z-index: 100; transition: color 0.3s ease;">
                    <span class="material-symbols-rounded" style="font-variation-settings: 'FILL' ${isSaved ? '1' : '0'};">${isSaved ? 'favorite' : 'favorite_border'}</span>
                </button>
            </div>
            <div class="detalle-info">
                <h2 class="detalle-title">${listing.title}</h2>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 12px;">
                    <div>
                        <div class="detalle-price" style="margin-bottom: 0;">
                            ${usePriceFormatterHook(listing)}
                        </div>
                        <div class="detalle-city-pulsing"><span class="material-symbols-rounded">location_on</span> ${listing.city}</div>
                    </div>
                    ${btnContactarHtml}
                </div>
                
                <div class="detalle-grid">
                    <div class="detalle-item">
                        <span class="detalle-label">Marca</span>
                        <span class="detalle-value">${listing.make}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Modelo</span>
                        <span class="detalle-value">${listing.model}</span>
                    </div>
                    ${listing.trim ? `
                    <div class="detalle-item">
                        <span class="detalle-label">Versión</span>
                        <span class="detalle-value">${listing.trim}</span>
                    </div>` : ''}
                    <div class="detalle-item">
                        <span class="detalle-label">Año</span>
                        <span class="detalle-value">${listing.year}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Motor</span>
                        <span class="detalle-value">${listing.engine || '-'}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Transmisión</span>
                        <span class="detalle-value">${listing.transmission || '-'}</span>
                    </div>
                    ${listing.box ? `
                    <div class="detalle-item">
                        <span class="detalle-label">Caja</span>
                        <span class="detalle-value">${listing.box}</span>
                    </div>` : ''}
                    <div class="detalle-item">
                        <span class="detalle-label">Kilometraje</span>
                        <span class="detalle-value">${useMileageFormatterHook(listing.mileage)}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Situación</span>
                        <span class="detalle-value">${listing.legal || '-'}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">A/C</span>
                        <span class="detalle-value">${listing.ac || '-'}</span>
                    </div>
                    <div class="detalle-item" style="grid-column: 2 / span 2; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end;">
                        <span class="detalle-label" style="text-transform: uppercase;">Vistas</span>
                        <span class="detalle-value" style="font-size: 1.1rem; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                            <span class="material-symbols-rounded" style="font-size:18px;">visibility</span> <span id="detalle-views-count">${listing.views || 0}</span>
                        </span>
                    </div>
                </div>
            </div>
        `;

        // Habilitar pinch zoom en estas imágenes
        const imgs = detalleContent.querySelectorAll('.detalle-img-carousel img');
        imgs.forEach(img => window.enablePinchZoom(img));

        // Mostrar Vista (Como Modal/Overlay para no perder el scroll del fondo)
        views.forEach(v => {
            if (v.id !== previousViewId) v.classList.remove('active');
        });

        viewDetalle.style.position = 'fixed';
        viewDetalle.style.top = '0';
        viewDetalle.style.left = '0';
        viewDetalle.style.width = '100%';
        viewDetalle.style.height = '100vh';
        viewDetalle.style.zIndex = '900';
        viewDetalle.style.overflowY = 'auto';
        viewDetalle.style.backgroundColor = 'var(--bg-color)';

        viewDetalle.classList.add('active');
        history.pushState({ page: 'listing-details' }, '');

        const carousel = detalleContent.querySelector('.detalle-img-carousel');
        if (carousel && images.length > 1) {
            carousel.addEventListener('touchstart', window.stopFullscreenAutoplay, { passive: true });
            carousel.addEventListener('mousedown', window.stopFullscreenAutoplay);
            window.startFullscreenAutoplay(false, images.length);
        }

    function showMobileSwipeHintIfNeeded(container) {
        if (!container) return;
        // Solo mostrar una vez por sesión en la primera tarjeta fullscreen abierta
        if (sessionStorage.getItem('revistauto_swipe_hint_seen')) return;

        // Estrictamente solo para pantallas de móvil (ancho <= 768px). Nunca en PC.
        if (window.innerWidth > 768) return;

        // Marcar como visto inmediatamente para que NUNCA vuelva a salir en la sesión
        sessionStorage.setItem('revistauto_swipe_hint_seen', 'true');

        // Crear el elemento flotante de ayuda
        const hintEl = document.createElement('div');
        hintEl.className = 'mobile-swipe-hint-toast';
        hintEl.innerHTML = `
            <div class="swipe-hand-icon">
                <span class="material-symbols-rounded">touch_app</span>
            </div>
            <span class="swipe-text">Desliza aquí para el siguiente auto</span>
        `;

        container.appendChild(hintEl);

        let dismissed = false;
        const dismissHint = () => {
            if (dismissed) return;
            dismissed = true;
            hintEl.classList.add('fade-out');
            setTimeout(() => {
                if (hintEl && hintEl.parentNode) {
                    hintEl.parentNode.removeChild(hintEl);
                }
            }, 400);
        };

        const timer = setTimeout(dismissHint, 3200);

        const onUserTouch = () => {
            clearTimeout(timer);
            dismissHint();
            window.removeEventListener('touchstart', onUserTouch);
        };
        window.addEventListener('touchstart', onUserTouch, { passive: true, once: true });
    }

    // Lógica de Swipe para navegar entre autos de la misma categoría
    const infoDiv = detalleContent.querySelector('.detalle-info');
    if (infoDiv) {
        showMobileSwipeHintIfNeeded(infoDiv);
        let startX = 0;
            let startY = 0;
            let endX = 0;
            let endY = 0;

            infoDiv.addEventListener('touchstart', (e) => {
                startX = e.changedTouches[0].screenX;
                startY = e.changedTouches[0].screenY;
            }, { passive: true });

            infoDiv.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].screenX;
                endY = e.changedTouches[0].screenY;

                const diffX = Math.abs(endX - startX);
                const diffY = Math.abs(endY - startY);
                const threshold = 50; // mínimo movimiento en píxeles

                // Solo navegamos si es un gesto predominantemente HORIZONTAL (ignorar scroll vertical)
                if (diffX > threshold && diffX > diffY) {
                    if (endX < startX - threshold) {
                        // Swipe Izquierda -> Siguiente
                        navigateListing(1);
                    } else if (endX > startX + threshold) {
                        // Swipe Derecha -> Anterior
                        navigateListing(-1);
                    }
                }
            }, { passive: true });

            const navigateListing = (direction) => {
                let sameCategoryListings = [];
                if (previousViewId === 'view-biblioteca') {
                    // Si el usuario viene de la sección de Favoritos, deslizar únicamente entre sus vehículos guardados
                    const favHook = typeof window.useFavoritesNavigationHook === 'function' ? window.useFavoritesNavigationHook() : null;
                    sameCategoryListings = favHook ? favHook.getFavoriteListings() : [];
                } else if (window.searchCascadeList && window.searchCascadeList.length > 0) {
                    // Usar la cola de 3 niveles construida desde la búsqueda avanzada
                    sameCategoryListings = window.searchCascadeList;
                } else {
                    // Combinar autos locales (favoritos/mis anuncios) con el feed activo (paginado)
                    const localListings = db.getAllListings().filter(l => db.isListingActive(l));
                    const feedListings = typeof window.activeFeedListings !== 'undefined' ? window.activeFeedListings : [];

                    // Unir evitando duplicados por ID
                    const allAvailable = [...localListings];
                    feedListings.forEach(fl => {
                        if (!allAvailable.some(al => String(al.id) === String(fl.id))) {
                            allAvailable.push(fl);
                        }
                    });

                    const matchTargetType = (listing.type === 'Camioneta') ? 'SUV / Camioneta' : listing.type;
                    sameCategoryListings = allAvailable.filter(l => {
                        const lType = (l.type === 'Camioneta') ? 'SUV / Camioneta' : l.type;
                        return lType === matchTargetType;
                    });
                    if (typeof selectedCities !== 'undefined' && selectedCities.length > 0) {
                        sameCategoryListings = sameCategoryListings.filter(l => selectedCities.includes(l.city));
                    }
                }

                if (sameCategoryListings.length <= 1) return;

                const currentIndex = sameCategoryListings.findIndex(l => String(l.id) === String(listing.id));
                if (currentIndex === -1) return;

                let nextIndex = currentIndex + direction;
                if (nextIndex >= sameCategoryListings.length) nextIndex = 0; // Vuelve al principio
                if (nextIndex < 0) nextIndex = sameCategoryListings.length - 1; // Va al final

                // Inserción de publicidad según la frecuencia configurada al deslizar entre vehículos
                window.detailSwipesCount = (window.detailSwipesCount || 0) + 1;
                const freq = db.adFrequencyScroll || 10;

                if (db.adsEnabled && (window.detailSwipesCount % freq === 0)) {
                    window.detailSwipesCount = 0; // Reiniciar contador siempre al alcanzar la frecuencia
                    const activeCities = (selectedCities && selectedCities.length > 0) ? selectedCities : null;
                    const adPool = db.getRandomAds(1, activeCities, false) || []; // false = Excluir fallback "Anúnciate Aquí"
                    if (adPool.length > 0 && adPool[0]) {
                        const ad = adPool[0];
                        window.pendingNextListingIdAfterAd = sameCategoryListings[nextIndex].id;
                        window.pendingPrevListingIdAfterAd = sameCategoryListings[currentIndex].id;

                        // Misma animación que auto→auto: salida del auto, entrada del anuncio
                        const animOutClass = direction === 1 ? 'slide-out-left' : 'slide-out-right';
                        const animInClass = direction === 1 ? 'slide-in-right' : 'slide-in-left';
                        detalleContent.classList.add(animOutClass);

                        setTimeout(() => {
                            // NO quitamos animOutClass aquí — el auto queda fuera de pantalla
                            // sin parpadear mientras el modal del anuncio carga
                            const adModal = document.getElementById('ad-fullscreen-modal');
                            const contentDiv = adModal && (adModal.querySelector('.modal-content') || adModal.querySelector('.detalle-wrapper'));

                            // Preparar animación ANTES de que el modal sea visible
                            if (contentDiv) {
                                contentDiv.classList.add(animInClass);
                            }

                            window.openAdDetails(ad.id).then(() => {
                                // Ahora el modal ya cubre la pantalla: reset del auto sin que se vea
                                detalleContent.classList.remove(animOutClass);
                                if (contentDiv) {
                                    setTimeout(() => contentDiv.classList.remove(animInClass), 260);
                                }
                            });
                        }, 200);
                        return;
                    }
                }

                const nextId = sameCategoryListings[nextIndex].id;
                const animOutClass = direction === 1 ? 'slide-out-left' : 'slide-out-right';
                const animInClass = direction === 1 ? 'slide-in-right' : 'slide-in-left';

                detalleContent.classList.add(animOutClass);

                setTimeout(() => {
                    detalleContent.classList.remove(animOutClass);
                    window.openListingDetails(nextId);

                    const newDetalleContent = document.getElementById('detalle-content');
                    if (newDetalleContent) {
                        newDetalleContent.classList.add(animInClass);
                        setTimeout(() => {
                            newDetalleContent.classList.remove(animInClass);
                        }, 260); // Clean up after animation finishes
                    }
                }, 200); // Load new data while previous is sliding out
            };
            window.navigateListingGlobal = navigateListing;
        }
    };

    window.closeListingDetails = function () {
        if (window.stopFullscreenAutoplay) window.stopFullscreenAutoplay();
        const viewDetalle = document.getElementById('view-detalle');
        if (viewDetalle) viewDetalle.classList.remove('active');

        // No necesitamos volver a agregar .active al prev porque nunca se le quitó
        if (previousViewId === 'view-biblioteca') renderSavedListings();

                        // Sincronizar el estado del historial si tenía abierto el detalle
        if (history.state && history.state.page === 'listing-details') {
            try { history.replaceState({ page: 'root' }, ''); } catch (e) { }
        }

        // Restaurar el scroll (por seguridad, aunque el fondo nunca se ocultó)
        requestAnimationFrame(() => {
            window.scrollTo(0, savedScrollPosition);
        });
    };

    window.enablePinchZoom = function (imgElement) {
        if (!imgElement || imgElement.dataset.pinchZoomEnabled) return;
        imgElement.dataset.pinchZoomEnabled = 'true';

        let initialDistance = 0;
        let initialMidX = 0;
        let initialMidY = 0;
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isPinching = false;

        imgElement.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                isPinching = true;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                initialDistance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );

                initialMidX = (touch1.clientX + touch2.clientX) / 2;
                initialMidY = (touch1.clientY + touch2.clientY) / 2;

                imgElement.style.transition = 'none';
                imgElement.style.zIndex = '1000';
                imgElement.style.position = 'relative';
            }
        }, { passive: false });

        imgElement.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && isPinching) {
                e.preventDefault();
                e.stopPropagation();

                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                const currentDistance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );

                const currentMidX = (touch1.clientX + touch2.clientX) / 2;
                const currentMidY = (touch1.clientY + touch2.clientY) / 2;

                // Calcular escala (zoom entre 1x y 4x)
                if (initialDistance > 0) {
                    scale = Math.min(Math.max(1, currentDistance / initialDistance), 4);
                }

                // Calcular desplazamiento 2D siguiendo el punto medio de los 2 dedos
                translateX = (currentMidX - initialMidX) / scale;
                translateY = (currentMidY - initialMidY) / scale;

                // Aplicar transformación 2D (zoom enfocado + desplazamiento)
                imgElement.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
            }
        }, { passive: false });

        const resetZoom = () => {
            if (!isPinching) return;
            isPinching = false;
            scale = 1;
            translateX = 0;
            translateY = 0;
            initialDistance = 0;

            // Transición de regreso suave al tamaño y posición original (1x centrado)
            imgElement.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
            imgElement.style.transform = 'scale(1) translate(0px, 0px)';

            setTimeout(() => {
                if (!isPinching) {
                    imgElement.style.zIndex = '';
                    imgElement.style.position = '';
                    imgElement.style.transform = '';
                    imgElement.style.transition = '';
                }
            }, 300);
        };

        imgElement.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                resetZoom();
            }
        });

        imgElement.addEventListener('touchcancel', (e) => {
            resetZoom();
        });
    };

    window.openFacebookApp = function(url) {
        if (!url) return;
        if (window.innerWidth >= 768) {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isAndroid = /Android/.test(navigator.userAgent);
        
        let deepLink = url;
        let isFB = url.includes('facebook.com') || url.includes('fb.me');
        
        if (isFB) {
            if (isIOS) {
                deepLink = 'fb://facewebmodal/f?href=' + encodeURIComponent(url);
            } else if (isAndroid) {
                deepLink = 'intent://facewebmodal/f?href=' + encodeURIComponent(url) + '#Intent;package=com.facebook.katana;scheme=fb;end';
            }
        }

        // Timer para detectar si la app no está instalada (fallback a la página web)
        const fallbackTimer = setTimeout(() => {
            window.location.href = url;
        }, 1500);

        // Al salir de la app, pausar el timer
        const blurHandler = () => clearTimeout(fallbackTimer);
        window.addEventListener('blur', blurHandler, { once: true });
        
        window.location.href = deepLink;
    };

    window.contactSeller = function (listingId) {
        const strId = String(listingId);
        let listing = db.getAllListings().find(l => String(l.id) === strId);

        if (!listing && typeof window.activeFeedListings !== 'undefined') {
            listing = window.activeFeedListings.find(l => String(l.id) === strId);
        }
        if (!listing && window.currentSearchContext && window.currentSearchContext.level1) {
            listing = window.currentSearchContext.level1.find(l => String(l.id) === strId);
        }

        if (listing) {
            let actualPhone = listing.phone || listing.whatsapp || listing.seller_phone || listing.seller_whatsapp;
            let fbChatUrl = listing.fb_chat_url;
            
            if (!actualPhone && fbChatUrl) {
                window.openFacebookApp(fbChatUrl);
                return;
            }
            
            let phone = actualPhone || "5512345678";
            if (phone) {
                const phoneData = parseAndFormatPhone(phone, listing);
                const waData = parseAndFormatPhone(listing.whatsapp || phone, listing);
                const waClean = waData.prefix.replace('+', '') + waData.nationalDigits;
                const message = encodeURIComponent(`Hola, vi tu anuncio "${listing.title}" en RevistAuto. Me interesa y quisiera más información.`);

                const btnCall = document.getElementById('btn-contact-call');
                const btnWhatsApp = document.getElementById('btn-contact-whatsapp');
                const btnFacebook = document.getElementById('btn-contact-facebook');

                if (window.innerWidth >= 768) {
                    btnCall.innerHTML = `<span class="material-symbols-rounded">phone_iphone</span> ${phoneData.displayFormatted}`;
                    btnCall.style.cursor = 'pointer';
                    btnCall.onclick = () => {
                        window.open(phoneData.telUrl, '_self');
                        document.getElementById('contact-modal').classList.remove('active');
                    };
                } else {
                    btnCall.innerHTML = `<span class="material-symbols-rounded">call</span> Llamar`;
                    btnCall.style.cursor = 'pointer';
                    btnCall.onclick = () => {
                        window.open(phoneData.telUrl, '_self');
                        document.getElementById('contact-modal').classList.remove('active');
                    };
                }

                btnWhatsApp.onclick = () => {
                    window.open(`https://wa.me/${waClean}?text=${message}`, '_blank');
                    document.getElementById('contact-modal').classList.remove('active');
                };

                if (btnFacebook) {
                    if (fbChatUrl) {
                        btnFacebook.style.display = 'flex';
                        btnFacebook.onclick = () => {
                            window.openFacebookApp(fbChatUrl);
                            document.getElementById('contact-modal').classList.remove('active');
                        };
                    } else {
                        btnFacebook.style.display = 'none';
                    }
                }

                document.getElementById('contact-modal').classList.add('active');
            } else {
                showAlert('El vendedor de este vehículo no ha registrado un número de contacto.', 'Sin Contacto', 'info');
            }
        }
    };
    function showFavoriteToast() {
        const existing = document.getElementById('favorite-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'favorite-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '80px'; // Un poco más arriba para que no lo tape el navbar en móvil
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        toast.style.backgroundColor = 'rgba(16, 185, 129, 0.95)'; // Verde esmeralda moderno
        toast.style.backdropFilter = 'blur(10px)';
        toast.style.color = 'white';
        toast.style.padding = '14px 28px';
        toast.style.borderRadius = '50px';
        toast.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.4)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '10px';
        toast.style.zIndex = '999999';
        toast.style.fontFamily = "'Inter', sans-serif";
        toast.style.fontWeight = '600';
        toast.style.fontSize = '15px';
        toast.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Animación de rebote suave
        toast.style.opacity = '0';

        toast.innerHTML = `
            <span class="material-symbols-rounded" style="font-variation-settings: 'FILL' 1; font-size: 22px;">favorite</span>
            Añadido a tus favoritos
        `;

        document.body.appendChild(toast);

        // Trigger enter animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.style.transform = 'translateX(-50%) translateY(0)';
                toast.style.opacity = '1';
            });
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(20px) scale(0.9)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 500);
        }, 2500);
    }

    window.toggleSaveDetalle = function (id, btnElement) {
        id = Number(id); // Convertir a número para la comparación
        window.toggleSave(id, btnElement);
        const isSaved = savedListingsIds.includes(id);

        // Forzar estilos sobre el botón para garantizar que se pinte
        btnElement.style.color = isSaved ? '#EF4444' : 'white';
        btnElement.style.borderColor = isSaved ? '#EF4444' : 'rgba(255, 255, 255, 0.3)';

        const icon = btnElement.querySelector('.material-symbols-rounded');
        if (icon) {
            if (isSaved) {
                icon.innerHTML = 'favorite'; // Asegura que se use el icono relleno
                icon.style.fontVariationSettings = "'FILL' 1";
                icon.style.color = '#EF4444'; // Forzar color en el ícono
                showFavoriteToast();
            } else {
                icon.innerHTML = 'favorite_border';
                icon.style.fontVariationSettings = "'FILL' 0";
                icon.style.color = 'white';
            }
        }
    };

    // --- My Listings (Alta) ---
    function renderMyListings() {
        const myListings = db.getMyListings();
        const myAds = db.getMyAds ? db.getMyAds() : [];

        const statusPriority = {
            'pendiente autorizacion': 1,
            'autorizado': 2,
            'vendido': 3
        };

        myListings.sort((a, b) => (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99));

        let vehiclesHTML = '';
        let adsHTML = '';

        if (myListings.length === 0) {
            vehiclesHTML = '<p style="color:var(--text-muted); text-align:center;">No has publicado ningún vehículo.</p>';
        } else {
            vehiclesHTML = myListings.map(listing => {
                const images = listing.images || (listing.image ? [listing.image] : []);
                const imgHTML = images.length > 0 ? images.map(img => `<img src="${img}" alt="Auto" class="my-listing-img" style="flex: 0 0 100%; width: 100%; height: 100%; object-fit: cover; scroll-snap-align: start;">`).join('') : '';

                let displayStatus = listing.status.toUpperCase();
                let statusColorClass = `status-${listing.status.replace(' ', '-')}`;
                let priceTextHTML = '';

                let paymentBtnHTML = '';

                if (listing.status === 'pendiente autorizacion') {
                    const payInfo = getListingPaymentInfo(listing);
                    priceTextHTML = `<p style="font-size: 0.75rem; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; color: var(--danger-color); margin-top: 6px; font-weight: 500; letter-spacing: 0.3px; opacity: 0.9;">${payInfo.textDesc}</p>`;
                    if (globalMpEnabled && listing.paymentStatus === 'pending' && payInfo.calculatedPrice > 0) {
                        paymentBtnHTML = `<button class="primary-btn" onclick="window.openedFromDashboard=true; openMercadoPagoBrick(${listing.id}, false)" style="background:var(--primary-color); padding: 8px 16px; margin-bottom: 8px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;"><span class="material-symbols-rounded" style="font-size:18px;">credit_card</span> Pagar Ahora</button>`;
                    }
                } else if (listing.status === 'autorizado' || listing.status === 'activo') {
                    const now = new Date();

                    // Usamos expiresAt si existe, si no caemos en la lógica anterior (lastRenewedMonth)
                    if (listing.expiresAt) {
                        const expDate = new Date(listing.expiresAt);
                        if (now > expDate) {
                            displayStatus = 'CADUCADO';
                            statusColorClass = 'status-caducado';
                            if (globalMpEnabled) {
                                paymentBtnHTML = `<button class="primary-btn" onclick="openMercadoPagoBrick(${listing.id}, true)" style="background:var(--primary-color); padding: 8px 16px; margin-bottom: 8px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;"><span class="material-symbols-rounded" style="font-size:18px;">autorenew</span> Renovar con Tarjeta</button>`;
                            }
                        } else {
                            // Avisar 5 dias antes
                            const diffTime = Math.abs(expDate - now);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays <= 5) {
                                displayStatus = 'RENOVAR PRONTO';
                                statusColorClass = 'status-renovar';
                                if (globalMpEnabled) {
                                    paymentBtnHTML = `<button class="primary-btn" onclick="openMercadoPagoBrick(${listing.id}, true)" style="background:var(--primary-color); padding: 8px 16px; margin-bottom: 8px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;"><span class="material-symbols-rounded" style="font-size:18px;">autorenew</span> Renovar con Tarjeta</button>`;
                                }
                            } else {
                                displayStatus = 'ACTIVO';
                                statusColorClass = 'status-autorizado';
                            }
                        }
                    } else {
                        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                        if (listing.lastRenewedMonth) {
                            if (listing.lastRenewedMonth < currentMonthStr) {
                                displayStatus = 'CADUCADO';
                                statusColorClass = 'status-caducado';
                                if (globalMpEnabled) paymentBtnHTML = `<button class="primary-btn" onclick="openMercadoPagoBrick(${listing.id}, true)" style="background:var(--primary-color); padding: 8px 16px; margin-bottom: 8px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;"><span class="material-symbols-rounded" style="font-size:18px;">autorenew</span> Renovar con Tarjeta</button>`;
                            } else if (listing.lastRenewedMonth === currentMonthStr) {
                                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                                if (now.getDate() >= daysInMonth - 5) {
                                    displayStatus = 'RENOVAR PRONTO';
                                    statusColorClass = 'status-renovar';
                                    if (globalMpEnabled) paymentBtnHTML = `<button class="primary-btn" onclick="openMercadoPagoBrick(${listing.id}, true)" style="background:var(--primary-color); padding: 8px 16px; margin-bottom: 8px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;"><span class="material-symbols-rounded" style="font-size:18px;">autorenew</span> Renovar con Tarjeta</button>`;
                                }
                            }
                        }
                    }
                }

                // Mostrar fecha de vencimiento solo si está activo (no caducado y no pendiente)
                let publishedDateHTML = '';
                if (listing.expiresAt && displayStatus !== 'CADUCADO' && listing.status !== 'pendiente autorizacion') {
                    const expDate = new Date(listing.expiresAt);
                    const expDateStr = expDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
                    publishedDateHTML = `<p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;"><span class="material-symbols-rounded" style="font-size:13px; vertical-align: middle;">calendar_today</span> Vence el ${expDateStr}</p>`;
                }

                const refNum = listing.ref_number || (String(listing.id).length >= 5 ? String(listing.id).slice(-5) : listing.id);

                return `
            <div class="my-listing-card" style="cursor: pointer;" onclick="if(!event.target.closest('button')) openListingDetails(${listing.id})">
                <div class="card-img-carousel" style="width:100px; height:100px; flex-shrink:0; background:#000;">
                    ${imgHTML}
                </div>
                <div class="my-listing-info">
                    <h4 class="my-listing-title">${listing.title || `${listing.make} ${listing.model} ${listing.year}`}</h4>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Ref: #${refNum}</div>
                    <p style="color: var(--primary-color); font-weight: bold; margin-bottom: 4px; display: flex; align-items: baseline; white-space: nowrap; gap: 4px;">
                        ${usePriceFormatterHook(listing)}
                    </p>
                    <span class="status-badge ${statusColorClass}" style="${statusColorClass === 'status-caducado' ? 'background: var(--danger-color);' : (statusColorClass === 'status-renovar' ? 'background: #f59e0b;' : '')}">${displayStatus}</span>
                    ${priceTextHTML}
                    ${publishedDateHTML}
                </div>
                <div class="my-listing-actions" style="flex-direction: column;">
                    ${paymentBtnHTML}
                    <div style="display: flex; gap: 8px; width: 100%; flex-wrap: wrap;">
                        ${(listing.status === 'autorizado' || listing.status === 'activo') ? `<button class="success-btn" onclick="confirmMarkAsSold(${listing.id})" style="flex: 1; min-width: 60px; padding: 8px;">Vendido</button>` : ''}
                        <button class="primary-btn" onclick="openEditListing(${listing.id})" style="background:var(--surface-light); padding: 8px; flex: 1; min-width: 60px;">Editar</button>
                        <button class="danger-btn" onclick="deleteListing(${listing.id})" style="padding: 8px; flex: 1; min-width: 60px;">Eliminar</button>
                    </div>
                </div>
            </div>
        `}).join('');
        }

        if (myAds.length === 0) {
            adsHTML = '<p style="color:var(--text-muted); text-align:center;">No has publicado ningún anuncio publicitario.</p>';
        } else {
            adsHTML = myAds.map(ad => {
                const firstImg = (ad.images && ad.images.length > 0) ? ad.images[0] : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80';

                let displayStatus = 'PENDIENTE PAGO';
                let statusColorClass = 'status-pendiente';
                let paymentBtnHTML = '';

                if (ad.payment_status === 'pendiente') {
                    displayStatus = 'PENDIENTE PAGO';
                    statusColorClass = 'status-pendiente';
                    if (globalMpEnabled) {
                        paymentBtnHTML = `<button class="primary-btn" onclick="window.openedFromDashboard=true; openMercadoPagoBrickAd(${ad.id})" style="background:var(--primary-color); padding: 8px 16px; margin-bottom: 8px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;"><span class="material-symbols-rounded" style="font-size:18px;">credit_card</span> Pagar Ahora</button>`;
                    }
                } else if (ad.is_active === false) {
                    displayStatus = 'INACTIVO';
                    statusColorClass = 'status-caducado';
                } else {
                    const now = new Date();
                    if (ad.end_date) {
                        const expDate = new Date(ad.end_date);
                        if (now > expDate) {
                            displayStatus = 'CADUCADO';
                            statusColorClass = 'status-caducado';
                            if (globalMpEnabled) {
                                paymentBtnHTML = `<button class="primary-btn" onclick="openMercadoPagoBrickAd(${ad.id})" style="background:var(--primary-color); padding: 8px 16px; margin-bottom: 8px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;"><span class="material-symbols-rounded" style="font-size:18px;">autorenew</span> Renovar con Tarjeta</button>`;
                            }
                        } else {
                            displayStatus = 'ACTIVO';
                            statusColorClass = 'status-autorizado';
                        }
                    } else {
                        displayStatus = 'ACTIVO';
                        statusColorClass = 'status-autorizado';
                    }
                }

                let publishedDateHTML = '';
                if (ad.end_date && displayStatus !== 'CADUCADO' && displayStatus !== 'PENDIENTE PAGO') {
                    const expDate = new Date(ad.end_date);
                    const expDateStr = expDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
                    publishedDateHTML = `<p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;"><span class="material-symbols-rounded" style="font-size:13px; vertical-align: middle;">calendar_today</span> Vence el ${expDateStr}</p>`;
                }

                let priceTextHTML = '';
                if (displayStatus === 'PENDIENTE PAGO' || displayStatus === 'CADUCADO') {
                    const priceToPay = window.useAdPricingHook ? window.useAdPricingHook.getAdPrice(ad) : (typeof globalAdMonthlyPrice !== 'undefined' ? globalAdMonthlyPrice : 500);
                    priceTextHTML = `<p style="font-size: 0.78rem; color: var(--danger-color); margin-top: 4px; font-weight: 500;">Total a pagar: $${Number(priceToPay).toFixed(2)} MXN (1 mes)</p>`;
                }

                return `
                    <div class="my-listing-card" style="cursor: pointer;" onclick="if(!event.target.closest('button')) window.openAdDetails('${ad.id}')">
                        <div class="card-img-carousel" style="width:100px; height:100px; flex-shrink:0; background:#000;">
                            <img src="${firstImg}" alt="Ad" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div class="my-listing-info">
                            <h4 class="my-listing-title">${ad.title}</h4>
                            ${ad.ref_number ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Ref: #${ad.ref_number}</div>` : ''}
                            <div style="display: flex; gap: 12px; margin-bottom: 4px; font-size: 0.85rem; color: var(--text-muted);">
                                <span style="display: flex; align-items: center; gap: 4px;"><span class="material-symbols-rounded" style="font-size: 16px;">visibility</span> ${ad.views || 0} vistas</span>
                                <span style="display: flex; align-items: center; gap: 4px; color: var(--primary-color);"><span class="material-symbols-rounded" style="font-size: 16px;">ads_click</span> ${ad.clicks || 0} clics</span>
                            </div>
                            <span class="status-badge ${statusColorClass}" style="${statusColorClass === 'status-caducado' ? 'background: var(--danger-color);' : (statusColorClass === 'status-pendiente' ? 'background: #f59e0b; color: white;' : '')}">${displayStatus}</span>
                            ${priceTextHTML}
                            ${publishedDateHTML}
                        </div>
                        <div class="my-listing-actions" style="flex-direction: column;">
                            ${paymentBtnHTML}
                            <div style="display: flex; gap: 8px; width: 100%; flex-wrap: wrap;">
                                <button class="primary-btn" onclick="window.openEditAd(${ad.id})" style="background:var(--surface-light); padding: 8px; flex: 1; min-width: 60px;">Editar</button>
                                <button class="danger-btn" onclick="window.deleteMyAd(${ad.id})" style="padding: 8px; flex: 1; min-width: 60px;">Eliminar</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const combinedHTML = `
            <div class="publications-split-layout">
                <div class="pub-col">
                    <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-main);">Mis Vehículos</h3>
                    <button class="primary-btn desktop-only-btn" onclick="document.getElementById('btn-new-listing').click()" style="margin-bottom: 16px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;"><span class="material-symbols-rounded">add</span> Nuevo Vehículo</button>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        ${vehiclesHTML}
                    </div>
                </div>
                <div class="pub-col pub-col-ads">
                    <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-main);">Mis Anuncios Publicitarios</h3>
                    ${(window.db && window.db.adsEnabled === false) ? '' : `<button class="primary-btn desktop-only-btn" onclick="if(window.openClientAdModal) window.openClientAdModal();" style="margin-bottom: 16px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;"><span class="material-symbols-rounded">add</span> Nueva Publicidad</button>`}
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        ${adsHTML}
                    </div>
                </div>
            </div>
        `;
        const stateKey = JSON.stringify(myListings) + '_' + JSON.stringify(myAds);
        if (myListingsContainer.dataset.lastState === stateKey) return;
        myListingsContainer.dataset.lastState = stateKey;

        myListingsContainer.innerHTML = combinedHTML;
    }

    let listingToSoldId = null;
    const soldModal = document.getElementById('sold-modal');
    const btnSoldYes = document.getElementById('btn-sold-yes');
    const btnSoldNo = document.getElementById('btn-sold-no');

    window.confirmMarkAsSold = function (id) {
        listingToSoldId = id;
        if (soldModal) soldModal.classList.add('active');
    };

    if (btnSoldNo) {
        btnSoldNo.addEventListener('click', () => {
            listingToSoldId = null;
            soldModal.classList.remove('active');
        });
    }

    if (btnSoldYes) {
        btnSoldYes.addEventListener('click', () => {
            if (listingToSoldId) {
                db.markAsSold(listingToSoldId);
                renderMyListings();
                updateStats();
                listingToSoldId = null;
                soldModal.classList.remove('active');
            }
        });
    }

    let listingToDeleteId = null;
    const deleteModal = document.getElementById('delete-modal');
    const btnDeleteYes = document.getElementById('btn-delete-yes');
    const btnDeleteNo = document.getElementById('btn-delete-no');

    window.deleteListing = function (id) {
        listingToDeleteId = id;
        if (deleteModal) deleteModal.classList.add('active');
    };

    if (btnDeleteNo) {
        btnDeleteNo.addEventListener('click', () => {
            listingToDeleteId = null;
            deleteModal.classList.remove('active');
        });
    }

    if (btnDeleteYes) {
        btnDeleteYes.addEventListener('click', async () => {
            if (listingToDeleteId) {
                const idToDelete = listingToDeleteId;
                deleteModal.classList.remove('active');
                listingToDeleteId = null;

                // Eliminar el anuncio (y sus fotos de Supabase Storage) a través de db
                await db.deleteListing(idToDelete);

                // 4. Quitar de guardados si aplica
                const sIdx = savedListingsIds.indexOf(idToDelete);
                if (sIdx > -1) {
                    savedListingsIds.splice(sIdx, 1);
                    localStorage.setItem('revista_autos_saved', JSON.stringify(savedListingsIds));
                }

                renderMyListings();
                updateStats();
                showAlert('Publicación eliminada correctamente.', 'Eliminado', 'check_circle');
            }
        });
    }

    // Eliminación de Publicidad del usuario (Mis Anuncios Publicitarios)
    // Patrón idéntico al de deleteListing para garantizar eliminación en vivo
    window.deleteMyAd = function (id) {
        window.appConfirm('¿Eliminar este anuncio permanentemente?', async () => {
            await db.deleteAd(id);

            // Invalidar caché de renderizado para forzar actualización inmediata
            const container = document.getElementById('my-listings-container');
            if (container) delete container.dataset.lastState;

            renderMyListings();
            showAlert('Anuncio eliminado correctamente.', 'Eliminado', 'check_circle');
        });
    };

    // Modal behavior & Wizard
    let currentWizardStep = 1;
    const totalWizardSteps = 6;

    function updateWizardUI() {
        // Update Steps Visibility
        const steps = newListingForm.querySelectorAll('.form-step');
        steps.forEach(step => {
            if (parseInt(step.dataset.step) === currentWizardStep) {
                step.style.display = 'block';
            } else {
                step.style.display = 'none';
            }
        });

        // Update Progress Bar & Text
        const indicator = document.getElementById('wizard-step-indicator');
        const fill = document.getElementById('wizard-bar-fill');
        if (indicator && fill) {
            indicator.textContent = `Paso ${currentWizardStep} de ${totalWizardSteps}`;
            fill.style.width = `${(currentWizardStep / totalWizardSteps) * 100}%`;
        }

        // Update Buttons
        const btnBack = document.getElementById('btn-wizard-back');
        const btnNext = document.getElementById('btn-wizard-next');
        const btnSubmit = document.getElementById('btn-wizard-submit');

        if (btnBack) btnBack.style.display = currentWizardStep > 1 ? 'block' : 'none';

        if (currentWizardStep === totalWizardSteps) {
            if (btnNext) btnNext.style.display = 'none';
            if (btnSubmit) btnSubmit.style.display = selectedImageFiles.length > 0 ? 'block' : 'none';
        } else {
            if (btnNext) btnNext.style.display = 'block';
            if (btnSubmit) btnSubmit.style.display = 'none';
        }

        if (currentWizardStep === 4 && typeof window.updateTruckMechanicsUI === 'function') {
            window.updateTruckMechanicsUI();
        }
    }

    function isCurrentStepFullyComplete() {
        // Solo aplica auto-avance para Paso 3, 4 y 5
        if (currentWizardStep !== 3 && currentWizardStep !== 4 && currentWizardStep !== 5) return false;

        const currentStepEl = newListingForm.querySelector(`.form-step[data-step="${currentWizardStep}"]`);
        if (!currentStepEl) return false;

        // Si en el paso actual se seleccionó 'Otros', se desactiva el avance automático ÚNICAMENTE en este paso/modal
        const visibleSelects = Array.from(currentStepEl.querySelectorAll('select'));
        for (const s of visibleSelects) {
            if (s.value === 'Otros' || s.value === 'Otro...') {
                return false;
            }
        }

        const requiredInputs = currentStepEl.querySelectorAll('input[required], select[required]');
        for (const input of requiredInputs) {
            // Ignorar inputs ocultos
            if (input.style.display === 'none' && input.tagName.toLowerCase() !== 'select') continue;

            if (input.tagName.toLowerCase() === 'select') {
                if (!input.value || input.value === '' || input.value === 'null') return false;
            } else if (input.type === 'tel') {
                const digits = input.value.replace(/\D/g, '');
                if (digits.length < 10) return false;
            } else if (input.type === 'number') {
                const val = parseInt(input.value, 10);
                if (isNaN(val) || val < 1950) return false;
            } else if (input.id === 'form-price') {
                const num = parseInt(input.value.replace(/[^0-9]/g, ''), 10);
                if (!num || num <= 0) return false;
            } else {
                if (!input.value || input.value.trim() === '') return false;
            }
        }

        return true;
    }

    let autoAdvanceTimeout = null;
    tryAutoAdvanceWizardStep = function (isFromInput = false) {
        if (window._isPopulatingListingData) return;
        if (currentWizardStep !== 3 && currentWizardStep !== 4 && currentWizardStep !== 5) return;
        if (isFromInput && currentWizardStep === 5) return; // No auto-avanzar mientras teclea en el Paso 5

        if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);

        if (isCurrentStepFullyComplete()) {
            autoAdvanceTimeout = setTimeout(() => {
                if (currentWizardStep < totalWizardSteps && isCurrentStepFullyComplete()) {
                    const currentStepEl = newListingForm.querySelector(`.form-step[data-step="${currentWizardStep}"]`);
                    if (currentStepEl) {
                        currentStepEl.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
                    }
                    currentWizardStep++;
                    updateWizardUI();
                }
            }, 180);
        }
    }

    function checkStepValidity() {
        const currentStepEl = newListingForm.querySelector(`.form-step[data-step="${currentWizardStep}"]`);
        if (!currentStepEl) return true;

        // Limpiar errores visuales previos
        currentStepEl.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

        const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
        let isValid = true;
        let missingFields = [];

        inputs.forEach(input => {
            // Ignorar inputs ocultos que no aplican a la validación en este caso
            if (input.style.display === 'none' && input.tagName.toLowerCase() !== 'select') return;

            if (!input.checkValidity()) {
                isValid = false;

                // Highlight input o custom select trigger
                if (input.tagName.toLowerCase() === 'select') {
                    if (input.parentNode && input.parentNode.classList.contains('custom-select-wrapper')) {
                        const trigger = input.parentNode.querySelector('.custom-select-trigger');
                        if (trigger) trigger.classList.add('input-error');
                    }
                } else {
                    input.classList.add('input-error');
                }

                // Obtener nombre del campo para el mensaje
                const formGroup = input.closest('.form-group');
                if (formGroup) {
                    const label = formGroup.querySelector('label');
                    if (label && !missingFields.includes(label.textContent)) {
                        missingFields.push(label.textContent);
                    }
                }
            }
        });

        if (!isValid) {
            showAlert(`Faltan completar: ${missingFields.join(', ')}`, 'Información Incompleta', 'warning');
        }

        return isValid;
    }

    const btnWizardNext = document.getElementById('btn-wizard-next');
    if (btnWizardNext) {
        btnWizardNext.addEventListener('click', () => {
            if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
            if (checkStepValidity() && currentWizardStep < totalWizardSteps) {
                currentWizardStep++;
                updateWizardUI();
            }
        });
    }

    const btnWizardBack = document.getElementById('btn-wizard-back');
    if (btnWizardBack) {
        btnWizardBack.addEventListener('click', () => {
            if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
            if (currentWizardStep > 1) {
                currentWizardStep--;
                updateWizardUI();
            }
        });
    }

    // Smart scroll en móviles: asegurar que los botones sean visibles al abrir el teclado numérico
    if (newListingForm) {
        const wizardButtons = document.querySelector('.wizard-buttons');
        newListingForm.addEventListener('focusin', (e) => {
            if (window.innerWidth <= 768 && wizardButtons && e.target.tagName === 'INPUT') {
                // Esperar a que el teclado se despliegue y haga el resize de ventana
                setTimeout(() => {
                    // Desplazar el modal-content internamente hacia los botones
                    wizardButtons.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 400);
            }
        });
    }

    // Eventos para avance automático y limpieza de recuadros rojos
    if (newListingForm) {
        newListingForm.addEventListener('change', (e) => {
            if (e.target) {
                e.target.classList.remove('input-error');
                if (e.target.parentNode && e.target.parentNode.classList.contains('custom-select-wrapper')) {
                    const trigger = e.target.parentNode.querySelector('.custom-select-trigger');
                    if (trigger) trigger.classList.remove('input-error');
                }
            }
            tryAutoAdvanceWizardStep();
        });

        newListingForm.addEventListener('input', (e) => {
            if (e.target) {
                if (e.target.checkValidity() && e.target.value.trim() !== '') {
                    e.target.classList.remove('input-error');
                }
            }
            if (e.target && (e.target.type === 'tel' || e.target.type === 'number')) {
                tryAutoAdvanceWizardStep(true);
            }
        });

        newListingForm.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (currentWizardStep < totalWizardSteps) {
                    if (btnWizardNext) btnWizardNext.click();
                } else {
                    const btnSubmit = document.getElementById('btn-wizard-submit');
                    if (btnSubmit && btnSubmit.style.display !== 'none') btnSubmit.click();
                }
            }
        });
    }

    btnNewListing.addEventListener('click', () => {
        window._isPopulatingListingData = true;
        if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
        editingListingId = null;
        currentWizardStep = 1;
        newListingForm.reset();
        populateMakesForType('');
        setTimeout(() => { window._isPopulatingListingData = false; }, 300);
        if (window.customMakeSelect) window.customMakeSelect.update();
        if (window.customModelSelect) window.customModelSelect.update();
        if (window.customTypeSelect) window.customTypeSelect.update();
        if (window.customStateSelect) window.customStateSelect.update();
        if (window.customCitySelect) window.customCitySelect.update();
        if (window.customTransmissionSelect) window.customTransmissionSelect.update();
        if (window.customAcSelect) window.customAcSelect.update();
        if (window.customLegalSelect) window.customLegalSelect.update();
        if (window.customColorSelect) window.customColorSelect.update();
        if (formCustomColor) {
            formCustomColor.style.display = 'none';
            formCustomColor.required = false;
            formCustomColor.value = '';
        }
        if (formCylindersSelect) {
            formCylindersSelect.value = '';
            if (window.customCylindersSelect) window.customCylindersSelect.update();
        }
        if (formCustomCylinders) {
            formCustomCylinders.style.display = 'none';
            formCustomCylinders.required = false;
            formCustomCylinders.value = '';
        }
        if (formEngineDisplacement) formEngineDisplacement.value = '';
        if (formEngineText) formEngineText.value = '';
        if (formEngineSelect) {
            formEngineSelect.value = '';
            if (window.customEngineSelect) window.customEngineSelect.update();
        }
        if (formCustomEngine) {
            formCustomEngine.style.display = 'none';
            formCustomEngine.required = false;
            formCustomEngine.value = '';
        }
        if (typeof window.updateTruckMechanicsUI === 'function') window.updateTruckMechanicsUI();
        whatsappModified = false;
        phoneModified = false;
        selectedImageFiles = [];
        if (typeof renderImagePreviews === 'function') renderImagePreviews();
        newListingModal.querySelector('h3').textContent = 'Dar de Alta Vehículo';
        updateWizardUI();
        const morePhotosModal = document.getElementById('more-photos-modal');
        if (morePhotosModal) morePhotosModal.classList.remove('active');
        newListingModal.classList.add('active');

        // Autocompletar ubicación con el GPS ya detectado en la página principal
        if (userStateSelect.value && userStateSelect.value !== 'Todos') {
            formState.value = userStateSelect.value;
            formState.dispatchEvent(new Event('change'));
            if (window.customStateSelect) window.customStateSelect.update();

            if (selectedCities && selectedCities.length > 0 && selectedCities[0] !== 'Todas') {
                setTimeout(() => {
                    formCity.value = selectedCities[0];
                    if (window.customCitySelect) window.customCitySelect.update();
                    formCity.dispatchEvent(new Event('change')); // Actualiza el precio basado en la ciudad GPS
                }, 50);
            }
        }
    });
    btnCloseModal.addEventListener('click', () => {
        newListingModal.classList.remove('active');
        const morePhotosModal = document.getElementById('more-photos-modal');
        if (morePhotosModal) morePhotosModal.classList.remove('active');
        if (window._editFromAdmin === true) {
            window._editFromAdmin = false;
            editingListingId = null;
            const adminModal = document.getElementById('admin-dashboard-modal');
            if (adminModal) adminModal.classList.add('active');
            document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active'));
            const invTab = document.querySelector('.dashboard-tab[data-tab="tab-inventario"]');
            if (invTab) invTab.classList.add('active');
            const invView = document.getElementById('tab-inventario');
            if (invView) invView.classList.add('active');
        }
    });

    const formPriceInput = document.getElementById('form-price');
    if (formPriceInput) {
        formPriceInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^0-9]/g, '');
            if (val) {
                e.target.value = '$' + parseInt(val, 10).toLocaleString('es-MX');
            } else {
                e.target.value = '';
            }
        });
    }

    window.openEditAd = function (id) {
        const ad = db.getAllAds().find(a => String(a.id) === String(id));
        if (!ad) return;

        window.editingAdId = id;

        document.getElementById('client-ad-title').value = ad.title || '';
        document.getElementById('client-ad-description').value = ad.description || '';
        document.getElementById('client-ad-address').value = ad.address || '';
        document.getElementById('client-ad-schedule-mf').value = ad.scheduleMF || '';
        document.getElementById('client-ad-schedule-sat').value = ad.scheduleSat || '';
        document.getElementById('client-ad-schedule-sun').value = ad.scheduleSun || '';

        const counter = document.getElementById('desc-char-counter');
        if (counter) counter.textContent = `${(ad.description || '').length}/220`;

        const stateSelect = document.getElementById('client-ad-state');
        stateSelect.value = ad.state || '';
        stateSelect.dispatchEvent(new Event('change'));
        if (ad.city) document.getElementById('client-ad-city').value = ad.city;

        document.getElementById('client-ad-phone').value = ad.phone || '';
        document.getElementById('client-ad-whatsapp').value = ad.whatsapp || '';

        document.getElementById('client-ad-link-fb').value = (ad.social_links && ad.social_links.length > 0) ? ad.social_links[0] : '';
        document.getElementById('client-ad-link-ig').value = (ad.social_links && ad.social_links.length > 1) ? ad.social_links[1] : '';
        document.getElementById('client-ad-link-tk').value = (ad.social_links && ad.social_links.length > 2) ? ad.social_links[2] : '';

        window.clientAdImages = ad.images ? [...ad.images] : [];
        if (typeof window.renderClientAdImagePreviews === 'function') {
            window.renderClientAdImagePreviews();
        }

        const btnSubmit = document.getElementById('btn-submit-client-ad');
        if (btnSubmit) btnSubmit.textContent = 'Guardar Cambios';

        const clientAdModal = document.getElementById('client-ad-modal');
        if (clientAdModal) {
            clientAdModal.classList.add('active');
            if (typeof window.nextAdStep === 'function') {
                window.nextAdStep(2);
            }
        }
    };

    // Editar desde el panel admin (busca en todos los listings)
    window.openEditListingAdmin = function (id) {
        const listing = db.getAllListings().find(l => String(l.id) === String(id));
        if (!listing) { showAlert('No se encontró la publicación.', 'Error', 'error'); return; }
        window._editFromAdmin = true;
        // Cerrar el modal del admin y abrir el form de edición
        const adminModal = document.getElementById('admin-dashboard-modal');
        if (adminModal) adminModal.classList.remove('active');
        // Navegar a view-alta donde está el formulario
        views.forEach(v => v.classList.remove('active'));
        const viewAlta = document.getElementById('view-alta');
        if (viewAlta) viewAlta.classList.add('active');
        // Reutilizar openEditListing con el listing encontrado
        _openEditListingWithData(listing);
    };

    window.openEditListing = function (id) {
        const listing = db.getMyListings().find(l => String(l.id) === String(id));
        if (!listing) return;
        window._editFromAdmin = false;
        _openEditListingWithData(listing);
    };

    function _openEditListingWithData(listing) {
        window._isPopulatingListingData = true;
        if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
        setTimeout(() => { window._isPopulatingListingData = false; }, 600);
        const id = listing.id;
        editingListingId = id;

        let fType = document.getElementById('form-type');
        const normalizedType = (listing.type === 'Camioneta') ? 'SUV / Camioneta' : (listing.type || '');
        fType.value = normalizedType;
        if (!fType.value) { fType.value = 'Otros'; document.getElementById('form-custom-type').value = listing.type; }
        document.getElementById('form-type').dispatchEvent(new Event('change'));
        if (window.customTypeSelect) window.customTypeSelect.update();

        let fMake = document.getElementById('form-make');
        fMake.value = listing.make;
        if (!fMake.value) { fMake.value = 'Otros'; document.getElementById('form-custom-make').value = listing.make; }
        if (window.customMakeSelect) window.customMakeSelect.update();

        const event = new Event('change');
        fMake.dispatchEvent(event);
        setTimeout(() => {
            let fModel = document.getElementById('form-model');
            fModel.value = listing.model;
            if (!fModel.value) { fModel.value = 'Otros'; document.getElementById('form-custom-model').value = listing.model; }
            fModel.dispatchEvent(new Event('change'));
            if (window.customModelSelect) window.customModelSelect.update();
        }, 50);

        document.getElementById('form-year').value = listing.year;
        if (listing.price) {
            document.getElementById('form-price').value = '$' + Number(listing.price).toLocaleString('en-US');
        } else {
            document.getElementById('form-price').value = '';
        }
        const formCurrency = document.getElementById('form-currency');
        if (formCurrency) {
            // Trigger state change to correctly disable/enable USD if needed
            const formState = document.getElementById('form-state');
            if (formState) {
                formState.value = listing.state || '';
                formState.dispatchEvent(new Event('change'));
            }
            // Restore currency regardless of disabled state using selectedIndex
            const targetCurrency = listing.currency || 'MXN';
            const optionToSelect = Array.from(formCurrency.options).findIndex(o => o.value === targetCurrency);
            if (optionToSelect !== -1) {
                // Temporarily enable to allow selectedIndex assignment, then restore
                const wasDisabled = formCurrency.disabled;
                formCurrency.disabled = false;
                formCurrency.selectedIndex = optionToSelect;
                // Only re-disable if it's not a border state (i.e. currency is MXN)
                if (wasDisabled && targetCurrency === 'MXN') {
                    formCurrency.disabled = true;
                }
            }
        }

        if (formColor) {
            let listColor = listing.color || '';
            let colorOptions = Array.from(formColor.options).map(o => o.value);
            if (colorOptions.includes(listColor)) {
                formColor.value = listColor;
                if (formCustomColor) {
                    formCustomColor.style.display = 'none';
                    formCustomColor.required = false;
                    formCustomColor.value = '';
                }
            } else if (listColor) {
                let otroOpt = colorOptions.find(o => o === 'Otro' || o === 'Otros') || 'Otro';
                formColor.value = otroOpt;
                if (formCustomColor) {
                    formCustomColor.style.display = 'block';
                    formCustomColor.required = true;
                    formCustomColor.value = listColor;
                }
            } else {
                formColor.value = '';
                if (formCustomColor) {
                    formCustomColor.style.display = 'none';
                    formCustomColor.required = false;
                    formCustomColor.value = '';
                }
            }
            if (window.customColorSelect) window.customColorSelect.update();
        }

        const formTrim = document.getElementById('form-trim');
        if (formTrim) formTrim.value = listing.trim || '';

        const phoneData = parseAndFormatPhone(listing.phone, listing);
        const waData = parseAndFormatPhone(listing.whatsapp, listing);

        const formPhoneLada = document.getElementById('form-phone-lada');
        if (formPhoneLada) {
            formPhoneLada.value = phoneData.prefix === '+1' ? '+1' : '+52';
        }

        formPhone.value = phoneData.nationalDigits || (listing.phone ? String(listing.phone).replace(/[^0-9]/g, '').slice(-10) : '');
        formWhatsApp.value = waData.nationalDigits || (listing.whatsapp ? String(listing.whatsapp).replace(/[^0-9]/g, '').slice(-10) : '');
        const engineVal = listing.engine || '';
        formEngineText.value = engineVal;

        const truckTypes = ['Camión', 'Tractocamión', 'Rabón', 'Torton', 'Chasis', 'Autobús', 'Camiones', 'Tractocamiones'];
        const freeEngineTypes = ['Motocicleta', 'Cuatrimoto / ATV', 'Barco'];
        const isTruck = truckTypes.includes(listing.type);
        const isFreeEngine = freeEngineTypes.includes(listing.type) || listing.type === 'Otros';

        if (typeof window.updateTruckMechanicsUI === 'function') window.updateTruckMechanicsUI();

        if (isTruck && formEngineSelect) {
            let engineOptions = Array.from(formEngineSelect.options).map(o => o.value);
            if (engineOptions.includes(engineVal)) {
                formEngineSelect.value = engineVal;
                if (formCustomEngine) { formCustomEngine.style.display = 'none'; formCustomEngine.value = ''; }
            } else if (engineVal) {
                formEngineSelect.value = 'Otros';
                if (formCustomEngine) { formCustomEngine.style.display = 'block'; formCustomEngine.value = engineVal; }
            }
            if (window.customEngineSelect) window.customEngineSelect.update();
        } else if (!isFreeEngine && formCylindersSelect) {
            const standardCyls = [
                { opt: '3 cil', aliases: ['3 cil', '3 cilindros', '3cil', '3-cil'] },
                { opt: '4 cil', aliases: ['4 cil', '4 cilindros', '4cil', '4-cil'] },
                { opt: '5 cil', aliases: ['5 cil', '5 cilindros', '5cil', '5-cil'] },
                { opt: '6 cil', aliases: ['6 cil', '6 cilindros', '6cil', '6-cil', 'v6', 'l6'] },
                { opt: '8 cil', aliases: ['8 cil', '8 cilindros', '8cil', '8-cil', 'v8'] },
                { opt: '10 cil', aliases: ['10 cil', '10 cilindros', '10cil', '10-cil', 'v10'] },
                { opt: '12 cil', aliases: ['12 cil', '12 cilindros', '12cil', '12-cil', 'v12', 'w12'] },
                { opt: 'Eléctrico', aliases: ['eléctrico', 'electrico', 'electric', 'ev'] },
                { opt: 'Híbrido', aliases: ['híbrido', 'hibrido', 'hybrid'] }
            ];

            let matchedOpt = null;
            let remainingText = engineVal;
            const lowerEng = engineVal.toLowerCase().trim();

            for (const item of standardCyls) {
                for (const alias of item.aliases) {
                    if (lowerEng === alias || lowerEng.startsWith(alias + ' ') || lowerEng.startsWith(alias + '.') || lowerEng.startsWith(alias + '•')) {
                        matchedOpt = item.opt;
                        remainingText = engineVal.slice(alias.length).replace(/^[•\s,\.\-]+/, '').trim();
                        break;
                    }
                }
                if (matchedOpt) break;
            }

            if (matchedOpt) {
                formCylindersSelect.value = matchedOpt;
                if (formEngineDisplacement) formEngineDisplacement.value = remainingText;
                if (formCustomCylinders) {
                    formCustomCylinders.style.display = 'none';
                    formCustomCylinders.required = false;
                    formCustomCylinders.value = '';
                }
            } else if (engineVal) {
                formCylindersSelect.value = 'Otros';
                if (formCustomCylinders) {
                    formCustomCylinders.style.display = 'block';
                    formCustomCylinders.required = true;
                    formCustomCylinders.value = engineVal;
                }
                if (formEngineDisplacement) formEngineDisplacement.value = '';
            } else {
                formCylindersSelect.value = '';
                if (formEngineDisplacement) formEngineDisplacement.value = '';
                if (formCustomCylinders) {
                    formCustomCylinders.style.display = 'none';
                    formCustomCylinders.required = false;
                    formCustomCylinders.value = '';
                }
            }
            if (window.customCylindersSelect) window.customCylindersSelect.update();
        }
        formTransmission.value = listing.transmission || '';
        if (listing.box) {
            let boxOptions = Array.from(formBoxSelect.options).map(o => o.value);
            if (boxOptions.includes(listing.box)) {
                formBoxSelect.value = listing.box;
            } else {
                formBoxSelect.value = 'Otros';
                formCustomBox.value = listing.box;
            }
        }
        if (window.customTransmissionSelect) window.customTransmissionSelect.update();
        formAc.value = listing.ac || '';
        if (window.customAcSelect) window.customAcSelect.update();
        let milVal = listing.mileage || '';
        let milUnit = 'km';
        if (milVal.endsWith(' km')) {
            milVal = milVal.replace(' km', '');
        } else if (milVal.endsWith(' mi')) {
            milVal = milVal.replace(' mi', '');
            milUnit = 'mi';
        }
        let rawMil = milVal.replace(/[^0-9]/g, '');
        formMileage.value = rawMil ? Number(rawMil).toLocaleString('en-US') : '';
        if (document.getElementById('form-mileage-unit')) document.getElementById('form-mileage-unit').value = milUnit;
        formLegal.value = listing.legal || '';
        if (window.customLegalSelect) window.customLegalSelect.update();
        whatsappModified = true;
        phoneModified = true;

        let stateFound = '';
        if (catalogData && catalogData.citiesByState) {
            for (const [state, cities] of Object.entries(catalogData.citiesByState)) {
                if (cities.includes(listing.city)) {
                    stateFound = state;
                    break;
                }
            }
        }
        document.getElementById('form-state').value = stateFound;
        if (window.customStateSelect) window.customStateSelect.update();

        const stateEvent = new Event('change');
        document.getElementById('form-state').dispatchEvent(stateEvent);
        setTimeout(() => {
            const fCity = document.getElementById('form-city');
            fCity.value = listing.city;
            if (window.customCitySelect) window.customCitySelect.update();
            fCity.dispatchEvent(new Event('change')); // Actualiza el precio dinámico si es edición
        }, 50);

        newListingModal.querySelector('h3').textContent = 'Editar Vehículo';

        selectedImageFiles = [];
        const existingImages = listing.images || (listing.image ? [listing.image] : []);
        existingImages.forEach(imgUrl => {
            selectedImageFiles.push({ file: null, url: imgUrl });
        });

        if (typeof renderImagePreviews === 'function') renderImagePreviews();

        const fileText = document.getElementById('file-chosen-text');
        if (fileText) {
            if (selectedImageFiles.length > 0) {
                fileText.textContent = `${selectedImageFiles.length} foto(s) lista(s)`;
                fileText.style.color = 'var(--text-main)';
            } else {
                fileText.textContent = 'Sin archivos seleccionados';
                fileText.style.color = 'var(--text-muted)';
            }
        }

        if (listing.status === 'activo' || listing.status === 'autorizado' || listing.status === 'vendido') {
            currentWizardStep = 2;
        } else {
            currentWizardStep = 1;
        }
        updateWizardUI();
        newListingModal.classList.add('active');
    }

    const submitBtn = document.getElementById('btn-wizard-submit');
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        try {

        if (selectedImageFiles.length === 0 && !editingListingId) {
            showAlert('Por favor, selecciona al menos una foto del vehículo.', 'Faltan Fotos', 'warning');
            return;
        }

        const make = formMake.value === 'Otros' ? document.getElementById('form-custom-make').value.trim() : formMake.value;
        let model = formModel.value === 'Otros' ? document.getElementById('form-custom-model').value.trim() : formModel.value;
        if (!model || model === '') model = 'Modelo Desconocido';
        const year = document.getElementById('form-year').value;
        const trimVal = document.getElementById('form-trim') ? document.getElementById('form-trim').value.trim() : '';
        const title = `${make} ${model} ${trimVal ? trimVal + ' ' : ''}${year}`;
        const truckTypes = ['Camión', 'Tractocamión', 'Rabón', 'Torton', 'Chasis', 'Autobús', 'Camiones', 'Tractocamiones'];
        const freeEngineTypes = ['Motocicleta', 'Cuatrimoto / ATV', 'Barco'];
        const isTruck = formType && truckTypes.includes(formType.value);
        const _formCustomType = document.getElementById('form-custom-type');
        const isFreeEngine = formType && (freeEngineTypes.includes(formType.value) || formType.value === 'Otros' || (_formCustomType && _formCustomType.value.trim() !== ''));
        
        let engine = '';
        if (isTruck) {
            engine = formEngineSelect.value === 'Otros' ? (formCustomEngine ? formCustomEngine.value.trim() : '') : formEngineSelect.value;
        } else if (isFreeEngine) {
            engine = formEngineText ? formEngineText.value.trim() : '';
        } else {
            const cylVal = formCylindersSelect ? (formCylindersSelect.value === 'Otros' ? (formCustomCylinders ? formCustomCylinders.value.trim() : '') : formCylindersSelect.value) : '';
            const dispVal = formEngineDisplacement ? formEngineDisplacement.value.trim() : '';
            if (cylVal && dispVal) {
                engine = `${cylVal} ${dispVal}`;
            } else if (cylVal) {
                engine = cylVal;
            } else if (dispVal) {
                engine = dispVal;
            }
        }
        const transmission = formTransmission.value;
        let box = '';
        if (isTruck && transmission === 'Manual') {
            box = formBoxSelect.value === 'Otros' ? formCustomBox.value : formBoxSelect.value;
        }
        const ac = formAc.value;
        const mileageUnit = document.getElementById('form-mileage-unit') ? document.getElementById('form-mileage-unit').value : '';
        const rawMileageText = formMileage ? formMileage.value.trim() : '';
        const mileage = rawMileageText ? (rawMileageText + (mileageUnit ? ' ' + mileageUnit : '')) : 'S/N';
        const legal = formLegal.value;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subiendo...';

            let progressContainer = document.getElementById('upload-progress-container');
            if (!progressContainer) {
                progressContainer = document.createElement('div');
                progressContainer.id = 'upload-progress-container';
                progressContainer.style.width = '100%';
                progressContainer.style.height = '16px';
                progressContainer.style.background = 'var(--surface-light)';
                progressContainer.style.borderRadius = '8px';
                progressContainer.style.marginBottom = '12px';
                progressContainer.style.overflow = 'hidden';
                progressContainer.style.position = 'relative';

                const progressBg = document.createElement('div');
                progressBg.id = 'upload-progress-bg';
                progressBg.style.position = 'absolute';
                progressBg.style.top = '0';
                progressBg.style.left = '0';
                progressBg.style.height = '100%';
                progressBg.style.width = '0%';
                progressBg.style.background = 'var(--primary-color)';
                progressBg.style.transition = 'width 0.3s ease';

                const progressText = document.createElement('div');
                progressText.id = 'upload-progress-text';
                progressText.style.position = 'absolute';
                progressText.style.width = '100%';
                progressText.style.textAlign = 'center';
                progressText.style.fontSize = '11px';
                progressText.style.fontWeight = 'bold';
                progressText.style.lineHeight = '16px';
                progressText.style.zIndex = '1';
                progressText.style.color = '#fff';
                progressText.style.textShadow = '0px 0px 2px rgba(0,0,0,0.5)';
                progressText.textContent = '0%';

                progressContainer.appendChild(progressBg);
                progressContainer.appendChild(progressText);

                submitBtn.parentNode.insertBefore(progressContainer, submitBtn);
            }
            progressContainer.style.display = 'block';
            document.getElementById('upload-progress-bg').style.width = '0%';
            document.getElementById('upload-progress-text').textContent = '0%';
        }

        let uploadedImageUrls = [];
        const imageFiles = selectedImageFiles;

        let uploadedThumbnailUrl = null;
        if (imageFiles.length > 0) {
            try {
                for (let i = 0; i < imageFiles.length; i++) {
                    const currentPercent = Math.round((i / imageFiles.length) * 100);
                    const progressBg = document.getElementById('upload-progress-bg');
                    const progressText = document.getElementById('upload-progress-text');
                    if (progressBg) progressBg.style.width = currentPercent + '%';
                    if (progressText) progressText.textContent = currentPercent + '%';

                    const file = imageFiles[i].file;

                    if (!file) {
                        // Imagen existente, usar URL directamente sin re-subir
                        uploadedImageUrls.push(imageFiles[i].url);

                        const afterPercent = Math.round(((i + 1) / imageFiles.length) * 100);
                        const progressBg2 = document.getElementById('upload-progress-bg');
                        const progressText2 = document.getElementById('upload-progress-text');
                        if (progressBg2) progressBg2.style.width = afterPercent + '%';
                        if (progressText2) progressText2.textContent = afterPercent + '%';
                    } else {
                        // Imagen nueva, comprimir y subir
                        const compressedFile = await new Promise((resolve) => {
                            const img = new Image();
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 800;
                                let scaleSize = 1;
                                if (img.width > MAX_WIDTH) {
                                    scaleSize = MAX_WIDTH / img.width;
                                }
                                canvas.width = img.width * scaleSize;
                                canvas.height = img.height * scaleSize;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                canvas.toBlob((blob) => {
                                    if (blob) {
                                        const finalName = file && file.name ? file.name.replace(/\.[^/.]+$/, ".webp") : 'foto.webp';
                                        resolve(new File([blob], finalName, { type: 'image/webp' }));
                                    } else {
                                        resolve(file); // Fallback
                                    }
                                }, 'image/webp', 0.75);
                            };
                            img.onerror = () => resolve(file); // Fallback
                            img.src = imageFiles[i].url;
                        });

                        // Subir archivo comprimido a Supabase Storage
                        const publicUrl = await db.uploadImageToSupabase(compressedFile);
                        if (publicUrl) {
                            uploadedImageUrls.push(publicUrl);

                            // Generar y subir miniatura (thumbnail) para la foto de portada (i === 0)
                            if (i === 0 && typeof window.useImageOptimizerHook === 'function') {
                                try {
                                    const optimizer = window.useImageOptimizerHook();
                                    const thumbFile = await optimizer.createThumbnailFile(file, `thumb_${compressedFile.name || 'foto.webp'}`, 360, 0.65);
                                    if (thumbFile) {
                                        let thumbPath = null;
                                        if (publicUrl.includes('/cars/auto_')) {
                                            const relativePath = publicUrl.substring(publicUrl.indexOf('cars/auto_'));
                                            thumbPath = relativePath.replace('cars/auto_', 'cars/thumb_auto_');
                                        }
                                        uploadedThumbnailUrl = await db.uploadImageToSupabase(thumbFile, thumbPath);
                                    }
                                } catch (thumbErr) {
                                    console.warn('⚠️ No se pudo generar miniatura:', thumbErr);
                                }
                            }

                            const afterPercent = Math.round(((i + 1) / imageFiles.length) * 100);
                            const progressBg2 = document.getElementById('upload-progress-bg');
                            const progressText2 = document.getElementById('upload-progress-text');
                            if (progressBg2) progressBg2.style.width = afterPercent + '%';
                            if (progressText2) progressText2.textContent = afterPercent + '%';
                        } else {
                            throw new Error("No se pudo subir la imagen a la nube. Por favor intenta de nuevo.");
                        }
                    }
                }
            } catch (error) {
                console.error('Error procesando imágenes:', error);
                showAlert(error.message || 'Hubo un error subiendo las imágenes.', 'Error de Imagen', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publicar Vehículo';
                const pc = document.getElementById('upload-progress-container');
                if (pc) pc.style.display = 'none';
                return;
            }
        }

        let typeVal = formType.value === 'Otros' ? document.getElementById('form-custom-type').value.trim() : formType.value;
        
        // Auto-clasificación inteligente únicamente cuando el usuario seleccionó "Sedán"
        const autoHatchbackModels = [
            'Golf', 'Golf GTI', 'Polo', 'Beetle',
            'Ibiza', 'Leon',
            'March', 'Note',
            'Fit',
            'Spark', 'Beat',
            'Kwid', 'Clio', 'Sandero',
            '208', '308',
            'Cooper', 'Cooper S',
            'Mobi', '500', 'Uno',
            'Soul',
            'Swift'
        ];

        const autoSportsModels = [
            'Mustang',
            'Camaro', 'Corvette',
            'Challenger', 'Viper',
            'Supra', 'GR86',
            '370Z', 'GT-R', 'Z',
            'MX-5 Miata',
            '718 Boxster', '718 Cayman', '911', 'Taycan',
            'TT', 'R8',
            'AMG GT', 'SL',
            '488', 'F8 Tributo', 'Roma', 'SF90 Stradale', 'Portofino', '812 Superfast', '296 GTB', '458 Italia', 'California',
            'MC20', 'GranTurismo',
            '720S', '750S', 'Artura', 'GT', '570S', 'Senna', '650S',
            'Vantage', 'DB11', 'DBS', 'DB12', 'Rapide',
            'BRZ',
            'Roadster'
        ];

        if (typeVal === 'Sedán' && model) {
            const lowerModel = model.toLowerCase().trim();
            const isHatch = autoHatchbackModels.some(m => lowerModel === m.toLowerCase() || lowerModel.includes(m.toLowerCase()));
            const isSport = autoSportsModels.some(m => lowerModel === m.toLowerCase() || lowerModel.includes(m.toLowerCase()));

            if (isHatch) {
                typeVal = 'Hatchback';
            } else if (isSport) {
                typeVal = 'Deportivo';
            }
        }

        const rawColorVal = formColor ? formColor.value : '';
        const colorVal = ((rawColorVal === 'Otro' || rawColorVal === 'Otros') && formCustomColor && formCustomColor.value.trim() !== '') 
            ? formCustomColor.value.trim() 
            : rawColorVal;
        const updatedData = {
            title: title,
            type: typeVal,
            make: make,
            model: model,
            year: parseInt(year),
            price: parseInt(document.getElementById('form-price').value.replace(/[^0-9]/g, ''), 10) || 0,
            currency: (() => { const _fc = document.getElementById('form-currency'); return _fc ? (_fc.options[_fc.selectedIndex] ? _fc.options[_fc.selectedIndex].value : 'MXN') : 'MXN'; })(),
            color: colorVal,
            state: formState.value,
            city: formCity.value,
            phone: (() => {
                const lada = document.getElementById('form-phone-lada') ? document.getElementById('form-phone-lada').value : '+52';
                const phoneDigits = formPhone ? formPhone.value.replace(/[^0-9]/g, '') : '';
                const clean10 = phoneDigits.slice(-10);
                return clean10 ? `${lada} ${clean10}` : '';
            })(),
            whatsapp: (() => {
                const lada = document.getElementById('form-phone-lada') ? document.getElementById('form-phone-lada').value : '+52';
                const waDigits = formWhatsApp ? formWhatsApp.value.replace(/[^0-9]/g, '') : '';
                const clean10 = waDigits.slice(-10);
                return clean10 ? `${lada} ${clean10}` : '';
            })(),
            engine: engine,
            box: box,
            transmission: transmission,
            ac: ac,
            mileage: mileage,
            legal: legal,
            trim: document.getElementById('form-trim') ? document.getElementById('form-trim').value.trim() : ''
        };

        if (uploadedImageUrls.length > 0) {
            updatedData.images = uploadedImageUrls;
        } else if (!editingListingId) {
            updatedData.images = ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80'];
        }

        if (uploadedThumbnailUrl) {
            updatedData.thumbnail = uploadedThumbnailUrl;
        }

        try {
            if (editingListingId) {
                const allListings = db.getAllListings();
                const existingListing = allListings.find(l => String(l.id) === String(editingListingId)) || {};

                // Lógica de bajada de precio (Conservar el máximo original)
                const newPrice = updatedData.price;
                const currentPrice = existingListing.price || 0;

                if (newPrice < currentPrice) {
                    if (!existingListing.old_price) {
                        updatedData.old_price = currentPrice;
                    } else {
                        updatedData.old_price = existingListing.old_price;
                    }
                } else if (newPrice > currentPrice) {
                    if (existingListing.old_price && newPrice >= existingListing.old_price) {
                        updatedData.old_price = null;
                    } else if (existingListing.old_price) {
                        updatedData.old_price = existingListing.old_price;
                    }
                } else {
                    if (existingListing.old_price !== undefined) {
                        updatedData.old_price = existingListing.old_price;
                    }
                }

                // Mezclar los datos nuevos con los existentes para NO perder estatus, fechas, id, etc.
                const finalData = { ...existingListing, ...updatedData, id: editingListingId };

                await db.saveListing(finalData);
                showAlert('¡Vehículo actualizado con éxito!', 'Actualizado', 'check_circle');
                finishWizardSubmit();
            } else {
                updatedData.paymentStatus = 'pending';

                const cityVal = updatedData.city || '';
                const stateVal = updatedData.state || '';
                
                // Si la ciudad no existe en la configuración, la registramos automáticamente como Gratis ($0)
                if (window.useCityPricingHook && window.useCityPricingHook.isCityMissing(cityVal)) {
                    await window.useCityPricingHook.registerNewCityAsFree(cityVal);
                }

                const finalCityPrice = window.useCityPricingHook ? window.useCityPricingHook.getCityPrice(cityVal, stateVal) : globalMonthlyPrice;
                updatedData.checkout_price = finalCityPrice; // <--- Sella el precio original con el que se publicó

                const newListing = await db.saveListing(updatedData);

                finishWizardSubmit(); // Call instantly so it renders in the background



                if (Number(finalCityPrice) === 0) {
                    // Flujo Gratuito: Ocultar Mercado Pago y mostrar modal de revisión
                    const optionsModal = document.getElementById('publish-options-modal');
                    if (optionsModal) {
                        document.getElementById('publish-modal-title').textContent = '¡Publica tu anuncio gratis!';
                        document.getElementById('publish-modal-desc').textContent = 'Tu vehículo entrará a un breve proceso de revisión por nuestro equipo. En pocos minutos será autorizado y estará visible en la plataforma durante un mes. ¿Deseas publicarlo ahora?';

                        document.getElementById('btn-option-pay-now').style.display = 'none';

                        const icon = document.getElementById('publish-later-icon');
                        if (icon) icon.textContent = 'check_circle';
                        const title = document.getElementById('publish-later-title');
                        if (title) title.textContent = 'Subir Anuncio';
                        const desc = document.getElementById('publish-later-desc');
                        if (desc) desc.textContent = 'Haz clic aquí para enviar tu anuncio a revisión y publicarlo sin costo.';

                        optionsModal.classList.add('active');
                    }
                    window.currentPendingListingId = newListing.id;
                    newListingModal.classList.remove('active');
                } else if (globalMpEnabled) {
                    // Mostrar modal de opciones normal
                    const optionsModal = document.getElementById('publish-options-modal');
                    const priceText = document.getElementById('publish-price-text');
                    if (priceText) priceText.textContent = `$${Number(finalCityPrice).toFixed(2)} MXN`;

                    if (optionsModal) {
                        document.getElementById('publish-modal-title').textContent = '¡Casi listo!';
                        document.getElementById('publish-modal-desc').textContent = '¿Cómo deseas activar tu anuncio?';
                        document.getElementById('btn-option-pay-now').style.display = 'flex';
                        const icon = document.getElementById('publish-later-icon');
                        if (icon) icon.textContent = 'support_agent';
                        const title = document.getElementById('publish-later-title');
                        if (title) title.textContent = 'Pago Asistido / Revisión';
                        const desc = document.getElementById('publish-later-desc');
                        if (desc) desc.textContent = 'Sube tu anuncio y nosotros te contactaremos para finalizar el proceso de pago y activación por un mes.';

                        optionsModal.classList.add('active');
                    }

                    // Guardar ref al carro que acabamos de crear
                    window.currentPendingListingId = newListing.id;

                    // Ocultamos el form
                    newListingModal.classList.remove('active');
                } else {
                    showAlert('¡Vehículo publicado con éxito! Está pendiente de aprobación. En breve te contactaremos por llamada o WhatsApp para confirmar tu anuncio.', 'Publicado', 'check_circle');
                }
            }
        } catch (e) {
            console.error(e);
            showAlert(e.message || 'Error al guardar. Por favor intenta de nuevo.', 'Error al Publicar', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publicar Vehículo';
        }

        function finishWizardSubmit() {
            const wasAdminEdit = window._editFromAdmin === true;
            window._editFromAdmin = false;
            editingListingId = null;
            newListingForm.reset();
            newListingModal.classList.remove('active');

            const pendingList = document.getElementById('pending-approvals-list');
            if (pendingList) delete pendingList.dataset.lastState;
            const inventoryTable = document.getElementById('inventory-table-body');
            if (inventoryTable) delete inventoryTable.dataset.lastState;

            if (wasAdminEdit) {
                // Regresar al panel admin en la pestaña de inventario
                const adminModal = document.getElementById('admin-dashboard-modal');
                if (adminModal) adminModal.classList.add('active');
                // Activar el tab de inventario
                document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active'));
                const invTab = document.querySelector('.dashboard-tab[data-tab="tab-inventario"]');
                if (invTab) invTab.classList.add('active');
                const invView = document.getElementById('tab-inventario');
                if (invView) invView.classList.add('active');
                renderAdminInventory();
                updateAdminStats();
            } else {
                renderMyListings();
                // Solo refrescar panel admin si hay sesión de admin activa
                if (isAdminLoggedIn()) {
                    if (typeof forceInstantAdminRefresh === 'function') {
                        forceInstantAdminRefresh();
                    } else if (typeof loadAdminData === 'function') {
                        loadAdminData();
                    }
                }
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publicar Vehículo';
            const pc = document.getElementById('upload-progress-container');
            if (pc) pc.style.display = 'none';
        }

        } catch (globalErr) {
            console.error('❌ Error global en publicación:', globalErr);
            showAlert('Error: ' + (globalErr.message || 'Ocurrió un problema al publicar. Revisa la consola del navegador (F12).'), 'Error al Publicar', 'error');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publicar Vehículo';
            }
            const pc2 = document.getElementById('upload-progress-container');
            if (pc2) pc2.style.display = 'none';
        }
    });

    // --- Admin Dashboard ---
    function loadAdminData() {
        if (typeof db.purgeExpiredExtensionListings === 'function') {
            db.purgeExpiredExtensionListings();
        }
        updateAdminStats();
        renderAdminInventory();
        updateAdminApprovals();
        if (typeof updateAdminPendingAds === 'function') updateAdminPendingAds();
        if (typeof updateAdminAdsApprovals === 'function') updateAdminAdsApprovals();
        if (typeof renderAdminAdsTable === 'function') renderAdminAdsTable();
        updateAdminRenewals();
        if (typeof updateAdminAdsRenewals === 'function') updateAdminAdsRenewals();
        updateBillingList();
        renderTrafficChart();
        if (typeof renderActiveCarsChart === 'function') renderActiveCarsChart();
        renderSalesChart();
        if (typeof renderActiveAdsChart === 'function') renderActiveAdsChart();
    }

    let titleClickCount = 0;
    let titleClickTimer = null;
    const appTitleElement = document.querySelector('.app-title');

    if (appTitleElement) {
        appTitleElement.addEventListener('click', () => {
            titleClickCount++;

            if (titleClickTimer) clearTimeout(titleClickTimer);

            if (titleClickCount >= 5) {
                titleClickCount = 0;
                if (typeof window.openAdminPanel === 'function') {
                    window.openAdminPanel();
                } else if (adminDashboardModal) {
                    adminDashboardModal.classList.add('active');
                    loadAdminData();
                }
                history.pushState({ page: 'root' }, '');
            } else {
                titleClickTimer = setTimeout(() => {
                    if (titleClickCount === 1) {
                        window.location.reload();
                    }
                    titleClickCount = 0;
                }, 500); // 500ms (Medio segundo) es el estándar ideal para doble clic y secuencias
            }
        });
    }

    btnCloseDashboard.addEventListener('click', () => {
        adminDashboardModal.classList.remove('active');
        history.pushState({ page: 'root' }, '');
    });

    dashboardTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            dashboardTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetId = tab.getAttribute('data-tab');
            dashboardViews.forEach(v => {
                v.classList.remove('active');
                if (v.id === targetId) v.classList.add('active');
            });

            // Cargar corte de caja y historial al abrir Finanzas
            if (targetId === 'tab-finanzas') {
                renderCorteCaja(corteCurrentPeriod);
                if (typeof updateBillingList === 'function') updateBillingList();
            }
            if (targetId === 'tab-inventario') {
                if (typeof renderAdminInventory === 'function') renderAdminInventory();
            }
            if (targetId === 'tab-publicidad') {
                if (typeof renderAdminAdsTable === 'function') renderAdminAdsTable();
            }
            if (targetId === 'tab-renovaciones') {
                if (typeof updateAdminRenewals === 'function') updateAdminRenewals();
                if (typeof updateAdminAdsRenewals === 'function') updateAdminAdsRenewals();
            }
            if (targetId === 'tab-bitacora') {
                if (typeof renderAdminAuditLog === 'function') renderAdminAuditLog();
            }
        });
    });

    function updateTrendBadge(elementId, currentValue, prevYearValue, prevMonthValue) {
        const el = document.getElementById(elementId);
        if (!el) return;

        let pct = 0;
        let labelTag = 'vs año ant.';
        let compareValue = prevYearValue;

        if (prevYearValue > 0) {
            compareValue = prevYearValue;
            labelTag = 'vs año ant.';
        } else if (typeof prevMonthValue !== 'undefined' && prevMonthValue > 0) {
            compareValue = prevMonthValue;
            labelTag = 'vs mes ant.';
        } else {
            compareValue = 0;
            labelTag = 'vs mes ant.';
        }

        if (compareValue > 0) {
            pct = Math.round(((currentValue - compareValue) / compareValue) * 100);
        } else if (currentValue > 0) {
            pct = 100;
        } else {
            pct = 0;
        }

        if (compareValue === 0 && currentValue === 0) {
            el.className = 'stat-trend neutral';
            el.style.color = 'var(--text-muted)';
            el.innerHTML = `<span class="material-symbols-rounded" style="font-size:15px;">horizontal_rule</span> 0% <span style="font-size:0.7rem; color:var(--text-muted); margin-left:2px;">${labelTag}</span>`;
            return;
        }

        if (pct > 0) {
            el.className = 'stat-trend positive';
            el.style.color = '#10b981'; // Verde
            el.innerHTML = `<span class="material-symbols-rounded" style="font-size:15px;">trending_up</span> +${pct}% <span style="font-size:0.7rem; color:var(--text-muted); margin-left:2px;">${labelTag}</span>`;
        } else if (pct < 0) {
            el.className = 'stat-trend negative';
            el.style.color = '#ef4444'; // Rojo
            el.innerHTML = `<span class="material-symbols-rounded" style="font-size:15px;">trending_down</span> ${pct}% <span style="font-size:0.7rem; color:var(--text-muted); margin-left:2px;">${labelTag}</span>`;
        } else {
            el.className = 'stat-trend neutral';
            el.style.color = 'var(--text-muted)'; // Gris Neutro
            el.innerHTML = `<span class="material-symbols-rounded" style="font-size:15px;">horizontal_rule</span> 0% <span style="font-size:0.7rem; color:var(--text-muted); margin-left:2px;">${labelTag}</span>`;
        }
    }

    function updateAdminStats() {
        const allListings = db.getAllListings();
        const active = allListings.filter(l => l.status === 'autorizado');
        const pendingCount = allListings.filter(l => l.status === 'pendiente autorizacion').length;
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDay = now.getDate();
        const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;

        const statViews = document.getElementById('stat-views');
        if (statViews) {
            db.fetchTrafficStats().then(data => {
                window.trafficStatsCache = data;
                if (typeof window.updateQuickViews === 'function') {
                    window.updateQuickViews('todo');
                }

                if (typeof window.renderTrafficChart === 'function') {
                    window.renderTrafficChart();
                }

                // Tendencia Visitas (Año anterior o Fallback Mes anterior)
                let curVisits = 0;
                let prevYearVisits = 0;
                let prevMonthVisits = 0;
                (data || []).forEach(row => {
                    if (!row.date) return;
                    const parts = row.date.split('-');
                    const rYear = parseInt(parts[0]);
                    const rMonth = parseInt(parts[1]) - 1;
                    const rDay = parseInt(parts[2]);

                    if (rDay <= currentDay) {
                        if (rYear === currentYear && rMonth === currentMonth) {
                            curVisits += row.visits || 0;
                        } else if (rYear === currentYear - 1 && rMonth === currentMonth) {
                            prevYearVisits += row.visits || 0;
                        } else if (rYear === prevMonthYear && rMonth === prevMonthIndex) {
                            prevMonthVisits += row.visits || 0;
                        }
                    }
                });
                updateTrendBadge('stat-trend-views', curVisits, prevYearVisits, prevMonthVisits);
            });
        }

        const statActive = document.getElementById('stat-active');
        if (statActive) statActive.textContent = active.length;

        // Tendencia Autos Activos (Año anterior o Fallback Mes anterior)
        let curActiveListings = 0;
        let prevYearActiveListings = 0;
        let prevMonthActiveListings = 0;
        allListings.forEach(l => {
            const dateStr = l.createdAt || l.created_at || l.publishedAt || l.published_at;
            if (!dateStr) return;
            const itemDate = new Date(dateStr);
            if (isNaN(itemDate.getTime())) return;

            const rYear = itemDate.getFullYear();
            const rMonth = itemDate.getMonth();
            const rDay = itemDate.getDate();

            if (rDay <= currentDay) {
                if (rYear === currentYear && rMonth === currentMonth) {
                    curActiveListings++;
                } else if (rYear === currentYear - 1 && rMonth === currentMonth) {
                    prevYearActiveListings++;
                } else if (rYear === prevMonthYear && rMonth === prevMonthIndex) {
                    prevMonthActiveListings++;
                }
            }
        });
        updateTrendBadge('stat-trend-active', curActiveListings, prevYearActiveListings, prevMonthActiveListings);
        if (typeof window.renderActiveCarsChart === 'function') window.renderActiveCarsChart();

        // Cargar historial de ventas asincrónicamente
        db.fetchSalesHistory().then(sales => {
            window.salesHistoryCache = sales;
            if (typeof window.updateQuickSales === 'function') {
                window.updateQuickSales('todo');
            }

            if (typeof window.renderSalesChart === 'function') {
                window.renderSalesChart();
            }

            // Tendencia Autos Vendidos (Año anterior o Fallback Mes anterior)
            const soldListings = allListings.filter(l => l.status === 'vendido');
            const salesMap = new Map();
            (sales || []).forEach(s => salesMap.set(String(s.listing_id || s.id), s));
            soldListings.forEach(l => {
                const key = String(l.id);
                if (!salesMap.has(key)) {
                    salesMap.set(key, {
                        listing_id: l.id,
                        sold_at: l.soldAt || l.sold_at || l.publishedAt || l.published_at || new Date().toISOString()
                    });
                }
            });
            const combinedSales = Array.from(salesMap.values());

            let curSales = 0;
            let prevYearSales = 0;
            let prevMonthSales = 0;
            combinedSales.forEach(s => {
                const dateStr = s.sold_at || s.soldAt || s.created_at;
                if (!dateStr) return;
                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return;

                const rYear = itemDate.getFullYear();
                const rMonth = itemDate.getMonth();
                const rDay = itemDate.getDate();

                if (rDay <= currentDay) {
                    if (rYear === currentYear && rMonth === currentMonth) {
                        curSales++;
                    } else if (rYear === currentYear - 1 && rMonth === currentMonth) {
                        prevYearSales++;
                    } else if (rYear === prevMonthYear && rMonth === prevMonthIndex) {
                        prevMonthSales++;
                    }
                }
            });
            updateTrendBadge('stat-trend-sold', curSales, prevYearSales, prevMonthSales);
        });

        const sidebarBadge = document.getElementById('sidebar-pending-badge');
        if (sidebarBadge) {
            sidebarBadge.textContent = pendingCount;
            sidebarBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
        }

        // Renovations badge
        const renewalsBadge = document.getElementById('sidebar-renewals-badge');
        if (renewalsBadge) {
            const renewalsCount = db.getPendingRenewals().length;
            renewalsBadge.textContent = renewalsCount;
            renewalsBadge.style.display = renewalsCount > 0 ? 'inline-block' : 'none';
        }

        // Active Ads stat
        const allAds = db.getAllAds();
        const activeAdsCount = allAds.filter(ad => db.isAdActive(ad)).length;
        const statActiveAds = document.getElementById('stat-active-ads');
        if (statActiveAds) {
            statActiveAds.textContent = activeAdsCount;
        }

        // Tendencia Publicidad (Año anterior o Fallback Mes anterior)
        let curAds = 0;
        let prevYearAds = 0;
        let prevMonthAds = 0;
        allAds.forEach(ad => {
            const dateStr = ad.createdAt || ad.created_at;
            if (!dateStr) return;
            const itemDate = new Date(dateStr);
            if (isNaN(itemDate.getTime())) return;

            const rYear = itemDate.getFullYear();
            const rMonth = itemDate.getMonth();
            const rDay = itemDate.getDate();

            if (rDay <= currentDay) {
                if (rYear === currentYear && rMonth === currentMonth) {
                    curAds++;
                } else if (rYear === currentYear - 1 && rMonth === currentMonth) {
                    prevYearAds++;
                } else if (rYear === prevMonthYear && rMonth === prevMonthIndex) {
                    prevMonthAds++;
                }
            }
        });
        updateTrendBadge('stat-trend-ads', curAds, prevYearAds, prevMonthAds);
        if (typeof window.renderActiveAdsChart === 'function') window.renderActiveAdsChart();
    }

    window.updateQuickSales = function (period, btnElement) {
        if (btnElement) {
            const container = btnElement.parentElement;
            const buttons = container.querySelectorAll('.quick-sale-btn');
            buttons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.background = 'var(--surface-light)';
                btn.style.color = 'var(--text-muted)';
                btn.style.borderColor = 'var(--border-color)';
            });

            btnElement.classList.add('active');
            btnElement.style.background = 'var(--primary-color)';
            btnElement.style.color = 'white';
            btnElement.style.borderColor = 'var(--primary-color)';
        }

        const sales = window.salesHistoryCache || [];
        const allListings = db.getAllListings();
        const soldListings = allListings.filter(l => l.status === 'vendido');

        // Unificar histórico de ventas con autos actualmente marcados como vendidos
        const salesMap = new Map();
        sales.forEach(s => salesMap.set(String(s.listing_id || s.id), s));
        soldListings.forEach(l => {
            const key = String(l.id);
            if (!salesMap.has(key)) {
                salesMap.set(key, {
                    listing_id: l.id,
                    sold_at: l.soldAt || l.sold_at || l.publishedAt || l.published_at || new Date().toISOString()
                });
            }
        });
        const combinedSales = Array.from(salesMap.values());

        let filteredCount = 0;
        const now = new Date();
        const todayStr = now.toDateString();

        if (period === 'todo') {
            filteredCount = combinedSales.length;
        } else {
            combinedSales.forEach(s => {
                const dateStr = s.sold_at || s.soldAt || s.created_at;
                if (!dateStr) return;

                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return;

                if (period === 'dia') {
                    if (itemDate.toDateString() === todayStr) {
                        filteredCount++;
                    }
                } else if (period === 'mes') {
                    if (itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()) {
                        filteredCount++;
                    }
                } else if (period === 'ano' || period === 'año') {
                    if (itemDate.getFullYear() === now.getFullYear()) {
                        filteredCount++;
                    }
                } else if (period === 'semana') {
                    const dayOfWeek = now.getDay();
                    const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    endOfWeek.setHours(23, 59, 59, 999);

                    if (itemDate >= startOfWeek && itemDate <= endOfWeek) {
                        filteredCount++;
                    }
                }
            });
        }

        const statSold = document.getElementById('stat-sold');
        if (statSold) statSold.textContent = filteredCount;
    };


    window.updateQuickViews = function (period, btnElement) {
        if (btnElement) {
            const container = btnElement.parentElement;
            const buttons = container.querySelectorAll('.quick-view-btn');
            buttons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.background = 'var(--surface-light)';
                btn.style.color = 'var(--text-muted)';
                btn.style.borderColor = 'var(--border-color)';
            });

            btnElement.classList.add('active');
            btnElement.style.background = 'var(--primary-color)';
            btnElement.style.color = 'white';
            btnElement.style.borderColor = 'var(--primary-color)';
        }

        let filteredViews = 0;
        const visitsData = window.trafficStatsCache || [];
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        if (period === 'todo') {
            // Sumar todo daily_visits histórico
            const totalDailyVisits = visitsData.reduce((sum, row) => sum + (row.visits || 0), 0);
            const allListings = db.getAllListings();
            const totalListingsViews = allListings.reduce((sum, l) => sum + (l.views || 0), 0);

            // Usar el mayor entre ambos para no restar vistas acumuladas históricas
            filteredViews = Math.max(totalDailyVisits, totalListingsViews);
        } else {
            const dayOfWeek = now.getDay();
            const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);

            visitsData.forEach(row => {
                const rowDateStr = row.date; // YYYY-MM-DD
                const parts = rowDateStr.split('-');
                const rowDate = new Date(parts[0], parts[1] - 1, parts[2]);

                if (period === 'dia') {
                    if (rowDateStr === todayStr) {
                        filteredViews += row.visits || 0;
                    }
                } else if (period === 'semana') {
                    if (rowDate >= startOfWeek && rowDateStr <= todayStr) {
                        filteredViews += row.visits || 0;
                    }
                } else if (period === 'mes') {
                    if (rowDate.getMonth() === now.getMonth() && rowDate.getFullYear() === now.getFullYear()) {
                        filteredViews += row.visits || 0;
                    }
                }
            });
        }

        const statViews = document.getElementById('stat-views');
        if (statViews) statViews.textContent = filteredViews;
    };


    function renderTrafficChart() {
        const chartContainer = document.getElementById('traffic-chart');
        const periodSelect = document.getElementById('traffic-period-select');
        if (!chartContainer) return;

        if (periodSelect && !periodSelect.dataset.listener) {
            periodSelect.dataset.listener = 'true';
            periodSelect.addEventListener('change', renderTrafficChart);
        }

        const period = periodSelect ? periodSelect.value : '7d';
        let labels = [];
        let data = [];
        const visitsData = window.trafficStatsCache || [];
        const now = new Date();

        if (period === '7d') {
            labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            data = [0, 0, 0, 0, 0, 0, 0];

            const dayOfWeek = now.getDay();
            const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);

            visitsData.forEach(row => {
                if (!row.date) return;
                const parts = row.date.split('-');
                const rowDate = new Date(parts[0], parts[1] - 1, parts[2]);
                if (rowDate >= startOfWeek) {
                    const rowDay = rowDate.getDay();
                    const index = rowDay === 0 ? 6 : rowDay - 1; // 0=Lun, 6=Dom
                    if (index >= 0 && index < 7) {
                        data[index] += row.visits || 0;
                    }
                }
            });
        } else if (period === 'month') {
            labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            data = new Array(12).fill(0);

            visitsData.forEach(row => {
                if (!row.date) return;
                const parts = row.date.split('-');
                if (parseInt(parts[0]) === now.getFullYear()) {
                    const monthIndex = parseInt(parts[1]) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        data[monthIndex] += row.visits || 0;
                    }
                }
            });
        } else if (period === 'year') {
            const currentYear = now.getFullYear();
            labels = [String(currentYear - 3), String(currentYear - 2), String(currentYear - 1), String(currentYear)];
            data = [0, 0, 0, 0];

            visitsData.forEach(row => {
                if (!row.date) return;
                const parts = row.date.split('-');
                const rowYear = parseInt(parts[0]);
                const diff = currentYear - rowYear;
                if (diff >= 0 && diff <= 3) {
                    data[3 - diff] += row.visits || 0;
                }
            });
        }

        let highlightIdx = -1;
        if (period === '7d') {
            const dayOfWeek = now.getDay();
            highlightIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        } else if (period === 'month') {
            highlightIdx = now.getMonth();
        } else if (period === 'year') {
            highlightIdx = 3;
        }

        const max = Math.max(...data, 1); // Evitar división por cero

        chartContainer.innerHTML = data.map((val, i) => {
            const height = (val / max) * 100;
            const isCurrent = (i === highlightIdx);

            const barBg = isCurrent
                ? 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)'
                : 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)';
            const barBorder = isCurrent ? '2px solid #38bdf8' : 'none';
            const trackBg = isCurrent
                ? 'rgba(56, 189, 248, 0.15)'
                : 'rgba(255, 255, 255, 0.03)';
            const trackBorder = isCurrent
                ? '1px dashed #38bdf8'
                : '1px solid transparent';
            const labelStyle = isCurrent
                ? 'font-size: 0.72rem; font-weight: 800; color: #ffffff; background: #2563eb; border: 1px solid #38bdf8; border-radius: 6px; padding: 2px 6px; box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);'
                : 'font-size: 0.7rem; color: var(--text-muted); text-align: center; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 100%;';
            const valStyle = isCurrent
                ? 'font-size: 0.72rem; font-weight: 800; color: #38bdf8; margin-bottom: 2px;'
                : `font-size: 0.68rem; font-weight: 600; color: ${val > 0 ? 'var(--text-main)' : 'var(--text-muted)'}; opacity: ${val > 0 ? 1 : 0.4}; margin-bottom: 2px;`;
            const barGlow = isCurrent ? 'box-shadow: 0 0 12px rgba(56, 189, 248, 0.8), inset 0 0 4px rgba(255, 255, 255, 0.5);' : '';

            return `
            <div class="bar-chart-col" onclick="window.showChartBreakdown('traffic', '${period}', ${i}, '${labels[i]}')" title="Ver desglose por ubicación (${labels[i]})" style="flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px; cursor: pointer;">
                <span class="bar-chart-val" style="${valStyle}">${val}</span>
                <div class="bar-chart-track" style="flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; background: ${trackBg}; border: ${trackBorder}; border-radius: 6px; padding: 4px 2px; transition: all 0.3s ease;">
                    <div class="bar-chart-bar" style="height: ${height}%; width: 75%; max-width: 32px; min-height: 4px; background: ${barBg}; border: ${barBorder}; ${barGlow} border-radius: 4px 4px 0 0; transition: height 0.4s ease;" title="${val} vistas ${isCurrent ? '(Actual)' : ''}"></div>
                </div>
                <span class="bar-chart-label" style="${labelStyle}">${labels[i]}</span>
            </div>
            `;
        }).join('');
    }
    window.renderTrafficChart = renderTrafficChart;

    function renderSalesChart() {
        const chartContainer = document.getElementById('sales-chart');
        const periodSelect = document.getElementById('sales-period-select');
        if (!chartContainer) return;

        if (periodSelect && !periodSelect.dataset.listener) {
            periodSelect.dataset.listener = 'true';
            periodSelect.addEventListener('change', renderSalesChart);
        }

        const period = periodSelect ? periodSelect.value : '7d';
        let labels = [];
        let data = [];
        const sales = window.salesHistoryCache || [];
        const allListings = (typeof db !== 'undefined' && db.getAllListings) ? db.getAllListings() : [];
        const soldListings = allListings.filter(l => l.status === 'vendido');

        // Unificar histórico de ventas con autos actualmente marcados como vendidos
        const salesMap = new Map();
        sales.forEach(s => salesMap.set(String(s.listing_id || s.id), s));
        soldListings.forEach(l => {
            const key = String(l.id);
            if (!salesMap.has(key)) {
                salesMap.set(key, {
                    listing_id: l.id,
                    sold_at: l.soldAt || l.sold_at || l.publishedAt || l.published_at || new Date().toISOString()
                });
            }
        });
        const combinedSales = Array.from(salesMap.values());
        const now = new Date();

        if (period === '7d') {
            labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            data = [0, 0, 0, 0, 0, 0, 0];

            const dayOfWeek = now.getDay();
            const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);

            combinedSales.forEach(s => {
                const dateStr = s.sold_at || s.soldAt || s.created_at;
                if (!dateStr) return;
                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return;
                if (itemDate >= startOfWeek) {
                    const itemDay = itemDate.getDay();
                    const index = itemDay === 0 ? 6 : itemDay - 1; // 0=Lun, 6=Dom
                    if (index >= 0 && index < 7) {
                        data[index]++;
                    }
                }
            });
        } else if (period === 'month') {
            labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            data = new Array(12).fill(0);

            combinedSales.forEach(s => {
                const dateStr = s.sold_at || s.soldAt || s.created_at;
                if (!dateStr) return;
                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return;
                if (itemDate.getFullYear() === now.getFullYear()) {
                    const monthIndex = itemDate.getMonth();
                    if (monthIndex >= 0 && monthIndex < 12) {
                        data[monthIndex]++;
                    }
                }
            });
        } else if (period === 'year') {
            const currentYear = now.getFullYear();
            labels = [String(currentYear - 3), String(currentYear - 2), String(currentYear - 1), String(currentYear)];
            data = [0, 0, 0, 0];

            combinedSales.forEach(s => {
                const dateStr = s.sold_at || s.soldAt || s.created_at;
                if (!dateStr) return;
                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return;
                const rowYear = itemDate.getFullYear();
                const diff = currentYear - rowYear;
                if (diff >= 0 && diff <= 3) {
                    data[3 - diff]++;
                }
            });
        }

        let highlightIdx = -1;
        if (period === '7d') {
            const dayOfWeek = now.getDay();
            highlightIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        } else if (period === 'month') {
            highlightIdx = now.getMonth();
        } else if (period === 'year') {
            highlightIdx = 3;
        }

        const max = Math.max(...data, 1); // Evitar división por cero

        chartContainer.innerHTML = data.map((val, i) => {
            const height = (val / max) * 100;
            const isCurrent = (i === highlightIdx);

            const barBg = isCurrent
                ? 'linear-gradient(180deg, #facc15 0%, #ea580c 100%)'
                : 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)';
            const barBorder = isCurrent ? '2px solid #facc15' : 'none';
            const trackBg = isCurrent
                ? 'rgba(251, 191, 36, 0.15)'
                : 'rgba(255, 255, 255, 0.03)';
            const trackBorder = isCurrent
                ? '1px dashed #facc15'
                : '1px solid transparent';
            const labelStyle = isCurrent
                ? 'font-size: 0.72rem; font-weight: 800; color: #000000; background: #facc15; border: 1px solid #fbbf24; border-radius: 6px; padding: 2px 6px; box-shadow: 0 0 8px rgba(250, 204, 21, 0.5);'
                : 'font-size: 0.7rem; color: var(--text-muted); text-align: center; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 100%;';
            const valStyle = isCurrent
                ? 'font-size: 0.72rem; font-weight: 800; color: #fbbf24; margin-bottom: 2px;'
                : `font-size: 0.68rem; font-weight: 600; color: ${val > 0 ? 'var(--text-main)' : 'var(--text-muted)'}; opacity: ${val > 0 ? 1 : 0.4}; margin-bottom: 2px;`;
            const barGlow = isCurrent ? 'box-shadow: 0 0 12px rgba(250, 204, 21, 0.8), inset 0 0 4px rgba(255, 255, 255, 0.5);' : '';

            return `
            <div class="bar-chart-col" onclick="window.showChartBreakdown('sales', '${period}', ${i}, '${labels[i]}')" title="Ver desglose por ubicación (${labels[i]})" style="flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px; cursor: pointer;">
                <span class="bar-chart-val" style="${valStyle}">${val}</span>
                <div class="bar-chart-track" style="flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; background: ${trackBg}; border: ${trackBorder}; border-radius: 6px; padding: 4px 2px; transition: all 0.3s ease;">
                    <div class="bar-chart-bar" style="height: ${height}%; width: 75%; max-width: 32px; min-height: 4px; background: ${barBg}; border: ${barBorder}; ${barGlow} border-radius: 4px 4px 0 0; transition: height 0.4s ease;" title="${val} autos vendidos ${isCurrent ? '(Actual)' : ''}"></div>
                </div>
                <span class="bar-chart-label" style="${labelStyle}">${labels[i]}</span>
            </div>
            `;
        }).join('');
    }
    window.renderSalesChart = renderSalesChart;

    function renderActiveCarsChart() {
        const chartContainer = document.getElementById('active-cars-chart');
        const periodSelect = document.getElementById('active-cars-period-select');
        if (!chartContainer) return;

        if (periodSelect && !periodSelect.dataset.listener) {
            periodSelect.dataset.listener = 'true';
            periodSelect.addEventListener('change', renderActiveCarsChart);
        }

        const period = periodSelect ? periodSelect.value : '7d';
        let labels = [];
        let data = [];
        const allListings = (typeof db !== 'undefined' && db.getAllListings) ? db.getAllListings() : [];
        const activeListings = allListings.filter(l => l.status === 'autorizado');
        const now = new Date();

        if (period === '7d') {
            labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            data = [0, 0, 0, 0, 0, 0, 0];

            const dayOfWeek = now.getDay();
            const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);

            activeListings.forEach(l => {
                const dateStr = l.publishedAt || l.published_at || l.createdAt || l.created_at;
                if (!dateStr) return;
                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return;
                if (itemDate >= startOfWeek) {
                    const itemDay = itemDate.getDay();
                    const index = itemDay === 0 ? 6 : itemDay - 1; // 0=Lun, 6=Dom
                    if (index >= 0 && index < 7) {
                        data[index]++;
                    }
                }
            });
        } else if (period === 'month') {
            labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            data = new Array(12).fill(0);

            activeListings.forEach(l => {
                const dateStr = l.publishedAt || l.published_at || l.createdAt || l.created_at;
                if (!dateStr) return;
                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return;
                if (itemDate.getFullYear() === now.getFullYear()) {
                    const monthIndex = itemDate.getMonth();
                    if (monthIndex >= 0 && monthIndex < 12) {
                        data[monthIndex]++;
                    }
                }
            });
        } else if (period === 'year') {
            const currentYear = now.getFullYear();
            labels = [String(currentYear - 3), String(currentYear - 2), String(currentYear - 1), String(currentYear)];
            data = [0, 0, 0, 0];

            activeListings.forEach(l => {
                const dateStr = l.publishedAt || l.published_at || l.createdAt || l.created_at;
                if (!dateStr) return;
                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return;
                const rowYear = itemDate.getFullYear();
                const diff = currentYear - rowYear;
                if (diff >= 0 && diff <= 3) {
                    data[3 - diff]++;
                }
            });
        }

        let highlightIdx = -1;
        if (period === '7d') {
            const dayOfWeek = now.getDay();
            highlightIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        } else if (period === 'month') {
            highlightIdx = now.getMonth();
        } else if (period === 'year') {
            highlightIdx = 3;
        }

        const max = Math.max(...data, 1);

        chartContainer.innerHTML = data.map((val, i) => {
            const height = (val / max) * 100;
            const isCurrent = (i === highlightIdx);

            const barBg = isCurrent
                ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                : 'linear-gradient(180deg, #10b981 0%, #047857 100%)';
            const barBorder = isCurrent ? '2px solid #34d399' : 'none';
            const trackBg = isCurrent
                ? 'rgba(52, 211, 153, 0.15)'
                : 'rgba(255, 255, 255, 0.03)';
            const trackBorder = isCurrent
                ? '1px dashed #34d399'
                : '1px solid transparent';
            const labelStyle = isCurrent
                ? 'font-size: 0.72rem; font-weight: 800; color: #ffffff; background: #059669; border: 1px solid #34d399; border-radius: 6px; padding: 2px 6px; box-shadow: 0 0 8px rgba(52, 211, 153, 0.5);'
                : 'font-size: 0.7rem; color: var(--text-muted); text-align: center; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 100%;';
            const valStyle = isCurrent
                ? 'font-size: 0.72rem; font-weight: 800; color: #34d399; margin-bottom: 2px;'
                : `font-size: 0.68rem; font-weight: 600; color: ${val > 0 ? 'var(--text-main)' : 'var(--text-muted)'}; opacity: ${val > 0 ? 1 : 0.4}; margin-bottom: 2px;`;
            const barGlow = isCurrent ? 'box-shadow: 0 0 12px rgba(52, 211, 153, 0.8), inset 0 0 4px rgba(255, 255, 255, 0.5);' : '';

            return `
            <div class="bar-chart-col" onclick="window.showChartBreakdown('active-cars', '${period}', ${i}, '${labels[i]}')" title="Ver desglose por ubicación (${labels[i]})" style="flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px; cursor: pointer;">
                <span class="bar-chart-val" style="${valStyle}">${val}</span>
                <div class="bar-chart-track" style="flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; background: ${trackBg}; border: ${trackBorder}; border-radius: 6px; padding: 4px 2px; transition: all 0.3s ease;">
                    <div class="bar-chart-bar" style="height: ${height}%; width: 75%; max-width: 32px; min-height: 4px; background: ${barBg}; border: ${barBorder}; ${barGlow} border-radius: 4px 4px 0 0; transition: height 0.4s ease;" title="${val} autos activos ${isCurrent ? '(Actual)' : ''}"></div>
                </div>
                <span class="bar-chart-label" style="${labelStyle}">${labels[i]}</span>
            </div>
            `;
        }).join('');
    }
    window.renderActiveCarsChart = renderActiveCarsChart;

    function renderActiveAdsChart() {
        const chartContainer = document.getElementById('active-ads-chart');
        const periodSelect = document.getElementById('active-ads-period-select');
        if (!chartContainer) return;

        if (periodSelect && !periodSelect.dataset.listener) {
            periodSelect.dataset.listener = 'true';
            periodSelect.addEventListener('change', renderActiveAdsChart);
        }

        const period = periodSelect ? periodSelect.value : '7d';
        let labels = [];
        let data = [];
        const allAds = (typeof db !== 'undefined' && db.getAllAds) ? db.getAllAds() : [];
        const activeAds = allAds.filter(ad => (typeof db.isAdActive === 'function' ? db.isAdActive(ad) : (ad.status === 'activo' || ad.active)));
        const now = new Date();

        if (period === '7d') {
            labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            data = [0, 0, 0, 0, 0, 0, 0];

            const dayOfWeek = now.getDay();
            const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);

            activeAds.forEach(ad => {
                const dateStr = ad.approvedAt || ad.approved_at || ad.createdAt || ad.created_at;
                if (!dateStr) return;
                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return;
                if (itemDate >= startOfWeek) {
                    const itemDay = itemDate.getDay();
                    const index = itemDay === 0 ? 6 : itemDay - 1; // 0=Lun, 6=Dom
                    if (index >= 0 && index < 7) {
                        data[index]++;
                    }
                }
            });
        } else if (period === 'month') {
            labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            data = new Array(12).fill(0);

            activeAds.forEach(ad => {
                const dateStr = ad.approvedAt || ad.approved_at || ad.createdAt || ad.created_at;
                if (!dateStr) return;
                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return;
                if (itemDate.getFullYear() === now.getFullYear()) {
                    const monthIndex = itemDate.getMonth();
                    if (monthIndex >= 0 && monthIndex < 12) {
                        data[monthIndex]++;
                    }
                }
            });
        } else if (period === 'year') {
            const currentYear = now.getFullYear();
            labels = [String(currentYear - 3), String(currentYear - 2), String(currentYear - 1), String(currentYear)];
            data = [0, 0, 0, 0];

            activeAds.forEach(ad => {
                const dateStr = ad.approvedAt || ad.approved_at || ad.createdAt || ad.created_at;
                if (!dateStr) return;
                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return;
                const rowYear = itemDate.getFullYear();
                const diff = currentYear - rowYear;
                if (diff >= 0 && diff <= 3) {
                    data[3 - diff]++;
                }
            });
        }

        let highlightIdx = -1;
        if (period === '7d') {
            const dayOfWeek = now.getDay();
            highlightIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        } else if (period === 'month') {
            highlightIdx = now.getMonth();
        } else if (period === 'year') {
            highlightIdx = 3;
        }

        const max = Math.max(...data, 1);

        chartContainer.innerHTML = data.map((val, i) => {
            const height = (val / max) * 100;
            const isCurrent = (i === highlightIdx);

            const barBg = isCurrent
                ? 'linear-gradient(180deg, #c084fc 0%, #7c3aed 100%)'
                : 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)';
            const barBorder = isCurrent ? '2px solid #c084fc' : 'none';
            const trackBg = isCurrent
                ? 'rgba(192, 132, 252, 0.15)'
                : 'rgba(255, 255, 255, 0.03)';
            const trackBorder = isCurrent
                ? '1px dashed #c084fc'
                : '1px solid transparent';
            const labelStyle = isCurrent
                ? 'font-size: 0.72rem; font-weight: 800; color: #ffffff; background: #7c3aed; border: 1px solid #c084fc; border-radius: 6px; padding: 2px 6px; box-shadow: 0 0 8px rgba(192, 132, 252, 0.5);'
                : 'font-size: 0.7rem; color: var(--text-muted); text-align: center; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 100%;';
            const valStyle = isCurrent
                ? 'font-size: 0.72rem; font-weight: 800; color: #c084fc; margin-bottom: 2px;'
                : `font-size: 0.68rem; font-weight: 600; color: ${val > 0 ? 'var(--text-main)' : 'var(--text-muted)'}; opacity: ${val > 0 ? 1 : 0.4}; margin-bottom: 2px;`;
            const barGlow = isCurrent ? 'box-shadow: 0 0 12px rgba(192, 132, 252, 0.8), inset 0 0 4px rgba(255, 255, 255, 0.5);' : '';

            return `
            <div class="bar-chart-col" onclick="window.showChartBreakdown('active-ads', '${period}', ${i}, '${labels[i]}')" title="Ver desglose por ubicación (${labels[i]})" style="flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px; cursor: pointer;">
                <span class="bar-chart-val" style="${valStyle}">${val}</span>
                <div class="bar-chart-track" style="flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; background: ${trackBg}; border: ${trackBorder}; border-radius: 6px; padding: 4px 2px; transition: all 0.3s ease;">
                    <div class="bar-chart-bar" style="height: ${height}%; width: 75%; max-width: 32px; min-height: 4px; background: ${barBg}; border: ${barBorder}; ${barGlow} border-radius: 4px 4px 0 0; transition: height 0.4s ease;" title="${val} publicidad activa ${isCurrent ? '(Actual)' : ''}"></div>
                </div>
                <span class="bar-chart-label" style="${labelStyle}">${labels[i]}</span>
            </div>
            `;
        }).join('');
    }
    window.renderActiveAdsChart = renderActiveAdsChart;

    // ==========================================
    // HOOK DE DESGLOSE POR UBICACIÓN DE GRÁFICOS
    // ==========================================
    function useChartBreakdownHook() {
        function getPeriodRange(period, index) {
            const now = new Date();
            if (period === '7d') {
                const dayOfWeek = now.getDay();
                const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
                const targetStart = new Date(startOfWeek);
                targetStart.setDate(targetStart.getDate() + index);
                const targetEnd = new Date(targetStart);
                targetEnd.setHours(23, 59, 59, 999);
                return { start: targetStart, end: targetEnd };
            } else if (period === 'month') {
                const year = now.getFullYear();
                const targetStart = new Date(year, index, 1, 0, 0, 0, 0);
                const targetEnd = new Date(year, index + 1, 0, 23, 59, 59, 999);
                return { start: targetStart, end: targetEnd };
            } else if (period === 'year') {
                const currentYear = now.getFullYear();
                const year = currentYear - (3 - index);
                const targetStart = new Date(year, 0, 1, 0, 0, 0, 0);
                const targetEnd = new Date(year, 11, 31, 23, 59, 59, 999);
                return { start: targetStart, end: targetEnd };
            }
            return { start: null, end: null };
        }

        function resolveState(city, state) {
            if (state && typeof state === 'string' && state.trim() !== '') return state.trim();
            if (!city || typeof city !== 'string' || city.trim() === '') return 'Baja California';
            const cleanCity = city.trim();
            if (typeof catalogData !== 'undefined' && catalogData.citiesByState) {
                for (const [st, cities] of Object.entries(catalogData.citiesByState)) {
                    if (Array.isArray(cities) && cities.includes(cleanCity)) {
                        return st;
                    }
                }
            }
            if (['Mexicali', 'Tijuana', 'Ensenada', 'Tecate', 'Rosarito', 'San Quintín'].includes(cleanCity)) return 'Baja California';
            if (['Hermosillo', 'Ciudad Obregón', 'Nogales', 'San Luis Río Colorado', 'Guaymas'].includes(cleanCity)) return 'Sonora';
            if (['Chihuahua', 'Ciudad Juárez', 'Delicias', 'Cuauhtémoc'].includes(cleanCity)) return 'Chihuahua';
            return 'Baja California';
        }

        function computeBreakdown(chartType, period, index) {
            const { start, end } = getPeriodRange(period, index);
            const cityMap = new Map();

            if (chartType === 'sales') {
                const sales = window.salesHistoryCache || [];
                const allListings = (typeof db !== 'undefined' && db.getAllListings) ? db.getAllListings() : [];
                const soldListings = allListings.filter(l => l.status === 'vendido');
                const salesMap = new Map();
                sales.forEach(s => salesMap.set(String(s.listing_id || s.id), s));
                soldListings.forEach(l => {
                    const key = String(l.id);
                    if (!salesMap.has(key)) {
                        salesMap.set(key, {
                            listing_id: l.id,
                            sold_at: l.soldAt || l.sold_at || l.publishedAt || l.published_at || new Date().toISOString()
                        });
                    }
                });
                const combinedSales = Array.from(salesMap.values());
                const listingsById = new Map();
                allListings.forEach(l => listingsById.set(String(l.id), l));

                combinedSales.forEach(s => {
                    const dateStr = s.sold_at || s.soldAt || s.created_at;
                    if (!dateStr) return;
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return;
                    if (start && end && (d < start || d > end)) return;

                    const l = listingsById.get(String(s.listing_id || s.id)) || {};
                    const rawCity = l.city || s.city || 'Mexicali';
                    const city = rawCity.split(',')[0].trim();
                    const state = resolveState(city, l.state || s.state);
                    const groupKey = `${city}|${state}`;
                    cityMap.set(groupKey, (cityMap.get(groupKey) || 0) + 1);
                });
            } else if (chartType === 'active-cars') {
                const allListings = (typeof db !== 'undefined' && db.getAllListings) ? db.getAllListings() : [];
                const activeListings = allListings.filter(l => l.status === 'autorizado');
                activeListings.forEach(l => {
                    const dateStr = l.publishedAt || l.published_at || l.createdAt || l.created_at;
                    if (!dateStr) return;
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return;
                    if (start && end && (d < start || d > end)) return;

                    const rawCity = l.city || 'Mexicali';
                    const city = rawCity.split(',')[0].trim();
                    const state = resolveState(city, l.state);
                    const groupKey = `${city}|${state}`;
                    cityMap.set(groupKey, (cityMap.get(groupKey) || 0) + 1);
                });
            } else if (chartType === 'active-ads') {
                const allAds = (typeof db !== 'undefined' && db.getAllAds) ? db.getAllAds() : [];
                const activeAds = allAds.filter(ad => (typeof db.isAdActive === 'function' ? db.isAdActive(ad) : (ad.status === 'activo' || ad.active)));
                activeAds.forEach(ad => {
                    const dateStr = ad.approvedAt || ad.approved_at || ad.createdAt || ad.created_at;
                    if (!dateStr) return;
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return;
                    if (start && end && (d < start || d > end)) return;

                    const rawCity = ad.city || ad.target_city || 'Mexicali';
                    const city = rawCity.split(',')[0].trim();
                    const state = resolveState(city, ad.state);
                    const groupKey = `${city}|${state}`;
                    cityMap.set(groupKey, (cityMap.get(groupKey) || 0) + 1);
                });
            } else if (chartType === 'traffic') {
                const visitsData = window.trafficStatsCache || [];
                visitsData.forEach(row => {
                    if (!row.date) return;
                    const parts = row.date.split('-');
                    const d = new Date(parts[0], parts[1] - 1, parts[2]);
                    if (start && end && (d < start || d > end)) return;

                    const visits = row.visits || 1;
                    const rawCity = row.city || 'Desconocida';
                    const city = rawCity.split(',')[0].trim();
                    const state = resolveState(city, row.state || 'Desconocido');
                    const groupKey = `${city}|${state}`;
                    cityMap.set(groupKey, (cityMap.get(groupKey) || 0) + visits);
                });
            }

            const items = [];
            let grandTotal = 0;
            cityMap.forEach((count, key) => {
                const [city, state] = key.split('|');
                items.push({ city, state, count });
                grandTotal += count;
            });

            items.sort((a, b) => b.count - a.count);

            return { items, grandTotal };
        }

        return { computeBreakdown };
    }
    window.useChartBreakdownHook = useChartBreakdownHook;

    window.showChartBreakdown = async function(chartType, period, index, label) {
        const modal = document.getElementById('chart-breakdown-modal');
        if (!modal) return;

        // Refrescar analíticas de visitas en vivo desde Supabase para ver las visitas más recientes
        if (chartType === 'traffic' && typeof db !== 'undefined' && db && typeof db.fetchTrafficStats === 'function') {
            try {
                const freshData = await db.fetchTrafficStats();
                if (freshData && Array.isArray(freshData)) {
                    window.trafficStatsCache = freshData;
                }
            } catch (e) {
                console.warn("Error refrescando trafficStatsCache:", e);
            }
        }

        const hook = typeof window.useChartBreakdownHook === 'function' ? window.useChartBreakdownHook() : null;
        if (!hook) return;

        const { items, grandTotal } = hook.computeBreakdown(chartType, period, index);

        const titles = {
            'sales': 'Autos Vendidos',
            'active-cars': 'Autos Activos',
            'active-ads': 'Publicidad Activa',
            'traffic': 'Tráfico de Visitas'
        };
        const chartTitle = titles[chartType] || 'Estadísticas';

        const colorTheme = {
            'sales': { main: '#fbbf24', bg: 'rgba(250, 204, 21, 0.15)', border: 'rgba(250, 204, 21, 0.4)', fill: 'linear-gradient(90deg, #facc15, #ea580c)' },
            'active-cars': { main: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.4)', fill: 'linear-gradient(90deg, #34d399, #059669)' },
            'active-ads': { main: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: 'rgba(192, 132, 252, 0.4)', fill: 'linear-gradient(90deg, #c084fc, #7c3aed)' },
            'traffic': { main: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.4)', fill: 'linear-gradient(90deg, #38bdf8, #2563eb)' }
        };
        const theme = colorTheme[chartType] || colorTheme['traffic'];

        const modalTitleEl = document.getElementById('chart-breakdown-modal-title');
        const modalSubtitleEl = document.getElementById('chart-breakdown-subtitle');
        const totalBadgeEl = document.getElementById('chart-breakdown-total-badge');
        const tableBodyEl = document.getElementById('chart-breakdown-table-body');
        const tableFootEl = document.getElementById('chart-breakdown-table-foot');

        if (modalTitleEl) {
            modalTitleEl.innerHTML = `<span class="material-symbols-rounded" style="color: ${theme.main}; font-size: 22px;">analytics</span> Desglose por Ubicación — ${chartTitle} (${label})`;
        }
        if (modalSubtitleEl) {
            modalSubtitleEl.textContent = `Desglose de ${chartTitle.toLowerCase()} por ciudad y estado para el periodo ${label}`;
        }
        if (totalBadgeEl) {
            totalBadgeEl.style.color = theme.main;
            totalBadgeEl.style.background = theme.bg;
            totalBadgeEl.style.borderColor = theme.border;
            totalBadgeEl.textContent = `Total: ${grandTotal} ${chartType === 'traffic' ? 'vistas' : 'autos'}`;
        }

        if (tableBodyEl) {
            if (items.length === 0) {
                tableBodyEl.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 28px; color: #94a3b8; font-size: 0.9rem;">
                            <span class="material-symbols-rounded" style="font-size: 32px; display: block; margin: 0 auto 8px; opacity: 0.5;">info</span>
                            No hay registros disponibles para este periodo.
                        </td>
                    </tr>
                `;
            } else {
                tableBodyEl.innerHTML = items.map(item => {
                    const percent = grandTotal > 0 ? ((item.count / grandTotal) * 100).toFixed(1) : 0;
                    return `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #f1f5f9; transition: background 0.2s;">
                            <td style="padding: 14px 16px; font-weight: 600;">${item.city}</td>
                            <td style="padding: 14px 16px; color: #94a3b8;">${item.state}</td>
                            <td style="padding: 14px 16px; text-align: center; font-weight: 700; color: ${theme.main}; font-size: 1rem;">${item.count}</td>
                            <td style="padding: 14px 16px;">
                                <div class="breakdown-percent-container">
                                    <span class="breakdown-percent-val" style="color: ${theme.main}; min-width: 55px;">${percent}%</span>
                                    <div class="breakdown-percent-track">
                                        <div class="breakdown-percent-fill" style="width: ${percent}%; background: ${theme.fill};"></div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }

        if (tableFootEl) {
            const uniqueStates = new Set(items.map(i => i.state)).size;
            tableFootEl.innerHTML = `
                <tr style="color: #f8fafc; background: rgba(255,255,255,0.03);">
                    <td style="padding: 14px 16px; font-weight: 700;">TOTAL GENERAL</td>
                    <td style="padding: 14px 16px; color: #94a3b8;">${uniqueStates} Estado${uniqueStates !== 1 ? 's' : ''}</td>
                    <td style="padding: 14px 16px; text-align: center; color: ${theme.main}; font-size: 1.1rem; font-weight: 800;">${grandTotal}</td>
                    <td style="padding: 14px 16px; color: ${theme.main}; font-weight: 800;">100%</td>
                </tr>
            `;
        }

        modal.classList.add('active');
    };

    async function renderAdminInventory() {
        const tbody = document.getElementById('inventory-table-body');
        const badge = document.getElementById('inventory-count-badge');
        const searchInput = document.getElementById('inventory-search-input');
        const stateFilter = document.getElementById('inventory-state-filter');
        const cityFilter = document.getElementById('inventory-city-filter');

        if (!tbody) return;

        // Populate state dropdown if empty
        if (stateFilter && stateFilter.options.length <= 1 && catalogData && catalogData.citiesByState) {
            Object.keys(catalogData.citiesByState).sort().forEach(state => {
                const opt = document.createElement('option');
                opt.value = state;
                opt.textContent = state;
                stateFilter.appendChild(opt);
            });

            // Listeners
            stateFilter.addEventListener('change', () => {
                const selectedState = stateFilter.value;
                cityFilter.innerHTML = '<option value="Todas">Todas las Ciudades</option>';
                if (selectedState !== 'Todos' && catalogData.citiesByState[selectedState]) {
                    catalogData.citiesByState[selectedState].sort().forEach(city => {
                        const opt = document.createElement('option');
                        opt.value = city;
                        opt.textContent = city;
                        cityFilter.appendChild(opt);
                    });
                }
                renderAdminInventory();
            });
            cityFilter.addEventListener('change', () => renderAdminInventory());
            if (searchInput) searchInput.addEventListener('input', () => renderAdminInventory());
        }

        let activeListings = db.getAllListings().filter(l => l.status === 'autorizado' || l.status === 'activo');

        // Apply filters
        const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const state = stateFilter ? stateFilter.value : 'Todos';
        const city = cityFilter ? cityFilter.value : 'Todas';

        if (q) {
            activeListings = activeListings.filter(l =>
                (l.title && l.title.toLowerCase().includes(q)) ||
                (l.make && l.make.toLowerCase().includes(q)) ||
                (l.model && l.model.toLowerCase().includes(q)) ||
                (l.phone && l.phone.includes(q)) ||
                (l.ref_number && String(l.ref_number).includes(q)) ||
                (String(l.id).includes(q))
            );
        }

        if (state !== 'Todos') {
            // Find which cities belong to the state
            const validCities = catalogData.citiesByState[state] || [];
            if (city !== 'Todas') {
                activeListings = activeListings.filter(l => l.city === city);
            } else {
                activeListings = activeListings.filter(l => validCities.includes(l.city));
            }
        } else if (city !== 'Todas') {
            activeListings = activeListings.filter(l => l.city === city);
        }

        if (badge) badge.textContent = activeListings.length;

        const stateKey = JSON.stringify(activeListings);
        if (tbody.dataset.lastState === stateKey) return;
        tbody.dataset.lastState = stateKey;

        if (activeListings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding: 24px;">No se encontraron autos con estos filtros.</td></tr>';
            return;
        }

        tbody.innerHTML = activeListings.map(listing => {
            const img = listing.images && listing.images.length > 0 ? listing.images[0] : (listing.image || 'https://via.placeholder.com/50');
            const refNum = listing.ref_number || listing.id;
            const isExtension = listing.publisher_id === 'extension' || 
                                listing.publisher_id === 'admin_fb_importer' || 
                                (listing.notes && JSON.stringify(listing.notes).includes('Extensión')) ||
                                (listing.source && listing.source.includes('extension'));
            let expiryText = '';
            if (listing.expiresAt) {
                const expDate = new Date(listing.expiresAt);
                const formatter = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
                expiryText = ` &bull; <span style="color:#f59e0b;">Vence: ${formatter.format(expDate)}</span>`;
            }

            return `
            <tr>
                <td style="text-align:center; padding: 6px 4px;">
                    <span style="display:inline-block; background:rgba(99,102,241,0.12); color:var(--primary-color); border-radius:6px; padding:3px 7px; font-size:0.75rem; font-weight:700; letter-spacing:0.03em; white-space:nowrap;">#${refNum}</span>
                </td>
                <td>
                    <img src="${img}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                </td>
                <td>
                    <strong>${listing.title}</strong>
                    ${isExtension ? '<span style="display:inline-block; margin-left:6px; background:rgba(59,130,246,0.18); color:#60a5fa; border:1px solid rgba(59,130,246,0.4); border-radius:4px; padding:1px 6px; font-size:0.7rem; font-weight:700; vertical-align:middle;">(Extensión)</span>' : ''}<br>
                    <small style="color:var(--text-muted)">${listing.year} &bull; ${listing.city}${expiryText}</small>
                </td>
                <td style="white-space: nowrap;">${usePriceFormatterHook(listing)}</td>
                <td>${listing.views || 0}</td>
                <td>
                    <button class="icon-btn" onclick="openEditListingAdmin(${listing.id})" style="color: #10b981;" title="Editar publicación"><span class="material-symbols-rounded">edit</span></button>
                    <button class="icon-btn" onclick="document.getElementById('admin-dashboard-modal').classList.remove('active'); openListingDetails(${listing.id})" style="color: var(--primary-color);" title="Ver publicación"><span class="material-symbols-rounded">visibility</span></button>
                    <button class="icon-btn" onclick="deleteListingAdmin(${listing.id})" style="color: var(--danger-color);" title="Eliminar"><span class="material-symbols-rounded">delete</span></button>
                </td>
            </tr>
            `;
        }).join('');
    }

    async function updateAdminApprovals() {
        const list = document.getElementById('pending-approvals-list');
        const badge = document.getElementById('pending-count-badge');
        const sidebarBadge = document.getElementById('sidebar-pending-badge');
        const searchInput = document.getElementById('pending-search-input');

        if (!list) return;

        let pending = db.getAllListings().filter(l => l.status === 'pendiente autorizacion');
        if (badge) badge.textContent = pending.length;

        if (sidebarBadge) {
            sidebarBadge.textContent = pending.length;
            sidebarBadge.style.display = pending.length > 0 ? 'inline-block' : 'none';
        }

        // Listener de búsqueda (evitar duplicar listener)
        if (searchInput && !searchInput.dataset.hasListener) {
            searchInput.dataset.hasListener = 'true';
            searchInput.addEventListener('input', () => {
                updateAdminApprovals();
                if (typeof updateAdminAdsApprovals === 'function') updateAdminAdsApprovals();
            });
        }

        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (query) {
            pending = pending.filter(l =>
                (l.title && l.title.toLowerCase().includes(query)) ||
                (l.make && l.make.toLowerCase().includes(query)) ||
                (l.model && l.model.toLowerCase().includes(query)) ||
                (l.city && l.city.toLowerCase().includes(query)) ||
                (l.phone && l.phone.includes(query))
            );
        }

        // Ordenar: items con nota CRM reciente van al final (cola de revisión)
        if (window.pendingListingsMoveToEnd && window.pendingListingsMoveToEnd.size > 0) {
            pending.sort((a, b) => {
                const aEnd = window.pendingListingsMoveToEnd.has(String(a.id)) ? 1 : 0;
                const bEnd = window.pendingListingsMoveToEnd.has(String(b.id)) ? 1 : 0;
                return aEnd - bEnd;
            });
        }

        const stateKey = JSON.stringify(pending) + '_' + query + '_' + Array.from(window.pendingListingsMoveToEnd || []).join(',');
        if (list.dataset.lastState === stateKey) return;
        list.dataset.lastState = stateKey;

        if (pending.length === 0) {
            list.innerHTML = query
                ? '<p style="color:var(--text-muted); text-align:center; padding: 20px;">No se encontraron resultados para la búsqueda.</p>'
                : '<p style="color:var(--text-muted); text-align:center; padding: 20px;">No hay publicaciones pendientes de aprobación.</p>';
            return;
        }

        list.innerHTML = pending.map(listing => {
            const payInfo = getListingPaymentInfo(listing);
            const images = listing.images || (listing.image ? [listing.image] : []);
            const mainImg = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1590362891991-f766f5f76b4a?auto=format&fit=crop&w=600&q=80';
            const imgGalleryHTML = images.map((img, index) => `
                <div style="position: relative; display: inline-block;">
                    <img src="${img}" onclick="event.stopPropagation(); window.open('${img}', '_blank')" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); flex-shrink: 0; cursor: pointer;" title="Ver imagen en tamaño completo">
                    <button onclick="event.stopPropagation(); deleteListingImageAdmin(${listing.id}, ${index})" title="Eliminar Foto" style="position: absolute; top: 4px; right: 4px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;">
                        <span class="material-symbols-rounded" style="font-size: 16px;">delete</span>
                    </button>
                </div>
            `).join('');

            const notes = listing.notes || [];
            const notesCount = notes.length;
            const notesBadgeHTML = notesCount > 0
                ? `<span class="pending-notes-badge has-notes" id="notes-badge-${listing.id}"><span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle;">chat</span> ${notesCount} nota(s) CRM</span>`
                : `<span class="pending-notes-badge" id="notes-badge-${listing.id}">Sin notas</span>`;

            const notesListHTML = notes.length > 0 ? notes.map(n => `
                <div class="crm-note-item">
                    <div class="crm-note-time">
                        <span class="material-symbols-rounded" style="font-size:13px; vertical-align:middle;">schedule</span> ${n.timestamp}
                    </div>
                    <div class="crm-note-text">${n.text}</div>
                </div>
            `).join('') : `<p id="no-notes-msg-${listing.id}" style="color:var(--text-muted); font-size:0.82rem; margin:0;">No hay notas registradas aún. Escribe abajo para dejar evidencia.</p>`;

            const isExpanded = window.expandedAdminCards && window.expandedAdminCards.has(String(listing.id));

            // Badge de pago con tarjeta (Mercado Pago)
            const paymentBadgeHTML = listing.paymentStatus === 'paid'
                ? `<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; display: inline-flex; align-items: center; gap: 4px; margin-left: 6px;">
                    <span class="material-symbols-rounded" style="font-size: 13px;">credit_card</span> PAGADO CON TARJETA
                   </span>`
                : '';

            return `
            <div class="pending-approval-card ${isExpanded ? 'expanded' : ''}" id="pending-card-${listing.id}">
                <!-- Encabezado Compacto de Fila -->
                <div class="pending-row-header" onclick="togglePendingDetail(${listing.id})">
                    <div class="pending-row-left">
                        <div class="pending-thumb-wrapper">
                            <img src="${mainImg}" alt="${listing.title}">
                            ${images.length > 1 ? `<span class="pending-img-count">📸 ${images.length}</span>` : ''}
                        </div>
                        <div class="pending-main-info">
                            <div class="pending-title">${listing.title} ${paymentBadgeHTML}</div>
                            <div class="pending-sub-info">
                                <span class="pending-price-tag">${usePriceFormatterHook(listing)}</span>
                                <span>📍 ${listing.city}</span>
                                <span class="copyable-phone" onclick="event.stopPropagation(); copyToClipboard('${listing.phone}', 'Teléfono')" title="Clic para copiar teléfono">📞 ${listing.phone}</span>
                                ${listing.whatsapp ? `<a href="${buildAdminWhatsAppUrl(listing.whatsapp, listing.title)}" target="_blank" rel="noopener noreferrer" style="background:#25D366; color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; text-decoration:none; display:inline-flex; align-items:center; margin-left:6px;" onclick="event.stopPropagation();"><span class="material-symbols-rounded" style="font-size:12px; margin-right:4px;">chat</span> WhatsApp</a>` : ''}
                                ${notesBadgeHTML}
                            </div>
                            <div style="font-size: 0.82rem; color: ${listing.paymentStatus === 'paid' ? 'var(--success-color)' : 'var(--danger-color)'}; font-weight: bold; margin-top: 3px;">
                                ${listing.paymentStatus === 'paid' ? '✅ Pago con tarjeta confirmado — Solo falta tu aprobación' : payInfo.textDesc}
                            </div>
                        </div>
                    </div>
                    <div class="pending-row-right">
                        <button class="danger-btn" onclick="event.stopPropagation(); deleteListingAdmin(${listing.id})" title="Rechazar publicación" style="padding: 6px 12px; display:flex; align-items:center; gap:4px;">
                            <span class="material-symbols-rounded" style="font-size:16px;">close</span> Rechazar
                        </button>
                        <button class="success-btn" onclick="event.stopPropagation(); approveListing(${listing.id})" title="Aprobar publicación" style="padding: 6px 12px; display:flex; align-items:center; gap:4px;">
                            <span class="material-symbols-rounded" style="font-size:16px;">check</span> Aprobar
                        </button>
                        <span id="pending-expand-icon-${listing.id}" class="material-symbols-rounded" style="transition: transform 0.2s; color: var(--text-muted); ${isExpanded ? 'transform: rotate(180deg);' : ''}">expand_more</span>
                    </div>
                </div>

                <!-- Panel Expandible de Detalle y CRM -->
                <div class="pending-detail-panel">
                    <!-- Fotos -->
                    ${images.length > 0 ? `
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">Fotos (${images.length}):</div>
                            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: thin;">
                                ${imgGalleryHTML}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Especificaciones -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; font-size: 0.85rem; background: var(--surface-color); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
                        <button class="primary-btn" onclick="event.stopPropagation(); openAdminEditModal(${listing.id})" style="grid-column: 1 / -1; margin-bottom: 8px; justify-content: center; display: flex; align-items: center; gap: 4px; padding: 6px; font-size: 0.85rem; background: var(--surface-light); border: 1px solid var(--border-color);">
                            <span class="material-symbols-rounded" style="font-size: 16px;">edit</span> Editar Datos de la Publicación
                        </button>
                        <div><strong>Precio Auto:</strong> <span style="color: var(--success-color); white-space: nowrap;">${usePriceFormatterHook(listing)}</span></div>
                        <div><strong>Por Pagar:</strong> <span style="color: var(--danger-color); font-weight: bold;">$${payInfo.calculatedPrice.toFixed(2)} pesos</span></div>
                        <div><strong>Año:</strong> ${listing.year}</div>
                        <div><strong>Marca:</strong> ${listing.make}</div>
                        <div><strong>Modelo:</strong> ${listing.model}</div>
                        <div><strong>Tipo:</strong> ${listing.type || '-'}</div>
                        <div><strong>Motor:</strong> ${listing.engine || '-'}</div>
                        <div><strong>Transmisión:</strong> ${listing.transmission || '-'}</div>
                        ${listing.box ? `<div><strong>Caja:</strong> ${listing.box}</div>` : ''}
                        <div><strong>KM/Millas:</strong> ${useMileageFormatterHook(listing.mileage)}</div>
                        <div><strong>Situación:</strong> ${listing.legal || '-'}</div>
                        <div><strong>A/C:</strong> ${listing.ac || '-'}</div>
                        <div><strong>Ubicación:</strong> ${listing.state ? listing.state + ', ' : ''}${listing.city}</div>
                        <div><strong>Teléfono:</strong> <span class="copyable-phone" onclick="copyToClipboard('${listing.phone}', 'Teléfono')" title="Clic para copiar al portapapeles">${listing.phone}</span></div>
                        ${listing.whatsapp ? `<div style="grid-column: span 1;"><strong>WhatsApp:</strong> <span class="copyable-phone" onclick="copyToClipboard('${listing.whatsapp}', 'WhatsApp')" title="Clic para copiar al portapapeles">${listing.whatsapp}</span> <a href="${buildAdminWhatsAppUrl(listing.whatsapp, listing.title)}" target="_blank" rel="noopener noreferrer" style="background:#25D366; color:white; padding:2px 8px; border-radius:4px; font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center; margin-left:8px;" onclick="event.stopPropagation();">Abrir Chat</a></div>` : ''}
                    </div>

                    <!-- Módulo CRM de Bitácora / Notas de Seguimiento -->
                    <div class="crm-notes-container">
                        <div class="crm-notes-header">
                            <span style="display:flex; align-items:center; gap:6px;">
                                <span class="material-symbols-rounded" style="color:var(--primary-color);">history_edu</span>
                                Bitácora de Evidencia / Seguimiento CRM
                            </span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">Historial guardado permanente</span>
                        </div>
                        <div class="crm-notes-list" id="crm-notes-list-${listing.id}">
                            ${notesListHTML}
                        </div>
                        <div style="display:flex; gap:8px;">
                            <input type="text" id="note-input-${listing.id}" placeholder="Escribe un avance o razón del seguimiento (ej: llamada, promesa de pago)..." style="flex:1; padding:8px 12px; border-radius:6px; border:1px solid var(--border-color); background:var(--surface-light); color:var(--text-main); font-size:0.85rem; outline:none;" onkeydown="if(event.key==='Enter'){ event.preventDefault(); savePendingNote(${listing.id}); }">
                            <button class="primary-btn" onclick="savePendingNote(${listing.id})" style="width:auto; padding:8px 14px; font-size:0.85rem; border-radius:6px;">
                                <span class="material-symbols-rounded" style="font-size:16px;">save</span> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    window.updateAdminPendingAds = function () {
        return window.updateAdminAdsApprovals();
    };

    window.approveAdAdmin = async function (adId) {
        window.appConfirm('¿Aprobar este anuncio publicitario? Quedará activo por 30 días.', async () => {
            try {
                const ads = db.getAllAds();
                const ad = ads.find(a => String(a.id) === String(adId));
                if (ad) {
                    ad.is_active = true;
                    ad.payment_status = 'pagado';
                    const now = new Date();
                    ad.start_date = now.toISOString();
                    const end = new Date(now);
                    end.setDate(end.getDate() + 30);
                    ad.end_date = end.toISOString();

                    await db.saveAd(ad);

                    const amount = window.useAdPricingHook ? window.useAdPricingHook.getAdPrice(ad) : (globalAdMonthlyPrice || 500);
                    db.addAdPayment(ad.id, amount, null, 'Publicidad', 'manual');
                    db.logActivity('Autorización de publicidad', `Publicidad #${ad.id} (${ad.title || 'Sin título'})`, ad.city || ad.target_city || 'Global');

                    showAlert('Anuncio publicitario aprobado exitosamente', 'Aprobado', 'check_circle');
                    if (typeof forceInstantAdminRefresh === 'function') forceInstantAdminRefresh();
                    if (typeof updateAdminPendingAds === 'function') updateAdminPendingAds();
                    if (typeof renderMyListings === 'function') renderMyListings();
                }
            } catch (e) {
                showAlert('Error al aprobar anuncio', 'Error', 'error');
            }
        });
    };

    window.deleteAdAdmin = async function (adId) {
        try {
            await db.deleteAd(adId);
            showAlert('Anuncio eliminado', 'Eliminado', 'info');
            if (typeof forceInstantAdminRefresh === 'function') forceInstantAdminRefresh();
            if (typeof renderMyListings === 'function') renderMyListings();
        } catch (e) {
            showAlert('Error al eliminar anuncio', 'Error', 'error');
        }
    };

    function updateAdminRenewals() {
        const list = document.getElementById('renewals-list');
        const badge = document.getElementById('renewals-count-badge');
        const sidebarBadge = document.getElementById('sidebar-renewals-badge');
        const searchInput = document.getElementById('renewals-search-input');

        if (!list) return;

        const now = new Date();
        const alertThreshold = new Date(now);
        alertThreshold.setDate(alertThreshold.getDate() + 5); // 5 días de anticipación

        let pendingRenewals = db.getAllListings().filter(l => {
            if (l.status !== 'autorizado') return false;
            // Solo publicaciones con expiresAt (sistema rolling billing)
            // Las de prueba/seed sin fecha nunca aparecen aquí
            if (!l.expiresAt) return false;

            // Excluir publicaciones de la Extensión (no se renuevan, se auto-eliminan a los 15 días)
            const isFromExtension = l.publisherId === 'admin_fb_importer' || l.publisher_id === 'admin_fb_importer' ||
                                    (Array.isArray(l.notes) && l.notes.some(n => n && n.type === 'origen' && n.text === 'Extensión'));
            if (isFromExtension) return false;

            const expDate = new Date(l.expiresAt);
            return expDate <= alertThreshold; // Vence en <= 5 días o ya venció
        });

        // Auto-limpiar CRM: la primera vez que un listing entra a Renovaciones, borrar sus notas
        const clearedListings = getRenewalClearedSet('listings');
        pendingRenewals.forEach(listing => {
            if (!clearedListings.has(String(listing.id))) {
                markRenewalCleared('listings', listing.id);
                db.clearListingNotes(listing.id); // Limpia en DB (localStorage + Supabase async)
                listing.notes = []; // Actualiza referencia local para el render inmediato
            }
        });

        // Filtrado por búsqueda
        if (searchInput && !searchInput.dataset.hasListener) {
            searchInput.dataset.hasListener = 'true';
            searchInput.addEventListener('input', () => updateAdminRenewals());
        }

        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (query) {
            pendingRenewals = pendingRenewals.filter(l =>
                (l.title && l.title.toLowerCase().includes(query)) ||
                (l.make && l.make.toLowerCase().includes(query)) ||
                (l.model && l.model.toLowerCase().includes(query)) ||
                (l.phone && l.phone.includes(query))
            );
        }

        if (badge) badge.textContent = pendingRenewals.length;
        if (sidebarBadge) {
            sidebarBadge.textContent = pendingRenewals.length;
            sidebarBadge.style.display = pendingRenewals.length > 0 ? 'inline-block' : 'none';
        }

        // Ordenar: items con nota CRM reciente van al final (cola de revisión)
        if (window.pendingListingsMoveToEnd && window.pendingListingsMoveToEnd.size > 0) {
            pendingRenewals.sort((a, b) => {
                const aEnd = window.pendingListingsMoveToEnd.has(String(a.id)) ? 1 : 0;
                const bEnd = window.pendingListingsMoveToEnd.has(String(b.id)) ? 1 : 0;
                return aEnd - bEnd;
            });
        }

        const stateKey = JSON.stringify(pendingRenewals) + '_' + query + '_' + Array.from(window.pendingListingsMoveToEnd || []).join(',');
        if (list.dataset.lastState === stateKey) return;
        list.dataset.lastState = stateKey;

        if (pendingRenewals.length === 0) {
            list.innerHTML = query
                ? '<p style="color:var(--text-muted); text-align:center; padding: 20px;">No se encontraron resultados para la búsqueda.</p>'
                : '<p style="color:var(--text-muted); text-align:center; padding: 20px;">No hay publicaciones próximas a vencer (dentro de los próximos 5 días).</p>';
            return;
        }

        list.innerHTML = pendingRenewals.map(listing => {
            const payInfo = getListingPaymentInfo(listing, true);
            const images = listing.images || (listing.image ? [listing.image] : []);
            const mainImg = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1590362891991-f766f5f76b4a?auto=format&fit=crop&w=600&q=80';
            const imgGalleryHTML = images.map((img, index) => `
                <div style="position: relative; display: inline-block;">
                    <img src="${img}" onclick="event.stopPropagation(); window.open('${img}', '_blank')" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); flex-shrink: 0; cursor: pointer;" title="Ver imagen en tamaño completo">
                    <button onclick="event.stopPropagation(); deleteListingImageAdmin(${listing.id}, ${index})" title="Eliminar Foto" style="position: absolute; top: 4px; right: 4px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;">
                        <span class="material-symbols-rounded" style="font-size: 16px;">delete</span>
                    </button>
                </div>
            `).join('');

            const notes = listing.notes || [];
            const notesCount = notes.length;
            const notesBadgeHTML = notesCount > 0
                ? `<span class="pending-notes-badge has-notes" id="notes-badge-${listing.id}"><span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle;">chat</span> ${notesCount} nota(s) CRM</span>`
                : `<span class="pending-notes-badge" id="notes-badge-${listing.id}">Sin notas</span>`;

            const notesListHTML = notes.length > 0 ? notes.map(n => `
                <div class="crm-note-item">
                    <div class="crm-note-time">
                        <span class="material-symbols-rounded" style="font-size:13px; vertical-align:middle;">schedule</span> ${n.timestamp}
                    </div>
                    <div class="crm-note-text">${n.text}</div>
                </div>
            `).join('') : `<p id="no-notes-msg-${listing.id}" style="color:var(--text-muted); font-size:0.82rem; margin:0;">No hay notas registradas aún. Escribe abajo para dejar evidencia.</p>`;

            const isExpanded = window.expandedAdminCards && window.expandedAdminCards.has(String(listing.id));
            // Etiquetas de estado Rolling Billing
            let statusTagHTML = '';
            if (listing.expiresAt) {
                const expDate = new Date(listing.expiresAt);
                const diffTime = expDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                    statusTagHTML = `<span style="background:var(--danger-color); color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold; margin-left:6px;">¡CADUCADO!</span>`;
                } else if (diffDays <= 5) {
                    statusTagHTML = `<span style="background:#f59e0b; color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold; margin-left:6px;">Vence en ${diffDays} día(s)</span>`;
                }
            } else {
                // Compatibilidad legacy / seed data
                statusTagHTML = `<span style="background:var(--text-muted); color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold; margin-left:6px;">Sin Vencimiento</span>`;
            }

            return `
            <div class="pending-approval-card ${isExpanded ? 'expanded' : ''}" id="pending-card-${listing.id}">
                <div class="pending-row-header" onclick="togglePendingDetail(${listing.id})">
                    <div class="pending-row-left">
                        <div class="pending-thumb-wrapper">
                            <img src="${mainImg}" alt="${listing.title}">
                            ${images.length > 1 ? `<span class="pending-img-count">📸 ${images.length}</span>` : ''}
                        </div>
                        <div class="pending-main-info">
                            <div class="pending-title">${listing.title} ${statusTagHTML}</div>
                            <div class="pending-sub-info">
                                <span class="pending-price-tag">${usePriceFormatterHook(listing)}</span>
                                <span>📍 ${listing.city}</span>
                                <span class="copyable-phone" onclick="event.stopPropagation(); copyToClipboard('${listing.phone}', 'Teléfono')">📞 ${listing.phone}</span>
                                ${listing.whatsapp ? `<a href="${buildAdminWhatsAppUrl(listing.whatsapp, listing.title)}" target="_blank" rel="noopener noreferrer" style="background:#25D366; color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; text-decoration:none; display:inline-flex; align-items:center; margin-left:6px;" onclick="event.stopPropagation();"><span class="material-symbols-rounded" style="font-size:12px; margin-right:4px;">chat</span> WhatsApp</a>` : ''}
                                ${notesBadgeHTML}
                            </div>
                            <div style="font-size: 0.82rem; color: var(--danger-color); font-weight: bold; margin-top: 3px;">
                                ${payInfo.textDesc}
                            </div>
                        </div>
                    </div>
                    <div class="pending-row-right">
                        <button class="danger-btn" onclick="event.stopPropagation(); deleteListingAdmin(${listing.id}, false)" title="Eliminar del sistema" style="padding: 6px 12px; display:flex; align-items:center; gap:4px;">
                            <span class="material-symbols-rounded" style="font-size:16px;">close</span> Dar de Baja
                        </button>
                        <button class="success-btn" onclick="event.stopPropagation(); renewListingAdmin(${listing.id})" title="Renovar publicación por 30 días más" style="padding: 6px 12px; display:flex; align-items:center; gap:4px;">
                            <span class="material-symbols-rounded" style="font-size:16px;">autorenew</span> Renovar
                        </button>
                        <span id="pending-expand-icon-${listing.id}" class="material-symbols-rounded" style="transition: transform 0.2s; color: var(--text-muted); ${isExpanded ? 'transform: rotate(180deg);' : ''}">expand_more</span>
                    </div>
                </div>

                <!-- Panel Expandible de Detalle y CRM -->
                <div class="pending-detail-panel">
                    <!-- Fotos -->
                    ${images.length > 0 ? `
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">Fotos (${images.length}):</div>
                            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: thin;">
                                ${imgGalleryHTML}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Especificaciones -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; font-size: 0.85rem; background: var(--surface-color); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
                        <button class="primary-btn" onclick="event.stopPropagation(); openAdminEditModal(${listing.id})" style="grid-column: 1 / -1; margin-bottom: 8px; justify-content: center; display: flex; align-items: center; gap: 4px; padding: 6px; font-size: 0.85rem; background: var(--surface-light); border: 1px solid var(--border-color);">
                            <span class="material-symbols-rounded" style="font-size: 16px;">edit</span> Editar Datos de la Publicación
                        </button>
                        <div><strong>Precio Auto:</strong> <span style="color: var(--success-color); white-space: nowrap;">${usePriceFormatterHook(listing)}</span></div>
                        <div><strong>Por Pagar:</strong> <span style="color: var(--danger-color); font-weight: bold;">$${payInfo.calculatedPrice.toFixed(2)} pesos</span></div>
                        <div><strong>Año:</strong> ${listing.year}</div>
                        <div><strong>Marca:</strong> ${listing.make}</div>
                        <div><strong>Modelo:</strong> ${listing.model}</div>
                        <div><strong>Tipo:</strong> ${listing.type || '-'}</div>
                        <div><strong>Motor:</strong> ${listing.engine || '-'}</div>
                        <div><strong>Transmisión:</strong> ${listing.transmission || '-'}</div>
                        ${listing.box ? `<div><strong>Caja:</strong> ${listing.box}</div>` : ''}
                        <div><strong>KM/Millas:</strong> ${useMileageFormatterHook(listing.mileage)}</div>
                        <div><strong>Situación:</strong> ${listing.legal || '-'}</div>
                        <div><strong>A/C:</strong> ${listing.ac || '-'}</div>
                        <div><strong>Ubicación:</strong> ${listing.state ? listing.state + ', ' : ''}${listing.city}</div>
                        <div><strong>Teléfono:</strong> <span class="copyable-phone" onclick="copyToClipboard('${listing.phone}', 'Teléfono')" title="Clic para copiar al portapapeles">${listing.phone}</span></div>
                        ${listing.whatsapp ? `<div style="grid-column: span 1;"><strong>WhatsApp:</strong> <span class="copyable-phone" onclick="copyToClipboard('${listing.whatsapp}', 'WhatsApp')" title="Clic para copiar al portapapeles">${listing.whatsapp}</span> <a href="${buildAdminWhatsAppUrl(listing.whatsapp, listing.title)}" target="_blank" rel="noopener noreferrer" style="background:#25D366; color:white; padding:2px 8px; border-radius:4px; font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center; margin-left:8px;" onclick="event.stopPropagation();">Abrir Chat</a></div>` : ''}
                    </div>

                    <!-- Módulo CRM de Bitácora / Notas de Seguimiento -->
                    <div class="crm-notes-container">
                        <div class="crm-notes-header">
                            <span style="display:flex; align-items:center; gap:6px;">
                                <span class="material-symbols-rounded" style="color:var(--primary-color);">history_edu</span>
                                Bitácora de Evidencia / Seguimiento CRM
                            </span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">Historial guardado permanente</span>
                        </div>
                        <div class="crm-notes-list" id="crm-notes-list-${listing.id}">
                            ${notesListHTML}
                        </div>
                        <div style="display:flex; gap:8px;">
                            <input type="text" id="note-input-${listing.id}" placeholder="Escribe un avance o razón del seguimiento (ej: llamada, promesa de pago)..." style="flex:1; padding:8px 12px; border-radius:6px; border:1px solid var(--border-color); background:var(--surface-light); color:var(--text-main); font-size:0.85rem; outline:none;" onkeydown="if(event.key==='Enter'){ event.preventDefault(); savePendingNote(${listing.id}); }">
                            <button class="primary-btn" onclick="savePendingNote(${listing.id})" style="width:auto; padding:8px 14px; font-size:0.85rem; border-radius:6px;">
                                <span class="material-symbols-rounded" style="font-size:16px;">save</span> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    let pendingRenewActionTargetId = null;
    let pendingRenewActionMonthStr = null;

    window.renewListingAdmin = async function (id, isConfirmed = false) {
        if (!isConfirmed) {
            pendingRenewActionTargetId = id;
            pendingRenewActionMonthStr = ''; // ya no se usa, pero se mantiene por compatibilidad con los modales
            const listing = db.getAllListings().find(l => String(l.id) === String(id));
            if (listing) {
                const payInfo = getListingPaymentInfo(listing, true);
                const amountInput = document.getElementById('renew-payment-amount');
                const amountDisplay = document.getElementById('renew-payment-amount-display');
                if (amountInput) amountInput.value = payInfo.calculatedPrice.toFixed(2);
                if (amountDisplay) amountDisplay.textContent = `$${payInfo.calculatedPrice.toFixed(2)} MXN`;
            }
            const modal = document.getElementById('renew-confirm-modal');
            if (modal) modal.classList.add('active');
            return;
        }

        const listings = db.getAllListings();
        const idx = listings.findIndex(l => String(l.id) === String(id));
        if (idx !== -1) {
            const currentExp = listings[idx].expiresAt ? new Date(listings[idx].expiresAt) : new Date();
            const baseDate = currentExp > new Date() ? currentExp : new Date();
            baseDate.setDate(baseDate.getDate() + 30);
            listings[idx].expiresAt = baseDate.toISOString();
            listings[idx].status = 'autorizado';

            await db.saveListing(listings[idx]);
            const modal = document.getElementById('renew-confirm-modal');
            if (modal) modal.classList.remove('active');

            // Desmarcar tracking para que el próximo ciclo de vencimiento limpie CRM de nuevo
            unmarkRenewalCleared('listings', id);

            const listing = db.getAllListings().find(l => String(l.id) === String(id));
            const city = listing ? listing.city : 'N/A';
            db.logActivity('Renovación de vehículo', `Publicación #${id}`, city);

            forceInstantAdminRefresh();
            showAlert('Publicación renovada por 30 días más.', 'Renovación Exitosa', 'autorenew');
        }
    };

    // ================================================================
    // NUEVA FUNCIÓN: Publicidad próxima a vencer → Sección Renovaciones
    // ================================================================
    window.updateAdminAdsRenewals = function () {
        const list = document.getElementById('renewals-ads-list');
        const badge = document.getElementById('renewals-ads-count-badge');
        if (!list) return;

        const now = new Date();
        const alertThreshold = new Date(now);
        alertThreshold.setDate(alertThreshold.getDate() + 5); // 5 días de anticipación

        let expiringAds = db.getAllAds().filter(a => {
            if (!a.is_active) return false;
            if (!a.end_date) return false;
            const expDate = new Date(a.end_date);
            return expDate <= alertThreshold; // Vence en <= 5 días o ya venció
        });

        if (badge) badge.textContent = expiringAds.length;

        // Auto-limpiar CRM: la primera vez que un anuncio entra a Renovaciones, borrar sus notas
        const clearedAds = getRenewalClearedSet('ads');
        expiringAds.forEach(ad => {
            if (!clearedAds.has(String(ad.id))) {
                markRenewalCleared('ads', ad.id);
                db.clearAdNotes(ad.id); // Limpia en DB (localStorage + Supabase async)
                ad.notes = []; // Actualiza referencia local para el render inmediato
            }
        });

        // Ordenar: ads de renovación con nota CRM reciente van al final (cola de revisión)
        if (window.renewalAdsMoveToEnd && window.renewalAdsMoveToEnd.size > 0) {
            expiringAds.sort((a, b) => {
                const aEnd = window.renewalAdsMoveToEnd.has(String(a.id)) ? 1 : 0;
                const bEnd = window.renewalAdsMoveToEnd.has(String(b.id)) ? 1 : 0;
                return aEnd - bEnd;
            });
        }

        const stateKey = JSON.stringify(expiringAds) + '_' + Array.from(window.expandedAdminAdRenewCards || []).join(',') + '_' + Array.from(window.renewalAdsMoveToEnd || []).join(',');
        if (list.dataset.lastState === stateKey) return;
        list.dataset.lastState = stateKey;

        if (expiringAds.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 20px;">No hay publicidad próxima a renovar (dentro de los próximos 5 días).</p>';
            return;
        }

        list.innerHTML = expiringAds.map(ad => {
            const images = ad.images || [];
            const mainImg = images.length > 0 ? images[0] : 'https://via.placeholder.com/60';

            let notes = ad.notes || [];
            if (typeof notes === 'string') {
                try { notes = JSON.parse(notes); } catch (e) { notes = []; }
            }
            const notesCount = notes.length;
            const notesBadgeHTML = notesCount > 0
                ? `<span class="pending-notes-badge has-notes" id="ad-ren-notes-badge-${ad.id}"><span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle;">chat</span> ${notesCount} nota(s) CRM</span>`
                : `<span class="pending-notes-badge" id="ad-ren-notes-badge-${ad.id}">Sin notas</span>`;

            const notesListHTML = notes.length > 0 ? notes.map(n => `
                <div class="crm-note-item">
                    <div class="crm-note-time">
                        <span class="material-symbols-rounded" style="font-size:13px; vertical-align:middle;">schedule</span> ${n.timestamp}
                    </div>
                    <div class="crm-note-text">${n.text}</div>
                </div>
            `).join('') : `<p id="no-ad-ren-notes-msg-${ad.id}" style="color:var(--text-muted); font-size:0.82rem; margin:0;">No hay notas registradas aún. Escribe abajo para dejar evidencia.</p>`;

            const isExpanded = window.expandedAdminAdRenewCards && window.expandedAdminAdRenewCards.has(String(ad.id));

            // Calcular estado de vencimiento
            let statusTagHTML = '';
            if (ad.end_date) {
                const expDate = new Date(ad.end_date);
                const diffTime = expDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 0) {
                    statusTagHTML = `<span style="background:var(--danger-color); color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold; margin-left:6px;">¡CADUCADO!</span>`;
                } else {
                    statusTagHTML = `<span style="background:#f59e0b; color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:bold; margin-left:6px;">Vence en ${diffDays} día(s)</span>`;
                }
            }

            return `
            <div class="pending-approval-card ${isExpanded ? 'expanded' : ''}" id="renew-ad-card-${ad.id}" style="border-left: 4px solid #f59e0b;">
                <div class="pending-row-header" onclick="toggleRenewAdDetail(${ad.id})">
                    <div class="pending-row-left">
                        <div class="pending-thumb-wrapper">
                            <img src="${mainImg}" alt="${ad.title || 'Publicidad'}">
                            ${images.length > 1 ? `<span class="pending-img-count">📸 ${images.length}</span>` : ''}
                        </div>
                        <div class="pending-main-info">
                            <div class="pending-title">${ad.title || 'Sin título'} ${statusTagHTML}</div>
                            <div class="pending-sub-info">
                                <span>📍 ${ad.state ? ad.state + ' / ' : ''}${ad.city || ''}</span>
                                <span class="copyable-phone" onclick="event.stopPropagation(); copyToClipboard('${escapeHTML(ad.phone)}', 'Teléfono')">📞 ${escapeHTML(ad.phone || 'Sin tel')}</span>
                                ${ad.whatsapp ? `<a href="${typeof buildAdminWhatsAppUrl === 'function' ? buildAdminWhatsAppUrl(ad.whatsapp, ad.title) : '#'}" target="_blank" rel="noopener noreferrer" style="background:#25D366; color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; text-decoration:none; display:inline-flex; align-items:center; margin-left:6px;" onclick="event.stopPropagation();"><span class="material-symbols-rounded" style="font-size:12px; margin-right:4px;">chat</span> WhatsApp</a>` : ''}
                                ${notesBadgeHTML}
                            </div>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${escapeHTML(ad.description || 'Sin descripción')}
                            </div>
                        </div>
                    </div>
                    <div class="pending-row-right">
                        <button class="danger-btn" onclick="event.stopPropagation(); window.appConfirm('¿Dar de baja este anuncio de publicidad?', async () => { await db.deleteAd(${ad.id}); const l=document.getElementById('renewals-ads-list'); if(l) delete l.dataset.lastState; if(typeof updateAdminAdsRenewals==='function') updateAdminAdsRenewals(); showAlert('Publicidad dada de baja.', 'Baja registrada', 'check_circle'); })" title="Dar de baja anuncio" style="padding: 6px 12px; display:flex; align-items:center; gap:4px;">
                            <span class="material-symbols-rounded" style="font-size:16px;">close</span> Dar de Baja
                        </button>
                        <button class="success-btn" onclick="event.stopPropagation(); renewAdAdmin(${ad.id})" title="Renovar publicidad por 30 días más" style="padding: 6px 12px; display:flex; align-items:center; gap:4px; background:#f59e0b;">
                            <span class="material-symbols-rounded" style="font-size:16px;">autorenew</span> Renovar
                        </button>
                        <span id="renew-ad-expand-icon-${ad.id}" class="material-symbols-rounded" style="transition: transform 0.2s; color: var(--text-muted); ${isExpanded ? 'transform: rotate(180deg);' : ''}">expand_more</span>
                    </div>
                </div>

                <!-- Panel Expandible de Detalle y CRM de Renovación Publicidad -->
                <div class="pending-detail-panel">
                    <!-- Datos del anuncio -->
                    <div style="background: var(--surface-color); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.85rem; margin-bottom: 12px;">
                        <div style="font-weight: bold; font-size: 0.95rem; color: #f59e0b; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                            <span class="material-symbols-rounded" style="font-size: 18px;">campaign</span> Información de la Publicidad
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                            <div><strong>Título:</strong> ${ad.title || '-'}</div>
                            <div><strong>Ciudad:</strong> ${ad.state ? ad.state + ' / ' : ''}${ad.city || '-'}</div>
                            <div><strong>Teléfono:</strong> <span class="copyable-phone" onclick="event.stopPropagation(); copyToClipboard('${escapeHTML(ad.phone)}', 'Teléfono')" title="Clic para copiar">${escapeHTML(ad.phone || '-')}</span></div>
                            <div><strong>WhatsApp:</strong> ${ad.whatsapp ? `<span class="copyable-phone" onclick="event.stopPropagation(); copyToClipboard('${escapeHTML(ad.whatsapp)}', 'WhatsApp')">${escapeHTML(ad.whatsapp)}</span>` : '-'}</div>
                            <div><strong>Correo:</strong> ${ad.email || '-'}</div>
                            <div><strong>Fin de vigencia:</strong> ${ad.end_date ? new Date(ad.end_date).toLocaleDateString('es-MX') : '-'}</div>
                        </div>
                    </div>

                    <!-- Módulo CRM de Bitácora / Notas de Seguimiento Renovación Publicidad -->
                    <div class="crm-notes-container">
                        <div class="crm-notes-header">
                            <span style="display:flex; align-items:center; gap:6px;">
                                <span class="material-symbols-rounded" style="color:#f59e0b;">history_edu</span>
                                Bitácora CRM — Seguimiento Renovación
                            </span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">Historial guardado permanente</span>
                        </div>
                        <div class="crm-notes-list" id="crm-ad-ren-notes-list-${ad.id}">
                            ${notesListHTML}
                        </div>
                        <div style="display:flex; gap:8px;">
                            <input type="text" id="ad-ren-note-input-${ad.id}" placeholder="Escribe un seguimiento de renovación (ej: llamada, pago recibido)..." style="flex:1; padding:8px 12px; border-radius:6px; border:1px solid var(--border-color); background:var(--surface-light); color:var(--text-main); font-size:0.85rem; outline:none;" onkeydown="if(event.key==='Enter'){ event.preventDefault(); saveRenewalAdNote(${ad.id}); }">
                            <button class="primary-btn" onclick="saveRenewalAdNote(${ad.id})" style="width:auto; padding:8px 14px; font-size:0.85rem; border-radius:6px; background:#f59e0b;">
                                <span class="material-symbols-rounded" style="font-size:16px;">save</span> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    };

    // Toggle acordeón para Renovaciones → Publicidad
    window.expandedAdminAdRenewCards = window.expandedAdminAdRenewCards || new Set();

    window.toggleRenewAdDetail = function (id) {
        const targetIdStr = String(id);
        const isCurrentlyExpanded = window.expandedAdminAdRenewCards && window.expandedAdminAdRenewCards.has(targetIdStr);

        if (window.expandedAdminAdRenewCards) {
            window.expandedAdminAdRenewCards.forEach(openId => {
                const openCard = document.getElementById(`renew-ad-card-${openId}`);
                const openIcon = document.getElementById(`renew-ad-expand-icon-${openId}`);
                if (openCard) openCard.classList.remove('expanded');
                if (openIcon) openIcon.style.transform = 'rotate(0deg)';
            });
            window.expandedAdminAdRenewCards.clear();
        }

        if (!isCurrentlyExpanded) {
            const card = document.getElementById(`renew-ad-card-${id}`);
            const icon = document.getElementById(`renew-ad-expand-icon-${id}`);
            if (card) {
                card.classList.add('expanded');
                if (icon) icon.style.transform = 'rotate(180deg)';
                window.expandedAdminAdRenewCards.add(targetIdStr);
            }
        }
    };

    // Guardar nota CRM en Renovaciones → Publicidad (misma DB que Aprobaciones)
    window.saveRenewalAdNote = function (id) {
        const input = document.getElementById(`ad-ren-note-input-${id}`);
        if (!input || !input.value.trim()) return;

        const noteText = input.value.trim();
        const newNote = db.addAdNote(id, noteText);

        if (newNote) {
            input.value = '';

            const listEl = document.getElementById(`crm-ad-ren-notes-list-${id}`);
            const noMsgEl = document.getElementById(`no-ad-ren-notes-msg-${id}`);
            if (noMsgEl) noMsgEl.remove();

            if (listEl) {
                const noteItemHTML = `
                    <div class="crm-note-item" style="animation: fadeIn 0.3s ease;">
                        <div class="crm-note-time">
                            <span class="material-symbols-rounded" style="font-size:13px; vertical-align:middle;">schedule</span> ${newNote.timestamp}
                        </div>
                        <div class="crm-note-text">${newNote.text}</div>
                    </div>
                `;
                listEl.insertAdjacentHTML('afterbegin', noteItemHTML);
            }

            // Actualizar badge
            const ads = db.getAllAds();
            const ad = ads.find(a => String(a.id) === String(id));
            const notesCount = ad && ad.notes ? ad.notes.length : 1;
            const badgeEl = document.getElementById(`ad-ren-notes-badge-${id}`);
            if (badgeEl) {
                badgeEl.className = 'pending-notes-badge has-notes';
                badgeEl.innerHTML = `<span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle;">chat</span> ${notesCount} nota(s) CRM`;
            }

            // --- Auto-cerrar renglón y moverlo al final vía re-render ordenado ---
            const card = document.getElementById(`renew-ad-card-${id}`);
            if (card) {
                card.classList.remove('expanded');
                const icon = document.getElementById(`renew-ad-expand-icon-${id}`);
                if (icon) icon.style.transform = 'rotate(0deg)';
                if (window.expandedAdminAdRenewCards) window.expandedAdminAdRenewCards.delete(String(id));
            }
            // Marcar como "ya procesado" para que el render lo coloque al final
            window.renewalAdsMoveToEnd = window.renewalAdsMoveToEnd || new Set();
            window.renewalAdsMoveToEnd.add(String(id));
            // Forzar re-render con nuevo orden
            const renewalsAdsListEl = document.getElementById('renewals-ads-list');
            if (renewalsAdsListEl) delete renewalsAdsListEl.dataset.lastState;
            if (typeof updateAdminAdsRenewals === 'function') updateAdminAdsRenewals();
        }
    };

    // Renovar publicidad desde sección Renovaciones
    window.renewAdAdmin = async function (adId) {
        window.appConfirm('¿Renovar este anuncio publicitario por 30 días más?', async () => {
            try {
                const ads = db.getAllAds();
                const ad = ads.find(a => String(a.id) === String(adId));
                if (ad) {
                    const currentEnd = ad.end_date ? new Date(ad.end_date) : new Date();
                    const baseDate = currentEnd > new Date() ? currentEnd : new Date();
                    baseDate.setDate(baseDate.getDate() + 30);
                    ad.end_date = baseDate.toISOString();
                    ad.is_active = true;
                    ad.payment_status = 'pagado';

                    await db.saveAd(ad);

                    // Desmarcar tracking para que el próximo ciclo de vencimiento limpie CRM de nuevo
                    unmarkRenewalCleared('ads', adId);

                    db.logActivity('Renovación de publicidad', `Publicidad #${ad.id} (${ad.title || 'Sin título'})`, ad.city || ad.target_city || 'Global');
                    showAlert('Publicidad renovada por 30 días más.', 'Renovación Exitosa', 'autorenew');
                    forceInstantAdminRefresh();
                }
            } catch (e) {
                showAlert('Error al renovar publicidad', 'Error', 'error');
            }
        });
    };

    // ================================================================
    // HELPERS: Limpieza automática de CRM al entrar a Renovaciones
    // Se guarda en localStorage para persistir entre recargas de página
    // ================================================================
    function getRenewalClearedSet(type) {
        try {
            return new Set(JSON.parse(localStorage.getItem(`revista_renewal_cleared_${type}`) || '[]'));
        } catch (e) { return new Set(); }
    }

    function markRenewalCleared(type, id) {
        const set = getRenewalClearedSet(type);
        set.add(String(id));
        localStorage.setItem(`revista_renewal_cleared_${type}`, JSON.stringify(Array.from(set)));
    }

    function unmarkRenewalCleared(type, id) {
        const set = getRenewalClearedSet(type);
        set.delete(String(id));
        localStorage.setItem(`revista_renewal_cleared_${type}`, JSON.stringify(Array.from(set)));
    }

    function forceInstantAdminRefresh() {
        const pendingList = document.getElementById('pending-approvals-list');
        if (pendingList) delete pendingList.dataset.lastState;
        const renewalsList = document.getElementById('renewals-list');
        if (renewalsList) delete renewalsList.dataset.lastState;
        const renewalsAdsList = document.getElementById('renewals-ads-list');
        if (renewalsAdsList) delete renewalsAdsList.dataset.lastState;
        const inventoryTable = document.getElementById('inventory-table-body');
        if (inventoryTable) delete inventoryTable.dataset.lastState;
        const pendingAdsList = document.getElementById('pending-ads-list');
        if (pendingAdsList) delete pendingAdsList.dataset.lastState;
        const adsTableBody = document.getElementById('ads-table-body');
        if (adsTableBody) delete adsTableBody.dataset.lastState;
        // Invalidar caché del historial de cobros
        const billingBody = document.getElementById('billing-table-body');
        if (billingBody) delete billingBody.dataset.lastState;

        // Invalidar caché de "Mis Publicaciones" para asegurar actualización en tiempo real
        const myListingsContainer = document.getElementById('my-listings-container');
        if (myListingsContainer) delete myListingsContainer.dataset.lastState;

        if (typeof updateAdminApprovals === 'function') updateAdminApprovals();
        if (typeof updateAdminRenewals === 'function') updateAdminRenewals();
        if (typeof updateAdminAdsRenewals === 'function') updateAdminAdsRenewals();
        if (typeof renderAdminInventory === 'function') renderAdminInventory();
        if (typeof updateAdminAdsApprovals === 'function') updateAdminAdsApprovals();
        if (typeof renderAdminAdsTable === 'function') renderAdminAdsTable();
        if (typeof updateAdminStats === 'function') updateAdminStats();
        if (typeof renderFeed === 'function') renderFeed();
        if (typeof renderMyListings === 'function') renderMyListings();
        // Refrescar historial de cobros solo si Finanzas está activa
        const finanzasView = document.getElementById('tab-finanzas');
        if (finanzasView && finanzasView.classList.contains('active')) {
            if (typeof updateBillingList === 'function') updateBillingList();
        }
    }

    window.expandedAdminCards = window.expandedAdminCards || new Set();

    window.togglePendingDetail = function (id) {
        const targetIdStr = String(id);
        const isCurrentlyExpanded = window.expandedAdminCards && window.expandedAdminCards.has(targetIdStr);

        // Cerrar todas las tarjetas abiertas previamente (modo acordeón)
        if (window.expandedAdminCards) {
            window.expandedAdminCards.forEach(openId => {
                const openCard = document.getElementById(`pending-card-${openId}`);
                const openIcon = document.getElementById(`pending-expand-icon-${openId}`);
                if (openCard) openCard.classList.remove('expanded');
                if (openIcon) openIcon.style.transform = 'rotate(0deg)';
            });
            window.expandedAdminCards.clear();
        }

        // Si no estaba abierta, abrir la tarjeta seleccionada
        if (!isCurrentlyExpanded) {
            const card = document.getElementById(`pending-card-${id}`);
            const icon = document.getElementById(`pending-expand-icon-${id}`);
            if (card) {
                card.classList.add('expanded');
                if (icon) icon.style.transform = 'rotate(180deg)';
                window.expandedAdminCards.add(targetIdStr);
            }
        }
    };

    window.savePendingNote = function (id) {
        const input = document.getElementById(`note-input-${id}`);
        if (!input || !input.value.trim()) return;

        const noteText = input.value.trim();
        const newNote = db.addListingNote(id, noteText);

        if (newNote) {
            input.value = '';

            // Actualizar la lista visual de notas de este ítem dinámicamente
            const listEl = document.getElementById(`crm-notes-list-${id}`);
            const noMsgEl = document.getElementById(`no-notes-msg-${id}`);
            if (noMsgEl) noMsgEl.remove();

            if (listEl) {
                const noteItemHTML = `
                    <div class="crm-note-item" style="animation: fadeIn 0.3s ease;">
                        <div class="crm-note-time">
                            <span class="material-symbols-rounded" style="font-size:13px; vertical-align:middle;">schedule</span> ${newNote.timestamp}
                        </div>
                        <div class="crm-note-text">${newNote.text}</div>
                    </div>
                `;
                listEl.insertAdjacentHTML('afterbegin', noteItemHTML);
            }

            // Actualizar el badge de notas en la cabecera de la fila
            const listing = db.getAllListings().find(l => String(l.id) === String(id));
            const notesCount = listing && listing.notes ? listing.notes.length : 1;
            const badgeEl = document.getElementById(`notes-badge-${id}`);
            if (badgeEl) {
                badgeEl.className = 'pending-notes-badge has-notes';
                badgeEl.innerHTML = `<span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle;">chat</span> ${notesCount} nota(s) CRM`;
            }

            // --- Auto-cerrar renglón y moverlo al final vía re-render ordenado ---
            // (NO usamos appendChild directo para evitar duplicados con el re-render del polling)
            const card = document.getElementById(`pending-card-${id}`);
            if (card) {
                card.classList.remove('expanded');
                const icon = document.getElementById(`pending-expand-icon-${id}`);
                if (icon) icon.style.transform = 'rotate(0deg)';
                if (window.expandedAdminCards) window.expandedAdminCards.delete(String(id));
            }
            // Marcar este ID como "ya procesado" para que el render lo coloque al final
            window.pendingListingsMoveToEnd = window.pendingListingsMoveToEnd || new Set();
            window.pendingListingsMoveToEnd.add(String(id));
            // Forzar re-render con nuevo orden (el item irá al final de la lista)
            const pendingListEl = document.getElementById('pending-approvals-list');
            if (pendingListEl) delete pendingListEl.dataset.lastState;
            const renewalsListEl = document.getElementById('renewals-list');
            if (renewalsListEl) delete renewalsListEl.dataset.lastState;
            if (typeof updateAdminApprovals === 'function') updateAdminApprovals();
            if (typeof updateAdminRenewals === 'function') updateAdminRenewals();
        }
    };

    // --- Copy to Clipboard Helper ---
    window.copyToClipboard = function (text, label = 'Número') {
        if (!text) return;
        const cleanText = String(text).trim();

        const showSuccessAlert = () => {
            showAlert(`Copiado al portapapeles: ${cleanText}`, `¡${label} Copiado!`, 'content_copy');
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(cleanText).then(() => {
                showSuccessAlert();
            }).catch(() => {
                fallbackCopyText(cleanText, label);
            });
        } else {
            fallbackCopyText(cleanText, label);
        }
    };

    function fallbackCopyText(text, label) {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                showAlert(`Copiado al portapapeles: ${text}`, `¡${label} Copiado!`, 'content_copy');
            } else {
                showAlert(`Número: ${text}`, label, 'phone');
            }
        } catch (err) {
            showAlert(`Número: ${text}`, label, 'phone');
        }
    }

    // --- Confirmation Modals Logic for Approvals ---
    let pendingActionTargetId = null;

    window.approveListing = async function (id, isConfirmed = false) {
        if (!isConfirmed) {
            pendingActionTargetId = id;
            const listing = db.getAllListings().find(l => String(l.id) === String(id));
            if (listing) {
                const payInfo = getListingPaymentInfo(listing, false);
                const amountInput = document.getElementById('approve-payment-amount');
                const amountDisplay = document.getElementById('approve-payment-amount-display');
                if (amountInput) amountInput.value = payInfo.calculatedPrice.toFixed(2);
                if (amountDisplay) amountDisplay.textContent = `$${payInfo.calculatedPrice.toFixed(2)} MXN`;
            }
            const modal = document.getElementById('approve-confirm-modal');
            if (modal) modal.classList.add('active');
            return;
        }

        const listings = db.getAllListings();
        const listing = listings.find(l => String(l.id) === String(id));
        if (listing) {
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            // Rolling billing: expiresAt = hoy + 30 días
            const expiresAt = new Date(now);
            expiresAt.setDate(expiresAt.getDate() + 30);
            listing.status = 'autorizado';
            listing.lastRenewedMonth = currentMonthStr;
            listing.expiresAt = expiresAt.toISOString();
            listing.publishedAt = now.toISOString(); // fecha de publicación visible al usuario

            try {
                // Sincronizar local y con Supabase (esperamos a que termine)
                await db.saveListing(listing);
            } catch (e) {
                console.error("Error al aprobar:", e);
                showAlert('Hubo un error al aprobar en la nube. Intenta de nuevo.', 'Error', 'error');
                return; // Si falla, detenemos aquí
            }

            if (!catalogData.makes.includes(listing.make)) {
                db.addSuggestion('make', listing.make);
            }
            if (!catalogData.modelsByMake[listing.make] || !catalogData.modelsByMake[listing.make].includes(listing.model)) {
                db.addSuggestion('model', listing.model, listing.make);
            }
            if (listing.type && !catalogData.types.includes(listing.type)) {
                db.addSuggestion('type', listing.type);
            }
            if (listing.color && catalogData.colors && !catalogData.colors.includes(listing.color)) {
                db.addSuggestion('color', listing.color);
            }

            const modal = document.getElementById('approve-confirm-modal');
            if (modal) modal.classList.remove('active');

            const approvedListing = db.getAllListings().find(l => String(l.id) === String(id));
            const city = approvedListing ? approvedListing.city : 'N/A';
            db.logActivity('Aprobación de vehículo', `Publicación #${id}`, city);

            forceInstantAdminRefresh();
            showAlert('La publicación ha sido aprobada exitosamente.', 'Publicación Aprobada', 'check_circle');
        }
    };

    window.deleteListingAdmin = async function (id, isConfirmed = false) {
        if (!isConfirmed) {
            pendingActionTargetId = id;
            const modal = document.getElementById('reject-confirm-modal');
            if (modal) modal.classList.add('active');
            return;
        }

        // Eliminación local y en la nube manejada internamente por db.js
        await db.deleteListing(id);

        const modal = document.getElementById('reject-confirm-modal');
        if (modal) modal.classList.remove('active');

        const deletedListing = db.getAllListings().find(l => String(l.id) === String(id));
        const city = deletedListing ? deletedListing.city : 'N/A';
        db.logActivity('Baja de vehículo', `Publicación #${id}`, city);

        forceInstantAdminRefresh();
        showAlert('La publicación ha sido eliminada del sistema.', 'Publicación Eliminada', 'info');
    };

    let adminEditTargetId = null;

    window.openAdminEditModal = function (id) {
        const listing = db.getAllListings().find(l => String(l.id) === String(id));
        if (!listing) return;
        adminEditTargetId = id;

        document.getElementById('edit-price').value = listing.price || '';
        document.getElementById('edit-year').value = listing.year || '';
        document.getElementById('edit-mileage').value = listing.mileage || '';
        document.getElementById('edit-make').value = listing.make || '';
        document.getElementById('edit-model').value = listing.model || '';
        document.getElementById('edit-type').value = listing.type || '';
        document.getElementById('edit-transmission').value = listing.transmission || '';
        const phoneData = parseAndFormatPhone(listing.phone, listing);
        const waData = parseAndFormatPhone(listing.whatsapp, listing);

        const editPhoneLada = document.getElementById('edit-phone-lada');
        const editWaLada = document.getElementById('edit-whatsapp-lada');
        if (editPhoneLada) editPhoneLada.value = phoneData.prefix === '+1' ? '+1' : '+52';
        document.getElementById('edit-phone').value = phoneData.nationalDigits || listing.phone || '';

        if (editWaLada) editWaLada.value = waData.prefix === '+1' ? '+1' : '+52';
        document.getElementById('edit-whatsapp').value = waData.nationalDigits || listing.whatsapp || '';

        if (editPhoneLada && editWaLada) {
            editPhoneLada.onchange = (e) => {
                editWaLada.value = e.target.value;
            };
        }

        const modal = document.getElementById('admin-edit-modal');
        if (modal) modal.classList.add('active');
    };

    const btnCloseAdminEdit = document.getElementById('btn-close-admin-edit');
    const btnCancelAdminEdit = document.getElementById('btn-cancel-admin-edit');
    const btnSaveAdminEdit = document.getElementById('btn-save-admin-edit');

    function closeAdminEdit() {
        adminEditTargetId = null;
        const modal = document.getElementById('admin-edit-modal');
        if (modal) modal.classList.remove('active');
    }

    if (btnCloseAdminEdit) btnCloseAdminEdit.onclick = closeAdminEdit;
    if (btnCancelAdminEdit) btnCancelAdminEdit.onclick = (e) => { e.preventDefault(); closeAdminEdit(); };
    if (btnSaveAdminEdit) {
        btnSaveAdminEdit.onclick = async (e) => {
            e.preventDefault();
            if (adminEditTargetId === null) return;

            const rawPriceStr = (document.getElementById('edit-price').value || '').toString().replace(/[^0-9.]/g, '');
            const price = parseFloat(rawPriceStr);

            const rawYearStr = (document.getElementById('edit-year').value || '').toString().replace(/[^0-9]/g, '');
            const year = parseInt(rawYearStr, 10);

            const make = document.getElementById('edit-make').value.trim();
            const model = document.getElementById('edit-model').value.trim();
            const rawPhone = document.getElementById('edit-phone').value.trim();
            const phoneLada = document.getElementById('edit-phone-lada') ? document.getElementById('edit-phone-lada').value : '+52';
            const phoneDigits = rawPhone.replace(/[^0-9]/g, '').slice(-10);
            const phone = phoneDigits ? `${phoneLada} ${phoneDigits}` : '';

            const rawWa = document.getElementById('edit-whatsapp').value.trim();
            const waDigits = rawWa.replace(/[^0-9]/g, '').slice(-10);
            const wa = waDigits ? `${phoneLada} ${waDigits}` : '';

            if (isNaN(price) || !price || isNaN(year) || !year || !make || !model || !phone) {
                showAlert('Por favor llena los campos requeridos (Precio, Año, Marca, Modelo, Teléfono).', 'Faltan datos', 'warning');
                return;
            }

            const listings = db.getAllListings();
            const listingIndex = listings.findIndex(l => String(l.id) === String(adminEditTargetId));

            if (listingIndex > -1) {
                const newTitle = `${make} ${model} ${year}`.toUpperCase();
                const updatedListing = {
                    ...listings[listingIndex],
                    title: newTitle,
                    price: price,
                    year: year,
                    mileage: document.getElementById('edit-mileage').value.trim(),
                    make: make,
                    model: model,
                    type: document.getElementById('edit-type').value.trim(),
                    transmission: document.getElementById('edit-transmission').value.trim(),
                    phone: phone,
                    seller_phone: phone,
                    whatsapp: wa,
                    seller_whatsapp: wa
                };

                try {
                    await db.saveListing(updatedListing);
                    const listing = db.getAllListings().find(l => String(l.id) === String(adminEditTargetId));
                    const city = listing ? listing.city : 'N/A';
                    db.logActivity('Edición de vehículo', `Publicación #${adminEditTargetId}`, city);
                    if (updatedListing._pendingSync) {
                        showAlert('Guardado en tu dispositivo. Se subirá a la nube automáticamente cuando vuelva la conexión.', 'Guardado Offline', 'warning');
                    } else {
                        showAlert('Los datos del vehículo han sido actualizados con éxito en la nube.', 'Datos Guardados', 'check_circle');
                    }
                } catch (err) {
                    console.error("Error al guardar vehículo en Supabase:", err);
                    const localListings = JSON.parse(localStorage.getItem(db.listingsKey) || '[]');
                    const lIdx = localListings.findIndex(l => String(l.id) === String(adminEditTargetId));
                    if (lIdx > -1) {
                        localListings[lIdx] = { ...localListings[lIdx], ...updatedListing, _pendingSync: true };
                        localStorage.setItem(db.listingsKey, JSON.stringify(localListings));
                    }
                    showAlert('Guardado en tu dispositivo. Se subirá a la nube automáticamente cuando vuelva la conexión.', 'Guardado Offline', 'warning');
                }

                closeAdminEdit();

                // Limpiar dataset.lastState para forzar re-renderizado inmediato
                const pendingList = document.getElementById('pending-approvals-list');
                if (pendingList) delete pendingList.dataset.lastState;
                const renewalsList = document.getElementById('renewals-list');
                if (renewalsList) delete renewalsList.dataset.lastState;
                const inventoryTable = document.getElementById('inventory-table-body');
                if (inventoryTable) delete inventoryTable.dataset.lastState;

                if (typeof forceInstantAdminRefresh === 'function') forceInstantAdminRefresh();
                if (typeof updateAdminApprovals === 'function') updateAdminApprovals();
                if (typeof updateAdminRenewals === 'function') updateAdminRenewals();
                if (typeof renderAdminInventory === 'function') renderAdminInventory();
                if (typeof renderFeed === 'function') renderFeed();
            }
        };
    }

    let adminEditAdTargetId = null;

    window.openAdminEditAdModal = function (id) {
        const ad = db.getAllAds().find(a => String(a.id) === String(id));
        if (!ad) return;
        adminEditAdTargetId = id;

        document.getElementById('edit-ad-title').value = ad.title || '';
        document.getElementById('edit-ad-description').value = ad.description || '';
        document.getElementById('edit-ad-state').value = ad.state || '';
        document.getElementById('edit-ad-city').value = ad.city || '';
        const phoneData = parseAndFormatPhone(ad.phone, ad);
        const waData = parseAndFormatPhone(ad.whatsapp, ad);

        document.getElementById('edit-ad-phone').value = phoneData.nationalDigits || (ad.phone ? String(ad.phone).replace(/[^0-9]/g, '').slice(-10) : '');
        document.getElementById('edit-ad-whatsapp').value = waData.nationalDigits || (ad.whatsapp ? String(ad.whatsapp).replace(/[^0-9]/g, '').slice(-10) : '');
        document.getElementById('edit-ad-address').value = ad.address || '';
        document.getElementById('edit-ad-schedule-mf').value = ad.scheduleMF || '';
        document.getElementById('edit-ad-schedule-sat').value = ad.scheduleSat || '';
        document.getElementById('edit-ad-schedule-sun').value = ad.scheduleSun || '';
        document.getElementById('edit-ad-website').value = ad.website || '';

        const modal = document.getElementById('admin-edit-ad-modal');
        if (modal) modal.classList.add('active');
    };

    const btnCloseAdminEditAd = document.getElementById('btn-close-admin-edit-ad');
    const btnCancelAdminEditAd = document.getElementById('btn-cancel-admin-edit-ad');
    const btnSaveAdminEditAd = document.getElementById('btn-save-admin-edit-ad');

    function closeAdminEditAd() {
        adminEditAdTargetId = null;
        const modal = document.getElementById('admin-edit-ad-modal');
        if (modal) modal.classList.remove('active');
    }

    if (btnCloseAdminEditAd) btnCloseAdminEditAd.onclick = closeAdminEditAd;
    if (btnCancelAdminEditAd) btnCancelAdminEditAd.onclick = (e) => { e.preventDefault(); closeAdminEditAd(); };
    if (btnSaveAdminEditAd) {
        btnSaveAdminEditAd.onclick = async (e) => {
            e.preventDefault();
            if (adminEditAdTargetId === null) return;

            const title = document.getElementById('edit-ad-title').value.trim();
            const desc = document.getElementById('edit-ad-description').value.trim();

            if (!title || !desc) {
                showAlert('Por favor llena los campos requeridos (Título y Descripción).', 'Faltan datos', 'warning');
                return;
            }

            const ads = db.getAllAds();
            const adIndex = ads.findIndex(a => String(a.id) === String(adminEditAdTargetId));

            if (adIndex > -1) {
                const existingAd = ads[adIndex];
                const adPhoneData = parseAndFormatPhone(existingAd.phone, existingAd);
                const adLada = adPhoneData.prefix || '+52';

                const rawPhone = document.getElementById('edit-ad-phone').value.trim();
                const phoneDigits = rawPhone.replace(/[^0-9]/g, '').slice(-10);
                const rawWa = document.getElementById('edit-ad-whatsapp').value.trim();
                const waDigits = rawWa.replace(/[^0-9]/g, '').slice(-10);

                const updatedAd = {
                    ...existingAd,
                    title: title,
                    description: desc,
                    state: document.getElementById('edit-ad-state').value.trim(),
                    city: document.getElementById('edit-ad-city').value.trim(),
                    phone: phoneDigits ? `${adLada} ${phoneDigits}` : '',
                    whatsapp: waDigits ? `${adLada} ${waDigits}` : '',
                    address: document.getElementById('edit-ad-address').value.trim(),
                    scheduleMF: document.getElementById('edit-ad-schedule-mf').value.trim(),
                    scheduleSat: document.getElementById('edit-ad-schedule-sat').value.trim(),
                    scheduleSun: document.getElementById('edit-ad-schedule-sun').value.trim(),
                    website: document.getElementById('edit-ad-website').value.trim()
                };

                try {
                    await db.saveAd(updatedAd);
                    if (updatedAd._pendingSync) {
                        showAlert('Guardado en tu dispositivo. Se subirá a la nube en cuanto vuelva la conexión.', 'Guardado Offline', 'warning');
                    } else {
                        showAlert('Los datos de la publicidad han sido actualizados con éxito en la nube.', 'Datos Guardados', 'check_circle');
                    }
                } catch (err) {
                    console.error("Error al guardar publicidad en Supabase:", err);
                    const localAds = JSON.parse(localStorage.getItem('revista_autos_ads') || '[]');
                    const adIdx = localAds.findIndex(a => String(a.id) === String(adminEditAdTargetId));
                    if (adIdx > -1) {
                        localAds[adIdx] = { ...localAds[adIdx], ...updatedAd, _pendingSync: true };
                        localStorage.setItem('revista_autos_ads', JSON.stringify(localAds));
                    }
                    showAlert('Guardado en tu dispositivo. Se subirá a la nube en cuanto vuelva la conexión.', 'Guardado Offline', 'warning');
                }

                closeAdminEditAd();

                // Limpiar dataset.lastState para forzar re-renderizado inmediato
                const pendingAdsList = document.getElementById('pending-ads-list');
                if (pendingAdsList) delete pendingAdsList.dataset.lastState;
                const adminAdsTable = document.getElementById('admin-ads-table-body');
                if (adminAdsTable) delete adminAdsTable.dataset.lastState;

                if (typeof forceInstantAdminRefresh === 'function') forceInstantAdminRefresh();
                if (typeof updateAdminAdsApprovals === 'function') updateAdminAdsApprovals();
                if (typeof renderAdminAdsTable === 'function') renderAdminAdsTable();
            }
        };
    }

    // --- Admin Create Ad Modal Handler ("Crear Anuncio") ---
    const btnAdminAddAd = document.getElementById('btn-admin-add-ad');
    const adminAdModal = document.getElementById('admin-ad-modal');
    const btnCloseAdminAd = document.getElementById('btn-close-admin-ad');
    const btnCancelAdminAd = document.getElementById('btn-cancel-admin-ad');
    const btnSaveAdminAd = document.getElementById('btn-save-admin-ad');
    const adminAdForm = document.getElementById('admin-ad-form');
    const adStateSelect = document.getElementById('ad-state');
    const adCitySelect = document.getElementById('ad-city');
    const adImageUpload = document.getElementById('ad-image-upload');
    const adImagePreviewContainer = document.getElementById('ad-image-preview-container');
    const adFileChosenText = document.getElementById('ad-file-chosen-text');

    window.adminAdImages = [];

    function renderAdminAdImagePreviews() {
        if (!adImagePreviewContainer || !adFileChosenText) return;
        adImagePreviewContainer.innerHTML = '';

        if (!window.adminAdImages || window.adminAdImages.length === 0) {
            adFileChosenText.textContent = '0 fotos (recuerda que la 1ra es la portada)';
            return;
        }

        adFileChosenText.textContent = `${window.adminAdImages.length} foto(s) seleccionada(s)`;

        window.adminAdImages.forEach((imgSrc, idx) => {
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';

            const img = document.createElement('img');
            img.src = imgSrc;
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '6px';
            img.style.border = idx === 0 ? '2px solid #f59e0b' : '1px solid var(--border-color)';

            if (idx === 0) {
                const badge = document.createElement('div');
                badge.textContent = 'PORTADA';
                badge.style.position = 'absolute';
                badge.style.bottom = '0';
                badge.style.left = '0';
                badge.style.right = '0';
                badge.style.background = '#f59e0b';
                badge.style.color = 'white';
                badge.style.fontSize = '0.5rem';
                badge.style.textAlign = 'center';
                badge.style.fontWeight = 'bold';
                badge.style.borderRadius = '0 0 6px 6px';
                wrapper.appendChild(badge);
            }

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 14px;">close</span>';
            delBtn.style.position = 'absolute';
            delBtn.style.top = '-4px';
            delBtn.style.right = '-4px';
            delBtn.style.background = 'rgba(255,0,0,0.8)';
            delBtn.style.color = 'white';
            delBtn.style.border = 'none';
            delBtn.style.borderRadius = '50%';
            delBtn.style.width = '20px';
            delBtn.style.height = '20px';
            delBtn.style.display = 'flex';
            delBtn.style.alignItems = 'center';
            delBtn.style.justifyContent = 'center';
            delBtn.style.cursor = 'pointer';

            delBtn.onclick = (ev) => {
                ev.preventDefault();
                window.adminAdImages.splice(idx, 1);
                renderAdminAdImagePreviews();
            };

            wrapper.appendChild(img);
            wrapper.appendChild(delBtn);
            adImagePreviewContainer.appendChild(wrapper);
        });
    }

    function populateAdminAdStates() {
        if (!adStateSelect) return;
        adStateSelect.innerHTML = '<option value="" disabled selected>Selecciona</option>';

        const statesSet = new Set();
        if (typeof catalogData !== 'undefined' && catalogData.citiesByState) {
            Object.keys(catalogData.citiesByState).sort().forEach(s => statesSet.add(s));
        }
        if (window.activeLocations && window.activeLocations.states) {
            window.activeLocations.states.forEach(s => statesSet.add(s));
        }

        statesSet.forEach(state => {
            adStateSelect.innerHTML += `<option value="${state}">${state}</option>`;
        });
    }

    if (adStateSelect && adCitySelect) {
        adStateSelect.addEventListener('change', (e) => {
            const state = e.target.value;
            adCitySelect.innerHTML = '<option value="" disabled selected>Selecciona</option>';

            let cities = [];
            if (typeof catalogData !== 'undefined' && catalogData.citiesByState && catalogData.citiesByState[state]) {
                cities = catalogData.citiesByState[state];
            } else if (window.activeLocations && window.activeLocations.citiesByState && window.activeLocations.citiesByState[state]) {
                cities = window.activeLocations.citiesByState[state];
            }

            if (cities.length > 0) {
                cities.sort().forEach(city => {
                    adCitySelect.innerHTML += `<option value="${city}">${city}</option>`;
                });
            } else {
                adCitySelect.innerHTML = '<option value="" disabled selected>No hay ciudades</option>';
            }
        });
    }

    if (adImageUpload) {
        adImageUpload.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (!files.length) return;

            window.adminAdImages = window.adminAdImages || [];

            if (window.adminAdImages.length + files.length > 8) {
                showAlert('Solo puedes subir hasta 8 fotos.', 'Límite de fotos', 'warning');
                return;
            }

            const uploadBtnLabel = document.querySelector('label[for="ad-image-upload"]');
            let originalText = '';
            if (uploadBtnLabel) {
                originalText = uploadBtnLabel.innerHTML;
                uploadBtnLabel.innerHTML = '<span class="material-symbols-rounded" style="animation: spin 1s linear infinite;">autorenew</span> Procesando...';
                uploadBtnLabel.style.pointerEvents = 'none';
            }

            for (let file of files) {
                try {
                    const dataUrl = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const img = new Image();
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 800;
                                let scaleSize = 1;
                                if (img.width > MAX_WIDTH) {
                                    scaleSize = MAX_WIDTH / img.width;
                                }
                                canvas.width = img.width * scaleSize;
                                canvas.height = img.height * scaleSize;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                resolve(canvas.toDataURL('image/webp', 0.8));
                            };
                            img.onerror = () => reject(new Error("Error cargando imagen"));
                            img.src = e.target.result;
                        };
                        reader.onerror = () => reject(new Error("Error leyendo archivo"));
                        reader.readAsDataURL(file);
                    });

                    window.adminAdImages.push(dataUrl);
                } catch (err) {
                    console.error("Error procesando imagen del anuncio admin", err);
                }
            }

            if (uploadBtnLabel) {
                uploadBtnLabel.innerHTML = originalText;
                uploadBtnLabel.style.pointerEvents = 'auto';
            }

            renderAdminAdImagePreviews();
        });
    }

    function openAdminAdModal() {
        if (adminAdForm) adminAdForm.reset();
        window.adminAdImages = [];
        renderAdminAdImagePreviews();
        populateAdminAdStates();

        if (adCitySelect) {
            adCitySelect.innerHTML = '<option value="" disabled selected>Selecciona</option>';
        }

        const today = new Date();
        const todayStr = (typeof getLocalDateString === 'function') ? getLocalDateString(today) : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const inOneMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const inOneMonthStr = (typeof getLocalDateString === 'function') ? getLocalDateString(inOneMonth) : `${inOneMonth.getFullYear()}-${String(inOneMonth.getMonth() + 1).padStart(2, '0')}-${String(inOneMonth.getDate()).padStart(2, '0')}`;

        const startDateInput = document.getElementById('ad-start-date');
        const endDateInput = document.getElementById('ad-end-date');
        if (startDateInput) startDateInput.value = todayStr;
        if (endDateInput) endDateInput.value = inOneMonthStr;

        if (adminAdModal) adminAdModal.classList.add('active');
    }

    function closeAdminAdModal() {
        if (adminAdModal) adminAdModal.classList.remove('active');
        if (adminAdForm) adminAdForm.reset();
        window.adminAdImages = [];
    }

    if (btnAdminAddAd) {
        btnAdminAddAd.onclick = (e) => {
            e.preventDefault();
            openAdminAdModal();
        };
    }

    if (btnCloseAdminAd) btnCloseAdminAd.onclick = (e) => { e.preventDefault(); closeAdminAdModal(); };
    if (btnCancelAdminAd) btnCancelAdminAd.onclick = (e) => { e.preventDefault(); closeAdminAdModal(); };

    if (btnSaveAdminAd) {
        btnSaveAdminAd.onclick = async (e) => {
            e.preventDefault();
            const title = document.getElementById('ad-title')?.value.trim() || '';
            const description = document.getElementById('ad-description')?.value.trim() || '';
            const state = document.getElementById('ad-state')?.value || '';
            const city = document.getElementById('ad-city')?.value || '';
            const phone = document.getElementById('ad-phone')?.value.trim() || '';
            const whatsapp = document.getElementById('ad-whatsapp')?.value.trim() || '';
            const startDate = document.getElementById('ad-start-date')?.value || '';
            const endDate = document.getElementById('ad-end-date')?.value || '';
            const fb = document.getElementById('ad-link-fb')?.value.trim() || '';
            const ig = document.getElementById('ad-link-ig')?.value.trim() || '';
            const tk = document.getElementById('ad-link-tk')?.value.trim() || '';

            if (!title || !description || !state || !city || !startDate || !endDate) {
                showAlert('Por favor llena los campos requeridos (*): Nombre, Descripción, Estado, Ciudad y Fechas.', 'Faltan Datos', 'warning');
                return;
            }

            if (!window.adminAdImages || window.adminAdImages.length === 0) {
                showAlert('Debes agregar al menos una foto para el anuncio.', 'Foto Requerida', 'warning');
                return;
            }

            btnSaveAdminAd.disabled = true;
            btnSaveAdminAd.textContent = 'Guardando...';

            try {
                const social_links = [fb, ig, tk].filter(Boolean);
                const newAd = {
                    id: Date.now(),
                    publisher_id: window.currentAdminUser ? window.currentAdminUser.id || 'admin' : 'admin',
                    title: title,
                    description: description,
                    state: state,
                    city: city,
                    phone: phone,
                    whatsapp: whatsapp,
                    start_date: startDate,
                    end_date: endDate,
                    social_links: social_links,
                    images: [...window.adminAdImages],
                    is_active: true,
                    payment_status: 'pagado',
                    views: 0,
                    clicks: 0,
                    created_at: new Date().toISOString(),
                    checkout_price: window.useAdPricingHook ? window.useAdPricingHook.getAdPrice() : (globalAdMonthlyPrice || 500)
                };

                await db.saveAd(newAd);
                if (typeof db.addAdPayment === 'function') {
                    db.addAdPayment(newAd.id, 0, null, 'Alta Directa Admin', 'manual');
                }

                // Invalidate cache dataset on tables for immediate re-render
                const tbody = document.getElementById('ads-table-body');
                if (tbody) delete tbody.dataset.lastState;
                const adminAdsTable = document.getElementById('admin-ads-table-body');
                if (adminAdsTable) delete adminAdsTable.dataset.lastState;
                const pendingAdsList = document.getElementById('pending-ads-list');
                if (pendingAdsList) delete pendingAdsList.dataset.lastState;

                if (typeof forceInstantAdminRefresh === 'function') forceInstantAdminRefresh();
                if (typeof updateAdminAdsApprovals === 'function') updateAdminAdsApprovals();
                if (typeof renderAdminAdsTable === 'function') await renderAdminAdsTable();

                closeAdminAdModal();
                showAlert('El anuncio ha sido creado y activado exitosamente.', 'Anuncio Creado', 'check_circle');
            } catch (err) {
                console.error("Error al crear anuncio:", err);
                showAlert('Ocurrió un error al guardar el anuncio. Por favor reintenta.', 'Error', 'danger');
            } finally {
                btnSaveAdminAd.disabled = false;
                btnSaveAdminAd.textContent = 'Guardar Anuncio';
            }
        };
    }

    window.deleteListingImageAdmin = async function (id, index) {
        window.appConfirm('¿Seguro que deseas eliminar esta foto de la publicación?', async () => {
            const listings = db.getAllListings();
            const listing = listings.find(l => String(l.id) === String(id));
            if (!listing) return;

            const images = listing.images || (listing.image ? [listing.image] : []);
            if (images.length === 0 || index >= images.length) return;

            const imgUrl = images[index];
            images.splice(index, 1);
            listing.images = images;

            localStorage.setItem(db.listingsKey, JSON.stringify(listings));

            try {
                await fetch(`${db.apiBaseUrl}/listings/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ images: listing.images })
                });

                if (imgUrl && imgUrl.includes('/uploads/')) {
                    const filename = imgUrl.split('/').pop();
                    try { await fetch(`${db.apiBaseUrl}/upload/${filename}`, { method: 'DELETE' }); } catch (e) { }
                }
            } catch (e) {
                console.error('Error eliminando foto', e);
            }

            updateAdminApprovals();
            updateAdminRenewals();
            showAlert('Foto eliminada correctamente.', 'Foto Eliminada', 'image');
        });
    };
    // Modal Action Handlers
    const btnApproveYes = document.getElementById('btn-approve-confirm-yes');
    const btnApproveCancel = document.getElementById('btn-approve-confirm-cancel');
    const btnRejectYes = document.getElementById('btn-reject-confirm-yes');
    const btnRejectCancel = document.getElementById('btn-reject-confirm-cancel');

    if (btnApproveYes) {
        btnApproveYes.onclick = async () => {
            if (pendingActionTargetId !== null) {
                const targetId = pendingActionTargetId;

                const amountInput = document.getElementById('approve-payment-amount');
                const amount = amountInput && amountInput.value ? parseFloat(amountInput.value) : 0;

                let receiptUrl = null;
                const fileInput = document.getElementById('approve-payment-receipt');
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    const formData = new FormData();
                    formData.append('images', file);
                    try {
                        const uploadRes = await fetch(`${db.apiBaseUrl}/upload`, { method: 'POST', body: formData });
                        const uploadData = await uploadRes.json();
                        if (uploadData.success && uploadData.imageUrls && uploadData.imageUrls.length > 0) {
                            receiptUrl = uploadData.imageUrls[0];
                        }
                    } catch (e) { console.error('Error subiendo comprobante', e); }
                }

                db.addPayment(targetId, amount, receiptUrl, 'Aprobación', 'manual', true);

                amountInput.value = '';
                if (fileInput) fileInput.value = '';

                pendingActionTargetId = null;
                await approveListing(targetId, true);
            }
        };
    }

    if (btnApproveCancel) {
        btnApproveCancel.onclick = () => {
            pendingActionTargetId = null;
            const modal = document.getElementById('approve-confirm-modal');
            if (modal) modal.classList.remove('active');
        };
    }

    if (btnRejectYes) {
        btnRejectYes.onclick = () => {
            if (pendingActionTargetId !== null) {
                const targetId = pendingActionTargetId;
                pendingActionTargetId = null;
                deleteListingAdmin(targetId, true);
            }
        };
    }

    if (btnRejectCancel) {
        btnRejectCancel.onclick = () => {
            pendingActionTargetId = null;
            const modal = document.getElementById('reject-confirm-modal');
            if (modal) modal.classList.remove('active');
        };
    }

    const btnRenewYes = document.getElementById('btn-renew-confirm-yes');
    const btnRenewCancel = document.getElementById('btn-renew-confirm-cancel');

    if (btnRenewYes) {
        btnRenewYes.onclick = async () => {
            if (pendingRenewActionTargetId !== null) {
                const targetId = pendingRenewActionTargetId;

                const amountInput = document.getElementById('renew-payment-amount');
                const amount = amountInput && amountInput.value ? parseFloat(amountInput.value) : 0;

                let receiptUrl = null;
                const fileInput = document.getElementById('renew-payment-receipt');
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    const formData = new FormData();
                    formData.append('images', file);
                    try {
                        const uploadRes = await fetch(`${db.apiBaseUrl}/upload`, { method: 'POST', body: formData });
                        const uploadData = await uploadRes.json();
                        if (uploadData.success && uploadData.imageUrls && uploadData.imageUrls.length > 0) {
                            receiptUrl = uploadData.imageUrls[0];
                        }
                    } catch (e) { console.error('Error subiendo comprobante', e); }
                }

                db.addPayment(targetId, amount, receiptUrl, 'Renovación', 'manual', true);

                amountInput.value = '';
                if (fileInput) fileInput.value = '';

                pendingRenewActionTargetId = null;
                pendingRenewActionMonthStr = null;
                // Rolling billing: solo se pasa el id y la confirmación, el servidor calcula expiresAt
                renewListingAdmin(targetId, true);
            }
        };
    }

    if (btnRenewCancel) {
        btnRenewCancel.onclick = () => {
            pendingRenewActionTargetId = null;
            pendingRenewActionMonthStr = null;
            const modal = document.getElementById('renew-confirm-modal');
            if (modal) modal.classList.remove('active');
        };
    }

    // =====================================================
    // CORTE DE CAJA
    // =====================================================
    let corteCurrentPeriod = 'today';
    let corteCurrentPayments = [];

    function getDateRangeForPeriod(period, fromDate, toDate) {
        const now = new Date();
        let from, to;
        if (period === 'today') {
            from = new Date(now); from.setHours(0, 0, 0, 0);
            to = new Date(now); to.setHours(23, 59, 59, 999);
        } else if (period === 'week') {
            const day = now.getDay();
            from = new Date(now); from.setDate(now.getDate() - day); from.setHours(0, 0, 0, 0);
            to = new Date(now); to.setHours(23, 59, 59, 999);
        } else if (period === 'month') {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date(now); to.setHours(23, 59, 59, 999);
        } else if (period === 'custom' && fromDate && toDate) {
            from = new Date(fromDate); from.setHours(0, 0, 0, 0);
            to = new Date(toDate); to.setHours(23, 59, 59, 999);
        } else {
            from = new Date(now); from.setHours(0, 0, 0, 0);
            to = new Date(now); to.setHours(23, 59, 59, 999);
        }
        return { from, to };
    }

    async function renderCorteCaja(period = corteCurrentPeriod, fromDate = null, toDate = null) {
        corteCurrentPeriod = period;
        const tbody = document.getElementById('corte-table-body');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:24px;"><span class="material-symbols-rounded" style="animation:spin 1s linear infinite; font-size:20px; vertical-align:middle;">refresh</span> Cargando...</td></tr>';

        const { from, to } = getDateRangeForPeriod(period, fromDate, toDate);
        const fromISO = (typeof getLocalDateString === 'function') ? getLocalDateString(from) : `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`;
        const toISO = (typeof getLocalDateString === 'function') ? getLocalDateString(to) : `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}`;

        let payments = [];
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            payments = db.getAllPayments().filter(p => {
                if (!p.dateISO) return period === 'today' ? false : true;
                const d = new Date(p.dateISO);
                return d >= from && d <= to;
            });
        } else {
            try {
                const token = localStorage.getItem('admin_token');
                const res = await fetch(`${db.apiBaseUrl}/payments?from=${fromISO}&to=${toISO}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) payments = data.payments;
                }
            } catch (e) {
                payments = db.getAllPayments().filter(p => {
                    if (!p.dateISO) return false;
                    const d = new Date(p.dateISO);
                    return d >= from && d <= to;
                });
            }
        }

        // Si no hay pagos del servidor, usar locales como fallback
        if (payments.length === 0) {
            payments = db.getAllPayments().filter(p => {
                if (!p.dateISO) return period === 'today' ? false : true;
                const d = new Date(p.dateISO);
                return d >= from && d <= to;
            });
        }

        corteCurrentPayments = payments;

        // Calcular totales
        const totalAmount = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        const mpPayments = payments.filter(p => p.method === 'mercadopago');
        const manualPayments = payments.filter(p => p.method !== 'mercadopago');
        const mpAmount = mpPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        const manualAmount = manualPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

        // Actualizar tarjetas resumen
        const fmt = n => `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
        document.getElementById('corte-total-amount').textContent = fmt(totalAmount);
        document.getElementById('corte-total-count').textContent = `${payments.length} entrada${payments.length !== 1 ? 's' : ''}`;
        document.getElementById('corte-mp-amount').textContent = fmt(mpAmount);
        document.getElementById('corte-mp-count').textContent = `${mpPayments.length} pago${mpPayments.length !== 1 ? 's' : ''}`;
        document.getElementById('corte-manual-amount').textContent = fmt(manualAmount);
        document.getElementById('corte-manual-count').textContent = `${manualPayments.length} pago${manualPayments.length !== 1 ? 's' : ''}`;

        // Renderizar tabla
        if (payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:32px;">Sin entradas de dinero en este período.</td></tr>';
            return;
        }

        tbody.innerHTML = payments.map(p => {
            const methodBadge = p.method === 'mercadopago'
                ? '<span style="background:#10b981; color:white; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; white-space:nowrap;">💳 Tarjeta MP</span>'
                : '<span style="background:#f59e0b; color:white; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; white-space:nowrap;">🤝 Manual</span>';
            return `
            <tr>
                <td style="white-space:nowrap; font-size:0.85rem;">${p.date || '-'}</td>
                <td><strong>${p.listingTitle || '-'}</strong></td>
                <td style="font-size:0.85rem; color:var(--text-muted);">${p.listingCity || '-'}</td>
                <td>${methodBadge}</td>
                <td style="font-size:0.85rem;">${p.type || '-'}</td>
                <td style="text-align:right; font-weight:700; color:var(--success-color);">${fmt(p.amount)}</td>
            </tr>`;
        }).join('') + `
        <tr style="border-top:2px solid var(--border-color); background:rgba(255,255,255,0.03);">
            <td colspan="5" style="font-weight:700; font-size:0.9rem; padding-top:12px;">TOTAL DEL PERÍODO</td>
            <td style="text-align:right; font-weight:700; font-size:1rem; color:var(--success-color); padding-top:12px;">${fmt(totalAmount)}</td>
        </tr>`;
    }

    function exportCorteToExcel() {
        if (!window.XLSX) {
            showAlert('La librería de Excel no está cargada. Verifica tu conexión.', 'Error', 'error');
            return;
        }
        if (corteCurrentPayments.length === 0) {
            showAlert('No hay datos para exportar en este período.', 'Sin datos', 'info');
            return;
        }

        const { from, to } = getDateRangeForPeriod(corteCurrentPeriod,
            document.getElementById('corte-from')?.value,
            document.getElementById('corte-to')?.value);

        const fmt = n => Number(n) || 0;
        const rows = corteCurrentPayments.map(p => ({
            'Fecha': p.date || '',
            'Vehículo': p.listingTitle || '',
            'Ciudad': p.listingCity || '',
            'Método': p.method === 'mercadopago' ? 'Tarjeta (Mercado Pago)' : 'Manual',
            'Tipo': p.type || '',
            'Monto (MXN)': fmt(p.amount)
        }));

        // Fila de totales
        const total = corteCurrentPayments.reduce((s, p) => s + fmt(p.amount), 0);
        rows.push({ 'Fecha': '', 'Vehículo': '', 'Ciudad': '', 'Método': '', 'Tipo': 'TOTAL', 'Monto (MXN)': total });

        const ws = XLSX.utils.json_to_sheet(rows);
        // Ancho de columnas
        ws['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 22 }, { wch: 18 }, { wch: 15 }];
        const wb = XLSX.utils.book_new();
        const periodLabel = corteCurrentPeriod === 'today' ? 'Hoy' : corteCurrentPeriod === 'week' ? 'Semana' : corteCurrentPeriod === 'month' ? 'Mes' : 'Rango';
        const sheetName = `Corte ${periodLabel} ${from.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}`;
        const fromDateStr = (typeof getLocalDateString === 'function') ? getLocalDateString(from) : `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`;
        XLSX.writeFile(wb, `Corte_RevistAuto_${periodLabel}_${fromDateStr}.xlsx`);
    }

    // Event listeners del Corte de Caja
    document.querySelectorAll('.corte-period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.corte-period-btn').forEach(b => {
                b.style.background = 'transparent';
                b.style.color = 'var(--text-main)';
                b.style.borderColor = 'var(--border-color)';
            });
            btn.style.background = 'var(--primary-color)';
            btn.style.color = 'white';
            btn.style.borderColor = 'var(--primary-color)';
            const customRange = document.getElementById('corte-custom-range');
            if (btn.dataset.period === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
                renderCorteCaja(btn.dataset.period);
            }
        });
    });

    const btnApplyRange = document.getElementById('btn-corte-apply-range');
    if (btnApplyRange) {
        btnApplyRange.addEventListener('click', () => {
            const from = document.getElementById('corte-from').value;
            const to = document.getElementById('corte-to').value;
            if (!from || !to) { showAlert('Selecciona ambas fechas.', 'Rango incompleto', 'warning'); return; }
            renderCorteCaja('custom', from, to);
        });
    }

    const btnExportExcel = document.getElementById('btn-export-excel');
    if (btnExportExcel) btnExportExcel.addEventListener('click', exportCorteToExcel);

    function updateBillingList() {
        const tbody = document.getElementById('billing-table-body');
        if (!tbody) return;

        const payments = db.getAllPayments();

        const stateKey = JSON.stringify(payments);
        if (tbody.dataset.lastState === stateKey) return;
        tbody.dataset.lastState = stateKey;

        // Limpiar listeners anteriores en el select-all
        const selectAllCb = document.getElementById('billing-select-all');
        const selectedCountEl = document.getElementById('selected-payments-count');

        // Helper: recalcular cuántos están seleccionados
        // IMPORTANTE: siempre leer el botón fresco del DOM (evita bug de referencia rota por cloneNode)
        function updateSelectionState() {
            const checked = tbody.querySelectorAll('.billing-row-cb:checked');
            const count = checked.length;
            const btnDel = document.getElementById('btn-delete-selected-payments');
            if (selectedCountEl) selectedCountEl.textContent = count;
            if (btnDel) {
                btnDel.style.display = count > 0 ? 'flex' : 'none';
            }
            const allCb = document.getElementById('billing-select-all');
            if (allCb) {
                const all = tbody.querySelectorAll('.billing-row-cb');
                allCb.checked = all.length > 0 && count === all.length;
                allCb.indeterminate = count > 0 && count < all.length;
            }
        }

        if (payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding: 24px;">No hay registros de cobros aún.</td></tr>';
            const btnDel = document.getElementById('btn-delete-selected-payments');
            if (btnDel) btnDel.style.display = 'none';
            if (selectAllCb) selectAllCb.checked = false;
            return;
        }

        tbody.innerHTML = payments.map(payment => {
            const receiptBtn = payment.receiptImage
                ? `<button class="icon-btn" onclick="window.open('${payment.receiptImage}', '_blank')" title="Ver Comprobante" style="color:var(--primary-color); display: flex; align-items: center; justify-content: center; width: 100%;"><span class="material-symbols-rounded">receipt_long</span></button>`
                : `<span style="color:var(--text-muted); font-size:0.85rem; display: block; text-align: center;">Efectivo / Sin Ticket</span>`;

            return `
            <tr data-payment-id="${payment.id}" class="billing-row">
                <td style="text-align:center; vertical-align:middle; padding: 8px 4px;">
                    <input type="checkbox" class="billing-row-cb" data-id="${payment.id}" 
                        style="cursor:pointer; width:16px; height:16px; accent-color: var(--danger-color);"
                        onchange="window._billingCbChanged(this)">
                </td>
                <td style="white-space:nowrap; font-size:0.9rem;">${escapeHTML(payment.date)}</td>
                <td><strong>${payment.listingTitle || '—'}</strong>${payment.listingId ? ` <span style="font-size:0.8rem;color:var(--text-muted);">(ID: ${payment.listingId})</span>` : ''}<br><span style="font-size:0.8rem; color:var(--text-muted);">${escapeHTML(payment.type || '')}</span></td>
                <td style="color: var(--success-color); font-weight:bold; white-space:nowrap;">$${parseFloat(payment.amount).toLocaleString('es-MX')} MXN</td>
                <td style="text-align: center; vertical-align: middle;">${receiptBtn}</td>
            </tr>
            `;
        }).join('');

        // Registrar handler global de cambio de checkbox (evita duplicar listeners)
        window._billingCbChanged = function (cb) {
            const row = cb.closest('tr');
            if (row) {
                row.style.background = cb.checked ? 'rgba(239,68,68,0.08)' : '';
            }
            updateSelectionState();
        };

        // Select-all: usar flag data-hasListener para no duplicar listeners
        if (selectAllCb && !selectAllCb.dataset.hasListener) {
            selectAllCb.dataset.hasListener = 'true';
            selectAllCb.addEventListener('change', () => {
                tbody.querySelectorAll('.billing-row-cb').forEach(cb => {
                    cb.checked = selectAllCb.checked;
                    const row = cb.closest('tr');
                    if (row) row.style.background = cb.checked ? 'rgba(239,68,68,0.08)' : '';
                });
                updateSelectionState();
            });
        }

        // Botón Borrar Seleccionados: usar flag data-hasListener para no duplicar listeners
        const btnDeleteSelected = document.getElementById('btn-delete-selected-payments');
        if (btnDeleteSelected && !btnDeleteSelected.dataset.hasListener) {
            btnDeleteSelected.dataset.hasListener = 'true';
            btnDeleteSelected.addEventListener('click', () => {
                const checked = tbody.querySelectorAll('.billing-row-cb:checked');
                if (checked.length === 0) return;
                window.appConfirm(
                    `¿Eliminar ${checked.length} registro(s) del historial? Esta acción no se puede deshacer.`,
                    () => {
                        const ids = Array.from(checked).map(cb => cb.dataset.id);
                        db.deletePayments(ids);
                        // Forzar re-render del historial
                        if (tbody.dataset) delete tbody.dataset.lastState;
                        updateBillingList();
                        showAlert(`${ids.length} registro(s) eliminados del historial.`, 'Registros Eliminados', 'delete_sweep');
                    }
                );
            });
        }

        updateSelectionState();
    }

    function updateStats() {
        const listings = db.getAllListings();
        const active = listings.filter(l => l.status === 'autorizado').length;
        const sold = listings.filter(l => l.status === 'vendido').length;
        const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);

        document.getElementById('stat-views').textContent = totalViews;
        document.getElementById('stat-active').textContent = active;
        document.getElementById('stat-sold').textContent = sold;

        const allAds = db.getAllAds();
        const activeAdsCount = allAds.filter(ad => db.isAdActive(ad)).length;
        const statActiveAds = document.getElementById('stat-active-ads');
        if (statActiveAds) statActiveAds.textContent = activeAdsCount;
    }

    // --- Input Formatters & Event Listeners ---
    const formMileageInput = document.getElementById('form-mileage');
    if (formMileageInput) {
        formMileageInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = v ? Number(v).toLocaleString('es-MX') : '';
        });
    }

    const formYearInput = document.getElementById('form-year');
    if (formYearInput) {
        const currentYearLimit = new Date().getFullYear();
        formYearInput.max = currentYearLimit;
        formYearInput.addEventListener('input', (e) => {
            if (e.target.value.length > 4) e.target.value = e.target.value.slice(0, 4);
            const val = parseInt(e.target.value);
            if (val > currentYearLimit) {
                e.target.setCustomValidity(`El año no puede ser mayor al año en curso (${currentYearLimit})`);
            } else {
                e.target.setCustomValidity('');
            }
        });
    }

    const editYearInput = document.getElementById('edit-year');
    if (editYearInput) {
        const currentYearLimit = new Date().getFullYear();
        editYearInput.max = currentYearLimit;
        editYearInput.addEventListener('input', (e) => {
            if (e.target.value.length > 4) e.target.value = e.target.value.slice(0, 4);
            const val = parseInt(e.target.value);
            if (val > currentYearLimit) {
                e.target.setCustomValidity(`El año no puede ser mayor al año en curso (${currentYearLimit})`);
            } else {
                e.target.setCustomValidity('');
            }
        });
    }
    // --- Logica para Configuración del Costo Mensual Base y Precios por Ciudad ---
    let localAdminCityPrices = {};

    function resolveAdminCityState(cityName) {
        if (!cityName) return 'Baja California';
        const clean = cityName.trim();
        const cData = (typeof catalogData !== 'undefined') ? catalogData : ((typeof db !== 'undefined' && db.catalogData) ? db.catalogData : (typeof defaultCatalogData !== 'undefined' ? defaultCatalogData : null));
        if (cData && cData.citiesByState) {
            for (const [st, cities] of Object.entries(cData.citiesByState)) {
                if (Array.isArray(cities) && cities.includes(clean)) {
                    return st;
                }
            }
        }
        if (['Mexicali', 'Tijuana', 'Ensenada', 'Tecate', 'Rosarito', 'San Quintín'].includes(clean)) return 'Baja California';
        if (['Hermosillo', 'Ciudad Obregón', 'Nogales', 'San Luis Río Colorado', 'Guaymas', 'Navojoa'].includes(clean)) return 'Sonora';
        if (['Culiacán', 'Mazatlán', 'Los Mochis', 'Guasave', 'Navolato'].includes(clean)) return 'Sinaloa';
        if (['La Paz', 'Los Cabos', 'Cabo San Lucas', 'San José del Cabo'].includes(clean)) return 'Baja California Sur';
        if (['Chihuahua', 'Ciudad Juárez', 'Delicias', 'Cuauhtémoc'].includes(clean)) return 'Chihuahua';
        return 'Baja California';
    }

    function renderAdminCityPrices() {
        const tbody = document.getElementById('city-prices-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const keys = Object.keys(localAdminCityPrices);
        if (keys.length === 0) {
            tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: var(--text-muted); padding: 24px;">No hay ciudades configuradas aún.</td></tr>`;
            return;
        }

        // Mapear ciudades con su estado correspondiente
        const cityList = keys.map(cityKey => {
            const state = resolveAdminCityState(cityKey);
            return {
                cityKey: cityKey,
                state: state,
                displayLabel: `${cityKey} - ${state}`
            };
        });

        // Ordenar alfabéticamente por Estado y secundariamente por Ciudad
        cityList.sort((a, b) => {
            const stateCompare = a.state.localeCompare(b.state, 'es', { sensitivity: 'base' });
            if (stateCompare !== 0) return stateCompare;
            return a.cityKey.localeCompare(b.cityKey, 'es', { sensitivity: 'base' });
        });

        let lastState = null;
        cityList.forEach(item => {
            if (lastState !== null && item.state !== lastState) {
                const sepTr = document.createElement('tr');
                sepTr.innerHTML = `
                    <td colspan="2" style="padding: 2px 12px; background: rgba(255, 255, 255, 0.02);">
                        <div style="border-top: 1px dashed rgba(255, 255, 255, 0.25); width: 100%; margin: 6px 0;"></div>
                    </td>
                `;
                tbody.appendChild(sepTr);
            }
            lastState = item.state;

            const cityKey = item.cityKey;
            const price = Number(localAdminCityPrices[cityKey]);
            const isFree = price === 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600; color: var(--text-main);">${escapeHTML(item.displayLabel)}</div>
                </td>
                <td style="text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        $ <input type="number" class="admin-city-price-input" data-city="${escapeHTML(cityKey)}" value="${price}" style="width: 70px; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--surface-light); color: var(--text-main); text-align: right;"> MXN
                    </div>
                    ${isFree ? `<div style="font-size: 0.75rem; color: #10b981; margin-top: 4px; font-weight: bold;">(Promoción Gratis)</div>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Listeners for inputs
        document.querySelectorAll('.admin-city-price-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const city = e.target.getAttribute('data-city');
                localAdminCityPrices[city] = Number(e.target.value);
                renderAdminCityPrices();
            });
        });
    }

    // Load initial city prices when settings are loaded
    async function loadAdminCityPricesInit() {
        const data = await db.getSettings();
        if (data.success && data.settings) {
            localAdminCityPrices = data.settings.cityPrices || {};
            
            // Auto-detect cities from inventory
            const allL = (typeof db !== 'undefined' && db.getAllListings) ? db.getAllListings() : (window.listingsData || []);
            let needsRender = false;
            
            allL.forEach(l => {
                if (l.city && localAdminCityPrices[l.city] === undefined) {
                    localAdminCityPrices[l.city] = 0; 
                    needsRender = true;
                }
            });
            
            renderAdminCityPrices();
            
            if (needsRender) {
                // Auto-save so they persist immediately
                data.settings.cityPrices = localAdminCityPrices;
                await db.saveSettings(data.settings);
            }
        }
    }
    document.getElementById('sidebar-tab-pagos')?.addEventListener('click', () => {
        loadAdminCityPricesInit();
    });

    const btnSavePrice = document.getElementById('btn-save-price');
    const btnSaveAdConfig = document.getElementById('btn-save-ad-config');

    async function saveAllSettings() {
        const inputMonthlyPrice = document.getElementById('admin-monthly-price');
        const inputAdMonthlyPrice = document.getElementById('admin-ad-monthly-price');

        const val = inputMonthlyPrice ? Number(inputMonthlyPrice.value) : 500;
        const adVal = inputAdMonthlyPrice ? Number(inputAdMonthlyPrice.value) : 500;
        const mpEnabled = document.getElementById('admin-mp-enabled') ? document.getElementById('admin-mp-enabled').checked : false;
        const mpPubKey = document.getElementById('admin-mp-public-key') ? document.getElementById('admin-mp-public-key').value.trim() : '';
        const mpAccToken = document.getElementById('admin-mp-access-token') ? document.getElementById('admin-mp-access-token').value.trim() : '';
        const adsEnabled = document.getElementById('admin-ad-toggle') ? document.getElementById('admin-ad-toggle').checked : true;
        const adFreq = document.getElementById('admin-ad-frequency') ? Number(document.getElementById('admin-ad-frequency').value) : 10;
        const adFallbackLimit = document.getElementById('admin-ad-fallback-limit') ? Number(document.getElementById('admin-ad-fallback-limit').value) : 21;

        try {
            const settingsPayload = {
                monthlyPrice: val,
                adMonthlyPrice: adVal,
                mercadoPagoEnabled: mpEnabled,
                mpPublicKey: mpPubKey,
                mpAccessToken: mpAccToken,
                ads_enabled: adsEnabled,
                ad_frequency_scroll: adFreq,
                ad_fallback_limit: adFallbackLimit,
                cityPrices: localAdminCityPrices
            };
            const data = await db.saveSettings(settingsPayload);
            if (data.success) {
                globalMonthlyPrice = val;
                globalAdMonthlyPrice = adVal;
                globalMpEnabled = mpEnabled;
                globalMpPublicKey = mpPubKey;

                if (window.db) {
                    window.db.adsEnabled = adsEnabled;
                    window.db.adFrequencyScroll = adFreq;
                    window.db.adFallbackLimit = adFallbackLimit;
                }

                const adPaymentNote = document.getElementById('ad-payment-note-price');
                if (adPaymentNote) {
                    if (Number(globalAdMonthlyPrice) === 0) {
                        adPaymentNote.textContent = 'Gratis';
                    } else {
                        adPaymentNote.textContent = `$${Number(globalAdMonthlyPrice).toFixed(2)} MXN`;
                    }
                }

                const publishPriceText = document.getElementById('publish-price-text');
                if (publishPriceText) {
                    if (Number(globalMonthlyPrice) === 0) {
                        publishPriceText.textContent = 'Gratis';
                    } else {
                        publishPriceText.textContent = `$${Number(globalMonthlyPrice).toFixed(2)} MXN`;
                    }
                }

                showAlert('Configuración guardada correctamente.', 'Éxito', 'check_circle');
                if (typeof renderFeed === 'function') renderFeed();
                if (document.getElementById('view-alta') && document.getElementById('view-alta').classList.contains('active')) {
                    if (typeof renderMyListings === 'function') renderMyListings();
                }
            } else {
                showAlert('Error del servidor: ' + (data.error || 'Desconocido'), 'Error', 'error');
            }
        } catch (e) {
            console.error('Error guardando config:', e);
            showAlert('Hubo un error al guardar.', 'Error', 'error');
        }
    }

    if (btnSavePrice) btnSavePrice.addEventListener('click', saveAllSettings);
    if (btnSaveAdConfig) btnSaveAdConfig.addEventListener('click', saveAllSettings);

    // Lógica para Botón de Editar Credenciales de Mercado Pago
    const btnToggleMpCredentials = document.getElementById('btn-toggle-mp-credentials');
    const mpPubKeyInput = document.getElementById('admin-mp-public-key');
    const mpAccTokenInput = document.getElementById('admin-mp-access-token');

    if (btnToggleMpCredentials && mpPubKeyInput && mpAccTokenInput) {
        btnToggleMpCredentials.addEventListener('click', () => {
            const isReadonly = mpPubKeyInput.hasAttribute('readonly');

            if (isReadonly) {
                // Desbloquear para edición
                mpPubKeyInput.removeAttribute('readonly');
                mpAccTokenInput.removeAttribute('readonly');
                mpPubKeyInput.style.pointerEvents = 'auto';
                mpAccTokenInput.style.pointerEvents = 'auto';
                mpPubKeyInput.style.opacity = '1';
                mpAccTokenInput.style.opacity = '1';
                mpPubKeyInput.style.background = 'var(--surface-light)';
                mpAccTokenInput.style.background = 'var(--surface-light)';
                mpPubKeyInput.style.color = 'var(--text-main)';
                mpAccTokenInput.style.color = 'var(--text-main)';
                mpAccTokenInput.type = 'text'; // Mostrar token temporalmente

                btnToggleMpCredentials.innerHTML = '<span class="material-symbols-rounded" style="font-size: 16px;">lock_open</span> Guardar y Bloquear';
                btnToggleMpCredentials.style.background = 'var(--success-color)';
                btnToggleMpCredentials.style.color = 'white';
            } else {
                // Guardar y volver a bloquear
                if (btnSavePrice) {
                    btnSavePrice.click(); // Reutilizamos la lógica de guardado
                }

                mpPubKeyInput.setAttribute('readonly', 'readonly');
                mpAccTokenInput.setAttribute('readonly', 'readonly');
                mpPubKeyInput.style.pointerEvents = 'none';
                mpAccTokenInput.style.pointerEvents = 'none';
                mpPubKeyInput.style.opacity = '0.7';
                mpAccTokenInput.style.opacity = '0.7';
                mpPubKeyInput.style.background = 'rgba(0,0,0,0.1)';
                mpAccTokenInput.style.background = 'rgba(0,0,0,0.1)';
                mpPubKeyInput.style.color = 'var(--text-muted)';
                mpAccTokenInput.style.color = 'var(--text-muted)';
                mpAccTokenInput.type = 'password'; // Ocultar token nuevamente

                btnToggleMpCredentials.innerHTML = '<span class="material-symbols-rounded" style="font-size: 16px;">lock</span> Editar Credenciales';
                btnToggleMpCredentials.style.background = 'var(--surface-light)';
                btnToggleMpCredentials.style.color = 'var(--text-main)';
            }
        });
    }

    // --- Admin Real-time Updates ---
    window.onListingsSynced = function () {
        if (adminDashboardModal && adminDashboardModal.classList.contains('active')) {
            if (typeof updateAdminApprovals === 'function') updateAdminApprovals();
            if (typeof updateAdminRenewals === 'function') updateAdminRenewals();
            if (typeof updateAdminStats === 'function') updateAdminStats();
            const finanzasView = document.getElementById('tab-finanzas');
            if (finanzasView && finanzasView.classList.contains('active')) {
                if (typeof updateBillingList === 'function') updateBillingList();
            }
        }
    };

    // ==========================================
    // SISTEMA DE USUARIOS Y AUTENTICACIÓN
    // ==========================================
    window.currentAdminUser = JSON.parse(localStorage.getItem('admin_user') || 'null');
    window.adminToken = localStorage.getItem('admin_token') || null;

    const btnAdminLogout = document.getElementById('btn-admin-logout');
    if (btnAdminLogout) {
        btnAdminLogout.addEventListener('click', () => {
            localStorage.removeItem('admin_user');
            localStorage.removeItem('admin_token');
            window.currentAdminUser = null;
            window.adminToken = null;
            if (adminDashboardModal) adminDashboardModal.classList.remove('active');
            showAlert('Has cerrado sesión exitosamente.', 'Sesión Cerrada', 'info');
        });
    }

    // Interceptar fetch global para inyectar token en rutas /api
    const originalFetch = window.fetch;
    window.fetch = async function () {
        let [resource, config] = arguments;
        if (typeof resource === 'string' && resource.startsWith('/api') && !resource.startsWith('/api/login')) {
            if (window.adminToken) {
                config = config || {};
                config.headers = config.headers || {};
                // Asegurar que Headers soporta asignación de propiedades
                if (config.headers instanceof Headers) {
                    config.headers.append('Authorization', `Bearer ${window.adminToken}`);
                } else {
                    config.headers['Authorization'] = `Bearer ${window.adminToken}`;
                }
            }
        }
        return originalFetch(resource, config);
    };

    const adminLoginModal = document.getElementById('admin-login-modal');
    const btnCloseLogin = document.getElementById('btn-close-login');
    const btnAdminLogin = document.getElementById('btn-admin-login');
    const loginError = document.getElementById('login-error-message');

    // Módulo de Seguridad y Bloqueo Progresivo Anti-Robots
    const LoginSecurityManager = {
        STORAGE_KEY: 'admin_login_lockout_data',
        timerId: null,

        getData() {
            try {
                const raw = localStorage.getItem(this.STORAGE_KEY);
                if (raw) return JSON.parse(raw);
            } catch (e) {
                console.warn('Error leyendo estado de bloqueo:', e);
            }
            return { attempts: 0, lockUntil: 0 };
        },

        saveData(attempts, lockUntil) {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ attempts, lockUntil }));
            } catch (e) {
                console.warn('Error guardando estado de bloqueo:', e);
            }
        },

        reset() {
            if (this.timerId) {
                clearInterval(this.timerId);
                this.timerId = null;
            }
            localStorage.removeItem(this.STORAGE_KEY);
        },

        getLockDurationSeconds(attempts) {
            if (attempts < 3) return 0;
            if (attempts === 3) return 15;
            if (attempts === 4) return 30;
            if (attempts === 5) return 60;
            if (attempts === 6) return 120;
            return 300; // 5 min máximo para 7+ intentos
        },

        registerFailedAttempt() {
            const data = this.getData();
            const newAttempts = (data.attempts || 0) + 1;
            let lockUntil = 0;

            if (newAttempts >= 3) {
                const lockSec = this.getLockDurationSeconds(newAttempts);
                lockUntil = Date.now() + (lockSec * 1000);
            }

            this.saveData(newAttempts, lockUntil);
            return { attempts: newAttempts, lockUntil };
        },

        isLocked() {
            const data = this.getData();
            return !!(data.lockUntil && data.lockUntil > Date.now());
        },

        checkAndApplyLockoutUI(btnElement, errorElement, inputUser, inputPass) {
            if (this.timerId) {
                clearInterval(this.timerId);
                this.timerId = null;
            }

            const data = this.getData();
            const now = Date.now();

            if (data.lockUntil && data.lockUntil > now) {
                const updateUI = () => {
                    const currentNow = Date.now();
                    const remainingMs = data.lockUntil - currentNow;
                    const remainingSec = Math.ceil(remainingMs / 1000);

                    if (remainingSec > 0) {
                        if (btnElement) {
                            btnElement.disabled = true;
                            btnElement.style.opacity = '0.6';
                            btnElement.textContent = `Bloqueado (${remainingSec}s)`;
                        }
                        if (inputUser) inputUser.disabled = true;
                        if (inputPass) inputPass.disabled = true;

                        if (errorElement) {
                            errorElement.style.color = 'var(--danger-color, #ef4444)';
                            errorElement.innerHTML = `🔒 <strong>Demasiados intentos fallidos.</strong><br>Por seguridad, reintenta en <strong>${remainingSec} segundos</strong>.`;
                        }
                    } else {
                        if (this.timerId) {
                            clearInterval(this.timerId);
                            this.timerId = null;
                        }
                        if (btnElement) {
                            btnElement.disabled = false;
                            btnElement.style.opacity = '1';
                            btnElement.textContent = 'Ingresar';
                        }
                        if (inputUser) inputUser.disabled = false;
                        if (inputPass) inputPass.disabled = false;

                        if (errorElement) {
                            errorElement.textContent = 'Puedes intentar ingresar de nuevo.';
                            errorElement.style.color = 'var(--text-muted, #94a3b8)';
                        }
                    }
                };

                updateUI();
                this.timerId = setInterval(updateUI, 1000);
                return true;
            } else {
                if (btnElement) {
                    btnElement.disabled = false;
                    btnElement.style.opacity = '1';
                    btnElement.textContent = 'Ingresar';
                }
                if (inputUser) inputUser.disabled = false;
                if (inputPass) inputPass.disabled = false;
                return false;
            }
        }
    };

    // Interceptar la apertura del panel de admin
    window.openAdminPanel = function () {
        updateAdminVersionDisplay();
        if (window.adminToken && window.currentAdminUser) {
            // Ya logueado
            setupAdminPermissions();
            adminDashboardModal.classList.add('active');
            renderUsersAdmin();
            if (typeof db !== 'undefined' && db.syncWithServer) {
                db.syncWithServer().then(() => {
                    if (typeof forceInstantAdminRefresh === 'function') forceInstantAdminRefresh();
                }).catch(e => console.warn("Admin initial sync failed:", e));
            }
        } else {
            // Mostrar Login y verificar bloqueo
            adminLoginModal.classList.add('active');
            LoginSecurityManager.checkAndApplyLockoutUI(
                btnAdminLogin,
                loginError,
                document.getElementById('login-username'),
                document.getElementById('login-password')
            );
        }
    };

    if (btnCloseLogin) {
        btnCloseLogin.addEventListener('click', () => adminLoginModal.classList.remove('active'));
    }

    const handleLoginSubmit = async () => {
        const inputUser = document.getElementById('login-username');
        const inputPass = document.getElementById('login-password');

        if (LoginSecurityManager.isLocked()) {
            LoginSecurityManager.checkAndApplyLockoutUI(btnAdminLogin, loginError, inputUser, inputPass);
            return;
        }

        const user = inputUser ? inputUser.value.trim() : '';
        const pass = inputPass ? inputPass.value.trim() : '';
        if (!user || !pass) {
            if (loginError) loginError.textContent = 'Ingresa usuario y contraseña.';
            return;
        }

        if (btnAdminLogin) {
            btnAdminLogin.disabled = true;
            btnAdminLogin.textContent = 'Iniciando...';
        }
        if (loginError) loginError.textContent = '';

        try {
            const data = await db.loginAdmin(user, pass);

            if (data.success) {
                LoginSecurityManager.reset();
                window.adminToken = data.token;
                window.currentAdminUser = data.user;
                localStorage.setItem('admin_token', data.token);
                localStorage.setItem('admin_user', JSON.stringify(data.user));

                adminLoginModal.classList.remove('active');
                setupAdminPermissions();
                adminDashboardModal.classList.add('active');
                renderUsersAdmin();
                if (inputPass) inputPass.value = '';
                if (typeof db !== 'undefined' && db.syncWithServer) {
                    db.syncWithServer().then(() => {
                        if (typeof forceInstantAdminRefresh === 'function') forceInstantAdminRefresh();
                    }).catch(e => console.warn("Admin login sync failed:", e));
                }
            } else {
                // Registrar intento fallido
                const lockInfo = LoginSecurityManager.registerFailedAttempt();
                if (lockInfo.attempts >= 3) {
                    LoginSecurityManager.checkAndApplyLockoutUI(btnAdminLogin, loginError, inputUser, inputPass);
                } else {
                    const attemptsLeft = 3 - lockInfo.attempts;
                    if (loginError) {
                        loginError.style.color = 'var(--danger-color, #ef4444)';
                        loginError.textContent = `Usuario o contraseña incorrectos. (Intento ${lockInfo.attempts} de 3 - Quedan ${attemptsLeft} antes de bloqueo)`;
                    }
                }
            }
        } catch (e) {
            if (loginError) loginError.textContent = 'Error de conexión.';
        }

        if (!LoginSecurityManager.isLocked() && btnAdminLogin) {
            btnAdminLogin.disabled = false;
            btnAdminLogin.textContent = 'Ingresar';
        }
    };

    if (btnAdminLogin) {
        btnAdminLogin.addEventListener('click', handleLoginSubmit);
    }

    // Permitir iniciar sesión presionando Enter en los inputs
    ['login-username', 'login-password'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLoginSubmit();
                }
            });
        }
    });

    // Configurar qué pestañas puede ver el usuario
    function setupAdminPermissions() {
        const role = window.currentAdminUser ? window.currentAdminUser.role : 'empleado';
        const tabGeneral = document.querySelector('.dashboard-tab[data-tab="tab-general"]');
        const tabInventario = document.querySelector('.dashboard-tab[data-tab="tab-inventario"]');
        const tabAprobaciones = document.querySelector('.dashboard-tab[data-tab="tab-aprobaciones"]');
        const tabRenovaciones = document.querySelector('.dashboard-tab[data-tab="tab-renovaciones"]');
        const tabPagos = document.getElementById('sidebar-tab-pagos');
        const tabPublicidad = document.getElementById('sidebar-tab-publicidad');
        const tabFinanzas = document.getElementById('sidebar-tab-finanzas');
        const tabUsuarios = document.getElementById('sidebar-tab-usuarios');
        const tabBitacora = document.getElementById('sidebar-tab-bitacora');
        const adFallbackLimitContainer = document.getElementById('admin-ad-fallback-limit-container');

        if (role === 'empleado_limitado') {
            // Solo puede ver: Aprobaciones, Renovaciones, Publicidad, Dar de Alta, Cerrar Sesión
            if (tabGeneral) tabGeneral.style.display = 'none';
            if (tabInventario) tabInventario.style.display = 'none';
            if (tabPagos) tabPagos.style.display = 'none';
            if (tabFinanzas) tabFinanzas.style.display = 'none';
            if (tabUsuarios) tabUsuarios.style.display = 'none';
            if (tabBitacora) tabBitacora.style.display = 'none'; // OCULTO PARA LIMITADO
            if (adFallbackLimitContainer) adFallbackLimitContainer.style.display = 'none';
            // Asegurar que los tabs permitidos son visibles
            if (tabAprobaciones) tabAprobaciones.style.display = '';
            if (tabRenovaciones) tabRenovaciones.style.display = '';
            if (tabPublicidad) tabPublicidad.style.display = '';
            // Ocultar configuración global de anuncios
            const adConfigSection = document.querySelector('#tab-publicidad .config-section');
            if (adConfigSection) adConfigSection.style.display = 'none';
            // Abrir Aprobaciones por defecto
            const defaultTab = document.querySelector('.dashboard-tab[data-tab="tab-aprobaciones"]');
            if (defaultTab) defaultTab.click();
        } else if (role === 'empleado') {
            if (tabFinanzas) tabFinanzas.style.display = 'none';
            if (tabUsuarios) tabUsuarios.style.display = 'none';
            if (tabGeneral) tabGeneral.style.display = 'none';
            if (tabBitacora) tabBitacora.style.display = 'flex';
            if (adFallbackLimitContainer) adFallbackLimitContainer.style.display = 'none';
            // Abrir inventario por defecto
            const invTab = document.querySelector('.dashboard-tab[data-tab="tab-inventario"]');
            if (invTab) invTab.click();
        } else {
            // Admin: mostrar todo
            if (tabGeneral) tabGeneral.style.display = '';
            if (tabInventario) tabInventario.style.display = '';
            if (tabAprobaciones) tabAprobaciones.style.display = '';
            if (tabRenovaciones) tabRenovaciones.style.display = '';
            if (tabPagos) tabPagos.style.display = 'flex';
            if (tabPublicidad) tabPublicidad.style.display = '';
            if (tabFinanzas) tabFinanzas.style.display = 'flex';
            if (tabUsuarios) tabUsuarios.style.display = 'flex';
            if (tabBitacora) tabBitacora.style.display = 'flex';
            if (adFallbackLimitContainer) adFallbackLimitContainer.style.display = 'flex';
            // Mostrar configuración global de anuncios para admin completo
            const adConfigSection = document.querySelector('#tab-publicidad .config-section');
            if (adConfigSection) adConfigSection.style.display = '';
        }
    }

    // GESTIÓN DE USUARIOS
    const usersTableBody = document.getElementById('users-table-body');
    const adminUserModal = document.getElementById('admin-user-modal');

    // ==========================================
    // UTILIDADES PARA WHATSAPP
    // ==========================================
    window.buildAdminWhatsAppUrl = function (phone, listingTitle, context = null) {
        if (!phone) return '#';
        const waData = parseAndFormatPhone(phone, context);
        const cleanPhone = waData.prefix.replace('+', '') + waData.nationalDigits;
        const text = encodeURIComponent(`Hola, te contactamos de RevistAuto sobre tu publicación '${listingTitle}'. Te recordamos que tu anuncio está próximo a vencer. ¿Te gustaría renovarlo por 30 días más?`);
        return `https://wa.me/${cleanPhone}?text=${text}`;
    };

    // ==========================================
    // BITÁCORA DE ACTIVIDAD (AUDIT LOG)
    // ==========================================
    let auditCurrentPage = 1;
    let auditItemsPerPage = 50;
    let auditFilteredLogs = [];
    let auditAllLogs = [];
    let auditFiltersLoaded = false;

    window.renderAdminAuditLog = async function () {
        const tbody = document.getElementById('audit-log-table-body');
        if (!tbody) return;

        const data = await db.getAuditLogs();
        if (data && data.success && data.logs) {
            auditAllLogs = data.logs;

            // Populate filters only once
            if (!auditFiltersLoaded) {
                const citySelect = document.getElementById('audit-filter-city');
                const userSelect = document.getElementById('audit-filter-user');

                const cities = new Set(data.logs.map(l => l.city).filter(c => c && c !== 'N/A' && c !== 'Todas'));
                const users = new Set(data.logs.map(l => l.user_username).filter(u => u && u !== 'Desconocido'));

                if (citySelect) {
                    cities.forEach(c => {
                        const opt = document.createElement('option');
                        opt.value = c; opt.textContent = c;
                        citySelect.appendChild(opt);
                    });
                }
                if (userSelect) {
                    users.forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u; opt.textContent = u;
                        userSelect.appendChild(opt);
                    });
                }
                auditFiltersLoaded = true;
            }

            applyAuditFilters();
        }
    };

    function applyAuditFilters() {
        const cityFilter = document.getElementById('audit-filter-city')?.value || 'Todas';
        const userFilter = document.getElementById('audit-filter-user')?.value || 'Todos';
        const dateFilter = document.getElementById('audit-filter-date')?.value || ''; // Format YYYY-MM

        auditFilteredLogs = auditAllLogs.filter(log => {
            if (cityFilter !== 'Todas' && log.city !== cityFilter) return false;
            if (userFilter !== 'Todos' && log.user_username !== userFilter) return false;
            if (dateFilter) {
                const logDate = new Date(log.timestamp);
                const logMonth = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
                if (logMonth !== dateFilter) return false;
            }
            return true;
        });

        auditCurrentPage = 1;
        drawAuditTable();
    }

    function drawAuditTable() {
        const tbody = document.getElementById('audit-log-table-body');
        if (!tbody) return;

        if (auditFilteredLogs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">No hay registros que coincidan.</td></tr>';
            const pageInfo = document.getElementById('audit-page-info');
            if (pageInfo) pageInfo.textContent = 'Página 1 de 1';
            const prevBtn = document.getElementById('audit-prev-page');
            if (prevBtn) prevBtn.disabled = true;
            const nextBtn = document.getElementById('audit-next-page');
            if (nextBtn) nextBtn.disabled = true;
            return;
        }

        const totalPages = Math.ceil(auditFilteredLogs.length / auditItemsPerPage);
        if (auditCurrentPage > totalPages) auditCurrentPage = totalPages;

        const startIndex = (auditCurrentPage - 1) * auditItemsPerPage;
        const pageLogs = auditFilteredLogs.slice(startIndex, startIndex + auditItemsPerPage);

        tbody.innerHTML = pageLogs.map(log => {
            const dateObj = new Date(log.timestamp);
            const dateStr = dateObj.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
            const timeStr = dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

            // Format reference link if it looks like Publicación #...
            let refHtml = log.reference || '-';
            const pubMatch = refHtml.match(/Publicación #(\d+)/i);
            if (pubMatch && (log.action.includes('vehículo') || log.action.includes('vehiculo'))) {
                const pubId = pubMatch[1];
                refHtml = refHtml.replace(/Publicación #\d+/i, `<a href="#" onclick="event.preventDefault(); window.openAdminEditModal('${pubId}')" style="color:var(--primary-color); text-decoration:none;">$&</a>`);
            }

            return `
            <tr>
                <td>${dateStr} <br><small style="color:var(--text-muted)">${timeStr}</small></td>
                <td><strong>${log.user_username}</strong></td>
                <td>${log.action}</td>
                <td>${log.city || '-'}</td>
                <td>${refHtml}</td>
            </tr>
            `;
        }).join('');

        const pageInfo = document.getElementById('audit-page-info');
        const prevBtn = document.getElementById('audit-prev-page');
        const nextBtn = document.getElementById('audit-next-page');

        if (pageInfo) pageInfo.textContent = `Página ${auditCurrentPage} de ${totalPages}`;
        if (prevBtn) prevBtn.disabled = auditCurrentPage === 1;
        if (nextBtn) nextBtn.disabled = auditCurrentPage === totalPages;
    }

    // Event listeners for Audit Logs
    document.getElementById('audit-filter-city')?.addEventListener('change', applyAuditFilters);
    document.getElementById('audit-filter-user')?.addEventListener('change', applyAuditFilters);
    document.getElementById('audit-filter-date')?.addEventListener('change', applyAuditFilters);

    document.getElementById('btn-clear-audit-filters')?.addEventListener('click', () => {
        if (document.getElementById('audit-filter-city')) document.getElementById('audit-filter-city').value = 'Todas';
        if (document.getElementById('audit-filter-user')) document.getElementById('audit-filter-user').value = 'Todos';
        if (document.getElementById('audit-filter-date')) document.getElementById('audit-filter-date').value = '';
        applyAuditFilters();
    });

    document.getElementById('audit-prev-page')?.addEventListener('click', () => {
        if (auditCurrentPage > 1) {
            auditCurrentPage--;
            drawAuditTable();
        }
    });

    document.getElementById('audit-next-page')?.addEventListener('click', () => {
        const totalPages = Math.ceil(auditFilteredLogs.length / auditItemsPerPage);
        if (auditCurrentPage < totalPages) {
            auditCurrentPage++;
            drawAuditTable();
        }
    });

    window.exportAuditToExcel = function () {
        if (!auditFilteredLogs || auditFilteredLogs.length === 0) {
            showAlert('No hay registros para exportar.', 'Sin datos', 'info');
            return;
        }

        if (typeof XLSX === 'undefined') {
            showAlert('Error: La biblioteca para exportar a Excel no está cargada.', 'Error', 'error');
            return;
        }

        const dataToExport = auditFilteredLogs.map(log => {
            const dateObj = new Date(log.timestamp);
            return {
                'Fecha': dateObj.toLocaleDateString('es-MX'),
                'Hora': dateObj.toLocaleTimeString('es-MX'),
                'Usuario': log.user_username,
                'Acción': log.action,
                'Ciudad': log.city || 'N/A',
                'Referencia': log.reference || 'N/A'
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bitácora");

        XLSX.writeFile(workbook, "Bitacora_Actividad_RevistAuto.xlsx");
    };

    document.getElementById('btn-export-audit')?.addEventListener('click', window.exportAuditToExcel);


    document.getElementById('btn-admin-add-user')?.addEventListener('click', () => {
        document.getElementById('admin-user-form').reset();
        document.getElementById('admin-user-id').value = '';
        document.getElementById('admin-user-modal-title').textContent = 'Nuevo Usuario';
        renderStateCheckboxes();
        adminUserModal.classList.add('active');
    });

    document.getElementById('btn-close-user-modal')?.addEventListener('click', () => adminUserModal.classList.remove('active'));
    document.getElementById('btn-cancel-user')?.addEventListener('click', () => adminUserModal.classList.remove('active'));

    function renderStateCheckboxes(selectedStates = [], selectedCities = []) {
        const container = document.getElementById('admin-user-states-container');
        if (!container) return;

        let html = '';
        Object.keys(catalogData.citiesByState).sort().forEach(state => {
            const isStateChecked = selectedStates.includes(state);
            html += `
            <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
                <label style="display:flex; align-items:center; gap:8px; font-weight:bold; color: var(--primary-color);">
                    <input type="checkbox" class="user-state-cb" value="${state}" ${isStateChecked ? 'checked' : ''}>
                    ${state} (Todo el estado)
                </label>
                <div style="margin-left: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 4px;">
            `;
            catalogData.citiesByState[state].sort().forEach(city => {
                const isCityChecked = selectedCities.includes(city);
                html += `
                    <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem;">
                        <input type="checkbox" class="user-city-cb" data-state="${state}" value="${city}" ${isCityChecked || isStateChecked ? 'checked' : ''} ${(isStateChecked) ? 'disabled' : ''}>
                        ${city}
                    </label>
                `;
            });
            html += `</div></div>`;
        });
        container.innerHTML = html;

        // Listener para deshabilitar ciudades si el estado está seleccionado
        container.querySelectorAll('.user-state-cb').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const state = e.target.value;
                const checked = e.target.checked;
                container.querySelectorAll(`.user-city-cb[data-state="${state}"]`).forEach(cityCb => {
                    cityCb.checked = checked;
                    cityCb.disabled = checked;
                });
            });
        });
    }

    document.getElementById('admin-user-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('admin-user-id').value;
        const username = document.getElementById('admin-user-username').value.trim();
        const password = document.getElementById('admin-user-password').value.trim();
        const role = document.getElementById('admin-user-role').value;

        const allowedStates = Array.from(document.querySelectorAll('.user-state-cb:checked')).map(cb => cb.value);
        const allowedCities = Array.from(document.querySelectorAll('.user-city-cb:checked')).filter(cb => !cb.disabled).map(cb => cb.value);

        const payload = { username, password, role, allowedStates, allowedCities };
        const method = id ? 'PUT' : 'POST';
        try {
            if (id) Object.assign(payload, { id }); // Add ID if updating
            const data = await db.saveAdminUser(payload);
            if (data.success) {
                db.logActivity(id ? 'Edición de Usuario' : 'Creación de Usuario', `Usuario ${username} (${role})`, 'Global');
                adminUserModal.classList.remove('active');
                renderUsersAdmin();
                showAlert('Usuario guardado con éxito', 'Éxito', 'check_circle');
            } else {
                showAlert(data.error || 'Error al guardar en Supabase', 'Error', 'error');
            }
        } catch (err) {
            showAlert('Error al guardar usuario', 'Error', 'error');
        }
    });

    window.editUser = function (id, username, password, role, states, cities) {
        document.getElementById('admin-user-id').value = id;
        document.getElementById('admin-user-username').value = username;
        document.getElementById('admin-user-password').value = password || '';
        document.getElementById('admin-user-role').value = role;
        document.getElementById('admin-user-modal-title').textContent = 'Editar Usuario';

        const parsedStates = states ? states.split(',') : [];
        const parsedCities = cities ? cities.split(',') : [];
        renderStateCheckboxes(parsedStates, parsedCities);

        adminUserModal.classList.add('active');
    };

    window.deleteUser = async function (id) {
        window.appConfirm('¿Estás seguro de eliminar este usuario?', async () => {
            try {
                const data = await db.deleteAdminUser(id);
                if (data.success) {
                    db.logActivity('Eliminación de Usuario', `Usuario #${id}`, 'Global');
                    renderUsersAdmin();
                    showAlert('Usuario eliminado', 'Éxito', 'check_circle');
                } else {
                    showAlert(data.error || 'Error al eliminar', 'Error', 'error');
                }
            } catch (e) {
                showAlert('Error al eliminar', 'Error', 'error');
            }
        });
    };

    async function renderUsersAdmin() {
        if (!usersTableBody || !window.currentAdminUser || window.currentAdminUser.role !== 'admin') return;
        try {
            const data = await db.getAdminUsers();
            if (data.success) {
                const roleLabel = (role) => {
                    if (role === 'admin') return '<span style="color:var(--primary-color); font-weight:bold;">Control Total</span>';
                    if (role === 'empleado_limitado') return '<span style="color:#f59e0b; font-weight:bold;">Empleado Limitado</span>';
                    return 'Empleado';
                };
                usersTableBody.innerHTML = data.users.map(u => `
                    <tr>
                        <td><strong>${u.username}</strong></td>
                        <td>${roleLabel(u.role)}</td>
                        <td style="font-size: 0.8rem; color: var(--text-muted); max-width: 200px;">
                            ${u.role === 'admin' ? 'Todo' :
                        ((u.allowedStates && u.allowedStates.length ? 'Estados: ' + u.allowedStates.join(', ') + '<br>' : '') +
                            (u.allowedCities && u.allowedCities.length ? 'Ciudades: ' + u.allowedCities.join(', ') : '')) || 'Ninguna'}
                        </td>
                        <td>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <input type="password" value="${u.password || ''}" readonly style="background:transparent; border:none; color:var(--text-main); width:80px;">
                                <button onclick="this.previousElementSibling.type = this.previousElementSibling.type === 'password' ? 'text' : 'password'" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">
                                    <span class="material-symbols-rounded" style="font-size:16px;">visibility</span>
                                </button>
                            </div>
                        </td>
                        <td style="text-align:right;">
                            <button class="primary-btn" onclick="editUser('${u.id}', '${u.username}', '${u.password}', '${u.role}', '${(u.allowedStates || []).join(',')}', '${(u.allowedCities || []).join(',')}')" style="padding:4px 8px; font-size:0.8rem; background:var(--surface-light);">Editar</button>
                            <button class="danger-btn" onclick="deleteUser('${u.id}')" style="padding:4px 8px; font-size:0.8rem;">Borrar</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (e) {
            console.error('Error fetching users', e);
        }
    }

    // --- Lógica de Mercado Pago ---
    const btnClosePublishOptions = document.getElementById('btn-close-publish-options');
    const modalPublishOptions = document.getElementById('publish-options-modal');
    const btnOptionPayNow = document.getElementById('btn-option-pay-now');
    const btnOptionPayLater = document.getElementById('btn-option-pay-later');
    const modalMp = document.getElementById('mercado-pago-modal');
    const btnCloseMp = document.getElementById('btn-close-mp-modal');

    let isRenewalPayment = false;

    if (btnClosePublishOptions) btnClosePublishOptions.addEventListener('click', () => {
        modalPublishOptions.classList.remove('active');
        showAlert('Anuncio guardado. Podrás pagarlo después.', 'Pendiente de Pago', 'info');
        if (typeof renderMyListings === 'function') renderMyListings();
        if (isAdminLoggedIn() && typeof loadAdminData === 'function') loadAdminData();
    });

    if (btnOptionPayLater) btnOptionPayLater.addEventListener('click', () => {
        modalPublishOptions.classList.remove('active');
        showAlert('¡Vehículo publicado con éxito! Está pendiente de aprobación. Nos contactaremos contigo.', 'Publicado', 'check_circle');
        if (isAdminLoggedIn() && typeof loadAdminData === 'function') loadAdminData();
    });

    if (btnCloseMp) btnCloseMp.addEventListener('click', () => {
        modalMp.classList.remove('active');
        if (!isRenewalPayment && !window.openedFromDashboard && modalPublishOptions) {
            modalPublishOptions.classList.add('active');
        }
    });

    if (btnOptionPayNow) btnOptionPayNow.addEventListener('click', () => {
        modalPublishOptions.classList.remove('active');
        window.openedFromDashboard = false;
        openMercadoPagoBrick(window.currentPendingListingId, false);
    });

    window.openMercadoPagoBrick = function (listingId, isRenewal = false) {
        try {
            if (!globalMpPublicKey) {
                showAlert('El sistema de pagos no está configurado correctamente.', 'Error', 'error');
                return;
            }

            isRenewalPayment = isRenewal;
            modalMp.classList.add('active');

            if (window.paymentBrickController) {
                window.paymentBrickController.unmount();
                window.paymentBrickController = null;
            }

            const container = document.getElementById('paymentBrick_container');
            container.innerHTML = ''; // Limpiar render previo por seguridad

            // Verificar que MercadoPago esté definido
            if (typeof MercadoPago === 'undefined') {
                throw new Error("La librería de Mercado Pago no cargó correctamente desde internet. Revisa tu conexión o desactiva tu bloqueador de anuncios (AdBlock).");
            }

            const mp = new MercadoPago(globalMpPublicKey, { locale: 'es-MX' });
            const bricksBuilder = mp.bricks();

            let amountToCharge = Number(globalMonthlyPrice) || 500;
            if (listingId) {
                const allL = (typeof db !== 'undefined' && db.getAllListings) ? db.getAllListings() : [];
                const targetListing = allL.find(l => String(l.id) === String(listingId));
                if (targetListing) {
                    if (targetListing.checkout_price !== undefined) {
                        amountToCharge = Number(targetListing.checkout_price);
                    } else if (targetListing.paymentStatus === 'free') {
                        amountToCharge = 0;
                    } else if (window.useCityPricingHook) {
                        amountToCharge = window.useCityPricingHook.getCityPrice(targetListing.city || '', targetListing.state || '');
                    }
                }
            }

            const priceHeader = document.getElementById('mp-modal-price-header');
            if (priceHeader) {
                priceHeader.style.display = 'block';
                priceHeader.innerHTML = `<h2 style="margin:0; font-size: 1.8rem; font-weight: normal; color: var(--text-main);">Total a pagar <span style="color: var(--primary-color); font-weight: bold;">$${Number(amountToCharge).toFixed(2)}</span> MXN</h2>`;
            }

            const renderPaymentBrick = async (bricksBuilder) => {
                const settings = {
                    initialization: {
                        amount: amountToCharge
                    },
                    customization: {
                        visual: {
                            style: {
                                theme: 'default'
                            }
                        },
                        paymentMethods: {
                            creditCard: "all",
                            debitCard: "all"
                        }
                    },
                    callbacks: {
                        onReady: () => {
                            console.log("Brick is ready!");
                        },
                        onSubmit: ({ selectedPaymentMethod, formData }) => {
                            return new Promise((resolve, reject) => {
                                formData.listingId = listingId;
                                formData.isRenewal = isRenewalPayment;

                                let promise;
                                if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                                    promise = supabaseClient.functions.invoke('process_payment', {
                                        body: formData
                                    }).then(({ data, error }) => {
                                        if (error) throw error;
                                        return data;
                                    });
                                } else {
                                    promise = Promise.reject(new Error("Supabase Client no está disponible. No se puede procesar el pago."));
                                }

                                promise.then(async (response) => {
                                    if (response.success) {
                                        resolve();
                                        modalMp.classList.remove('active');
                                        showAlert('¡Pago realizado con éxito! Tu anuncio ya está activo.', 'Pago Exitoso', 'check_circle');
                                        await db.syncWithServer(); // Sincronizar para descargar el nuevo estado 'autorizado'
                                        renderMyListings();
                                        if (isAdminLoggedIn() && typeof loadAdminData === 'function') loadAdminData();
                                    } else {
                                        reject();
                                        const errorMsg = response.error || response.status_detail || 'Rechazado';
                                        showAlert('No se pudo procesar el pago: ' + errorMsg, 'Error en Pago', 'error');
                                    }
                                })
                                    .catch((error) => {
                                        reject();
                                        showAlert('Error de red al procesar el pago.', 'Error', 'error');
                                    });
                            });
                        },
                        onError: (error) => {
                            console.error("Brick Error:", error);
                            showAlert('Error en el formulario de pago: ' + error.message, 'Error', 'error');
                        },
                    },
                };
                try {
                    window.paymentBrickController = await bricksBuilder.create('payment', 'paymentBrick_container', settings);
                } catch (err) {
                    console.error("Brick Creation Error:", err);
                    showAlert('Error al cargar la pasarela: ' + err.message, 'Error', 'error');
                }
            };

            // Pequeño delay para asegurar que el DOM del modal se ha renderizado y tiene dimensiones (width/height)
            setTimeout(() => {
                renderPaymentBrick(bricksBuilder).catch(e => {
                    showAlert('Error en renderización: ' + e.message, 'Error', 'error');
                });
            }, 100);

        } catch (globalErr) {
            console.error("Global MP Error:", globalErr);
            showAlert('Error crítico al abrir pago: ' + globalErr.message, 'Error', 'error');
        }
    };

    // ==========================================
    // CLIENT AD FLOW & ADMIN ADS LOGIC
    // ==========================================
    {
        const btnAdvertise = document.getElementById('btn-advertise');
        const clientAdModal = document.getElementById('client-ad-modal');
        const btnCloseClientAd = document.getElementById('btn-close-client-ad');
        const btnCancelClientAd = document.getElementById('btn-cancel-client-ad');

        // Next step logic
        window.nextAdStep = function (step) {
            const currentStepEl = document.querySelector('.ad-step.active-step');
            if (currentStepEl) {
                const currentStepNum = parseInt(currentStepEl.id.replace('client-ad-step-', ''));
                if (step > currentStepNum) {
                    // Moving forward, validate required fields
                    currentStepEl.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
                    const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
                    let isValid = true;
                    let missingFields = [];

                    inputs.forEach(input => {
                        if (!input.checkValidity()) {
                            isValid = false;
                            input.classList.add('input-error');
                            const formGroup = input.closest('.form-group');
                            if (formGroup) {
                                const label = formGroup.querySelector('label');
                                if (label) {
                                    let labelText = label.childNodes[0].nodeValue || label.textContent;
                                    if (label.querySelector('span')) {
                                        labelText = label.querySelector('span').textContent;
                                    }
                                    labelText = labelText.replace('*', '').trim();
                                    if (!missingFields.includes(labelText)) {
                                        missingFields.push(labelText);
                                    }
                                }
                            }
                        }
                    });

                    if (!isValid) {
                        showAlert(`Faltan completar: ${missingFields.join(', ')}`, 'Información Incompleta', 'warning');
                        return; // Stop advancing
                    }
                }
            }

            document.querySelectorAll('.ad-step').forEach(el => {
                el.style.display = 'none';
                el.classList.remove('active-step');
            });
            const target = document.getElementById('client-ad-step-' + step);
            if (target) {
                target.style.display = 'block';
                target.classList.add('active-step');
            }
        };

        window.openClientAdModal = function () {
            if (!clientAdModal) return;
            document.getElementById('client-ad-form-step2').reset();
            window.clientAdImages = [];
            window.editingAdId = null;
            document.getElementById('client-ad-image-preview-container').innerHTML = '';
            document.getElementById('client-ad-file-chosen-text').textContent = 'Ninguna foto. ¡Recuerda la portada!';
            document.getElementById('desc-char-counter').textContent = '0/220';

            // Auto-fill State and City
            const uState = document.getElementById('user-state').value;
            let uCity = 'Todas';
            if (window.selectedCities && window.selectedCities.length > 0) {
                uCity = window.selectedCities[0];
            }

            const stateEl = document.getElementById('client-ad-state');
            const cityEl = document.getElementById('client-ad-city');
            if (stateEl) {
                stateEl.value = (uState && uState !== 'Todos') ? uState : 'Baja California';
                stateEl.dispatchEvent(new Event('change'));
            }
            if (cityEl) {
                cityEl.value = (uCity && uCity !== 'Todas') ? uCity : 'Mexicali';
            }

            // Reset Progress Bar
            document.getElementById('client-ad-progress-container').style.display = 'none';
            document.getElementById('client-ad-progress-bar').style.width = '0%';
            document.getElementById('client-ad-progress-text').textContent = '0%';

            const btnSubmit = document.getElementById('btn-submit-client-ad');
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Confirmar y Publicar';
            }

            window.nextAdStep(1);
            clientAdModal.classList.add('active');
        };

        if (btnAdvertise) {
            btnAdvertise.addEventListener('click', () => {
                const btnNewListing = document.getElementById('btn-new-listing');
                if (btnNewListing) {
                    btnNewListing.click();
                }
            });
        }

        if (btnCloseClientAd) btnCloseClientAd.addEventListener('click', () => clientAdModal.classList.remove('active'));

        // Character counter for description
        const adDesc = document.getElementById('client-ad-description');
        if (adDesc) {
            adDesc.addEventListener('input', (e) => {
                const count = e.target.value.length;
                document.getElementById('desc-char-counter').textContent = count + '/220';
            });
        }

        // Auto-sync WhatsApp for Client Ads
        const adPhone = document.getElementById('client-ad-phone');
        const adWhatsapp = document.getElementById('client-ad-whatsapp');
        const adPhoneLada = document.getElementById('client-ad-phone-lada');
        const adWaLada = document.getElementById('client-ad-whatsapp-lada');
        let waManuallyEdited = false;
        let phoneManuallyEdited = false;

        function extractCleanAdDigits(raw, lada) {
            if (!raw) return '';
            let digits = String(raw).trim();
            if (digits.startsWith('+52')) digits = digits.substring(3);
            else if (digits.startsWith('+1')) digits = digits.substring(2);
            else if (lada && digits.startsWith(lada)) digits = digits.substring(lada.length);

            digits = digits.replace(/[^0-9]/g, '');
            if (digits.length === 12 && digits.startsWith('52')) digits = digits.substring(2);
            else if (digits.length === 11 && digits.startsWith('1')) digits = digits.substring(1);
            return digits.slice(0, 10);
        }

        if (adPhoneLada && adWaLada) {
            adPhoneLada.addEventListener('change', (e) => {
                if (!waManuallyEdited) {
                    adWaLada.value = e.target.value;
                }
            });
            adWaLada.addEventListener('change', (e) => {
                if (!phoneManuallyEdited) {
                    adPhoneLada.value = e.target.value;
                }
            });
        }

        if (adPhone) {
            adPhone.addEventListener('input', (e) => {
                phoneManuallyEdited = true;
                const lada = adPhoneLada ? adPhoneLada.value : '+52';
                const digits = extractCleanAdDigits(e.target.value, lada);
                adPhone.value = digits;
                if (!waManuallyEdited && adWhatsapp) {
                    adWhatsapp.value = digits ? `${lada} ${digits}` : '';
                }
            });
        }

        if (adWhatsapp) {
            adWhatsapp.addEventListener('input', (e) => { 
                waManuallyEdited = true; 
                const lada = adPhoneLada ? adPhoneLada.value : '+52';
                const digits = extractCleanAdDigits(e.target.value, lada);
                if (digits.length > 0) {
                    adWhatsapp.value = `${lada} ${digits}`;
                } else {
                    adWhatsapp.value = '';
                }
                if (!phoneManuallyEdited && adPhone) {
                    adPhone.value = digits;
                }
            });
        }
        if (adWaLada) {
            adWaLada.addEventListener('change', () => { waManuallyEdited = true; });
        }
        if (adPhoneLada) {
            adPhoneLada.addEventListener('change', () => {
                phoneManuallyEdited = true;
                const newLada = adPhoneLada.value;
                if (adWhatsapp && adWhatsapp.value.trim()) {
                    const digits = extractCleanAdDigits(adWhatsapp.value, newLada);
                    if (digits) {
                        adWhatsapp.value = `${newLada} ${digits}`;
                    }
                }
            });
        }

        const clientAdUpload = document.getElementById('client-ad-image-upload');
        if (clientAdUpload) {
            clientAdUpload.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);
                if (!files.length) return;

                window.clientAdImages = window.clientAdImages || [];

                if (window.clientAdImages.length + files.length > 8) {
                    showAlert('Solo puedes subir hasta 8 fotos.', 'Límite de fotos', 'warning');
                    return;
                }

                const uploadBtnLabel = document.querySelector('label[for="client-ad-image-upload"]');
                const originalText = uploadBtnLabel.innerHTML;
                uploadBtnLabel.innerHTML = '<span class="material-symbols-rounded" style="animation: spin 1s linear infinite;">autorenew</span> Procesando...';
                uploadBtnLabel.style.pointerEvents = 'none';

                for (let file of files) {
                    try {
                        const dataUrl = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const img = new Image();
                                img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    const MAX_WIDTH = 800;
                                    let scaleSize = 1;
                                    if (img.width > MAX_WIDTH) {
                                        scaleSize = MAX_WIDTH / img.width;
                                    }
                                    canvas.width = img.width * scaleSize;
                                    canvas.height = img.height * scaleSize;
                                    const ctx = canvas.getContext('2d');
                                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                    resolve(canvas.toDataURL('image/webp', 0.8));
                                };
                                img.onerror = () => reject(new Error("Error cargando imagen"));
                                img.src = e.target.result;
                            };
                            reader.onerror = () => reject(new Error("Error leyendo archivo"));
                            reader.readAsDataURL(file);
                        });

                        window.clientAdImages.push(dataUrl);
                    } catch (err) {
                        console.error("Error procesando imagen del anuncio", err);
                    }
                }

                uploadBtnLabel.innerHTML = originalText;
                uploadBtnLabel.style.pointerEvents = 'auto';

                renderClientAdImagePreviews();
            });
        }

        window.renderClientAdImagePreviews = function () {
            const container = document.getElementById('client-ad-image-preview-container');
            const text = document.getElementById('client-ad-file-chosen-text');
            container.innerHTML = '';
            if (!window.clientAdImages || window.clientAdImages.length === 0) {
                text.textContent = 'Ninguna foto. ¡Recuerda la portada!';
                return;
            }

            text.textContent = `${window.clientAdImages.length} foto(s) seleccionada(s)`;

            window.clientAdImages.forEach((imgSrc, idx) => {
                const wrapper = document.createElement('div');
                wrapper.style.position = 'relative';
                wrapper.style.display = 'inline-block';

                const img = document.createElement('img');
                img.src = imgSrc;
                img.style.width = '60px';
                img.style.height = '60px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '6px';
                img.style.border = idx === 0 ? '2px solid #f59e0b' : '1px solid var(--border-color)';

                if (idx === 0) {
                    const badge = document.createElement('div');
                    badge.textContent = 'PORTADA';
                    badge.style.position = 'absolute';
                    badge.style.bottom = '0';
                    badge.style.left = '0';
                    badge.style.right = '0';
                    badge.style.background = '#f59e0b';
                    badge.style.color = 'white';
                    badge.style.fontSize = '0.5rem';
                    badge.style.textAlign = 'center';
                    badge.style.fontWeight = 'bold';
                    badge.style.borderRadius = '0 0 6px 6px';
                    wrapper.appendChild(badge);
                }

                const delBtn = document.createElement('button');
                delBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 14px;">close</span>';
                delBtn.style.position = 'absolute';
                delBtn.style.top = '-4px';
                delBtn.style.right = '-4px';
                delBtn.style.background = 'rgba(255,0,0,0.8)';
                delBtn.style.color = 'white';
                delBtn.style.border = 'none';
                delBtn.style.borderRadius = '50%';
                delBtn.style.width = '20px';
                delBtn.style.height = '20px';
                delBtn.style.display = 'flex';
                delBtn.style.alignItems = 'center';
                delBtn.style.justifyContent = 'center';
                delBtn.style.cursor = 'pointer';

                delBtn.onclick = (ev) => {
                    ev.preventDefault();
                    window.clientAdImages.splice(idx, 1);
                    renderClientAdImagePreviews();
                };

                wrapper.appendChild(img);
                wrapper.appendChild(delBtn);
                container.appendChild(wrapper);
            });
        };

        const btnSubmitClientAd = document.getElementById('btn-submit-client-ad');
        if (btnSubmitClientAd) {
            btnSubmitClientAd.addEventListener('click', async (e) => {
                e.preventDefault();

                const title = document.getElementById('client-ad-title').value.trim();
                const desc = document.getElementById('client-ad-description').value.trim();
                const address = document.getElementById('client-ad-address').value.trim();
                const scheduleMF = document.getElementById('client-ad-schedule-mf').value.trim();
                const scheduleSat = document.getElementById('client-ad-schedule-sat').value.trim();
                const scheduleSun = document.getElementById('client-ad-schedule-sun').value.trim();

                const state = document.getElementById('client-ad-state').value.trim();
                const city = document.getElementById('client-ad-city').value.trim();
                const rawPhone = document.getElementById('client-ad-phone').value.trim();
                const phoneLada = document.getElementById('client-ad-phone-lada') ? document.getElementById('client-ad-phone-lada').value : '+52';
                const phoneDigits = rawPhone.replace(/[^0-9]/g, '');
                const phone = phoneDigits ? `${phoneLada} ${phoneDigits}` : rawPhone;

                const rawWa = document.getElementById('client-ad-whatsapp').value.trim();
                const waLada = document.getElementById('client-ad-whatsapp-lada') ? document.getElementById('client-ad-whatsapp-lada').value : '+52';
                const waDigits = rawWa.replace(/[^0-9]/g, '');
                const wa = waDigits ? `${waLada} ${waDigits}` : rawWa;

                if (!title || !desc || !state || !city) {
                    showAlert('Por favor, completa los campos obligatorios (Título, Descripción, Estado y Ciudad).', 'Campos incompletos', 'warning');
                    return;
                }

                if (!window.editingAdId && (!window.clientAdImages || window.clientAdImages.length === 0)) {
                    showAlert('Debes subir al menos 1 foto para tu portada.', 'Faltan fotos', 'warning');
                    return;
                }

                btnSubmitClientAd.disabled = true;
                btnSubmitClientAd.textContent = 'Guardando anuncio...';

                const progressContainer = document.getElementById('client-ad-progress-container');
                const progressBar = document.getElementById('client-ad-progress-bar');
                const progressText = document.getElementById('client-ad-progress-text');
                if (progressContainer) progressContainer.style.display = 'block';

                try {
                    const uploadedImages = [];
                    const imagesToProcess = window.clientAdImages || [];
                    const totalImgs = imagesToProcess.length;

                    for (let i = 0; i < totalImgs; i++) {
                        let b64 = imagesToProcess[i];
                        if (b64 && b64.startsWith('data:image')) {
                            const blob = await (await fetch(b64)).blob();
                            const file = new File([blob], `ad_img_${Date.now()}.webp`, { type: 'image/webp' });
                            const url = await db.uploadImageToSupabase(file);
                            if (url) uploadedImages.push(url);
                        } else if (b64) {
                            uploadedImages.push(b64);
                        }

                        if (progressBar && progressText) {
                            const pct = Math.round(((i + 1) / Math.max(totalImgs, 1)) * 90);
                            progressBar.style.width = pct + '%';
                            progressText.textContent = pct + '%';
                        }
                    }

                    const socialLinks = [];
                    const fb = document.getElementById('client-ad-link-fb').value.trim();
                    const ig = document.getElementById('client-ad-link-ig').value.trim();
                    const tk = document.getElementById('client-ad-link-tk').value.trim();
                    if (fb) socialLinks.push(fb);
                    if (ig) socialLinks.push(ig);
                    if (tk) socialLinks.push(tk);

                    if (progressBar && progressText) {
                        progressBar.style.width = '95%';
                        progressText.textContent = '95%';
                    }

                    if (window.editingAdId) {
                        const existingAd = db.getAllAds().find(a => String(a.id) === String(window.editingAdId));
                        const finalImages = uploadedImages.length > 0 ? uploadedImages : (existingAd ? existingAd.images : []);

                        const updatedAd = {
                            ...(existingAd || {}),
                            id: window.editingAdId,
                            title: title,
                            description: desc,
                            address: address,
                            scheduleMF: scheduleMF,
                            scheduleSat: scheduleSat,
                            scheduleSun: scheduleSun,
                            state: state,
                            city: city,
                            phone: phone,
                            whatsapp: wa,
                            social_links: socialLinks,
                            images: finalImages,
                            notes: existingAd ? (existingAd.notes || []) : []
                        };

                        try {
                            await db.saveAd(updatedAd);
                            if (updatedAd._pendingSync) {
                                showAlert('Guardado en tu dispositivo. Se subirá a la nube en cuanto vuelva la conexión.', 'Guardado Offline', 'warning');
                            } else {
                                showAlert('¡Anuncio actualizado con éxito en la nube!', 'Actualizado en la Nube', 'check_circle');
                            }
                        } catch (err) {
                            console.error("Error guardando ad en Supabase:", err);
                            const localAds = JSON.parse(localStorage.getItem('revista_autos_ads') || '[]');
                            const adIdx = localAds.findIndex(a => String(a.id) === String(window.editingAdId));
                            if (adIdx > -1) {
                                localAds[adIdx] = { ...localAds[adIdx], ...updatedAd, _pendingSync: true };
                                localStorage.setItem('revista_autos_ads', JSON.stringify(localAds));
                            }
                            showAlert('Guardado en tu dispositivo. Se subirá a la nube en cuanto vuelva la conexión.', 'Guardado Offline', 'warning');
                        }

                        window.editingAdId = null;

                        if (progressBar && progressText) {
                            progressBar.style.width = '100%';
                            progressText.textContent = '100%';
                        }

                        setTimeout(() => {
                            const clientAdModal = document.getElementById('client-ad-modal');
                            if (clientAdModal) clientAdModal.classList.remove('active');
                            btnSubmitClientAd.disabled = false;
                            btnSubmitClientAd.textContent = 'Guardar Cambios';
                            if (progressContainer) progressContainer.style.display = 'none';

                            showAlert('¡Anuncio actualizado con éxito!', 'Actualizado', 'check_circle');

                            const pendingAdsList = document.getElementById('pending-ads-list');
                            if (pendingAdsList) delete pendingAdsList.dataset.lastState;
                            const adminAdsTable = document.getElementById('admin-ads-table-body');
                            if (adminAdsTable) delete adminAdsTable.dataset.lastState;

                            if (typeof forceInstantAdminRefresh === 'function') forceInstantAdminRefresh();
                            if (typeof updateAdminAdsApprovals === 'function') updateAdminAdsApprovals();
                            if (typeof renderAdminAdsTable === 'function') renderAdminAdsTable();
                            if (typeof renderMyListings === 'function') renderMyListings();
                        }, 300);
                    } else {
                        const newAd = {
                            title: title,
                            description: desc,
                            address: address,
                            scheduleMF: scheduleMF,
                            scheduleSat: scheduleSat,
                            scheduleSun: scheduleSun,
                            state: state,
                            city: city,
                            phone: phone,
                            whatsapp: wa,
                            social_links: socialLinks,
                            images: uploadedImages,
                            payment_status: 'pendiente',
                            is_active: false,
                            checkout_price: window.useAdPricingHook ? window.useAdPricingHook.getAdPrice() : (globalAdMonthlyPrice || 500)
                        };

                        const savedAd = await db.saveAd(newAd);

                        if (progressBar && progressText) {
                            progressBar.style.width = '100%';
                            progressText.textContent = '100%';
                        }

                        setTimeout(() => {
                            const clientAdModal = document.getElementById('client-ad-modal');
                            if (clientAdModal) clientAdModal.classList.remove('active');
                            btnSubmitClientAd.disabled = false;
                            btnSubmitClientAd.textContent = 'Confirmar Pago';
                            if (progressContainer) progressContainer.style.display = 'none';
                            if (typeof renderMyListings === 'function') renderMyListings();
                            if (typeof forceInstantAdminRefresh === 'function') forceInstantAdminRefresh();
                            if (typeof updateAdminAdsApprovals === 'function') updateAdminAdsApprovals();

                            window.currentPendingAdId = savedAd.id;
                            window.currentPendingListingId = null;

                            const publishModal = document.getElementById('publish-options-modal');
                            const priceText = document.getElementById('publish-price-text');
                            const btnPayNow = document.getElementById('btn-option-pay-now');
                            const icon = document.getElementById('publish-later-icon');
                            const title = document.getElementById('publish-later-title');
                            const desc = document.getElementById('publish-later-desc');

                            if (publishModal) {
                                if (Number(globalAdMonthlyPrice) === 0) {
                                    document.getElementById('publish-modal-title').textContent = '¡Publica tu anuncio gratis!';
                                    document.getElementById('publish-modal-desc').textContent = 'Tu anuncio publicitario entrará a un breve proceso de revisión por nuestro equipo para ser autorizado durante un mes. ¿Deseas publicarlo ahora?';
                                    if (btnPayNow) btnPayNow.style.display = 'none';
                                    if (icon) icon.textContent = 'check_circle';
                                    if (title) title.textContent = 'Subir Anuncio';
                                    if (desc) desc.textContent = 'Haz clic aquí para enviar tu anuncio a revisión y publicarlo sin costo.';
                                } else if (globalMpEnabled) {
                                    document.getElementById('publish-modal-title').textContent = '¡Casi listo!';
                                    document.getElementById('publish-modal-desc').textContent = '¿Cómo deseas activar tu anuncio?';
                                    if (priceText) priceText.textContent = `$${Number(globalAdMonthlyPrice).toFixed(2)} MXN`;
                                    if (btnPayNow) btnPayNow.style.display = 'flex';
                                    if (icon) icon.textContent = 'support_agent';
                                    if (title) title.textContent = 'Pago Asistido / Revisión';
                                    if (desc) desc.textContent = 'Sube tu anuncio y nosotros te contactaremos para finalizar el proceso de pago y activación por un mes.';
                                } else {
                                    document.getElementById('publish-modal-title').textContent = '¡Casi listo!';
                                    document.getElementById('publish-modal-desc').textContent = 'Sube tu anuncio a continuación.';
                                    if (btnPayNow) btnPayNow.style.display = 'none';
                                    if (icon) icon.textContent = 'support_agent';
                                    if (title) title.textContent = 'Enviar a Revisión';
                                    if (desc) desc.textContent = 'Sube tu anuncio y nos pondremos en contacto contigo para completar la activación.';
                                }

                                publishModal.classList.add('active');
                            }
                        }, 300);
                    }
                } catch (err) {
                    console.error(err);
                    showAlert('Error al crear el anuncio.', 'Error', 'error');
                    btnSubmitClientAd.disabled = false;
                    btnSubmitClientAd.textContent = 'Confirmar Pago';
                    progressContainer.style.display = 'none';
                }
            });
        }

        // Update btn-option-pay-now and later to handle ads
        const originalBtnPayNow = document.getElementById('btn-option-pay-now');
        if (originalBtnPayNow) {
            const clonedBtn = originalBtnPayNow.cloneNode(true);
            originalBtnPayNow.parentNode.replaceChild(clonedBtn, originalBtnPayNow);
            clonedBtn.addEventListener('click', () => {
                document.getElementById('publish-options-modal').classList.remove('active');
                window.openedFromDashboard = false;
                if (window.currentPendingAdId) {
                    openMercadoPagoBrickAd(window.currentPendingAdId);
                } else {
                    window.openMercadoPagoBrick(window.currentPendingListingId, false);
                }
            });
        }

        const originalBtnPayLater = document.getElementById('btn-option-pay-later');
        if (originalBtnPayLater) {
            const clonedLater = originalBtnPayLater.cloneNode(true);
            originalBtnPayLater.parentNode.replaceChild(clonedLater, originalBtnPayLater);
            clonedLater.addEventListener('click', () => {
                document.getElementById('publish-options-modal').classList.remove('active');
                if (window.currentPendingAdId) {
                    window.currentPendingAdId = null;
                    showAlert('Tu anuncio ha sido guardado y está pendiente de aprobación.', 'Anuncio Creado', 'check_circle', () => {
                        if (typeof switchView === 'function') switchView('view-alta');
                        if (typeof renderMyListings === 'function') renderMyListings();
                    });
                } else {
                    showAlert('¡Vehículo publicado con éxito! Está pendiente de aprobación.', 'Publicado', 'check_circle', () => {
                        if (typeof switchView === 'function') switchView('view-alta');
                        if (typeof renderMyListings === 'function') renderMyListings();
                    });
                }
            });
        }

        window.openMercadoPagoBrickAd = function (adId) {
            try {
                if (!globalMpPublicKey) {
                    showAlert('El sistema de pagos no está configurado.', 'Error', 'error');
                    return;
                }

                const modalMp = document.getElementById('mercado-pago-modal');
                modalMp.classList.add('active');

                if (window.paymentBrickController) {
                    window.paymentBrickController.unmount();
                    window.paymentBrickController = null;
                }

                const container = document.getElementById('paymentBrick_container');
                container.innerHTML = '';

                const mp = new MercadoPago(globalMpPublicKey, { locale: 'es-MX' });
                const bricksBuilder = mp.bricks();

                let amountToCharge = (typeof globalAdMonthlyPrice !== 'undefined') ? Number(globalAdMonthlyPrice) : 500;
                if (adId && window.useAdPricingHook) {
                    const allAds = (typeof db !== 'undefined' && db.getAllAds) ? db.getAllAds() : [];
                    const targetAd = allAds.find(a => String(a.id) === String(adId));
                    if (targetAd) amountToCharge = window.useAdPricingHook.getAdPrice(targetAd);
                }

                const priceHeader = document.getElementById('mp-modal-price-header');
                if (priceHeader) {
                    priceHeader.style.display = 'block';
                    priceHeader.innerHTML = `<h2 style="margin:0; font-size: 1.8rem; font-weight: normal; color: var(--text-main);">Total a pagar <span style="color: var(--primary-color); font-weight: bold;">$${Number(amountToCharge).toFixed(2)}</span> MXN</h2>`;
                }

                const renderPaymentBrick = async (bricksBuilder) => {
                    const settings = {
                        initialization: {
                            amount: amountToCharge
                        },
                        customization: {
                            visual: { style: { theme: 'default' } },
                            paymentMethods: { creditCard: "all", debitCard: "all" }
                        },
                        callbacks: {
                            onReady: () => { console.log("Ad Brick is ready!"); },
                            onSubmit: ({ selectedPaymentMethod, formData }) => {
                                return new Promise((resolve, reject) => {
                                    setTimeout(async () => {
                                        resolve();
                                        modalMp.classList.remove('active');

                                        const ads = db.getAllAds();
                                        const adIdx = ads.findIndex(a => String(a.id) === String(adId));
                                        if (adIdx > -1) {
                                            ads[adIdx].is_active = true;
                                            ads[adIdx].payment_status = 'pagado';

                                            const now = new Date();
                                            ads[adIdx].start_date = now.toISOString();
                                            const end = new Date(now);
                                            end.setDate(end.getDate() + 30);
                                            ads[adIdx].end_date = end.toISOString();

                                            await db.saveAd(ads[adIdx]);

                                            const amount = (typeof globalAdMonthlyPrice !== 'undefined' && !isNaN(Number(globalAdMonthlyPrice))) ? Number(globalAdMonthlyPrice) : 500;
                                            db.addAdPayment(ads[adIdx].id, amount, null, 'Publicidad', 'mercadopago');
                                            db.logActivity('Pago de publicidad (MP)', `Publicidad #${ads[adIdx].id} (${ads[adIdx].title || 'Sin título'})`, ads[adIdx].city || ads[adIdx].target_city || 'Global');
                                        }

                                        window.currentPendingAdId = null;
                                        showAlert('¡Pago exitoso! Tu anuncio ya está ACTIVO.', 'Pago Aprobado', 'check_circle', () => {
                                            if (typeof switchView === 'function') switchView('view-alta');
                                            if (typeof renderMyListings === 'function') renderMyListings();
                                        });
                                    }, 2000);
                                });
                            },
                            onError: (error) => {
                                showAlert('Error en el formulario de pago: ' + error.message, 'Error', 'error');
                            },
                        },
                    };
                    window.paymentBrickController = await bricksBuilder.create('payment', 'paymentBrick_container', settings);
                };
                setTimeout(() => { renderPaymentBrick(bricksBuilder); }, 100);
            } catch (globalErr) {
                console.error("Global MP Error:", globalErr);
            }
        };

        // --- Admin Pending Ads Rendering ---
        window.renderAdminAdsTable = async function () {
            const tbody = document.getElementById('ads-table-body');
            if (!tbody) return;

            // Renderizar primero desde localStorage (inmediato, sin bloquear)
            // La sincronizacion con Supabase se hace en segundo plano
            if (typeof db !== 'undefined' && db.syncAdsWithServer) {
                db.syncAdsWithServer().then(() => {
                    const tbodyAfterSync = document.getElementById('ads-table-body');
                    if (tbodyAfterSync) {
                        const adsSync = db.getAllAds();
                        const stateKeySync = JSON.stringify(adsSync);
                        if (tbodyAfterSync.dataset.lastState !== stateKeySync) {
                            delete tbodyAfterSync.dataset.lastState;
                            window.renderAdminAdsTable();
                        }
                    }
                }).catch(e => console.warn('Sync ads error (background):', e));
            }


            const searchInput = document.getElementById('ads-search-input');
            if (searchInput && !searchInput.dataset.hasListener) {
                searchInput.dataset.hasListener = 'true';
                searchInput.addEventListener('input', () => window.renderAdminAdsTable());
            }

            let ads = db.getAllAds().filter(a => a.payment_status !== 'pendiente');

            // --- FILTRO EMPLEADO LIMITADO: solo ve anuncios de su región ---
            const currentRole = window.currentAdminUser ? window.currentAdminUser.role : null;
            if (currentRole === 'empleado_limitado' && window.currentAdminUser) {
                const allowedStates = window.currentAdminUser.allowedStates || [];
                const allowedCities = window.currentAdminUser.allowedCities || [];
                if (allowedStates.length > 0 || allowedCities.length > 0) {
                    ads = ads.filter(a => {
                        const adState = (a.state || '').trim();
                        const adCity = (a.city || '').trim();
                        // Si el estado completo está permitido
                        if (allowedStates.includes(adState)) return true;
                        // Si la ciudad específica está permitida
                        if (allowedCities.includes(adCity)) return true;
                        return false;
                    });
                }
            }
            // --- FIN FILTRO EMPLEADO LIMITADO ---

            const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            if (query) {
                ads = ads.filter(a =>
                    (a.title && a.title.toLowerCase().includes(query)) ||
                    (a.phone && a.phone.includes(query)) ||
                    (a.ref_number && String(a.ref_number).includes(query)) ||
                    (String(a.id).includes(query))
                );
            }
            const stateKey = JSON.stringify(ads);
            if (tbody.dataset.lastState === stateKey) return;
            tbody.dataset.lastState = stateKey;

            if (!ads || ads.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px; color:var(--text-muted);">No hay anuncios registrados.</td></tr>';
                return;
            }

            tbody.innerHTML = ads.map(ad => {
                const firstImg = (ad.images && ad.images.length > 0) ? ad.images[0] : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80';
                const refNum = ad.ref_number || ad.id;

                let statusBadge = '<span class="status-badge status-pendiente">Pendiente</span>';
                if (ad.is_active) {
                    statusBadge = '<span class="status-badge status-autorizado" style="background: var(--success-color); color: white;">Activo</span>';
                } else if (ad.payment_status === 'pendiente') {
                    statusBadge = '<span class="status-badge status-pendiente" style="background: #f59e0b; color: white;">Pendiente Pago</span>';
                } else {
                    statusBadge = '<span class="status-badge status-caducado" style="background: var(--danger-color); color: white;">Inactivo</span>';
                }

                let vigenciaStr = 'Sin definir';
                if (ad.start_date && ad.end_date) {
                    const start = new Date(ad.start_date).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
                    const end = new Date(ad.end_date).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' });
                    vigenciaStr = `${start} al ${end}`;
                }

                return `
                <tr>
                    <td style="text-align:center; padding: 6px 4px;">
                        <span style="display:inline-block; background:rgba(245,158,11,0.12); color:#f59e0b; border-radius:6px; padding:3px 7px; font-size:0.75rem; font-weight:700; letter-spacing:0.03em; white-space:nowrap;">#${refNum}</span>
                    </td>
                    <td style="display:flex; align-items:center; gap:10px; padding: 8px;">
                        <img src="${firstImg}" style="width:40px; height:40px; object-fit:cover; border-radius:6px;">
                        <div>
                            <strong style="color:var(--text-main); font-size: 0.9rem;">${ad.title || 'Sin título'}</strong>
                            <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHTML(ad.phone || '')}</div>
                        </div>
                    </td>
                    <td>${ad.state || ''} ${ad.city ? '/ ' + ad.city : ''}</td>
                    <td style="font-size: 0.85rem;">${vigenciaStr}</td>
                    <td style="font-size: 0.85rem;">👁️ ${ad.views || 0} | 🖱️ ${ad.clicks || 0}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="primary-btn" onclick="window.openEditAd(${ad.id})" style="padding:4px 8px; font-size:0.8rem; background:var(--surface-light); color:var(--text-main);">Editar</button>
                            <button class="danger-btn" onclick="window.appConfirm('\u00bfEliminar esta publicidad?', async () => { await db.deleteAd(${ad.id}); const tbody = document.getElementById('ads-table-body'); if(tbody) delete tbody.dataset.lastState; renderAdminAdsTable(); showAlert('Publicidad eliminada.', 'Eliminada', 'check_circle'); })" style="padding:4px 8px; font-size:0.8rem;">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
            }).join('');
        };

        window.expandedAdminAdCards = window.expandedAdminAdCards || new Set();

        window.togglePendingAdDetail = function (id) {
            const targetIdStr = String(id);
            const isCurrentlyExpanded = window.expandedAdminAdCards && window.expandedAdminAdCards.has(targetIdStr);

            // Cerrar todas las tarjetas abiertas previamente (modo acordeón)
            if (window.expandedAdminAdCards) {
                window.expandedAdminAdCards.forEach(openId => {
                    const openCard = document.getElementById(`pending-ad-card-${openId}`);
                    const openIcon = document.getElementById(`pending-ad-expand-icon-${openId}`);
                    if (openCard) openCard.classList.remove('expanded');
                    if (openIcon) openIcon.style.transform = 'rotate(0deg)';
                });
                window.expandedAdminAdCards.clear();
            }

            // Si no estaba abierta, abrir la tarjeta seleccionada
            if (!isCurrentlyExpanded) {
                const card = document.getElementById(`pending-ad-card-${id}`);
                const icon = document.getElementById(`pending-ad-expand-icon-${id}`);
                if (card) {
                    card.classList.add('expanded');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                    window.expandedAdminAdCards.add(targetIdStr);
                }
            }
        };

        window.savePendingAdNote = function (id) {
            const input = document.getElementById(`ad-note-input-${id}`);
            if (!input || !input.value.trim()) return;

            const noteText = input.value.trim();
            const newNote = db.addAdNote(id, noteText);

            if (newNote) {
                input.value = '';

                const listEl = document.getElementById(`crm-ad-notes-list-${id}`);
                const noMsgEl = document.getElementById(`no-ad-notes-msg-${id}`);
                if (noMsgEl) noMsgEl.remove();

                if (listEl) {
                    const noteItemHTML = `
                    <div class="crm-note-item" style="animation: fadeIn 0.3s ease;">
                        <div class="crm-note-time">
                            <span class="material-symbols-rounded" style="font-size:13px; vertical-align:middle;">schedule</span> ${newNote.timestamp}
                        </div>
                        <div class="crm-note-text">${newNote.text}</div>
                    </div>
                `;
                    listEl.insertAdjacentHTML('afterbegin', noteItemHTML);
                }

                const ads = db.getAllAds();
                const ad = ads.find(a => String(a.id) === String(id));
                const notesCount = ad && ad.notes ? ad.notes.length : 1;
                const badgeEl = document.getElementById(`ad-notes-badge-${id}`);
                if (badgeEl) {
                    badgeEl.className = 'pending-notes-badge has-notes';
                    badgeEl.innerHTML = `<span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle;">chat</span> ${notesCount} nota(s) CRM`;
                }

                // --- Auto-cerrar renglón de publicidad y moverlo al final vía re-render ordenado ---
                const card = document.getElementById(`pending-ad-card-${id}`);
                if (card) {
                    card.classList.remove('expanded');
                    const icon = document.getElementById(`pending-ad-expand-icon-${id}`);
                    if (icon) icon.style.transform = 'rotate(0deg)';
                    if (window.expandedAdminAdCards) window.expandedAdminAdCards.delete(String(id));
                }
                // Marcar este ID como "ya procesado" para que el render lo coloque al final
                window.pendingAdsMoveToEnd = window.pendingAdsMoveToEnd || new Set();
                window.pendingAdsMoveToEnd.add(String(id));
                // Forzar re-render con nuevo orden
                const pendingAdsListEl = document.getElementById('pending-ads-list');
                if (pendingAdsListEl) delete pendingAdsListEl.dataset.lastState;
                if (typeof updateAdminAdsApprovals === 'function') updateAdminAdsApprovals();
            }
        };

        window.updateAdminAdsApprovals = function () {
            const list = document.getElementById('pending-ads-list');
            const badge = document.getElementById('pending-ads-count-badge');
            const sidebarBadge = document.getElementById('sidebar-pending-ads-badge');
            if (!list) return;

            let pendingAds = db.getAllAds().filter(a => a.payment_status === 'pendiente');

            if (badge) badge.textContent = pendingAds.length;
            if (sidebarBadge) {
                sidebarBadge.textContent = pendingAds.length;
                sidebarBadge.style.display = pendingAds.length > 0 ? 'inline-block' : 'none';
            }

            const searchInput = document.getElementById('pending-search-input');
            const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            if (query) {
                pendingAds = pendingAds.filter(a =>
                    (a.title && a.title.toLowerCase().includes(query)) ||
                    (a.phone && a.phone.includes(query)) ||
                    (a.ref_number && String(a.ref_number).includes(query))
                );
            }

            // Ordenar: ads con nota CRM reciente van al final (cola de revisión)
            if (window.pendingAdsMoveToEnd && window.pendingAdsMoveToEnd.size > 0) {
                pendingAds.sort((a, b) => {
                    const aEnd = window.pendingAdsMoveToEnd.has(String(a.id)) ? 1 : 0;
                    const bEnd = window.pendingAdsMoveToEnd.has(String(b.id)) ? 1 : 0;
                    return aEnd - bEnd;
                });
            }

            const stateKey = JSON.stringify(pendingAds) + '_' + Array.from(window.expandedAdminAdCards || []).join(',') + '_' + query + '_' + Array.from(window.pendingAdsMoveToEnd || []).join(',');
            if (list.dataset.lastState === stateKey) return;
            list.dataset.lastState = stateKey;

            if (pendingAds.length === 0) {
                list.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 20px;">No hay anuncios pendientes de aprobación.</p>';
                return;
            }

            list.innerHTML = pendingAds.map(ad => {
                const images = ad.images || [];
                const mainImg = images.length > 0 ? images[0] : 'https://via.placeholder.com/60';
                const imgGalleryHTML = images.map((img, index) => `
                <div style="position: relative; display: inline-block;">
                    <img src="${img}" onclick="event.stopPropagation(); window.open('${img}', '_blank')" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); flex-shrink: 0; cursor: pointer;" title="Ver imagen en tamaño completo">
                </div>
            `).join('');

                let socialLinks = ad.social_links || [];
                if (typeof socialLinks === 'string') {
                    try { socialLinks = JSON.parse(socialLinks); } catch (e) { socialLinks = []; }
                }
                const socialLinksStr = Array.isArray(socialLinks) && socialLinks.length > 0
                    ? socialLinks.map(s => typeof s === 'object' ? `${s.platform || 'Red'}: ${s.url || ''}` : s).join(', ')
                    : 'Ninguna';

                let notes = ad.notes || [];
                if (typeof notes === 'string') {
                    try { notes = JSON.parse(notes); } catch (e) { notes = []; }
                }
                const notesCount = notes.length;
                const notesBadgeHTML = notesCount > 0
                    ? `<span class="pending-notes-badge has-notes" id="ad-notes-badge-${ad.id}"><span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle;">chat</span> ${notesCount} nota(s) CRM</span>`
                    : `<span class="pending-notes-badge" id="ad-notes-badge-${ad.id}">Sin notas</span>`;

                const notesListHTML = notes.length > 0 ? notes.map(n => `
                <div class="crm-note-item">
                    <div class="crm-note-time">
                        <span class="material-symbols-rounded" style="font-size:13px; vertical-align:middle;">schedule</span> ${n.timestamp}
                    </div>
                    <div class="crm-note-text">${n.text}</div>
                </div>
            `).join('') : `<p id="no-ad-notes-msg-${ad.id}" style="color:var(--text-muted); font-size:0.82rem; margin:0;">No hay notas registradas aún. Escribe abajo para dejar evidencia.</p>`;

                const isExpanded = window.expandedAdminAdCards && window.expandedAdminAdCards.has(String(ad.id));

                return `
            <div class="pending-approval-card ${isExpanded ? 'expanded' : ''}" id="pending-ad-card-${ad.id}" style="border-left: 4px solid #f59e0b;">
                <div class="pending-row-header" onclick="togglePendingAdDetail(${ad.id})">
                    <div class="pending-row-left">
                        <div class="pending-thumb-wrapper">
                            <img src="${mainImg}" alt="${ad.title}">
                            ${images.length > 1 ? `<span class="pending-img-count">📸 ${images.length}</span>` : ''}
                        </div>
                        <div class="pending-main-info">
                            <div class="pending-title">${ad.title || 'Sin título'} <span style="background:var(--danger-color); color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold;">Pago Asistido / Pendiente</span></div>
                            <div class="pending-sub-info">
                                <span>📍 ${ad.state ? ad.state + ' / ' : ''}${ad.city || ''}</span>
                                <span class="copyable-phone" onclick="event.stopPropagation(); copyToClipboard('${escapeHTML(ad.phone)}', 'Teléfono')">📞 ${escapeHTML(ad.phone || 'Sin tel')}</span>
                                ${notesBadgeHTML}
                            </div>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${escapeHTML(ad.description || 'Sin descripción')}
                            </div>
                        </div>
                    </div>
                    <div class="pending-row-right">
                        <button class="danger-btn" onclick="event.stopPropagation(); deleteAdAdmin(${ad.id})" title="Rechazar anuncio" style="padding: 6px 12px; display:flex; align-items:center; gap:4px;">
                            <span class="material-symbols-rounded" style="font-size:16px;">close</span> Rechazar
                        </button>
                        <button class="success-btn" onclick="event.stopPropagation(); approveAd(${ad.id})" title="Autorizar anuncio" style="padding: 6px 12px; display:flex; align-items:center; gap:4px; background:#f59e0b;">
                            <span class="material-symbols-rounded" style="font-size:16px;">check</span> Autorizar
                        </button>
                        <span id="pending-ad-expand-icon-${ad.id}" class="material-symbols-rounded" style="transition: transform 0.2s; color: var(--text-muted); ${isExpanded ? 'transform: rotate(180deg);' : ''}">expand_more</span>
                    </div>
                </div>

                <!-- Panel Expandible de Detalle y CRM de Anuncio -->
                <div class="pending-detail-panel">
                    <!-- Fotos del Anuncio -->
                    ${images.length > 0 ? `
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">Fotos del Anuncio (${images.length}):</div>
                            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: thin;">
                                ${imgGalleryHTML}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Especificaciones / Datos del Anuncio -->
                    <div style="background: var(--surface-color); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.85rem;">
                        <button class="primary-btn" onclick="event.stopPropagation(); window.openEditAd(${ad.id})" style="width: 100%; margin-bottom: 8px; justify-content: center; display: flex; align-items: center; gap: 4px; padding: 6px; font-size: 0.85rem; background: var(--surface-light); border: 1px solid var(--border-color); color: var(--text-main);">
                            <span class="material-symbols-rounded" style="font-size: 16px;">edit</span> Editar Datos de la Publicidad
                        </button>
                        
                        <div style="font-weight: bold; font-size: 0.95rem; color: #f59e0b; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                            <span class="material-symbols-rounded" style="font-size: 18px;">campaign</span> Información de la Publicidad
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div><strong>Título:</strong> ${ad.title || '-'}</div>
                                <div><strong>Dirección:</strong> ${ad.address || '-'}</div>
                                <div><strong>Estado / Ciudad:</strong> ${ad.state ? ad.state + ' / ' : ''}${ad.city || '-'}</div>
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div><strong>Teléfono:</strong> <span class="copyable-phone" onclick="event.stopPropagation(); copyToClipboard('${escapeHTML(ad.phone)}', 'Teléfono')" title="Clic para copiar">${escapeHTML(ad.phone || '-')}</span></div>
                                <div><strong>WhatsApp:</strong> ${ad.whatsapp ? `<span class="copyable-phone" onclick="event.stopPropagation(); copyToClipboard('${escapeHTML(ad.whatsapp)}', 'WhatsApp')" title="Clic para copiar">${escapeHTML(ad.whatsapp)}</span>` : '-'}</div>
                                <div><strong>Correo:</strong> ${ad.email || '-'}</div>
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div><strong>Horario L-V:</strong> ${ad.scheduleMF || '-'}</div>
                                <div><strong>Horario Sáb:</strong> ${ad.scheduleSat || '-'}</div>
                                <div><strong>Horario Dom:</strong> ${ad.scheduleSun || '-'}</div>
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div><strong>Sitio Web / Link:</strong> ${ad.website ? `<a href="${ad.website.startsWith('http') ? ad.website : 'https://' + ad.website}" target="_blank" style="color:var(--primary-color); text-decoration:underline;">${escapeHTML(ad.website)}</a>` : '-'}</div>
                                <div><strong>Redes Sociales:</strong> ${socialLinksStr}</div>
                            </div>
                        </div>

                        <div style="background: var(--surface-light); padding: 10px; border-radius: 6px; margin-top: 16px;">
                            <strong style="display: block; margin-bottom: 4px;">Descripción completa:</strong>
                            <span style="color: var(--text-main); white-space: pre-wrap;">${escapeHTML(ad.description || 'Sin descripción')}</span>
                        </div>
                    </div>

                    <!-- Módulo CRM de Bitácora / Notas de Seguimiento de Anuncios -->
                    <div class="crm-notes-container" style="margin-top: 14px;">
                        <div class="crm-notes-header">
                            <span style="display:flex; align-items:center; gap:6px;">
                                <span class="material-symbols-rounded" style="color:#f59e0b;">history_edu</span>
                                Bitácora de Evidencia / Seguimiento CRM (Anuncio)
                            </span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">Historial guardado permanente</span>
                        </div>
                        <div class="crm-notes-list" id="crm-ad-notes-list-${ad.id}">
                            ${notesListHTML}
                        </div>
                        <div style="display:flex; gap:8px;">
                            <input type="text" id="ad-note-input-${ad.id}" placeholder="Escribe un avance o seguimiento de esta publicidad (ej: llamada, pago recibido)..." style="flex:1; padding:8px 12px; border-radius:6px; border:1px solid var(--border-color); background:var(--surface-light); color:var(--text-main); font-size:0.85rem; outline:none;" onkeydown="if(event.key==='Enter'){ event.preventDefault(); savePendingAdNote(${ad.id}); }">
                            <button class="primary-btn" onclick="savePendingAdNote(${ad.id})" style="width:auto; padding:8px 14px; font-size:0.85rem; border-radius:6px; background:#f59e0b;">
                                <span class="material-symbols-rounded" style="font-size:16px;">save</span> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
            }).join('');
        };

        window.approveAd = async function (id) {
            window.appConfirm('¿Estás seguro de autorizar este anuncio? Pasará a estar ACTIVO.', async () => {
                let ads = db.getAllAds();
                let ad = ads.find(a => String(a.id) === String(id));

                if (!ad && typeof supabaseClient !== 'undefined' && supabaseClient) {
                    try {
                        const { data } = await supabaseClient.from('ads').select('*').eq('id', id);
                        if (data && data.length > 0) ad = data[0];
                    } catch (e) { }
                }

                if (ad) {
                    ad.is_active = true;
                    ad.payment_status = 'pagado';

                    const now = new Date();
                    ad.start_date = now.toISOString();
                    const end = new Date(now);
                    end.setDate(end.getDate() + 30);
                    ad.end_date = end.toISOString();

                    await db.saveAd(ad);

                    const amount = window.useAdPricingHook ? window.useAdPricingHook.getAdPrice(ad) : (globalAdMonthlyPrice || 500);
                    db.addAdPayment(ad.id, amount, null, 'Publicidad', 'manual');
                    db.logActivity('Autorización de publicidad', `Publicidad #${ad.id} (${ad.title || 'Sin título'})`, ad.city || ad.target_city || 'Global');

                    showAlert('El anuncio ha sido autorizado y está visible.', 'Anuncio Autorizado', 'check_circle');
                    if (typeof forceInstantAdminRefresh === 'function') forceInstantAdminRefresh();
                    if (typeof updateAdminAdsApprovals === 'function') await updateAdminAdsApprovals();
                    if (typeof updateAdminPendingAds === 'function') await updateAdminPendingAds();
                    if (typeof renderAdminAdsTable === 'function') await renderAdminAdsTable();
                }
            });
        };

        window.deleteAdAdmin = async function (id) {
            window.appConfirm('¿Rechazar y eliminar permanentemente este anuncio?', async () => {
                await db.deleteAd(id);
                showAlert('Anuncio rechazado y eliminado.', 'Eliminado', 'info');
                if (typeof forceInstantAdminRefresh === 'function') forceInstantAdminRefresh();
            });
        };

        // Hook updateAdminAdsApprovals into forceInstantAdminRefresh
        const originalRefresh = window.forceInstantAdminRefresh;
        window.forceInstantAdminRefresh = function () {
            if (originalRefresh) originalRefresh();
            if (typeof updateAdminAdsApprovals === 'function') updateAdminAdsApprovals();
        };
    } // End of CLIENT AD FLOW scope

    // --- Global Fullscreen Navigation & Keyboard ---
    document.getElementById('ad-fullscreen-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'ad-fullscreen-modal') {
            document.getElementById('btn-close-ad-modal')?.click();
        }
    });

    document.getElementById('view-detalle')?.addEventListener('click', (e) => {
        if (e.target.id === 'view-detalle') {
            window.closeListingDetails();
        }
    });

    document.addEventListener('keydown', (e) => {
        const viewDetalle = document.getElementById('view-detalle');
        if (viewDetalle && viewDetalle.classList.contains('active')) {
            if (e.key === 'Escape') {
                window.closeListingDetails();
                e.preventDefault();
            } else if (e.key === 'ArrowLeft') {
                if (window.navigateListingGlobal) window.navigateListingGlobal(-1);
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                if (window.navigateListingGlobal) window.navigateListingGlobal(1);
                e.preventDefault();
            }
            return; // Evitar procesar el ad-fullscreen-modal si ya estamos en view-detalle
        }

        const adModal = document.getElementById('ad-fullscreen-modal');
        if (adModal && adModal.classList.contains('active')) {
            if (e.key === 'Escape') {
                document.getElementById('btn-close-ad-modal')?.click();
                e.preventDefault();
            } else if (e.key === 'ArrowLeft') {
                if (window.navigateAdGlobal) window.navigateAdGlobal(-1);
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                if (window.navigateAdGlobal) window.navigateAdGlobal(1);
                e.preventDefault();
            }
        }
    });

    // --- Autoplay Fullscreen Carousels ---
    let autoplayInterval = null;

    window.startFullscreenAutoplay = function (isAd = false, imagesLength = 0) {
        if (imagesLength <= 1) return;
        window.stopFullscreenAutoplay();

        autoplayInterval = setInterval(() => {
            if (isAd) {
                if (window.scrollAdCarousel) window.scrollAdCarousel(1);
            } else {
                const carousel = document.querySelector('.detalle-img-carousel');
                if (carousel) {
                    const scrollAmount = carousel.clientWidth;
                    if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
                        carousel.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    }
                }
            }
        }, 4000);
    };

    window.stopFullscreenAutoplay = function () {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    };

    // --- Lógica de Auto-Scroll Inteligente ---
    window.initAutoScroll = function (container) {
        // Prevenir inicialización múltiple
        if (container.dataset.autoScrollInit) return;
        container.dataset.autoScrollInit = "true";

        let swipeCount = 0;
        let lastSwipeTime = 0;
        let touchStartX = 0;
        let touchEndX = 0;
        let autoScrollId = null;
        let swipeResetTimeout = null;
        let isAutoScrolling = false;
        let lastScrollLeft = -1; // para detectar si ya no avanza (llegó al final)

        function startAutoScroll() {
            if (isAutoScrolling) return;
            isAutoScrolling = true;
            swipeCount = 0;

            function step() {
                if (!isAutoScrolling) return;

                // Guardamos el scroll actual antes de mover
                const prevScroll = container.scrollLeft;

                // Sumamos 1 pixel o fracción
                container.scrollLeft += 1;

                // Si el scroll no cambió, llegamos al final (o al límite derecho)
                if (container.scrollLeft === prevScroll) {
                    stopAutoScroll();
                    return;
                }

                autoScrollId = requestAnimationFrame(step);
            }
            autoScrollId = requestAnimationFrame(step);
        }

        function stopAutoScroll() {
            if (autoScrollId) {
                cancelAnimationFrame(autoScrollId);
                autoScrollId = null;
            }
            isAutoScrolling = false;
        }

        container.addEventListener('touchstart', (e) => {
            stopAutoScroll(); // Al tocar, se detiene la animación
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const distance = touchStartX - touchEndX; // Positivo significa deslizar hacia la izquierda (avanzar carrusel)

            // Detectar swipe intencional (ej. > 30px)
            if (Math.abs(distance) > 30) {
                const now = Date.now();
                if (now - lastSwipeTime < 3000) {
                    // Si el último swipe fue hace menos de 3 seg
                    swipeCount++;
                } else {
                    swipeCount = 1; // Reiniciar cuenta si pasó mucho tiempo
                }
                lastSwipeTime = now;

                clearTimeout(swipeResetTimeout);

                if (swipeCount >= 2) {
                    // Esperamos un poquito para que el scroll nativo termine la inercia, luego auto-scroll
                    setTimeout(() => {
                        startAutoScroll();
                    }, 500);
                } else {
                    // Si no llega al segundo swipe en 3 segundos, reset
                    swipeResetTimeout = setTimeout(() => {
                        swipeCount = 0;
                    }, 3000);
                }
            }
        }, { passive: true });

        // Detener con clics de mouse también
        container.addEventListener('mousedown', () => {
            stopAutoScroll();
        });

        // Detener al usar la rueda del ratón
        container.addEventListener('wheel', () => {
            stopAutoScroll();
        }, { passive: true });
    };

    if (window.updateNavFavoriteIcon) window.updateNavFavoriteIcon();

});


// --- Funciones para Interacciones Sociales en Fullscreen ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function playBubbleSound(isReverse = false) {
    if (!audioCtx) {
        try { audioCtx = new AudioContext(); } catch (e) { return; }
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    if (!isReverse) {
        // Sonido para LIKE: Tono agudo y suave (880Hz -> 420Hz)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.07);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.start(now);
        osc.stop(now + 0.08);
    } else {
        // Sonido para DISLIKE / Quitar reacción: Sonido burbuja anterior (600Hz -> 150Hz)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }
}

window.toggleSocialReaction = function (event, listingId, reactionType) {
    event.stopPropagation();

    console.log(`👆 toggleSocialReaction: listingId=${listingId}, type=${reactionType}`);
    console.log(`   window.db existe: ${!!window.db}, updateReaction existe: ${!!(window.db && window.db.updateReaction)}`);

    let userReactions = {};
    try { userReactions = JSON.parse(localStorage.getItem('user_reactions') || '{}'); } catch (e) { }

    const btn = event.currentTarget;
    const isCurrentlyActive = btn.classList.contains('active');
    const currentReaction = userReactions[listingId];

    // Preparar UI
    const container = btn.closest('.social-toolbar-fullscreen');
    if (!container) return;
    const parentContainer = btn.closest('.social-btn-container');
    const countEl = parentContainer ? parentContainer.querySelector('.social-count') : null;
    if (!countEl) return;

    let currentCount = parseInt(countEl.textContent.replace(/,/g, '') || '0');

    // Helper para actualizar memoria viva (evita que el contador vuelva a 0 al cambiar de auto)
    const updateMemory = (id, rType, inc) => {
        const updateList = (list) => {
            if (!list) return;
            const item = list.find(l => String(l.id) === String(id));
            if (item) {
                if (typeof item.reactions === 'string') {
                    try { item.reactions = JSON.parse(item.reactions); } catch(e) { item.reactions = null; }
                }
                if (!item.reactions || typeof item.reactions !== 'object') {
                    item.reactions = { like: 0, love: 0, fire: 0, angry: 0 };
                }
                item.reactions[rType] = Math.max(0, (item.reactions[rType] || 0) + inc);
            }
        };
        if (typeof window.activeFeedListings !== 'undefined') updateList(window.activeFeedListings);
        if (window.searchCascadeList) updateList(window.searchCascadeList);
        if (window.currentSearchContext && window.currentSearchContext.level1) updateList(window.currentSearchContext.level1);
    };

    // Helper para llamar updateReaction con captura de errores
    const safeUpdateReaction = (lid, rType, inc) => {
        if (window.db && window.db.updateReaction) {
            console.log(`   📡 Llamando db.updateReaction(${lid}, ${rType}, ${inc})...`);
            window.db.updateReaction(lid, rType, inc)
                .then(() => console.log(`   ✅ db.updateReaction completado para ${lid}`))
                .catch(err => console.error(`   ❌ db.updateReaction FALLÓ:`, err));
        } else {
            console.error('   ❌ window.db o updateReaction NO EXISTE - las reacciones NO se guardarán en Supabase');
        }
    };

    if (isCurrentlyActive) {
        // Remove reaction
        playBubbleSound(true); // reverse sound
        btn.classList.remove('active');
        countEl.textContent = Math.max(0, currentCount - 1).toLocaleString('en-US');
        delete userReactions[listingId];
        safeUpdateReaction(listingId, reactionType, -1);
        updateMemory(listingId, reactionType, -1);
    } else {
        // Add new reaction (and remove old if exists)
        playBubbleSound(false); // pop sound
        if (currentReaction && currentReaction !== reactionType) {
            const oldBtn = container.querySelector(`.reaction-btn[data-type="${currentReaction}"]`);
            if (oldBtn) {
                oldBtn.classList.remove('active');
                const oldParent = oldBtn.closest('.social-btn-container');
                const oldCountEl = oldParent ? oldParent.querySelector('.social-count') : null;
                if (oldCountEl) {
                    oldCountEl.textContent = Math.max(0, parseInt(oldCountEl.textContent.replace(/,/g, '') || '0') - 1).toLocaleString('en-US');
                }
            }
            safeUpdateReaction(listingId, currentReaction, -1);
            updateMemory(listingId, currentReaction, -1);
        }

        btn.classList.remove('active');
        void btn.offsetWidth; // Fuerza reflow para reiniciar la animación caricatura pop
        btn.classList.add('active');
        countEl.textContent = (currentCount + 1).toLocaleString('en-US');
        userReactions[listingId] = reactionType;
        safeUpdateReaction(listingId, reactionType, 1);
        updateMemory(listingId, reactionType, 1);
    }

    localStorage.setItem('user_reactions', JSON.stringify(userReactions));
};

// ── Doble clic en foto fullscreen = Like (estilo Instagram) ──
window.handleDoubleTapLike = function (event, listingId) {
    event.preventDefault();
    event.stopPropagation();

    // Buscar la toolbar de reacciones en la misma tarjeta
    const detalleContent = document.getElementById('detalle-content');
    if (!detalleContent) return;

    const toolbar = detalleContent.querySelector('.social-toolbar-fullscreen');
    if (!toolbar) return;

    const likeBtn = toolbar.querySelector('.reaction-btn[data-type="like"]');
    if (!likeBtn) return;

    // Determinar si ya tiene like activo
    const isCurrentlyLiked = likeBtn.classList.contains('active');

    // Mostrar animación de corazón en la foto (siempre, como Instagram)
    showHeartAnimation(event, detalleContent, !isCurrentlyLiked);

    // Simular clic en el botón de like para reutilizar toda la lógica existente
    // (sonido, actualización de memoria viva, Supabase, localStorage, etc.)
    likeBtn.click();
};

// ── Animación de 👍/👎 +1/-1 flotante estilo Mario 1-UP (doble clic) ──
function showHeartAnimation(event, container, isAdding) {
    const heart = document.createElement('div');
    heart.className = 'dbl-tap-heart ' + (isAdding ? 'heart-in' : 'heart-out');

    const iconHtml = `<span class="mario-icon">${isAdding ? '👍' : '👎'}</span>`;
    const badgeHtml = isAdding 
        ? '<span class="mario-badge badge-plus">+1</span>' 
        : '<span class="mario-badge badge-minus">-1</span>';

    heart.innerHTML = iconHtml + badgeHtml;

    // Posicionar sobre donde se hizo doble clic
    const rect = container.getBoundingClientRect();
    const carousel = container.querySelector('.detalle-img-carousel');
    const carouselRect = carousel ? carousel.getBoundingClientRect() : rect;
    
    heart.style.left = (event.clientX - carouselRect.left) + 'px';
    heart.style.top = (event.clientY - carouselRect.top) + 'px';

    // Insertar dentro del contenedor relativo de la imagen
    const imgWrapper = carousel ? carousel.parentElement : container;
    imgWrapper.appendChild(heart);

    // Remover después de la animación
    setTimeout(() => heart.remove(), 1100);
}

window.shareListing = function (event, id, title, price, city) {
    event.stopPropagation();
    const url = window.location.origin + window.location.pathname + '?id=' + id;
    
    const formattedPrice = getListingPriceText({ price: price });

    let shareText = `Te comparto el auto "${title}"`;
    if (formattedPrice) {
        shareText += ` en ${formattedPrice}`;
    }
    if (city && city.trim() !== '') {
        shareText += `. Está en "${city} a la venta".`;
    } else {
        shareText += `. En venta en RevistAuto.`;
    }

    const fullShareString = `${shareText}\n${url}`;

    if (navigator.share) {
        navigator.share({
            title: title,
            text: shareText,
            url: url
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(fullShareString).then(() => {
            window.showAlert('Mensaje y enlace copiado al portapapeles', 'Compartir', 'content_copy');
        }).catch(() => {
            navigator.clipboard.writeText(url).then(() => {
                window.showAlert('Enlace copiado al portapapeles', 'Compartir', 'content_copy');
            });
        });
    }
};

window.formatSocialCount = function (num) {
    const val = Math.max(0, Number(num) || 0);
    if (val >= 1000000) {
        return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (val >= 1000) {
        return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return val.toString();
};

window.generateSocialToolbarHTML = function (id, reactionsObj, viewsCount, title, price, city) {
    let userReactions = {};
    try { userReactions = JSON.parse(localStorage.getItem('user_reactions') || '{}'); } catch (e) { }
    const userReact = userReactions[String(id)];

    let reactions = reactionsObj;
    if (typeof reactions === 'string') {
        try { reactions = JSON.parse(reactions); } catch (e) { reactions = null; }
    }
    reactions = reactions || { like: 0, love: 0, fire: 0, angry: 0 };

    const safeTitle = (title || '').replace(/'/g, "\\'").replace(/"/g, "&quot;");
    const safeCity = (city || '').replace(/'/g, "\\'").replace(/"/g, "&quot;");

    return `
        <div class="social-toolbar-fullscreen">
            <div class="social-btn-container">
                <div class="social-btn reaction-btn ${userReact === 'like' ? 'active' : ''}" data-type="like" onclick="window.toggleSocialReaction(event, '${id}', 'like')">👍</div>
                <div class="social-count">${window.formatSocialCount(reactions.like)}</div>
            </div>
            <div class="social-btn-container">
                <div class="social-btn reaction-btn ${userReact === 'love' ? 'active' : ''}" data-type="love" onclick="window.toggleSocialReaction(event, '${id}', 'love')">😍</div>
                <div class="social-count">${window.formatSocialCount(reactions.love)}</div>
            </div>
            <div class="social-btn-container">
                <div class="social-btn reaction-btn ${userReact === 'fire' ? 'active' : ''}" data-type="fire" onclick="window.toggleSocialReaction(event, '${id}', 'fire')">🔥</div>
                <div class="social-count">${window.formatSocialCount(reactions.fire)}</div>
            </div>
            <div class="social-btn-container">
                <div class="social-btn share-btn" style="color: #007AFF;" onclick="window.shareListing(event, '${id}', '${safeTitle}', ${price || 0}, '${safeCity}')">
                    <span class="material-symbols-rounded" style="font-size: 24px;">share</span>
                </div>
            </div>
        </div>
    `;
};

// --- Deep Linking ---
// Abre directamente la tarjeta fullscreen del auto cuando se comparte un link con ?id=
window.checkDeepLink = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('id');
    if (!sharedId) return;

    // Limpiar el ?id= de la URL inmediatamente para no repetirlo
    const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
    window.history.replaceState({ path: cleanUrl }, '', cleanUrl);

    // Asegurarse de que view-inicio esté activo como fondo (para que al cerrar no quede en blanco)
    const viewInicio = document.getElementById('view-inicio');
    const allViews = document.querySelectorAll('.view');
    allViews.forEach(v => v.classList.remove('active'));
    if (viewInicio) viewInicio.classList.add('active');

    // Activar el nav item de inicio
    const allNavItems = document.querySelectorAll('.nav-item');
    allNavItems.forEach(n => {
        if (n.getAttribute('data-target') === 'view-inicio') {
            n.classList.add('active');
        } else {
            n.classList.remove('active');
        }
    });

    // Esperar a que openListingDetails esté disponible (la app puede aún estar inicializando)
    let attempts = 0;
    const maxAttempts = 40; // hasta 4 segundos de espera
    const tryOpen = () => {
        if (typeof window.openListingDetails === 'function') {
            window.openListingDetails(sharedId);
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryOpen, 100);
        } else {
            console.warn('RevistAuto: openListingDetails no disponible para deep link id=', sharedId);
        }
    };
    tryOpen();
};

window.addEventListener('load', () => {
    setTimeout(() => {
        window.checkDeepLink();
    }, 300);
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        window.checkDeepLink();
    }, 300);
}

// ==========================================
// MÓDULO UP NEXT EN ENCABEZADO (NOVEDADES POR CIUDAD)
// ==========================================
(function initUpNextHeaderManager() {
    let currentUpNextTimer = null;
    let viewedUpNextIds = [];

    async function getActiveListingsForUpNext() {
        // FUENTE 1: Usar los autos ya cargados en el feed activo del usuario
        // (ya están filtrados por su ciudad seleccionada)
        const feedListings = Array.isArray(window.activeFeedListings) ? window.activeFeedListings : [];

        if (feedListings.length > 0) {
            const cities = Array.isArray(window.selectedCitiesForUpNext) && window.selectedCitiesForUpNext.length > 0
                ? window.selectedCitiesForUpNext
                : null;

            const active = feedListings.filter(l => {
                const st = String(l.status || '').toLowerCase();
                const isActive = st === 'autorizado' || st === 'destacado' || st === 'activo' || st === '';
                if (!isActive) return false;
                // Filtro estricto de ciudad: SOLO autos de la zona del usuario, sin fallback global
                if (cities && cities.length > 0) {
                    return l.city && cities.some(c => c.toLowerCase() === (l.city || '').toLowerCase());
                }
                return true;
            });

            if (active.length > 0) return active;
        }

        // FUENTE 2: Si el feed aún no cargó (primeros segundos), intentar con db local
        // También aplicamos filtro estricto de ciudad, sin fallback global
        try {
            if (window.db && typeof window.db.getAllListings === 'function') {
                const cities = Array.isArray(window.selectedCitiesForUpNext) && window.selectedCitiesForUpNext.length > 0
                    ? window.selectedCitiesForUpNext
                    : null;

                const all = window.db.getAllListings();
                const active = all.filter(l => {
                    const st = String(l.status || '').toLowerCase();
                    const isActive = st === 'autorizado' || st === 'destacado' || st === 'activo';
                    if (!isActive) return false;
                    if (cities && cities.length > 0) {
                        return l.city && cities.some(c => c.toLowerCase() === (l.city || '').toLowerCase());
                    }
                    return true;
                });
                return active;
            }
        } catch (e) { /* silencioso */ }

        return [];
    }

    function buildUpNextCandidates(listings) {
        const candidates = [];

        listings.forEach(l => {
            const price = Number(l.price) || 0;
            const oldPrice = Number(l.oldPrice || l.old_price) || 0;
            const views = Number(l.views) || 0;

            // 1. Baja de Precio
            if (oldPrice > price && price > 0) {
                const diff = oldPrice - price;
                const diffStr = diff >= 1000 ? `$${Math.round(diff / 1000)}k` : `$${diff}`;
                candidates.push({
                    type: 'discount',
                    badgeClass: 'badge-discount',
                    text: `📉 ¡Bajó ${diffStr}! ${l.make || ''} ${l.model || l.title || ''}`,
                    listingId: l.id,
                    weight: 10
                });
            }

            // 2. Recién Publicado (nuevos)
            const created = l.created_at ? new Date(l.created_at) : null;
            const isRecent = created && (Date.now() - created.getTime() < 7 * 24 * 3600 * 1000);
            if (isRecent) {
                candidates.push({
                    type: 'new',
                    badgeClass: 'badge-new',
                    text: `✨ ¡Nuevo! ${l.make || ''} ${l.model || l.title || ''}`,
                    listingId: l.id,
                    weight: 8
                });
            }

            // 3. En Tendencia / Popular
            if (views > 3 || l.status === 'destacado') {
                candidates.push({
                    type: 'trending',
                    badgeClass: 'badge-trending',
                    text: `🔥 ¡Popular! ${l.make || ''} ${l.model || l.title || ''}`,
                    listingId: l.id,
                    weight: 5
                });
            }
        });

        return candidates;
    }

    async function showNextHeaderPill() {
        const pill = document.getElementById('header-upnext-pill');
        const advertiseBtn = document.getElementById('btn-advertise');
        if (!pill) return;

        const listings = await getActiveListingsForUpNext();
        if (listings.length === 0) return;

        const candidates = buildUpNextCandidates(listings);
        if (candidates.length === 0) return;

        // Seleccionar una candidatura no vista recientemente
        let selected = candidates.find(c => !viewedUpNextIds.includes(c.listingId));
        if (!selected) {
            viewedUpNextIds = []; // Reiniciar ciclo de memoria vista
            selected = candidates[Math.floor(Math.random() * candidates.length)];
        }

        if (!selected) return;

        viewedUpNextIds.push(selected.listingId);
        if (viewedUpNextIds.length > 15) viewedUpNextIds.shift();

        // Ocultar botón Anúnciate momentáneamente
        if (advertiseBtn) advertiseBtn.style.display = 'none';

        // Renderizar la cápsula pill
        pill.className = `header-upnext-pill ${selected.badgeClass} pill-in`;
        pill.innerHTML = `<span class="upnext-text">${selected.text}</span><span class="upnext-arrow">›</span>`;
        pill.style.display = 'inline-flex';

        // Clic redirige al vehículo
        pill.onclick = (e) => {
            e.stopPropagation();
            if (typeof window.openListingDetails === 'function') {
                window.openListingDetails(selected.listingId);
            }
        };

        // Después de 6 segundos en pantalla, guardar la cápsula
        setTimeout(() => {
            pill.className = `header-upnext-pill ${selected.badgeClass} pill-out`;
            setTimeout(() => {
                pill.style.display = 'none';
                if (advertiseBtn) advertiseBtn.style.display = 'inline-flex';
            }, 400);
        }, 6000);
    }

    function scheduleNextPill() {
        // Frecuencia variable orgánica entre 22 y 40 segundos (22000ms a 40000ms)
        const randomDelay = Math.floor(Math.random() * (40000 - 22000 + 1)) + 22000;
        currentUpNextTimer = setTimeout(async () => {
            await showNextHeaderPill();
            scheduleNextPill();
        }, randomDelay);
    }

    function startUpNextLoop() {
        // Primera ejecución exactamente a los 3 segundos de cargar
        setTimeout(async () => {
            await showNextHeaderPill();
            scheduleNextPill();
        }, 3000);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(startUpNextLoop, 1500);
    } else {
        window.addEventListener('DOMContentLoaded', () => setTimeout(startUpNextLoop, 1500));
    }
})();

// ====================================================
// MÓDULO DE PÁGINAS LEGALES (TÉRMINOS, PRIVACIDAD Y CONTACTO)
// ====================================================
window.LEGAL_CONTENT = {
    terms: `
        <div class="legal-section-block">
            <h4 style="margin-top:0;">1. Naturaleza del Servicio</h4>
            <p><strong>RevistAuto</strong> es una plataforma digital de catálogo y clasificados automotrices que conecta a vendedores (lotes de autos, agencias y particulares) con compradores potenciales. RevistAuto <strong>no es propietaria</strong> de los vehículos anunciados por terceros, no intermedia en la transacción financiera ni cobra comisiones sobre la compraventa de unidades.</p>

            <h4>2. Veracidad y Responsabilidad de las Publicaciones</h4>
            <p>Cada anunciante es el único responsable de la veracidad, exactitud y legalidad de los datos proporcionados (precio, año, millaje/kilometraje, estado legal del vehículo, fotografías y datos de contacto). Queda estrictamente prohibido publicar vehículos con reporte de robo activo, documentación apócrifa o imágenes engañosas. RevistAuto se reserva el derecho de pausar o retirar cualquier publicación que viole estas políticas.</p>

            <h4>3. Acuerdos de Compraventa e Inspección</h4>
            <p>Cualquier trato, negociación, revisión mecánica, inspección jurídica o pago de un vehículo se realiza exclusivamente de forma directa entre el comprador y el vendedor. Se recomienda a los usuarios realizar inspecciones mecánicas en lugares seguros y verificar la documentación original ante las autoridades correspondientes antes de efectuar cualquier pago o transferencia.</p>

            <h4>4. Geolocalización y Filtros por Ciudad</h4>
            <p>Al hacer uso de la geolocalización (GPS) o seleccionar manualmente una ubicación, el usuario consiente que la aplicación priorice y filtre los vehículos disponibles en su ciudad o región geográfica.</p>
        </div>
    `,
    privacy: `
        <div class="legal-section-block">
            <h4 style="margin-top:0;">1. Información Recabada</h4>
            <p>RevistAuto únicamente recaba información de geolocalización aproximada (Estado/Ciudad) para optimizar la búsqueda de vehículos cercanos, así como los datos de contacto que el usuario o vendedor proporcione de forma voluntaria al registrarse o publicar una unidad (nombre, teléfono, ciudad y WhatsApp).</p>

            <h4>2. Uso y Finalidad de los Datos</h4>
            <p>La información recopilada se utiliza exclusivamente con el fin de facilitar el contacto directo entre compradores y vendedores mediante enlaces a WhatsApp o llamadas telefónicas, así como para la analítica interna de tráfico y rendimiento de la revista digital.</p>

            <h4>3. Protección y No Transferencia a Terceros</h4>
            <p>RevistAuto <strong>no vende, alquila ni comparte</strong> datos personales o números de contacto con empresas terceras de telemercadeo o publicidad no solicitada (SPAM). Sus datos están protegidos conforme a las mejores prácticas de seguridad digital.</p>

            <div style="margin-top: 16px; text-align: center;">
                <a href="privacidad.html" target="_blank" class="primary-btn" style="display: inline-block; padding: 8px 16px; font-size: 0.85rem; border-radius: 8px; text-decoration: none; color: white;">Ver documento de privacidad completo ↗</a>
            </div>
        </div>
    `,
    contact: `
        <div class="legal-section-block">
            <h4 style="margin-top:0;">Contacto & Soporte Técnico</h4>
            <p>Si tienes preguntas sobre nuestros Términos y Condiciones, necesitas asistencia con tu publicación o requieres apoyo sobre la plataforma, contáctanos a través de nuestros canales oficiales:</p>
            
            <div style="background: var(--surface-light); padding: 16px; border-radius: 12px; margin-top: 16px; border: 1px solid var(--border-color);">
                <p style="margin-bottom: 8px;"><strong>💬 Atención y Soporte vía WhatsApp / Teléfono:</strong></p>
                <p style="margin-bottom: 12px; font-size: 1.1rem; font-weight: 700; color: var(--primary-color);">
                    <a href="https://wa.me/526861329430?text=Hola,%20necesito%20soporte%20en%20RevistAuto" target="_blank" style="color: #10B981; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                        <span class="material-symbols-rounded" style="vertical-align: middle;">chat</span> (686) 132-9430
                    </a>
                </p>
                <p style="margin-bottom: 8px; color: var(--text-muted); font-size: 0.88rem;">Horario: Lunes a Sábado de 9:00 AM a 7:00 PM</p>
                <p style="margin: 0; font-size: 0.9rem;"><strong>📧 Correo de Soporte:</strong> soporte@revistauto.com</p>
            </div>
        </div>
    `
};

window.openLegalModal = function(tab = 'terms') {
    const modal = document.getElementById('legal-pages-modal');
    if (modal) {
        modal.classList.add('active');
        window.switchLegalTab(tab);
    }
};

window.closeLegalModal = function() {
    const modal = document.getElementById('legal-pages-modal');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.switchLegalTab = function(tab) {
    const body = document.getElementById('legal-modal-body');
    const termsBtn = document.getElementById('legal-tab-terms');
    const privacyBtn = document.getElementById('legal-tab-privacy');
    const contactBtn = document.getElementById('legal-tab-contact');

    if (termsBtn) termsBtn.classList.toggle('active', tab === 'terms');
    if (privacyBtn) privacyBtn.classList.toggle('active', tab === 'privacy');
    if (contactBtn) contactBtn.classList.toggle('active', tab === 'contact');

    if (body && window.LEGAL_CONTENT && window.LEGAL_CONTENT[tab]) {
        body.innerHTML = window.LEGAL_CONTENT[tab];
        body.scrollTop = 0;
    }
};


// ==========================================
// SMART CTA: UI ELEMENTS
// ==========================================
function createSellCarCardHTML(mainHTML, messageHTML) {
    return `
        <div class="card ad-card" data-action="open-new-listing" style="cursor: pointer; border: 2px solid var(--primary-color); border-radius: 16px; display: flex; flex-direction: column; position: relative; overflow: hidden; z-index: 10; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);">
            <div class="card-img-wrapper" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.16) 0%, rgba(59, 130, 246, 0.04) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; border-top: none;">
                <span class="material-symbols-rounded" style="font-size: 50px; color: var(--primary-color); filter: drop-shadow(0 2px 8px rgba(59, 130, 246, 0.5)); margin-bottom: 6px;">add_circle</span>
                <strong style="color: var(--primary-color); font-size: 1.1rem; text-align: center; line-height: 1.2; font-weight: 700; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${mainHTML}</strong>
            </div>
            <div class="card-content" style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; padding: 12px; background: rgba(59, 130, 246, 0.05);">
                <div style="width: 100%; background: var(--primary-color); color: white; border-radius: 8px; padding: 6px 4px; text-align: center; font-weight: 700; font-size: 0.75rem; line-height: 1.2; display: flex; align-items: center; justify-content: center; gap: 4px;">
                    ${messageHTML}
                </div>
            </div>
        </div>
    `;
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
    // 1. Regla de Perfil: Si el usuario ya tiene al menos 1 vehículo activo -> Ocultar
    const myActiveListings = typeof db !== 'undefined' && db.getMyListings ? db.getMyListings().filter(l => l.status === 'autorizado' || l.status === 'pendiente') : [];
    if (myActiveListings.length > 0) {
        return { show: false };
    }

    // 2. Regla de Fatiga Visual: > 40 segundos navegando -> Ocultar
    if (window.sessionStartTime) {
        const elapsedSecs = (Date.now() - window.sessionStartTime) / 1000;
        if (elapsedSecs > 40) {
            return { show: false };
        }
    }

    const count = itemsList ? itemsList.length : 0;
    
    let mainHTML = '';
    let messageHTML = '';
    let show = false;

    // Bolsas de frases aleatorias
    const emptyPhrases = [
        { main: "Anuncia tu auto hoy", msg: "🔥 ¡Sé el primero en publicar!" },
        { main: "Sube tu vehículo", msg: "✨ Sé el pionero" },
        { main: "Publica Gratis", msg: "🔥 Mercado solo para ti" }
    ];
    const lowInvPhrases = [
        { main: "Vende tu auto aquí", msg: "🚀 Alta demanda de compradores" },
        { main: "Únete a la venta", msg: "🚀 Faltan autos aquí" },
        { main: "Publica tu auto", msg: "🚀 Se venden rápido" }
    ];
    const stagnantPhrases = [
        { main: "Anuncia tu auto aquí", msg: "👀 Miles de compradores buscando" },
        { main: "Pon tu auto aquí", msg: "🌟 Atrae más miradas" },
        { main: "Publica tu auto ahora", msg: "👀 Conecta con compradores listos" }
    ];
    const weekendPhrases = [
        { main: "Tiempo de vender", msg: "📸 Aprovecha el fin de semana" },
        { main: "Muestra tu auto", msg: "📸 Tu auto en vitrina" },
        { main: "Súbelo ahora", msg: "📸 Hay más tráfico hoy" }
    ];

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    let picked = null;

    if (count === 0) {
        picked = pickRandom(emptyPhrases);
        show = true;
    } else if (count < 10) {
        picked = pickRandom(lowInvPhrases);
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
            picked = pickRandom(stagnantPhrases);
            show = true;
        } else {
            const day = new Date().getDay();
            if (day === 5 || day === 6 || day === 0) { // 5=Fri, 6=Sat, 0=Sun
                if (Math.random() < 0.5) {
                    picked = pickRandom(weekendPhrases);
                    show = true;
                }
            } else {
                console.log("Hiding because >= 10 items, <2 days old, and NOT weekend.");
            }
        }
    }

    if (picked) {
        mainHTML = picked.main;
        messageHTML = picked.msg;
    }

    return { show, mainHTML, messageHTML };
}

/* ==========================================================================
   HOOK: Redirección Directa e Invisible al Navegador Oficial (Android/FB)
   Sin modales, sin avisos, sin botones.
   ========================================================================== */
function useDirectBrowserRedirect() {
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    const isFacebookApp = /FBAN|FBAV|FB_IAB|FB4A|FBSS|Instagram/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    if (!isFacebookApp) return;

    // Redirección directa e instantánea al navegador por defecto del sistema
    if (isAndroid && !sessionStorage.getItem('fb_direct_redirected')) {
        sessionStorage.setItem('fb_direct_redirected', 'true');
        try {
            const currentUrl = window.location.href;
            const cleanUrl = currentUrl.replace(/^https?:\/\//i, '');
            const intentUrl = "intent://" + cleanUrl + "#Intent;scheme=https;action=android.intent.action.VIEW;end;";
            window.location.href = intentUrl;
        } catch (e) {
            // Silencioso: si falla, continúa la carga normal sin molestar al usuario
        }
    }
}

/* ==========================================================================
   HOOK: Validaciones y lógica de Búsqueda Avanzada
   ========================================================================== */
function useAdvancedSearchValidationHook(queryText, yearVal, colorVal, transmissionVal, legalVal) {
    const hasQuery = Boolean(queryText && queryText.length > 0);
    const hasYear = Boolean(yearVal && String(yearVal).trim().length > 0 && Number(yearVal) > 0);
    const hasColor = Boolean(colorVal && colorVal !== 'Todos');
    const hasTransmission = Boolean(transmissionVal && transmissionVal !== 'Cualquiera' && transmissionVal !== 'Todas');
    const hasLegal = Boolean(legalVal && legalVal !== 'Cualquiera' && legalVal !== 'Todas');

    const isValid = hasQuery || hasYear || hasColor || hasTransmission || hasLegal;

    return {
        isValid,
        hasQuery,
        hasYear,
        hasColor,
        hasTransmission,
        hasLegal
    };
}

/* ==========================================================================
   HOOK: Autocompletado de Marcas y Modelos (Catálogo + Publicaciones Reales)
   ========================================================================== */
function useSearchAutocompleteHook(inputEl, dropdownEl) {
    if (!inputEl || !dropdownEl) return;

    let activeIndex = -1;

    function getSuggestions(queryText) {
        const q = queryText.toLowerCase().trim();
        if (!q || q.length < 1) return [];

        const normQ = q.replace(/[-_\s]+/g, '');
        const suggestionsSet = new Set();
        const results = [];

        const norm = (str) => String(str || '').toLowerCase().replace(/[-_\s]+/g, '');

        // 1. Obtener Marcas y Modelos del Catálogo Oficial
        const makes = (typeof catalogData !== 'undefined' && catalogData.makes) ? catalogData.makes : (typeof defaultCatalogData !== 'undefined' ? defaultCatalogData.makes : []);
        const modelsMap = (typeof catalogData !== 'undefined' && catalogData.modelsByMake) ? catalogData.modelsByMake : (typeof defaultCatalogData !== 'undefined' ? defaultCatalogData.modelsByMake : {});

        // Buscar en Marcas del Catálogo
        makes.forEach(make => {
            if (make.toLowerCase().includes(q) || (normQ.length > 0 && norm(make).includes(normQ))) {
                const key = `make_${make.toLowerCase()}`;
                if (!suggestionsSet.has(key)) {
                    suggestionsSet.add(key);
                    results.push({ type: 'marca', label: make, textToFill: make, icon: 'directions_car' });
                }
            }
        });

        // Buscar en Modelos del Catálogo
        Object.keys(modelsMap).forEach(make => {
            const models = modelsMap[make] || [];
            models.forEach(model => {
                const fullText = `${make} ${model}`;
                if (model.toLowerCase().includes(q) || fullText.toLowerCase().includes(q) || (normQ.length > 0 && (norm(model).includes(normQ) || norm(fullText).includes(normQ)))) {
                    const key = `model_${fullText.toLowerCase()}`;
                    if (!suggestionsSet.has(key)) {
                        suggestionsSet.add(key);
                        results.push({ type: 'modelo', label: fullText, textToFill: fullText, icon: 'minor_crash' });
                    }
                }
            });
        });

        // 2. Buscar en Publicaciones Reales de la Base de Datos (Agregados por Clientes)
        try {
            const allListings = (typeof db !== 'undefined' && db.getAllListings) ? db.getAllListings() : [];
            allListings.forEach(item => {
                if (item.make && (item.make.toLowerCase().includes(q) || (normQ.length > 0 && norm(item.make).includes(normQ)))) {
                    const key = `make_${item.make.toLowerCase()}`;
                    if (!suggestionsSet.has(key)) {
                        suggestionsSet.add(key);
                        results.push({ type: 'marca', label: item.make, textToFill: item.make, icon: 'directions_car' });
                    }
                }
                if (item.model && (item.model.toLowerCase().includes(q) || (normQ.length > 0 && norm(item.model).includes(normQ)))) {
                    const makeStr = item.make ? `${item.make} ` : '';
                    const fullText = `${makeStr}${item.model}`.trim();
                    const key = `model_${fullText.toLowerCase()}`;
                    if (!suggestionsSet.has(key)) {
                        suggestionsSet.add(key);
                        results.push({ type: 'modelo', label: fullText, textToFill: fullText, icon: 'minor_crash' });
                    }
                }
            });
        } catch (e) {
            console.warn('Error reading dynamic listings for autocomplete:', e);
        }

        // Ordenar por relevancia (si empieza con el texto ingresado va primero)
        results.sort((a, b) => {
            const aStartsWith = (a.label.toLowerCase().startsWith(q) || (normQ.length > 0 && norm(a.label).startsWith(normQ))) ? -1 : 1;
            const bStartsWith = (b.label.toLowerCase().startsWith(q) || (normQ.length > 0 && norm(b.label).startsWith(normQ))) ? -1 : 1;
            return aStartsWith - bStartsWith;
        });

        return results.slice(0, 8);
    }

    function renderDropdown(items) {
        if (!items || items.length === 0) {
            dropdownEl.style.display = 'none';
            dropdownEl.innerHTML = '';
            activeIndex = -1;
            return;
        }

        dropdownEl.innerHTML = items.map((item, index) => `
            <div class="suggestion-item ${index === activeIndex ? 'active' : ''}" data-index="${index}" data-text="${item.textToFill}">
                <div class="suggestion-main">
                    <span class="material-symbols-rounded" style="font-size:20px; color:#38bdf8;">${item.icon}</span>
                    <span>${item.label}</span>
                </div>
                <span class="suggestion-type-tag ${item.type}">${item.type}</span>
            </div>
        `).join('');

        dropdownEl.style.display = 'block';

        // Eventos al hacer clic en cada ítem
        const suggestionItems = dropdownEl.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(el => {
            el.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Previene perder el foco del input antes del clic
                const text = el.getAttribute('data-text');
                inputEl.value = text;
                dropdownEl.style.display = 'none';
                dropdownEl.innerHTML = '';
                activeIndex = -1;
                inputEl.blur(); // Oculta el teclado virtual en celulares
            });
        });
    }

    // Escuchar entrada de teclado en el input
    inputEl.addEventListener('input', () => {
        const text = inputEl.value;
        const suggestions = getSuggestions(text);
        renderDropdown(suggestions);
    });

    inputEl.addEventListener('focus', () => {
        const text = inputEl.value;
        if (text && text.trim().length > 0) {
            const suggestions = getSuggestions(text);
            renderDropdown(suggestions);
        }
    });

    // Ocultar si hace clic fuera
    document.addEventListener('click', (e) => {
        if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
            dropdownEl.style.display = 'none';
            activeIndex = -1;
        }
    });

    // Navegación por teclado (Flecha abajo, Flecha arriba, Escape)
    inputEl.addEventListener('keydown', (e) => {
        const items = dropdownEl.querySelectorAll('.suggestion-item');
        if (!items || items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
            updateActiveItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
            updateActiveItem(items);
        } else if (e.key === 'Escape') {
            dropdownEl.style.display = 'none';
            activeIndex = -1;
        } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < items.length) {
            e.preventDefault();
            e.stopPropagation();
            const selectedText = items[activeIndex].getAttribute('data-text');
            inputEl.value = selectedText;
            dropdownEl.style.display = 'none';
            activeIndex = -1;
            inputEl.blur(); // Oculta el teclado virtual en celulares
        }
    });

    function updateActiveItem(items) {
        items.forEach((item, idx) => {
            if (idx === activeIndex) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });
    }
}

/* ==========================================================================
   HOOK: Borrado Rápido de Búsqueda ("X" Button)
   ========================================================================== */
function useClearSearchInputHook(inputEl, btnClearEl, dropdownEl) {
    if (!inputEl || !btnClearEl) return;

    function toggleClearBtn() {
        if (inputEl.value && inputEl.value.trim().length > 0) {
            btnClearEl.classList.add('active');
            btnClearEl.style.display = 'flex';
        } else {
            btnClearEl.classList.remove('active');
            btnClearEl.style.display = 'none';
        }
    }

    inputEl.addEventListener('input', toggleClearBtn);
    inputEl.addEventListener('focus', toggleClearBtn);

    btnClearEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        inputEl.value = '';
        btnClearEl.classList.remove('active');
        btnClearEl.style.display = 'none';
        if (dropdownEl) {
            dropdownEl.style.display = 'none';
            dropdownEl.innerHTML = '';
        }
        inputEl.focus();
    });
}

/* ==========================================================================
   HOOK: Ocultar Teclado al ingresar Año de 4 dígitos
   ========================================================================== */
function useAutoBlurYearHook(yearInputEl) {
    if (!yearInputEl) return;

    yearInputEl.addEventListener('input', () => {
        const val = String(yearInputEl.value).trim();
        if (val.length === 4) {
            yearInputEl.blur();
        }
    });
}

/* ==========================================================================
   HOOK: Formateador de Kilometraje / Millaje (Cero -> "S/N")
   ========================================================================== */
function useMileageFormatterHook(mileage) {
    if (mileage === null || mileage === undefined) return 'S/N';
    const str = String(mileage).trim();
    if (!str || str === '-' || str === '0' || /^0+(\s*(km|mi|millas|kilometros))?$/i.test(str)) {
        return 'S/N';
    }
    return str;
}
window.useMileageFormatterHook = useMileageFormatterHook;









function useSmartComparatorHook() {
    const btnContainer = document.getElementById('compare-button-container');
    const btnCompare = document.getElementById('btn-comparar-favoritos');
    const savedContainer = document.getElementById('saved-listings-container');
    if (!btnCompare || !savedContainer) return;

    let longPressTimer;
    let rotationInterval;
    let isLongPress = false;
    let lastTouchTime = 0;

    // Helper to get card ID
    function getCardId(card) {
        if (!card) return null;
        if (card.dataset && card.dataset.id) return card.dataset.id;
        const btnSave = card.querySelector('.card-save-btn');
        const idMatch = btnSave ? btnSave.getAttribute('onclick')?.match(/toggleSave\((\d+)/) : null;
        return idMatch ? idMatch[1] : null;
    }

    // Interceptar clics en la fase de captura para que NO abran el detalle cuando estamos comparando
    savedContainer.addEventListener('click', (e) => {
        if (!window.isComparisonMode) return;
        
        const card = e.target.closest('.card');
        if (!card) return;

        // Evitar que el onclick del HTML original se ejecute
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const id = getCardId(card);
        if (id) {
            toggleCardSelection(id);
        }
    }, true);

    function updateCompareButtonVisibility() {
        const savedListingsIds = JSON.parse(localStorage.getItem('revista_autos_saved') || '[]');
        const count = savedListingsIds.length;
        if (count >= 2) {
            btnContainer.style.display = 'block';
            startTextRotation(count);
        } else {
            btnContainer.style.display = 'none';
            stopTextRotation();
            window.isComparisonMode = false;
            window.selectedForComparison = [];
        }
    }
    window.updateCompareButtonVisibility = updateCompareButtonVisibility;

    function startTextRotation(count) {
        stopTextRotation();
        if (count >= 2 && !window.isComparisonMode) {
            rotationInterval = setInterval(() => {
                btnCompare.classList.toggle('show-magic');
            }, 3500);
        } else {
            btnCompare.classList.remove('show-magic');
        }
    }

    function stopTextRotation() {
        if (rotationInterval) clearInterval(rotationInterval);
    }

    function updateButtonState() {
        const savedListingsIds = JSON.parse(localStorage.getItem('revista_autos_saved') || '[]');
        const textNormal = btnCompare.querySelector('.comparar-text-normal');
        
        if (!window.isComparisonMode) {
            textNormal.innerHTML = 'Comparativa de autos';
            btnCompare.classList.remove('active-mode');
            btnCompare.style.background = '';
            btnCompare.style.color = '';
            startTextRotation(savedListingsIds.length);
        } else {
            stopTextRotation();
            btnCompare.classList.remove('show-magic');
            btnCompare.classList.add('active-mode');
            
            if (window.selectedForComparison.length === 0) {
                textNormal.innerHTML = 'Toca el primer auto (0/2)';
            } else if (window.selectedForComparison.length === 1) {
                textNormal.innerHTML = 'Elige el 2do auto (1/2)';
            }
        }
        
        const cards = savedContainer.querySelectorAll('.card');
        cards.forEach(card => {
            const id = getCardId(card);
            if (window.isComparisonMode) {
                card.classList.add('card-selectable');
                if (id && window.selectedForComparison.includes(String(id))) {
                    card.classList.add('card-selected');
                } else {
                    card.classList.remove('card-selected');
                }
            } else {
                card.classList.remove('card-selectable', 'card-selected');
            }
        });
    }

    window.disableComparisonMode = function() {
        window.isComparisonMode = false;
        window.selectedForComparison = [];
        updateButtonState();
    }

    function toggleCardSelection(id) {
        if (!id) return;
        id = String(id);
        const index = window.selectedForComparison.indexOf(id);
        if (index > -1) {
            window.selectedForComparison.splice(index, 1);
        } else {
            window.selectedForComparison.push(id);
        }
        
        if (navigator.vibrate) navigator.vibrate(50);
        updateButtonState();
        
        if (window.selectedForComparison.length === 2) {
            setTimeout(() => {
                openComparisonModal(window.selectedForComparison);
                window.disableComparisonMode();
            }, 150);
        }
    }

    let pressStartTime = 0;

    function handlePressStart(e) {
        if (e.type.startsWith('touch')) {
            lastTouchTime = Date.now();
        } else if (Date.now() - lastTouchTime < 600) {
            return;
        }

        isLongPress = false;
        pressStartTime = Date.now();
        const savedListingsIds = JSON.parse(localStorage.getItem('revista_autos_saved') || '[]');
        if (window.isComparisonMode) return;
        
        btnCompare.style.transform = 'scale(0.97)';
        const progressBg = btnCompare.querySelector('.progress-bg');
        if (progressBg) {
            progressBg.style.transition = 'width 0.8s linear';
            progressBg.style.width = '100%';
        }
        
        if (savedListingsIds.length >= 2) {
            longPressTimer = setTimeout(() => {
                isLongPress = true;
                if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                openComparisonModal(savedListingsIds, true);
                if (progressBg) {
                    progressBg.style.transition = 'none';
                    progressBg.style.width = '0%';
                }
            }, 800);
        }
    }

    function handlePressEnd(e) {
        if (!e.type.startsWith('touch') && Date.now() - lastTouchTime < 600) {
            return;
        }

        const pressDuration = Date.now() - pressStartTime;
        btnCompare.style.transform = 'scale(1)';
        const progressBg = btnCompare.querySelector('.progress-bg');
        if (progressBg) {
            progressBg.style.transition = 'none';
            progressBg.style.width = '0%';
        }
        clearTimeout(longPressTimer);
        
        // Solo cambiar a modo manual 'Toca el primer auto' en un CLIC RÁPIDO (< 400ms) y NO en toque prolongado
        if (!isLongPress && pressDuration < 400 && e.type.indexOf('leave') === -1 && e.type.indexOf('cancel') === -1) {
            if (!window.isComparisonMode) {
                window.isComparisonMode = true;
                window.selectedForComparison = [];
                updateButtonState();
            } else {
                window.disableComparisonMode();
            }
        }
    }

    btnCompare.addEventListener('mousedown', handlePressStart);
    btnCompare.addEventListener('touchstart', handlePressStart, {passive: true});
    btnCompare.addEventListener('mouseup', handlePressEnd);
    btnCompare.addEventListener('touchend', handlePressEnd);
    btnCompare.addEventListener('mouseleave', handlePressEnd);
    btnCompare.addEventListener('touchcancel', handlePressEnd);
    
    document.getElementById('btn-cerrar-comparador')?.addEventListener('click', () => {
        document.getElementById('modal-comparador').classList.remove('active');
    });
}

function openComparisonModal(ids, isMagicVerdict = false) {
    if (!ids || ids.length < 2) return;
    
    const allListings = new Map();
    if (window.db && window.db.getAllListings) {
        window.db.getAllListings().forEach(l => allListings.set(String(l.id), l));
    }
    if (window.activeFeedListings) {
        window.activeFeedListings.forEach(l => allListings.set(String(l.id), l));
    }
    
    const cars = [];
    ids.forEach(id => {
        if (allListings.has(String(id))) cars.push(allListings.get(String(id)));
    });
    
    if (cars.length < 2) return;

    const getPhotoObj = (c) => {
        let original = 'https://placehold.co/400x300/1e293b/38bdf8?text=Sin+Foto';
        if (c.images && c.images.length > 0) original = c.images[0];
        else if (c.image) original = c.image;
        else if (c.photos && c.photos.length > 0) original = c.photos[0].thumbnailUrl || c.photos[0].url || c.photos[0];

        let thumb = original;
        if (typeof window.useImageOptimizerHook === 'function') {
            const opt = window.useImageOptimizerHook();
            if (opt && opt.getThumbnailUrl) {
                const url = opt.getThumbnailUrl(c);
                if (url) thumb = url;
            }
        }
        return { thumb, original };
    };

    const verdictHTML = generateSmartVerdict(cars, isMagicVerdict);
    let gridHTML = '';
    
    if (!isMagicVerdict) {
        const c1 = cars[0];
        const c2 = cars[1];
        const p1 = getPhotoObj(c1);
        const p2 = getPhotoObj(c2);
        
        const rate = parseFloat(localStorage.getItem('revista_exchange_rate')) || 17;
        const getPriceInMXN = (c) => {
            const raw = parsePrice(c.price);
            const curr = (c.currency || '').toLowerCase();
            if (curr.includes('dll') || curr.includes('usd') || curr.includes('dls')) return raw * rate;
            return raw;
        };

        const getScore = (car) => {
            if (typeof window.useSmartVehicleScorerHook === 'function') {
                return window.useSmartVehicleScorerHook(car);
            }
            return useSmartVehicleScorerHook(car);
        };

        const isC1Winner = getScore(c1) >= getScore(c2);

        const badgeHTML = `
            <div style="position: absolute; top: 8px; right: 8px; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4), 0 0 0 1.5px rgba(255, 255, 255, 0.4); z-index: 5;">
                <span class="material-symbols-rounded" style="font-size: 16px;">check_circle</span> Recomendado
            </div>
        `;

        const cat1 = getVehicleCategory(c1);
        const cat2 = getVehicleCategory(c2);
        const engineLabel1 = cat1 === 'tractocamión' ? '🚛 MOTOR / DIESEL' : (cat1 === 'embarcación' ? '⚓ MOTOR' : '⛽ MOTOR / GASOLINA');
        const engineLabel2 = cat2 === 'tractocamión' ? '🚛 MOTOR / DIESEL' : (cat2 === 'embarcación' ? '⚓ MOTOR' : '⛽ MOTOR / GASOLINA');

        const m1Val = parseMileage(c1.mileage);
        const m2Val = parseMileage(c2.mileage);
        const m1Display = typeof window.useMileageFormatterHook === 'function' ? window.useMileageFormatterHook(c1.mileage) : (c1.mileage || 'S/N');
        const m2Display = typeof window.useMileageFormatterHook === 'function' ? window.useMileageFormatterHook(c2.mileage) : (c2.mileage || 'S/N');

        const isM1Better = m1Val !== 999999 && (m2Val === 999999 || m1Val < m2Val);
        const isM2Better = m2Val !== 999999 && (m1Val === 999999 || m2Val < m1Val);

        gridHTML = `
        <div class="comparador-grid">
            <div class="comparador-col" style="${isC1Winner ? 'border: 2px solid #10b981; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25); background: rgba(16, 185, 129, 0.04);' : ''}">
                <div style="position: relative; overflow: hidden; border-radius: 12px; margin-bottom: 12px;">
                    <img src="${p1.thumb}" alt="Foto" style="width:100%; height:180px; object-fit:cover; display:block;" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='${p1.original}';}else{this.src='https://placehold.co/400x300/1e293b/38bdf8?text=Sin+Foto';}">
                    ${isC1Winner ? badgeHTML : ''}
                </div>
                <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 4px; color: var(--text-main);">${c1.make} ${c1.model} ${c1.year}</div>
                <div class="comparador-precio">${window.usePriceFormatterHook ? window.usePriceFormatterHook(c1) : c1.price}</div>
                <div class="comparador-precio-original">📍 ${c1.city || ''} • ${getLegalText(c1) || (st1 === 'AMERICANO' ? 'Americano' : (st1 === 'FRONTERIZO' ? 'Fronterizo' : 'Nacional'))}</div>
                
                <div class="comparador-fila">
                    <div class="comparador-label">Año</div>
                    <div class="comparador-value ${c1.year > c2.year ? 'highlight' : ''}">${c1.year} ${c1.year > c2.year ? '⭐' : ''}</div>
                </div>
                <div class="comparador-fila">
                    <div class="comparador-label">Millas / KM</div>
                    <div class="comparador-value ${isM1Better ? 'highlight' : ''}">${m1Display} ${isM1Better ? '⭐' : ''}</div>
                </div>
                <div class="comparador-fila">
                    <div class="comparador-label">${engineLabel1}</div>
                    <div class="comparador-value">${getEngineSummary(c1)}</div>
                </div>
                <div class="comparador-fila">
                    <div class="comparador-label">🛠️ Talleres y Piezas</div>
                    <div class="comparador-value">${getMechanicSummary(c1)}</div>
                </div>
                <div class="comparador-fila">
                    <div class="comparador-label">⚙️ Transmisión</div>
                    <div class="comparador-value">${getTransmissionSummary(c1)}</div>
                </div>
                <div class="comparador-fila">
                    <div class="comparador-label">A/C</div>
                    <div class="comparador-value">${(c1.ac === 'Si' || c1.ac === 'Sí' || c1.ac === true) ? '❄️ Sí' : '❌ No'}</div>
                </div>
                
                <button class="success-btn" style="width: 100%; margin-top: 16px; padding: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.95rem; font-weight: bold; border-radius: 20px;" onclick="document.getElementById('modal-comparador').classList.remove('active'); window.contactSeller('${c1.id}')">
                    <span class="material-symbols-rounded" style="font-size: 20px;">chat</span> Contactar
                </button>
            </div>
            
            <div class="comparador-col" style="${!isC1Winner ? 'border: 2px solid #10b981; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25); background: rgba(16, 185, 129, 0.04);' : ''}">
                <div style="position: relative; overflow: hidden; border-radius: 12px; margin-bottom: 12px;">
                    <img src="${p2.thumb}" alt="Foto" style="width:100%; height:180px; object-fit:cover; display:block;" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='${p2.original}';}else{this.src='https://placehold.co/400x300/1e293b/38bdf8?text=Sin+Foto';}">
                    ${!isC1Winner ? badgeHTML : ''}
                </div>
                <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 4px; color: var(--text-main);">${c2.make} ${c2.model} ${c2.year}</div>
                <div class="comparador-precio">${window.usePriceFormatterHook ? window.usePriceFormatterHook(c2) : c2.price}</div>
                <div class="comparador-precio-original">📍 ${c2.city || ''} • ${getLegalText(c2) || (st2 === 'AMERICANO' ? 'Americano' : (st2 === 'FRONTERIZO' ? 'Fronterizo' : 'Nacional'))}</div>
                
                <div class="comparador-fila">
                    <div class="comparador-label">Año</div>
                    <div class="comparador-value ${c2.year > c1.year ? 'highlight' : ''}">${c2.year} ${c2.year > c1.year ? '⭐' : ''}</div>
                </div>
                <div class="comparador-fila">
                    <div class="comparador-label">Millas / KM</div>
                    <div class="comparador-value ${isM2Better ? 'highlight' : ''}">${m2Display} ${isM2Better ? '⭐' : ''}</div>
                </div>
                <div class="comparador-fila">
                    <div class="comparador-label">${engineLabel2}</div>
                    <div class="comparador-value">${getEngineSummary(c2)}</div>
                </div>
                <div class="comparador-fila">
                    <div class="comparador-label">🛠️ Talleres y Piezas</div>
                    <div class="comparador-value">${getMechanicSummary(c2)}</div>
                </div>
                <div class="comparador-fila">
                    <div class="comparador-label">⚙️ Transmisión</div>
                    <div class="comparador-value">${getTransmissionSummary(c2)}</div>
                </div>
                <div class="comparador-fila">
                    <div class="comparador-label">A/C</div>
                    <div class="comparador-value">${(c2.ac === 'Si' || c2.ac === 'Sí' || c2.ac === true) ? '❄️ Sí' : '❌ No'}</div>
                </div>
                
                <button class="success-btn" style="width: 100%; margin-top: 16px; padding: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.95rem; font-weight: bold; border-radius: 20px;" onclick="document.getElementById('modal-comparador').classList.remove('active'); window.contactSeller('${c2.id}')">
                    <span class="material-symbols-rounded" style="font-size: 20px;">chat</span> Contactar
                </button>
            </div>
        </div>
        `;
    }

    const advisorTitle = isMagicVerdict ? 'EL VEREDICTO DE TU ASESOR REVISTAUTO' : 'CONSEJO DEL ASESOR AMIGO';
    const initialMsg = isMagicVerdict ? '🧠 Tu Asesor RevistaAuto está analizando todos tus vehículos elegidos' : '🧠 El Asesor Amigo está revisando ambos vehículos a fondo';

    const thinkingHTML = `
    <style>
    @keyframes advisorSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes typingPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
    @keyframes fadeInVerdict { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
    @keyframes fillProgress { 0% { width: 0%; } 100% { width: 100%; } }
    @keyframes stepFade { 0% { opacity: 0; transform: translateY(3px); } 100% { opacity: 1; transform: translateY(0); } }
    
    .advisor-spin-anim { animation: advisorSpin 2.5s linear infinite; display: inline-block; }
    .typing-dot-1 { animation: typingPulse 1.2s infinite 0s; }
    .typing-dot-2 { animation: typingPulse 1.2s infinite 0.2s; }
    .typing-dot-3 { animation: typingPulse 1.2s infinite 0.4s; }
    .fade-in-verdict { animation: fadeInVerdict 0.4s ease-out forwards; }
    .advisor-step-anim { animation: stepFade 0.35s ease-out forwards; }
    .advisor-bar-fill { animation: fillProgress 3.2s linear forwards; height: 4px; background: linear-gradient(90deg, #38bdf8, #10b981); border-radius: 4px; }
    </style>
    <div id="asesor-thinking-container">
        <div class="asesor-box" style="margin-bottom: 24px; padding: 20px; background: rgba(2, 132, 199, 0.12); border: 1.5px dashed var(--primary-color); border-radius: 16px; position: relative; overflow: hidden; box-shadow: 0 0 25px rgba(2, 132, 199, 0.15);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; color: var(--primary-color); font-weight: bold; font-size: 0.95rem;">
                    <span class="material-symbols-rounded advisor-spin-anim">psychology</span>
                    ${advisorTitle}
                </div>
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary-color); background: rgba(2, 132, 199, 0.2); padding: 2px 10px; border-radius: 12px;">
                    Analizando opciones...
                </div>
            </div>
            
            <div id="asesor-thinking-msg" class="advisor-step-anim" style="font-size: 0.95rem; line-height: 1.5; color: var(--text-main); font-weight: 500; display: flex; align-items: center; gap: 6px; min-height: 48px;">
                <span>${initialMsg}</span>
                <span style="display: inline-flex; font-weight: 800; color: var(--primary-color);">
                    <span class="typing-dot-1">.</span><span class="typing-dot-2">.</span><span class="typing-dot-3">.</span>
                </span>
            </div>
            
            <div style="margin-top: 14px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; height: 4px;">
                <div class="advisor-bar-fill"></div>
            </div>
        </div>
    </div>
    `;

    document.getElementById('comparador-content').innerHTML = thinkingHTML + gridHTML;
    document.getElementById('modal-comparador').classList.add('active');

    if (window._asesorTimers) {
        window._asesorTimers.forEach(t => clearTimeout(t));
    }
    window._asesorTimers = [];

    const dots = `<span style="display: inline-flex; font-weight: 800; color: var(--primary-color);"><span class="typing-dot-1">.</span><span class="typing-dot-2">.</span><span class="typing-dot-3">.</span></span>`;

    // Paso 1 (0.9s): Motores y refacciones
    window._asesorTimers.push(setTimeout(() => {
        const msgEl = document.getElementById('asesor-thinking-msg');
        if (msgEl) {
            msgEl.className = 'advisor-step-anim';
            msgEl.innerHTML = `<span>📊 Comparando motores, cilindros y facilidad de piezas</span>${dots}`;
        }
    }, 900));

    // Paso 2 (1.8s): Año, millaje y estatus legal
    window._asesorTimers.push(setTimeout(() => {
        const msgEl = document.getElementById('asesor-thinking-msg');
        if (msgEl) {
            msgEl.className = 'advisor-step-anim';
            msgEl.innerHTML = `<span>⚖️ Evaluando año, kilometraje y estatus legal de importación</span>${dots}`;
        }
    }, 1800));

    // Paso 3 (2.6s): Formulando mejor recomendación
    window._asesorTimers.push(setTimeout(() => {
        const msgEl = document.getElementById('asesor-thinking-msg');
        if (msgEl) {
            msgEl.className = 'advisor-step-anim';
            msgEl.innerHTML = `<span>💡 Formulando la mejor recomendación para cuidar tu inversión</span>${dots}`;
        }
    }, 2600));

    // Paso Final (3.2s): Revelar veredicto completo
    window._asesorTimers.push(setTimeout(() => {
        const container = document.getElementById('asesor-thinking-container');
        if (container) {
            container.className = 'fade-in-verdict';
            container.innerHTML = verdictHTML;
        }
    }, 3200));
}

function parseMileage(m) {
    if (!m) return 999999;
    const clean = String(m).replace(/[^0-9]/g, '');
    return parseInt(clean) || 999999;
}

function parsePrice(p) {
    if (!p) return 0;
    const clean = String(p).replace(/[^0-9]/g, '');
    return parseInt(clean) || 0;
}

function isPriceATratar(car) {
    if (!car) return true;
    const p = typeof car === 'object' ? car.price : car;
    if (!p) return true;
    const str = String(p).toLowerCase();
    if (str.includes('tratar') || str.includes('negociable') || str.includes('conveniar') || str.includes('acordar') || str.includes('pregunta') || str.includes('s/n')) return true;
    const clean = str.replace(/[^0-9]/g, '');
    return !clean || parseInt(clean) <= 0;
}

function getEngineSummary(car) {
    let parts = [];
    if (car.engine && car.engine !== '-' && car.engine !== 'Motor estándar') {
        parts.push(car.engine);
    }
    if (car.cylinders && car.cylinders !== '-' && !parts.some(p => p.toLowerCase().includes(String(car.cylinders).toLowerCase()))) {
        parts.unshift(car.cylinders.includes('cil') || car.cylinders.includes('Cil') ? car.cylinders : `${car.cylinders} cil`);
    }
    
    const fullText = ((car.title || '') + ' ' + (car.description || '')).toLowerCase();
    if (fullText.includes('turbo') && !parts.some(p => p.toLowerCase().includes('turbo'))) {
        parts.push('Turbo');
    }

    if (parts.length > 0) {
        return parts.join(' ');
    }

    const cyl = car.cylinders ? String(car.cylinders).toLowerCase() : '';
    if (cyl.includes('4')) return '4 Cil';
    if (cyl.includes('6')) return '6 Cil';
    if (cyl.includes('8')) return '8 Cil';
    return 'Sin especificar';
}

function getMechanicSummary(car) {
    const make = (car.make || '').toLowerCase();
    if (['honda', 'toyota', 'nissan', 'chevrolet'].includes(make)) {
        return '✅ Fácil de reparar / Refacciones económicas locales';
    }
    if (['bmw', 'mercedes', 'audi'].includes(make)) {
        return '⚠️ Mantenimiento premium / Piezas por encargo';
    }
    return 'Mecánica tradicional';
}

function getTransmissionSummary(car) {
    const rawTrans = car.transmission && car.transmission !== '-' ? car.transmission.trim() : '';
    if (rawTrans) {
        return rawTrans;
    }
    
    const text = ((car.title || '') + ' ' + (car.description || '')).toLowerCase();
    if (text.includes('estandar') || text.includes('estándar') || text.includes('manual')) {
        return 'Manual / Estándar';
    }
    return 'Automática';
}

function useVehicleCategoryHook(car) {
    if (!car) return 'vehículo';

    // Prioridad 1: Normalizar tipo / categoría oficial de la ficha del catálogo
    const rawType = (car.type || car.category || car.truckType || '').trim().toLowerCase();

    if (['camión', 'camion', 'camiones', 'tractocamión', 'tractocamion', 'tractocamiones', 'rabón', 'rabon', 'torton', 'chasis', 'autobús', 'autobus'].includes(rawType)) {
        return 'tractocamión';
    }
    if (['camioneta', 'camionetas', 'pickup', 'pick-up', 'suv', 'van / furgoneta', 'van', 'furgoneta'].includes(rawType)) {
        return 'camioneta';
    }
    if (['motocicleta', 'moto', 'motos'].includes(rawType)) {
        return 'motocicleta';
    }
    if (['cuatrimoto / atv', 'cuatrimoto', 'atv', 'utv', 'rzr', 'razor', 'can-am', 'canam', 'polaris'].includes(rawType)) {
        return 'vehículo recreativo/off-road';
    }
    if (['barco', 'lancha', 'embarcación', 'embarcacion', 'yate', 'jet ski', 'jetski'].includes(rawType)) {
        return 'embarcación';
    }
    if (['sedán', 'sedan', 'hatchback', 'deportivo', 'auto', 'automóvil', 'automovil'].includes(rawType)) {
        return 'vehículo';
    }

    // Prioridad 2: Fallback por marca/modelo o palabras clave con límites de palabra estricto (\b)
    const makeModel = ((car.make || '') + ' ' + (car.model || '') + ' ' + (car.title || '')).toLowerCase();

    if (/\b(kenworth|freightliner|peterbilt|mack|cascadia|prostar|lt series|w900|t680|t880|m2 106)\b/i.test(makeModel)) {
        return 'tractocamión';
    }
    if (/\b(ktm|kymco|harley|yamaha|italika|ducati|triumph|bajaj|cbr600rr|cbr1000rr|ninja|gixxer|pulsar)\b/i.test(makeModel)) {
        return 'motocicleta';
    }
    if (/\b(sea-doo|seadoo|waverunner|aquatrax)\b/i.test(makeModel)) {
        return 'embarcación';
    }
    if (/\b(camioneta|suv|pickup|pick-up)\b/i.test(makeModel)) {
        return 'camioneta';
    }
    if (/\b(tractocamion|tractocamión|torton|rabon|rabón)\b/i.test(makeModel)) {
        return 'tractocamión';
    }
    if (/\b(motocicleta|cuatrimoto)\b/i.test(makeModel)) {
        return 'motocicleta';
    }

    return 'vehículo';
}
window.useVehicleCategoryHook = useVehicleCategoryHook;

function getVehicleCategory(car) {
    if (typeof window.useVehicleCategoryHook === 'function') {
        return window.useVehicleCategoryHook(car);
    }
    return useVehicleCategoryHook(car);
}

function getLegalText(car) {
    return car.legal || car.legalStatus || car.legal_status || car.situacion || car.legal_type || '';
}

function getImportCostRange(car) {
    const cat = getVehicleCategory(car);
    const textMotor = ((car.title || '') + ' ' + (car.make || '') + ' ' + (car.model || '') + ' ' + (car.engine || '') + ' ' + (car.cylinders || '') + ' ' + (car.description || '')).toLowerCase();
    
    const isSUVOrTruck = cat === 'camioneta' || cat === 'suv' || cat === 'pick-up' || cat === 'tractocamión' || textMotor.includes('suv') || textMotor.includes('truck') || textMotor.includes('pick') || textMotor.includes('8 cil') || textMotor.includes('v8');

    if (isSUVOrTruck) {
        return {
            frontUSD: [1450, 1600],
            nacUSD: [1700, 1950],
            isSUV: true
        };
    } else {
        return {
            frontUSD: [1250, 1450],
            nacUSD: [1650, 1800],
            isSUV: false
        };
    }
}

function getImportQualificationText(car) {
    const rawLegal = getLegalText(car);
    const s = rawLegal.toLowerCase().trim();
    
    if (s.includes('nacional') || s.includes('decreto') || s.includes('regularizado') || s.includes('fronterizo')) {
        return '';
    }

    const year = parseInt(car.year) || 0;
    if (!year) return '';

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let baseYear = currentYear;
    if (currentMonth >= 10) {
        baseYear += 1;
    }

    const minFront = baseYear - 10;
    const maxFront = baseYear - 5;
    const minNac = baseYear - 9;
    const maxNac = baseYear - 8;

    const isNacional = year >= minNac && year <= maxNac;
    const isFronterizo = year >= minFront && year <= maxFront;

    let warningText = '';
    if (currentMonth === 9 && (year === minFront || year === minNac)) {
        const targetDate = new Date(currentYear, 10, 1);
        const daysLeft = Math.max(1, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
        if (daysLeft <= 15) {
            warningText = `<br>🔴 🛑 <strong>¡ALERTA CRÍTICA DE TIEMPOS (Quedan solo ${daysLeft} días)!</strong> Si vas a comprar este modelo (${year}), toma en cuenta que el trámite de legalización tarda alrededor de 30 días y solo quedan ${daysLeft} días antes del 1 de Noviembre (fecha en que el año ${year} DEJA de calificar). <strong>Es muy probable que ya NO alcances a realizar el trámite a tiempo.</strong>`;
        } else {
            warningText = `<br>⏳ ⚠️ <strong>¡ALERTA URGENTE DE TIEMPOS (Quedan ${daysLeft} días)!</strong> Si compras este modelo (${year}), debes iniciar su trámite <strong>DE INMEDIATO</strong>. El 1 de Noviembre cambia el Decreto y el año ${year} DEJARÁ de calificar. Como el trámite tarda hasta 30 días, estás en el límite de tiempo.`;
        }
    }

    const cat = getVehicleCategory(car);
    const isTruck = cat === 'tractocamión';
    const isRecreational = ['motocicleta', 'vehículo recreativo/off-road', 'embarcación'].includes(cat);

    const nacLabel = isTruck ? 'Nacional VU y Nacional A1' : (isRecreational ? 'Nacional' : 'Nacional y Fronterizo');
    const frontLabel = isTruck ? 'Nacional A1' : (isRecreational ? 'Nacional' : 'Fronterizo');

    const aduanaNote = `<br>📋 <em>Nota de importación:</em> Para conocer impuestos y honorarios exactos, te recomendamos consultar directamente con un <strong>Agente Aduanal</strong>.`;

    if (isNacional && isFronterizo) {
        return `<strong>Califica para ${nacLabel} por su año (${year}).</strong>${aduanaNote}${warningText}`;
    }
    if (isFronterizo) {
        return `✅ <strong>Califica para ${frontLabel} por su año (${year}).</strong>${aduanaNote}${warningText}`;
    }
    if (!isNacional && !isFronterizo) {
        return `❌ <strong>Este auto ya NO pasa importación</strong> (por su año ${year} no califica para nacional ni Fronterizo). Consultar con una Agencia Aduanal para ver si existe algún trámite especial o solución.`;
    }
    return `⚠️ <strong>Trámite de Importación:</strong> Por su año (${year}), consultar Decreto o Agente Aduanal.`;
}

function useSmartVehicleScorerHook(car) {
    if (!car) return 0;
    let score = 0;

    const cat = typeof window.useVehicleCategoryHook === 'function' 
        ? window.useVehicleCategoryHook(car) 
        : getVehicleCategory(car);

    // 1. ESTATUS LEGAL (Jerarquía de 4 niveles para Autos, Tractos y Recreativos)
    const rawLegal = (getLegalText(car) || '').toLowerCase().trim();
    const isTruck = cat === 'tractocamión';
    const isRecreational = ['motocicleta', 'vehículo recreativo/off-road', 'embarcación'].includes(cat);

    if (isTruck) {
        if (rawLegal.includes('vu') || rawLegal.includes('libre')) {
            score += 500; // Nacional VU (Libre todo México)
        } else if (rawLegal.includes('a1') || rawLegal.includes('fronterizo')) {
            score += 200; // Nacional A1 (Solo Frontera)
        } else {
            score += 50;  // Americano
        }
    } else if (isRecreational) {
        if (rawLegal.includes('nacional') || rawLegal.includes('decreto') || rawLegal.includes('regularizado')) {
            score += 400; // Nacional
        } else {
            score += 50;  // Americano
        }
    } else {
        // Autos y Camionetas (4 Niveles + Contexto de Ciudad)
        const city = (car.city || '').toLowerCase();
        const borderCities = ['mexicali', 'tijuana', 'ensenada', 'rosarito', 'tecate', 'san luis r.c.', 'san luis rio colorado', 'nogales', 'ciudad juarez', 'juarez', 'reynosa', 'matamoros', 'nuevo laredo', 'piedras negras', 'baja california sur', 'bcs', 'la paz', 'los cabos', 'cabo san lucas', 'san jose del cabo', 'loreto', 'mulege', 'santa rosalia', 'comondu'];
        const isBorderCity = borderCities.some(b => city.includes(b));

        if (isBorderCity || !city) {
            // EN ZONA FRONTERIZA:
            // 1. Decreto (+500 pts): El rey en la frontera (circula en todo México y su costo de trámite fue económico)
            // 2. Fronterizo (+400 pts): Excelente para uso diario local por costo de importación accesible
            // 3. Nacional (+320 pts): Menos conveniente en frontera por ser más caro de comprar o nacionalizar
            if (rawLegal.includes('decreto') || rawLegal.includes('regularizado')) {
                score += 500; // Decreto (Máximo valor en frontera)
            } else if (rawLegal.includes('fronterizo')) {
                score += 400; // Fronterizo (Muy conveniente y accesible para la frontera)
            } else if (rawLegal.includes('agencia') || rawLegal.includes('nacional')) {
                score += 320; // Nacional (Menos atractivo en frontera por costo elevado de nacionalización)
            } else {
                // Americano: Verificar si califica por su año
                const carYr = parseInt(car.year) || 0;
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth();
                let baseYear = currentYear;
                if (currentMonth >= 10) baseYear += 1;
                const minFront = baseYear - 10;
                const maxFront = baseYear - 5;
                const minNac = baseYear - 9;
                const maxNac = baseYear - 8;
                const qualifies = (carYr >= minFront && carYr <= maxFront) || (carYr >= minNac && carYr <= maxNac);

                if (!qualifies) {
                    score -= 1000; // Penalización máxima porque YA NO SE PUEDE IMPORTAR por su año
                } else {
                    score -= 100; // Americano que sí califica para trámite
                }
            }
        } else {
            // EN EL INTERIOR DE LA REPÚBLICA:
            if (rawLegal.includes('agencia') || (rawLegal.includes('nacional') && !rawLegal.includes('decreto'))) {
                score += 500; // Nacional de Agencia (Máximo puntaje en el interior)
            } else if (rawLegal.includes('decreto') || rawLegal.includes('regularizado')) {
                score += 400; // Decreto (Circula libre por todo el país)
            } else {
                // Tanto Fronterizo como Americano sufren penalización severa (-1000 pts) en el interior
                score -= 1000;
            }
        }
    }

    // 2. MOTOR Y CILINDROS (Ahorro de Gasolina)
    const textMotor = ((car.title || '') + ' ' + (car.engine || '') + ' ' + (car.cylinders || '') + ' ' + (car.description || '')).toLowerCase();
    let cyl = 0;
    if (textMotor.includes('3 cil') || textMotor.includes('3-cil') || String(car.cylinders).includes('3')) cyl = 3;
    else if (textMotor.includes('4 cil') || textMotor.includes('4-cil') || String(car.cylinders).includes('4')) cyl = 4;
    else if (textMotor.includes('6 cil') || textMotor.includes('6-cil') || String(car.cylinders).includes('6')) cyl = 6;
    else if (textMotor.includes('8 cil') || textMotor.includes('8-cil') || String(car.cylinders).includes('8')) cyl = 8;

    if (cyl === 3 || cyl === 4 || textMotor.includes('turbo')) {
        score += 300; // Ahorro máximo / Eficiencia
    } else if (cyl === 6) {
        score += 150; // Equilibrio
    } else if (cyl === 8) {
        score += 50;  // Consumo elevado
    } else {
        score += 150; // Neutral
    }

    // 3. LUJO Y GAMA ALTA
    const make = (car.make || '').toLowerCase();
    const premiumMakes = ['bmw', 'mercedes-benz', 'mercedes', 'audi', 'porsche', 'lexus', 'cadillac', 'lincoln', 'infiniti', 'acura', 'cupra', 'jaguar', 'land rover', 'mustang'];
    if (premiumMakes.includes(make) || textMotor.includes('lujo') || textMotor.includes('equipada') || textMotor.includes('equipped')) {
        score += 250;
    }

    // 4. AIRE ACONDICIONADO (A/C)
    if (car.ac === 'Si' || car.ac === 'Sí' || car.ac === true || textMotor.includes('a/c') || textMotor.includes('aire')) {
        score += 150;
    }

    // 5. AÑO DEL VEHÍCULO
    const year = parseInt(car.year) || 2000;
    if (year > 2000) {
        score += (year - 2000) * 50; // +50 pts por año reciente
    }

    // 6. KILOMETRAJE / MILLAS (- Puntos por desgaste o por ocultar kilometraje S/N)
    const mileage = parseMileage(car.mileage);
    if (mileage > 0 && mileage !== 999999) {
        score -= Math.floor(mileage / 1000);
    } else {
        score -= 200; // Penalización severa por no publicar kilometraje (S/N)
    }

    // 7. PRECIO REAL EN MXN (- Puntos por costo de compra)
    const rate = parseFloat(localStorage.getItem('revista_exchange_rate')) || 17;
    const rawPrice = parsePrice(car.price);
    const curr = (car.currency || '').toLowerCase();
    let priceMXN = rawPrice;
    if (curr.includes('dll') || curr.includes('usd') || curr.includes('dls')) {
        priceMXN = rawPrice * rate;
    }
    if (rawLegal.includes('americano') || (!rawLegal.includes('nacional') && !rawLegal.includes('decreto') && !rawLegal.includes('fronterizo'))) {
        const costs = getImportCostRange(car);
        const avgImportUSD = Math.round((costs.frontUSD[0] + costs.frontUSD[1]) / 2);
        priceMXN += (avgImportUSD * rate);
    }
    if (priceMXN > 0) {
        score -= Math.floor(priceMXN / 2000);
    }

    return score;
}
window.useSmartVehicleScorerHook = useSmartVehicleScorerHook;

function useCarDisplayNameHook(car, otherCar = null) {
    if (!car) return 'Vehículo';
    const model = (car.model || '').trim();
    const make = (car.make || '').trim();
    if (model) {
        return model;
    }
    return make || 'Vehículo';
}
window.useCarDisplayNameHook = useCarDisplayNameHook;

function getCarDisplayName(car, otherCar = null) {
    if (typeof window.useCarDisplayNameHook === 'function') {
        return window.useCarDisplayNameHook(car, otherCar);
    }
    return useCarDisplayNameHook(car, otherCar);
}

function getLegalStatusAnalysis(c1, c2) {
    const normalizeStatus = (car) => {
        const raw = getLegalText(car);
        const s = raw.toLowerCase().trim();
        if (s.includes('nacional') || s.includes('decreto') || s.includes('regularizado')) return 'NACIONAL';
        if (s.includes('fronterizo')) return 'FRONTERIZO';
        if (s.includes('americano') || s.includes('titulo') || s.includes('título')) return 'AMERICANO';
        
        const curr = (car.currency || '').toLowerCase();
        const fullText = ((car.title || '') + ' ' + (car.description || '')).toLowerCase();
        if (curr.includes('dll') || curr.includes('usd') || fullText.includes('titulo') || fullText.includes('título')) {
            return 'AMERICANO';
        }
        return 'AMERICANO';
    };

    const st1 = normalizeStatus(c1);
    const st2 = normalizeStatus(c2);

    const name1 = getCarDisplayName(c1, c2);
    const name2 = getCarDisplayName(c2, c1);

    const txt1 = getLegalText(c1) || (st1 === 'NACIONAL' ? 'Nacional' : (st1 === 'FRONTERIZO' ? 'Fronterizo' : 'Americano'));
    const txt2 = getLegalText(c2) || (st2 === 'NACIONAL' ? 'Nacional' : (st2 === 'FRONTERIZO' ? 'Fronterizo' : 'Americano'));

    const cat1 = getVehicleCategory(c1);
    const cat2 = getVehicleCategory(c2);
    const isRecreational = ['motocicleta', 'vehículo recreativo/off-road', 'embarcación'].includes(cat1) || ['motocicleta', 'vehículo recreativo/off-road', 'embarcación'].includes(cat2);

    if (isRecreational) {
        const amer1 = st1 === 'AMERICANO';
        const amer2 = st2 === 'AMERICANO';

        if (amer1 && amer2) {
            const q1 = getImportQualificationText(c1);
            const q2 = getImportQualificationText(c2);
            return `<br><br>📋 <strong>Situación Legal (Ambos Americanos):</strong><br>• <em>Ventaja:</em> Precio de compra de entrada más accesible.<br>• <em>Desventaja:</em> Cuentan con Título Americano. En esta categoría solo existe estatus <strong>Nacional o Americano</strong> (no existe estatus Fronterizo), por lo que requerirás pedimento aduanal de nacionalización.${q1 ? `<br>• <strong>${name1}:</strong> ${q1}` : ''}${q2 ? `<br>• <strong>${name2}:</strong> ${q2}` : ''}`;
        }
        if ((st1 === 'NACIONAL' && amer2) || (st2 === 'NACIONAL' && amer1)) {
            const nacRec = st1 === 'NACIONAL' ? c1 : c2;
            const amerRec = st1 === 'AMERICANO' ? c1 : c2;
            const nacName = getCarDisplayName(nacRec, amerRec);
            const amerName = getCarDisplayName(amerRec, nacRec);
            const q = getImportQualificationText(amerRec);
            return `<br><br>⚖️ <strong>Estatus Legal (${nacName} Nacional vs ${amerName} Americano):</strong><br>• <strong>${nacName} (Nacional):</strong> <em>Ventaja:</em> 100% legalizado para usarse y transportarse por todo México. <em>Desventaja:</em> Inversión mayor.<br>• <strong>${amerName} (Americano):</strong> <em>Ventaja:</em> Más económico de entrada. <em>Desventaja:</em> Requiere trámite y pago de pedimento de nacionalización (en esta categoría no existe estatus Fronterizo).${q}`;
        }
        if (st1 === 'NACIONAL' && st2 === 'NACIONAL') {
            return `<br><br>📋 <strong>Situación Legal (Ambos Nacionales):</strong><br>• <em>Ventaja:</em> Libertad total para usarse y transportarse por cualquier carretera del país sin problemas fiscales ni de tránsito.`;
        }
    }

    const isTruckC1 = getVehicleCategory(c1) === 'tractocamión' || txt1.includes('VU') || txt1.includes('A1');
    const isTruckC2 = getVehicleCategory(c2) === 'tractocamión' || txt2.includes('VU') || txt2.includes('A1');

    if (isTruckC1 || isTruckC2) {
        const isVU1 = txt1.includes('VU') || txt1.toLowerCase().includes('vu');
        const isA1_1 = txt1.includes('A1') || txt1.toLowerCase().includes('a1');
        const isAmer1 = st1 === 'AMERICANO';

        const isVU2 = txt2.includes('VU') || txt2.toLowerCase().includes('vu');
        const isA1_2 = txt2.includes('A1') || txt2.toLowerCase().includes('a1');
        const isAmer2 = st2 === 'AMERICANO';

        if (isVU1 && isA1_2) {
            return `<br><br>🚚 <strong>Estatus Legal de Tractocamiones (${name1} Nacional VU vs ${name2} Nacional A1):</strong><br>• <strong>${name1} (Nacional VU):</strong> <em>Ventaja:</em> Libertad total para fletear y transitar por todas las carreteras de México. <em>Desventaja:</em> Inversión inicial mayor.<br>• <strong>${name2} (Nacional A1):</strong> <em>Ventaja:</em> Precio más accesible. <em>Desventaja:</em> Restringido únicamente a fletes en la franja fronteriza.`;
        }
        if (isA1_1 && isVU2) {
            return `<br><br>🚚 <strong>Estatus Legal de Tractocamiones (${name1} Nacional A1 vs ${name2} Nacional VU):</strong><br>• <strong>${name1} (Nacional A1):</strong> <em>Ventaja:</em> Precio más económico de entrada. <em>Desventaja:</em> Solo para rutas en la franja fronteriza.<br>• <strong>${name2} (Nacional VU):</strong> <em>Ventaja:</em> Puedes trabajar y fletear libremente por todo México. <em>Desventaja:</em> Inversión inicial más alta.`;
        }
        if (isVU1 && isVU2) {
            return `<br><br>📋 <strong>Situación Legal (Ambos Nacional VU):</strong><br>• <em>Ventaja:</em> Ambos cuentan con pedimento VU libre para trabajar y recorrer todas las carreteras del país.<br>• <em>Desventaja:</em> Su precio inicial suele ser más elevado.`;
        }
        if (isA1_1 && isA1_2) {
            return `<br><br>🚚 <strong>Situación Legal (Ambos Nacional A1):</strong><br>• <em>Ventaja:</em> Excelente opción de trabajo con pedimento A1 para la zona fronteriza.<br>• <em>Desventaja:</em> Ambos están restringidos a la franja fronteriza (no pueden internarse al interior).`;
        }
        if (isAmer1 || isAmer2) {
            const amerTruck = isAmer1 ? c1 : c2;
            const nacTruck = isAmer1 ? c2 : c1;
            const amerName = getCarDisplayName(amerTruck, nacTruck);
            const nacName = getCarDisplayName(nacTruck, amerTruck);
            const nacTxt = getLegalText(nacTruck) || 'Nacional';
            return `<br><br>🚚 <strong>Estatus Legal (${amerName} Americano vs ${nacName} ${nacTxt}):</strong><br>• <strong>${amerName} (Americano):</strong> <em>Ventaja:</em> Precio inicial más bajo. <em>Desventaja:</em> No está importado aún; le falta todo el trámite de pedimento aduanal.<br>• <strong>${nacName} (${nacTxt}):</strong> <em>Ventaja:</em> Ya cuenta con pedimento legal listo para trabajar. <em>Desventaja:</em> Inversión inicial mayor.`;
        }
    }

    if (st1 === 'AMERICANO' && st2 === 'AMERICANO') {
        const q1 = getImportQualificationText(c1);
        const q2 = getImportQualificationText(c2);

        const rate = parseFloat(localStorage.getItem('revista_exchange_rate')) || 17;
        const getPriceMXN = (car) => {
            const raw = parsePrice(car.price);
            const curr = (car.currency || '').toLowerCase();
            if (curr.includes('dll') || curr.includes('usd') || curr.includes('dls')) return raw * rate;
            return raw;
        };
        const p1 = getPriceMXN(c1);
        const p2 = getPriceMXN(c2);

        let ventajaText = 'Precio de compra inicial más accesible que un auto ya legalizado.';
        if (p1 > 0 && p2 > 0 && p1 !== p2) {
            const cheaper = p1 < p2 ? c1 : c2;
            const expensive = p1 < p2 ? c2 : c1;
            const cheapName = getCarDisplayName(cheaper, expensive);
            ventajaText = `El <strong>${cheapName}</strong> ofrece el precio de compra más accesible de los dos.`;
        }

        return `<br><br>📋 <strong>Situación Legal (Ambos Americanos):</strong><br>• <em>Ventaja:</em> ${ventajaText}<br>• <em>Desventaja:</em> Se entregan con Título Americano únicamente (sin placas mexicanas ni pedimento registrado).${q1 ? `<br>• <strong>${name1}:</strong> ${q1}` : ''}${q2 ? `<br>• <strong>${name2}:</strong> ${q2}` : ''}`;
    }
    if (st1 === 'FRONTERIZO' && st2 === 'FRONTERIZO') {
        return `<br><br>📑 <strong>Situación Legal (Ambos Fronterizos):</strong><br>• <em>Ventaja:</em> Circulan 100% legal en la ciudad fronteriza con sus placas locales sin pagar costo de Nacional.<br>• <em>Desventaja:</em> No pueden viajar al interior del país sin permiso temporal de aduana.`;
    }
    if (st1 === 'NACIONAL' && st2 === 'NACIONAL') {
        return `<br><br>📋 <strong>Situación Legal (Ambos Nacionales/Decreto):</strong><br>• <em>Ventaja:</em> Libertad total para circular por todo México sin restricciones ni riesgos de tránsito.<br>• <em>Desventaja:</em> Su precio inicial suele ser más elevado.`;
    }

    const city = ((c1.city || c2.city || '')).toLowerCase();
    const borderCities = ['mexicali', 'tijuana', 'ensenada', 'rosarito', 'tecate', 'san luis r.c.', 'san luis rio colorado', 'nogales', 'ciudad juarez', 'juarez', 'reynosa', 'matamoros', 'nuevo laredo', 'piedras negras', 'baja california sur', 'bcs', 'la paz', 'los cabos', 'cabo san lucas', 'san jose del cabo', 'loreto', 'mulege', 'santa rosalia', 'comondu'];
    const isBorderCity = borderCities.some(b => city.includes(b));

    const nac = st1 === 'NACIONAL' ? c1 : (st2 === 'NACIONAL' ? c2 : null);
    const front = st1 === 'FRONTERIZO' ? c1 : (st2 === 'FRONTERIZO' ? c2 : null);
    const amer = st1 === 'AMERICANO' ? c1 : (st2 === 'AMERICANO' ? c2 : null);

    if (isBorderCity) {
        if (nac && front) {
            const nacName = getCarDisplayName(nac, front);
            const frontName = getCarDisplayName(front, nac);
            const nacTxt = getLegalText(nac) || 'Nacional';
            const isDecreto = nacTxt.toLowerCase().includes('decreto') || nacTxt.toLowerCase().includes('regularizado');
            
            if (isDecreto) {
                return `<br><br>⚖️ <strong>Estatus Legal (${nacName} Decreto vs ${frontName} Fronterizo):</strong><br>• <strong>${nacName} (Decreto):</strong> <em>Ventaja:</em> Es la mejor relación costo-beneficio en la frontera. Su trámite fue económico y te da libertad total para viajar por todo México sin permisos.<br>• <strong>${frontName} (Fronterizo):</strong> <em>Ventaja:</em> Excelente opción para uso diario local. <em>Desventaja:</em> Restringido únicamente a la franja fronteriza.`;
            } else {
                return `<br><br>⚖️ <strong>Estatus Legal (${nacName} Nacional vs ${frontName} Fronterizo):</strong><br>• <strong>${nacName} (Nacional):</strong> <em>Ventaja:</em> Libertad total para transitar por todo México. <em>Desventaja:</em> Costo de compra o nacionalización aduanal más elevado.<br>• <strong>${frontName} (Fronterizo):</strong> <em>Ventaja:</em> Trámite de importación más accesible para el diario en la frontera. <em>Desventaja:</em> No puede internarse al interior sin permiso aduanal.`;
            }
        }
        if (nac && amer) {
            const nacName = getCarDisplayName(nac, amer);
            const amerName = getCarDisplayName(amer, nac);
            const nacTxt = getLegalText(nac) || 'Nacional';
            const q = getImportQualificationText(amer);
            return `<br><br>⚖️ <strong>Estatus Legal (${nacName} vs ${amerName}):</strong><br>• <strong>${nacName} (${nacTxt}):</strong> <em>Ventaja:</em> Listo para andar sin trámites ni multas. <em>Desventaja:</em> Cuesta más dinero.<br>• <strong>${amerName} (Americano):</strong> <em>Ventaja:</em> Precio de compra más accesible. <em>Desventaja:</em> Trámite de legalización/regularización en el país pendiente.${q}`;
        }
        if (front && amer) {
            const frontName = getCarDisplayName(front, amer);
            const amerName = getCarDisplayName(amer, front);
            const q = getImportQualificationText(amer);

            const rate = parseFloat(localStorage.getItem('revista_exchange_rate')) || 17;
            const getPriceMXN = (c) => {
                const raw = parsePrice(c.price);
                const curr = (c.currency || '').toLowerCase();
                if (curr.includes('dll') || curr.includes('usd') || curr.includes('dls')) return raw * rate;
                return raw;
            };

            const costs = getImportCostRange(amer);
            const avgImportUSD = Math.round((costs.frontUSD[0] + costs.frontUSD[1]) / 2);
            const avgImportMXN = avgImportUSD * rate;

            const pFrontMXN = getPriceMXN(front);
            const pAmerMXN = getPriceMXN(amer);
            const pAmerTotalMXN = pAmerMXN + avgImportMXN;

            // Verificar si el auto Americano realmente califica por año para importación o nacionalización
            const amerYear = parseInt(amer.year) || 0;
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            let baseYear = currentYear;
            if (currentMonth >= 10) baseYear += 1;

            const minFront = baseYear - 10;
            const maxFront = baseYear - 5;
            const qualifiesForImport = amerYear >= minFront && amerYear <= maxFront;

            let advNote = '';
            if (!qualifiesForImport) {
                advNote = `<br><br>💡 <strong>¿Vale la pena comprar el Americano en este caso?</strong><br>❌ <strong>NO SE PUEDE IMPORTAR POR SU AÑO:</strong> El <strong>${amerName} (${amerYear})</strong> ya NO califica para importación por su modelo (${amerYear}). Consultar directamente con un <strong>Agente Aduanal</strong> antes de realizar cualquier oferta.`;
            } else if (pAmerTotalMXN < pFrontMXN * 0.85) {
                advNote = `<br><br>💡 <strong>¿Vale la pena comprar el Americano en este caso?</strong><br>🔥 <strong>SÍ, ¡ES UN REMATE ATRACTIVO!</strong> El <strong>${amerName} (${amerYear})</strong> califica para importación por su año y su precio inicial es significativamente más bajo. Te recomendamos verificar el costo exacto del pedimento y trámite con un <strong>Agente Aduanal</strong> para confirmar tu ahorro total.`;
            } else {
                advNote = `<br><br>💡 <strong>¿Vale la pena comprar el Americano en este caso?</strong><br>🛑 <strong>NO conviene tanto.</strong> Al considerar los costos de trámite aduanal, vueltas y tiempo de espera, el <strong>${amerName}</strong> termina costando casi lo mismo que el <strong>${frontName}</strong>. El <strong>${frontName}</strong> ya viene listo con sus placas locales sin sorpresas. Consulta costos exactos con un <strong>Agente Aduanal</strong>.`;
            }

            return `<br><br>⚖️ <strong>Estatus Legal (${frontName} vs ${amerName}):</strong><br>• <strong>${frontName} (Fronterizo):</strong> <em>Ventaja:</em> Trae placas locales listo para circular sin trámites.<br>• <strong>${amerName} (Americano):</strong> <em>Ventaja:</em> Precio de compra más bajo en papel. <em>Desventaja:</em> Requiere trámite de importación.${q}${advNote}`;
        }
    } else {
        if (nac && front) {
            const nacName = getCarDisplayName(nac, front);
            const frontName = getCarDisplayName(front, nac);
            const nacTxt = getLegalText(nac) || 'Nacional';
            return `<br><br>⚠️ <strong>Situación Legal en el Interior:</strong> El <strong>${nacName} (${nacTxt})</strong> es la compra segura para circular libremente por todo México. El <strong>${frontName} (Fronterizo)</strong> NO sirve para el interior de la República ya que no puede internarse sin riesgo de decomiso fiscal.`;
        }
        if (nac && amer) {
            const nacName = getCarDisplayName(nac, amer);
            const amerName = getCarDisplayName(amer, nac);
            const nacTxt = getLegalText(nac) || 'Nacional';
            const q = getImportQualificationText(amer);
            return `<br><br>⚠️ <strong>Situación Legal en el Interior:</strong> El <strong>${nacName} (${nacTxt})</strong> está listo para circular libremente por todo el país frente al <strong>${amerName} (Americano)</strong>.${q}`;
        }
    }
    return '';
}

function getEngineComparison(c1, c2) {
    const text1 = ((c1.title || '') + ' ' + (c1.engine || '') + ' ' + (c1.cylinders || '') + ' ' + (c1.description || '')).toLowerCase();
    const text2 = ((c2.title || '') + ' ' + (c2.engine || '') + ' ' + (c2.cylinders || '') + ' ' + (c2.description || '')).toLowerCase();

    const name1 = getCarDisplayName(c1, c2);
    const name2 = getCarDisplayName(c2, c1);

    const isTurbo1 = text1.includes('turbo');
    const isTurbo2 = text2.includes('turbo');

    const getCyl = (car, text) => {
        if (text.includes('4 cil') || text.includes('4-cil') || String(car.cylinders).includes('4')) return 4;
        if (text.includes('6 cil') || text.includes('6-cil') || String(car.cylinders).includes('6')) return 6;
        if (text.includes('8 cil') || text.includes('8-cil') || String(car.cylinders).includes('8')) return 8;
        return 0;
    };

    const cyl1 = getCyl(c1, text1);
    const cyl2 = getCyl(c2, text2);

    if (cyl1 === 4 && isTurbo1 && cyl2 === 6 && !isTurbo2) {
        return ` En el motor: el <strong>${name1}</strong> tiene motor Turbo, dándote la potencia de un 6 cilindros pero gastando menos gasolina.`;
    }
    if (cyl2 === 4 && isTurbo2 && cyl1 === 6 && !isTurbo1) {
        return ` En el motor: el <strong>${name2}</strong> tiene motor Turbo, dándote el empuje de un 6 cilindros pero consumiendo menos gasolina.`;
    }
    if (cyl1 === 4 && cyl2 === 6) {
        return ` En el motor: el <strong>${name1}</strong> (4 cilindros) destaca en ahorro de gasolina diario, mientras que el <strong>${name2}</strong> (6 cilindros) responderá con más fuerza en carretera pero gasta más gasolina en la ciudad.`;
    }
    if (cyl2 === 4 && cyl1 === 6) {
        return ` En el motor: el <strong>${name2}</strong> (4 cilindros) destaca en ahorro de gasolina diario, mientras que el <strong>${name1}</strong> (6 cilindros) responderá con más fuerza en carretera pero gasta más gasolina en la ciudad.`;
    }
    if ((cyl1 === 6 && cyl2 === 8) || (cyl1 === 8 && cyl2 === 6)) {
        const c6 = cyl1 === 6 ? c1 : c2;
        const c8 = cyl1 === 8 ? c1 : c2;
        const name6 = getCarDisplayName(c6, c8);
        const name8 = getCarDisplayName(c8, c6);
        return ` En motorización: el <strong>${name6}</strong> (6 cilindros) es más equilibrado, mientras que el <strong>${name8}</strong> (8 cilindros) destaca en fuerza de trabajo/arrastre a costa de mayor consumo.`;
    }

    return '';
}

function getPriceComparison(c1, c2) {
    if (isPriceATratar(c1) || isPriceATratar(c2)) {
        if (isPriceATratar(c1) && isPriceATratar(c2)) {
            return ` Toma en cuenta que ambos vehículos tienen su <strong>precio a tratar</strong> (requieren negociación directa con el vendedor).`;
        }
        const tratarCar = isPriceATratar(c1) ? c1 : c2;
        const otherCar = isPriceATratar(c1) ? c2 : c1;
        const tName = getCarDisplayName(tratarCar, otherCar);
        return ` Toma en cuenta que el <strong>${tName}</strong> tiene su precio marcado como <strong>a tratar</strong>, por lo que requiere negociación directa con el vendedor.`;
    }

    const rate = parseFloat(localStorage.getItem('revista_exchange_rate')) || 17;

    const getPriceInMXN = (car) => {
        const raw = parsePrice(car.price);
        const curr = (car.currency || '').toLowerCase();
        if (curr.includes('dll') || curr.includes('usd') || curr.includes('dls')) {
            return raw * rate;
        }
        return raw;
    };

    if (c1.currency && c2.currency && c1.currency === c2.currency) {
        const p1 = parsePrice(c1.price);
        const p2 = parsePrice(c2.price);
        if (p1 > 0 && p2 > 0 && p1 !== p2) {
            const diff = Math.abs(p1 - p2);
            const cheaper = p1 < p2 ? c1 : c2;
            const expensive = p1 < p2 ? c2 : c1;
            const cheapName = getCarDisplayName(cheaper, expensive);
            const expName = getCarDisplayName(expensive, cheaper);

            const yCheap = parseInt(cheaper.year) || 0;
            const yExp = parseInt(expensive.year) || 0;
            let yearText = '';
            if (yCheap > 0 && yExp > 0) {
                if (yCheap > yExp) {
                    const diffY = yCheap - yExp;
                    yearText = ` y además es <strong>${diffY} año${diffY > 1 ? 's' : ''} más nuevo</strong> (${yCheap} vs ${yExp})`;
                } else if (yCheap < yExp) {
                    const diffY = yExp - yCheap;
                    yearText = `, aunque el <strong>${expName}</strong> es ${diffY} año${diffY > 1 ? 's' : ''} más reciente`;
                }
            }

            return ` Hablando de dinero y modelo, el <strong>${cheapName}</strong> te ahorra directo <strong>$${diff.toLocaleString()} ${c1.currency}</strong> de entrada${yearText}.`;
        }
    } else if (c1.currency && c2.currency && c1.currency !== c2.currency) {
        const mxn1 = getPriceInMXN(c1);
        const mxn2 = getPriceInMXN(c2);
        if (mxn1 > 0 && mxn2 > 0) {
            const diffPct = Math.abs(mxn1 - mxn2) / Math.max(mxn1, mxn2);
            const cheaper = mxn1 < mxn2 ? c1 : c2;
            const expensive = mxn1 < mxn2 ? c2 : c1;
            const cheapName = getCarDisplayName(cheaper, expensive);
            const expName = getCarDisplayName(expensive, cheaper);

            const yCheap = parseInt(cheaper.year) || 0;
            const yExp = parseInt(expensive.year) || 0;
            let yearText = '';
            if (yCheap > 0 && yExp > 0 && yCheap > yExp) {
                const diffY = yCheap - yExp;
                yearText = ` y además es <strong>${diffY} año${diffY > 1 ? 's' : ''} más nuevo</strong> (${yCheap} vs ${yExp})`;
            }

            if (diffPct <= 0.12) {
                return ` Tomando el tipo de cambio ($${rate} MXN/USD), ambos andan más o menos parejos en precio${yearText}.`;
            } else {
                return ` Tomando el tipo de cambio ($${rate} MXN/USD), el <strong>${cheapName}</strong> resulta ser una opción más económica de entrada que el <strong>${expName}</strong>${yearText}.`;
            }
        }
    }
    return '';
}

function generateSmartVerdict(cars, isMagicVerdict) {
    const getPhotoObj = (c) => {
        let original = 'https://placehold.co/400x300/1e293b/38bdf8?text=Sin+Foto';
        if (c.images && c.images.length > 0) original = c.images[0];
        else if (c.image) original = c.image;
        else if (c.photos && c.photos.length > 0) original = c.photos[0].thumbnailUrl || c.photos[0].url || c.photos[0];

        let thumb = original;
        if (typeof window.useImageOptimizerHook === 'function') {
            const opt = window.useImageOptimizerHook();
            if (opt && opt.getThumbnailUrl) {
                const url = opt.getThumbnailUrl(c);
                if (url) thumb = url;
            }
        }
        return { thumb, original };
    };

    let winner = cars[0];
    let runnerUp = cars[1] || cars[0];
    
    let bestScore = -Infinity;
    cars.forEach(car => {
        const score = typeof window.useSmartVehicleScorerHook === 'function'
            ? window.useSmartVehicleScorerHook(car)
            : useSmartVehicleScorerHook(car);
        
        if (score > bestScore) {
            runnerUp = winner;
            winner = car;
            bestScore = score;
        }
    });

    if (winner.id === runnerUp.id && cars.length > 1) {
        runnerUp = cars.find(c => c.id !== winner.id);
    }

    if (isMagicVerdict) {
        const pWin = getPhotoObj(winner);
        const winName = `${winner.make} ${winner.model}`;

        // Construir las razones transparentes y reales por las que ganó
        const reasons = [];

        // 1. Estatus Legal
        const winLegal = (getLegalText(winner) || '').toLowerCase();
        const runLegal = (getLegalText(runnerUp) || '').toLowerCase();

        if (winLegal.includes('decreto') || winLegal.includes('regularizado')) {
            reasons.push(`📜 <strong>Estatus Legal Decreto:</strong> Te ofrece libertad total para circular por todo México sin requerir trámites aduanales pendientes ni permisos.`);
        } else if (winLegal.includes('agencia') || winLegal.includes('nacional')) {
            reasons.push(`📜 <strong>Estatus Nacional Libre:</strong> Cuenta con pedimento o factura nacional lista para usarse en cualquier carretera del país sin restricciones.`);
        } else if (winLegal.includes('fronterizo') && !runLegal.includes('decreto') && !runLegal.includes('nacional')) {
            reasons.push(`📑 <strong>Estatus Fronterizo:</strong> Circula 100% legal con sus placas locales sin haber tenido que pagar la diferencia de una nacionalización completa.`);
        }

        // 2. Kilometraje Transparente
        const winMil = parseMileage(winner.mileage);
        const runMil = parseMileage(runnerUp.mileage);

        if (winMil !== 999999 && runMil === 999999) {
            const milDisp = typeof window.useMileageFormatterHook === 'function' ? window.useMileageFormatterHook(winner.mileage) : winner.mileage;
            reasons.push(`🚗 <strong>Kilometraje Registrado:</strong> Publica de forma transparente su millaje real (${milDisp}), a diferencia de otras opciones que ocultan sus millas (S/N).`);
        } else if (winMil !== 999999 && runMil !== 999999 && winMil < runMil) {
            const milDisp = typeof window.useMileageFormatterHook === 'function' ? window.useMileageFormatterHook(winner.mileage) : winner.mileage;
            reasons.push(`⏱️ <strong>Menor Desgaste:</strong> Cuenta con un kilometraje mejor conservado (${milDisp}) frente a las alternativas guardadas.`);
        }

        // 3. Ahorro de Precio
        if (!isPriceATratar(winner) && !isPriceATratar(runnerUp)) {
            const rate = parseFloat(localStorage.getItem('revista_exchange_rate')) || 17;
            const getPriceMXN = (c) => {
                const raw = parsePrice(c.price);
                const curr = (c.currency || '').toLowerCase();
                if (curr.includes('dll') || curr.includes('usd') || curr.includes('dls')) return raw * rate;
                return raw;
            };

            const winPriceMXN = getPriceMXN(winner);
            const runPriceMXN = getPriceMXN(runnerUp);

            if (winPriceMXN > 0 && runPriceMXN > 0 && winPriceMXN < runPriceMXN) {
                const diffUSD = Math.round((runPriceMXN - winPriceMXN) / rate);
                if (diffUSD > 100) {
                    reasons.push(`💵 <strong>Ahorro Directo:</strong> Te ahorra aproximadamente $${diffUSD.toLocaleString('en-US')} USD directo en el precio de compra frente a las otras opciones.`);
                }
            }
        } else if (isPriceATratar(winner)) {
            reasons.push(`💬 <strong>Precio a Tratar:</strong> Su precio requiere negociación directa con el vendedor.`);
        }

        // 4. Mecánica y Refacciones
        const winMech = getMechanicSummary(winner);
        if (winMech.includes('Fácil') || winMech.includes('económicas')) {
            reasons.push(`🛠️ <strong>Mantenimiento Económico:</strong> Sus refacciones y piezas se consiguen fácil en refaccionarias locales y cualquier mecánico lo repara sin cobrar caro.`);
        }

        // 5. Año del Modelo
        if (winner.year > runnerUp.year) {
            reasons.push(`📅 <strong>Modelo Más Reciente:</strong> Destaca por ser año ${winner.year}, lo que le otorga mayor vida útil y mejor valor de reventa.`);
        }

        // Si no hubo suficientes razones específicas, agregar balance general
        if (reasons.length === 0) {
            reasons.push(`⭐ <strong>Excelente Configuración:</strong> Destaca por ser la opción más equilibrada entre precio, año y conservación general.`);
        }

        const reasonsHTML = reasons.map(r => `<div style="margin-bottom: 8px; font-size: 0.93rem; line-height: 1.45; color: var(--text-main);">${r}</div>`).join('');

        return `
        <div class="asesor-box" style="margin-bottom: 24px; padding: 20px; background: rgba(2, 132, 199, 0.1); border: 1px solid var(--primary-color); border-radius: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: var(--primary-color); font-weight: bold; font-size: 0.95rem;">
                <span class="material-symbols-rounded">psychology</span>
                EL VEREDICTO DE TU ASESOR REVISTAUTO
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
                <h4 style="color: #f59e0b; margin-bottom: 12px; font-size: 1rem; text-transform: uppercase;">🥇 GANADOR DEFINITIVO DE TUS FAVORITOS</h4>
                <img src="${pWin.thumb}" style="width: 100%; max-width: 300px; height: 180px; object-fit: cover; border-radius: 12px; border: 2px solid #f59e0b; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='${pWin.original}';}else{this.src='https://placehold.co/400x300/1e293b/38bdf8?text=Sin+Foto';}">
                <h3 style="margin-top: 12px; font-size: 1.4rem;">${winner.make} ${winner.model} ${winner.year}</h3>
                <div style="font-size: 1.6rem; font-weight: bold; color: var(--primary-color);">${window.usePriceFormatterHook ? window.usePriceFormatterHook(winner) : winner.price}</div>
            </div>
            
            <div class="asesor-text" style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px;">
                <p style="margin-bottom: 12px; font-size: 1rem;"><strong>💡 ¿Por qué es tu mejor opción?</strong></p>
                ${reasonsHTML}
                <p style="margin-top: 12px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px;">👉 <em>Es la opción más equilibrada y la que mejor cuidará tu inversión de todas las guardadas.</em></p>
            </div>
            
            <button class="success-btn" style="width: 100%; margin-top: 20px; padding: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 1.1rem; font-weight: bold; border-radius: 20px;" onclick="document.getElementById('modal-comparador').classList.remove('active'); window.contactSeller('${winner.id}')">
                <span class="material-symbols-rounded" style="font-size: 24px;">chat</span> Mandar WhatsApp al Vendedor
            </button>
            
            <hr style="border-color: rgba(255,255,255,0.05); margin: 24px 0;">
            <div style="display: flex; align-items: center; gap: 12px; opacity: 0.8;">
                <div style="font-size: 2rem;">🥈</div>
                <div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">2do Lugar (Opción Alternativa)</div>
                    <div style="font-weight: 700;">${runnerUp.make} ${runnerUp.model} ${runnerUp.year} • <span style="color: var(--primary-color);">${window.usePriceFormatterHook ? window.usePriceFormatterHook(runnerUp) : runnerUp.price}</span></div>
                </div>
            </div>
        </div>
        `;
    }

    const cat1 = getVehicleCategory(winner);
    const cat2 = getVehicleCategory(runnerUp);

    let categoryAdvice = '';
    if (cat1 !== cat2) {
        categoryAdvice = ` ⚠️ <em>Nota del Asesor: Estás comparando dos tipos de vehículos distintos (${cat1} vs ${cat2}). Recuerda que cumplen propósitos diferentes.</em>`;
    }

function getMechanicAdvice(c1, c2) {
    const m1 = getMechanicSummary(c1);
    const m2 = getMechanicSummary(c2);

    const name1 = getCarDisplayName(c1, c2);
    const name2 = getCarDisplayName(c2, c1);

    let text = '';
    if (m1.includes('Fácil') && !m2.includes('Fácil')) {
        text = `El <strong>${name1}</strong> lleva clara ventaja porque cualquier taller le mete mano fácilmente y sus piezas/refacciones son muy económicas en las refaccionarias locales.`;
    } else if (!m1.includes('Fácil') && m2.includes('Fácil')) {
        text = `Ojo con el taller, el <strong>${name2}</strong> será mucho más económico y sencillo de mantener a largo plazo que el <strong>${name1}</strong>.`;
    } else if (m1.includes('premium') || m2.includes('premium')) {
        const prem = m1.includes('premium') ? c1 : c2;
        const other = m1.includes('premium') ? c2 : c1;
        const premName = getCarDisplayName(prem, other);
        text = `Ten en cuenta que el <strong>${premName}</strong> es de gama premium, lo que implica mano de obra especializada y refacciones más costosas o por encargo.`;
    } else {
        text = `Ambos cuentan con motores conocidos y refacciones comerciales accesibles.`;
    }

    return `<br><br>🛠️ <strong>Mantenimiento y Piezas Mecánicas:</strong><br>• ${text}`;
}

    const priceAdvantage = getPriceComparison(winner, runnerUp);
    const legalAdvantage = getLegalStatusAnalysis(winner, runnerUp);
    const engineAdvantage = getEngineComparison(winner, runnerUp);
    const mechAdvantage = getMechanicAdvice(winner, runnerUp);

    const getIntroPrefix = (c) => {
        if (c === 'vehículo') return 'ambos vehículos';
        if (c === 'tractocamión') return 'ambos tractocamiones';
        if (c === 'camioneta') return 'ambas camionetas';
        if (c === 'motocicleta') return 'ambas motocicletas';
        if (c === 'embarcación') return 'ambas embarcaciones';
        return `ambos ${c}s`;
    };
    const introPrefix = cat1 === cat2 ? getIntroPrefix(cat1) : 'ambas opciones';

    const getHumanIntroPhrase = (prefix, w, r) => {
        const phrases = [
            `Revisando ${prefix} detalladamente para darte la mejor recomendación:`,
            `Poniendo ${prefix} sobre la balanza para ver cuál cuida mejor tu inversión:`,
            `Examinando número por número ${prefix} para ayudarte a tomar la mejor decisión:`,
            `Analizando a fondo los pros y contras de ${prefix}:`,
            `Evaluando año, precio y estatus legal de ${prefix} para guiar tu compra:`,
            `Haciendo un diagnóstico completo de ${prefix} para que hagas la mejor elección:`
        ];
        const strKey = (w.id || w.model || '') + (r.id || r.model || '');
        let hash = 0;
        for (let i = 0; i < strKey.length; i++) {
            hash = (hash + strKey.charCodeAt(i));
        }
        return phrases[hash % phrases.length];
    };

    const humanIntro = getHumanIntroPhrase(introPrefix, winner, runnerUp);

    return `
    <div class="asesor-box" style="margin-bottom: 24px; padding: 16px; background: rgba(2, 132, 199, 0.1); border: 1px solid var(--primary-color); border-radius: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: var(--primary-color); font-weight: bold; font-size: 0.95rem;">
            <span class="material-symbols-rounded">psychology</span>
            CONSEJO DEL ASESOR AMIGO
        </div>
        <div class="asesor-text" style="font-size: 0.95rem; line-height: 1.5; color: var(--text-main);">
            ${humanIntro}${categoryAdvice}${priceAdvantage}${legalAdvantage}${engineAdvantage}${mechAdvantage}
        </div>
    </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof useSmartComparatorHook === 'function') {
            useSmartComparatorHook();
        }
        
        const rateInput = document.getElementById('admin-exchange-rate');
        if (rateInput) {
            const savedRate = localStorage.getItem('revista_exchange_rate') || '17';
            rateInput.value = savedRate;
            rateInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (val > 0) {
                    localStorage.setItem('revista_exchange_rate', val);
                }
            });
        }
    }, 500);
});
