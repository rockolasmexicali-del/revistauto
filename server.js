const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const port = 3000;

// Middleware para procesar JSON y datos de formulario
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración Multer en almacenamiento en memoria para compresión con Sharp
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 } // Máximo 15MB por archivo original
});

// Servir archivos estáticos del frontend y de las imágenes subidas
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir));

// --- SISTEMA DE AUTENTICACIÓN Y SEGURIDAD ---
const activeSessions = {}; // { token: { userId, username, role, allowedStates, allowedCities } }
const loginAttempts = {}; // { username: { count, lockUntil } }

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    const token = authHeader.split(' ')[1];
    const session = activeSessions[token];
    if (!session) {
        return res.status(401).json({ success: false, error: 'Sesión inválida o expirada' });
    }
    req.user = session;
    next();
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Permisos insuficientes' });
    }
    next();
};

const checkRegionPermission = (req, listing) => {
    if (req.user.role === 'admin') return true;
    if (!listing) return false;
    const { allowedStates, allowedCities } = req.user;
    if (allowedStates.includes(listing.state) || allowedCities.includes(listing.city)) {
        return true;
    }
    return false;
};

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Fuerza Bruta
    const now = Date.now();
    const attempt = loginAttempts[username] || { count: 0, lockUntil: 0 };
    if (attempt.lockUntil > now) {
        const remaining = Math.ceil((attempt.lockUntil - now) / 1000);
        return res.status(429).json({ success: false, error: `Demasiados intentos. Intenta en ${remaining} segundos.`, locked: true, remaining });
    }

    const user = db.getUserByUsername(username);
    if (!user || user.password !== password) {
        attempt.count += 1;
        if (attempt.count >= 5) {
            attempt.lockUntil = now + 60000; // 1 min lock
        }
        loginAttempts[username] = attempt;
        return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    // Success
    delete loginAttempts[username];
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    activeSessions[token] = { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        allowedStates: user.allowedStates || [], 
        allowedCities: user.allowedCities || []
    };
    
    res.json({ 
        success: true, 
        token, 
        user: { 
            id: user.id, 
            username: user.username, 
            role: user.role, 
            allowedStates: user.allowedStates || [], 
            allowedCities: user.allowedCities || []
        } 
    });
});

app.get('/api/users', requireAuth, requireAdmin, (req, res) => {
    res.json({ success: true, users: db.getAllUsers() });
});

