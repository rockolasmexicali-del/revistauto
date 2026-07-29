const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const dbFilePath = path.join(dataDir, 'database.json');

// Semillas iniciales por defecto
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
        images: ['https://images.unsplash.com/photo-1590362891991-f766f5f76b4a?auto=format&fit=crop&w=600&q=80'],
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
        images: ['https://images.unsplash.com/photo-1552251329-a1b7e4f9b8c0?auto=format&fit=crop&w=600&q=80'],
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
        images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80'],
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
        images: ['https://images.unsplash.com/photo-1512316664917-0639ee853d99?auto=format&fit=crop&w=600&q=80'],
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
        images: ['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80'],
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
        images: ['https://images.unsplash.com/photo-1600706240248-8df042e88a38?auto=format&fit=crop&w=600&q=80'],
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
        images: ['https://images.unsplash.com/photo-1598282361426-3023021dd9f6?auto=format&fit=crop&w=600&q=80'],
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
        images: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'],
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
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80'],
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
        images: ['https://images.unsplash.com/photo-1591864197771-46df2c7009e5?auto=format&fit=crop&w=600&q=80'],
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
        images: ['https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80'],
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
        images: ['https://images.unsplash.com/photo-1629897048514-3dd74143275d?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 210
    }
];

const usersFilePath = path.join(dataDir, 'users.json');

// ...
class BackendDatabase {
    constructor() {
        this.init();
    }

    init() {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        if (!fs.existsSync(dbFilePath)) {
            const initialData = {
                listings: initialListings,
                catalog: defaultCatalogData,
                suggestions: [],
                settings: { monthlyPrice: 500, mercadoPagoEnabled: false, mpPublicKey: '', mpAccessToken: '' }
            };
            fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
        }
        if (!fs.existsSync(usersFilePath)) {
            const initialUsers = [
                {
                    id: 1,
                    username: 'admin',
                    password: '123', // TODO: Hash in production
                    role: 'admin',
                    allowedStates: [],
                    allowedCities: []
                }
            ];
            fs.writeFileSync(usersFilePath, JSON.stringify(initialUsers, null, 2), 'utf-8');
        }
    }

    readDB() {
        try {
            const content = fs.readFileSync(dbFilePath, 'utf-8');
            const data = JSON.parse(content);
            if (!data.settings) data.settings = { monthlyPrice: 500, mercadoPagoEnabled: false, mpPublicKey: '', mpAccessToken: '' };
            return data;
        } catch (e) {
            console.error('Error leyendo base de datos:', e);
            return { listings: [], catalog: defaultCatalogData, suggestions: [], settings: { monthlyPrice: 500, mercadoPagoEnabled: false, mpPublicKey: '', mpAccessToken: '' } };
        }
    }

    writeDB(data) {
        try {
            fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
            return true;
        } catch (e) {
            console.error('Error escribiendo en base de datos:', e);
            return false;
        }
    }

    readUsers() {
        try {
            const content = fs.readFileSync(usersFilePath, 'utf-8');
            return JSON.parse(content);
        } catch(e) {
            console.error('Error leyendo users.json:', e);
            return [];
        }
    }

    writeUsers(users) {
        try {
            fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
            return true;
        } catch(e) {
            console.error('Error escribiendo users.json:', e);
            return false;
        }
    }

    getUserByUsername(username) {
        return this.readUsers().find(u => u.username === username);
    }
    
    getUserById(id) {
        return this.readUsers().find(u => u.id === Number(id));
    }
    
    getAllUsers() {
        return this.readUsers();
    }
    
    createUser(userData) {
        const users = this.readUsers();
        if (users.find(u => u.username === userData.username)) {
            throw new Error('El nombre de usuario ya existe');
        }
        const newUser = {
            id: Date.now(),
            username: userData.username,
            password: userData.password,
            role: userData.role || 'empleado',
            allowedStates: userData.allowedStates || [],
            allowedCities: userData.allowedCities || []
        };
        users.push(newUser);
        this.writeUsers(users);
        return { ...newUser, password: undefined };
    }
    
    updateUser(id, userData) {
        const users = this.readUsers();
        const index = users.findIndex(u => u.id === Number(id));
        if (index === -1) throw new Error('Usuario no encontrado');
        
        if (userData.username && userData.username !== users[index].username) {
            if (users.find(u => u.username === userData.username)) {
                throw new Error('El nombre de usuario ya existe');
            }
        }
        
        const updatedUser = { ...users[index], ...userData };
        users[index] = updatedUser;
        this.writeUsers(users);
        return { ...updatedUser, password: undefined };
    }
    
    deleteUser(id) {
        let users = this.readUsers();
        users = users.filter(u => u.id !== Number(id));
        this.writeUsers(users);
        return true;
    }

    getAllListings() {
        return this.readDB().listings || [];
    }

