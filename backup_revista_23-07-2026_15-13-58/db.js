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
    }
];

class Database {
    constructor() {
        this.listingsKey = 'revista_autos_listings';
        this.suggestionsKey = 'revista_autos_suggestions';
        this.initializeDB();
    }

    initializeDB() {
        if (!localStorage.getItem(this.listingsKey)) {
            localStorage.setItem(this.listingsKey, JSON.stringify(initialListings));
        }
        if (!localStorage.getItem(this.suggestionsKey)) {
            localStorage.setItem(this.suggestionsKey, JSON.stringify([]));
        }
    }

    getAllListings() {
        return JSON.parse(localStorage.getItem(this.listingsKey) || '[]');
    }

    saveListing(listing) {
        const listings = this.getAllListings();
        if (listing.id) {
            // Update
            const index = listings.findIndex(l => l.id === listing.id);
            if (index !== -1) {
                listings[index] = { ...listings[index], ...listing };
            }
        } else {
            // Insert
            listing.id = Date.now();
            listing.status = 'pendiente autorizacion'; // Por defecto pendiente
            listing.isMyListing = true;
            listing.views = 0;
            // Si no hay imagen, asignamos una genérica
            if (!listing.images || listing.images.length === 0) {
                listing.images = ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80'];
            }
            listings.push(listing);
        }
        localStorage.setItem(this.listingsKey, JSON.stringify(listings));
        return listing;
    }

    deleteListing(id) {
        const listings = this.getAllListings();
        const updatedListings = listings.filter(l => l.id !== id);
        localStorage.setItem(this.listingsKey, JSON.stringify(updatedListings));
    }

    getMyListings() {
        return this.getAllListings().filter(l => l.isMyListing);
    }
    
    // Obtiene autos aleatorios filtrados por ciudad si se requiere, pero activos (autorizados)
    getRandomListings(count, city = null) {
        let activeListings = this.getAllListings().filter(l => l.status === 'autorizado');
        if (city) {
            const cityListings = activeListings.filter(l => l.city === city);
            // Si hay suficientes en la ciudad, usamos esos, sino mezclamos
            if (cityListings.length >= count/2) {
                activeListings = cityListings;
            }
        }
        // Shuffle array
        const shuffled = activeListings.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    search(criteria) {
        let results = this.getAllListings().filter(l => l.status === 'autorizado');
        
        if (criteria.query) {
            const q = criteria.query.toLowerCase();
            results = results.filter(l => 
                l.title.toLowerCase().includes(q) || 
                l.make.toLowerCase().includes(q) || 
                l.model.toLowerCase().includes(q) ||
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
        const index = listings.findIndex(l => l.id === id);
        if (index !== -1) {
            listings[index].status = 'vendido';
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
        }
    }

    updateListing(id, updatedData) {
        const listings = this.getAllListings();
        const index = listings.findIndex(l => l.id === id);
        if (index !== -1) {
            listings[index] = { ...listings[index], ...updatedData };
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
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
                type: type, // 'make' o 'model'
                value: valueTrim,
                parentMake: parentMake,
                count: 1,
                status: 'pending'
            };
            suggestions.push(existing);
        }
        
        // Auto-promover si llega a 2 o más (ya que la publicación fue aprobada por el admin)
        if (existing.count >= 2 && existing.status !== 'approved') {
            existing.status = 'approved';
            
            // Añadir al catálogo principal
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
}

const db = new Database();
