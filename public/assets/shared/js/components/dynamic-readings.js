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
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" class="bi-arrow-up-right icon-arrow"><path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/></svg>
            </div>
            <div>
                <h3 class="article-title">${title}</h3>
                <div class="article-meta">
                    <i class="fa-solid fa-clock"></i>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" class="bi-arrow-up-right"><path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/></svg>
            Ir al blog
        </a>
    `;
    container.appendChild(blogLinkCard);
}
