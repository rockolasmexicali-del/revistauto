const defaultCatalogData = {
    makes: [
        'Audi', 'BMW', 'Buick', 'BYD', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 
        'Fiat', 'Ford', 'GMC', 'Genesis', 'Honda', 'Hyundai', 'JAECOO', 'Jeep', 
        'Kenworth', 'Kia', 'Lexus', 'Lincoln', 'Lucid', 'MG', 'Mercedes-Benz', 
        'Mitsubishi', 'Nissan', 'Omoda', 'Peugeot', 'Polestar', 'Ram', 'Renault', 
        'Sea-Doo', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Yamaha'
    ],
    modelsByMake: {
        'Audi': ['A1', 'A3', 'A4', 'A5', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
        'BMW': ['Serie 1', 'Serie 3', 'Serie 4', 'Serie 5', 'X1', 'X3', 'X4', 'X5', 'X6', 'i4'],
        'Buick': ['Encore', 'Envision', 'Enclave'],
        'BYD': ['Dolphin', 'Seal', 'Yuan Plus', 'Han', 'Tang', 'Song Plus'],
        'Cadillac': ['XT4', 'XT5', 'Escalade'],
        'Chevrolet': ['Aveo', 'Onix', 'Cavalier', 'Captiva', 'Tracker', 'Groove', 'Silverado', 'Cheyenne', 'Tornado', 'Tahoe', 'Suburban', 'Camaro', 'Corvette'],
        'Chrysler': ['Pacifica', '300'],
        'Dodge': ['Attitude', 'Journey', 'Charger', 'Challenger', 'Durango'],
        'Fiat': ['Mobi', 'Argo', 'Fastback', 'Pulse', 'Ducato'],
        'Ford': ['Figo', 'Fiesta', 'Focus', 'Mustang', 'Territory', 'Escape', 'Bronco', 'Explorer', 'Expedition', 'Ranger', 'Lobo', 'Maverick', 'Transit'],
        'GMC': ['Terrain', 'Acadia', 'Sierra', 'Yukon'],
        'Genesis': ['G70', 'G80', 'GV70', 'GV80'],
        'Honda': ['City', 'Civic', 'Accord', 'BR-V', 'HR-V', 'CR-V', 'Pilot', 'Odyssey'],
        'Hyundai': ['Grand i10', 'Elantra', 'Sonata', 'Creta', 'Tucson', 'Santa Fe', 'Palisade'],
        'JAECOO': ['J7', 'J8'],
        'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator'],
        'Kenworth': ['T680', 'T880', 'W900'],
        'Kia': ['Picanto', 'Rio', 'K3', 'Forte', 'Optima', 'Soul', 'Seltos', 'Sportage', 'Sorento', 'Telluride'],
        'Lexus': ['IS', 'ES', 'LS', 'UX', 'NX', 'RX', 'LX'],
        'Lincoln': ['Corsair', 'Nautilus', 'Aviator', 'Navigator'],
        'Lucid': ['Air'],
        'MG': ['MG5', 'MG GT', 'ZS', 'HS', 'RX5', 'RX8'],
        'Mercedes-Benz': ['Clase A', 'Clase C', 'Clase E', 'Clase G', 'GLA', 'GLB', 'GLC', 'GLE'],
        'Mitsubishi': ['Mirage', 'Lancer', 'Outlander', 'Montero', 'L200'],
        'Nissan': ['March', 'V-Drive', 'Versa', 'Sentra', 'Altima', 'Kicks', 'X-Trail', 'Pathfinder', 'Frontier', 'NP300', 'Urvan'],
        'Omoda': ['O5', 'C5'],
        'Peugeot': ['208', '301', '2008', '3008', '5008', 'Partner', 'Expert'],
        'Polestar': ['Polestar 2', 'Polestar 3'],
        'Ram': ['700', '1500', '2500', '4000', 'ProMaster'],
        'Renault': ['Kwid', 'Stepway', 'Duster', 'Captur', 'Koleos', 'Kangoo', 'Oroch'],
        'Sea-Doo': ['Spark', 'GTI', 'GTX', 'RXT', 'Wake'],
        'Suzuki': ['Ignis', 'Swift', 'Baleno', 'Ertiga', 'Jimny', 'Vitara', 'S-Cross', 'Grand Vitara'],
        'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
        'Toyota': ['Yaris', 'Corolla', 'Camry', 'Prius', 'Avanza', 'Corolla Cross', 'RAV4', 'Highlander', 'Sienna', 'Hilux', 'Tacoma', 'Tundra'],
        'Volkswagen': ['Polo', 'Vento', 'Virtus', 'Jetta', 'Golf', 'Nivus', 'T-Cross', 'Taos', 'Tiguan', 'Teramont', 'Amarok', 'Saveiro', 'Transporter'],
        'Yamaha': ['R6', 'MT-07', 'Fz-S', 'YZF-R1', 'Tenere 700', 'NMAX']
    },
    types: ['Sedán', 'Pickup', 'SUV', 'Hatchback', 'Deportivo', 'Motocicleta', 'Barco', 'Camión'],
    colors: ['Blanco', 'Negro', 'Plata', 'Gris', 'Rojo', 'Azul', 'Guindo/Tinto', 'Beige', 'Amarillo', 'Verde', 'Otro'],
    states: [
        'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México', 
        'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 
        'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 
        'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
    ],
    citiesByState: {
        'Aguascalientes': ['Aguascalientes', 'Jesús María', 'Calvillo'],
        'Baja California': ['Mexicali', 'Tijuana', 'Ensenada', 'Rosarito', 'Tecate'],
        'Baja California Sur': ['La Paz', 'Los Cabos', 'Cabo San Lucas', 'San José del Cabo'],
        'Campeche': ['Campeche', 'Ciudad del Carmen', 'Champotón'],
        'Chiapas': ['Tuxtla Gutiérrez', 'Tapachula', 'San Cristóbal de las Casas'],
        'Chihuahua': ['Chihuahua', 'Ciudad Juárez', 'Hidalgo del Parral', 'Delicias', 'Cuauhtémoc'],
        'Ciudad de México': ['Ciudad de México'],
        'Coahuila': ['Saltillo', 'Torreón', 'Monclova', 'Piedras Negras', 'Acuña'],
        'Colima': ['Colima', 'Manzanillo', 'Villa de Álvarez', 'Tecomán'],
        'Durango': ['Durango', 'Gómez Palacio', 'Lerdo'],
        'Estado de México': ['Toluca', 'Ecatepec', 'Naucalpan', 'Tlalnepantla', 'Nezahualcóyotl', 'Cuautitlán Izcalli'],
        'Guanajuato': ['León', 'Irapuato', 'Celaya', 'Guanajuato', 'Salamanca', 'San Miguel de Allende'],
        'Guerrero': ['Acapulco', 'Chilpancingo', 'Iguala', 'Zihuatanejo'],
        'Hidalgo': ['Pachuca', 'Tulancingo', 'Tula', 'Ixmiquilpan'],
        'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Puerto Vallarta', 'Tonalá', 'Lagos de Moreno'],
        'Michoacán': ['Morelia', 'Uruapan', 'Zamora', 'Lázaro Cárdenas', 'Pátzcuaro'],
        'Morelos': ['Cuernavaca', 'Jiutepec', 'Cuautla', 'Temixco'],
        'Nayarit': ['Tepic', 'Bahía de Banderas', 'Compostela'],
        'Nuevo León': ['Monterrey', 'San Pedro Garza García', 'Guadalupe', 'Apodaca', 'San Nicolás de los Garza', 'Santa Catarina'],
        'Oaxaca': ['Oaxaca de Juárez', 'Salina Cruz', 'San Juan Bautista Tuxtepec', 'Puerto Escondido'],
        'Puebla': ['Puebla', 'Cholula', 'Tehuacán', 'Atlixco', 'San Martín Texmelucan'],
        'Querétaro': ['Querétaro', 'San Juan del Río', 'Corregidora', 'El Marqués'],
        'Quintana Roo': ['Cancún', 'Playa del Carmen', 'Chetumal', 'Tulum', 'Cozumel'],
        'San Luis Potosí': ['San Luis Potosí', 'Ciudad Valles', 'Soledad de Graciano Sánchez', 'Matehuala'],
        'Sinaloa': ['Culiacán', 'Mazatlán', 'Los Mochis', 'Guasave', 'Navolato'],
        'Sonora': ['Hermosillo', 'Ciudad Obregón', 'Nogales', 'Guaymas', 'Navojoa', 'San Luis Río Colorado'],
        'Tabasco': ['Villahermosa', 'Cárdenas', 'Comalcalco'],
        'Tamaulipas': ['Reynosa', 'Matamoros', 'Nuevo Laredo', 'Tampico', 'Ciudad Victoria', 'Ciudad Madero'],
        'Tlaxcala': ['Tlaxcala', 'Apizaco', 'Huamantla'],
        'Veracruz': ['Veracruz', 'Xalapa', 'Coatzacoalcos', 'Poza Rica', 'Boca del Río', 'Córdoba', 'Orizaba'],
        'Yucatán': ['Mérida', 'Valladolid', 'Tizimín', 'Progreso'],
        'Zacatecas': ['Zacatecas', 'Guadalupe', 'Fresnillo']
    }
};