    getSettings() {
        return this.readDB().settings || { monthlyPrice: 500, mercadoPagoEnabled: false, mpPublicKey: '', mpAccessToken: '' };
    }

    updateSettings(newSettings) {
        const db = this.readDB();
        db.settings = { ...db.settings, ...newSettings };
        this.writeDB(db);
        return db.settings;
    }

    isActiveListing(l) {
        if (l.status !== 'autorizado') return false;

        // Rolling billing: priorizar expiresAt si existe
        if (l.expiresAt) {
            return new Date(l.expiresAt) > new Date();
        }

        // Fallback para publicaciones antiguas con lastRenewedMonth
        if (l.lastRenewedMonth) {
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            return l.lastRenewedMonth >= currentMonthStr;
        }

        // Sin fecha de vencimiento = publicación de prueba/demo, siempre activa
        return true;
    }

    getListingById(id) {
        const idNum = Number(id);
        const listings = this.getAllListings();
        return listings.find(l => l.id === idNum);
    }

    saveListing(listingData) {
        const db = this.readDB();
        const listings = db.listings || [];

        if (listingData.id) {
            const index = listings.findIndex(l => l.id === Number(listingData.id));
            if (index !== -1) {
                listings[index] = { ...listings[index], ...listingData };
                db.listings = listings;
                this.writeDB(db);
                return listings[index];
            }
        }

        const newListing = {
            id: listingData.id ? Number(listingData.id) : Date.now(),
            title: listingData.title || `${listingData.make} ${listingData.model} ${listingData.year}`,
            type: listingData.type || 'Sedán',
            make: listingData.make || 'Desconocido',
            model: listingData.model || 'Desconocido',
            year: Number(listingData.year) || new Date().getFullYear(),
            price: Number(listingData.price) || 0,
            color: listingData.color || '',
            city: listingData.city || 'Ciudad de México',
            state: listingData.state || '',
            phone: listingData.phone || '',
            whatsapp: listingData.whatsapp || '',
            engine: listingData.engine || '',
            transmission: listingData.transmission || '',
            ac: listingData.ac || '',
            mileage: listingData.mileage || '',
            legal: listingData.legal || '',
            images: listingData.images || ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80'],
            status: listingData.status || 'pendiente autorizacion',
            publisherId: listingData.publisherId || '',
            isMyListing: true,
            views: 0,
            paymentStatus: listingData.paymentStatus || 'pending',
            createdAt: new Date().toISOString()
        };

        listings.push(newListing);
        db.listings = listings;
        this.writeDB(db);
        return newListing;
    }

    updateListing(id, updatedFields) {
        const idNum = Number(id);
        const db = this.readDB();
        const index = db.listings.findIndex(l => l.id === idNum);
        if (index !== -1) {
            db.listings[index] = { ...db.listings[index], ...updatedFields };
            this.writeDB(db);
            return db.listings[index];
        }
        return null;
    }

    incrementViews(id) {
        const idNum = Number(id);
        const db = this.readDB();
        const listing = db.listings.find(l => l.id === idNum);
        if (listing) {
            listing.views = (listing.views || 0) + 1;
            this.writeDB(db);
            return listing.views;
        }
        return 0;
    }

    deleteListing(id) {
        const idNum = Number(id);
        const db = this.readDB();
        const listing = db.listings.find(l => l.id === idNum);
        if (listing) {
            db.listings = db.listings.filter(l => l.id !== idNum);
            this.writeDB(db);
            return listing;
        }
        return null;
    }

    markAsSold(id) {
        return this.updateListing(id, { status: 'vendido' });
    }

