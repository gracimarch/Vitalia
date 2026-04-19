/**
 * 404 Router — Fallback for local dev servers that don't support rewrites.
 *
 * How it works:
 *  1. If the path matches a known route, save the full clean path in
 *     sessionStorage and redirect to the appropriate HTML template.
 *  2. If nothing matches → show the real 404 error UI.
 *
 * On Vercel this file never runs for valid routes because vercel.json
 * handles rewrites before the request reaches the 404 page.
 */
(function () {
    'use strict';

    var ROUTE_MAP = {
        'lecturas':     '/pages/lectura.html',
        'dietas':       '/pages/dieta.html',
        'rutinas':      '/pages/rutina.html',
        'blog':         '/pages/blog.html',
        'mi-espacio':   '/pages/mi-espacio.html',
        'iniciar-sesion': '/pages/login.html',
        'crear-cuenta': '/pages/form.html'
    };

    var path  = window.location.pathname;
    var parts = path.split('/').filter(function (p) { return p !== ''; });
    var prefix = parts[0];

    if (prefix && ROUTE_MAP[prefix]) {
        // Save the FULL clean path so VitaliaRouter.getSlug() can recover it.
        sessionStorage.setItem('vitalia_redirected_path', path);
        window.location.replace(ROUTE_MAP[prefix]);
        return;
    }

    // Nothing matched — show the 404 UI
    var container = document.getElementById('error-container');
    if (container) container.style.display = '';
})();
