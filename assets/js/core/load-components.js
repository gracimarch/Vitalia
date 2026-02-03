/**
 * Component Loader
 * Loads header and footer partials dynamically and handles active link states.
 */

document.addEventListener("DOMContentLoaded", function () {

    const componentsPath = "/assets/partials/";

    // Load Header
    fetch(componentsPath + "header.html")
        .then(response => {
            if (!response.ok) throw new Error("Header not found");
            return response.text();
        })
        .then(data => {
            // Replace {{ROOT}} with empty string or / as we use absolute paths now
            // But let's check if the templates use {{ROOT}}
            // If templates have <a href="{{ROOT}}index.html">, we should replace it with "/"
            const headerHTML = data.replace(/{{ROOT}}/g, "/");
            const headerPlaceholder = document.getElementById("header-placeholder");
            if (headerPlaceholder) headerPlaceholder.innerHTML = headerHTML;

            // Highlight Active Link
            highlightActiveLink();

            // initialize Navbar Toggle
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
            const footerHTML = data.replace(/{{ROOT}}/g, "/");
            const footerPlaceholder = document.getElementById("footer-placeholder");
            if (footerPlaceholder) footerPlaceholder.innerHTML = footerHTML;
        })
        .catch(err => console.error("Error loading footer:", err));
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

                // Visual toggle for the icon
                if (isExpanded) {
                    this.classList.remove('collapsed');
                } else {
                    this.classList.add('collapsed');
                }
            }
        });
    });
}

// ==========================================
// Vercel Analytics Initialization
// ==========================================
(function initAnalytics() {
    import('https://esm.sh/@vercel/analytics@1.1.1')
        .then(module => {
            if (module && typeof module.inject === 'function') {
                module.inject();
                console.log('[Analytics] Vercel Analytics initialized');
            }
        })
        .catch(err => {
            console.debug('[Analytics] Could not load analytics:', err);
        });
})();
