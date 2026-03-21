/**
 * Dieta Loader — Redesigned Dynamic Content System
 * Loads diet content from JSON and populates the new tabbed UI
 */

(function () {
    'use strict';

    const ICON_MAP = {
        'desayuno': 'bi bi-sun',
        'almuerzo': 'bi bi-cloud-sun',
        'cena': 'bi bi-moon-stars',
        'snack': 'bi bi-lightning-charge',
        'merienda': 'bi bi-cup-hot',
        'default': 'bi bi-egg-fried'
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
        if (t.includes('gluten')) return 'bi bi-shield-check';
        if (t.includes('vegetar')) return 'bi bi-leaf';
        if (t.includes('vegano')) return 'bi bi-tree';
        if (t.includes('lácte') || t.includes('lacte')) return 'bi bi-droplet-half';
        return 'bi bi-stars';
    }

    async function fetchDietasAndRecetas() {
        try {
            const [dietasRes, recetasRes] = await Promise.all([
                fetch('/assets/data/dietas.json'),
                fetch('/assets/data/recetas.json')
            ]);
            if (!dietasRes.ok || !recetasRes.ok) throw new Error('No se pudo cargar los datos');
            const dietasData = await dietasRes.json();
            const recetasData = await recetasRes.json();
            return { dietas: dietasData.dietas, recetas: recetasData.meals || [] };
        } catch (err) {
            console.error('Error cargando datos:', err);
            return null;
        }
    }

    function findDietaBySlug(dietas, slug) {
        return dietas.find(d => d.slug === slug);
    }

    function normalizeDiet(dieta, recetas) {
        if (!dieta.recipes) dieta.recipes = [];

        if (dieta.schedule) {
            dieta.schedule.forEach(day => {
                if (day.meals && !day.options) {
                    day.options = day.meals.map(meal => {
                        return {
                            label: meal.type,
                            cards: (meal.recipeIds || []).map(recId => {
                                const rec = recetas.find(r => r.id === recId) || {};
                                
                                if (!dieta.recipes.find(r => r.id === recId)) {
                                    dieta.recipes.push({
                                        id: recId,
                                        title: rec.name || 'Receta Desconocida',
                                        time: rec.prep_time ? `Listo en ${rec.prep_time} minutos` : '',
                                        image: rec.url || '',
                                        ingredients: rec.ingredients || [],
                                        instructions: Array.isArray(rec.recipe) 
                                            ? rec.recipe.map(p => `<p>${p}</p>`).join('') 
                                            : `<p>${rec.recipe || ''}</p>`
                                    });
                                }
                                
                                let defaultIcon = rec.url || "assets/images/ui/icono-comida.webp";
                                if (!rec.url && (meal.type.toLowerCase().includes('desayuno') || meal.type.toLowerCase().includes('snack'))) {
                                    defaultIcon = "assets/images/ui/icono-rayo.webp";
                                }

                                return {
                                    title: rec.name || 'Receta Desconocida',
                                    time: rec.prep_time ? `Listo en ${rec.prep_time} minutos` : '',
                                    icon: defaultIcon,
                                    recipeId: recId
                                };
                            })
                        };
                    });
                }
            });
        }
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
       CALENDAR SCHEDULING WIDGET
       ================================================ */
    const MONTH_NAMES_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const DAY_NAMES_ES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    function getPlanMode(dieta) {
        const dur = (dieta.duration || '').toLowerCase();
        if (dur.includes('semana')) return 'week';
        return 'single';
    }

    function loadSavedSchedule(slug) {
        try {
            const raw = localStorage.getItem(`vitalia_plan_schedule_${slug}`);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    function saveSchedule(slug, data) {
        try {
            localStorage.setItem(`vitalia_plan_schedule_${slug}`, JSON.stringify(data));
            // Hook for future notification logic
            document.dispatchEvent(new CustomEvent('diet-schedule-saved', { detail: data }));
        } catch (e) { console.warn('No se pudo guardar en localStorage', e); }
    }

    function clearSchedule(slug) {
        localStorage.removeItem(`vitalia_plan_schedule_${slug}`);
        document.dispatchEvent(new CustomEvent('diet-schedule-saved', { detail: null }));
    }

    // Get Monday of the week that contains `date`
    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay(); // 0=Sun ... 6=Sat
        const diff = (day === 0) ? -6 : 1 - day; // adjust to Monday
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();
    }

    function toISODate(d) {
        return d.toISOString().split('T')[0];
    }

    function formatDateLabel(isoDate, mode) {
        const d = new Date(isoDate + 'T00:00:00');
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        if (mode === 'week') {
            const end = new Date(d);
            end.setDate(end.getDate() + 6);
            return `${dayNames[d.getDay()]} ${d.getDate()} ${MONTH_NAMES_ES[d.getMonth()]} → ${dayNames[end.getDay()]} ${end.getDate()} ${MONTH_NAMES_ES[end.getMonth()]}`;
        }
        return `${dayNames[d.getDay()]} ${d.getDate()} de ${MONTH_NAMES_ES[d.getMonth()]} ${d.getFullYear()}`;
    }

    function renderCalendar(dieta) {
        const wrap = document.getElementById('diet-calendar-wrap');
        if (!wrap) return;

        const mode = getPlanMode(dieta);
        const slug = dieta.slug;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        let viewYear = today.getFullYear();
        let viewMonth = today.getMonth();
        let saved = loadSavedSchedule(slug);

        // Selected state
        let selectedDate = null; // ISO string for single; weekStart ISO for week

        if (saved) {
            selectedDate = saved.date || saved.startDate || null;
        }

        function buildGrid() {
            const firstDay = new Date(viewYear, viewMonth, 1);
            const lastDay = new Date(viewYear, viewMonth + 1, 0);

            // Start grid on Monday
            let startPad = firstDay.getDay() - 1; // 0=Sun becomes -1 → 6
            if (startPad < 0) startPad = 6;

            const cells = [];

            // Prev-month padding cells
            for (let i = startPad; i > 0; i--) {
                const d = new Date(firstDay);
                d.setDate(d.getDate() - i);
                cells.push({ date: d, otherMonth: true });
            }
            // Current month days
            for (let d = 1; d <= lastDay.getDate(); d++) {
                cells.push({ date: new Date(viewYear, viewMonth, d), otherMonth: false });
            }
            // Next-month padding to complete last row
            const remainder = cells.length % 7;
            if (remainder > 0) {
                for (let i = 1; i <= 7 - remainder; i++) {
                    const d = new Date(lastDay);
                    d.setDate(d.getDate() + i);
                    cells.push({ date: d, otherMonth: true });
                }
            }

            return cells;
        }

        function getWeekClsFor(date, selIso) {
            if (!selIso) return null;
            const weekStart = new Date(selIso + 'T00:00:00');
            const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
            const d = new Date(date); d.setHours(0, 0, 0, 0);
            if (d < weekStart || d > weekEnd) return null;
            if (isSameDay(d, weekStart)) return 'week-start';
            if (isSameDay(d, weekEnd)) return 'week-end';
            return 'week-mid';
        }

        function render() {
            const cells = buildGrid();

            const confirmedHtml = selectedDate ? `
                <div class="diet-cal__confirmed">
                    <i class="bi bi-check-circle-fill"></i>
                    Programado: ${formatDateLabel(selectedDate, mode)}
                    <span class="diet-cal__confirmed-clear" id="cal-clear">Cancelar</span>
                </div>
            ` : '';

            wrap.innerHTML = `
                <div class="diet-cal">
                    <div class="diet-cal__top">
                        <div class="diet-cal__label">
                            <i class="bi bi-calendar3"></i>
                            ${mode === 'week' ? 'Programar semana' : 'Programar día'}
                        </div>
                        <div class="diet-cal__month-nav">
                            <button class="diet-cal__nav-btn" id="cal-prev" aria-label="Mes anterior">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <span class="diet-cal__month-name">${MONTH_NAMES_ES[viewMonth]} ${viewYear}</span>
                            <button class="diet-cal__nav-btn" id="cal-next" aria-label="Mes siguiente">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <div class="diet-cal__weekdays">
                        ${DAY_NAMES_ES.map(d => `<div class="diet-cal__wd">${d}</div>`).join('')}
                    </div>

                    <div class="diet-cal__grid">
                        ${cells.map(cell => {
                const isOther = cell.otherMonth;
                const isToday = isSameDay(cell.date, today);
                const isoStr = toISODate(cell.date);
                let cls = 'diet-cal__day';

                if (isOther) {
                    cls += ' diet-cal__day--other-month';
                } else if (mode === 'single') {
                    if (selectedDate && isoStr === selectedDate)
                        cls += ' diet-cal__day--selected';
                    else if (isToday)
                        cls += ' diet-cal__day--today';
                } else {
                    const weekCls = getWeekClsFor(cell.date, selectedDate);
                    if (weekCls)
                        cls += ` diet-cal__day--${weekCls}`;
                    else if (isToday)
                        cls += ' diet-cal__day--today';
                }

                return `<div class="${cls}" data-iso="${isoStr}" data-other="${isOther}">${cell.date.getDate()}</div>`;
            }).join('')}
                    </div>

                    ${confirmedHtml}
                </div>
            `;

            // Grid click
            wrap.querySelector('.diet-cal__grid').addEventListener('click', e => {
                const cell = e.target.closest('.diet-cal__day');
                if (!cell || cell.dataset.other === 'true') return;

                const iso = cell.dataset.iso;

                if (mode === 'single') {
                    selectedDate = iso;
                    saveSchedule(slug, { slug, type: 'single', date: iso });
                } else {
                    const clicked = new Date(iso + 'T00:00:00');
                    const ws = getWeekStart(clicked);
                    selectedDate = toISODate(ws);
                    saveSchedule(slug, { slug, type: 'week', startDate: selectedDate });
                }
                render();
            });

            // Month navigation
            wrap.querySelector('#cal-prev').addEventListener('click', () => {
                viewMonth--;
                if (viewMonth < 0) { viewMonth = 11; viewYear--; }
                render();
            });
            wrap.querySelector('#cal-next').addEventListener('click', () => {
                viewMonth++;
                if (viewMonth > 11) { viewMonth = 0; viewYear++; }
                render();
            });

            // Clear button
            const clearBtn = wrap.querySelector('#cal-clear');
            if (clearBtn) {
                clearBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    selectedDate = null;
                    clearSchedule(slug);
                    render();
                });
            }
        }

        render();
    }

    /* ================================================
       HELPERS — Timeline
       ================================================ */
    const DAYS_ES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo', 'miercoles', 'sabado'];

    function isMultiDay(schedule) {
        if (!schedule || schedule.length === 0) return false;
        return DAYS_ES.includes(schedule[0].name.toLowerCase());
    }

    function getChipClass(label) {
        const l = label.toLowerCase();
        if (l.includes('desayuno')) return 'desayuno';
        if (l.includes('almuerzo') || l.includes('comida')) return 'almuerzo';
        if (l.includes('cena')) return 'cena';
        if (l.includes('snack') || l.includes('merienda')) return 'snack';
        return 'default';
    }

    function buildMealItem(card, sectionLabel, dieta) {
        const hasRecipe = !!card.recipeId;
        const isRealPhoto = card.icon && (card.icon.includes('http') || !card.icon.includes('icono-'));
        const imgClass = isRealPhoto ? 'class="meal-item__photo"' : '';
        const iconHtml = card.icon
            ? `<img src="${getPath(card.icon)}" alt="" ${imgClass}>`
            : `<i class="${getMealIcon(sectionLabel)}"></i>`;

        const el = document.createElement('div');
        el.className = 'meal-item' + (hasRecipe ? ' meal-item--recipe' : '');
        if (hasRecipe) {
            el.dataset.recipeId = card.recipeId;
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            el.title = 'Ver receta';
        }

        el.innerHTML = `
            <div class="meal-item__icon">${iconHtml}</div>
            <div class="meal-item__body">
                <div class="meal-item__title">${card.title}</div>
                <div class="meal-item__time">
                    <i class="bi bi-clock"></i> ${card.time}
                </div>
            </div>
            ${hasRecipe ? `<div class="meal-item__arrow"><i class="bi bi-arrow-right-short"></i></div>` : ''}
        `;

        if (hasRecipe) {
            el.addEventListener('click', () => openRecipeModal(card.recipeId, dieta));
            el.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') openRecipeModal(card.recipeId, dieta);
            });
        }
        return el;
    }

    function getMealTimeLabel(label) {
        const l = label.toLowerCase();
        if (l.includes('desayuno'))  return '7–10 AM';
        if (l.includes('almuerzo'))  return '12–2 PM';
        if (l.includes('snack') || l.includes('merienda')) return '3–5 PM';
        if (l.includes('cena'))      return '7–9 PM';
        return '';
    }

    function buildMealSection(sectionName, options, dieta) {
        const chipClass = getChipClass(sectionName);
        const icon      = getMealIcon(sectionName);
        const timeLabel = getMealTimeLabel(sectionName);

        const section = document.createElement('div');
        section.className = 'meal-section';
        section.dataset.meal = chipClass; // e.g. "breakfast", "lunch", "snack", "dinner"

        // Header: chip + optional time label + line
        section.innerHTML = `
            <div class="meal-section__header">
                <div class="meal-section__chip meal-section__chip--${chipClass}">
                    <i class="${icon}"></i>
                    <span>${sectionName}</span>
                </div>
                ${timeLabel ? `<span class="meal-section__time">${timeLabel}</span>` : ''}
                <div class="meal-section__line"></div>
            </div>
        `;

        const cardsWrapper = document.createElement('div');
        cardsWrapper.className = 'meal-section__cards';

        options.forEach((opt, i) => {
            // "ó" separator between alternatives
            if (i > 0) {
                const sep = document.createElement('div');
                sep.className = 'meal-option-sep';
                sep.innerHTML = '<span>también puedes elegir:</span>';
                cardsWrapper.appendChild(sep);
            }
            // Cards for this option
            if (opt.cards) {
                opt.cards.forEach(card => {
                    cardsWrapper.appendChild(buildMealItem(card, sectionName, dieta));
                });
            }
        });

        section.appendChild(cardsWrapper);
        return section;
    }

    /* ================================================
       RENDER SCHEDULE (Days + Meals)
       ================================================ */
    function renderSchedule(dieta) {
        const pillsContainer = document.getElementById('day-pills');
        const panelsContainer = document.getElementById('day-panels');
        if (!pillsContainer || !panelsContainer || !dieta.schedule) return;

        pillsContainer.innerHTML = '';
        panelsContainer.innerHTML = '';

        const multiDay = isMultiDay(dieta.schedule);

        dieta.schedule.forEach((stage, idx) => {
            // --- Day pill (always shown, label differs for single vs multi) ---
            const pill = document.createElement('button');
            pill.className = 'day-pill' + (idx === 0 ? ' active' : '');
            pill.textContent = stage.name;
            pill.dataset.day = idx;
            pill.setAttribute('role', 'tab');
            pill.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
            pill.setAttribute('aria-controls', `day-panel-${idx}`);
            pillsContainer.appendChild(pill);

            // --- Panel ---
            const panel = document.createElement('div');
            panel.className = 'day-panel' + (idx === 0 ? ' active' : '');
            panel.id = `day-panel-${idx}`;
            panel.setAttribute('role', 'tabpanel');

            if (multiDay) {
                // Multi-day: each option IS a meal time (Desayuno, Almuerzo, etc.)
                // Options are individual meal times, cards within each are the actual meals
                stage.options.forEach(opt => {
                    panel.appendChild(
                        buildMealSection(opt.label, [{ cards: opt.cards }], dieta)
                    );
                });
            } else {
                // Single-day: stage.name IS the meal time, options are alternatives
                panel.appendChild(
                    buildMealSection(stage.name, stage.options, dieta)
                );
            }

            panelsContainer.appendChild(panel);
        });

        // Hide day pills wrapper if only 1 day (single-day diets)
        if (dieta.schedule.length <= 1) {
            pillsContainer.style.display = 'none';
        }

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
                <div class="recipe-card__thumb">
                    <img class="recipe-card__img" src="${getPath(recipe.image)}" alt="${recipe.title}" loading="lazy">
                </div>
                <div class="recipe-card__body">
                    <h3 class="recipe-card__title">${recipe.title}</h3>
                    <div class="recipe-card__meta">
                        <i class="bi bi-clock"></i> ${recipe.time}
                    </div>
                </div>
                <div class="recipe-card__arrow">
                    <i class="bi bi-arrow-right-short"></i>
                </div>
            `;

            card.addEventListener('click', () => openRecipeModal(recipe.id, dieta));

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

        const imgEl = document.getElementById('modal-img');
        const titleEl = document.getElementById('modal-title');
        const timeEl = document.getElementById('modal-time');
        const ingEl = document.getElementById('modal-ingredients');
        const instrEl = document.getElementById('modal-instructions');

        if (imgEl) {
            imgEl.src = getPath(recipe.image);
            imgEl.alt = recipe.title;
        }
        if (titleEl) titleEl.textContent = recipe.title;
        if (timeEl) timeEl.textContent = recipe.time;
        if (ingEl) ingEl.innerHTML = recipe.ingredients.map(i => `<li>${i}</li>`).join('');
        if (instrEl) instrEl.innerHTML = recipe.instructions;

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
        const closeBtn = document.getElementById('modal-close-btn');
        const backdrop = document.getElementById('recipe-modal-backdrop');
        const modal = document.getElementById('recipe-modal');

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

        const data = await fetchDietasAndRecetas();
        if (!data || !data.dietas) {
            window.location.replace('/404.html');
            return;
        }

        const dieta = findDietaBySlug(data.dietas, slug);
        if (dieta) normalizeDiet(dieta, data.recetas);
        if (!dieta) {
            window.location.replace('/404.html');
            return;
        }

        // Render all sections
        renderHero(dieta);
        renderIntro(dieta);
        renderCalendar(dieta);
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
