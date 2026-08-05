// --- Client Ad Flow Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const btnAdvertise = document.getElementById('btn-advertise');
    const clientAdModal = document.getElementById('client-ad-modal');
    const btnCloseClientAd = document.getElementById('btn-close-client-ad');
    const btnCancelClientAd = document.getElementById('btn-cancel-client-ad');
    
    if (btnAdvertise) {
        btnAdvertise.addEventListener('click', () => {
            // --- 1. Clear text/image fields manually (NOT form.reset() which wipes selects) ---
            const titleEl       = document.getElementById('client-ad-title');
            const descEl        = document.getElementById('client-ad-description');
            const addressEl     = document.getElementById('client-ad-address');
            const scheduleMfEl  = document.getElementById('client-ad-schedule-mf');
            const scheduleSatEl = document.getElementById('client-ad-schedule-sat');
            const scheduleSunEl = document.getElementById('client-ad-schedule-sun');
            const phoneEl       = document.getElementById('client-ad-phone');
            const whatsappEl    = document.getElementById('client-ad-whatsapp');
            const fbEl          = document.getElementById('client-ad-link-fb');
            const igEl          = document.getElementById('client-ad-link-ig');
            const tkEl          = document.getElementById('client-ad-link-tk');
            const charCounter   = document.getElementById('desc-char-counter');

            if (titleEl)       titleEl.value       = '';
            if (descEl)        descEl.value        = '';
            if (addressEl)     addressEl.value     = '';
            if (scheduleMfEl)  scheduleMfEl.value  = '';
            if (scheduleSatEl) scheduleSatEl.value = '';
            if (scheduleSunEl) scheduleSunEl.value = '';
            if (phoneEl)       phoneEl.value       = '';
            if (whatsappEl)    whatsappEl.value    = '';
            if (fbEl)          fbEl.value          = '';
            if (igEl)          igEl.value          = '';
            if (tkEl)          tkEl.value          = '';
            if (charCounter)   charCounter.textContent = '0/220';

            window.clientAdImages = [];
            window.editingAdId = null;
            const previewContainer = document.getElementById('client-ad-image-preview-container');
            const fileText = document.getElementById('client-ad-file-chosen-text');
            if (previewContainer) previewContainer.innerHTML = '';
            if (fileText) fileText.textContent = 'Ninguna foto. ¡Recuerda la portada!';
            const btnSubmit = document.getElementById('btn-submit-client-ad');
            if (btnSubmit) btnSubmit.textContent = 'Continuar al Pago';

            // Open modal immediately so user sees it right away
            clientAdModal.classList.add('active');

            // --- 2. Populate state/city selects ---
            // Use window.activeLocations — the EXACT same source as the Inicio feed filter.
            // It is populated at app startup by populateSelects() → db.getActiveLocations().
            const stateSelect = document.getElementById('client-ad-state');
            const citySelect  = document.getElementById('client-ad-city');

            if (stateSelect && citySelect) {
                // Usa SIEMPRE el catálogo completo para que puedan publicitar en cualquier estado/ciudad
                let locationSource;
                if (typeof catalogData !== 'undefined' && catalogData && catalogData.states) {
                    locationSource = { states: catalogData.states, citiesByState: catalogData.citiesByState };
                } else if (window.activeLocations && window.activeLocations.states) {
                    locationSource = window.activeLocations;
                } else {
                    locationSource = { states: [], citiesByState: {} };
                }

                // Helper: fill cities dropdown for a given state
                function fillCitiesForState(stateName) {
                    citySelect.innerHTML = '<option value="" disabled selected>Selecciona una ciudad</option>';
                    const cities = (locationSource.citiesByState[stateName] || []).slice().sort();
                    cities.forEach(city => {
                        const opt = document.createElement('option');
                        opt.value = city;
                        opt.textContent = city;
                        citySelect.appendChild(opt);
                    });
                }

                // Build state dropdown — clone to prevent duplicate event listeners on each open
                const newStateSelect = stateSelect.cloneNode(false);
                stateSelect.parentNode.replaceChild(newStateSelect, stateSelect);
                newStateSelect.innerHTML = '<option value="" disabled selected>Selecciona un estado</option>';
                locationSource.states.slice().sort().forEach(state => {
                    const opt = document.createElement('option');
                    opt.value = state;
                    opt.textContent = state;
                    newStateSelect.appendChild(opt);
                });
                newStateSelect.addEventListener('change', () => fillCitiesForState(newStateSelect.value));

                // Reset city to placeholder
                citySelect.innerHTML = '<option value="" disabled selected>Selecciona una ciudad</option>';

                // --- Pre-select the user's current location from localStorage cache ---
                // (saved by applyDetectedLocation when GPS runs at app startup)
                try {
                    const cachedStr = localStorage.getItem('revista_last_location');
                    if (cachedStr) {
                        const cached     = JSON.parse(cachedStr);
                        const cachedState = cached.state || '';
                        const cachedCity  = cached.city  || '';

                        // Match state — same partial/case-insensitive logic as applyDetectedLocation
                        const matchedState = locationSource.states.find(s =>
                            s.toLowerCase() === cachedState.toLowerCase() ||
                            cachedState.toLowerCase().includes(s.toLowerCase())
                        );

                        if (matchedState) {
                            newStateSelect.value = matchedState;
                            fillCitiesForState(matchedState);

                            // Match city
                            const cities = locationSource.citiesByState[matchedState] || [];
                            const matchedCity = cities.find(c =>
                                c.toLowerCase() === cachedCity.toLowerCase() ||
                                cachedCity.toLowerCase().includes(c.toLowerCase()) ||
                                c.toLowerCase().includes(cachedCity.toLowerCase())
                            );
                            if (matchedCity) {
                                citySelect.value = matchedCity;
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Ad form: could not pre-select location', e);
                }
            }
        });
    }

    if (btnCloseClientAd) btnCloseClientAd.addEventListener('click', () => clientAdModal.classList.remove('active'));
    if (btnCancelClientAd) btnCancelClientAd.addEventListener('click', (e) => { e.preventDefault(); clientAdModal.classList.remove('active'); });

    // Client Ad Image Upload (Compression up to 7 photos)
    const clientAdUpload = document.getElementById('client-ad-image-upload');
    if (clientAdUpload) {
        clientAdUpload.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (!files.length) return;
            
            window.clientAdImages = window.clientAdImages || [];
            
            if (window.clientAdImages.length + files.length > 7) {
                showAlert('Solo puedes subir hasta 7 fotos.', 'Límite de fotos', 'warning');
                return;
            }

            const uploadBtnLabel = document.querySelector('label[for="client-ad-image-upload"]');
            const originalText = uploadBtnLabel.innerHTML;
            uploadBtnLabel.innerHTML = '<span class="material-symbols-rounded" style="animation: spin 1s linear infinite;">autorenew</span> Procesando...';
            uploadBtnLabel.style.pointerEvents = 'none';

            for (let file of files) {
                try {
                    const compressed = await compressImage(file, 800); // reuse compressImage from app.js
                    window.clientAdImages.push(compressed);
                } catch(err) {
                    console.error("Error compressing ad image", err);
                }
            }
            
            uploadBtnLabel.innerHTML = originalText;
            uploadBtnLabel.style.pointerEvents = 'auto';
            
            renderClientAdImagePreviews();
        });
    }

    window.renderClientAdImagePreviews = function() {
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
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '10px';
            img.style.border = idx === 0 ? '2px solid #f59e0b' : 'none';
            
            if (idx === 0) {
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
                wrapper.appendChild(badge);
            }
            
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 16px;">close</span>';
            delBtn.style.position = 'absolute';
            delBtn.style.top = '-8px';
            delBtn.style.right = '-8px';
            delBtn.style.background = '#ef4444';
            delBtn.style.color = 'white';
            delBtn.style.border = '2px solid var(--surface-color)';
            delBtn.style.borderRadius = '50%';
            delBtn.style.width = '24px';
            delBtn.style.height = '24px';
            delBtn.style.display = 'flex';
            delBtn.style.alignItems = 'center';
            delBtn.style.justifyContent = 'center';
            delBtn.style.cursor = 'pointer';
            delBtn.style.zIndex = '3';
            delBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            
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

    // Init SortableJS for Ads
    if (typeof Sortable !== 'undefined') {
        setTimeout(() => {
            const container = document.getElementById('client-ad-image-preview-container');
            if (container) {
                Sortable.create(container, {
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    dragClass: 'sortable-drag',
                    onEnd: function(evt) {
                        if (evt.oldIndex === evt.newIndex) return;
                        const movedItem = window.clientAdImages.splice(evt.oldIndex, 1)[0];
                        window.clientAdImages.splice(evt.newIndex, 0, movedItem);
                        
                        // Re-render to update PORTADA badge and styles
                        if(typeof window.renderClientAdImagePreviews === 'function') {
                            window.renderClientAdImagePreviews();
                        }
                    }
                });
            }
        }, 100);
    }

    // Form Submit handling for client ads is managed in app.js

    // Override the MercadoPago logic to handle Ad Payments
    const originalOpenMercadoPagoBrick = window.openMercadoPagoBrick;
    window.openMercadoPagoBrick = function(itemId, isRenewal = false, isAd = false) {
        originalOpenMercadoPagoBrick(itemId, isRenewal);
    };

    // Update btn-option-pay-now to pass the correct ID and Type
    const btnOptionPayNow = document.getElementById('btn-option-pay-now');
    if (btnOptionPayNow) {
        const clonedBtn = btnOptionPayNow.cloneNode(true);
        btnOptionPayNow.parentNode.replaceChild(clonedBtn, btnOptionPayNow);
        
        clonedBtn.addEventListener('click', () => {
            document.getElementById('publish-options-modal').classList.remove('active');
            
            if (window.currentPendingAdId) {
                // IT IS AN AD
                openMercadoPagoBrickAd(window.currentPendingAdId);
            } else {
                // IT IS A LISTING
                window.openMercadoPagoBrick(window.currentPendingListingId, false);
            }
        });
    }

    // Pay later button logic for Ad
    const btnOptionPayLater = document.getElementById('btn-option-pay-later');
    if (btnOptionPayLater) {
        const clonedLater = btnOptionPayLater.cloneNode(true);
        btnOptionPayLater.parentNode.replaceChild(clonedLater, btnOptionPayLater);
        
        clonedLater.addEventListener('click', () => {
            document.getElementById('publish-options-modal').classList.remove('active');
            if (window.currentPendingAdId) {
                showAlert('Tu anuncio ha sido guardado y está pendiente de aprobación.', 'Anuncio Creado', 'check_circle');
                window.currentPendingAdId = null;
            } else {
                showAlert('¡Vehículo publicado con éxito! Está pendiente de aprobación.', 'Publicado', 'check_circle');
            }
        });
    }
    
    // Custom Brick logic for Ads (since the original hardcodes 'listings')
    window.openMercadoPagoBrickAd = function(adId) {
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

            const renderPaymentBrick = async (bricksBuilder) => {
                const settings = {
                    initialization: { amount: 500 }, // Ad cost
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
                                    
                                    // Set Ad to active
                                    const ads = db.getAllAds();
                                    const adIdx = ads.findIndex(a => String(a.id) === String(adId));
                                    if(adIdx > -1) {
                                        ads[adIdx].is_active = true;
                                        ads[adIdx].payment_status = 'pagado';
                                        
                                        const now = new Date();
                                        ads[adIdx].start_date = now.toISOString();
                                        const end = new Date(now);
                                        end.setDate(end.getDate() + 30);
                                        ads[adIdx].end_date = end.toISOString();
                                        
                                        await db.saveAd(ads[adIdx]);
                                    }
                                    
                                    showAlert('¡Pago exitoso! Tu anuncio ya está ACTIVO.', 'Pago Aprobado', 'check_circle');
                                    window.currentPendingAdId = null;
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
});
