/**
 * Vitalia Router - Centralized Routing System
 * Handles clean URLs and local development fallback.
 */

window.VitaliaRouter = (function () {
    'use strict';

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Config: Mapping of prefixes to templates
    const ROUTE_MAP = {
        'lecturas': '/pages/lectura.html',
        'dietas': '/pages/dieta.html',
        'rutinas': '/pages/rutina.html',
        'blog': '/pages/blog.html',
        'mi-espacio': '/pages/mi-espacio.html',
        'plan': '/pages/form.html'
    };

    /**
     * Initializes the router.
     * Restores state if we were redirected from 404.html locally.
     */
    function init() {
        if (isLocal) {
            const redirectedPath = sessionStorage.getItem('vitalia_redirected_path');
            if (redirectedPath) {
                // Restore the clean URL in the address bar
                window.history.replaceState(null, '', redirectedPath);
                sessionStorage.removeItem('vitalia_redirected_path');
                console.log('[Router] Local path restored:', redirectedPath);
            }
        }
    }

    /**
     * Extracts the slug from the current URL path.
     * Works for: /lecturas/slug, /dietas/slug, /rutinas/slug
     */
    function getSlug() {
        const path = window.location.pathname;
        const parts = path.split('/').filter(p => p !== '');

        // If we have at least 2 parts (e.g., ['lecturas', 'my-slug'])
        if (parts.length >= 2) {
            const firstPart = parts[0];
            if (ROUTE_MAP[firstPart]) {
                return parts[1].replace('.html', '');
            }
        }

        // Fallback for query params if ever needed
        const params = new URLSearchParams(window.location.search);
        return params.get('slug');
    }

    /**
     * Detects the current page type based on the path.
     */
    function getPageType() {
        const path = window.location.pathname;
        const parts = path.split('/').filter(p => p !== '');
        if (parts.length > 0 && ROUTE_MAP[parts[0]]) {
            return parts[0];
        }
        return null;
    }

    // Run initialization
    init();

    return {
        getSlug,
        getPageType,
        isLocal: () => isLocal
    };
})();
