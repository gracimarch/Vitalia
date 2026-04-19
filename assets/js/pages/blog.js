document.addEventListener('DOMContentLoaded', async () => {
    // Show skeleton loaders while data loads
    ['productividad-list', 'ejercicios-list', 'alimentacion-list', 'salud-mental-list'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `
            <div class="blog-skeleton-card"></div>
            <div class="blog-skeleton-card"></div>
            <div class="blog-skeleton-card"></div>
        `;
    });

    try {
        const [lecturasRes, dietasRes] = await Promise.all([
            fetch('/assets/data/lecturas.json'),
            fetch('/assets/data/dietas.json')
        ]);

        if (!lecturasRes.ok) throw new Error('No se pudo cargar lecturas.json');

        const lecturasData = await lecturasRes.json();

        // ── FIX: normalizar categoría para comparación case-insensitive ──
        const normalize = (str) => (str || '').toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

        const productivityItems  = lecturasData.lecturas.filter(l => normalize(l.category) === 'productividad');
        const mentalHealthItems  = lecturasData.lecturas.filter(l => normalize(l.category) === 'salud mental y bienestar');
        const nutritionItems     = lecturasData.lecturas.filter(l => normalize(l.category) === 'habitos alimenticios');
        const fitnessItems       = lecturasData.lecturas.filter(l => normalize(l.category) === 'actividad fisica y movilidad');

        // Initialize Sections
        initSection('productividad-list', productivityItems, 'productividad');
        initSection('ejercicios-list', fitnessItems, 'ejercicio');
        initSection('alimentacion-list', nutritionItems, 'dieta');
        initSection('salud-mental-list', mentalHealthItems, 'salud-mental');

        // Build global search index (ARTICLES ONLY)
        const allBlogItems = buildSearchIndex(lecturasData.lecturas);

        // Initialize search
        initSearch(allBlogItems);

    } catch (error) {
        console.error('Error loading blog content:', error);
        // Show error state in all sections
        ['productividad-list', 'ejercicios-list', 'alimentacion-list', 'salud-mental-list'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `
                <div class="blog-empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>No se pudo cargar el contenido. Intenta recargar la página.</p>
                </div>
            `;
        });
    }
});

const BATCH_SIZE = 3;

