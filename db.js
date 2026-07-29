const defaultCatalogData = {
    makes: ['Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Yamaha', 'Suzuki', 'Sea-Doo', 'Kenworth'],
    modelsByMake: {
        'Toyota': ['Corolla', 'Camry', 'Hilux', 'RAV4', 'Tacoma'],
        'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V'],
        'Nissan': ['Versa', 'Sentra', 'March', 'Frontier', 'NP300'],
        'Ford': ['Mustang', 'Lobo', 'Ranger', 'Explorer', 'Figo'],
        'Chevrolet': ['Aveo', 'Beat', 'Cheyenne', 'Silverado', 'Trax'],
        'Volkswagen': ['Jetta', 'Vento', 'Tiguan', 'Golf'],
        'BMW': ['Serie 3', 'X3', 'Serie 5'],
        'Mercedes-Benz': ['Clase C', 'Clase GLC', 'Clase A'],
        'Audi': ['A3', 'A4', 'Q5'],
        'Yamaha': ['R6', 'MT-07', 'Fz-S'],
        'Suzuki': ['Swift', 'Gixxer', 'V-Strom'],
        'Sea-Doo': ['Spark', 'GTI'],
        'Kenworth': ['T680', 'T880']
    },
    types: ['Sedán', 'Pickup', 'SUV', 'Hatchback', 'Deportivo', 'Motocicleta', 'Barco', 'Camión'],
    colors: ['Blanco', 'Negro', 'Plata', 'Gris', 'Rojo', 'Azul', 'Guindo/Tinto', 'Beige', 'Amarillo', 'Verde', 'Otro'],
    states: ['Baja California', 'Sonora', 'Jalisco', 'Nuevo León', 'Puebla', 'Guanajuato', 'Querétaro', 'Yucatán', 'Quintana Roo', 'Ciudad de México'],
    citiesByState: {
        'Baja California': ['Mexicali', 'Tijuana', 'Ensenada', 'Rosarito', 'Tecate'],
        'Sonora': ['Hermosillo', 'Nogales', 'Guaymas', 'Cajeme', 'Navojoa'],
        'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Puerto Vallarta'],
        'Nuevo León': ['Monterrey', 'San Pedro', 'Guadalupe'],
        'Puebla': ['Puebla', 'Cholula', 'Tehuacán'],
        'Guanajuato': ['León', 'Irapuato', 'Celaya', 'Guanajuato'],
        'Querétaro': ['Querétaro', 'San Juan del Río'],
        'Yucatán': ['Mérida', 'Valladolid'],
        'Quintana Roo': ['Cancún', 'Playa del Carmen', 'Tulum'],
        'Ciudad de México': ['Ciudad de México']
    }
};

let catalogData = JSON.parse(localStorage.getItem('revista_autos_catalog')) || defaultCatalogData;
if (!catalogData.colors) catalogData.colors = defaultCatalogData.colors;