let catalogData = JSON.parse(localStorage.getItem('revista_autos_catalog')) || defaultCatalogData;
if (!catalogData.colors) catalogData.colors = defaultCatalogData.colors;

const initialListings = [];

class Database {
    constructor() {
        this.listingsKey = 'revista_autos_listings';
        this.suggestionsKey = 'revista_autos_suggestions';
        this.apiBaseUrl = '/api';
        this.isServerConnected = false;
        this.uuidKey = 'revista_autos_uuid';
        this.initUUID();
        this.initializeDB();
        this.syncWithServer();
        this.initRealtime();
    }

    initUUID() {
        let uuid = localStorage.getItem(this.uuidKey);
        if (!uuid) {
            uuid = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem(this.uuidKey, uuid);
        }
        this.uuid = uuid;
    }

    initRealtime() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                this.subscription = supabaseClient
                    .channel('public:listings')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, payload => {
                        console.log('Real-time update received:', payload);
                        this.syncWithServer();
                    })
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            console.log('✅ Realtime conectado para la tabla listings');
                        }
                    });
            } catch (err) {
                console.error('Error al inicializar Supabase Realtime:', err);
            }
        }
    }

    initializeDB() {
        if (!localStorage.getItem(this.listingsKey)) {
            localStorage.setItem(this.listingsKey, JSON.stringify(initialListings));
        }
        if (!localStorage.getItem(this.suggestionsKey)) {
            localStorage.setItem(this.suggestionsKey, JSON.stringify([]));
        }
    }

    async syncWithServer() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('listings')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && Array.isArray(data)) {
                    this.isServerConnected = true;
                    
                    const localListings = JSON.parse(localStorage.getItem(this.listingsKey) || '[]');
                    const localMyListingsMap = new Map();
                    localListings.forEach(l => {
                        if (l.isMyListing || l.publisherId === this.uuid || l.publisher_id === this.uuid) {
                            localMyListingsMap.set(String(l.id), l);
                        }
                    });

                    const serverIds = new Set(data.map(item => String(item.id)));

                    const normalized = data
                        .filter(item => item.status !== 'eliminado' && item.status !== 'rechazado')
                        .map(item => {
                        const isMine = item.publisher_id === this.uuid || item.publisherId === this.uuid || localMyListingsMap.has(String(item.id));
                        const localListing = localMyListingsMap.get(String(item.id));

                        return {
                            ...item,
                            engine: item.engine || item.motor || (localListing ? localListing.engine : ''),
                            legal: item.legal || item.situacion || (localListing ? localListing.legal : ''),
                            ac: item.ac || (localListing ? localListing.ac : ''),
                            mileage: item.mileage !== undefined && item.mileage !== null ? String(item.mileage) : (localListing ? localListing.mileage : ''),
                            phone: item.seller_phone || item.phone || (localListing ? localListing.phone : ''),
                            whatsapp: item.seller_whatsapp || item.whatsapp || (localListing ? localListing.whatsapp : ''),
                            publishedAt: item.published_at || item.publishedAt || (localListing ? localListing.publishedAt : null),
                            expiresAt: item.expires_at || item.expiresAt || (localListing ? localListing.expiresAt : null),
                            lastRenewedMonth: item.last_renewed_month || item.lastRenewedMonth || (localListing ? localListing.lastRenewedMonth : null),
                            paymentStatus: item.payment_status || item.paymentStatus || (localListing ? localListing.paymentStatus : null),
                            images: item.images && item.images.length > 0 ? item.images : (localListing && localListing.images ? localListing.images : ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80']),
                            publisherId: item.publisherId || item.publisher_id || (isMine ? this.uuid : ''),
                            publisher_id: item.publisher_id || item.publisherId || (isMine ? this.uuid : ''),
                            isMyListing: isMine
                        };
                    });

                    // Eliminado: Ya no preservamos publicaciones locales que no existen en el servidor
                    // para evitar "publicaciones fantasma".

                    localStorage.setItem(this.listingsKey, JSON.stringify(normalized));
                    if (typeof window.onServerDataSynced === 'function') {
                        window.onServerDataSynced();
                    }
                } else {
                    console.error('Error fetching listings from Supabase:', error);
                }
            } catch (err) {
                console.error('Network or Supabase error during sync:', err);
                this.isServerConnected = false;
            }
        }
    }

    getAllListings() {
        const listings = JSON.parse(localStorage.getItem(this.listingsKey) || '[]');
        return listings.map(l => ({
            ...l,
            isMyListing: l.publisherId === this.uuid || l.publisher_id === this.uuid
        }));
    }

    // --- ADS MANAGEMENT ---
    getAllAds() {
        const ads = JSON.parse(localStorage.getItem('revista_autos_ads') || '[]');
        return ads.map(a => ({
            ...a,
            isMyAd: a.publisher_id === this.uuid
        }));
    }

    async saveAd(ad) {
        const ads = this.getAllAds();
        
        if (!ad.id) {
            ad.id = Date.now();
            ad.created_at = new Date().toISOString();
            ad.publisher_id = this.uuid;
            ad.views = 0;
            ad.clicks = 0;
            ad.is_active = ad.is_active !== undefined ? ad.is_active : false;
            ad.payment_status = ad.payment_status || 'pendiente';
            ad.images = ad.images || [];
            ad.social_links = ad.social_links || [];
        }

        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const payload = {
                id: ad.id,
                publisher_id: ad.publisher_id,
                title: ad.title,
                description: ad.description || '',
                phone: ad.phone || '',
                whatsapp: ad.whatsapp || '',
                email: ad.email || '',
                website: ad.website || '',
                social_links: ad.social_links || [],
                city: ad.city || '',
                state: ad.state || '',
                images: ad.images || [],
                start_date: ad.start_date || null,
                end_date: ad.end_date || null,
                payment_status: ad.payment_status,
                is_active: ad.is_active,
                views: ad.views || 0,
                clicks: ad.clicks || 0,
                created_at: ad.created_at
            };

            const { data, error } = await supabaseClient.from('ads').upsert([payload]);
            if (error) {
                console.error('⚠️ Error al guardar el Ad en Supabase:', error);
                throw new Error("Error al enviar anuncio a la nube: " + error.message);
            }
        }

        const index = ads.findIndex(a => String(a.id) === String(ad.id));
        if (index > -1) {
            ads[index] = { ...ads[index], ...ad };
        } else {
            ads.push(ad);
        }
        localStorage.setItem('revista_autos_ads', JSON.stringify(ads));
        
        return ad;
    }

    async deleteAd(id) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const ads = this.getAllAds();
            const adToDelete = ads.find(a => String(a.id) === String(id));

            if (adToDelete && adToDelete.images && adToDelete.images.length > 0) {
                const pathsToDelete = [];
                adToDelete.images.forEach(imgUrl => {
                    if (imgUrl.includes('/car-images/')) {
                        const pathParts = imgUrl.split('/car-images/');
                        if (pathParts.length > 1) {
                            pathsToDelete.push(pathParts[1]);
                        }
                    }
                });

                if (pathsToDelete.length > 0) {
                    supabaseClient.storage.from('car-images').remove(pathsToDelete).then(({ error }) => {
                        if (error) console.error('⚠️ Error al eliminar fotos del Ad en Storage:', error);
                    });
                }
            }

            const { error } = await supabaseClient.from('ads').delete().eq('id', id);
            if (error) console.error('⚠️ Error al eliminar Ad en Supabase:', error);
        }

        const currentAds = this.getAllAds();
        const updatedAds = currentAds.filter(a => String(a.id) !== String(id));
        localStorage.setItem('revista_autos_ads', JSON.stringify(updatedAds));
    }

    async uploadImageToSupabase(file) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
                const fileName = `auto_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
                const filePath = `cars/${fileName}`;

                const { data, error } = await supabaseClient.storage
                    .from('car-images')
                    .upload(filePath, file, { cacheControl: '3600', upsert: false });

                if (error) throw error;

                const { data: publicUrlData } = supabaseClient.storage
                    .from('car-images')
                    .getPublicUrl(filePath);

                return publicUrlData.publicUrl;
            } catch (err) {
                console.error('Error al subir imagen a Supabase Storage:', err);
                return null;
            }
        }
        return null;
    }

    async saveListing(listing) {
        const listings = this.getAllListings();
        
        // Configurar los campos del anuncio
        if (!listing.id) {
            listing.id = Date.now();
            listing.publishedAt = new Date().toISOString();
            listing.status = listing.status || 'pendiente autorizacion';
            listing.publisherId = this.uuid;
            listing.publisher_id = this.uuid;
            listing.isMyListing = true;
            listing.views = 0;
            if (!listing.images || listing.images.length === 0) {
                listing.images = ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80'];
            }
        } else {
            listing.publisherId = listing.publisherId || listing.publisher_id || this.uuid;
            listing.publisher_id = listing.publisherId;
            listing.isMyListing = listing.isMyListing !== undefined ? listing.isMyListing : true;
        }

        // Sincronizar PRIMERO con Supabase Cloud
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const payload = {
                id: listing.id,
                title: listing.title,
                type: listing.type,
                make: listing.make,
                model: listing.model,
                year: Number(listing.year),
                price: Number(listing.price),
                state: listing.state || '',
                city: listing.city,
                color: listing.color || '',
                engine: listing.engine || '',
                transmission: listing.transmission || 'Automática',
                mileage: listing.mileage !== undefined && listing.mileage !== null ? String(listing.mileage) : '',
                legal: listing.legal || '',
                ac: listing.ac || '',
                trim: listing.trim || '',
                description: listing.description || '',
                seller_name: listing.seller_name || listing.phone || '',
                seller_phone: listing.phone || '',
                seller_whatsapp: listing.whatsapp || '',
                images: listing.images || [],
                status: listing.status || 'pendiente autorizacion',
                views: listing.views || 0,
                notes: listing.notes || [],
                payments: listing.payments || [],
                publisher_id: listing.publisherId || listing.publisher_id || '',
                published_at: listing.publishedAt || listing.published_at || null,
                expires_at: listing.expiresAt || listing.expires_at || null,
                last_renewed_month: listing.lastRenewedMonth || listing.last_renewed_month || null,
                payment_status: listing.paymentStatus || listing.payment_status || null,
                sold_at: listing.soldAt || listing.sold_at || null
            };

            const { data, error } = await supabaseClient.from('listings').upsert([payload]);
            if (error) {
                console.error('⚠️ Error al guardar en Supabase:', error);
                throw new Error("Error al enviar publicación a la nube: " + error.message);
            }
            console.log('✅ Anuncio sincronizado exitosamente con Supabase Cloud');
        } else {
            const response = await fetch(`${this.apiBaseUrl}/listings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(listing)
            });
            if (!response.ok) {
                throw new Error("Error al enviar publicación al servidor");
            }
        }

        // Si llegamos aquí, la subida a la nube fue un ÉXITO.
        // Solo entonces lo guardamos en la memoria local (localStorage).
        const index = listings.findIndex(l => String(l.id) === String(listing.id));
        if (index > -1) {
            listings[index] = { ...listings[index], ...listing };
        } else {
            listings.push(listing);
        }
        localStorage.setItem(this.listingsKey, JSON.stringify(listings));
        
        return listing;
    }

    async deleteListing(id) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const listings = this.getAllListings();
            const listingToDelete = listings.find(l => String(l.id) === String(id));

            // 1. Eliminar permanentemente las fotos del servidor (Supabase Storage)
            if (listingToDelete && listingToDelete.images && listingToDelete.images.length > 0) {
                const pathsToDelete = [];
                listingToDelete.images.forEach(imgUrl => {
                    // Extraer la ruta del archivo si está alojado en Supabase
                    if (imgUrl.includes('/car-images/')) {
                        const pathParts = imgUrl.split('/car-images/');
                        if (pathParts.length > 1) {
                            pathsToDelete.push(pathParts[1]); // Ejemplo: 'cars/auto_123.jpg'
                        }
                    }
                });

                if (pathsToDelete.length > 0) {
                    supabaseClient.storage.from('car-images').remove(pathsToDelete).then(({ error }) => {
                        if (error) console.error('⚠️ Error al eliminar fotos en Storage:', error);
                        else console.log(`✅ ${pathsToDelete.length} fotos eliminadas permanentemente del servidor.`);
                    });
                }
            }

            // 2. Eliminar permanentemente el registro de la base de datos
            const { error } = await supabaseClient.from('listings').delete().eq('id', id);
            
            if (error) {
                console.error('⚠️ Error al eliminar en Supabase, aplicando soft-delete:', error);
                if (listingToDelete) {
                    listingToDelete.status = 'eliminado';
                    await this.saveListing(listingToDelete);
                }
            } else {
                console.log('✅ Anuncio eliminado permanentemente de la base de datos');
            }
        }

        // 3. Eliminar localmente SIEMPRE para que desaparezca de la UI de quien lo borra
        const currentListings = this.getAllListings();
        const updatedListings = currentListings.filter(l => String(l.id) !== String(id));
        localStorage.setItem(this.listingsKey, JSON.stringify(updatedListings));
    }

    getMyListings() {
        return this.getAllListings().filter(l => l.isMyListing);
    }
    
    isListingActive(listing) {
        if (listing.status !== 'autorizado') return false;

        // Rolling billing: priorizar expiresAt si existe
        if (listing.expiresAt) {
            return new Date(listing.expiresAt) > new Date();
        }

        // Fallback para publicaciones antiguas con lastRenewedMonth
        if (listing.lastRenewedMonth) {
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            return listing.lastRenewedMonth >= currentMonthStr;
        }

        // Sin fecha de vencimiento = publicación de prueba/demo, siempre activa
        return true;
    }

    getPendingRenewals() {
        return this.getAllListings().filter(l => l.status === 'autorizado' && !this.isListingActive(l));
    }

    getRandomListings(count, city = null) {
        let activeListings = this.getAllListings().filter(l => this.isListingActive(l));
        if (city) {
            const cityListings = activeListings.filter(l => l.city === city);
            if (cityListings.length >= count/2) {
                activeListings = cityListings;
            }
        }
        const shuffled = activeListings.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    search(criteria) {
        let results = this.getAllListings().filter(l => this.isListingActive(l));
        
        if (criteria.query) {
            const q = criteria.query.toLowerCase();
            results = results.filter(l => 
                (l.title && l.title.toLowerCase().includes(q)) || 
                (l.make && l.make.toLowerCase().includes(q)) || 
                (l.model && l.model.toLowerCase().includes(q)) ||
                (l.type && l.type.toLowerCase().includes(q))
            );
        }
        
        if (criteria.cities && criteria.cities.length > 0) {
            results = results.filter(l => criteria.cities.includes(l.city));
        }
        if (criteria.minYear) {
            results = results.filter(l => Number(l.year) >= criteria.minYear);
        }
        if (criteria.maxYear) {
            results = results.filter(l => Number(l.year) <= criteria.maxYear);
        }
        if (criteria.transmission && criteria.transmission !== 'Todas') {
            results = results.filter(l => l.transmission === criteria.transmission);
        }
        if (criteria.legal && criteria.legal !== 'Todas') {
            results = results.filter(l => l.legal === criteria.legal);
        }

        if (criteria.color && criteria.color !== 'Todos') {
            results = results.filter(l => l.color === criteria.color);
        }
        return results;
    }
    
    markAsSold(id) {
        const listings = this.getAllListings();
        const index = listings.findIndex(l => String(l.id) === String(id));
        if (index !== -1) {
            listings[index].status = 'vendido';
            listings[index].soldAt = new Date().toISOString();
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
            this.saveListing(listings[index]);
        }
    }

    renewListing(id) {
        const listings = this.getAllListings();
        const index = listings.findIndex(l => String(l.id) === String(id));
        if (index !== -1) {
            const currentExp = listings[index].expiresAt ? new Date(listings[index].expiresAt) : new Date();
            const baseDate = currentExp > new Date() ? currentExp : new Date();
            baseDate.setDate(baseDate.getDate() + 30);
            listings[index].expiresAt = baseDate.toISOString();
            listings[index].status = 'autorizado';
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
            this.saveListing(listings[index]);
        }
    }

    updateListing(id, updatedData) {
        const listings = this.getAllListings();
        const index = listings.findIndex(l => String(l.id) === String(id));
        if (index !== -1) {
            listings[index] = { ...listings[index], ...updatedData };
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
            this.saveListing(listings[index]);
        }
    }

    // --- Sugerencias de Catálogo ---
    getSuggestions() {
        return JSON.parse(localStorage.getItem(this.suggestionsKey) || '[]');
    }

    addSuggestion(type, value, parentMake = null) {
        if(!value || value.trim() === '') return;
        const suggestions = this.getSuggestions();
        const valueTrim = value.trim();
        
        let existing = suggestions.find(s => s.type === type && s.value.toLowerCase() === valueTrim.toLowerCase() && s.parentMake === parentMake);
        if (existing) {
            existing.count += 1;
        } else {
            existing = {
                id: Date.now() + Math.random(),
                type: type,
                value: valueTrim,
                parentMake: parentMake,
                count: 1,
                status: 'pending'
            };
            suggestions.push(existing);
        }
        
        if (existing.count >= 2 && existing.status !== 'approved') {
            existing.status = 'approved';
            
            if (existing.type === 'make') {
                if (!catalogData.makes.includes(existing.value)) {
                    catalogData.makes.push(existing.value);
                    catalogData.modelsByMake[existing.value] = [];
                }
            } else if (existing.type === 'model' && existing.parentMake) {
                if (!catalogData.modelsByMake[existing.parentMake]) {
                    catalogData.modelsByMake[existing.parentMake] = [];
                }
                if (!catalogData.modelsByMake[existing.parentMake].includes(existing.value)) {
                    catalogData.modelsByMake[existing.parentMake].push(existing.value);
                }
            } else if (existing.type === 'type') {
                if (!catalogData.types.includes(existing.value)) {
                    catalogData.types.push(existing.value);
                }
            }
            localStorage.setItem('revista_autos_catalog', JSON.stringify(catalogData));
        }

        localStorage.setItem(this.suggestionsKey, JSON.stringify(suggestions));
    }

    addListingNote(id, noteText) {
        if (!noteText || !noteText.trim()) return null;
        const listings = this.getAllListings();
        const index = listings.findIndex(l => String(l.id) === String(id));
        if (index !== -1) {
            if (!listings[index].notes) {
                listings[index].notes = [];
            }
            const now = new Date();
            const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
            
            const newNote = {
                id: Date.now(),
                timestamp: `${dateStr}, ${timeStr}`,
                text: noteText.trim()
            };
            listings[index].notes.unshift(newNote);
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
            this.saveListing(listings[index]);
            return newNote;
        }
        return null;
    }

    addPayment(listingId, amount, receiptImage, type = 'Aprobación', method = 'manual') {
        const listings = this.getAllListings();
        const index = listings.findIndex(l => String(l.id) === String(listingId));
        if (index !== -1) {
            if (!listings[index].payments) {
                listings[index].payments = [];
            }
            const now = new Date();
            const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
            
            const newPayment = {
                id: Date.now(),
                date: `${dateStr}, ${timeStr}`,
                dateISO: now.toISOString(),
                amount: amount,
                receiptImage: receiptImage || null,
                type: type,
                method: method // 'mercadopago' | 'manual'
            };
            listings[index].payments.push(newPayment);
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
            this.saveListing(listings[index]);
            
            // Add CRM Note
            this.addListingNote(listingId, `Pago registrado: $${amount} MXN (${type}) [${method === 'mercadopago' ? 'Tarjeta MP' : 'Manual'}]`);

            return newPayment;
        }
        return null;
    }

    getAllPayments() {
        const listings = this.getAllListings();
        let allPayments = [];
        listings.forEach(l => {
            if (l.payments && l.payments.length > 0) {
                l.payments.forEach(p => {
                    allPayments.push({
                        ...p,
                        listingId: l.id,
                        listingTitle: l.title,
                        timestamp: p.id
                    });
                });
            }
        });
        return allPayments.sort((a, b) => b.timestamp - a.timestamp);
    }

    // --- Nuevos métodos para Supabase (Settings, Auth, Locations) ---
    async getSettings() {
        const defaultSettings = { monthlyPrice: 500, mercadoPagoEnabled: false, mpPublicKey: '', mpAccessToken: '', ads_enabled: true, ad_frequency_scroll: 10 };
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const { data, error } = await supabaseClient.from('settings').select('*').eq('id', 1).maybeSingle();
            if (data) {
                return { 
                    success: true, 
                    settings: {
                        monthlyPrice: data.monthlyprice !== undefined ? data.monthlyprice : (data.monthlyPrice || 500),
                        mercadoPagoEnabled: data.mercadopagoenabled !== undefined ? data.mercadopagoenabled : (data.mercadoPagoEnabled || false),
                        mpPublicKey: data.mppublickey !== undefined ? data.mppublickey : (data.mpPublicKey || ''),
                        mpAccessToken: data.mpaccesstoken !== undefined ? data.mpaccesstoken : (data.mpAccessToken || '')
                    } 
                };
            }
            if (error) console.error('Error fetching settings:', error);
        }
        const local = localStorage.getItem('revista_settings');
        return { success: true, settings: local ? JSON.parse(local) : defaultSettings };
    }

    async saveSettings(settings) {
        localStorage.setItem('revista_settings', JSON.stringify(settings));
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                // Postgres guarda columnas sin comillas en minúsculas. Mapeamos de camelCase a minúsculas
                const payload = { 
                    id: 1, 
                    monthlyprice: settings.monthlyPrice,
                    mercadopagoenabled: settings.mercadoPagoEnabled,
                    mppublickey: settings.mpPublicKey,
                    mpaccesstoken: settings.mpAccessToken,
                    ads_enabled: settings.ads_enabled,
                    ad_frequency_scroll: settings.ad_frequency_scroll
                };
                const { error } = await supabaseClient.from('settings').upsert([payload]);
                if (error) {
                    return { success: false, error: error.message };
                }
            } catch (err) {
                // Si el proyecto de Supabase está pausado o eliminado, lanza error de red
                return { success: false, error: "No se pudo conectar a la base de datos (Supabase puede estar pausado o inactivo). Error: " + err.message };
            }
        }
        return { success: true };
    }

    async getActiveLocations() {
        let activeListings = [];
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                // Consultar estados y ciudades directamente de los autos autorizados
                const { data, error } = await supabaseClient
                    .from('listings')
                    .select('state, city, expires_at, status')
                    .eq('status', 'autorizado');
                
                if (!error && data) {
                    activeListings = data.filter(l => {
                        if (l.expires_at) {
                            return new Date(l.expires_at) > new Date();
                        }
                        return true;
                    });
                } else {
                    activeListings = this.getAllListings().filter(l => this.isListingActive(l));
                }
            } catch(e) {
                activeListings = this.getAllListings().filter(l => this.isListingActive(l));
            }
        } else {
            activeListings = this.getAllListings().filter(l => this.isListingActive(l));
        }

        const locationsMap = {};
        
        activeListings.forEach(l => {
            let state = l.state;
            const city = l.city;
            
            // Si no hay estado pero sí ciudad, intentar deducirlo del catálogo
            if (!state && city && typeof catalogData !== 'undefined') {
                for (const s of catalogData.states) {
                    if (catalogData.citiesByState[s] && catalogData.citiesByState[s].includes(city)) {
                        state = s;
                        break;
                    }
                }
            }
            
            if (state) {
                if (!locationsMap[state]) locationsMap[state] = [];
                if (city && !locationsMap[state].includes(city)) {
                    locationsMap[state].push(city);
                }
            }
        });

        if (Object.keys(locationsMap).length > 0) {
            return { success: true, locations: locationsMap };
        }

        // Fallback default
        return { success: true, locations: { "Nuevo León": ["Monterrey", "San Pedro", "San Nicolás"], "Jalisco": ["Guadalajara", "Zapopan"] } };
    }

    async loginAdmin(username, password) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('admin_users')
                    .select('*')
                    .eq('username', username)
                    .eq('password', password)
                    .maybeSingle();
                
                if (error) {
                    console.error("Error consultando admin_users:", error);
                }

                if (data) {
                    return { 
                        success: true, 
                        token: 'admin-token-' + data.id, 
                        role: data.role, 
                        user: { id: data.id, username: data.username, role: data.role, allowedStates: data.allowedStates, allowedCities: data.allowedCities } 
                    };
                }
            } catch (err) {
                console.warn("Error de red al consultar admin_users en Supabase, aplicando fallback:", err);
            }
        }
        
        // Fallback seguro en caso de que la tabla aún no tenga el usuario admin o no haya red
        if (username === 'admin' && password === 'admin') {
            return { 
                success: true, 
                token: 'fake-token',
                role: 'admin',
                user: { id: 0, username: 'admin', role: 'admin' }
            };
        }

        return { success: false, error: 'Credenciales inválidas' };
    }

    async getAdminUsers() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { data, error } = await supabaseClient.from('admin_users').select('*');
                if (data) {
                    const mappedUsers = data.map(u => ({
                        ...u,
                        allowedStates: u.allowedstates,
                        allowedCities: u.allowedcities
                    }));
                    return { success: true, users: mappedUsers };
                }
            } catch (err) {
                console.warn("Error consultando getAdminUsers en Supabase:", err);
            }
        }
        return { success: true, users: [] };
    }

    async saveAdminUser(user) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const dbUser = {
                    ...user,
                    allowedstates: user.allowedStates,
                    allowedcities: user.allowedCities
                };
                delete dbUser.allowedStates;
                delete dbUser.allowedCities;
                
                const { error } = await supabaseClient.from('admin_users').upsert([dbUser]);
                if (error) console.warn("Error guardando adminUser en Supabase:", error.message);
            } catch (err) {
                console.warn("Error de red guardando adminUser en Supabase:", err);
            }
        }
        return { success: true };
    }

    async deleteAdminUser(id) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { error } = await supabaseClient.from('admin_users').delete().eq('id', id);
                if (error) console.warn("Error eliminando adminUser en Supabase:", error.message);
            } catch (err) {
                console.warn("Error de red eliminando adminUser en Supabase:", err);
            }
        }
        return { success: true };
    }

    // --- Analytics Reales ---
    async incrementViews(id) {
        // Evitar múltiples conteos por sesión para el mismo anuncio
        let viewedThisSession = [];
        try {
            viewedThisSession = JSON.parse(sessionStorage.getItem('revista_autos_viewed_session') || '[]');
        } catch (e) {}

        if (viewedThisSession.includes(String(id))) {
            const listings = this.getAllListings();
            const listing = listings.find(l => String(l.id) === String(id));
            return listing ? listing.views : 0;
        }

        viewedThisSession.push(String(id));
        sessionStorage.setItem('revista_autos_viewed_session', JSON.stringify(viewedThisSession));

        // Incrementamos localmente primero
        const listings = this.getAllListings();
        const listing = listings.find(l => String(l.id) === String(id));
        if (listing) {
            listing.views = (listing.views || 0) + 1;
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
        }

        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const now = new Date();
                const visit_date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                
                const { error } = await supabaseClient.rpc('increment_visit', {
                    listing_id: id,
                    visit_date: visit_date
                });
                
                if (error) {
                    console.warn("Error RPC increment_visit, aplicando fallback local:", error.message);
                }
            } catch (err) {
                console.warn("Error de red incrementando vistas:", err);
            }
        }
        return listing ? listing.views : 0;
    }

    async fetchTrafficStats() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('daily_visits')
                    .select('*')
                    .order('date', { ascending: true });
                    
                if (error) {
                    console.warn("Error fetching daily_visits:", error.message);
                    return [];
                }
                return data || [];
            } catch (err) {
                console.warn("Error de red obteniendo daily_visits:", err);
                return [];
            }
        }
        return [];
    }
    // ==========================================
    // SECCIÓN DE ANUNCIOS Y PUBLICIDAD (FASE 1)
    // ==========================================

    async syncAdsWithServer() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('ads')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && Array.isArray(data)) {
                    const normalizedAds = data.map(ad => ({
                        ...ad,
                        social_links: typeof ad.social_links === 'string' ? JSON.parse(ad.social_links) : (ad.social_links || [])
                    }));
                    localStorage.setItem('revista_autos_ads', JSON.stringify(normalizedAds));
                    if (typeof window.onAdsSynced === 'function') window.onAdsSynced();
                }
            } catch (err) {
                console.error('Error fetching ads from Supabase:', err);
            }
        }
    }

    getAllAds() {
        return JSON.parse(localStorage.getItem('revista_autos_ads') || '[]');
    }

    getMyAds() {
        return this.getAllAds().filter(ad => ad.publisher_id === this.uuid);
    }

    isAdActive(ad) {
        if (ad.is_active === false) return false;
        const now = new Date();
        if (ad.start_date && new Date(ad.start_date) > now) return false;
        if (ad.end_date && new Date(ad.end_date) < now) return false;
        return true;
    }

    getRandomAds(count, city = null) {
        let activeAds = this.getAllAds().filter(ad => this.isAdActive(ad));
        if (city) {
            const cityAds = activeAds.filter(ad => ad.city === city);
            if (cityAds.length > 0) activeAds = cityAds; 
        }
        return activeAds.sort(() => 0.5 - Math.random()).slice(0, count);
    }

    async saveAd(ad) {
        let isNew = !ad.id;
        if (!ad.publisher_id) ad.publisher_id = this.uuid;
        
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const payload = { ...ad };
            if (isNew) delete payload.id; // Let DB generate ID
            
            const { data, error } = await supabaseClient.from('ads').upsert([payload]).select();
            if (error) throw new Error("Error al guardar anuncio en Supabase: " + error.message);
            
            if (data && data.length > 0) {
                ad = { ...ad, ...data[0] };
            }
        }
        
        const ads = this.getAllAds();
        const index = ads.findIndex(a => String(a.id) === String(ad.id));
        if (index > -1) ads[index] = ad;
        else ads.push(ad);
        
        localStorage.setItem('revista_autos_ads', JSON.stringify(ads));
        return ad;
    }

    async deleteAd(id) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const { error } = await supabaseClient.from('ads').delete().eq('id', id);
            if (error) console.error("Error al eliminar anuncio:", error);
        }
        const ads = this.getAllAds().filter(a => String(a.id) !== String(id));
        localStorage.setItem('revista_autos_ads', JSON.stringify(ads));
    }

    async incrementAdViews(adId) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const ad = this.getAllAds().find(a => String(a.id) === String(adId));
            if (ad) {
                ad.views = (ad.views || 0) + 1;
                await supabaseClient.from('ads').update({ views: ad.views }).eq('id', adId);
                const ads = this.getAllAds();
                const idx = ads.findIndex(a => String(a.id) === String(adId));
                if (idx > -1) {
                    ads[idx].views = ad.views;
                    localStorage.setItem('revista_autos_ads', JSON.stringify(ads));
                }
            }
        }
    }

    async incrementAdClicks(adId) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const ad = this.getAllAds().find(a => String(a.id) === String(adId));
            if (ad) {
                ad.clicks = (ad.clicks || 0) + 1;
                await supabaseClient.from('ads').update({ clicks: ad.clicks }).eq('id', adId);
                const ads = this.getAllAds();
                const idx = ads.findIndex(a => String(a.id) === String(adId));
                if (idx > -1) {
                    ads[idx].clicks = ad.clicks;
                    localStorage.setItem('revista_autos_ads', JSON.stringify(ads));
                }
            }
        }
    }
}

const db = new Database();

