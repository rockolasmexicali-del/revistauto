// --- Client Ad Flow Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const btnAdvertise = document.getElementById('btn-advertise');
    const clientAdModal = document.getElementById('client-ad-modal');
    const btnCloseClientAd = document.getElementById('btn-close-client-ad');
    const btnCancelClientAd = document.getElementById('btn-cancel-client-ad');
    
    if (btnAdvertise) {
        btnAdvertise.addEventListener('click', () => {
            // Populate states for ad modal
            const stateSelect = document.getElementById('client-ad-state');
            if (stateSelect && stateSelect.options.length <= 1 && catalogData && catalogData.states) {
                catalogData.states.forEach(state => {
                    const opt = document.createElement('option');
                    opt.value = state;
                    opt.textContent = state;
                    stateSelect.appendChild(opt);
                });
                
                stateSelect.addEventListener('change', () => {
                    const citySelect = document.getElementById('client-ad-city');
                    citySelect.innerHTML = '<option value="" disabled selected>Selecciona</option>';
                    const selState = stateSelect.value;
                    if (catalogData.citiesByState[selState]) {
                        catalogData.citiesByState[selState].sort().forEach(city => {
                            const opt = document.createElement('option');
                            opt.value = city;
                            opt.textContent = city;
                            citySelect.appendChild(opt);
                        });
                    }
                });
            }
            
            // Clear form
            const form = document.getElementById('client-ad-form') || document.getElementById('client-ad-form-step2');
            if(form) form.reset();
            window.clientAdImages = [];
            window.editingAdId = null;
            document.getElementById('client-ad-image-preview-container').innerHTML = '';
            document.getElementById('client-ad-file-chosen-text').textContent = 'Ninguna foto. ¡Recuerda la portada!';
            const btnSubmit = document.getElementById('btn-submit-client-ad');
            if(btnSubmit) btnSubmit.textContent = 'Continuar al Pago';

            clientAdModal.classList.add('active');
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

    // Form Submit
    const btnSubmitClientAd = document.getElementById('btn-submit-client-ad');
    if (btnSubmitClientAd) {
        btnSubmitClientAd.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('client-ad-title').value.trim();
            const desc = document.getElementById('client-ad-description').value.trim();
            const state = document.getElementById('client-ad-state').value;
            const city = document.getElementById('client-ad-city').value;
            
            if (!title || !desc || !state || !city) {
                showAlert('Por favor, completa los campos obligatorios.', 'Campos incompletos', 'warning');
                return;
            }
            
            if (!window.clientAdImages || window.clientAdImages.length === 0) {
                showAlert('Debes subir al menos 1 foto para tu portada.', 'Faltan fotos', 'warning');
                return;
            }
            
            btnSubmitClientAd.disabled = true;
            btnSubmitClientAd.textContent = 'Procesando...';
            
            try {
                // Upload images to supabase
                const uploadedImages = [];
                for (let b64 of window.clientAdImages) {
                    if (b64.startsWith('data:image')) {
                        const blob = await (await fetch(b64)).blob();
                        const file = new File([blob], `ad_img_${Date.now()}.jpg`, { type: 'image/jpeg' });
                        const url = await db.uploadImageToSupabase(file);
                        if (url) uploadedImages.push(url);
                    } else {
                        uploadedImages.push(b64);
                    }
                }
                
                const socialLinks = [];
                const fb = document.getElementById('client-ad-link-fb').value.trim();
                const ig = document.getElementById('client-ad-link-ig').value.trim();
                const tk = document.getElementById('client-ad-link-tk').value.trim();
                if (fb) socialLinks.push(fb);
                if (ig) socialLinks.push(ig);
                if (tk) socialLinks.push(tk);
                
                const newAd = {
                    title: title,
                    description: desc,
                    state: state,
                    city: city,
                    phone: document.getElementById('client-ad-phone').value.trim(),
                    whatsapp: document.getElementById('client-ad-whatsapp').value.trim(),
                    social_links: socialLinks,
                    images: uploadedImages
                };

                if (window.editingAdId) {
                    newAd.id = window.editingAdId;
                    const existingAd = db.getAllAds().find(a => a.id === window.editingAdId);
                    if (existingAd) {
                        newAd.payment_status = existingAd.payment_status;
                        newAd.is_active = existingAd.is_active;
                        newAd.start_date = existingAd.start_date;
                        newAd.end_date = existingAd.end_date;
                        newAd.views = existingAd.views;
                        newAd.clicks = existingAd.clicks;
                        newAd.publisher_id = existingAd.publisher_id;
                    }
                    
                    await db.saveAd(newAd);
                    showAlert('¡Anuncio actualizado con éxito!', 'Actualizado', 'check_circle');
                    clientAdModal.classList.remove('active');
                    
                    if (typeof renderMyListings === 'function') {
                        renderMyListings();
                    }
                } else {
                    newAd.payment_status = 'pendiente';
                    newAd.is_active = false;
                    const savedAd = await db.saveAd(newAd);
                    
                    clientAdModal.classList.remove('active');
                    window.currentPendingAdId = savedAd.id;
                    const publishModal = document.getElementById('publish-options-modal');
                    if (publishModal) publishModal.classList.add('active');
                }
                
            } catch (err) {
                console.error(err);
                showAlert('Error al procesar el anuncio.', 'Error', 'error');
            }
            
            btnSubmitClientAd.disabled = false;
            btnSubmitClientAd.textContent = window.editingAdId ? 'Guardar Cambios' : 'Continuar al Pago';

        });
    }

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
