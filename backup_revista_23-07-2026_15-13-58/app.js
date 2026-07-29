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
    populateSelects();
    populateHomeCategories();
    renderFeed();
    updateStats();


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
    }

    function populateSelects() {
        // Populating states
        catalogData.states.forEach(state => {
            userStateSelect.innerHTML += `<option value="${state}">${state}</option>`;
            formState.innerHTML += `<option value="${state}">${state}</option>`;
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
                selectedCities = [...(catalogData.citiesByState[state] || [])];
                // Reset text just in case it had a city appended
                const option = Array.from(userStateSelect.options).find(opt => opt.value === state);
                if(option) option.textContent = state;
            }
            renderFeed();
        });

        function performLocationDetection(isManualClick) {
            if ("geolocation" in navigator) {
                if (btnLocateMe) btnLocateMe.innerHTML = '<span class="material-symbols-rounded" style="animation: spin 1s linear infinite;">refresh</span>';
                navigator.geolocation.getCurrentPosition(async (position) => {
                    try {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const data = await res.json();
                        
                        if (data && data.address) {
                            const stateName = data.address.state;
                            const cityName = data.address.city || data.address.town || data.address.village || data.address.county || '';
                            
                            if (stateName) {
                                const matchedState = catalogData.states.find(s => s.toLowerCase() === stateName.toLowerCase() || stateName.toLowerCase().includes(s.toLowerCase()));
                                if (matchedState) {
                                    let detectedCityText = '';
                                    // Buscar la ciudad en el catálogo del estado
                                    const stateCities = catalogData.citiesByState[matchedState] || [];
                                    const matchedCity = stateCities.find(c => 
                                        c.toLowerCase() === cityName.toLowerCase() || 
                                        cityName.toLowerCase().includes(c.toLowerCase()) ||
                                        c.toLowerCase().includes(cityName.toLowerCase())
                                    );
                                    
                                    if (matchedCity) {
                                        selectedCities = [matchedCity];
                                        detectedCityText = ` / ${matchedCity}`;
                                    } else {
                                        selectedCities = [...stateCities];
                                    }

                                    userStateSelect.value = matchedState;
                                    
                                    // Update the option text to show State / City
                                    const option = Array.from(userStateSelect.options).find(opt => opt.value === matchedState);
                                    if (option) {
                                        option.textContent = `${matchedState}${detectedCityText}`;
                                    }
                                    
                                    if (window.customUserFilterStateSelect) window.customUserFilterStateSelect.update();
                                    
                                    // Sincronizar también con los filtros de Búsqueda Avanzada por defecto
                                    filterState.value = matchedState;
                                    filterState.dispatchEvent(new Event('change')); // Fuerza a cargar las ciudades
                                    if (matchedCity) {
                                        filterCity.value = matchedCity;
                                    }
                                    if (window.customFilterStateSelect) window.customFilterStateSelect.update();
                                    if (window.customFilterCitySelect) window.customFilterCitySelect.update();

                                    renderFeed();
                                }
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    } finally {
                        if (btnLocateMe) btnLocateMe.innerHTML = '<span class="material-symbols-rounded">my_location</span>';
                    }
                }, () => {
                    if (isManualClick) showAlert('Permiso de ubicación denegado.', 'Error', 'error');
                    if (btnLocateMe) btnLocateMe.innerHTML = '<span class="material-symbols-rounded">my_location</span>';
                });
            }
        }

        if (btnLocateMe) {
            btnLocateMe.addEventListener('click', () => {
                performLocationDetection(true);
            });
        }
        
        // Auto-detect on app load
        setTimeout(() => {
            performLocationDetection(false);
        }, 500);

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
            if (state !== 'Todos' && catalogData.citiesByState[state]) {
                catalogData.citiesByState[state].forEach(city => {
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
        btnUserCities.addEventListener('click', () => {
            const state = userStateSelect.value;
            if (state === 'Todos') {
                showAlert('Por favor selecciona un Estado primero para ver sus ciudades.', 'Filtro Incompleto', 'warning');
                return;
            }
            
            const stateCities = catalogData.citiesByState[state] || [];
            citiesCheckboxesContainer.innerHTML = stateCities.map(city => `
                <label class="custom-checkbox">
                    <input type="checkbox" value="${city}" ${selectedCities.includes(city) ? 'checked' : ''}>
                    <span>${city}</span>
                </label>
            `).join('');
            
            citiesModal.classList.add('active');
        });

        if (btnCloseCitiesModal) btnCloseCitiesModal.addEventListener('click', () => citiesModal.classList.remove('active'));
        
        if (btnApplyCities) btnApplyCities.addEventListener('click', () => {
            const checkboxes = citiesCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked');
            selectedCities = Array.from(checkboxes).map(cb => cb.value);
            citiesModal.classList.remove('active');
            updateStateSelectLabel(userStateSelect.value);
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

    function populateHomeCategories() {
        catalogData.types.forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'category-chip';
            btn.setAttribute('data-type', type);
            btn.textContent = type;
            homeCategories.appendChild(btn);
        });

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
    }

    function createListingCardHTML(listing, hideHeart = false) {
        const isSaved = savedListingsIds.includes(listing.id);
        const savedClass = isSaved ? 'saved' : '';
        const savedIcon = isSaved ? 'favorite' : 'favorite_border';
        
        const images = listing.images || (listing.image ? [listing.image] : ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80']);
        const imageElements = images.map(img => `<img src="${img}" alt="Auto" loading="lazy">`).join('');
        const counterHTML = images.length > 1 ? `<div class="image-counter">1 / ${images.length}</div>` : '';
        let navArrows = '';


        return `
            <div class="card" style="cursor: pointer;" onclick="if(!event.target.closest('.card-save-btn')) openListingDetails(${listing.id})">
                <div class="card-img-wrapper">
                    <div class="card-img-carousel" onscroll="updateCounter(this)">
                        ${imageElements}
                    </div>
                    ${navArrows}
                    ${counterHTML}
                    <button class="card-save-btn ${savedClass}" style="${(hideHeart && !isSaved) ? 'display: none;' : ''}" onclick="event.stopPropagation(); window.toggleSave(${listing.id}, this)">
                        <span class="material-symbols-rounded" style="font-variation-settings: 'FILL' ${isSaved ? '1' : '0'};">${savedIcon}</span>
                    </button>
                </div>
                <div class="card-content">
                    <h4 class="card-title">${listing.title.replace(listing.year, '').replace(/\s+/g, ' ').trim()}</h4>
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
        // get a bunch of listings, filter by type if needed
        let listings = db.getAllListings().filter(l => l.status === 'autorizado');
        
        if (selectedCities.length > 0) listings = listings.filter(l => selectedCities.includes(l.city));
        
        if (currentFeedCategory !== 'Todos') {
            feedContainer.classList.add('listings-grid');
            listings = listings.filter(l => l.type === currentFeedCategory);
            
            // shuffle for randomness
            listings.sort(() => 0.5 - Math.random());
            // Removemos el límite de 10 para que en la cuadrícula puedan ver todos los de esa categoría
            
            if (listings.length === 0) {
                feedContainer.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 20px;">No se encontraron vehículos en esta zona.</p>';
                return;
            }
            feedContainer.innerHTML = listings.map(createListingCardHTML).join('');
        } else {
            feedContainer.classList.remove('listings-grid');
            
            // Group by category
            const grouped = {};
            listings.forEach(l => {
                if (!grouped[l.type]) grouped[l.type] = [];
                grouped[l.type].push(l);
            });
            
            let html = '';
            
            // Use catalogData order if available, else Object.keys
            const order = catalogData && catalogData.types ? catalogData.types : Object.keys(grouped);
            
            order.forEach(type => {
                if (grouped[type] && grouped[type].length > 0) {
                    let rowListings = grouped[type];
                    // Aleatorizar los autos para ser parejo con todos
                    rowListings.sort(() => 0.5 - Math.random());
                    // Limitar a un máximo de 20 autos por carril horizontal
                    rowListings = rowListings.slice(0, 20);

                    html += `
                    <div class="netflix-row">
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
                            ${rowListings.map(l => createListingCardHTML(l, true)).join('')}
                        </div>
                    </div>
                    `;
                }
            });
            
            if (html === '') {
                feedContainer.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 20px;">No se encontraron vehículos en esta zona.</p>';
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
            const feedBtn = document.querySelector(`.card-favorite-btn[onclick*="toggleSave(${id}"]`);
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

    window.toggleSaveDetalle = function(id, btnElement) {
        try {
            id = Number(id);
            const index = savedListingsIds.indexOf(id);
            // Foolproof DOM element resolution
            let btn = document.getElementById(`detalle-heart-btn-${id}`);
            if (!btn && btnElement) {
                btn = btnElement.tagName === 'BUTTON' ? btnElement : btnElement.closest('button');
            }
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
            
            // Render feed in background if it doesn't crash
            try { renderFeed(); } catch(e) {}
            
            const biblio = document.getElementById('view-biblioteca');
            if (biblio && biblio.classList.contains('active')) {
                try { renderSavedListings(); } catch(e) {}
            }
        } catch(err) {
            console.error('Error toggling save:', err);
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
            showAlert('Intenta con otras palabras o quita algunos filtros.', 'No hay resultados', 'info');
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
                
                <button class="detalle-floating-btn" onclick="event.stopPropagation(); window.closeListingDetails()" style="left: 16px; z-index: 10;">
                    <span class="material-symbols-rounded">arrow_back</span>
                </button>
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
        
        if (myListings.length === 0) {
            myListingsContainer.innerHTML = '<p style="color:var(--text-muted); text-align:center;">No has publicado ningún vehículo.</p>';
            return;
        }

        myListingsContainer.innerHTML = myListings.map(listing => {
            const images = listing.images || (listing.image ? [listing.image] : []);
            const imgHTML = images.length > 0 ? images.map(img => `<img src="${img}" alt="Auto" class="my-listing-img" style="flex: 0 0 100%; width: 100%; height: 100%; object-fit: cover; scroll-snap-align: start;">`).join('') : '';
            return `
            <div class="my-listing-card" style="cursor: pointer;" onclick="if(!event.target.closest('button')) openListingDetails(${listing.id})">
                <div class="card-img-carousel" style="width:100px; height:100px; flex-shrink:0; background:#000;">
                    ${imgHTML}
                </div>
                <div class="my-listing-info">
                    <h4 class="my-listing-title">${listing.title}</h4>
                    <p style="color: var(--primary-color); font-weight: bold; margin-bottom: 4px;">$${listing.price.toLocaleString('es-MX')}</p>
                    <span class="status-badge status-${listing.status.replace(' ', '-')}">${listing.status.toUpperCase()}</span>
                </div>
                <div class="my-listing-actions">
                    ${listing.status === 'autorizado' ? `<button class="success-btn" onclick="confirmMarkAsSold(${listing.id})">Vendido</button>` : ''}
                    <button class="primary-btn" onclick="openEditListing(${listing.id})" style="background:var(--surface-light); padding: 8px 16px;">Editar</button>
                    <button class="danger-btn" onclick="deleteListing(${listing.id})">Eliminar</button>
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
                const listing = db.getAllListings().find(l => l.id === listingToDeleteId);
                if(listing) {
                    const images = listing.images || (listing.image ? [listing.image] : []);
                    for(const imgUrl of images) {
                        if (imgUrl.includes('/uploads/')) {
                            const filename = imgUrl.split('/').pop();
                            try { await fetch(`/api/upload/${filename}`, { method: 'DELETE' }); } catch(e) { console.error(e); }
                        }
                    }
                }
                db.deleteListing(listingToDeleteId);
                // Si estaba guardado, lo quitamos también
                const sIdx = savedListingsIds.indexOf(listingToDeleteId);
                if(sIdx > -1) {
                    savedListingsIds.splice(sIdx, 1);
                    localStorage.setItem('revista_autos_saved', JSON.stringify(savedListingsIds));
                }
                renderMyListings();
                updateStats();
                
                listingToDeleteId = null;
                deleteModal.classList.remove('active');
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

    newListingForm.addEventListener('submit', async (e) => {
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
                db.updateListing(editingListingId, updatedData);
                showAlert('¡Vehículo actualizado con éxito!', 'Actualizado', 'check_circle');
            } else {
                db.saveListing(updatedData);
                showAlert('¡Vehículo publicado con éxito! Está pendiente de aprobación. En breve te contactaremos por llamada o WhatsApp para confirmar tu anuncio.', 'Publicado', 'check_circle');
            }
            editingListingId = null;
            newListingForm.reset();
            newListingModal.classList.remove('active');
            renderMyListings();
            if(typeof updateAdminApprovals === 'function') updateAdminApprovals();
        } catch(e) {
            console.error(e);
            showAlert('Error al guardar. Puede que las imágenes sean demasiado grandes para la memoria local.', 'Error de Almacenamiento', 'error');
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publicar Vehículo';
    });

    // --- Admin Dashboard ---
    function loadAdminData() {
        updateAdminStats();
        renderAdminInventory();
        updateAdminApprovals();
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
                adminDashboardModal.classList.add('active');
                history.pushState({ page: 'root' }, '');
                loadAdminData();
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
        });
    });

    function updateAdminStats() {
        const allListings = db.getAllListings();
        const active = allListings.filter(l => l.status === 'autorizado');
        
        const statViews = document.getElementById('stat-views');
        if (statViews) statViews.textContent = allListings.reduce((sum, l) => sum + (l.views || 0), 0);
        
        const statActive = document.getElementById('stat-active');
        if (statActive) statActive.textContent = active.length;
        
        const statSold = document.getElementById('stat-sold');
        if (statSold) statSold.textContent = '0'; 
    }

    function renderTrafficChart() {
        const chartContainer = document.getElementById('traffic-chart');
        if (!chartContainer) return;
        
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const data = [120, 250, 180, 310, 290, 450, 390];
        const max = Math.max(...data);
        
        chartContainer.innerHTML = data.map((val, i) => {
            const height = (val / max) * 100;
            return `
            <div class="bar-chart-col">
                <div class="bar-chart-bar" style="height: ${height}%;" data-value="${val}"></div>
                <span class="bar-chart-label">${days[i]}</span>
            </div>
            `;
        }).join('');
    }

    function renderAdminInventory() {
        const tbody = document.getElementById('inventory-table-body');
        if (!tbody) return;
        const activeListings = db.getAllListings().filter(l => l.status === 'autorizado');
        
        if (activeListings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding: 24px;">No hay autos en el inventario.</td></tr>';
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
                    <button class="icon-btn" onclick="adminDashboardModal.classList.remove('active'); openListingDetails(${listing.id})" style="color: var(--primary-color);" title="Ver"><span class="material-symbols-rounded">visibility</span></button>
                    <button class="icon-btn" onclick="deleteListingAdmin(${listing.id})" style="color: var(--danger-color);" title="Eliminar"><span class="material-symbols-rounded">delete</span></button>
                </td>
            </tr>
            `;
        }).join('');
    }

    function updateAdminApprovals() {
        const list = document.getElementById('pending-approvals-list');
        const pending = db.getAllListings().filter(l => l.status === 'pendiente autorizacion');
        
        if (pending.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted);">No hay publicaciones pendientes de aprobación.</p>';
            return;
        }

        list.innerHTML = pending.map(listing => {
            const images = listing.images || (listing.image ? [listing.image] : []);
            const imgHTML = images.length > 0 ? images.map(img => `<img src="${img}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); flex-shrink: 0;">`).join('') : '';
            return `
            <div class="admin-list-item" style="flex-direction: column; align-items: stretch; gap: 16px; padding: 16px; background: var(--surface-light); border-radius: 12px; margin-bottom: 16px;">
                <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; -ms-overflow-style: none;">
                    ${imgHTML}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9rem;">
                    <div style="grid-column: 1 / -1; font-size: 1.1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 4px;"><strong>${listing.title}</strong></div>
                    <div><strong>Precio:</strong> <span style="color: var(--success-color);">$${listing.price.toLocaleString('es-MX')}</span></div>
                    <div><strong>Año:</strong> ${listing.year}</div>
                    <div><strong>Marca:</strong> ${listing.make}</div>
                    <div><strong>Modelo:</strong> ${listing.model}</div>
                    <div><strong>Tipo:</strong> ${listing.type}</div>
                    <div><strong>Motor:</strong> ${listing.engine || '-'}</div>
                    <div><strong>Transmisión:</strong> ${listing.transmission || '-'}</div>
                    <div><strong>KM/Millas:</strong> ${listing.mileage || '-'}</div>
                    <div><strong>Situación:</strong> ${listing.legal || '-'}</div>
                    <div><strong>A/C:</strong> ${listing.ac || '-'}</div>
                    <div><strong>Estado/Ciudad:</strong> ${listing.state || ''}, ${listing.city}</div>
                    <div style="grid-column: 1 / -1; color: var(--primary-color); background: rgba(59, 130, 246, 0.1); padding: 8px; border-radius: 6px; margin-top: 4px;">
                        <strong><span class="material-symbols-rounded" style="font-size:16px; vertical-align:middle;">call</span> Teléfono:</strong> ${listing.phone}
                    </div>
                    ${listing.whatsapp ? `<div style="grid-column: 1 / -1; color: #25D366; background: rgba(37, 211, 102, 0.1); padding: 8px; border-radius: 6px;"><strong><span class="material-symbols-rounded" style="font-size:16px; vertical-align:middle;">chat</span> WhatsApp:</strong> ${listing.whatsapp}</div>` : ''}
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;">
                    <button class="danger-btn" onclick="deleteListingAdmin(${listing.id})" style="flex: 1;">Rechazar</button>
                    <button class="success-btn" onclick="approveListing(${listing.id})" style="flex: 1;">Aprobar</button>
                </div>
            </div>
        `}).join('');
    }

    window.approveListing = function(id) {
        const listings = db.getAllListings();
        const listing = listings.find(l => l.id === id);
        if(listing) {
            listing.status = 'autorizado';
            localStorage.setItem(db.listingsKey, JSON.stringify(listings));
            // Check if make, model or type are custom and add to suggestions
            if (!catalogData.makes.includes(listing.make)) {
                db.addSuggestion('make', listing.make);
            }
            if (!catalogData.modelsByMake[listing.make] || !catalogData.modelsByMake[listing.make].includes(listing.model)) {
                db.addSuggestion('model', listing.model, listing.make);
            }
            if (listing.type && !catalogData.types.includes(listing.type)) {
                db.addSuggestion('type', listing.type);
            }

            updateAdminApprovals();
            updateStats();
            if(document.getElementById('view-alta').classList.contains('active')) renderMyListings();
        }
    };
    
    window.deleteListingAdmin = async function(id) {
        const listing = db.getAllListings().find(l => l.id === id);
        if(listing) {
            const images = listing.images || (listing.image ? [listing.image] : []);
            for(const imgUrl of images) {
                if (imgUrl.includes('/uploads/')) {
                    const filename = imgUrl.split('/').pop();
                    try { await fetch(`/api/upload/${filename}`, { method: 'DELETE' }); } catch(e) { console.error(e); }
                }
            }
        }
        db.deleteListing(id);
        updateAdminApprovals();
        if(document.getElementById('view-alta').classList.contains('active')) renderMyListings();
    };

    function updateBillingList() {
        const tbody = document.getElementById('billing-table-body');
        if (!tbody) return;
        const listings = db.getAllListings();
        
        if (listings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding: 24px;">No hay registros de cobros.</td></tr>';
            return;
        }

        tbody.innerHTML = listings.map(listing => {
            let statusText = listing.status === 'pendiente autorizacion' ? 'Pendiente' : 'Cobrado';
            let statusColor = listing.status === 'pendiente autorizacion' ? 'var(--warning-color)' : 'var(--success-color)';
            const date = new Date().toLocaleDateString('es-MX');
            return `
            <tr>
                <td>${date}</td>
                <td>Usuario (ID: ${listing.id})</td>
                <td>$300 MXN</td>
                <td><span style="color: ${statusColor}; font-weight: 500;">${statusText}</span></td>
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

    // --- GPS / Geolocation ---
    let gpsFinished = false;
    let bounceCount = 0;

    function initGPS() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await response.json();
                    
                    if (data && data.address) {
                        const stateName = data.address.state;
                        // Mapear con nuestro catálogo
                        const matchingState = catalogData.states.find(s => 
                            s.toLowerCase() === (stateName || '').toLowerCase() || 
                            (stateName || '').toLowerCase().includes(s.toLowerCase())
                        );
                        
                        if (matchingState) {
                            userStateSelect.value = matchingState;
                            selectedCities = [...(catalogData.citiesByState[matchingState] || [])];
                            
                            const cityName = data.address.city || data.address.town || data.address.municipality || data.address.village;
                            if (cityName && catalogData.citiesByState[matchingState].includes(cityName)) {
                                selectedCities = [cityName]; // Filtramos a su ciudad exacta si está en la lista
                            }
                            
                            updateStateSelectLabel(matchingState);
                            renderFeed();
                        }
                    }
                } catch(e) {
                    console.error("Error obteniendo ubicación:", e);
                } finally {
                    gpsFinished = true;
                }
            }, (error) => {
                console.log("GPS desactivado o denegado");
                gpsFinished = true;
            });
        } else {
            gpsFinished = true;
        }
    }

    function triggerGPSBounce() {
        if (!btnLocateMe) return;
        gpsFinished = false;
        bounceCount = 0;
        btnLocateMe.classList.remove('detecting-location');
        void btnLocateMe.offsetWidth; // Forzar reflow para reiniciar la animación
        btnLocateMe.classList.add('detecting-location');
    }

    if (btnLocateMe) {
        btnLocateMe.addEventListener('click', () => {
            triggerGPSBounce();
            initGPS();
        });
        
        btnLocateMe.addEventListener('animationiteration', () => {
            bounceCount++;
            if (gpsFinished && bounceCount >= 2) {
                btnLocateMe.classList.remove('detecting-location');
            }
        });
    }

    // Iniciar GPS al final
    triggerGPSBounce();
    initGPS();
});