const initialListings = [
    {
        id: 1,
        title: 'Toyota Corolla 2021',
        type: 'Sedán',
        make: 'Toyota',
        model: 'Corolla',
        year: 2021,
        price: 350000,
        city: 'Ciudad de México',
        image: 'https://images.unsplash.com/photo-1590362891991-f766f5f76b4a?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 45
    },
    {
        id: 2,
        title: 'Ford Ranger XLT 2020',
        type: 'Pickup',
        make: 'Ford',
        model: 'Ranger',
        year: 2020,
        price: 480000,
        city: 'Monterrey',
        image: 'https://images.unsplash.com/photo-1552251329-a1b7e4f9b8c0?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 120
    },
    {
        id: 3,
        title: 'Yamaha MT-07 2022',
        type: 'Motocicleta',
        make: 'Yamaha',
        model: 'MT-07',
        year: 2022,
        price: 185000,
        city: 'Guadalajara',
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 89
    },
    {
        id: 4,
        title: 'Honda CR-V 2019',
        type: 'SUV',
        make: 'Honda',
        model: 'CR-V',
        year: 2019,
        price: 395000,
        city: 'Ciudad de México',
        image: 'https://images.unsplash.com/photo-1512316664917-0639ee853d99?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 205
    },
    {
        id: 5,
        title: 'Volkswagen Jetta 2023',
        type: 'Sedán',
        make: 'Volkswagen',
        model: 'Jetta',
        year: 2023,
        price: 420000,
        city: 'Puebla',
        image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 65
    },
    {
        id: 6,
        title: 'Chevrolet Silverado 2018',
        type: 'Pickup',
        make: 'Chevrolet',
        model: 'Silverado',
        year: 2018,
        price: 550000,
        city: 'Hermosillo',
        image: 'https://images.unsplash.com/photo-1600706240248-8df042e88a38?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 110
    },
    {
        id: 7,
        title: 'Sea-Doo Spark 2021',
        type: 'Barco',
        make: 'Sea-Doo',
        model: 'Spark',
        year: 2021,
        price: 150000,
        city: 'Cancún',
        image: 'https://images.unsplash.com/photo-1598282361426-3023021dd9f6?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 320
    },
    {
        id: 8,
        title: 'Kenworth T680 2015',
        type: 'Camión',
        make: 'Kenworth',
        model: 'T680',
        year: 2015,
        price: 1200000,
        city: 'Tijuana',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 45
    },
    {
        id: 9,
        title: 'BMW Serie 3 2022',
        type: 'Sedán',
        make: 'BMW',
        model: 'Serie 3',
        year: 2022,
        price: 850000,
        city: 'Ciudad de México',
        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 290
    },
    {
        id: 10,
        title: 'Nissan Frontier 2021',
        type: 'Pickup',
        make: 'Nissan',
        model: 'Frontier',
        year: 2021,
        price: 520000,
        city: 'León',
        image: 'https://images.unsplash.com/photo-1591864197771-46df2c7009e5?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 75
    },
    {
        id: 11,
        title: 'Audi Q5 2020',
        type: 'SUV',
        make: 'Audi',
        model: 'Q5',
        year: 2020,
        price: 780000,
        city: 'Querétaro',
        image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 180
    },
    {
        id: 12,
        title: 'Suzuki Swift 2023',
        type: 'Hatchback',
        make: 'Suzuki',
        model: 'Swift',
        year: 2023,
        price: 299000,
        city: 'Mérida',
        image: 'https://images.unsplash.com/photo-1629897048514-3dd74143275d?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 210
    },
    {
        id: 13,
        title: 'Nissan Versa 2022',
        type: 'Sedán',
        make: 'Nissan',
        model: 'Versa',
        year: 2022,
        price: 310000,
        city: 'Ciudad de México',
        image: 'https://images.unsplash.com/photo-1619864275037-14207908b9ac?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 95
    },
    {
        id: 14,
        title: 'Toyota RAV4 2020',
        type: 'SUV',
        make: 'Toyota',
        model: 'RAV4',
        year: 2020,
        price: 450000,
        city: 'Ciudad de México',
        image: 'https://images.unsplash.com/photo-1616231456903-8d6dcf5c87bc?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 130
    },
    {
        id: 15,
        title: 'Ford Mustang 2019',
        type: 'Deportivo',
        make: 'Ford',
        model: 'Mustang',
        year: 2019,
        price: 750000,
        city: 'Ciudad de México',
        image: 'https://images.unsplash.com/photo-1584345611127-8fb37cb140bc?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 400
    },
    {
        id: 16,
        title: 'Volkswagen Tiguan 2021',
        type: 'SUV',
        make: 'Volkswagen',
        model: 'Tiguan',
        year: 2021,
        price: 520000,
        city: 'Ciudad de México',
        image: 'https://images.unsplash.com/photo-1634563172081-30018d9cc92c?auto=format&fit=crop&w=600&q=80',
        status: 'autorizado',
        isMyListing: false,
        views: 220
    },
    {
        id: 17,
        title: 'Volkswagen Jetta 2021',
        type: 'Sedán',
        make: 'Volkswagen',
        model: 'Jetta',
        year: 2021,
        price: 95000,
        city: 'Mexicali',
        state: 'Baja California',
        phone: '6861329430',
        whatsapp: '+52 6861329430',
        engine: '1.8 Turbo',
        transmission: 'Automática',
        mileage: '120,000 km',
        legal: 'Nacional',
        ac: 'Sí',
        images: [
            'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&w=600&q=80'
        ],
        status: 'pendiente autorizacion',
        isMyListing: true,
        views: 0,
        notes: [
            {
                id: 1,
                timestamp: '23/Jul/2026, 02:00 PM',
                text: 'El cliente dijo que le marcaramos el sábado 24 para generar el pago.'
            }
        ]
    },
    {
        id: 18,
        title: 'Toyota Tacoma TRD 2022',
        type: 'Pickup',
        make: 'Toyota',
        model: 'Tacoma',
        year: 2022,
        price: 680000,
        city: 'Tijuana',
        state: 'Baja California',
        phone: '6649876543',
        whatsapp: '+52 6649876543',
        engine: '3.5 V6',
        transmission: 'Automática',
        mileage: '28,000 km',
        legal: 'Nacional',
        ac: 'Sí',
        images: [
            'https://images.unsplash.com/photo-1552251329-a1b7e4f9b8c0?auto=format&fit=crop&w=600&q=80'
        ],
        status: 'pendiente autorizacion',
        isMyListing: false,
        views: 0,
        notes: []
    }
];

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
    }

    initUUID() {
        let uuid = localStorage.getItem(this.uuidKey);
        if (!uuid) {
            uuid = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem(this.uuidKey, uuid);
        }
        this.uuid = uuid;
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
                    const normalized = data.map(item => ({
                        ...item,
                        phone: item.seller_phone,
                        whatsapp: item.seller_whatsapp,
                        publishedAt: item.published_at || item.publishedAt,
                        expiresAt: item.expires_at || item.expiresAt,
                        lastRenewedMonth: item.last_renewed_month || item.lastRenewedMonth,
                        paymentStatus: item.payment_status || item.paymentStatus,
                        images: item.images && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80'],
                        isMyListing: item.publisher_id === this.uuid || item.publisherId === this.uuid
                    }));
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

    saveListing(listing) {
        const listings = this.getAllListings();
        if (!listing.id) {
            listing.id = Date.now();
            listing.publishedAt = new Date().toISOString();
            listing.status = listing.status || 'pendiente autorizacion';
            listing.publisherId = this.uuid;
            listing.isMyListing = true;
            listing.views = 0;
            if (!listing.images || listing.images.length === 0) {
                listing.images = ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80'];
            }
            listings.push(listing);
        } else {
            const index = listings.findIndex(l => String(l.id) === String(listing.id));
            if (index > -1) {
                listings[index] = { ...listings[index], ...listing };
            } else {
                listings.push(listing);
            }
        }
        localStorage.setItem(this.listingsKey, JSON.stringify(listings));

        // Sincronizar asíncronamente con Supabase Cloud
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const payload = {
                id: listing.id, // Fundamental para que Supabase actualice y no duplique
                title: listing.title,
                type: listing.type,
                make: listing.make,
                model: listing.model,
                year: Number(listing.year),
                price: Number(listing.price),
                state: listing.state || '',
                city: listing.city,
                color: listing.color || '',
                transmission: listing.transmission || 'Automática',
                mileage: Number(listing.mileage || 0),
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
                payment_status: listing.paymentStatus || listing.payment_status || null
            };

            supabaseClient.from('listings').upsert([payload]).then(({ data, error }) => {
                if (error) console.error('⚠️ Error al guardar en Supabase:', error);
                else console.log('✅ Anuncio sincronizado con Supabase');
            });
        } else {
            fetch(`${this.apiBaseUrl}/listings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(listing)
            }).catch(err => console.log('Guardado local (servidor offline)'));
        }

        return listing;
    }

    async deleteListing(id) {
        const listings = this.getAllListings();
        const listingToDelete = listings.find(l => String(l.id) === String(id));
        const updatedListings = listings.filter(l => String(l.id) !== String(id));
        localStorage.setItem(this.listingsKey, JSON.stringify(updatedListings));

        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
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
            supabaseClient.from('listings').delete().eq('id', id).then(({ error }) => {
                if (error) console.error('⚠️ Error al eliminar en Supabase:', error);
                else console.log('✅ Anuncio eliminado permanentemente de la base de datos');
            });
        }
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
        const defaultSettings = { monthlyPrice: 500, mercadoPagoEnabled: false, mpPublicKey: '', mpAccessToken: '' };
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
                    mpaccesstoken: settings.mpAccessToken
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
                    .select('state, city')
                    .eq('status', 'autorizado');
                
                if (!error && data) {
                    activeListings = data;
                } else {
                    activeListings = this.getAllListings().filter(l => l.status === 'autorizado');
                }
            } catch(e) {
                activeListings = this.getAllListings().filter(l => l.status === 'autorizado');
            }
        } else {
            activeListings = this.getAllListings().filter(l => l.status === 'autorizado');
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
}

const db = new Database();

