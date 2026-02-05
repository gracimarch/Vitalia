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
        updateCanonical();
    }

    /**
     * Updates or creates the canonical tag dynamically.
     * Ensures the canonical URL matches the current clean URL.
     */
    function updateCanonical() {
        // Only update on pages that need dynamic canonicals (template pages)
        // or if we want to enforce it globally. 
        // For specific pages like /formulario, the static tag takes precedence unless we overwrite it.
        // But for this requirement, we want to target the dynamic templates.

        let canonicalLink = document.querySelector('link[rel="canonical"]');

        // If it doesn't exist, create it (User asked to include it in HTML, but this is a failsafe)
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }

        // Specific logic: If the tag has no href or explicit empty href, or we are on a known dynamic route
        const currentPath = window.location.pathname;
        const pageType = getPageType(); // lecturas, dietas, rutinas

        if (pageType || currentPath.includes('.html')) {
            // For dynamic pages, we always set it to origin + Clean Path
            // We use window.location.pathname, but we should ensure it's the "clean" version if we are in a rewrite scenario?
            // Vercel rewrites: The browser sees /lecturas/slug (clean). 
            // So window.location.pathname IS /lecturas/slug.
            // We just need to ensure we don't pick up index.html or something weird if we are local.

            const cleanPath = window.location.pathname.replace('/index.html', '/').replace(/\/$/, '');
            // Ensure trailing slash consistency? User asked for "window.location.origin + window.location.pathname"

            canonicalLink.href = window.location.origin + window.location.pathname;
            console.log('[Router] Canonical updated to:', canonicalLink.href);
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
