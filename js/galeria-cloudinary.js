// Carga imágenes desde Cloudinary para cualquier contenedor con data-cloudinary-tag.
// Usa la misma configuración que main.js (js/config.js), debe cargarse después de config.js.
(function () {
  var cfg = window.CONFIG && window.CONFIG.CLOUDINARY;
  if (!cfg || !cfg.CLOUD_NAME) return;

  function esc(texto) {
    return String(texto).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function titulo(img) {
    return (img.context && img.context.custom && img.context.custom.caption) || '';
  }

  document.querySelectorAll('[data-cloudinary-tag]').forEach(function (contenedor) {
    var tag = contenedor.getAttribute('data-cloudinary-tag');
    var vacio = contenedor.getAttribute('data-vacio') || '';
    fetch('https://res.cloudinary.com/' + cfg.CLOUD_NAME + '/image/list/' + tag + '.json')
      .then(function (r) { if (!r.ok) throw new Error('lista no disponible'); return r.json(); })
      .then(function (data) {
        var imagenes = data.resources || [];
        if (imagenes.length === 0) {
          contenedor.innerHTML = vacio ? '<p class="vacio">' + esc(vacio) + '</p>' : '';
          return;
        }
        contenedor.innerHTML = imagenes.map(function (img) {
          var url = 'https://res.cloudinary.com/' + cfg.CLOUD_NAME + '/image/upload/q_auto,f_auto,w_1200,c_limit/v' + img.version + '/' + img.public_id + '.' + img.format;
          var texto = titulo(img);
          return '<figure><img src="' + url + '" alt="' + esc(texto) + '" loading="lazy"><figcaption>' + esc(texto) + '</figcaption></figure>';
        }).join('');
      })
      .catch(function () { contenedor.innerHTML = vacio ? '<p class="vacio">' + esc(vacio) + '</p>' : ''; });
  });
})();