function initSection(containerId, items, stylePrefix) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // ── Limpiar skeletons antes de renderizar ──
    container.innerHTML = '';

    // Si no hay artículos en esta categoría, mostrar mensaje
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="blog-empty-state" style="grid-column:1/-1">
                <i class="fa-solid fa-book-open-reader"></i>
                <p>No hay artículos disponibles en esta categoría aún.</p>
            </div>`;
        return;
    }

    let renderedCount = 0;

    const collapse = () => {
        container.innerHTML = '';
        renderedCount = 0;
        renderBatch();

        const headerOffset = 100;
        const elementPosition = container.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    };

    const renderBatch = () => {
        const batch = items.slice(renderedCount, renderedCount + BATCH_SIZE);

        if (batch.length > 0) {
            batch.forEach((item, index) => {
                const globalIndex = renderedCount + index;
                const card = createCard(item, stylePrefix, globalIndex);
                container.appendChild(card);
            });
            renderedCount += batch.length;
        }

        let btn = container.parentNode.querySelector('.load-more-btn');

        if (renderedCount < items.length) {
            if (!btn) {
                btn = document.createElement('button');
                btn.className = `load-more-btn btn-${stylePrefix}`;
                container.parentNode.insertBefore(btn, container.nextSibling);
            }
            btn.textContent = 'Ver más';
            btn.onclick = renderBatch;
        } else {
            if (items.length > BATCH_SIZE) {
                if (!btn) {
                    btn = document.createElement('button');
                    btn.className = `load-more-btn btn-${stylePrefix}`;
                    container.parentNode.insertBefore(btn, container.nextSibling);
                }
                btn.textContent = 'Ver menos';
                btn.onclick = collapse;
            } else {
                if (btn) btn.remove();
            }
        }
    };

    // Initial Render
    renderBatch();
}

function createCard(item, stylePrefix, index) {
    const a = document.createElement('a');

    // Determine URL
    let url = '#';
    if (item.slug) {
        if (item.schedule) url = `/dietas/${item.slug}`; // Detect Diet
        else if (item.exercises) url = `/rutinas/${item.slug}`; // Detect Routine
        else url = `/lecturas/${item.slug}`; // Default Article
    }

    // Determine Gradient Class (cycle 1-4)
    const gradientIndex = (index % 4) + 1;
    a.className = `block brightness bg-${stylePrefix}-${gradientIndex}`;
    a.href = url;
    // Add IDs for specific override potential, though unique IDs per dynamic item is tricky.
    // We'll skip ID generation on the card itself to avoid conflicts, relies on class styling.

    // Determine Subtitle (Category/Level/Type)
    let subtitle = item.category || item.level || (item.type ? item.type.replace('Tipo de Alimentación: ', '') : 'General');

    // Determine Time text
    let timeText = item.readingTime || item.duration || 'N/A';

    // HTML Structure
    a.innerHTML = `
        <p>${subtitle}</p>
        <div class="heading-time">
            <h3>${item.title}</h3>
            <div class="reading-time">
                <i class="fa-solid fa-clock"></i>
                <span>${timeText}</span>
            </div>
        </div>
    `;

    return a;
}

/* =========================================
   SEARCH FUNCTIONALITY
   ========================================= */

function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function buildSearchIndex(lecturas) {
    const items = [];

    lecturas.forEach(item => {
        items.push({
            ...item,
            _stylePrefix: getStylePrefixForLectura(item.category),
            _searchText: normalizeText([
                item.title,
                item.category || '',
                item.description || '',
                item.keywords || '',
                'lectura articulo'
            ].join(' '))
        });
    });

    return items;
}

function getStylePrefixForLectura(category) {
    if (!category) return 'productividad';
    const cat = normalizeText(category);
    if (cat.includes('productividad')) return 'productividad';
    if (cat.includes('actividad fisica') || cat.includes('movilidad')) return 'ejercicio';
    if (cat.includes('habitos alimenticios') || cat.includes('alimentic')) return 'dieta';
    if (cat.includes('salud mental') || cat.includes('bienestar')) return 'salud-mental';
    return 'productividad';
}

// Sections to hide/show when searching
const BLOG_CONTENT_SELECTORS = [
    '#productividad', '#ejercicios', '#alimentaciones', '#salud-mental',
    '.lecturas',
    '.ejercicios',
    '.thanks'
];

function initSearch(allItems) {
    const input = document.getElementById('blog-search-input');
    const clearBtn = document.getElementById('search-clear');
    const resultsCount = document.getElementById('search-results-count');
    const resultsSection = document.getElementById('search-results-section');
    const resultsGrid = document.getElementById('search-results-grid');
    const noResults = document.getElementById('search-no-results');

    if (!input) return;

    let debounceTimer = null;

    const toggleBlogContent = (visible) => {
        BLOG_CONTENT_SELECTORS.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (visible) {
                    el.classList.remove('blog-content-hidden');
                } else {
                    el.classList.add('blog-content-hidden');
                }
            });
        });
    };

    const performSearch = (query) => {
        const normalized = normalizeText(query.trim());

        if (!normalized) {
            // Clear search
            resultsSection.style.display = 'none';
            resultsGrid.innerHTML = '';
            noResults.style.display = 'none';
            resultsCount.textContent = '';
            clearBtn.style.display = 'none';
            toggleBlogContent(true);
            return;
        }

        clearBtn.style.display = 'flex';
        toggleBlogContent(false);
        resultsSection.style.display = 'block';

        // Split query into words for multi-term matching
        const terms = normalized.split(/\s+/).filter(t => t.length > 1);

        const matches = allItems.filter(item => {
            return terms.every(term => item._searchText.includes(term));
        });

        // Render results
        resultsGrid.innerHTML = '';

        if (matches.length > 0) {
            noResults.style.display = 'none';
            matches.forEach((item, index) => {
                const card = createCard(item, item._stylePrefix, index);
                resultsGrid.appendChild(card);
            });
            resultsCount.textContent = `${matches.length} resultado${matches.length !== 1 ? 's' : ''} encontrado${matches.length !== 1 ? 's' : ''}`;
        } else {
            noResults.style.display = 'block';
            resultsCount.textContent = '';
        }
    };

    // Input event with debounce
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(input.value);
        }, 300);
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        input.value = '';
        performSearch('');
        input.focus();
    });

    // Allow Escape key to clear
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            input.value = '';
            performSearch('');
            input.blur();
        }
    });
}
