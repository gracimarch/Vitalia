/**
 * Dieta Loader - Dynamic Content System
 * Loads diet content from JSON based on filename
 */

(function () {
    'use strict';

    function getSlugFromPath() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('slug')) {
            return urlParams.get('slug');
        }
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename.replace('.html', '');
    }

    async function fetchDietas() {
        try {
            const response = await fetch('data/dietas.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de datos');
            }
            return await response.json();
        } catch (error) {
            console.error('Error cargando dietas:', error);
            return null;
        }
    }

    function findDietaBySlug(dietas, slug) {
        return dietas.find(d => d.slug === slug);
    }

    function renderDiet(dieta) {
        // Title Section
        document.title = dieta.title;
        const titleContainer = document.querySelector('.title');
        if (titleContainer) {
            titleContainer.innerHTML = `
                <h3>${dieta.type}</h3>
                <h1>${dieta.title}</h1>
                <div class="reading-time">
                    <i class="bi bi-clock" alt="Ícono de reloj"></i>
                    <p>Duración: ${dieta.duration}</p>
                </div>
            `;
        }

        // Introduction
        const introContainer = document.getElementById('introduction');
        if (introContainer) {
            introContainer.innerHTML = dieta.introduction;
        }

        // Image
        const imageContainer = document.querySelector('.image');
        if (imageContainer) {
            imageContainer.innerHTML = `
                <img src="${dieta.image}" alt="Imagen representativa para ${dieta.title}">
            `;
        }

        // Schedule (Food Plan)
        const scheduleContainer = document.querySelector('.schedule-container');
        if (scheduleContainer) {
            scheduleContainer.innerHTML = ''; // Clear existing
            dieta.schedule.forEach(stage => {
                const wrapper = document.createElement('div');
                wrapper.className = 'schedule-stage__wrapper';

                let optionsHtml = '';
                stage.options.forEach(slot => {
                    let cardsHtml = '';
                    if (slot.cards) {
                        slot.cards.forEach(card => {
                            const buttonHtml = card.recipeId
                                ? `<button class="open-recipe" data-target="${card.recipeId}">`
                                : `<button>`;

                            cardsHtml += `
                                ${buttonHtml}
                                    <div class="guide-slot_card">
                                        <h4 class="mealtitle">${card.title}</h4>
                                        <figure class="author-wrapper">
                                            <picture>
                                                <img src="${card.icon}" alt="" />
                                            </picture>
                                            <figcaption>${card.time}</figcaption>
                                        </figure>
                                    </div>
                                </button>
                            `;
                        });
                    }

                    optionsHtml += `
                        <div class="guide-slot">
                            <p class="mealtime">${slot.label}</p>
                            ${cardsHtml}
                        </div>
                    `;
                });

                wrapper.innerHTML = `
                    <hr class="divider" />
                    <section class="schedule-stage">
                        <div class="schedule-stage__title">
                            <h3 class="weekday">${stage.name}</h3>
                        </div>
                        <div class="schedule-stage_guide-container">
                            ${optionsHtml}
                        </div>
                    </section>
                `;
                scheduleContainer.appendChild(wrapper);
            });
            // Add final divider
            const finalDivider = document.createElement('div');
            finalDivider.className = 'schedule-stage__wrapper';
            finalDivider.innerHTML = '<hr class="divider" />';
            scheduleContainer.appendChild(finalDivider);
        }

        // Recipes (Modals)
        const recipesContainer = document.querySelector('.recipes');
        if (recipesContainer && dieta.recipes) {
            recipesContainer.innerHTML = '';
            dieta.recipes.forEach(recipe => {
                const ingredientsList = recipe.ingredients.map(ing => `<li><strong>${ing}</strong></li>`).join('');
                const recipeHtml = `
                    <div class="recipecontainer" id="${recipe.id}">
                        <a class="close" href="#">X</a>
                        <div class="recipemargin">
                            <h6 class="rtitle">${recipe.title}</h6>
                            <figure class="timealign">
                                <picture>
                                    <img src="assets/images/ui/meal-icon.webp" alt="" />
                                </picture>
                                <figcaption>${recipe.time}</figcaption>
                            </figure>
                            <img class="rimg" src="${recipe.image}" alt="Imagen de la receta">
                            <ul>${ingredientsList}</ul>
                            ${recipe.instructions}
                        </div>
                    </div>
                `;
                recipesContainer.insertAdjacentHTML('beforeend', recipeHtml);
            });
        }

        // Variations
        const variationsContainer = document.querySelector('.pagina-2 .article ul');
        if (variationsContainer && dieta.variations) {
            variationsContainer.innerHTML = dieta.variations.map(v =>
                `<li><strong class="underline">${v.type}:</strong> ${v.description}</li>`
            ).join('');
        }

        // Shopping List
        const shoppingListContainer = document.querySelector('.pagina-2 .article:last-of-type');
        if (shoppingListContainer && dieta.shoppingList) {
            shoppingListContainer.innerHTML = '';
            Object.entries(dieta.shoppingList).forEach(([category, items]) => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <input type="checkbox">
                    <label><strong>${category}:</strong> ${items}</label>
                `;
                shoppingListContainer.appendChild(div);
            });
        }

        // Re-attach event listeners for recipes
        attachRecipeListeners();
    }

    function attachRecipeListeners() {
        // Open buttons
        document.querySelectorAll('.open-recipe').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                const darkscreen = document.querySelector('.darkscreen');
                if (darkscreen) {
                    darkscreen.style.display = 'flex';
                    darkscreen.style.position = 'fixed';
                }

                const modal = document.getElementById(targetId);
                if (modal) {
                    modal.style.display = 'flex';
                    modal.style.position = 'fixed';
                }
            });
        });

        // Close buttons
        const closeRecipe = (e) => {
            e.preventDefault();
            const recetaContenedor = e.target.closest('.recipecontainer');
            if (recetaContenedor) {
                recetaContenedor.style.display = 'none';
            }
            const darkscreen = document.querySelector('.darkscreen');
            if (darkscreen) {
                darkscreen.style.display = 'none';
            }
        };

        document.querySelectorAll('.recipecontainer .close').forEach(btn => {
            btn.addEventListener('click', closeRecipe);
        });
    }

    // Main initialization
    async function init() {
        const slug = getSlugFromPath();
        const data = await fetchDietas();

        if (!data || !data.dietas) return;

        const dieta = findDietaBySlug(data.dietas, slug);
        if (!dieta) {
            console.error('Dieta no encontrada');
            return;
        }

        renderDiet(dieta);

        // Dispatch event for animations
        document.dispatchEvent(new Event('article-content-loaded'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
