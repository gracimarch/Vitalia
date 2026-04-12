/**
 * Vitalia Debug Inspector — DEV ONLY
 * Loads ALL raw data from JSON sources, renders inspectable cards,
 * highlights missing/null fields, detects duplicate IDs, and
 * provides a search/filter for quick data scanning.
 *
 * This module does NOT reuse any recommendation logic from "Mi espacio".
 */
(function () {
    'use strict';

    /* ── JSON Endpoints ── */
    const DATA_URLS = {
        articles: '/assets/data/lecturas.json',
        routines: '/assets/data/rutina.json',
        diets:    '/assets/data/dietas.json',
    };

    /* ── Expected fields per resource type ── */
    const EXPECTED_FIELDS = {
        articles: ['slug', 'title', 'category', 'readingTime', 'description', 'keywords', 'image', 'introduction', 'tableOfContents', 'sections'],
        routines: ['slug', 'title', 'level', 'duration', 'introduction', 'image', 'preparation', 'warmup_text', 'conclusion', 'exercises'],
        diets:    ['slug', 'title', 'type', 'duration', 'image', 'introduction', 'schedule', 'recipes', 'variations', 'shoppingList'],
    };

    /* ── State ── */
    let allCards = [];
    let totalIssues = 0;

    /* ── Helpers ── */
    function $(sel, root = document) { return root.querySelector(sel); }

    function fetchJSON(url) {
        return fetch(url).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
            return r.json();
        });
    }

    function escapeHTML(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function fieldStatus(value) {
        if (value === null || value === undefined) return 'error';
        if (value === '' || (Array.isArray(value) && value.length === 0)) return 'warn';
        return 'ok';
    }

    function fieldLabel(value) {
        if (value === null || value === undefined) return 'null';
        if (value === '') return 'empty string';
        if (Array.isArray(value)) return `Array[${value.length}]`;
        if (typeof value === 'object') return 'Object';
        const s = String(value);
        return s.length > 30 ? s.slice(0, 27) + '…' : s;
    }

    /* ── Link builders ── */
    function buildLink(type, slug) {
        switch (type) {
            case 'articles': return `/lecturas/${slug}`;
            case 'routines': return `/rutinas/${slug}`;
            case 'diets':    return `/dietas/${slug}`;
            default: return '#';
        }
    }

    /* ── Detect duplicate slugs ── */
    function findDuplicates(items) {
        const seen = {};
        const dupes = new Set();
        items.forEach(item => {
            const s = item.slug;
            if (s in seen) dupes.add(s);
            seen[s] = true;
        });
        return dupes;
    }

    /* ── Render a single card ── */
    function renderCard(item, type, expectedFields, isDuplicate) {
        const card = document.createElement('div');
        card.className = 'debug-card';
        card.dataset.type = type;
        card.dataset.searchable = [item.slug, item.title, item.category, item.type, item.level, item.duration]
            .filter(Boolean).join(' ').toLowerCase();

        let hasIssues = isDuplicate;

        // Build field rows
        let fieldsHTML = '';
        expectedFields.forEach(key => {
            const val = item[key];
            const status = fieldStatus(val);
            if (status !== 'ok') hasIssues = true;

            const dotClass = `debug-field__dot--${status}`;
            const valClass = status === 'error' ? 'debug-field__value--missing'
                           : status === 'warn'  ? 'debug-field__value--empty'
                           : '';

            fieldsHTML += `
                <div class="debug-field">
                    <span class="debug-field__dot ${dotClass}"></span>
                    <span class="debug-field__name">${key}</span>
                    <span class="debug-field__value ${valClass}">${escapeHTML(fieldLabel(val))}</span>
                </div>`;
        });

        if (hasIssues) {
            card.classList.add('debug-card--has-issues');
            totalIssues++;
        }

        // Meta tags
        const metaParts = [];
        if (item.category)    metaParts.push(item.category);
        if (item.type)        metaParts.push(item.type);
        if (item.level)       metaParts.push(item.level);
        if (item.duration)    metaParts.push(item.duration);
        if (item.readingTime) metaParts.push(item.readingTime);

        const metaHTML = metaParts.map(m => `<span class="debug-card__tag">${escapeHTML(m)}</span>`).join('');

        const slug = item.slug || '(no slug)';
        const title = item.title || '(no title)';
        const href = item.slug ? buildLink(type, item.slug) : '#';

        const dupeTag = isDuplicate
            ? `<span class="debug-card__tag" style="background:var(--dbg-error-dim);color:var(--dbg-error);border-color:rgba(248,81,73,.25)">⚠ DUPLICATE SLUG</span>`
            : '';

        card.innerHTML = `
            <a href="${href}" class="debug-card__link" target="_blank" rel="noopener">
                <span class="debug-card__slug">${escapeHTML(slug)}</span>
                <h3 class="debug-card__title">${escapeHTML(title)}</h3>
                <div class="debug-card__meta">${metaHTML}${dupeTag}</div>
            </a>
            <div class="debug-card__fields">${fieldsHTML}</div>`;

        return card;
    }

    /* ── Render a section ── */
    function renderSection(containerId, items, type, iconClass, label) {
        const container = $(containerId);
        if (!container) return;

        const expectedFields = EXPECTED_FIELDS[type];
        const dupes = findDuplicates(items);

        const headerEl = container.querySelector('.debug-section__count');
        if (headerEl) headerEl.textContent = `${items.length} items`;

        const grid = container.querySelector('.debug-grid');
        if (!grid) return;

        items.forEach(item => {
            const isDup = dupes.has(item.slug);
            const card = renderCard(item, type, expectedFields, isDup);
            grid.appendChild(card);
            allCards.push(card);
        });
    }

    /* ── Search / Filter ── */
    function setupSearch() {
        const input = $('#debug-search-input');
        if (!input) return;

        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            let visible = 0;

            allCards.forEach(card => {
                const text = card.dataset.searchable || '';
                const match = !q || text.includes(q);
                card.classList.toggle('debug-card--hidden', !match);
                if (match) visible++;
            });

            // Update counts per section
            document.querySelectorAll('.debug-section').forEach(sec => {
                const grid = sec.querySelector('.debug-grid');
                if (!grid) return;
                const showing = grid.querySelectorAll('.debug-card:not(.debug-card--hidden)').length;
                const total   = grid.querySelectorAll('.debug-card').length;
                const counter = sec.querySelector('.debug-section__count');
                if (counter) counter.textContent = q ? `${showing}/${total} items` : `${total} items`;
            });
        });
    }

    /* ── Init ── */
    async function init() {
        try {
            const [articlesData, routinesData, dietsData] = await Promise.all([
                fetchJSON(DATA_URLS.articles),
                fetchJSON(DATA_URLS.routines),
                fetchJSON(DATA_URLS.diets),
            ]);

            const articles = articlesData.lecturas || [];
            const routines = routinesData.rutinas  || [];
            const diets    = dietsData.dietas      || [];

            // Stat counters
            const statArticles = $('#stat-articles');
            const statRoutines = $('#stat-routines');
            const statDiets    = $('#stat-diets');
            if (statArticles) statArticles.textContent = articles.length;
            if (statRoutines) statRoutines.textContent = routines.length;
            if (statDiets)    statDiets.textContent    = diets.length;

            // Render all
            renderSection('#section-articles', articles, 'articles');
            renderSection('#section-routines', routines, 'routines');
            renderSection('#section-diets',    diets,    'diets');

            // Issues stat
            const statIssues = $('#stat-issues');
            if (statIssues) statIssues.textContent = totalIssues;

            setupSearch();

        } catch (err) {
            console.error('[Debug] Failed to load data:', err);
            const main = $('main');
            if (main) {
                main.innerHTML = `
                    <div class="debug-empty" style="padding:80px 20px">
                        <h2 style="color:var(--dbg-error)">Error loading data</h2>
                        <p>${escapeHTML(err.message)}</p>
                    </div>`;
            }
        }
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
