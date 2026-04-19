/**
 * Component Loader
 * Loads header and footer partials dynamically and handles active link states.
 */

/**
 * Rewrites clean Vercel-style URLs to .html paths when running locally.
 * NOTE: As of serve.json implementation, local environment now supports clean URLs natively.
 * This rewrite is now disabled to ensure consistency across environments.
 */
function rewriteLinksForLocal(html) {
    return html; // Return HTML as-is, preserve all clean URLs
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
            // initializeNavbarToggle is now handled by auth-state.js (new header design)


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
    const pageName    = currentPath.split("/").pop() || "index";
    const cleanPath   = currentPath.replace(/\/$/, "").replace(".html", "").replace("/pages", "");

    // ── New header nav links (.header-nav-link) ──
    const headerNavLinks = document.querySelectorAll(".header-nav-link");
    headerNavLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (!href) return;
        const cleanHref = href.replace(/\/$/, "").replace(".html", "").replace("/pages", "");
        if (
            cleanHref === cleanPath ||
            (cleanHref !== "" && cleanHref !== "/" && cleanPath.startsWith(cleanHref)) ||
            (cleanHref === "/" && (cleanPath === "" || cleanPath === "/" || cleanPath === "/index"))
        ) {
            link.classList.add("active");
        }
    });

    // ── Mobile panel nav links (.nav-mobile-link) ──
    const mobileNavLinks = document.querySelectorAll(".nav-mobile-link[href]");
    mobileNavLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (!href) return;
        const cleanHref = href.replace(/\/$/, "").replace(".html", "").replace("/pages", "");
        if (
            cleanHref === cleanPath ||
            (cleanHref !== "" && cleanHref !== "/" && cleanPath.startsWith(cleanHref)) ||
            (cleanHref === "/" && (cleanPath === "" || cleanPath === "/" || cleanPath === "/index"))
        ) {
            link.classList.add("active");
        }
    });

    // ── Legacy: .navbar-nav .nav-link (kept for backward compat) ──
    document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
        const href = link.getAttribute("href");
        if (!href) return;
        const cleanHref = href.replace(/\/$/, "").replace(".html", "").replace("/pages", "");
        if (cleanHref === cleanPath || (cleanHref !== "" && cleanHref !== "/" && cleanPath.startsWith(cleanHref))) {
            link.classList.add("active");
        } else if (cleanHref === "/" && (cleanPath === "" || cleanPath === "/" || cleanPath === "/index")) {
            link.classList.add("active");
        }
    });
}

// initializeNavbarToggle — kept as no-op stub for backward compatibility.
// Mobile panel is now managed by auth-state.js → initMobilePanel()
function initializeNavbarToggle() {
    // New header uses .nav-hamburger / .nav-mobile-panel — handled in auth-state.js
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
