/**
 * Component Loader
 * Loads header and footer partials dynamically and handles active link states.
 */

/**
 * Rewrites clean Vercel-style URLs to .html paths when running locally.
 * On production, Vercel rewrites handle /mi-espacio → /pages/mi-espacio.html
 * On localhost (python http.server) those rewrites don't exist, so we patch the HTML.
 */
function rewriteLinksForLocal(html) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) return html;

    // Map: clean-URL href fragment → local .html path
    // Handles both plain hrefs and anchor-suffixed hrefs (e.g. /mi-espacio#lecturas)
    const rewrites = [
        ['/mi-espacio', '/pages/mi-espacio.html'],
        ['/blog',       '/pages/blog.html'],
        ['/formulario', '/pages/form.html'],
    ];

    rewrites.forEach(([from, to]) => {
        // Match href="<from>" and href="<from>#anything"
        const pattern = new RegExp(`href="${from.replace('/', '\\/')}(#[^"]*)?"`,'g');
        html = html.replace(pattern, (_, anchor) => `href="${to}${anchor || ''}"`);
    });

    return html;
}

document.addEventListener("DOMContentLoaded", function () {

    const componentsPath = "/assets/partials/";

    // Load Header
    fetch(componentsPath + "header.html")
        .then(response => {
            if (!response.ok) throw new Error("Header not found");
            return response.text();
        })
        .then(data => {
            const headerHTML = rewriteLinksForLocal(data.replace(/{{ROOT}}/g, "/"));
            const headerPlaceholder = document.getElementById("header-placeholder");
            if (headerPlaceholder) headerPlaceholder.innerHTML = headerHTML;
            highlightActiveLink();
            initializeNavbarToggle();
        })
        .catch(err => console.error("Error loading header:", err));

    // Load Footer
    fetch(componentsPath + "footer.html")
        .then(response => {
            if (!response.ok) throw new Error("Footer not found");
            return response.text();
        })
        .then(data => {
            const footerHTML = rewriteLinksForLocal(data.replace(/{{ROOT}}/g, "/"));
            const footerPlaceholder = document.getElementById("footer-placeholder");
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = footerHTML;
                const footerYear = document.getElementById('footer-year');
                if (footerYear) footerYear.textContent = new Date().getFullYear();
            }
        })
        .catch(err => console.error("Error loading footer:", err));

    // Load Chatbot
    // Load Chatbot (only if not on home page)
    const currentPath = window.location.pathname;
    const isHomePage = currentPath === "/" || currentPath.endsWith("/index.html");

    if (!isHomePage) {
        const chatbotScript = document.createElement("script");
        chatbotScript.src = "/assets/js/core/chatbot.js";
        document.body.appendChild(chatbotScript);
    }
});

function highlightActiveLink() {
    const currentPath = window.location.pathname;
    // Normalize path to ignore trailing slash if any, for comparison
    // e.g. /lecturas/slug vs /blog.html

    const pageName = currentPath.split("/").pop() || "index";

    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (!href) return;

        // Clean path for comparison, also removing /pages/ to match clean URLs
        const cleanPath = currentPath.replace(/\/$/, "").replace(".html", "").replace("/pages", "");
        const cleanHref = href.replace(/\/$/, "").replace(".html", "").replace("/pages", "");

        if (cleanHref === cleanPath || (cleanHref !== "" && cleanHref !== "/" && cleanPath.startsWith(cleanHref))) {
            link.classList.add("active");
        } else if (cleanHref === "/" && (cleanPath === "" || cleanPath === "/" || cleanPath === "/index")) {
            link.classList.add("active");
        }
    });

    // Special handling for Mi Espacio
    if (pageName === "mi-espacio") {
        const miEspacioLink = document.querySelector('a[href*="mi-espacio"]');
        if (miEspacioLink) miEspacioLink.classList.add("bold-active");
    }

    const isHomePage = pageName === "index.html" || pageName === "index" || pageName === "";

    if (isHomePage) {
        // Special handling for "Acerca de" which links to "/"
        const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
        navLinks.forEach(link => {
            const href = link.getAttribute("href");
            // Check if link points to root or index
            if (href === "/" || href === "./" || href === "index.html" || (href && href.endsWith("/index.html"))) {
                if (link.textContent.trim() === "Acerca de") {
                    link.classList.add("bold-active");
                }
            }
        });
    }
}

function initializeNavbarToggle() {
    const togglers = document.querySelectorAll('.navbar-toggler');

    togglers.forEach(toggler => {
        toggler.addEventListener('click', function () {
            const targetId = this.getAttribute('data-bs-target');
            const target = document.querySelector(targetId);

            if (target) {
                target.classList.toggle('show');

                // Toggle aria-expanded for accessibility
                const isExpanded = target.classList.contains('show');
                this.setAttribute('aria-expanded', isExpanded);

                // Lock/unlock body scroll for fullscreen overlay
                document.body.classList.toggle('no-scroll', isExpanded);

                // Visual toggle for the icon
                if (isExpanded) {
                    this.classList.remove('collapsed');
                } else {
                    this.classList.add('collapsed');
                }
            }
        });
    });

    // Close menu when a nav link is clicked (mobile)
    const navCollapse = document.getElementById('navbarNav');
    if (navCollapse) {
        navCollapse.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function () {
                if (navCollapse.classList.contains('show')) {
                    navCollapse.classList.remove('show');
                    document.body.classList.remove('no-scroll');

                    const toggler = document.querySelector('.navbar-toggler');
                    if (toggler) {
                        toggler.classList.add('collapsed');
                        toggler.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });
    }
}

// ==========================================
// Vercel Analytics Initialization
// ==========================================
(function initAnalytics() {
    import('https://esm.sh/@vercel/analytics@1.1.1')
        .then(module => {
            if (module && typeof module.inject === 'function') {
                module.inject();
            }
        })
        .catch(err => {
            console.debug('[Analytics] Could not load analytics:', err);
        });

    // Speed Insights Initialization
    import('https://esm.sh/@vercel/speed-insights@1.0.10')
        .then(module => {
            if (module && typeof module.injectSpeedInsights === 'function') {
                module.injectSpeedInsights();
            }
        })
        .catch(err => {
            console.debug('[SpeedInsights] Could not load speed insights:', err);
        });
})();
