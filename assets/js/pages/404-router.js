/**
 * 404 Router - Local Development Fallback
 * Redirects known routes to their HTML templates when using npx serve.
 * On Vercel, rewrites handle this, so this script only runs for truly unknown URLs.
 */

(function () {
    var ROUTE_MAP = {
        'lecturas': '/pages/lectura.html',
        'dietas': '/pages/dieta.html',
        'rutinas': '/pages/rutina.html',
        'blog': '/pages/blog.html',
        'mi-espacio': '/pages/mi-espacio.html',
        'formulario': '/pages/form.html'
    };

    var path = window.location.pathname;
    var parts = path.split('/').filter(function (p) { return p !== ''; });
    var prefix = parts[0];

    if (prefix && ROUTE_MAP[prefix]) {
        sessionStorage.setItem('vitalia_redirected_path', path);
        window.location.replace(ROUTE_MAP[prefix]);
    } else {
        document.getElementById('error-container').style.display = '';
    }
})();
