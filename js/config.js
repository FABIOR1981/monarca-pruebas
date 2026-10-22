// Configuración general de Residencial Monarca
// Único lugar donde se cambian los datos del sitio: Cloudinary, contacto y redes.
// Debe cargarse ANTES de main.js (ver el final de index.html).
const CONFIG = {

  // --- Galería y Dinámicos (Cloudinary) ---
  CLOUDINARY: {
    CLOUD_NAME: 'p0qlmlor',        // Cloud name de la cuenta
    TAG_GALERIA: 'monarca_galeria',  // Etiqueta que llevan las fotos de la galería
    TAG_INSTALACIONES: 'monarca_instalaciones' // Etiqueta que llevan las fotos de instalaciones en Cloudinary
  },

  // --- Contacto y redes ---
  CONTACTO: {
    DIRECCION: 'Rivera 5734 esquina Vicente Rocafuerte',
    WHATSAPP_NUMERO: '59899081886',  
    INSTAGRAM_URL: 'https://www.instagram.com/recidencialmonarca?utm_source=qr',    
    FACEBOOK_URL: 'https://www.facebook.com/share/1JEh8uoqEZ/?mibextid=wwXIfr'      
  }
};