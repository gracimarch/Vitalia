document.addEventListener('DOMContentLoaded', async () => {
    // Show skeleton loaders while data loads
    ['productividad-list', 'ejercicios-list', 'alimentacion-list', 'salud-mental-list'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `
            <div class="blog-skeleton-card"><div class="blog-skeleton-category"></div></div>
            <div class="blog-skeleton-card"><div class="blog-skeleton-category"></div></div>
            <div class="blog-skeleton-card"><div class="blog-skeleton-category"></div></div>
        `;
    });

    try {
        const [lecturasRes, dietasRes, rutinasRes] = await Promise.all([
            fetch('/assets/data/lecturas.json'),
            fetch('/assets/data/dietas.json'),
            fetch('/assets/data/rutina.json')
        ]);

        if (!lecturasRes.ok) throw new Error('No se pudo cargar lecturas.json');

        const lecturasData = await lecturasRes.json();
        const dietasData = dietasRes.ok ? await dietasRes.json() : { dietas: [] };
        const rutinasData = rutinasRes.ok ? await rutinasRes.json() : { rutinas: [] };

        const allLecturas = lecturasData.lecturas || [];
        const allDietas   = dietasData.dietas || [];
        const allRutinas  = rutinasData.rutinas || [];

        // ── Normalizar categoría para comparación case-insensitive ──
        const normalize = (str) => (str || '').toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

        // 1. Productividad
        const productivityItems = allLecturas.filter(l => normalize(l.category) === 'productividad');

        // 2. Salud mental y bienestar
        const mentalHealthItems = allLecturas.filter(l => normalize(l.category) === 'salud mental y bienestar');

        // 3. Actividad física y movilidad (Artículos + Rutinas de ejercicio)
        const fitnessArticles = allLecturas.filter(l => normalize(l.category) === 'actividad fisica y movilidad');
        const fitnessItems = [
            ...(allRutinas.slice(0, 2)),      // Top 2 rutinas interactivas
            ...fitnessArticles,              // Artículo de movilidad adaptada
            ...(allRutinas.slice(2))         // Resto de rutinas (yoga, core, calistenia, etc.)
        ];

        // 4. Hábitos alimenticios (Artículos + Planes de alimentación)
        const nutritionArticles = allLecturas.filter(l => normalize(l.category) === 'habitos alimenticios');
        const featuredDietSlugs = ['energia-y-vitalidad', 'aliviar-la-ansiedad-en-dias-estresantes', 'express-vegetariana', 'dias-ocupados'];
        const featuredDiets = allDietas.filter(d => featuredDietSlugs.includes(d.slug));
        const otherDiets    = allDietas.filter(d => !featuredDietSlugs.includes(d.slug));

        const nutritionItems = [
            ...(nutritionArticles.slice(0, 1)), // Artículo Alimentación Consciente
            ...(featuredDiets.slice(0, 2)),      // Planes Energía y Antiestrés
            ...(nutritionArticles.slice(1)),    // Dieta a Base de Plantas, Nutrición y Discapacidad
            ...(featuredDiets.slice(2)),        // Express Vegetariana, Días Ocupados
            ...otherDiets                       // Resto de planes
        ];

        // Inicializar secciones
        initSection('productividad-list', productivityItems, 'productividad');
        initSection('ejercicios-list', fitnessItems, 'ejercicio');
        initSection('alimentacion-list', nutritionItems, 'dieta');
        initSection('salud-mental-list', mentalHealthItems, 'salud-mental');

        // Construir índice de búsqueda global (Lecturas + Dietas + Rutinas)
        const allBlogItems = buildSearchIndex(allLecturas, allDietas, allRutinas);

        // Inicializar búsqueda
        initSearch(allBlogItems);

    } catch (error) {
        console.error('Error loading blog content:', error);
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

    container.innerHTML = '';

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

    renderBatch();
}

function createCard(item, stylePrefix, index) {
    const a = document.createElement('a');

    // Determinar URL
    let url = '#';
    if (item.slug) {
        if (item.schedule) url = `/dietas/${item.slug}`;      // Dieta
        else if (item.exercises) url = `/rutinas/${item.slug}`; // Rutina
        else url = `/lecturas/${item.slug}`;                  // Lectura
    }

    // Clase de gradiente (cicla 1 a 4)
    const gradientIndex = (index % 4) + 1;
    a.className = `block brightness bg-${stylePrefix}-${gradientIndex}`;
    a.href = url;

    // Subtítulo descriptivo (Categoría / Nivel / Tipo de alimentación)
    let subtitle = 'General';
    if (item.exercises) {
        subtitle = item.level ? `Rutina · ${item.level.replace(/^Nivel\s*/i, '')}` : 'Rutina de Ejercicio';
    } else if (item.schedule) {
        subtitle = item.type ? `Plan · ${item.type.replace(/^Tipo de [aA]limentación:\s*/i, '')}` : 'Plan de Alimentación';
    } else if (item.category) {
        subtitle = item.category;
    }

    // Duración o tiempo de lectura
    let timeText = 'N/A';
    if (item.readingTime) {
        timeText = item.readingTime;
    } else if (item.duration) {
        timeText = item.duration.replace(/\s*de duración/i, '');
    }

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

function buildSearchIndex(lecturas, dietas, rutinas) {
    const items = [];

    (lecturas || []).forEach(item => {
        items.push({
            ...item,
            _stylePrefix: getStylePrefixForLectura(item.category),
            _searchText: normalizeText([
                item.title,
                item.category || '',
                item.description || '',
                item.keywords || '',
                'lectura articulo blog bienestar'
            ].join(' '))
        });
    });

    (dietas || []).forEach(item => {
        items.push({
            ...item,
            _stylePrefix: 'dieta',
            _searchText: normalizeText([
                item.title,
                item.type || '',
                item.description || '',
                'dieta alimentacion nutricion comida receta plan habitos'
            ].join(' '))
        });
    });

    (rutinas || []).forEach(item => {
        items.push({
            ...item,
            _stylePrefix: 'ejercicio',
            _searchText: normalizeText([
                item.title,
                item.level || '',
                item.description || '',
                'rutina ejercicio actividad fisica entrenamiento workout fitness movilidad'
            ].join(' '))
        });
    });

    return items;
}

function getStylePrefixForLectura(category) {
    if (!category) return 'productividad';
    const cat = normalizeText(category);
    if (cat.includes('productividad')) return 'productividad';
    if (cat.includes('actividad fisica') || cat.includes('movilidad') || cat.includes('ejercicio')) return 'ejercicio';
    if (cat.includes('habitos alimenticios') || cat.includes('alimentic') || cat.includes('dieta')) return 'dieta';
    if (cat.includes('salud mental') || cat.includes('bienestar')) return 'salud-mental';
    return 'productividad';
}

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

        const terms = normalized.split(/\s+/).filter(t => t.length > 1);

        const matches = allItems.filter(item => {
            return terms.every(term => item._searchText.includes(term));
        });

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

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(input.value);
        }, 300);
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        performSearch('');
        input.focus();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            input.value = '';
            performSearch('');
            input.blur();
        }
    });
}
