/**
 * Lectura Loader - Dynamic Content System
 * Loads article content from JSON based on URL slug parameter
 */

(function () {
    'use strict';

    // Get slug from URL path
    function getSlugFromURL() {
        if (window.VitaliaRouter) {
            return window.VitaliaRouter.getSlug();
        }
        return null;
    }

    // Fetch lecturas data
    async function fetchLecturas() {
        try {
            // Always use absolute path for data
            const url = '/assets/data/lecturas.json';

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de datos');
            }
            return await response.json();
        } catch (error) {
            console.error('Error cargando lecturas:', error);
            showErrorUI();
            return null;
        }
    }

    // Find lectura by slug
    function findLecturaBySlug(lecturas, slug) {
        return lecturas.find(l => l.slug === slug);
    }

    // Render article content
    function renderArticle(lectura) {
        // Helper for image paths - ensure absolute
        const getPath = (path) => {
            if (path.startsWith('http')) return path;
            return path.startsWith('/') ? path : '/' + path;
        };

        // Meta tags
        document.title = lectura.title + " | Vitalia";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", lectura.description);

        const metaKeys = document.querySelector('meta[name="keywords"]');
        if (metaKeys) metaKeys.setAttribute("content", lectura.keywords);

        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = lectura.title;

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
            articleImage.style.display = 'block';
        }
    }

    // Generate table of contents
    function generateTableOfContents(lectura) {
        const tocList = document.getElementById('table-of-contents');
        if (!tocList) return;

        tocList.innerHTML = '';

        if (lectura.tableOfContents) {
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
    }

    // Generate article sections
    function generateArticleContent(lectura) {
        const contentDiv = document.getElementById('article-content');
        if (!contentDiv) return;

        contentDiv.innerHTML = '';

        if (lectura.sections) {
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
    }

    // Show Error UI
    function showErrorUI() {
        const titleContainer = document.getElementById('page-title');
        if (titleContainer) titleContainer.textContent = 'Error';

        const articleContent = document.getElementById('article-content');
        if (articleContent) {
            articleContent.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2>Error</h2>
                    <h1>Lectura no encontrada</h1>
                    <p>Lo sentimos, la lectura que buscas no existe o ha sido movida.</p>
                    <a href="/blog.html" style="text-decoration: underline; color: #7134A2;">Volver al blog</a>
                </div>
            `;
        }
    }

    // Show 404 error
    function show404Error() {
        const artCat = document.getElementById('article-category');
        if (artCat) artCat.textContent = 'Error';

        const artTitle = document.getElementById('article-title');
        if (artTitle) artTitle.textContent = 'Lectura no encontrada';

        const readTime = document.getElementById('reading-time-text');
        if (readTime) readTime.textContent = '';

        const introDiv = document.getElementById('introduction');
        if (introDiv) {
            introDiv.innerHTML = `
                <p>Lo sentimos, la lectura que buscas no existe o ha sido movida.</p>
                <p><a href="/blog.html" style="color: var(--purple-light); text-decoration: underline;">Volver al blog</a></p>
            `;
        }

        const artImg = document.getElementById('article-image');
        if (artImg) artImg.style.display = 'none';

        const toc = document.getElementById('table-of-contents');
        if (toc) toc.innerHTML = '';

        const content = document.getElementById('article-content');
        if (content) content.innerHTML = '';

        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = 'Lectura no encontrada - Vitalia';

        // Ensure visibility
        document.querySelectorAll('.title, .article, .introduction-container').forEach(el => {
            el.classList.add('animate');
            el.style.opacity = '1';
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
        renderArticle(lectura);
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
