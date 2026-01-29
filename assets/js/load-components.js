/**
 * Component Loader
 * Loads header and footer partials dynamically and handles active link states.
 */

document.addEventListener("DOMContentLoaded", function () {

    // CHECK: Block file:// protocol which breaks fetch
    if (window.location.protocol === 'file:') {
        console.warn("Fetch API does not support file:// protocol. Header and Footer will not load.");
        const headerPlaceholder = document.getElementById("header-placeholder");
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = '<div style="background:#ffcccc; color:red; padding:20px; text-align:center; border:2px solid red;"><strong>Error:</strong> No se pueden cargar los componentes (Header/Footer) abriendo el archivo directamente. <br>Por favor, usa un servidor local (ej: VS Code Live Server).</div>';
        }
        return;
    }

    // Robustly find the script element that is this file
    const scripts = document.getElementsByTagName("script");
    let currentScript = null;

    for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].getAttribute("src");
        if (src && src.includes("load-components.js")) {
            currentScript = scripts[i];
            break;
        }
    }

    if (!currentScript) {
        console.error("Could not locate load-components.js script tag. Defaulting to root path.");
    }

    // Determine root path by looking at how this script was included
    // e.g., src="../assets/js/load-components.js" -> root is "../"
    // e.g., src="assets/js/load-components.js" -> root is "./" or ""
    let scriptSrc = currentScript ? currentScript.getAttribute("src") : "assets/js/load-components.js";
    let rootPath = "./";

    if (scriptSrc) {
        // If script is in assets/js/, we can deduce the root
        // If src contains "../", we count how many to determine depth
        const match = scriptSrc.match(/^(\.\.\/)+/);
        if (match) {
            rootPath = match[0];
        } else if (scriptSrc.startsWith("assets/")) {
            rootPath = "./";
        }
    }

    // Safety check: if we are in a subfolder but the script was somehow loaded absolutely,
    // we might need manual override. But assuming standard relative linking:
    // subdirectory/file.html -> <script src="../assets/js/load-components.js"> -> rootPath = "../"
    // index.html -> <script src="assets/js/load-components.js"> -> rootPath = "./"

    const componentsPath = rootPath + "assets/components/";

    // Load Header
    fetch(componentsPath + "header.html")
        .then(response => response.text())
        .then(data => {
            // Replace {{ROOT}} with calculated rootPath
            // Use regex global replace
            const headerHTML = data.replace(/{{ROOT}}/g, rootPath);
            document.getElementById("header-placeholder").innerHTML = headerHTML;

            // Highlight Active Link
            highlightActiveLink(rootPath);

            // Re-initialize Bootstrap logic if needed (e.g. collapse)
            // Bootstrap 5 usually works with data attributes automatically, 
            // but if it scans DOM on load, we might need to manually init or ensure script runs after.
        })
        .catch(err => console.error("Error loading header:", err));

    // Load Footer
    fetch(componentsPath + "footer.html")
        .then(response => response.text())
        .then(data => {
            const footerHTML = data.replace(/{{ROOT}}/g, rootPath);
            document.getElementById("footer-placeholder").innerHTML = footerHTML;
        })
        .catch(err => console.error("Error loading footer:", err));
});

function highlightActiveLink(rootPath) {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split("/").pop() || "index.html";

    // Map generic page names to nav IDs if needed, or just match hrefs
    // Simple logic: Find link that ends with the current page name

    // Special case for root index
    if (pageName === "index.html" || pageName === "") {
        // Mark "Acerca de" as active if we are on index
        // Or specific logic if user wants. Current site has explicit IDs.
        // Let's look for href matching pageName
    }

    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (!href) return;

        // Clean href of {{ROOT}} or actual root path for comparison
        // But since we just injected it, it has the real path.

        // Check if href ends with page name
        // Example: href="../blog.html", pageName="blog.html" -> Match
        if (href.endsWith(pageName)) {
            link.classList.add("active");
            // Also add 'bold' id style if that's what the user uses for active state?
            // Looking at CSS, #bold is used for "Acerca de" specifically, not generic active.
            // But usually active state makes font bold.
            link.style.fontWeight = "700";
            link.style.color = "#333";
        }
    });

    // Special handling for Mi Espacio which has specific styling requirements?
    // User had id="bold" on "Mi espacio" in the mi-espacio.html static file.
    // We can replicate this by checking page name.

    if (pageName === "mi-espacio.html") {
        const miEspacioLink = document.querySelector('a[href*="mi-espacio.html"]');
        if (miEspacioLink) miEspacioLink.id = "bold";
    }

    if (pageName === "index.html" || pageName === "") {
        const aboutLink = document.querySelector('a[href*="index.html"]:not(.navbar-brand)');
        // "Acerca de" points to index.html usually
        // Actually, user had id="bold" on "Acerca de" in index.html.
        const links = document.querySelectorAll('a[href*="index.html"]');
        links.forEach(l => {
            if (l.textContent.includes("Acerca de")) {
                l.id = "bold";
            }
        });
    }
}
