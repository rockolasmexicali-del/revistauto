document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let savedListingsIds = JSON.parse(localStorage.getItem('revista_autos_saved') || '[]');
    let currentFeedCategory = 'Todos';

    // --- DOM Elements ---
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    
    // Feed
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
    
    // Form Selects
    const formType = document.getElementById('form-type');
    const formMake = document.getElementById('form-make');
    const formModel = document.getElementById('form-model');
    const formState = document.getElementById('form-state');
    const formCity = document.getElementById('form-city');
    const formPhone = document.getElementById('form-phone');
    const formWhatsApp = document.getElementById('form-whatsapp');
    const formEngine = document.getElementById('form-engine');
    const formTransmission = document.getElementById('form-transmission');
    const formAc = document.getElementById('form-ac');
    const formMileage = document.getElementById('form-mileage');
    const formLegal = document.getElementById('form-legal');
    let whatsappModified = false;
    let selectedImageFiles = [];
    
    // Filter Selects
    const filterState = document.getElementById('filter-state');
    const filterCity = document.getElementById('filter-city');
    const filterMinYear = document.getElementById('filter-min-year');
    const filterMaxYear = document.getElementById('filter-max-year');
    const filterTransmission = document.getElementById('filter-transmission');
    const filterLegal = document.getElementById('filter-legal');

    // Admin Dashboard
    const adminDashboardModal = document.getElementById('admin-dashboard-modal');
    const btnCloseDashboard = document.getElementById('btn-close-dashboard');
    const btnAdminAddListing = document.getElementById('btn-admin-add-listing');
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    const dashboardViews = document.querySelectorAll('.dashboard-view');

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
    
    window.showAlert = function(message, title = 'Notificación', icon = 'info') {
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
        if(customAlertTimeout) clearTimeout(customAlertTimeout);
        customAlertTimeout = setTimeout(() => {
            customAlertModal.classList.remove('active');
        }, 9000); // Se cierra en 9 segundos
    };
    let isExiting = false;

    const btnCustomAlertOk = document.getElementById('btn-custom-alert-ok');
    if (btnCustomAlertOk) {
        btnCustomAlertOk.addEventListener('click', () => {
            customAlertModal.classList.remove('active');
            if(customAlertTimeout) clearTimeout(customAlertTimeout);
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
        constructor(selectElement) {
            this.select = selectElement;
            this.options = [];
            
            // Ocultar select original
            this.select.style.display = 'none';
            
            // Crear contenedor
            this.wrapper = document.createElement('div');
            this.wrapper.className = 'custom-select-wrapper';
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
            });
        }
        
        update() {
            this.dropdown.innerHTML = '';
            const selectedOpt = this.select.options[this.select.selectedIndex];
            this.trigger.innerHTML = `<span>${selectedOpt ? selectedOpt.text : 'Selecciona una opción'}</span><span class="material-symbols-rounded">expand_more</span>`;
            
            Array.from(this.select.options).forEach(option => {
                const optDiv = document.createElement('div');
                optDiv.className = 'custom-select-option';
                optDiv.textContent = option.text;
                optDiv.dataset.value = option.value;
                
                if (option.disabled) {
                    optDiv.classList.add('disabled');
                } else {
                    optDiv.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.select.value = option.value;
                        this.trigger.innerHTML = `<span>${option.text}</span><span class="material-symbols-rounded">expand_more</span>`;
                        this.dropdown.classList.remove('open');
                        this.trigger.classList.remove('open');
                        
                        // Disparar change para el resto del sistema
                        this.select.dispatchEvent(new Event('change'));
                        
                        // Actualizar selección visual
                        Array.from(this.dropdown.children).forEach(c => c.classList.remove('selected'));
                        optDiv.classList.add('selected');
                    });
                }
                
                if (this.select.value === option.value && !option.disabled) {
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
    let globalMpEnabled = false;
    let globalMpPublicKey = '';

    async function loadSettings() {
        try {
            const data = await db.getSettings();
            if (data.success && data.settings) {
                globalMonthlyPrice = data.settings.monthlyPrice;
                globalMpEnabled = data.settings.mercadoPagoEnabled;
                globalMpPublicKey = data.settings.mpPublicKey;
                
                const costDisclaimer = document.getElementById('monthly-cost-disclaimer');
                if (costDisclaimer) {
                    costDisclaimer.innerHTML = `* Costo de publicación: <strong>$${globalMonthlyPrice.toFixed(2)} MXN</strong> por mes completo (30 días desde la fecha de aprobación).`;
                }

                const inputPrice = document.getElementById('admin-monthly-price');
                if (inputPrice) inputPrice.value = globalMonthlyPrice;

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
            }
        } catch (e) { console.error('Error loading settings', e); }
    }

    window.getListingPaymentInfo = function(listing, isRenewalTab = false) {
        // Rolling billing: siempre se cobra 1 mes completo al precio configurado.
        // La fecha de vencimiento es exactamente 1 mes después del pago (ej: 27/julio → 27/agosto).
        // No hay prorrateo por días del mes.
        let calculatedPrice = 0;
        let textDesc = '';

        if (globalMonthlyPrice === 0) {
            textDesc = 'Total a pagar: Gratis';
        } else if (isRenewalTab) {
            calculatedPrice = globalMonthlyPrice;
            const formattedPrice = calculatedPrice.toFixed(2);
            textDesc = `Total a pagar por renovación: $${formattedPrice} MXN`;
        } else {
            calculatedPrice = globalMonthlyPrice;
            const formattedPrice = calculatedPrice.toFixed(2);
            textDesc = `Total a pagar: $${formattedPrice} MXN (1 mes)`;
        }
        return {
            calculatedPrice,
            textDesc
        };
    };

    // Initial local render
    populateHomeCategories();
    renderFeed();
    if (typeof updateAdminStats === 'function') updateAdminStats();
    if (typeof updateAdminApprovals === 'function') updateAdminApprovals();

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
    window.onServerDataSynced = function() {
        renderFeed();
        if (typeof updateAdminStats === 'function') updateAdminStats();
        if (typeof updateAdminApprovals === 'function') updateAdminApprovals();
        if (typeof renderAdminInventory === 'function') renderAdminInventory();
    };


    // --- Core Functions ---

    function initNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
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
                    if(view.id === targetViewId) {
                        view.classList.add('active');
                    }
                });

                // Trigger specific logic per view
                if (targetViewId === 'view-inicio') renderFeed();
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
                    if(view.id === 'view-alta') {
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
            if (data.success) {
                // Adaptar el nuevo formato map al antiguo
                const states = Object.keys(data.locations);
                window.activeLocations = { states: states, citiesByState: data.locations };
            } else {
                window.activeLocations = { states: [], citiesByState: {} };
            }
        } catch (e) {
            console.error('Error fetching active locations', e);
            window.activeLocations = { states: [], citiesByState: {} };
        }

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
        });
        if(formState.value && formState.value !== "") formState.dispatchEvent(new Event('change'));

        // Feed State changes -> updates selectedCities to all cities in that state
        userStateSelect.addEventListener('change', (e) => {
            const state = e.target.value;
            if (state === 'Todos') {
                selectedCities = [];
            } else {
                selectedCities = [...(window.activeLocations.citiesByState[state] || [])];
                // Reset text just in case it had a city appended
                const option = Array.from(userStateSelect.options).find(opt => opt.value === state);
                if(option) option.textContent = state;
            }
            // Al cambiar de estado, resetear el botón de ciudades
            if (window.updateCitiesBtn) window.updateCitiesBtn();
            renderFeed();
        });

        function applyDetectedLocation(stateName, cityName, isManualClick = false) {
            if (!stateName) return;
            const matchedState = window.activeLocations.states.find(s => s.toLowerCase() === stateName.toLowerCase() || stateName.toLowerCase().includes(s.toLowerCase()));
            if (matchedState) {
                const stateCities = window.activeLocations.citiesByState[matchedState] || [];
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
                
                filterState.value = matchedState;
                filterState.dispatchEvent(new Event('change'));
                if (matchedCity) {
                    filterCity.value = matchedCity;
                }
                if (window.customFilterStateSelect) window.customFilterStateSelect.update();
                if (window.customFilterCitySelect) window.customFilterCitySelect.update();

                renderFeed();
                
                // Guardar en caché local
                localStorage.setItem('revista_last_location', JSON.stringify({ state: stateName, city: cityName }));
            } else if (isManualClick) {
                // Si la ciudad no tiene autos activos, lo dejamos en "Todos"
                userStateSelect.value = 'Todos';
                filterState.value = 'Todos';
                filterState.dispatchEvent(new Event('change'));
                if (window.customUserFilterStateSelect) window.customUserFilterStateSelect.update();
                if (window.customFilterStateSelect) window.customFilterStateSelect.update();
                renderFeed();
            }
        }

        function detectUserLocation(isManualClick = false) {
            if (!("geolocation" in navigator)) {
                if (isManualClick) showAlert('Tu navegador no soporta geolocalización.', 'Error', 'error');
                return;
            }

            if (btnLocateMe) {
                btnLocateMe.innerHTML = '<span class="material-symbols-rounded" style="animation: spin 1s linear infinite;">refresh</span>';
            }

            // Opciones optimizadas de GPS
            const options = {
                enableHighAccuracy: false,
                maximumAge: 300000,
                timeout: 5000
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
                        
                        applyDetectedLocation(stateName, cityName, isManualClick);
                    }
                } catch (e) {
                    console.error('Error detectando ubicación:', e);
                } finally {
                    if (btnLocateMe) btnLocateMe.innerHTML = '<span class="material-symbols-rounded">location_on</span>';
                }
            }, () => {
                if (isManualClick) showAlert('Permiso de ubicación denegado o no disponible.', 'Ubicación', 'warning');
                if (btnLocateMe) btnLocateMe.innerHTML = '<span class="material-symbols-rounded">location_on</span>';
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
                applyDetectedLocation(cachedLocation.state, cachedLocation.city, false);
            } catch (e) { }
        }
        
        // 2. Validación en segundo plano (GPS ultra rápido)
        setTimeout(() => detectUserLocation(false), 500);

        const formCustomMake = document.getElementById('form-custom-make');
        const formCustomModel = document.getElementById('form-custom-model');

        // Populating makes
        catalogData.makes.forEach(make => {
            formMake.innerHTML += `<option value="${make}">${make}</option>`;
        });
        formMake.innerHTML += `<option value="Otros">Otros...</option>`;

        // Populating types
        catalogData.types.forEach(type => {
            formType.innerHTML += `<option value="${type}">${type}</option>`;
        });
        formType.innerHTML += `<option value="Otros">Otros...</option>`;

        // Populating colors
        const formColor = document.getElementById('form-color');
        if(formColor) {
            catalogData.colors.forEach(color => {
                formColor.innerHTML += `<option value="${color}">${color}</option>`;
            });
        }

        const filterColor = document.getElementById('filter-color');
        if(filterColor) {
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
        formType.addEventListener('change', (e) => {
            if (e.target.value === 'Otros') {
                if(formCustomType) {
                    formCustomType.style.display = 'block';
                    formCustomType.required = true;
                }
            } else {
                if(formCustomType) {
                    formCustomType.style.display = 'none';
                    formCustomType.required = false;
                    formCustomType.value = '';
                }
            }
        });

        // Dynamic models based on make (for form)
        formMake.addEventListener('change', (e) => {
            const make = e.target.value;
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

                if (catalogData.modelsByMake[make]) {
                    catalogData.modelsByMake[make].forEach(model => {
                        formModel.innerHTML += `<option value="${model}">${model}</option>`;
                    });
                } else {
                    formModel.innerHTML = '<option value="" disabled selected>No hay modelos definidos</option>';
                }
                formModel.innerHTML += `<option value="Otros">Otros...</option>`;
            }
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
        
        // Trigger change to set initial models if make is pre-selected (but not placeholder)
        if(formMake.value && formMake.value !== "") formMake.dispatchEvent(new Event('change'));

        // === INICIALIZACIÓN DE CUSTOM SELECTS ===
        window.customStateSelect = new CustomSelectWrapper(formState);
        window.customCitySelect = new CustomSelectWrapper(formCity);
        window.customMakeSelect = new CustomSelectWrapper(formMake);
        window.customModelSelect = new CustomSelectWrapper(formModel);
        window.customTypeSelect = new CustomSelectWrapper(formType);
        window.customTransmissionSelect = new CustomSelectWrapper(formTransmission);
        window.customAcSelect = new CustomSelectWrapper(formAc);
        window.customLegalSelect = new CustomSelectWrapper(formLegal);
        window.customUserFilterStateSelect = new CustomSelectWrapper(userStateSelect);
        window.customFilterStateSelect = new CustomSelectWrapper(filterState);
        window.customFilterCitySelect = new CustomSelectWrapper(filterCity);
        window.customFilterTransmissionSelect = new CustomSelectWrapper(filterTransmission);
        window.customFilterLegalSelect = new CustomSelectWrapper(filterLegal);
        
        const formColorEl = document.getElementById('form-color');
        if(formColorEl) window.customColorSelect = new CustomSelectWrapper(formColorEl);
        
        const filterColorEl = document.getElementById('filter-color');
        if(filterColorEl) window.customFilterColorSelect = new CustomSelectWrapper(filterColorEl);

        // Actualizar visualmente al cambiar los selects dinámicos
        formState.addEventListener('change', () => { if(window.customCitySelect) window.customCitySelect.update(); });
        formMake.addEventListener('change', () => { if(window.customModelSelect) window.customModelSelect.update(); });
        filterState.addEventListener('change', () => { if(window.customFilterCitySelect) window.customFilterCitySelect.update(); });

        // Phone to WhatsApp auto-fill logic
        formPhone.addEventListener('input', (e) => {
            if (!whatsappModified) {
                let v = e.target.value.replace(/[^0-9]/g, '');
                formWhatsApp.value = v ? '+52 ' + v : '';
            }
        });
        formWhatsApp.addEventListener('input', () => {
            whatsappModified = true;
        });

        window.renderImagePreviews = function() {
            const container = document.getElementById('image-preview-container');
            const textElement = document.getElementById('file-chosen-text');
            if(!container) return;
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
                
                const actions = document.createElement('div');
                actions.className = 'image-preview-actions';
                const btnRemove = document.createElement('button');
                btnRemove.className = 'preview-btn';
                btnRemove.type = 'button';
                btnRemove.style.color = 'var(--danger-color)';
                btnRemove.innerHTML = '<span class="material-symbols-rounded">delete</span>';
                btnRemove.onclick = () => {
                    const idxToRemove = Array.from(container.children).indexOf(item);
                    if (idxToRemove > -1) {
                        selectedImageFiles.splice(idxToRemove, 1);
                        item.remove();
                        
                        Array.from(container.children).forEach((child, i) => {
                            const badge = child.querySelector('.preview-badge');
                            if (badge) badge.textContent = i + 1;
                        });
                        
                        if (textElement) {
                            if (selectedImageFiles.length === 0) {
                                textElement.textContent = 'Sin archivos seleccionados';
                                textElement.style.color = 'var(--text-muted)';
                            } else {
                                textElement.textContent = `${selectedImageFiles.length} foto(s) lista(s)`;
                            }
                        }
                        if(typeof updateWizardUI === 'function') updateWizardUI();
                    }
                };
                
                actions.appendChild(btnRemove);
                
                const badge = document.createElement('div');
                badge.className = 'preview-badge';
                badge.textContent = index + 1;
                
                item.appendChild(img);
                item.appendChild(actions);
                item.appendChild(badge);
                container.appendChild(item);
            });
            if(typeof updateWizardUI === 'function') updateWizardUI();
        };

        // Init SortableJS
        if (typeof Sortable !== 'undefined') {
            Sortable.create(document.getElementById('image-preview-container'), {
                animation: 150,
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                onEnd: function(evt) {
                    if (evt.oldIndex === evt.newIndex) return;
                    const movedItem = selectedImageFiles.splice(evt.oldIndex, 1)[0];
                    selectedImageFiles.splice(evt.newIndex, 0, movedItem);
                    
                    // Actualizar números sin recargar el DOM para evitar parpadeos
                    const container = document.getElementById('image-preview-container');
                    Array.from(container.children).forEach((child, i) => {
                        const badge = child.querySelector('.preview-badge');
                        if (badge) badge.textContent = i + 1;
                    });
                }
            });
        }

        document.getElementById('form-image').addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                let newFiles = Array.from(this.files).map(f => ({ file: f, url: URL.createObjectURL(f) }));
                const slotsLeft = 7 - selectedImageFiles.length;
                if (slotsLeft <= 0) {
                    showAlert('Has alcanzado el límite máximo de 7 fotos.', 'Límite alcanzado', 'warning');
                } else {
                    if (newFiles.length > slotsLeft) {
                        showAlert(`Solo se pueden subir 7 fotos en total. Se omitieron ${newFiles.length - slotsLeft} foto(s).`, 'Límite de fotos', 'warning');
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
            formImageCamera.addEventListener('change', function() {
                if (this.files && this.files.length > 0) {
                    if (selectedImageFiles.length >= 7) {
                        showAlert('Has alcanzado el límite máximo de 7 fotos.', 'Límite alcanzado', 'warning');
                        this.value = '';
                        return;
                    }
                    
                    const newFiles = Array.from(this.files).map(f => ({ file: f, url: URL.createObjectURL(f) }));
                    selectedImageFiles.push(newFiles[0]); // Normalmente la cámara toma 1 sola foto
                    renderImagePreviews();
                    
                    if (selectedImageFiles.length >= 7) {
                        showAlert('Has llegado al límite de 7 fotos. Esta es la última foto.', 'Límite alcanzado', 'info');
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
        }
        window.updateCitiesBtn = updateCitiesBtn;

        btnUserCities.addEventListener('click', () => {
            const state = userStateSelect.value;
            if (state === 'Todos') {
                showAlert('Por favor selecciona un Estado primero para ver sus ciudades.', 'Filtro Incompleto', 'warning');
                return;
            }
            
            const stateCities = window.activeLocations.citiesByState[state] || [];
            // Generar opción "Todas" + checkboxes de ciudades
            citiesCheckboxesContainer.innerHTML = `
                <label class="custom-checkbox">
                    <input type="checkbox" value="__todas__" ${selectedCities.length === stateCities.length ? 'checked' : ''} id="cb-todas-ciudades">
                    <span><strong>Todos los estados</strong></span>
                </label>
            ` + stateCities.map(city => `
                <label class="custom-checkbox">
                    <input type="checkbox" value="${city}" ${selectedCities.includes(city) ? 'checked' : ''}>
                    <span>${city}</span>
                </label>
            `).join('');

            // Lógica del checkbox "Todas"
            const cbTodas = citiesCheckboxesContainer.querySelector('#cb-todas-ciudades');
            cbTodas.addEventListener('change', () => {
                citiesCheckboxesContainer.querySelectorAll('input[type="checkbox"]:not(#cb-todas-ciudades)').forEach(cb => {
                    cb.checked = cbTodas.checked;
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
            renderFeed();
        });
    }

    function updateStateSelectLabel(state) {
        if (state === 'Todos') return;
        const option = Array.from(userStateSelect.options).find(opt => opt.value === state);
        if (option) {
            // Restore default states first
            Array.from(userStateSelect.options).forEach(opt => {
                if (opt.value !== 'Todos') opt.textContent = opt.value;
            });
            // Update selected one if it's just 1 city
            if (selectedCities.length === 1) {
                option.textContent = `${state} / ${selectedCities[0]}`;
            }
        }
    }

    function getSortedCategoriesByPopularity() {
        let listings = db.getAllListings().filter(l => db.isListingActive(l));
        
        // Filtrar por ciudad para que la popularidad sea hiper-local
        if (selectedCities.length > 0) {
            listings = listings.filter(l => selectedCities.includes(l.city));
        }

        const viewCounts = {};
        listings.forEach(l => {
            if (!viewCounts[l.type]) viewCounts[l.type] = 0;
            viewCounts[l.type] += (l.views || 0);
        });

        const sortedTypes = catalogData && catalogData.types ? [...catalogData.types] : [];
        sortedTypes.sort((a, b) => {
            const viewsA = viewCounts[a] || 0;
            const viewsB = viewCounts[b] || 0;
            return viewsB - viewsA; // Mayor a menor
        });
        return sortedTypes;
    }

    function populateHomeCategories() {
        // Limpiar categorías previas por si se vuelve a llamar
        const existingChips = homeCategories.querySelectorAll('.category-chip:not([data-type="Todos"])');
        existingChips.forEach(chip => chip.remove());

        const smartCategories = getSortedCategoriesByPopularity();
        smartCategories.forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'category-chip';
            btn.setAttribute('data-type', type);
            btn.textContent = type;
            if (type === currentFeedCategory) {
                btn.classList.add('active');
            }
            homeCategories.appendChild(btn);
        });
        
        const todosBtn = homeCategories.querySelector('.category-chip[data-type="Todos"]');
        if (todosBtn) {
            if (currentFeedCategory === 'Todos') todosBtn.classList.add('active');
            else todosBtn.classList.remove('active');
        }
    }

        // Event delegation para hacer que funcione tanto en los nuevos botones como en el 'Todos' original
        homeCategories.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-chip');
            if (!btn) return;

            // Remover clase active de todos y asignarla al clickeado
            document.querySelectorAll('#home-categories .category-chip').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            
            // Actualizar el feed
            currentFeedCategory = btn.getAttribute('data-type');
            renderFeed();

            // Mover el botón clickeado hacia el centro de la vista
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });

    function createListingCardHTML(listing, hideHeart = false) {
        const isSaved = savedListingsIds.includes(listing.id);
        const savedClass = isSaved ? 'saved' : '';
        const savedIcon = isSaved ? 'favorite' : 'favorite_border';
        
        const images = listing.images || (listing.image ? [listing.image] : ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80']);
        // Solo tomar la primera foto para la tarjeta de previsualización (evitar scroll doble)
        const firstImage = images[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80';
        const imageElements = `<img src="${firstImage}" alt="Auto" loading="lazy">`;
        
        let navArrows = '';

        return `
            <div class="card" style="cursor: pointer;" onclick="if(!event.target.closest('.card-save-btn')) openListingDetails(${listing.id})">
                <div class="card-img-wrapper">
                    <div class="card-img-carousel" style="overflow-x: hidden;">
                        ${imageElements}
                    </div>
                    ${navArrows}
                    <button class="card-save-btn ${savedClass}" style="${(hideHeart && !isSaved) ? 'display: none;' : ''}" onclick="event.stopPropagation(); window.toggleSave(${listing.id}, this)">
                        <span class="material-symbols-rounded" style="font-variation-settings: 'FILL' ${isSaved ? '1' : '0'};">${savedIcon}</span>
                    </button>
                </div>
                <div class="card-content">
                    <h4 class="card-title">${(listing.title || `${listing.make} ${listing.model} ${listing.year}`).replace(listing.year, '').replace(/\s+/g, ' ').trim()}</h4>
                    <p class="card-price">$${listing.price.toLocaleString('es-MX')}</p>
                    <div class="card-meta">
                        <span>${listing.year}</span>
                        <span><span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle; margin-right:2px; margin-top:-2px;">location_on</span>${listing.city}</span>
                    </div>
                </div>
            </div>
        `;
    }

    window.updateCounter = function(element) {
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

    window.scrollCarousel = function(e, btn, direction) {
        e.stopPropagation();
        const wrapper = btn.parentElement;
        const carousel = wrapper.querySelector('.detalle-img-carousel') || wrapper.querySelector('.card-img-carousel');
        if (carousel) {
            const scrollAmount = carousel.clientWidth;
            carousel.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
        }
    };

    window.scrollNetflixRow = function(e, btn, direction) {
        e.stopPropagation();
        const row = btn.parentElement;
        const scrollContainer = row.querySelector('.netflix-row-scroll');
        if (scrollContainer) {
            const scrollAmount = Math.max(scrollContainer.clientWidth * 0.8, 150);
            scrollContainer.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
        }
    };

    window.updateNetflixNav = function(scrollContainer) {
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
                // Extraer los siguientes 15 autos
                const nextBatch = rowData.allListings.slice(rowData.renderedCount, rowData.renderedCount + 15);
                const newCardsHTML = nextBatch.map(l => createListingCardHTML(l, true)).join('');
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

    function renderFeed() {
        // Actualizar el menú de botones superiores (chips) basado en la ciudad actual
        populateHomeCategories();

        // get a bunch of listings, filter by type if needed
        let listings = db.getAllListings().filter(l => db.isListingActive(l));
        
        if (selectedCities.length > 0) listings = listings.filter(l => selectedCities.includes(l.city));
        
        if (currentFeedCategory !== 'Todos') {
            feedContainer.classList.add('listings-grid');
            listings = listings.filter(l => l.type === currentFeedCategory);
            
            // shuffle for randomness
            listings.sort(() => 0.5 - Math.random());
            // Removemos el límite de 10 para que en la cuadrícula puedan ver todos los de esa categoría
            
            if (listings.length === 0) {
                feedContainer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; min-height: 40vh; width: 100%;">
                        <h2 style="color: var(--text-muted); text-align: center; font-size: 1.8rem; font-weight: 600; line-height: 1.4; opacity: 0.6;">
                            No se encontraron<br>vehículos en esta<br>zona.
                        </h2>
                    </div>`;
                return;
            }
            feedContainer.innerHTML = listings.map(l => createListingCardHTML(l, true)).join('');
        } else {
            feedContainer.classList.remove('listings-grid');
            
            // Group by category
            const grouped = {};
            listings.forEach(l => {
                if (!grouped[l.type]) grouped[l.type] = [];
                grouped[l.type].push(l);
            });
            
            let html = '';
            
            // Inicializar el almacenamiento para lazy loading
            window.netflixRowData = {};
            
            // Use smart order based on popularity
            const order = getSortedCategoriesByPopularity();
            
            order.forEach(type => {
                if (grouped[type] && grouped[type].length > 0) {
                    let rowListings = grouped[type];
                    // Aleatorizar los autos para ser parejo con todos
                    rowListings.sort(() => 0.5 - Math.random());
                    
                    // Almacenar todos los autos de la categoría para lazy rendering
                    window.netflixRowData[type] = {
                        allListings: rowListings,
                        renderedCount: 15
                    };
                    
                    // Mostrar inicialmente solo 15 autos por carril horizontal para no saturar memoria
                    const initialListings = rowListings.slice(0, 15);

                    html += `
                    <div class="netflix-row" data-category="${type}">
                        <h3 class="netflix-row-title" onclick="document.querySelector('.category-chip[data-type=\\'${type}\\']').click()" style="cursor: pointer;">
                            ${type} <span class="material-symbols-rounded" style="font-size: 20px; color: var(--primary-color);">chevron_right</span>
                        </h3>
                        <button class="row-nav-btn prev hidden" onclick="scrollNetflixRow(event, this, -1)">
                            <span class="material-symbols-rounded">chevron_left</span>
                        </button>
                        <button class="row-nav-btn next" onclick="scrollNetflixRow(event, this, 1)">
                            <span class="material-symbols-rounded">chevron_right</span>
                        </button>
                        <div class="netflix-row-scroll" onscroll="updateNetflixNav(this)">
                            ${initialListings.map(l => createListingCardHTML(l, true)).join('')}
                        </div>
                    </div>
                    `;
                }
            });
            
            if (html === '') {
                feedContainer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; min-height: 40vh; width: 100%;">
                        <h2 style="color: var(--text-muted); text-align: center; font-size: 1.8rem; font-weight: 600; line-height: 1.4; opacity: 0.6;">
                            No se encontraron<br>vehículos en esta<br>zona.
                        </h2>
                    </div>`;
            } else {
                feedContainer.innerHTML = html;
                
                // Initialize nav buttons visibility after DOM update
                setTimeout(() => {
                    feedContainer.querySelectorAll('.netflix-row-scroll').forEach(scrollContainer => {
                        if(window.updateNetflixNav) window.updateNetflixNav(scrollContainer);
                    });
                }, 50);
            }
        }
    }

    window.toggleSave = function(id, btnElement) {
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
            if(biblio && biblio.classList.contains('active')) {
                try { renderSavedListings(); } catch(e) {}
            }
        } catch(err) {
            console.error('Error toggling save (card):', err);
        }
    };

    // --- History / Back Button Trap ---
    function initHistoryState() {
        history.replaceState({ page: 'root' }, '');
        history.pushState({ page: 'root' }, '');
        window.addEventListener('popstate', handlePopState);
    }

    function handlePopState(e) {
        if (isExiting) return;

        // 1. Check Modals
        if (citiesModal && citiesModal.style.display === 'flex') {
            citiesModal.style.display = 'none';
            history.pushState({ page: 'root' }, '');
            return;
        }
        if (newListingModal && newListingModal.style.display === 'flex') {
            newListingModal.style.display = 'none';
            history.pushState({ page: 'root' }, '');
            return;
        }
        if (adminDashboardModal && adminDashboardModal.style.display === 'flex') {
            adminDashboardModal.style.display = 'none';
            history.pushState({ page: 'root' }, '');
            return;
        }

        // 2. Check Detailed View
        if (viewDetalle && viewDetalle.classList.contains('active')) {
            closeListingDetails();
            history.pushState({ page: 'root' }, '');
            return;
        }

        // 3. User wants to exit
        if (exitModal) {
            exitModal.style.display = 'flex';
            history.pushState({ page: 'root' }, '');
        }
    }

    if (btnExitNo) {
        btnExitNo.addEventListener('click', () => {
            exitModal.style.display = 'none';
        });
    }

    if (btnExitYes) {
        btnExitYes.addEventListener('click', () => {
            isExiting = true;
            exitModal.style.display = 'none';
            history.back(); 
        });
    }

    // --- Search ---
    const searchInput = document.getElementById('search-input');
    const searchFiltersContainer = document.getElementById('search-filters-container');

    searchInput.addEventListener('focus', () => {
        if(searchFiltersContainer.style.height === '0px') {
            searchFiltersContainer.style.height = searchFiltersContainer.scrollHeight + 'px';
            searchFiltersContainer.style.opacity = '1';
            searchFiltersContainer.style.pointerEvents = 'auto';
            
            // Limpiar resultados anteriores y palabra de búsqueda
            searchResults.innerHTML = '';
            searchInput.value = '';

            // Resetear los filtros secundarios
            document.getElementById('filter-min-year').value = '';
            document.getElementById('filter-max-year').value = '';

            filterTransmission.value = 'Todas';
            if (window.customFilterTransmissionSelect) window.customFilterTransmissionSelect.update();

            filterLegal.value = 'Todas';
            if (window.customFilterLegalSelect) window.customFilterLegalSelect.update();

            const filterColorEl = document.getElementById('filter-color');
            if(filterColorEl) {
                filterColorEl.value = 'Todos';
                if(window.customFilterColorSelect) window.customFilterColorSelect.update();
            }

            // Resetear ubicación al GPS original
            filterState.value = userStateSelect.value;
            filterState.dispatchEvent(new Event('change'));
            if (selectedCities.length === 1) {
                filterCity.value = selectedCities[0];
            } else {
                filterCity.value = 'Todas';
            }
            if (window.customFilterStateSelect) window.customFilterStateSelect.update();
            if (window.customFilterCitySelect) window.customFilterCitySelect.update();

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

    btnSearch.addEventListener('click', () => {
        const queryText = searchInput.value.trim();
        
        if (!queryText) {
            showAlert('Por favor, escribe la Marca o Modelo que buscas (Ej. Nissan, Civic) antes de buscar.', 'Búsqueda Vacía', 'warning');
            return;
        }

        const stateVal = filterState.value;
        const cityVal = filterCity.value;
        
        let searchCities = [];
        if (stateVal === 'Todos') {
            searchCities = []; // No city filter
        } else if (cityVal === 'Todas') {
            searchCities = catalogData.citiesByState[stateVal] || [];
        } else {
            searchCities = [cityVal];
        }

        const filterColor = document.getElementById('filter-color');

        const criteria = {
            query: queryText,
            cities: searchCities,
            minYear: Number(filterMinYear.value) || null,
            maxYear: Number(filterMaxYear.value) || null,
            transmission: filterTransmission.value,
            legal: filterLegal.value,
            color: filterColor ? filterColor.value : 'Todos'
        };

        const results = db.search(criteria);
        
        if (results.length === 0) {
            // Mostrar modal temporal
            showAlert('Por el momento no contamos con vehículos que coincidan con tu búsqueda. ¡Intenta ajustando los filtros o seleccionando otra ciudad!', 'Sin inventario disponible', 'info');
            setTimeout(() => {
                document.getElementById('custom-alert-modal').classList.remove('active');
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
    });

    // --- Saved / Library ---
    function renderSavedListings() {
        const all = db.getAllListings();
        const saved = all.filter(l => savedListingsIds.includes(l.id) && l.status === 'autorizado');
        
        if (saved.length === 0) {
            savedListingsContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <span class="material-symbols-rounded">favorite_border</span>
                    <p>Aún no has guardado vehículos</p>
                </div>
            `;
            return;
        }
        savedListingsContainer.innerHTML = saved.map(l => createListingCardHTML(l, false)).join('');
    }

    // --- Detalles ---
    window.openListingDetails = function(id) {
        const allListings = db.getAllListings();
        const listing = allListings.find(l => l.id === id);
        if(!listing) return;

        // Incrementar vistas
        listing.views = (listing.views || 0) + 1;
        localStorage.setItem(db.listingsKey, JSON.stringify(allListings));
        updateStats();

        // Encontrar vista activa actual
        const activeView = Array.from(views).find(v => v.classList.contains('active') && v.id !== 'view-detalle');
        if(activeView) {
            previousViewId = activeView.id;
            // Guardamos el scroll de la ventana antes de ocultar la vista
            savedScrollPosition = window.scrollY || document.documentElement.scrollTop;
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

        detalleContent.innerHTML = `
            <div style="position: relative; width: 100%; border-radius: 0 0 16px 16px; overflow: hidden;">
                <div class="detalle-img-carousel" onscroll="updateCounter(this)">
                    ${imageElements}
                </div>
                ${navArrows}
                ${images.length > 1 ? `<div class="image-counter" style="position: absolute; bottom: 8px; right: 8px;">1 / ${images.length}</div>` : ''}
                
                <button id="detalle-heart-btn-${id}" class="detalle-floating-btn ${isSaved ? 'saved' : ''}" onclick="event.stopPropagation(); window.toggleSaveDetalle('${id}', this)" style="right: 16px; color: ${isSaved ? '#EF4444' : 'white'}; z-index: 10; transition: color 0.3s ease;">
                    <span class="material-symbols-rounded" style="font-variation-settings: 'FILL' ${isSaved ? '1' : '0'};">${isSaved ? 'favorite' : 'favorite_border'}</span>
                </button>
            </div>
            <div class="detalle-info">
                <h2 class="detalle-title">${listing.title}</h2>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 12px;">
                    <div class="detalle-price" style="margin-bottom: 0;">$${listing.price.toLocaleString('es-MX')}</div>
                    <button class="btn-contactar" onclick="window.contactSeller('${listing.id}')" style="margin-top: 0; padding: 10px 24px; font-size: 0.95rem; border-radius: 24px; flex-shrink: 0; width: auto;">
                        <span class="material-symbols-rounded" style="font-size: 18px;">chat</span> Contactar
                    </button>
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
                    <div class="detalle-item">
                        <span class="detalle-label">Año</span>
                        <span class="detalle-value">${listing.year}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Tipo</span>
                        <span class="detalle-value">${listing.type}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Motor</span>
                        <span class="detalle-value">${listing.engine || '-'}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Transmisión</span>
                        <span class="detalle-value">${listing.transmission || '-'}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Kilometraje</span>
                        <span class="detalle-value">${listing.mileage || '-'}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Situación</span>
                        <span class="detalle-value">${listing.legal || '-'}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">A/C</span>
                        <span class="detalle-value">${listing.ac || '-'}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Ciudad</span>
                        <span class="detalle-value">${listing.city}</span>
                    </div>
                    <div class="detalle-item" style="grid-column: 2 / span 2; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end;">
                        <span class="detalle-label" style="text-transform: uppercase;">Vistas</span>
                        <span class="detalle-value" style="font-size: 1.1rem; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                            <span class="material-symbols-rounded" style="font-size:18px;">visibility</span> ${listing.views}
                        </span>
                    </div>
                </div>
            </div>
        `;

        // Mostrar Vista
        views.forEach(v => v.classList.remove('active'));
        viewDetalle.classList.add('active');

        // Lógica de Swipe para navegar entre autos de la misma categoría
        const infoDiv = detalleContent.querySelector('.detalle-info');
        if (infoDiv) {
            let startX = 0;
            let endX = 0;

            infoDiv.addEventListener('touchstart', (e) => {
                startX = e.changedTouches[0].screenX;
            }, {passive: true});

            infoDiv.addEventListener('touchend', (e) => {
                // No activar si se tocó el botón de contactar u otros botones
                if (e.target.closest('button') || e.target.closest('.btn-contactar')) return;

                endX = e.changedTouches[0].screenX;
                
                const threshold = 50; // mínimo movimiento en píxeles
                if (endX < startX - threshold) {
                    // Swipe Izquierda -> Siguiente
                    navigateListing(1);
                } else if (endX > startX + threshold) {
                    // Swipe Derecha -> Anterior
                    navigateListing(-1);
                }
            }, {passive: true});

            const navigateListing = (direction) => {
                const sameCategoryListings = db.getAllListings().filter(l => l.status === 'autorizado' && l.type === listing.type);
                if (sameCategoryListings.length <= 1) return;
                
                const currentIndex = sameCategoryListings.findIndex(l => l.id === listing.id);
                if (currentIndex === -1) return;
                
                let nextIndex = currentIndex + direction;
                if (nextIndex >= sameCategoryListings.length) nextIndex = 0; // Vuelve al principio
                if (nextIndex < 0) nextIndex = sameCategoryListings.length - 1; // Va al final
                
                window.openListingDetails(sameCategoryListings[nextIndex].id);
            };
        }
    };

    window.closeListingDetails = function() {
        views.forEach(v => v.classList.remove('active'));
        const prev = document.getElementById(previousViewId);
        if(prev) {
            prev.classList.add('active');
            // Ya no llamamos a renderFeed() aquí para no perder el scroll ni el filtro actual
            if(previousViewId === 'view-biblioteca') renderSavedListings();
            
            // Restaurar el scroll
            requestAnimationFrame(() => {
                window.scrollTo(0, savedScrollPosition);
            });
        } else {
            document.getElementById('view-inicio').classList.add('active');
            requestAnimationFrame(() => {
                window.scrollTo(0, savedScrollPosition);
            });
        }
    };

    window.contactSeller = function(listingId) {
        const allListings = db.getAllListings();
        const listing = allListings.find(l => String(l.id) === String(listingId));
        if (listing) {
            let phone = listing.whatsapp || listing.phone || "5512345678";
            if (phone) {
                const cleanPhone = String(phone).replace(/[^0-9]/g, '');
                const message = encodeURIComponent(`Hola, vi tu anuncio "${listing.title}" en RevistAuto. Me interesa y quisiera más información.`);
                
                const btnCall = document.getElementById('btn-contact-call');
                const btnWhatsApp = document.getElementById('btn-contact-whatsapp');
                
                btnCall.onclick = () => {
                    window.open(`tel:${cleanPhone}`, '_self');
                    document.getElementById('contact-modal').classList.remove('active');
                };
                
                btnWhatsApp.onclick = () => {
                    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
                    document.getElementById('contact-modal').classList.remove('active');
                };
                
                document.getElementById('contact-modal').classList.add('active');
            } else {
                showAlert('El vendedor de este vehículo no ha registrado un número de contacto.', 'Sin Contacto', 'info');
            }
        }
    };

    window.toggleSaveDetalle = function(id, btnElement) {
        window.toggleSave(id, btnElement);
        const isSaved = savedListingsIds.includes(id);
        btnElement.style.color = isSaved ? 'var(--danger-color)' : 'var(--text-main)';
    };

    // --- My Listings (Alta) ---
    function renderMyListings() {
        const myListings = db.getMyListings();
        
        const statusPriority = {
            'pendiente autorizacion': 1,
            'autorizado': 2,
            'vendido': 3
        };
        
        myListings.sort((a, b) => (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99));
        
        if (myListings.length === 0) {
            myListingsContainer.innerHTML = '<p style="color:var(--text-muted); text-align:center;">No has publicado ningún vehículo.</p>';
            return;
        }

        myListingsContainer.innerHTML = myListings.map(listing => {
            const images = listing.images || (listing.image ? [listing.image] : []);
            const imgHTML = images.length > 0 ? images.map(img => `<img src="${img}" alt="Auto" class="my-listing-img" style="flex: 0 0 100%; width: 100%; height: 100%; object-fit: cover; scroll-snap-align: start;">`).join('') : '';
            
            let displayStatus = listing.status.toUpperCase();
            let statusColorClass = `status-${listing.status.replace(' ', '-')}`;
            let priceTextHTML = '';
            
            let paymentBtnHTML = '';

            if (listing.status === 'pendiente autorizacion') {
                const payInfo = getListingPaymentInfo(listing);
                priceTextHTML = `<p style="font-size: 0.85rem; color: var(--danger-color); margin-top: 4px; font-weight: bold;">${payInfo.textDesc}</p>`;
                if (globalMpEnabled && listing.paymentStatus === 'pending') {
                    paymentBtnHTML = `<button class="primary-btn" onclick="openMercadoPagoBrick(${listing.id}, false)" style="background:var(--primary-color); padding: 8px 16px; margin-bottom: 8px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;"><span class="material-symbols-rounded" style="font-size:18px;">credit_card</span> Pagar Ahora</button>`;
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

            // Mostrar fecha de publicación solo si está activo (no caducado y no pendiente)
            let publishedDateHTML = '';
            if (listing.publishedAt && displayStatus !== 'CADUCADO' && listing.status !== 'pendiente autorizacion') {
                const pubDate = new Date(listing.publishedAt);
                const pubDateStr = pubDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
                publishedDateHTML = `<p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;"><span class="material-symbols-rounded" style="font-size:13px; vertical-align: middle;">calendar_today</span> Publicado el ${pubDateStr}</p>`;
            }

            return `
            <div class="my-listing-card" style="cursor: pointer;" onclick="if(!event.target.closest('button')) openListingDetails(${listing.id})">
                <div class="card-img-carousel" style="width:100px; height:100px; flex-shrink:0; background:#000;">
                    ${imgHTML}
                </div>
                <div class="my-listing-info">
                    <h4 class="my-listing-title">${listing.title || `${listing.make} ${listing.model} ${listing.year}`}</h4>
                    <p style="color: var(--primary-color); font-weight: bold; margin-bottom: 4px;">$${listing.price.toLocaleString('es-MX')}</p>
                    <span class="status-badge ${statusColorClass}" style="${statusColorClass === 'status-caducado' ? 'background: var(--danger-color);' : (statusColorClass === 'status-renovar' ? 'background: #f59e0b;' : '')}">${displayStatus}</span>
                    ${priceTextHTML}
                    ${publishedDateHTML}
                </div>
                <div class="my-listing-actions" style="flex-direction: column;">
                    ${paymentBtnHTML}
                    <div style="display: flex; gap: 8px; width: 100%;">
                        ${(listing.status === 'autorizado' || listing.status === 'activo') ? `<button class="success-btn" onclick="confirmMarkAsSold(${listing.id})" style="flex: 1; padding: 8px;">Vendido</button>` : ''}
                        <button class="primary-btn" onclick="openEditListing(${listing.id})" style="background:var(--surface-light); padding: 8px; flex: 1;">Editar</button>
                        <button class="danger-btn" onclick="deleteListing(${listing.id})" style="padding: 8px; flex: 1;">Eliminar</button>
                    </div>
                </div>
            </div>
        `}).join('');
    }

    let listingToSoldId = null;
    const soldModal = document.getElementById('sold-modal');
    const btnSoldYes = document.getElementById('btn-sold-yes');
    const btnSoldNo = document.getElementById('btn-sold-no');

    window.confirmMarkAsSold = function(id) {
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

    window.deleteListing = function(id) {
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

    // Modal behavior & Wizard
    let currentWizardStep = 1;
    const totalWizardSteps = 5;

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
            if (checkStepValidity() && currentWizardStep < totalWizardSteps) {
                currentWizardStep++;
                updateWizardUI();
            }
        });
    }

    const btnWizardBack = document.getElementById('btn-wizard-back');
    if (btnWizardBack) {
        btnWizardBack.addEventListener('click', () => {
            if (currentWizardStep > 1) {
                currentWizardStep--;
                updateWizardUI();
            }
        });
    }

    btnNewListing.addEventListener('click', () => {
        editingListingId = null;
        currentWizardStep = 1;
        newListingForm.reset();
        if(window.customMakeSelect) window.customMakeSelect.update();
        if(window.customModelSelect) window.customModelSelect.update();
        if(window.customTypeSelect) window.customTypeSelect.update();
        if(window.customStateSelect) window.customStateSelect.update();
        if(window.customCitySelect) window.customCitySelect.update();
        if(window.customTransmissionSelect) window.customTransmissionSelect.update();
        if(window.customAcSelect) window.customAcSelect.update();
        if(window.customLegalSelect) window.customLegalSelect.update();
        if(window.customColorSelect) window.customColorSelect.update();
        whatsappModified = false;
        selectedImageFiles = [];
        if(typeof renderImagePreviews === 'function') renderImagePreviews();
        newListingModal.querySelector('h3').textContent = 'Dar de Alta Vehículo';
        updateWizardUI();
        newListingModal.classList.add('active');

        // Autocompletar ubicación con el GPS ya detectado en la página principal
        if (userStateSelect.value && userStateSelect.value !== 'Todos') {
            formState.value = userStateSelect.value;
            formState.dispatchEvent(new Event('change'));
            if(window.customStateSelect) window.customStateSelect.update();
            
            if (selectedCities && selectedCities.length > 0 && selectedCities[0] !== 'Todas') {
                setTimeout(() => {
                    formCity.value = selectedCities[0];
                    if(window.customCitySelect) window.customCitySelect.update();
                }, 50);
            }
        }
    });
    btnCloseModal.addEventListener('click', () => newListingModal.classList.remove('active'));

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

    window.openEditListing = function(id) {
        const listing = db.getMyListings().find(l => l.id === id);
        if(!listing) return;
        editingListingId = id;
        
        let fType = document.getElementById('form-type');
        fType.value = listing.type;
        if (!fType.value) { fType.value = 'Otros'; document.getElementById('form-custom-type').value = listing.type; }
        document.getElementById('form-type').dispatchEvent(new Event('change'));
        if(window.customTypeSelect) window.customTypeSelect.update();
        
        let fMake = document.getElementById('form-make');
        fMake.value = listing.make;
        if (!fMake.value) { fMake.value = 'Otros'; document.getElementById('form-custom-make').value = listing.make; }
        if(window.customMakeSelect) window.customMakeSelect.update();
        
        const event = new Event('change');
        fMake.dispatchEvent(event);
        setTimeout(() => {
            let fModel = document.getElementById('form-model');
            fModel.value = listing.model;
            if (!fModel.value) { fModel.value = 'Otros'; document.getElementById('form-custom-model').value = listing.model; }
            fModel.dispatchEvent(new Event('change'));
            if(window.customModelSelect) window.customModelSelect.update();
        }, 50);

        document.getElementById('form-year').value = listing.year;
        if (listing.price) {
            document.getElementById('form-price').value = '$' + Number(listing.price).toLocaleString('en-US');
        } else {
            document.getElementById('form-price').value = '';
        }
        
        document.getElementById('form-color').value = listing.color || '';
        if(window.customColorSelect) window.customColorSelect.update();

        formPhone.value = listing.phone || '';
        let wa = listing.whatsapp || '';
        let waV = wa.replace(/[^0-9]/g, '');
        if(waV.startsWith('52') && waV.length > 10) waV = waV.substring(2);
        formWhatsApp.value = waV ? '+52 ' + waV : '';
        formEngine.value = listing.engine || '';
        formTransmission.value = listing.transmission || '';
        if(window.customTransmissionSelect) window.customTransmissionSelect.update();
        formAc.value = listing.ac || '';
        if(window.customAcSelect) window.customAcSelect.update();
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
        if(window.customLegalSelect) window.customLegalSelect.update();
        whatsappModified = true;
        
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
        if(window.customStateSelect) window.customStateSelect.update();
        
        const stateEvent = new Event('change');
        document.getElementById('form-state').dispatchEvent(stateEvent);
        setTimeout(() => {
            document.getElementById('form-city').value = listing.city;
            if(window.customCitySelect) window.customCitySelect.update();
        }, 50);

        newListingModal.querySelector('h3').textContent = 'Editar Vehículo';
        
        selectedImageFiles = [];
        const existingImages = listing.images || (listing.image ? [listing.image] : []);
        existingImages.forEach(imgUrl => {
            selectedImageFiles.push({ file: null, url: imgUrl });
        });

        if(typeof renderImagePreviews === 'function') renderImagePreviews();
        
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
        
        currentWizardStep = 1;
        updateWizardUI();
        newListingModal.classList.add('active');
    };

    const submitBtn = document.getElementById('btn-wizard-submit');
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (selectedImageFiles.length === 0 && !editingListingId) {
            showAlert('Por favor, selecciona al menos una foto del vehículo.', 'Faltan Fotos', 'warning');
            return;
        }
        
        const make = formMake.value === 'Otros' ? document.getElementById('form-custom-make').value.trim() : formMake.value;
        let model = formModel.value === 'Otros' ? document.getElementById('form-custom-model').value.trim() : formModel.value;
        if(!model || model === '') model = 'Modelo Desconocido';
        const year = document.getElementById('form-year').value;
        const title = `${make} ${model} ${year}`;
        const engine = formEngine.value;
        const transmission = formTransmission.value;
        const ac = formAc.value;
        const mileageUnit = document.getElementById('form-mileage-unit') ? document.getElementById('form-mileage-unit').value : '';
        const mileage = formMileage.value + (mileageUnit ? ' ' + mileageUnit : '');
        const legal = formLegal.value;
        
        const submitBtn = document.getElementById('btn-wizard-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subiendo...';
        }

        let uploadedImageUrls = [];
        const imageFiles = selectedImageFiles;
        
        if (imageFiles.length > 0) {
            try {
                for (let i = 0; i < imageFiles.length; i++) {
                    const file = imageFiles[i].file;
                    const dataUrl = await new Promise((resolve) => {
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
                            try {
                                resolve(canvas.toDataURL('image/jpeg', 0.7)); // Comprimir a 70% JPEG
                            } catch (e) {
                                resolve(imageFiles[i].url); // Fallback si hay error CORS (Tainted Canvas)
                            }
                        };
                        img.onerror = () => resolve(imageFiles[i].url); // En caso de error, intentar resolver con la original
                        img.src = imageFiles[i].url;
                    });
                    uploadedImageUrls.push(dataUrl);
                }
            } catch (error) {
                console.error('Error procesando imágenes:', error);
                showAlert('Hubo un error procesando las imágenes.', 'Error de Imagen', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publicar Vehículo';
                return;
            }
        }
        
        const typeVal = formType.value === 'Otros' ? document.getElementById('form-custom-type').value.trim() : formType.value;
        const colorVal = document.getElementById('form-color').value;
        const updatedData = {
            title: title,
            type: typeVal,
            make: make,
            model: model,
            year: parseInt(year),
            price: parseInt(document.getElementById('form-price').value.replace(/[^0-9]/g, ''), 10) || 0,
            color: colorVal,
            city: formCity.value,
            phone: formPhone.value,
            whatsapp: formWhatsApp.value,
            engine: engine,
            transmission: transmission,
            ac: ac,
            mileage: mileage,
            legal: legal
        };
        
        if (uploadedImageUrls.length > 0) {
            updatedData.images = uploadedImageUrls;
        } else if (!editingListingId) {
            updatedData.images = ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80'];
        }

        try {
            if (editingListingId) {
                updatedData.id = editingListingId;
                db.saveListing(updatedData);
                showAlert('¡Vehículo actualizado con éxito!', 'Actualizado', 'check_circle');
                finishWizardSubmit();
            } else {
                updatedData.paymentStatus = 'pending';
                const newListing = db.saveListing(updatedData);
                
                finishWizardSubmit(); // Call instantly so it renders in the background
                
                if (globalMpEnabled) {
                    // Mostrar modal de opciones
                    const optionsModal = document.getElementById('publish-options-modal');
                    const priceText = document.getElementById('publish-price-text');
                    if (priceText) priceText.textContent = `$${Number(globalMonthlyPrice).toFixed(2)} MXN`;
                    
                    if (optionsModal) optionsModal.classList.add('active');
                    
                    // Guardar ref al carro que acabamos de crear
                    window.currentPendingListingId = newListing.id;
                    
                    // Ocultamos el form
                    newListingModal.classList.remove('active');
                } else {
                    showAlert('¡Vehículo publicado con éxito! Está pendiente de aprobación. En breve te contactaremos por llamada o WhatsApp para confirmar tu anuncio.', 'Publicado', 'check_circle');
                }
            }
        } catch(e) {
            console.error(e);
            showAlert('Error al guardar. Puede que las imágenes sean demasiado grandes para la memoria local.', 'Error de Almacenamiento', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publicar Vehículo';
        }
        
        function finishWizardSubmit() {
            editingListingId = null;
            newListingForm.reset();
            newListingModal.classList.remove('active');
            renderMyListings();
            if(typeof loadAdminData === 'function') {
                loadAdminData();
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publicar Vehículo';
        }
    });

    // --- Admin Dashboard ---
    function loadAdminData() {
        updateAdminStats();
        renderAdminInventory();
        updateAdminApprovals();
        updateAdminRenewals();
        updateBillingList();
        renderTrafficChart();
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
                if(v.id === targetId) v.classList.add('active');
            });

            // Cargar corte de caja al abrir Finanzas
            if (targetId === 'tab-finanzas') {
                renderCorteCaja(corteCurrentPeriod);
            }
        });
    });

    function updateAdminStats() {
        const allListings = db.getAllListings();
        const active = allListings.filter(l => l.status === 'autorizado');
        const soldCount = allListings.filter(l => l.status === 'vendido').length;
        const pendingCount = allListings.filter(l => l.status === 'pendiente autorizacion').length;
        
        const statViews = document.getElementById('stat-views');
        if (statViews) statViews.textContent = allListings.reduce((sum, l) => sum + (l.views || 0), 0);
        
        const statActive = document.getElementById('stat-active');
        if (statActive) statActive.textContent = active.length;
        
        const statSold = document.getElementById('stat-sold');
        if (statSold) statSold.textContent = soldCount;

        const sidebarBadge = document.getElementById('sidebar-pending-badge');
        if (sidebarBadge) {
            sidebarBadge.textContent = pendingCount;
            sidebarBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
        }
    }

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

        if (period === '7d') {
            labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            data = [120, 250, 180, 310, 290, 450, 390];
        } else if (period === 'month') {
            labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            data = [3500, 4200, 4800, 4100, 5000, 5600, 6200, 5900, 6500, 7100, 7800, 8500];
        } else if (period === 'year') {
            labels = ['2024', '2025', '2026', '2027'];
            data = [45000, 58000, 72000, 89000];
        }
        
        const max = Math.max(...data);
        
        chartContainer.innerHTML = data.map((val, i) => {
            const height = (val / max) * 100;
            return `
            <div class="bar-chart-col" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <div class="bar-chart-bar" style="height: ${height}%; width: 100%; min-width: 15px; max-width: 40px; background: var(--primary-color); border-radius: 4px 4px 0 0; transition: height 0.5s ease;" data-value="${val}" title="${val} vistas"></div>
                <span class="bar-chart-label" style="font-size: 0.7rem; color: var(--text-muted); text-align: center;">${labels[i]}</span>
            </div>
            `;
        }).join('');
    }

    function renderAdminInventory() {
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

        let activeListings = db.getAllListings().filter(l => l.status === 'autorizado');

        // Apply filters
        const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const state = stateFilter ? stateFilter.value : 'Todos';
        const city = cityFilter ? cityFilter.value : 'Todas';

        if (q) {
            activeListings = activeListings.filter(l => 
                (l.title && l.title.toLowerCase().includes(q)) ||
                (l.make && l.make.toLowerCase().includes(q)) ||
                (l.model && l.model.toLowerCase().includes(q))
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
            return `
            <tr>
                <td>
                    <img src="${img}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                </td>
                <td>
                    <strong>${listing.title}</strong><br>
                    <small style="color:var(--text-muted)">${listing.year} • ${listing.city}</small>
                </td>
                <td>$${listing.price.toLocaleString()}</td>
                <td>${listing.views || 0}</td>
                <td>
                    <button class="icon-btn" onclick="document.getElementById('admin-dashboard-modal').classList.remove('active'); openListingDetails(${listing.id})" style="color: var(--primary-color);" title="Ver publicación"><span class="material-symbols-rounded">visibility</span></button>
                    <button class="icon-btn" onclick="deleteListingAdmin(${listing.id})" style="color: var(--danger-color);" title="Eliminar"><span class="material-symbols-rounded">delete</span></button>
                </td>
            </tr>
            `;
        }).join('');
    }

    function updateAdminApprovals() {
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
            searchInput.addEventListener('input', () => updateAdminApprovals());
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
        
        const stateKey = JSON.stringify(pending) + '_' + query;
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
                                <span class="pending-price-tag">$${listing.price.toLocaleString('es-MX')}</span>
                                <span>📍 ${listing.city}</span>
                                <span class="copyable-phone" onclick="event.stopPropagation(); copyToClipboard('${listing.phone}', 'Teléfono')" title="Clic para copiar teléfono">📞 ${listing.phone}</span>
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
                        <div><strong>Precio Auto:</strong> <span style="color: var(--success-color);">$${listing.price.toLocaleString('es-MX')}</span></div>
                        <div><strong>Por Pagar:</strong> <span style="color: var(--danger-color); font-weight: bold;">$${payInfo.calculatedPrice.toFixed(2)} pesos</span></div>
                        <div><strong>Año:</strong> ${listing.year}</div>
                        <div><strong>Marca:</strong> ${listing.make}</div>
                        <div><strong>Modelo:</strong> ${listing.model}</div>
                        <div><strong>Tipo:</strong> ${listing.type || '-'}</div>
                        <div><strong>Motor:</strong> ${listing.engine || '-'}</div>
                        <div><strong>Transmisión:</strong> ${listing.transmission || '-'}</div>
                        <div><strong>KM/Millas:</strong> ${listing.mileage || '-'}</div>
                        <div><strong>Situación:</strong> ${listing.legal || '-'}</div>
                        <div><strong>A/C:</strong> ${listing.ac || '-'}</div>
                        <div><strong>Ubicación:</strong> ${listing.state ? listing.state + ', ' : ''}${listing.city}</div>
                        <div><strong>Teléfono:</strong> <span class="copyable-phone" onclick="copyToClipboard('${listing.phone}', 'Teléfono')" title="Clic para copiar al portapapeles">${listing.phone}</span></div>
                        ${listing.whatsapp ? `<div style="grid-column: span 1;"><strong>WhatsApp:</strong> <span class="copyable-phone" onclick="copyToClipboard('${listing.whatsapp}', 'WhatsApp')" title="Clic para copiar al portapapeles">${listing.whatsapp}</span></div>` : ''}
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
            const expDate = new Date(l.expiresAt);
            return expDate <= alertThreshold; // Vence en <= 5 días o ya venció
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

        const stateKey = JSON.stringify(pendingRenewals) + '_' + query;
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
                                <span class="pending-price-tag">$${listing.price.toLocaleString('es-MX')}</span>
                                <span>📍 ${listing.city}</span>
                                <span class="copyable-phone" onclick="event.stopPropagation(); copyToClipboard('${listing.phone}', 'Teléfono')">📞 ${listing.phone}</span>
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
                        <div><strong>Precio Auto:</strong> <span style="color: var(--success-color);">$${listing.price.toLocaleString('es-MX')}</span></div>
                        <div><strong>Por Pagar:</strong> <span style="color: var(--danger-color); font-weight: bold;">$${payInfo.calculatedPrice.toFixed(2)} pesos</span></div>
                        <div><strong>Año:</strong> ${listing.year}</div>
                        <div><strong>Marca:</strong> ${listing.make}</div>
                        <div><strong>Modelo:</strong> ${listing.model}</div>
                        <div><strong>Tipo:</strong> ${listing.type || '-'}</div>
                        <div><strong>Motor:</strong> ${listing.engine || '-'}</div>
                        <div><strong>Transmisión:</strong> ${listing.transmission || '-'}</div>
                        <div><strong>KM/Millas:</strong> ${listing.mileage || '-'}</div>
                        <div><strong>Situación:</strong> ${listing.legal || '-'}</div>
                        <div><strong>A/C:</strong> ${listing.ac || '-'}</div>
                        <div><strong>Ubicación:</strong> ${listing.state ? listing.state + ', ' : ''}${listing.city}</div>
                        <div><strong>Teléfono:</strong> <span class="copyable-phone" onclick="copyToClipboard('${listing.phone}', 'Teléfono')" title="Clic para copiar al portapapeles">${listing.phone}</span></div>
                        ${listing.whatsapp ? `<div style="grid-column: span 1;"><strong>WhatsApp:</strong> <span class="copyable-phone" onclick="copyToClipboard('${listing.whatsapp}', 'WhatsApp')" title="Clic para copiar al portapapeles">${listing.whatsapp}</span></div>` : ''}
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

    window.renewListingAdmin = function(id, isConfirmed = false) {
        if (!isConfirmed) {
            pendingRenewActionTargetId = id;
            pendingRenewActionMonthStr = ''; // ya no se usa, pero se mantiene por compatibilidad con los modales
            const listing = db.getAllListings().find(l => String(l.id) === String(id));
            if (listing) {
                const payInfo = getListingPaymentInfo(listing, true);
                const amountInput = document.getElementById('renew-payment-amount');
                if (amountInput) amountInput.value = payInfo.calculatedPrice.toFixed(2);
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
            
            db.saveListing(listings[idx]);
            const modal = document.getElementById('renew-confirm-modal');
            if (modal) modal.classList.remove('active');
            updateAdminRenewals();
            if (typeof renderAdminInventory === 'function') renderAdminInventory();
            if (typeof renderFeed === 'function') renderFeed();
            showAlert('Publicación renovada por 30 días más.', 'Renovación Exitosa', 'autorenew');
        }
    };

    window.expandedAdminCards = window.expandedAdminCards || new Set();

    window.togglePendingDetail = function(id) {
        const card = document.getElementById(`pending-card-${id}`);
        const icon = document.getElementById(`pending-expand-icon-${id}`);
        if (card) {
            const isExpanded = card.classList.contains('expanded');
            if (isExpanded) {
                card.classList.remove('expanded');
                if (icon) icon.style.transform = 'rotate(0deg)';
                window.expandedAdminCards.delete(String(id));
            } else {
                card.classList.add('expanded');
                if (icon) icon.style.transform = 'rotate(180deg)';
                window.expandedAdminCards.add(String(id));
            }
        }
    };

    window.savePendingNote = function(id) {
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
        }
    };

    // --- Copy to Clipboard Helper ---
    window.copyToClipboard = function(text, label = 'Número') {
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

    window.approveListing = function(id, isConfirmed = false) {
        if (!isConfirmed) {
            pendingActionTargetId = id;
            const listing = db.getAllListings().find(l => String(l.id) === String(id));
            if (listing) {
                const payInfo = getListingPaymentInfo(listing, false);
                const amountInput = document.getElementById('approve-payment-amount');
                if (amountInput) amountInput.value = payInfo.calculatedPrice.toFixed(2);
            }
            const modal = document.getElementById('approve-confirm-modal');
            if (modal) modal.classList.add('active');
            return;
        }

        const listings = db.getAllListings();
        const listing = listings.find(l => String(l.id) === String(id));
        if(listing) {
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            // Rolling billing: expiresAt = hoy + 30 días
            const expiresAt = new Date(now);
            expiresAt.setDate(expiresAt.getDate() + 30);
            listing.status = 'autorizado';
            listing.lastRenewedMonth = currentMonthStr;
            listing.expiresAt = expiresAt.toISOString();
            listing.publishedAt = now.toISOString(); // fecha de publicación visible al usuario
            // Sincronizar local y con Supabase
            db.saveListing(listing);

            if (!catalogData.makes.includes(listing.make)) {
                db.addSuggestion('make', listing.make);
            }
            if (!catalogData.modelsByMake[listing.make] || !catalogData.modelsByMake[listing.make].includes(listing.model)) {
                db.addSuggestion('model', listing.model, listing.make);
            }
            if (listing.type && !catalogData.types.includes(listing.type)) {
                db.addSuggestion('type', listing.type);
            }

            const modal = document.getElementById('approve-confirm-modal');
            if (modal) modal.classList.remove('active');

            if (typeof updateAdminApprovals === 'function') updateAdminApprovals();
            if (typeof updateAdminRenewals === 'function') updateAdminRenewals();
            if (typeof renderAdminInventory === 'function') renderAdminInventory();
            if (typeof updateAdminStats === 'function') updateAdminStats();
            if (typeof renderFeed === 'function') renderFeed();
            if (typeof renderMyListings === 'function') renderMyListings(); // Siempre renderizar para que esté listo al cambiar de pestaña
            showAlert('La publicación ha sido aprobada exitosamente.', 'Publicación Aprobada', 'check_circle');
        }
    };
    
    window.deleteListingAdmin = async function(id, isConfirmed = false) {
        if (!isConfirmed) {
            pendingActionTargetId = id;
            const modal = document.getElementById('reject-confirm-modal');
            if (modal) modal.classList.add('active');
            return;
        }

        // db.deleteListing manejará la eliminación de la base de datos y de Supabase Storage
        
        // Eliminación local y en la nube manejada internamente por db.js
        // No es necesario usar fetch local

        db.deleteListing(id);

        const modal = document.getElementById('reject-confirm-modal');
        if (modal) modal.classList.remove('active');

        if (typeof updateAdminApprovals === 'function') updateAdminApprovals();
        if (typeof updateAdminRenewals === 'function') updateAdminRenewals();
        if (typeof renderAdminInventory === 'function') renderAdminInventory();
        if (typeof updateAdminStats === 'function') updateAdminStats();
        if (typeof renderFeed === 'function') renderFeed();
        if(document.getElementById('view-alta') && document.getElementById('view-alta').classList.contains('active')) renderMyListings();
        showAlert('La publicación ha sido eliminada del sistema.', 'Publicación Eliminada', 'info');
    };

    let adminEditTargetId = null;

    window.openAdminEditModal = function(id) {
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
        document.getElementById('edit-phone').value = listing.phone || '';
        document.getElementById('edit-whatsapp').value = listing.whatsapp || '';

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
            
            const price = parseFloat(document.getElementById('edit-price').value);
            const year = parseInt(document.getElementById('edit-year').value);
            const make = document.getElementById('edit-make').value.trim();
            const model = document.getElementById('edit-model').value.trim();
            const phone = document.getElementById('edit-phone').value.trim();
            
            if (!price || !year || !make || !model || !phone) {
                showAlert('Por favor llena los campos requeridos (Precio, Año, Marca, Modelo, Teléfono).', 'Faltan datos', 'warning');
                return;
            }

            const listings = db.getAllListings();
            const listingIndex = listings.findIndex(l => String(l.id) === String(adminEditTargetId));
            
            if (listingIndex > -1) {
                listings[listingIndex] = {
                    ...listings[listingIndex],
                    price: price,
                    year: year,
                    mileage: document.getElementById('edit-mileage').value.trim(),
                    make: make,
                    model: model,
                    type: document.getElementById('edit-type').value.trim(),
                    transmission: document.getElementById('edit-transmission').value.trim(),
                    phone: phone,
                    whatsapp: document.getElementById('edit-whatsapp').value.trim()
                };
                
                // Sincronizar local y con Supabase
                db.saveListing(listings[listingIndex]);


                closeAdminEdit();
                updateAdminApprovals();
                updateAdminRenewals();
                if(typeof renderAdminInventory === 'function') renderAdminInventory();
                showAlert('Los datos del vehículo han sido actualizados.', 'Datos Guardados', 'check_circle');
            }
        };
    }

    window.deleteListingImageAdmin = async function(id, index) {
        if (!confirm('¿Seguro que deseas eliminar esta foto de la publicación?')) return;
        
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
                try { await fetch(`${db.apiBaseUrl}/upload/${filename}`, { method: 'DELETE' }); } catch(e) {}
            }
        } catch(e) {
            console.error('Error eliminando foto', e);
        }
        
        updateAdminApprovals();
        updateAdminRenewals();
        showAlert('Foto eliminada correctamente.', 'Foto Eliminada', 'image');
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
                if (!amountInput.value) {
                    showAlert('Debes ingresar el monto cobrado.', 'Falta el monto', 'warning');
                    return;
                }
                const amount = parseFloat(amountInput.value);
                
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
                    } catch(e) { console.error('Error subiendo comprobante', e); }
                }
                
                db.addPayment(targetId, amount, receiptUrl, 'Aprobación');
                
                amountInput.value = '';
                if(fileInput) fileInput.value = '';
                
                pendingActionTargetId = null;
                approveListing(targetId, true);
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
                if (!amountInput.value) {
                    showAlert('Debes ingresar el monto cobrado.', 'Falta el monto', 'warning');
                    return;
                }
                const amount = parseFloat(amountInput.value);
                
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
                    } catch(e) { console.error('Error subiendo comprobante', e); }
                }
                
                db.addPayment(targetId, amount, receiptUrl, 'Renovación');
                
                amountInput.value = '';
                if(fileInput) fileInput.value = '';

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
            from = new Date(now); from.setHours(0,0,0,0);
            to = new Date(now); to.setHours(23,59,59,999);
        } else if (period === 'week') {
            const day = now.getDay();
            from = new Date(now); from.setDate(now.getDate() - day); from.setHours(0,0,0,0);
            to = new Date(now); to.setHours(23,59,59,999);
        } else if (period === 'month') {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date(now); to.setHours(23,59,59,999);
        } else if (period === 'custom' && fromDate && toDate) {
            from = new Date(fromDate); from.setHours(0,0,0,0);
            to = new Date(toDate); to.setHours(23,59,59,999);
        } else {
            from = new Date(now); from.setHours(0,0,0,0);
            to = new Date(now); to.setHours(23,59,59,999);
        }
        return { from, to };
    }

    async function renderCorteCaja(period = corteCurrentPeriod, fromDate = null, toDate = null) {
        corteCurrentPeriod = period;
        const tbody = document.getElementById('corte-table-body');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:24px;"><span class="material-symbols-rounded" style="animation:spin 1s linear infinite; font-size:20px; vertical-align:middle;">refresh</span> Cargando...</td></tr>';

        const { from, to } = getDateRangeForPeriod(period, fromDate, toDate);
        const fromISO = from.toISOString().split('T')[0];
        const toISO = to.toISOString().split('T')[0];

        let payments = [];
        try {
            const token = localStorage.getItem('revista_admin_token');
            const res = await fetch(`${db.apiBaseUrl}/payments?from=${fromISO}&to=${toISO}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) payments = data.payments;
            }
        } catch(e) {
            // Fallback: usar pagos locales
            payments = db.getAllPayments().filter(p => {
                if (!p.dateISO) return false;
                const d = new Date(p.dateISO);
                return d >= from && d <= to;
            });
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
        const sheetName = `Corte ${periodLabel} ${from.toLocaleDateString('es-MX', { day:'2-digit', month:'short' })}`;
        XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
        XLSX.writeFile(wb, `Corte_RevistAuto_${periodLabel}_${from.toISOString().split('T')[0]}.xlsx`);
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

        if (payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding: 24px;">No hay registros de cobros aún.</td></tr>';
            return;
        }

        tbody.innerHTML = payments.map(payment => {
            const receiptBtn = payment.receiptImage 
                ? `<button class="icon-btn" onclick="window.open('${payment.receiptImage}', '_blank')" title="Ver Comprobante" style="color:var(--primary-color); display: flex; align-items: center; justify-content: center; width: 100%;"><span class="material-symbols-rounded">receipt_long</span></button>`
                : `<span style="color:var(--text-muted); font-size:0.85rem; display: block; text-align: center;">Efectivo / Sin Ticket</span>`;
            
            return `
            <tr>
                <td>${payment.date}</td>
                <td><strong>${payment.listingTitle}</strong> (ID: ${payment.listingId})<br><span style="font-size:0.8rem; color:var(--text-muted);">${payment.type}</span></td>
                <td style="color: var(--success-color); font-weight:bold;">$${parseFloat(payment.amount).toLocaleString('es-MX')} MXN</td>
                <td style="text-align: center; vertical-align: middle;">${receiptBtn}</td>
            </tr>
            `;
        }).join('');
    }

    function updateStats() {
        const listings = db.getAllListings();
        const active = listings.filter(l => l.status === 'autorizado').length;
        const sold = listings.filter(l => l.status === 'vendido').length;
        const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);

        document.getElementById('stat-views').textContent = totalViews;
        document.getElementById('stat-active').textContent = active;
        document.getElementById('stat-sold').textContent = sold;
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
        formYearInput.addEventListener('input', (e) => {
            if (e.target.value.length > 4) e.target.value = e.target.value.slice(0, 4);
        });
    }
    // Logica para Configuración del Costo Mensual Base
    const btnSavePrice = document.getElementById('btn-save-price');
    const inputMonthlyPrice = document.getElementById('admin-monthly-price');
    
    if (btnSavePrice && inputMonthlyPrice) {
        btnSavePrice.addEventListener('click', async () => {
            const val = Number(inputMonthlyPrice.value);
            const mpEnabled = document.getElementById('admin-mp-enabled') ? document.getElementById('admin-mp-enabled').checked : false;
            const mpPubKey = document.getElementById('admin-mp-public-key') ? document.getElementById('admin-mp-public-key').value.trim() : '';
            const mpAccToken = document.getElementById('admin-mp-access-token') ? document.getElementById('admin-mp-access-token').value.trim() : '';
            try {
                const settingsPayload = { 
                    monthlyPrice: val,
                    mercadoPagoEnabled: mpEnabled,
                    mpPublicKey: mpPubKey,
                    mpAccessToken: mpAccToken
                };
                const data = await db.saveSettings(settingsPayload);
                if (data.success) {
                    globalMonthlyPrice = val;
                    globalMpEnabled = mpEnabled;
                    globalMpPublicKey = mpPubKey;
                    showAlert('Configuración general y de pagos guardada correctamente.', 'Guardado', 'check_circle');
                    if (document.getElementById('view-alta') && document.getElementById('view-alta').classList.contains('active')) {
                        renderMyListings(); 
                    }
                } else {
                    showAlert('Error del servidor: ' + data.error, 'Error', 'error');
                }
            } catch (e) {
                console.error('Error guardando config:', e);
                showAlert('Hubo un error al guardar.', 'Error', 'error');
            }
        });
    }

    // --- Admin Polling (Real-time updates) ---
    setInterval(() => {
        if (adminDashboardModal && adminDashboardModal.classList.contains('active')) {
            if (typeof db !== 'undefined' && db.syncWithServer) {
                db.syncWithServer().then(() => {
                    if (typeof loadAdminData === 'function') {
                        loadAdminData();
                    }
                }).catch(err => console.error('Error in admin polling:', err));
            }
        }
    }, 5000); // Poll every 5 seconds for real-time feel

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
    window.fetch = async function() {
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

    // Interceptar la apertura del panel de admin
    // Como el botón oculto abre adminDashboardModal, vamos a crear una función global para abrirlo
    window.openAdminPanel = function() {
        if (window.adminToken && window.currentAdminUser) {
            // Ya logueado
            setupAdminPermissions();
            adminDashboardModal.classList.add('active');
            renderUsersAdmin();
        } else {
            // Mostrar Login
            adminLoginModal.classList.add('active');
        }
    };

    if (btnCloseLogin) {
        btnCloseLogin.addEventListener('click', () => adminLoginModal.classList.remove('active'));
    }

    if (btnAdminLogin) {
        btnAdminLogin.addEventListener('click', async () => {
            const user = document.getElementById('login-username').value.trim();
            const pass = document.getElementById('login-password').value.trim();
            if (!user || !pass) {
                loginError.textContent = 'Ingresa usuario y contraseña.';
                return;
            }

            btnAdminLogin.disabled = true;
            btnAdminLogin.textContent = 'Iniciando...';
            loginError.textContent = '';

            try {
                const data = await db.loginAdmin(user, pass);

                if (data.success) {
                    window.adminToken = data.token;
                    window.currentAdminUser = data.user;
                    localStorage.setItem('admin_token', data.token);
                    localStorage.setItem('admin_user', JSON.stringify(data.user));
                    
                    adminLoginModal.classList.remove('active');
                    setupAdminPermissions();
                    adminDashboardModal.classList.add('active');
                    renderUsersAdmin();
                    document.getElementById('login-password').value = '';
                } else {
                    loginError.textContent = data.error;
                }
            } catch(e) {
                loginError.textContent = 'Error de conexión.';
            }
            btnAdminLogin.disabled = false;
            btnAdminLogin.textContent = 'Ingresar';
        });
    }

    // Configurar qué pestañas puede ver el usuario
    function setupAdminPermissions() {
        const role = window.currentAdminUser.role;
        const tabFinanzas = document.getElementById('sidebar-tab-finanzas');
        const tabUsuarios = document.getElementById('sidebar-tab-usuarios');
        const tabGeneral = document.querySelector('.dashboard-tab[data-tab="tab-general"]');

        if (role === 'empleado') {
            if(tabFinanzas) tabFinanzas.style.display = 'none';
            if(tabUsuarios) tabUsuarios.style.display = 'none';
            if(tabGeneral) tabGeneral.style.display = 'none';
            // Abrir inventario por defecto
            document.querySelector('.dashboard-tab[data-tab="tab-inventario"]').click();
        } else {
            if(tabFinanzas) tabFinanzas.style.display = 'flex';
            if(tabUsuarios) tabUsuarios.style.display = 'flex';
            if(tabGeneral) tabGeneral.style.display = 'flex';
        }
    }

    // GESTIÓN DE USUARIOS
    const usersTableBody = document.getElementById('users-table-body');
    const adminUserModal = document.getElementById('admin-user-modal');
    
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
                        <input type="checkbox" class="user-city-cb" data-state="${state}" value="${city}" ${isCityChecked || isStateChecked ? 'checked' : ''} ${(isStateChecked)? 'disabled': ''}>
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
                adminUserModal.classList.remove('active');
                renderUsersAdmin();
                showAlert('Usuario guardado con éxito', 'Éxito', 'check_circle');
            } else {
                showAlert(data.error, 'Error', 'error');
            }
        } catch(err) {
            showAlert('Error al guardar usuario', 'Error', 'error');
        }
    });

    window.editUser = function(id, username, password, role, states, cities) {
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

    window.deleteUser = async function(id) {
        if(!confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            const data = await db.deleteAdminUser(id);
            if (data.success) {
                renderUsersAdmin();
                showAlert('Usuario eliminado', 'Éxito', 'check_circle');
            } else {
                showAlert(data.error, 'Error', 'error');
            }
        } catch(e) {
            showAlert('Error al eliminar', 'Error', 'error');
        }
    };

    async function renderUsersAdmin() {
        if (!usersTableBody || window.currentAdminUser.role !== 'admin') return;
        try {
            const data = await db.getAdminUsers();
            if (data.success) {
                usersTableBody.innerHTML = data.users.map(u => `
                    <tr>
                        <td><strong>${u.username}</strong></td>
                        <td>${u.role === 'admin' ? '<span style="color:var(--primary-color); font-weight:bold;">Control Total</span>' : 'Empleado'}</td>
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
                            <button class="primary-btn" onclick="editUser('${u.id}', '${u.username}', '${u.password}', '${u.role}', '${(u.allowedStates||[]).join(',')}', '${(u.allowedCities||[]).join(',')}')" style="padding:4px 8px; font-size:0.8rem; background:var(--surface-light);">Editar</button>
                            <button class="danger-btn" onclick="deleteUser('${u.id}')" style="padding:4px 8px; font-size:0.8rem;">Borrar</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch(e) {
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
        if (typeof loadAdminData === 'function') loadAdminData();
    });

    if (btnOptionPayLater) btnOptionPayLater.addEventListener('click', () => {
        modalPublishOptions.classList.remove('active');
        showAlert('¡Vehículo publicado con éxito! Está pendiente de aprobación. Nos contactaremos contigo.', 'Publicado', 'check_circle');
        if (typeof loadAdminData === 'function') loadAdminData();
    });

    if (btnCloseMp) btnCloseMp.addEventListener('click', () => {
        modalMp.classList.remove('active');
    });

    if (btnOptionPayNow) btnOptionPayNow.addEventListener('click', () => {
        modalPublishOptions.classList.remove('active');
        openMercadoPagoBrick(window.currentPendingListingId, false);
    });

    window.openMercadoPagoBrick = function(listingId, isRenewal = false) {
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

            const renderPaymentBrick = async (bricksBuilder) => {
                const settings = {
                    initialization: {
                        amount: Number(globalMonthlyPrice) || 350
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
                                        if (typeof loadAdminData === 'function') loadAdminData();
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

});
