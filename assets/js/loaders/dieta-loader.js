/**
 * Dieta Loader — Redesigned Dynamic Content System
 * Loads diet content from JSON and populates the new tabbed UI
 */

(function () {
    'use strict';

    const ICON_MAP = {
        'desayuno':  'bi bi-sun',
        'almuerzo':  'bi bi-cloud-sun',
        'cena':      'bi bi-moon-stars',
        'snack':     'bi bi-lightning-charge',
        'merienda':  'bi bi-cup-hot',
        'default':   'bi bi-egg-fried'
    };

    function getSlugFromPath() {
        if (window.VitaliaRouter) return window.VitaliaRouter.getSlug();
        return null;
    }

    function getPath(path) {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return path.startsWith('/') ? path : '/' + path;
    }

    function getMealIcon(label) {
        const key = label.toLowerCase();
        for (const [k, v] of Object.entries(ICON_MAP)) {
            if (key.includes(k)) return v;
        }
        return ICON_MAP.default;
    }

    function getVariationIcon(type) {
        const t = type.toLowerCase();
        if (t.includes('gluten'))   return 'bi bi-shield-check';
        if (t.includes('vegetar'))  return 'bi bi-leaf';
        if (t.includes('vegano'))   return 'bi bi-tree';
        if (t.includes('lácte') || t.includes('lacte')) return 'bi bi-droplet-half';
        return 'bi bi-stars';
    }

    async function fetchDietas() {
        try {
            const response = await fetch('/assets/data/dietas.json');
            if (!response.ok) throw new Error('No se pudo cargar los datos');
            return await response.json();
        } catch (err) {
            console.error('Error cargando dietas:', err);
            return null;
        }
    }

    function findDietaBySlug(dietas, slug) {
        return dietas.find(d => d.slug === slug);
    }

    /* ================================================
       RENDER HERO
       ================================================ */
    function renderHero(dieta) {
        document.title = dieta.title + ' | Vitalia';

        const img = document.getElementById('diet-hero-img');
        if (img) {
            img.src = getPath(dieta.image);
            img.alt = dieta.title;
        }

        const typeEl = document.getElementById('diet-hero-type');
        if (typeEl) typeEl.textContent = dieta.type || '';

        const titleEl = document.getElementById('diet-hero-title');
        if (titleEl) titleEl.textContent = dieta.title;

        const badgesEl = document.getElementById('diet-hero-badges');
        if (badgesEl && dieta.duration) {
            badgesEl.innerHTML = `
                <span class="diet-badge"><i class="bi bi-clock"></i> ${dieta.duration}</span>
                ${dieta.schedule ? `<span class="diet-badge"><i class="bi bi-list-check"></i> ${dieta.schedule.length} comidas</span>` : ''}
            `;
        }

        // SEO
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', dieta.introduction ? dieta.introduction.replace(/<[^>]*>/g, '').substring(0, 160) : dieta.title);

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute('href', 'https://vitalia-selfcare.vercel.app/dietas/' + dieta.slug);
    }

    /* ================================================
       RENDER INTRO
       ================================================ */
    function renderIntro(dieta) {
        const el = document.getElementById('diet-introduction');
        if (el && dieta.introduction) el.innerHTML = dieta.introduction;
    }

    /* ================================================
       RENDER SCHEDULE (Days + Meals)
       ================================================ */
    function renderSchedule(dieta) {
        const pillsContainer  = document.getElementById('day-pills');
        const panelsContainer = document.getElementById('day-panels');
        if (!pillsContainer || !panelsContainer || !dieta.schedule) return;

        pillsContainer.innerHTML  = '';
        panelsContainer.innerHTML = '';

        dieta.schedule.forEach((stage, idx) => {
            // --- Pill ---
            const pill = document.createElement('button');
            pill.className  = 'day-pill' + (idx === 0 ? ' active' : '');
            pill.textContent = stage.name;
            pill.setAttribute('data-day', idx);
            pill.setAttribute('role', 'tab');
            pill.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
            pill.setAttribute('aria-controls', `day-panel-${idx}`);
            pillsContainer.appendChild(pill);

            // --- Panel ---
            const panel = document.createElement('div');
            panel.className = 'day-panel' + (idx === 0 ? ' active' : '');
            panel.id = `day-panel-${idx}`;
            panel.setAttribute('role', 'tabpanel');

            stage.options.forEach(slot => {
                // Meal label
                const labelEl = document.createElement('p');
                labelEl.className = 'meal-label';
                labelEl.textContent = slot.label;
                panel.appendChild(labelEl);

                // Cards
                if (slot.cards) {
                    slot.cards.forEach(card => {
                        const cardEl = document.createElement('div');
                        cardEl.className = 'meal-card' + (card.recipeId ? ' has-recipe' : '');
                        if (card.recipeId) {
                            cardEl.dataset.recipeId = card.recipeId;
                            cardEl.setAttribute('role', 'button');
                            cardEl.setAttribute('tabindex', '0');
                            cardEl.title = 'Ver receta';
                        }

                        const iconHtml = card.icon
                            ? `<img src="${getPath(card.icon)}" alt="">`
                            : `<i class="${getMealIcon(slot.label)}"></i>`;

                        cardEl.innerHTML = `
                            <div class="meal-card__icon">${iconHtml}</div>
                            <div class="meal-card__title">${card.title}</div>
                            <div class="meal-card__footer">
                                <span class="meal-card__time">
                                    <i class="bi bi-clock"></i> ${card.time}
                                </span>
                                ${card.recipeId ? `
                                    <span class="meal-card__recipe-btn">
                                        Ver receta <i class="bi bi-arrow-right-short"></i>
                                    </span>
                                ` : ''}
                            </div>
                        `;

                        if (card.recipeId) {
                            cardEl.addEventListener('click', () => openRecipeModal(card.recipeId, dieta));
                            cardEl.addEventListener('keydown', e => {
                                if (e.key === 'Enter' || e.key === ' ') openRecipeModal(card.recipeId, dieta);
                            });
                        }

                        panel.appendChild(cardEl);
                    });
                }
            });

            panelsContainer.appendChild(panel);
        });

        // Day-pill switching logic
        pillsContainer.addEventListener('click', e => {
            const clickedPill = e.target.closest('.day-pill');
            if (!clickedPill) return;
            const dayIdx = clickedPill.dataset.day;

            document.querySelectorAll('.day-pill').forEach(p => {
                p.classList.remove('active');
                p.setAttribute('aria-selected', 'false');
            });
            document.querySelectorAll('.day-panel').forEach(p => p.classList.remove('active'));

            clickedPill.classList.add('active');
            clickedPill.setAttribute('aria-selected', 'true');
            const targetPanel = document.getElementById(`day-panel-${dayIdx}`);
            if (targetPanel) targetPanel.classList.add('active');
        });
    }

    /* ================================================
       RENDER RECIPES GRID
       ================================================ */
    function renderRecipesGrid(dieta) {
        const grid = document.getElementById('recipes-grid');
        if (!grid || !dieta.recipes) return;

        grid.innerHTML = '';
        dieta.recipes.forEach(recipe => {
            const card = document.createElement('article');
            card.className = 'recipe-card';

            card.innerHTML = `
                <div class="recipe-card__img-wrap">
                    <img class="recipe-card__img" src="${getPath(recipe.image)}" alt="${recipe.title}" loading="lazy">
                    <span class="recipe-card__overlay-tag">Receta</span>
                </div>
                <div class="recipe-card__body">
                    <h3 class="recipe-card__title">${recipe.title}</h3>
                    <div class="recipe-card__meta">
                        <i class="bi bi-clock"></i> ${recipe.time}
                    </div>
                    <button class="recipe-card__open-btn" data-recipe-id="${recipe.id}" aria-label="Ver receta ${recipe.title}">
                        <i class="bi bi-book-open"></i> Ver receta
                    </button>
                </div>
            `;

            card.querySelector('.recipe-card__open-btn').addEventListener('click', () => {
                openRecipeModal(recipe.id, dieta);
            });

            grid.appendChild(card);
        });
    }

    /* ================================================
       RENDER VARIATIONS
       ================================================ */
    function renderVariations(dieta) {
        const list = document.getElementById('variations-list');
        if (!list || !dieta.variations) return;

        list.innerHTML = '';
        dieta.variations.forEach(v => {
            const card = document.createElement('div');
            card.className = 'variation-card';
            card.innerHTML = `
                <div class="variation-card__icon">
                    <i class="${getVariationIcon(v.type)}"></i>
                </div>
                <div class="variation-card__type">${v.type}</div>
                <p class="variation-card__desc">${v.description}</p>
            `;
            list.appendChild(card);
        });
    }

    /* ================================================
       RENDER SHOPPING LIST
       ================================================ */
    function renderShoppingList(dieta) {
        const list = document.getElementById('shopping-list');
        if (!list || !dieta.shoppingList) return;

        list.innerHTML = '';
        Object.entries(dieta.shoppingList).forEach(([category, items]) => {
            const item = document.createElement('label');
            item.className = 'shopping-category';
            item.innerHTML = `
                <input type="checkbox" class="shopping-category__check" aria-label="Marcar ${category} como comprado">
                <span class="shopping-category__label">
                    <strong>${category}</strong>
                    ${items}
                </span>
            `;
            list.appendChild(item);
        });
    }

    /* ================================================
       RECIPE MODAL
       ================================================ */
    function openRecipeModal(recipeId, dieta) {
        if (!dieta.recipes) return;
        const recipe = dieta.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const imgEl   = document.getElementById('modal-img');
        const titleEl = document.getElementById('modal-title');
        const timeEl  = document.getElementById('modal-time');
        const ingEl   = document.getElementById('modal-ingredients');
        const instrEl = document.getElementById('modal-instructions');

        if (imgEl) {
            imgEl.src = getPath(recipe.image);
            imgEl.alt = recipe.title;
        }
        if (titleEl) titleEl.textContent = recipe.title;
        if (timeEl)  timeEl.textContent  = recipe.time;
        if (ingEl)   ingEl.innerHTML     = recipe.ingredients.map(i => `<li>${i}</li>`).join('');
        if (instrEl) instrEl.innerHTML   = recipe.instructions;

        const backdrop = document.getElementById('recipe-modal-backdrop');
        if (backdrop) {
            backdrop.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeRecipeModal() {
        const backdrop = document.getElementById('recipe-modal-backdrop');
        if (backdrop) {
            backdrop.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    function attachModalListeners() {
        const closeBtn  = document.getElementById('modal-close-btn');
        const backdrop  = document.getElementById('recipe-modal-backdrop');
        const modal     = document.getElementById('recipe-modal');

        if (closeBtn) closeBtn.addEventListener('click', closeRecipeModal);

        // Close on backdrop click (outside modal)
        if (backdrop) {
            backdrop.addEventListener('click', e => {
                if (!modal.contains(e.target)) closeRecipeModal();
            });
        }

        // Close on Escape
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeRecipeModal();
        });
    }

    /* ================================================
       TAB NAVIGATION
       ================================================ */
    function attachTabListeners() {
        const tabs = document.querySelectorAll('.diet-tab');
        const panels = document.querySelectorAll('.diet-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanelId = tab.dataset.panel;

                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                panels.forEach(p => p.classList.remove('active'));

                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                const targetPanel = document.getElementById(targetPanelId);
                if (targetPanel) targetPanel.classList.add('active');
            });
        });
    }

    /* ================================================
       SEO SCHEMA
       ================================================ */
    function injectSchema(dieta) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": dieta.title,
            "description": dieta.introduction ? dieta.introduction.replace(/<[^>]*>/g, '').substring(0, 160) : dieta.title,
            "image": dieta.image ? (dieta.image.startsWith('http') ? dieta.image : 'https://vitalia-selfcare.vercel.app' + (dieta.image.startsWith('/') ? '' : '/') + dieta.image) : '',
            "url": 'https://vitalia-selfcare.vercel.app/dietas/' + dieta.slug,
            "publisher": {
                "@type": "Organization",
                "name": "Vitalia",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://vitalia-selfcare.vercel.app/assets/images/ui/vitalia-logo.svg"
                }
            }
        };
        const scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        scriptTag.textContent = JSON.stringify(schema);
        document.head.appendChild(scriptTag);
    }

    /* ================================================
       MAIN INIT
       ================================================ */
    async function init() {
        const slug = getSlugFromPath();
        if (!slug) {
            window.location.replace('/404.html');
            return;
        }

        const data = await fetchDietas();
        if (!data || !data.dietas) {
            window.location.replace('/404.html');
            return;
        }

        const dieta = findDietaBySlug(data.dietas, slug);
        if (!dieta) {
            window.location.replace('/404.html');
            return;
        }

        // Render all sections
        renderHero(dieta);
        renderIntro(dieta);
        renderSchedule(dieta);
        renderRecipesGrid(dieta);
        renderVariations(dieta);
        renderShoppingList(dieta);

        // Attach interactions
        attachModalListeners();
        attachTabListeners();
        injectSchema(dieta);

        // Mark as loaded (hides loader)
        document.body.classList.add('loaded');
        document.dispatchEvent(new Event('article-content-loaded'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
