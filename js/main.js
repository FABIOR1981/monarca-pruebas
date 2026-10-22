document.addEventListener('DOMContentLoaded', () => {
    // 1. Menú Responsive Móvil
    const mobileMenu = document.getElementById('mobile-menu');
    const navList = document.getElementById('nav-list');

    if (mobileMenu && navList) {
        mobileMenu.addEventListener('click', () => {
            navList.classList.toggle('active');
        });

        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
            });
        });
    }

    // Configuración general de Cloudinary
    const cfgCloudinary = (typeof CONFIG !== 'undefined' && CONFIG.CLOUDINARY) ? CONFIG.CLOUDINARY : {};
    const cloudName = cfgCloudinary.CLOUD_NAME;

    function escaparHtml(texto) {
        return String(texto).replace(/[&<>'"]/g, caracter => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[caracter]));
    }

    function obtenerTitulo(imagen) {
        const titulo = imagen.context?.custom?.caption;
        if (titulo && titulo.trim()) return titulo.trim();

        const nombre = imagen.public_id.split('/').pop().replace(/[-_]+/g, ' ').trim();
        return nombre ? nombre.charAt(0).toUpperCase() + nombre.slice(1) : 'Monarca';
    }

    function obtenerDescripcion(imagen) {
        const descripcion = imagen.context?.custom?.alt;
        return descripcion && descripcion.trim() ? descripcion.trim() : '';
    }

    function obtenerArea(imagen) {
        const area = imagen.context?.custom?.area;
        if (area && area.trim()) {
            return area.trim().toLowerCase();
        }
        return 'all'; 
    }

    function obtenerOrden(imagen) {
        const orden = imagen.context?.custom?.orden;
        return orden && !isNaN(orden) ? parseInt(orden, 10) : 99;
    }

    // 2. Cargar Instalaciones Dinámicas desde Cloudinary (con orden y filtros automáticos)
    const instalacionesDinamicas = document.getElementById('instalaciones-dinamicas');
    const contenedorFiltros = document.getElementById('instalaciones-filtros');
    const tagInstalaciones = cfgCloudinary.TAG_INSTALACIONES;

    const nombresAmigables = {
        'exterior': 'Exterior',
        'interior': 'Áreas Comunes',
        'habitacion': 'Habitaciones'
    };

    if (instalacionesDinamicas && cloudName && tagInstalaciones) {
        fetch(`https://res.cloudinary.com/${cloudName}/image/list/${tagInstalaciones}.json`)
            .then(response => {
                if (!response.ok) throw new Error("No se pudo obtener la lista de instalaciones de Cloudinary.");
                return response.json();
            })
            .then(data => {
                const imagenes = data.resources || [];

                if (imagenes.length === 0) {
                    instalacionesDinamicas.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Próximamente más información sobre instalaciones.</p>';
                    return;
                }

                // Ordenar las imágenes según el metadato "orden"
                imagenes.sort((a, b) => obtenerOrden(a) - obtenerOrden(b));

                // Extraer áreas únicas de los metadatos para los filtros dinámicos
                const areasUnicas = [...new Set(imagenes.map(img => obtenerArea(img)).filter(area => area !== 'all'))];

                if (contenedorFiltros) {
                    let htmlBotones = `<button class="filter-btn active" data-filter="all">Todas</button>`;
                    
                    areasUnicas.forEach(area => {
                        const nombreVisible = nombresAmigables[area] || (area.charAt(0).toUpperCase() + area.slice(1));
                        htmlBotones += `<button class="filter-btn" data-filter="${area}">${nombreVisible}</button>`;
                    });
                    
                    contenedorFiltros.innerHTML = htmlBotones;
                }

                const htmlInstalaciones = imagenes.map(img => {
                    const urlImagen = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_1200,c_limit/v${img.version}/${img.public_id}.${img.format}`;
                    const titulo = escaparHtml(obtenerTitulo(img));
                    const descripcion = escaparHtml(obtenerDescripcion(img));
                    const categoria = escaparHtml(obtenerArea(img));
                    
                    return `
                        <div class="gallery-item" data-category="${categoria}">
                            <img src="${urlImagen}" alt="${titulo}${descripcion ? `: ${descripcion}` : ''}" loading="lazy" width="1170" height="821">
                            <div class="gallery-overlay">
                                <h3>${titulo}</h3>
                                ${descripcion ? `<p>${descripcion}</p>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                
                instalacionesDinamicas.innerHTML = htmlInstalaciones;
                
                inicializarFiltrosInstalaciones();
                inicializarLightbox();
            })
            .catch(error => {
                console.error('Error cargando las instalaciones desde Cloudinary:', error);
                instalacionesDinamicas.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">No se pudieron cargar las instalaciones.</p>';
                inicializarLightbox();
            });
    }

    // Lógica de Filtrado de Instalaciones (delegación de eventos: funciona con botones fijos o generados)
    function inicializarFiltrosInstalaciones() {
        const contenedor = document.getElementById('instalaciones-filtros');
        if (!contenedor || contenedor.dataset.filtrosListos === '1') return;
        contenedor.dataset.filtrosListos = '1';

        contenedor.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn || !contenedor.contains(btn)) return;

            contenedor.querySelectorAll('.filter-btn.active').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filtro = btn.getAttribute('data-filter');
            document.querySelectorAll('#instalaciones-dinamicas .gallery-item').forEach(item => {
                const visible = filtro === 'all' || item.getAttribute('data-category') === filtro;
                item.style.display = visible ? '' : 'none';
            });
        });
    }

    // 3. Cargar Galería Dinámica desde Cloudinary
    const galeriaDinamica = document.getElementById('galeria-dinamica');
    const tagGaleria = cfgCloudinary.TAG_GALERIA;
    
    if (galeriaDinamica && cloudName && tagGaleria) {
        fetch(`https://res.cloudinary.com/${cloudName}/image/list/${tagGaleria}.json`)
            .then(response => {
                if (!response.ok) throw new Error("No se pudo obtener la lista de Cloudinary.");
                return response.json();
            })
            .then(data => {
                const imagenes = data.resources || [];

                if (imagenes.length === 0) {
                    galeriaDinamica.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Próximamente compartiremos más momentos.</p>';
                    return;
                }

                const htmlImagenes = imagenes.map(img => {
                    const urlImagen = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_1200,c_limit/v${img.version}/${img.public_id}.${img.format}`;
                    const titulo = escaparHtml(obtenerTitulo(img));
                    const descripcion = escaparHtml(obtenerDescripcion(img));
                    
                    return `
                        <div class="gallery-item">
                            <img src="${urlImagen}" alt="${titulo}${descripcion ? `: ${descripcion}` : ''}" loading="lazy" width="1170" height="821">
                            <div class="gallery-overlay">
                                <h3>${titulo}</h3>
                                ${descripcion ? `<p>${descripcion}</p>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                
                galeriaDinamica.innerHTML = htmlImagenes;
                inicializarLightbox();
            })
            .catch(error => {
                console.error('Error cargando la galería desde Cloudinary:', error);
                galeriaDinamica.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Próximamente compartiremos más momentos.</p>';
                inicializarLightbox();
            });
    } else {
        inicializarLightbox();
    }

    // 4. Lógica general para botones expandibles ("Ver más" / "Ver menos")
    const expandableButtons = document.querySelectorAll('.btn-leer-mas');

    expandableButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const container = document.getElementById(targetId);

            if (container) {
                container.classList.toggle('expanded');

                if (container.classList.contains('expanded')) {
                    button.textContent = 'Ver menos';
                } else {
                    button.textContent = 'Ver más';
                    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });
    });

    // 5. Lógica del Lightbox
    function inicializarLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxClose = document.getElementById('lightbox-close');
        const allGalleryItems = document.querySelectorAll('.gallery-item');

        if (!lightbox || !lightboxImg || !lightboxClose) return;

        allGalleryItems.forEach(item => {
            const nuevoItem = item.cloneNode(true);
            item.parentNode.replaceChild(nuevoItem, item);
            
            nuevoItem.addEventListener('click', () => {
                const imgElement = nuevoItem.querySelector('img');
                if (imgElement) {
                    lightboxImg.setAttribute('src', imgElement.getAttribute('src'));
                    lightbox.style.display = 'flex';
                }
            });
        });

        lightboxClose.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg) {
                lightbox.style.display = 'none';
            }
        });
    }

    // 6. Datos de contacto y redes desde config.js
    const cfgContacto = (typeof CONFIG !== 'undefined' && CONFIG.CONTACTO) ? CONFIG.CONTACTO : {};

    function asignarEnlace(clave, url) {
        if (!url) return;
        document.querySelectorAll(`[data-config="${clave}"]`).forEach(el => { el.href = url; });
    }

    // Enlace normal de WhatsApp (para botones de texto o secciones) — con el mismo mensaje predeterminado
    const mensajeWhatsapp = "Hola, quiero consultar sobre los servicios de Residencial Monarca";
    asignarEnlace('whatsapp', cfgContacto.WHATSAPP_NUMERO && `https://wa.me/${cfgContacto.WHATSAPP_NUMERO}?text=${encodeURIComponent(mensajeWhatsapp)}`);

    // Enlace específico para el Botón Flotante con el mismo mensaje predeterminado
    if (cfgContacto.WHATSAPP_NUMERO) {
        const urlWhatsappFlotante = `https://wa.me/${cfgContacto.WHATSAPP_NUMERO}?text=${encodeURIComponent(mensajeWhatsapp)}`;
        asignarEnlace('whatsapp-flotante', urlWhatsappFlotante);
    }

    asignarEnlace('instagram', cfgContacto.INSTAGRAM_URL);
    asignarEnlace('facebook', cfgContacto.FACEBOOK_URL);

    if (cfgContacto.DIRECCION) {
        document.querySelectorAll('[data-config="direccion"]').forEach(el => { el.textContent = cfgContacto.DIRECCION; });
        asignarEnlace('mapa', `https://maps.google.com/?q=${encodeURIComponent(cfgContacto.DIRECCION)}`);
    }
});