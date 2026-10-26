/**
 * local-nav.js — Local dev navigation fix
 * Active on localhost / 127.0.0.1.
 *
 * Ensures all internal links, clean URLs, and dynamic articles work properly
 * when running locally without Vercel edge rewrites.
 */
(function () {
    'use strict';

    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalDev) return;

    // ── Route Maps ──────────────────────────────────────────────────────────
    const PAGE_MAP = {
        '/blog':           '/pages/blog.html',
        '/mi-espacio':     '/pages/mi-espacio.html',
        '/iniciar-sesion': '/pages/login.html',
        '/crear-cuenta':   '/pages/form.html',
        '/perfil':         '/pages/perfil.html',
        '/privacidad':     '/pages/privacidad.html',
        '/terminos':       '/pages/terminos.html',
    };

    const RESOURCE_TEMPLATES = {
        'lecturas': '/pages/lectura.html',
        'dietas':   '/pages/dieta.html',
        'rutinas':  '/pages/rutina.html',
    };

    // ── URL Normalizer ───────────────────────────────────────────────────────
    function resolveLocalUrl(url) {
        if (!url || url.startsWith('http') || url.startsWith('mailto') || url.startsWith('#') || url.startsWith('javascript')) {
            return url;
        }

        const hashIdx = url.indexOf('#');
        const hash = hashIdx >= 0 ? url.slice(hashIdx) : '';
        const base = hashIdx >= 0 ? url.slice(0, hashIdx) : url;
        const qIdx = base.indexOf('?');
        const query = qIdx >= 0 ? base.slice(qIdx) : '';
        const path = qIdx >= 0 ? base.slice(0, qIdx) : base;

        // 1. Top-level page mapping
        const cleanPath = path.replace(/\/$/, '') || '/';
        for (const [clean, html] of Object.entries(PAGE_MAP)) {
            if (cleanPath === clean || cleanPath === clean + '/') {
                return html + query + hash;
            }
        }

        // 2. Resource routes: /lecturas/slug, /dietas/slug, /rutinas/slug
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 2) {
            const prefix = parts[0];
            const slug = parts[1];
            if (RESOURCE_TEMPLATES[prefix]) {
                const queryPrefix = query ? (query + '&') : '?';
                return RESOURCE_TEMPLATES[prefix] + queryPrefix + 'slug=' + encodeURIComponent(slug) + hash;
            }
        }

        return url;
    }

    // ── Anchor Rewriter ───────────────────────────────────────────────────────
    function rewriteAnchors(root) {
        const anchors = (root || document).querySelectorAll('a[href]');
        anchors.forEach(function (a) {
            const href = a.getAttribute('href');
            if (!href) return;
            const resolved = resolveLocalUrl(href);
            if (resolved !== href) a.setAttribute('href', resolved);
        });
    }

    // Store redirected path when a resource link is clicked
    document.addEventListener('click', function (e) {
        const a = e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href) return;
        const [clean] = href.split(/[?#]/);
        const parts = clean.split('/').filter(Boolean);
        if (parts.length >= 2 && RESOURCE_TEMPLATES[parts[0]]) {
            sessionStorage.setItem('vitalia_redirected_path', clean);
        }
    }, true);

    // ── window.location.href Interceptor ─────────────────────────────────────
    (function interceptLocationHref() {
        const originalDescriptor = Object.getOwnPropertyDescriptor(window.Location.prototype, 'href');
        if (!originalDescriptor || !originalDescriptor.set) return;

        Object.defineProperty(window.location, 'href', {
            get: function () {
                return originalDescriptor.get.call(window.location);
            },
            set: function (url) {
                const resolved = resolveLocalUrl(url);
                const [clean] = url.split(/[?#]/);
                const parts = clean.split('/').filter(Boolean);
                if (parts.length >= 2 && RESOURCE_TEMPLATES[parts[0]]) {
                    sessionStorage.setItem('vitalia_redirected_path', clean);
                }
                originalDescriptor.set.call(window.location, resolved);
            },
            configurable: true
        });
    })();

    // ── Run immediately & on DOM ready ────────────────────────────────────────
    function init() {
        rewriteAnchors(document);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('headerLoaded', function () { rewriteAnchors(document); });

    // MutationObserver: catch dynamically created links (blog cards, recommended articles, etc.)
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            m.addedNodes.forEach(function (node) {
                if (node.nodeType !== 1) return;
                if (node.tagName === 'A' && node.getAttribute('href')) {
                    const href = node.getAttribute('href');
                    const resolved = resolveLocalUrl(href);
                    if (resolved !== href) node.setAttribute('href', resolved);
                }
                rewriteAnchors(node);
            });
        });
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    } else {
        observer.observe(document.body, { childList: true, subtree: true });
    }

})();
