/**
 * Lectura Loader - Dynamic Content System
 * Loads article content from JSON based on URL slug parameter
 */

(function () {
    'use strict';

    // Get slug from URL parameter
    let isVisualFix = false;

    // Get slug from URL parameter or path
    function getSlugFromURL() {
        // First try to get slug from path: /lecturas/slug
        const path = window.location.pathname;
        if (path.includes('/lecturas/')) {
            const parts = path.split('/lecturas/');
            if (parts.length > 1 && parts[1]) {
                return parts[1].replace('.html', '').replace('/', '');
            }
        }

        // Fallback to query param
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');

        // Visual Fix: If on localhost and using query param, mask it with clean URL
        if (slug && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            window.history.replaceState({}, '', `/lecturas/${slug}`);
            isVisualFix = true;
        }

        return slug;
    }

    // Fetch lecturas data
    async function fetchLecturas() {
        try {
            // If visual fix is active, we are effectively in /lecturas/ folder visually,
            // so we need to go up one level to find data folder.
            const url = isVisualFix ? '../data/lecturas.json' : 'data/lecturas.json';
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de datos');
            }
            return await response.json();
        } catch (error) {
            console.error('Error cargando lecturas:', error);
            // Show error in UI
            const titleContainer = document.getElementById('page-title');
            if (titleContainer) titleContainer.textContent = 'Error';

            const articleContent = document.getElementById('article-content');
            if (articleContent) {
                articleContent.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h2>Error</h2>
                        <h1>Lectura no encontrada</h1>
                        <p>Lo sentimos, la lectura que buscas no existe o ha sido movida.</p>
                        <a href="blog.html" style="text-decoration: underline; color: #7134A2;">Volver al blog</a>
                    </div>
                `;
            }
            return null;
        }
    }

    // Find lectura by slug
    function findLecturaBySlug(lecturas, slug) {
        return lecturas.find(l => l.slug === slug);
    }

    // Render article content
    function renderArticle(lectura) {
        // Helper for image paths
        const getPath = (path) => isVisualFix ? `../${path}` : path;

        // Meta tags
        document.title = lectura.title + " | Vitalia";
        document.querySelector('meta[name="description"]').setAttribute("content", lectura.description);
        document.querySelector('meta[name="keywords"]').setAttribute("content", lectura.keywords);
        document.getElementById('page-title').textContent = lectura.title;

        // Title Section
        const articleCategory = document.getElementById('article-category');
        if (articleCategory) articleCategory.textContent = lectura.category;

        const articleTitle = document.getElementById('article-title');
        if (articleTitle) articleTitle.textContent = lectura.title;

        const readingTime = document.getElementById('reading-time-text');
        if (readingTime) readingTime.textContent = lectura.readingTime;

        // Introduction
        const introduction = document.getElementById('introduction');
        if (introduction) introduction.innerHTML = lectura.introduction;

        // Image
        const articleImage = document.getElementById('article-image');
        if (articleImage) {
            articleImage.src = getPath(lectura.image);
            articleImage.alt = `Imagen de ${lectura.title}`;
        }
    }

    // Generate table of contents
    function generateTableOfContents(lectura) {
        const tocList = document.getElementById('table-of-contents');
        tocList.innerHTML = '';

        lectura.tableOfContents.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'item-indice';
            a.href = `#${item.id}`;
            a.textContent = item.title;
            li.appendChild(a);
            tocList.appendChild(li);
        });
    }

    // Generate article sections
    function generateArticleContent(lectura) {
        const contentDiv = document.getElementById('article-content');
        contentDiv.innerHTML = '';

        lectura.sections.forEach(section => {
            // Create section title
            const titleDiv = document.createElement('div');
            titleDiv.className = 'article-title';
            titleDiv.id = section.id;
            const h2 = document.createElement('h2');
            h2.textContent = section.title;
            titleDiv.appendChild(h2);
            contentDiv.appendChild(titleDiv);

            // Create section content
            const articleDiv = document.createElement('div');
            articleDiv.className = 'article';
            articleDiv.innerHTML = section.content;
            contentDiv.appendChild(articleDiv);
        });
    }

    // Show 404 error
    function show404Error() {
        document.getElementById('article-category').textContent = 'Error';
        document.getElementById('article-title').textContent = 'Lectura no encontrada';
        document.getElementById('reading-time-text').textContent = '';

        const introDiv = document.getElementById('introduction');
        introDiv.innerHTML = `
            <p>Lo sentimos, la lectura que buscas no existe o ha sido movida.</p>
            <p><a href="blog.html" style="color: var(--purple-light); text-decoration: underline;">Volver al blog</a></p>
        `;

        document.getElementById('article-image').style.display = 'none';
        document.getElementById('table-of-contents').innerHTML = '';
        document.getElementById('article-content').innerHTML = '';
        document.getElementById('page-title').textContent = 'Lectura no encontrada - Vitalia';

        // Ensure visibility
        document.querySelectorAll('.title, .article, .introduction-container').forEach(el => {
            el.classList.add('animate');
            el.style.opacity = '1'; // Force opacity just in case
        });
    }

    // Main initialization function
    async function init() {
        const slug = getSlugFromURL();

        if (!slug) {
            show404Error();
            return;
        }

        const data = await fetchLecturas();

        if (!data || !data.lecturas) {
            show404Error();
            return;
        }

        const lectura = findLecturaBySlug(data.lecturas, slug);

        if (!lectura) {
            show404Error();
            return;
        }

        // Populate page with lectura data
        updateMetaTags(lectura);
        updateArticleHeader(lectura);
        updateIntroduction(lectura);
        updateImage(lectura);
        generateTableOfContents(lectura);
        generateArticleContent(lectura);

        // Dispatch event to trigger animations
        document.dispatchEvent(new Event('article-content-loaded'));
    }

    // Run init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
