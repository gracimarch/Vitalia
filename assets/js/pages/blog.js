document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [lecturasRes, dietasRes, rutinasRes] = await Promise.all([
            fetch('/assets/data/lecturas.json'),
            fetch('/assets/data/dietas.json'),
            fetch('/assets/data/rutinas.json')
        ]);

        const lecturasData = await lecturasRes.json();
        const dietasData = await dietasRes.json();
        const rutinasData = await rutinasRes.json();

        // Categorize Data
        const productivityItems = lecturasData.lecturas.filter(l => l.category === 'Productividad');
        const mentalHealthItems = lecturasData.lecturas.filter(l => l.category === 'Salud mental y bienestar');

        // Merge Diets + Nutrition Articles
        const nutritionArticles = lecturasData.lecturas.filter(l => l.category === 'Hábitos alimenticios');
        const nutritionItems = [...nutritionArticles, ...dietasData.dietas];

        // Merge Routines + Fitness Articles
        const fitnessArticles = lecturasData.lecturas.filter(l => l.category === 'Actividad física y movilidad');
        const fitnessItems = [...rutinasData.rutinas, ...fitnessArticles];

        // Initialize Sections
        initSection('productividad-list', productivityItems, 'productividad');
        initSection('ejercicios-list', fitnessItems, 'ejercicio');
        initSection('alimentacion-list', nutritionItems, 'dieta');
        initSection('salud-mental-list', mentalHealthItems, 'salud-mental');

    } catch (error) {
        console.error('Error loading blog content:', error);
    }
});

const BATCH_SIZE = 3;

function initSection(containerId, items, stylePrefix) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let renderedCount = 0;

    const collapse = () => {
        container.innerHTML = '';
        renderedCount = 0;
        renderBatch();

        // Scroll back to container with some offset for header
        const headerOffset = 100;
        const elementPosition = container.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    };

    const renderBatch = () => {
        const batch = items.slice(renderedCount, renderedCount + BATCH_SIZE);

        // Append items
        if (batch.length > 0) {
            batch.forEach((item, index) => {
                const globalIndex = renderedCount + index;
                const card = createCard(item, stylePrefix, globalIndex);
                container.appendChild(card);
            });
            renderedCount += batch.length;
        }

        // Manage Button
        let btn = container.parentNode.querySelector('.load-more-btn');

        // Check if we still have items to load
        if (renderedCount < items.length) {
            if (!btn) {
                btn = document.createElement('button');
                btn.className = `load-more-btn btn-${stylePrefix}`;
                // Insert after the container
                container.parentNode.insertBefore(btn, container.nextSibling);
            }
            btn.textContent = 'Ver más';
            btn.onclick = renderBatch;
        } else {
            // All items loaded
            if (items.length > BATCH_SIZE) {
                // If we have more items than the initial batch, show "See Less"
                if (!btn) {
                    btn = document.createElement('button');
                    btn.className = `load-more-btn btn-${stylePrefix}`;
                    container.parentNode.insertBefore(btn, container.nextSibling);
                }
                btn.textContent = 'Ver menos';
                btn.onclick = collapse;
            } else {
                // If total items <= BATCH_SIZE, no button needed
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
                <i class="bi bi-clock"></i>
                <span>${timeText}</span>
            </div>
        </div>
    `;

    return a;
}
