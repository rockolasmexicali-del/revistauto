# Pendientes para la Próxima Sesión

El cliente ha solicitado que, al retomar el proyecto, se le recuerde iniciar con la siguiente funcionalidad:

## 1. Módulo de Banners y Publicidad Dinámica
- **Objetivo**: Añadir una pestaña en el panel de administrador para subir imágenes de banners promocionales (publicidad local, ofertas de fin de semana, etc.).
- **Impacto Frontend**: Mostrar un carrusel o sección de banners publicitarios en la vista de `Inicio` de la aplicación.
- **Ventaja**: Monetización extra y dinamismo visual sin tener que alterar el código manualmente.

## 2. Módulo de Páginas Legales
- **Objetivo**: Poder editar los "Términos y Condiciones", "Políticas de Privacidad" y mensajes de contacto directamente desde un editor de texto dentro del administrador.
- **Ventaja**: Autonomía total para actualizar las reglas de la aplicación sin depender de modificaciones en el código.

## 3. Paginación y Carga Dinámica por Ciudad en Servidor (Escalabilidad a Miles de Autos)
- **Objetivo**: Modificar las consultas de Supabase en `db.js` para pedir autos paginados por bloques (ej. de 20 en 20) y filtrados directamente por la ciudad seleccionada.
- **Impacto Frontend**: Implementar detector de scroll infinito en `app.js` para cargar el siguiente bloque progresivamente conforme el usuario desliza la pantalla (estilo videojuego).
- **Ventaja**: Carga ultrarrápida (menos de 1 segundo) y ahorro masivo de datos/memoria sin importar si hay miles o millones de vehículos registrados.

*Nota dejada automáticamente al cierre de la sesión.*
