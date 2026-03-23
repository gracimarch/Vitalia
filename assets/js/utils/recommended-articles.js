/**
 * Recommended Articles - Logic Module
 * Selects relevant articles based on category matching and randomness.
 * Designed to be reusable across pages.
 */

/**
 * Returns an array of recommended articles (excluding the current one).
 * Prioritizes articles from the same category, then fills with random picks.
 *
 * @param {Array} allArticles - Full list of articles from lecturas.json
 * @param {Object} currentArticle - The article currently being viewed
 * @param {number} [count=2] - Number of recommendations to return
 * @returns {Array} Array of recommended article objects
 */
function getRecommendedArticles(allArticles, currentArticle, count = 2) {
    if (!allArticles || !currentArticle || allArticles.length <= 1) {
        return [];
    }

    // Exclude the current article
    const candidates = allArticles.filter(a => a.slug !== currentArticle.slug);

    if (candidates.length === 0) return [];

    // Normalize category for comparison (case-insensitive, trimmed)
    const currentCategory = (currentArticle.category || '').trim().toLowerCase();

    // Separate same-category and different-category articles
    const sameCategory = [];
    const otherCategory = [];

    candidates.forEach(article => {
        const cat = (article.category || '').trim().toLowerCase();
        if (cat && cat === currentCategory) {
            sameCategory.push(article);
        } else {
            otherCategory.push(article);
        }
    });

    // Shuffle both pools for variety
    shuffleArray(sameCategory);
    shuffleArray(otherCategory);

    // Pick from same category first, then fill with others
    const recommended = [];

    for (const article of sameCategory) {
        if (recommended.length >= count) break;
        recommended.push(article);
    }

    for (const article of otherCategory) {
        if (recommended.length >= count) break;
        recommended.push(article);
    }

    return recommended;
}

/**
 * Fisher-Yates shuffle (in-place)
 * @param {Array} array
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Renders the recommended articles section into the DOM.
 *
 * @param {Array} articles - The recommended articles to display
 * @param {HTMLElement} container - The DOM element to render into
 */
function renderRecommendedArticles(articles, container) {
    if (!articles || articles.length === 0 || !container) return;

    // Map categories to background class prefixes
    const categoryBgMap = {
        'productividad': 'bg-productiv',
        'salud mental y bienestar': 'bg-salud',
        'hábitos alimenticios': 'bg-alimentate',
        'actividad física y movilidad': 'bg-ejercita'
    };

    const html = `
        <div class="recommended-articles" id="recommended-articles">
            <div class="recommended-articles__header">
                <span class="recommended-articles__line"></span>
                <h3 class="recommended-articles__title">Seguí explorando</h3>
                <p class="recommended-articles__subtitle">Lecturas seleccionadas que podrían interesarte</p>
            </div>
            <div class="recommended-articles__grid">
                ${articles.map((article, idx) => {
                    const cat = (article.category || '').trim().toLowerCase();
                    const bgClass = categoryBgMap[cat] || 'bg-productiv';
                    const imagePath = article.image
                        ? (article.image.startsWith('/') ? article.image : '/' + article.image)
                        : '';
                    const description = article.description || '';
                    // Truncate description for card display
                    const shortDesc = description.length > 120
                        ? description.substring(0, 120).trim() + '…'
                        : description;

                    return `
                        <a href="/lecturas/${article.slug}" 
                           class="recommended-card brightness" 
                           id="recommended-card-${idx}"
                           aria-label="Leer: ${article.title}">
                            <div class="recommended-card__image-wrap ${bgClass}">
                                ${imagePath
                                    ? `<img class="recommended-card__image" 
                                           src="${imagePath}" 
                                           alt="${article.title}"
                                           loading="lazy">`
                                    : `<div class="recommended-card__image-placeholder">
                                           <i class="fa-solid fa-book-open"></i>
                                       </div>`
                                }
                                <div class="recommended-card__image-overlay"></div>
                            </div>
                            <div class="recommended-card__body">
                                <span class="recommended-card__category">${article.category || ''}</span>
                                <h4 class="recommended-card__title">${article.title}</h4>
                                <p class="recommended-card__excerpt">${shortDesc}</p>
                                <span class="recommended-card__cta">
                                    Leer artículo <i class="fa-solid fa-arrow-right"></i>
                                </span>
                            </div>
                        </a>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
}
