// ====================================================
// CONFIGURACIÓN DE CONEXIÓN CON SUPABASE CLOUD
// ====================================================

const SUPABASE_URL = 'https://iqbphzpczfazgungbnyn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYnBoenBjemZhemd1bmdibnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNzc0MzksImV4cCI6MjEwMDg1MzQzOX0.W5ewIMFudVFysz9IAAfQ_TdJCsiw4_fI0Z8d9f08MUc';

let supabaseClient = null;

// Inicialización segura del cliente Supabase
if (typeof window !== 'undefined' && window.supabase) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ RevistAuto conectado exitosamente a Supabase Cloud (https://iqbphzpczfazgungbnyn.supabase.co)');
    } catch (error) {
        console.error('❌ Error al inicializar el cliente de Supabase:', error);
    }
}
