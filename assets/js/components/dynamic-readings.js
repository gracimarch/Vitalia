document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/assets/data/lecturas.json');
        if (!response.ok) throw new Error('Failed to load lecturas.json');

        const data = await response.json();
        const allReadings = data.lecturas;

        const container = document.getElementById('dynamic-readings-list');
        if (!container) return;

        // Get daily selection
        const selectedReadings = getDailyReadings(allReadings, 4);

        renderReadings(container, selectedReadings);

    } catch (error) {
        console.error('Error loading dynamic readings:', error);
        // Fallback or error handling could go here
    }
});

function getDailyReadings(allReadings, count) {
    if (!allReadings || allReadings.length === 0) return [];

    // Seed based on day of year to rotate daily
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const selected = [];
    // Use dayOfYear as offset, rotate through the list
    for (let i = 0; i < count; i++) {
        const index = (dayOfYear + i) % allReadings.length;
        selected.push(allReadings[index]);
    }

    return selected;
}

function renderReadings(container, readings) {
    container.innerHTML = '';

    readings.forEach(reading => {
        const card = document.createElement('a');
        card.href = `/lecturas/${reading.slug}`;
        card.className = 'article-card';

        // Default values if missing in JSON
        const category = reading.category || 'Bienestar';
        const title = reading.title || 'Artículo sin título';
        const duration = reading.readingTime || '5 min';

        card.innerHTML = `
            <div class="article-header">
                <span class="article-category">${category}</span>
                <i class="bi bi-arrow-up-right icon-arrow"></i>
            </div>
            <div>
                <h3 class="article-title">${title}</h3>
                <div class="article-meta">
                    <i class="bi bi-clock"></i>
                    <span>${duration}</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // Add Blog Link Card (always last)
    const blogLinkCard = document.createElement('div');
    blogLinkCard.className = 'blog-info-card';
    blogLinkCard.id = 'blog';
    blogLinkCard.innerHTML = `
        <div class="blog-info-text">
            <h3>¿No Encuentras lo que Buscas?</h3>
            <p>Echa un vistazo a nuestro blog completo para acceder a una variedad de artículos útiles</p>
        </div>
        <a href="/blog" class="btn" target="_blank">
            <i class="bi bi-box-arrow-up-right"></i>
            Ir al blog
        </a>
    `;
    container.appendChild(blogLinkCard);
}