app.post('/api/users', requireAuth, requireAdmin, (req, res) => {
    try {
        const newUser = db.createUser(req.body);
        res.json({ success: true, user: newUser });
    } catch(e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.put('/api/users/:id', requireAuth, requireAdmin, (req, res) => {
    try {
        const updated = db.updateUser(req.params.id, req.body);
        res.json({ success: true, user: updated });
    } catch(e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.delete('/api/users/:id', requireAuth, requireAdmin, (req, res) => {
    try {
        if (Number(req.params.id) === req.user.id) {
            return res.status(400).json({ success: false, error: 'No puedes borrarte a ti mismo' });
        }
        db.deleteUser(req.params.id);
        res.json({ success: true });
    } catch(e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// --- ENDPOINTS DE LA API REST ---

// Configuración
app.get('/api/settings', (req, res) => {
    try {
        const settings = db.getSettings();
        res.json({ success: true, settings });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        const newSettings = db.updateSettings(req.body);
        res.json({ success: true, settings: newSettings });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Mercado Pago Payment Endpoint
const { MercadoPagoConfig, Payment } = require('mercadopago');

app.post('/api/process_payment', async (req, res) => {
    try {
        const { token, issuer_id, payment_method_id, transaction_amount, installments, payer, listingId, isRenewal } = req.body;
        
        const settings = db.getSettings();
        if (!settings.mercadoPagoEnabled || !settings.mpAccessToken) {
            return res.status(400).json({ success: false, error: 'Mercado Pago no está configurado o habilitado.' });
        }

        // Configurar cliente de MP
        const client = new MercadoPagoConfig({ accessToken: settings.mpAccessToken });
        const payment = new Payment(client);

        const requestOptions = {
            body: {
                transaction_amount: transaction_amount || settings.monthlyPrice,
                token: token,
                description: `Pago de publicación - ${listingId || 'Auto'}`,
                installments: installments,
                payment_method_id: payment_method_id,
                issuer_id: issuer_id,
                payer: {
                    email: payer.email,
                    identification: payer.identification
                }
            }
        };

        const paymentResponse = await payment.create(requestOptions);
        
        if (paymentResponse.status === 'approved') {
            // Actualizar DB
            if (listingId) {
                const listings = db.getAllListings();
                const listing = listings.find(l => l.id === Number(listingId));
                if (listing) {
                    listing.paymentStatus = 'paid';
                    if (isRenewal) {
                        // Rolling billing: +30 días exactos desde la fecha actual o desde expiresAt si aún vigente
                        const baseDate = listing.expiresAt && new Date(listing.expiresAt) > new Date() ? new Date(listing.expiresAt) : new Date();
                        const newExpiry = new Date(baseDate);
                        newExpiry.setDate(newExpiry.getDate() + 30);
                        listing.expiresAt = newExpiry.toISOString();
                        const now2 = new Date();
                        listing.lastRenewedMonth = `${now2.getFullYear()}-${String(now2.getMonth() + 1).padStart(2, '0')}`;
                        listing.status = 'autorizado';
                        listing.publishedAt = now2.toISOString(); // fecha de renovación
                    } else {
                        // Primera publicación pagada: se aprueba automáticamente sin revisión
                        const now2 = new Date();
                        listing.status = 'autorizado';
                        listing.publishedAt = now2.toISOString(); // fecha de primera publicación
                        const expiryDate = new Date(now2);
                        expiryDate.setDate(expiryDate.getDate() + 30);
                        listing.expiresAt = expiryDate.toISOString();
                        listing.lastRenewedMonth = `${now2.getFullYear()}-${String(now2.getMonth() + 1).padStart(2, '0')}`;
                    }
                    db.updateListing(listing.id, listing);

                    // Registrar el pago en el historial para el corte de caja
                    const paymentType = isRenewal ? 'Renovación' : 'Primera Publicación';
                    db.addPayment(listingId, transaction_amount || settings.monthlyPrice, null, paymentType, 'mercadopago');
                }
            }
            res.json({ success: true, payment: paymentResponse });
        } else {
            res.json({ success: false, status: paymentResponse.status, status_detail: paymentResponse.status_detail });
        }
    } catch (error) {
        console.error('Error al procesar pago MP:', error);
        // SECURITY: No se exponen credenciales ni detalles internos al cliente
        res.status(500).json({ success: false, error: 'Error al procesar el pago. Intente nuevamente o contacte al administrador.' });
    }
});

// 0. Obtener ubicaciones con autos activos
app.get('/api/locations/active', (req, res) => {
    try {
        const locations = db.getActiveLocations();
        res.json({ success: true, locations });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 1. Obtener todas las publicaciones activas/autorizadas
app.get('/api/listings', (req, res) => {
    try {
        const { type, city, status } = req.query;
        let listings = db.getAllListings();

        if (status && status !== 'all') {
            listings = listings.filter(l => l.status === status);
        } else if (!status) {
            listings = listings.filter(l => l.status === 'autorizado');
        }

        if (type && type !== 'Todos') {
            listings = listings.filter(l => l.type === type);
        }
        if (city) {
            listings = listings.filter(l => l.city === city);
        }

        res.json({ success: true, listings });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 2. Obtener mis publicaciones (filtradas por publisherId del dispositivo)
app.get('/api/listings/my', (req, res) => {
    try {
        const { publisherId } = req.query;
        let listings;
        if (publisherId) {
            // Rolling billing: cada dispositivo ve solo sus publicaciones por su ID único
            listings = db.getAllListings().filter(l => l.publisherId === publisherId);
        } else {
            // Fallback legacy: usar isMyListing (compatibilidad con publicaciones antiguas)
            listings = db.getAllListings().filter(l => l.isMyListing);
        }
        res.json({ success: true, listings });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 3. Obtener publicaciones pendientes de aprobación (Admin)
app.get('/api/listings/pending', (req, res) => {
    try {
        const listings = db.getAllListings().filter(l => l.status === 'pendiente autorizacion');
        res.json({ success: true, listings });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 4. Obtener detalle de un vehículo e incrementar vistas
app.get('/api/listings/:id', (req, res) => {
    try {
        const listing = db.getListingById(req.params.id);
        if (!listing) {
            return res.status(404).json({ success: false, error: 'Vehículo no encontrado' });
        }
        const updatedViews = db.incrementViews(req.params.id);
        listing.views = updatedViews;
        res.json({ success: true, listing });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 5. Crear una nueva publicación
app.post('/api/listings', (req, res) => {
    try {
        const newListing = db.saveListing(req.body);
        res.status(201).json({ success: true, listing: newListing });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 6. Actualizar una publicación existente
app.put('/api/listings/:id', (req, res) => {
    try {
        const updated = db.updateListing(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Publicación no encontrada' });
        }
        res.json({ success: true, listing: updated });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 7. Aprobar publicación (Admin)
app.put('/api/listings/:id/approve', requireAuth, (req, res) => {
    try {
        const listing = db.getAllListings().find(l => l.id === Number(req.params.id));
        if (!checkRegionPermission(req, listing)) {
            return res.status(403).json({ success: false, error: 'No tienes permiso en esta región' });
        }
        const approved = db.approveListing(req.params.id);
        if (!approved) {
            return res.status(404).json({ success: false, error: 'Publicación no encontrada' });
        }
        res.json({ success: true, listing: approved });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 8. Marcar como vendido
app.put('/api/listings/:id/sold', requireAuth, (req, res) => {
    try {
        const listing = db.getAllListings().find(l => l.id === Number(req.params.id));
        if (!checkRegionPermission(req, listing)) {
            return res.status(403).json({ success: false, error: 'No tienes permiso en esta región' });
        }
        const sold = db.markAsSold(req.params.id);
        if (!sold) {
            return res.status(404).json({ success: false, error: 'Publicación no encontrada' });
        }
        res.json({ success: true, listing: sold });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 8.2 Renovar Publicación — Rolling billing: siempre +30 días desde hoy o desde expiresAt actual
app.put('/api/listings/:id/renew', requireAuth, (req, res) => {
    try {
        const listing = db.getAllListings().find(l => l.id === Number(req.params.id));
        if (!checkRegionPermission(req, listing)) {
            return res.status(403).json({ success: false, error: 'No tienes permiso en esta región' });
        }
        const renewed = db.renewListing(req.params.id);
        if (!renewed) {
            return res.status(404).json({ success: false, error: 'Publicación no encontrada' });
        }
        res.json({ success: true, listing: renewed });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 8.5 Guardar Nota CRM
app.post('/api/listings/:id/notes', requireAuth, (req, res) => {
    try {
        const listing = db.getAllListings().find(l => l.id === Number(req.params.id));
        if (!checkRegionPermission(req, listing)) {
            return res.status(403).json({ success: false, error: 'No tienes permiso en esta región' });
        }
        const note = db.addListingNote(req.params.id, req.body);
        if (!note) {
            return res.status(404).json({ success: false, error: 'Publicación no encontrada' });
        }
        res.json({ success: true, note });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 8.5 Guardar Pago (Finanzas) — acepta method: 'manual' | 'mercadopago'
app.post('/api/listings/:id/payments', requireAuth, (req, res) => {
    try {
        const listing = db.getAllListings().find(l => l.id === Number(req.params.id));
        if (!checkRegionPermission(req, listing)) {
            return res.status(403).json({ success: false, error: 'No tienes permiso en esta región' });
        }
        const { amount, receiptImage, type, method } = req.body;
        const payment = db.addPayment(req.params.id, amount, receiptImage, type, method || 'manual');
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Publicación no encontrada' });
        }
        res.json({ success: true, payment });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 8.6 Corte de Caja — todos los pagos con filtro opcional por rango de fechas
app.get('/api/payments', requireAuth, (req, res) => {
    try {
        const { from, to } = req.query;
        let payments = db.getAllPayments();
        if (from) {
            const fromDate = new Date(from);
            fromDate.setHours(0, 0, 0, 0);
            payments = payments.filter(p => p.dateISO ? new Date(p.dateISO) >= fromDate : true);
        }
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            payments = payments.filter(p => p.dateISO ? new Date(p.dateISO) <= toDate : true);
        }
        res.json({ success: true, payments });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 9. Eliminar publicación y sus imágenes físicas
app.delete('/api/listings/:id', (req, res) => {
    try {
        const listing = db.getAllListings().find(l => l.id === Number(req.params.id));
        if (!listing) {
            return res.status(404).json({ success: false, error: 'Publicación no encontrada' });
        }

        // Verificar permisos: admin autenticado O propietario por publisherId
        const authHeader = req.headers.authorization;
        let isAuthorized = false;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Flujo admin: verificar sesión activa
            const token = authHeader.split(' ')[1];
            const session = activeSessions[token];
            if (session) {
                req.user = session;
                isAuthorized = checkRegionPermission(req, listing);
            }
        }

        if (!isAuthorized) {
            // Flujo propietario: verificar publisherId enviado en query o body
            const publisherId = req.query.publisherId || (req.body && req.body.publisherId);
            if (publisherId && listing.publisherId && listing.publisherId === publisherId) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'No tienes permiso para eliminar esta publicación' });
        }

        const deleted = db.deleteListing(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Publicación no encontrada' });
        }

        // Limpiar imágenes asociadas si están almacenadas en /uploads/
        if (deleted.images && Array.isArray(deleted.images)) {
            deleted.images.forEach(imgUrl => {
                if (imgUrl.includes('/uploads/')) {
                    const filename = path.basename(imgUrl);
                    const filepath = path.join(uploadsDir, filename);
                    if (fs.existsSync(filepath)) {
                        try { fs.unlinkSync(filepath); } catch (err) { console.error('Error eliminando archivo:', err); }
                    }
                }
            });
        }

        res.json({ success: true, message: 'Publicación e imágenes eliminadas' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 10. Búsqueda avanzada
app.post('/api/search', (req, res) => {
    try {
        const results = db.search(req.body);
        res.json({ success: true, results });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 11. Catálogo completo
app.get('/api/catalog', (req, res) => {
    try {
        const catalog = db.getCatalog();
        res.json({ success: true, catalog });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 12. Estadísticas del Admin
app.get('/api/stats', (req, res) => {
    try {
        const stats = db.getStats();
        res.json({ success: true, stats });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 13. Subida y compresión automática de imágenes a formato WebP
app.post('/api/upload', upload.array('images', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, error: 'No se enviaron imágenes' });
    }

    try {
        const imageUrls = [];
        
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const filename = `auto-${Date.now()}-${i}-${Math.floor(Math.random()*1000)}.webp`;
            const filepath = path.join(uploadsDir, filename);

            // Redimensionar a máx 800px de ancho y comprimir a WebP 70% de calidad
            await sharp(file.buffer)
                .resize({ width: 800, withoutEnlargement: true })
                .webp({ quality: 70 })
                .toFile(filepath);

            // Retornar la URL relativa para el cliente
            imageUrls.push(`/uploads/${filename}`);
        }
        
        res.json({ success: true, imageUrls });
    } catch (error) {
        console.error('Error procesando imágenes:', error);
        res.status(500).json({ success: false, error: 'Error procesando las imágenes en el servidor' });
    }
});

// 14. Eliminar imagen física
app.delete('/api/upload/:filename', (req, res) => {
    const filename = req.params.filename;
    
    // SECURITY: Validar contra path traversal en Unix (/) y Windows (\)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\') || filename.includes('%2F') || filename.includes('%5C') || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
        return res.status(400).json({ success: false, error: 'Nombre de archivo inválido' });
    }
    
    const filepath = path.join(uploadsDir, filename);

    fs.unlink(filepath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.json({ success: true, message: 'La imagen ya no existía' });
            }
            return res.status(500).json({ success: false, error: 'No se pudo borrar la imagen' });
        }
        res.json({ success: true, message: 'Imagen eliminada del servidor' });
    });
});

app.listen(port, () => {
    console.log(`====================================================`);
    console.log(`🚗 RevistAuto Backend Servidor Corriendo en:`);
    console.log(`👉 http://localhost:${port}`);
    console.log(`====================================================`);
});
