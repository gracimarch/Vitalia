/**
 * Lectura Loader - Dynamic Content System
 * Loads article content from JSON based on URL slug parameter
 */

(function () {
    'use strict';

    // Get slug from URL parameter
    function getSlugFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('slug');
    }

    // Fetch lecturas data
    async function fetchLecturas() {
        try {
            const response = await fetch('data/lecturas.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de datos');
            }
            return await response.json();
        } catch (error) {
            console.error('Error cargando lecturas:', error);
            return null;
        }
    }

    // Find lectura by slug
    function findLecturaBySlug(lecturas, slug) {
        return lecturas.find(l => l.slug === slug);
    }

    // Update page title and meta tags
    function updateMetaTags(lectura) {
        document.getElementById('page-title').textContent = lectura.title;
        document.getElementById('meta-description').setAttribute('content', lectura.description);
        document.getElementById('meta-keywords').setAttribute('content', lectura.keywords);
    }

    // Update article header
    function updateArticleHeader(lectura) {
        document.getElementById('article-category').textContent = lectura.category;
        document.getElementById('article-title').textContent = lectura.title;
        document.getElementById('reading-time-text').textContent = lectura.readingTime;
    }

    // Update introduction
    function updateIntroduction(lectura) {
        const introDiv = document.getElementById('introduction');
        introDiv.innerHTML = lectura.introduction;
    }

    // Update article image
    function updateImage(lectura) {
        const img = document.getElementById('article-image');
        img.src = lectura.image;
        img.alt = `Imagen de ${lectura.title}`;
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