    approveListing(id) {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        // Rolling billing: expiresAt = hoy + 30 días exactos
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + 30);
        const listing = this.updateListing(id, { 
            status: 'autorizado',
            lastRenewedMonth: currentMonthStr, // mantener para compatibilidad
            expiresAt: expiresAt.toISOString(),
            publishedAt: now.toISOString() // fecha de publicación visible al usuario
        });
        if (listing) {
            this.addSuggestion('make', listing.make);
            this.addSuggestion('model', listing.model, listing.make);
            if (listing.type) this.addSuggestion('type', listing.type);
        }
        return listing;
    }

    renewListing(id) {
        const existing = this.getListingById(id);
        if (!existing) return null;
        const now = new Date();
        // Si aún no ha vencido, extender desde la fecha de vencimiento actual; si ya venció, desde hoy
        const baseDate = existing.expiresAt && new Date(existing.expiresAt) > now
            ? new Date(existing.expiresAt)
            : now;
        const newExpiry = new Date(baseDate);
        newExpiry.setDate(newExpiry.getDate() + 30);
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return this.updateListing(id, {
            expiresAt: newExpiry.toISOString(),
            lastRenewedMonth: currentMonthStr, // mantener para compatibilidad
            status: 'autorizado'
        });
    }

    addListingNote(id, note) {
        const db = this.readDB();
        const idNum = Number(id);
        const index = db.listings.findIndex(l => l.id === idNum);
        if (index !== -1) {
            if (!db.listings[index].notes) {
                db.listings[index].notes = [];
            }
            db.listings[index].notes.unshift(note);
            this.writeDB(db);
            return note;
        }
        return null;
    }

    // method: 'mercadopago' | 'manual'
    addPayment(listingId, amount, receiptImage, type = 'Aprobación', method = 'manual') {
        const idNum = Number(listingId);
        const db = this.readDB();
        const index = db.listings.findIndex(l => l.id === idNum);
        if (index === -1) return null;

        if (!db.listings[index].payments) {
            db.listings[index].payments = [];
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

        const newPayment = {
            id: Date.now(),
            date: dateStr,
            dateISO: now.toISOString(),
            amount: Number(amount) || 0,
            receiptImage: receiptImage || null,
            type: type,
            method: method // 'mercadopago' | 'manual'
        };

        db.listings[index].payments.push(newPayment);
        this.writeDB(db);
        return newPayment;
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
                        listingCity: l.city || '',
                        timestamp: p.id
                    });
                });
            }
        });
        return allPayments.sort((a, b) => b.timestamp - a.timestamp);
    }


    search(criteria) {
        let results = this.getAllListings().filter(l => this.isActiveListing(l));
        
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
            results = results.filter(l => Number(l.year) >= Number(criteria.minYear));
        }
        if (criteria.maxYear) {
            results = results.filter(l => Number(l.year) <= Number(criteria.maxYear));
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

    getCatalog() {
        return this.readDB().catalog || defaultCatalogData;
    }

    getSuggestions() {
        return this.readDB().suggestions || [];
    }

    addSuggestion(type, value, parentMake = null) {
        if (!value || value.trim() === '') return;
        const valTrim = value.trim();
        const db = this.readDB();
        const suggestions = db.suggestions || [];
        const catalog = db.catalog || defaultCatalogData;

        let existing = suggestions.find(s => s.type === type && s.value.toLowerCase() === valTrim.toLowerCase() && s.parentMake === parentMake);
        if (existing) {
            existing.count += 1;
        } else {
            existing = {
                id: Date.now() + Math.random(),
                type: type,
                value: valTrim,
                parentMake: parentMake,
                count: 1,
                status: 'pending'
            };
            suggestions.push(existing);
        }

        if (existing.count >= 2 && existing.status !== 'approved') {
            existing.status = 'approved';
            if (existing.type === 'make') {
                if (!catalog.makes.includes(existing.value)) {
                    catalog.makes.push(existing.value);
                    catalog.modelsByMake[existing.value] = catalog.modelsByMake[existing.value] || [];
                }
            } else if (existing.type === 'model' && existing.parentMake) {
                catalog.modelsByMake[existing.parentMake] = catalog.modelsByMake[existing.parentMake] || [];
                if (!catalog.modelsByMake[existing.parentMake].includes(existing.value)) {
                    catalog.modelsByMake[existing.parentMake].push(existing.value);
                }
            } else if (existing.type === 'type') {
                if (!catalog.types.includes(existing.value)) {
                    catalog.types.push(existing.value);
                }
            }
        }

        db.suggestions = suggestions;
        db.catalog = catalog;
        this.writeDB(db);
    }

    getActiveLocations() {
        const activeListings = this.getAllListings().filter(l => this.isActiveListing(l));
        const activeStates = new Set();
        const activeCitiesByState = {};
        const catalog = this.getCatalog();

        activeListings.forEach(l => {
            let state = l.state;
            const city = l.city;
            
            if (!state && city) {
                for (const s of catalog.states) {
                    if (catalog.citiesByState[s] && catalog.citiesByState[s].includes(city)) {
                        state = s;
                        break;
                    }
                }
            }

            if (state && city) {
                activeStates.add(state);
                if (!activeCitiesByState[state]) {
                    activeCitiesByState[state] = new Set();
                }
                activeCitiesByState[state].add(city);
            }
        });

        const resultStates = Array.from(activeStates).sort();
        const resultCitiesByState = {};
        for (const state in activeCitiesByState) {
            resultCitiesByState[state] = Array.from(activeCitiesByState[state]).sort();
        }

        return {
            states: resultStates,
            citiesByState: resultCitiesByState
        };
    }

    getStats() {
        const listings = this.getAllListings();
        const active = listings.filter(l => this.isActiveListing(l)).length;
        const sold = listings.filter(l => l.status === 'vendido').length;
        const pending = listings.filter(l => l.status === 'pendiente autorizacion').length;
        const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);

        return {
            totalViews,
            activeListings: active,
            soldListings: sold,
            pendingApprovals: pending
        };
    }
}

module.exports = new BackendDatabase();
