

// ── Seeded PRNG (mulberry32) ─────────────────────────────
function createRng(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    }
    // Ensure positive
    h = Math.abs(h) || 1;

    return function () {
        h |= 0;
        h = h + 0x6D2B79F5 | 0;
        let t = Math.imul(h ^ (h >>> 15), 1 | h);
        t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ── Vitalia palette groups ───────────────────────────────
// Each group contains harmonious HSL variations
const PALETTE_GROUPS = [
    // Purple family
    [
        { h: 279, s: 62, l: 67 },  // #B571DE  (main purple)
        { h: 279, s: 55, l: 58 },  // deeper purple
        { h: 290, s: 50, l: 72 },  // soft lavender
        { h: 265, s: 60, l: 62 },  // blue-violet
        { h: 300, s: 40, l: 75 },  // pink-lavender
    ],
    // Turquoise family
    [
        { h: 182, s: 40, l: 65 },  // #80CACD  (main cyan)
        { h: 174, s: 60, l: 55 },  // #2bc4bc  (teal)
        { h: 170, s: 50, l: 70 },  // soft mint
        { h: 190, s: 45, l: 60 },  // ocean blue
        { h: 160, s: 55, l: 65 },  // seafoam
    ],
    // Orange / warm family
    [
        { h: 14, s: 64, l: 69 },   // #E1947F  (soft-orange)
        { h: 30, s: 88, l: 67 },   // #f4a261  (orange-soft)
        { h: 20, s: 70, l: 72 },   // peach
        { h: 40, s: 80, l: 65 },   // warm gold
        { h: 10, s: 55, l: 75 },   // blush
    ],
    // Mixed: purple + turquoise
    [
        { h: 279, s: 55, l: 67 },
        { h: 182, s: 45, l: 65 },
        { h: 240, s: 40, l: 72 },
        { h: 200, s: 50, l: 60 },
        { h: 260, s: 45, l: 70 },
    ],
    // Mixed: turquoise + orange
    [
        { h: 174, s: 55, l: 58 },
        { h: 30, s: 75, l: 68 },
        { h: 50, s: 60, l: 65 },
        { h: 160, s: 45, l: 62 },
        { h: 15, s: 65, l: 72 },
    ],
    // Mixed: purple + orange (sunset)
    [
        { h: 290, s: 50, l: 68 },
        { h: 20, s: 70, l: 70 },
        { h: 340, s: 55, l: 72 },
        { h: 310, s: 45, l: 65 },
        { h: 0, s: 60, l: 75 },
    ],
];

// ── Helpers ──────────────────────────────────────────────
function hsl(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function jitter(rng, base, range) {
    return base + (rng() - 0.5) * range * 2;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// ── Main render function ─────────────────────────────────
/**
 * @param {string}  seed   — User UID, email, or display name
 * @param {number}  size   — Avatar diameter in px (default 40)
 * @returns {string}       — Inline SVG markup string
 */
export function renderGradientAvatar(seed, size = 40) {
    const rng = createRng(seed || 'vitalia-default');

    // Pick a palette group deterministically
    const groupIdx = Math.floor(rng() * PALETTE_GROUPS.length);
    const group = PALETTE_GROUPS[groupIdx];

    // Pick 3 colors from the group with slight jitter
    const pickColor = (idx) => {
        const base = group[idx % group.length];
        return {
            h: Math.round(jitter(rng, base.h, 12)),
            s: Math.round(Math.min(100, Math.max(30, jitter(rng, base.s, 10)))),
            l: Math.round(Math.min(82, Math.max(45, jitter(rng, base.l, 8)))),
        };
    };

    const c1 = pickColor(0);
    const c2 = pickColor(1);
    const c3 = pickColor(2);

    // Gradient parameters (randomized positions)
    const g1cx = Math.round(jitter(rng, 35, 20));
    const g1cy = Math.round(jitter(rng, 35, 20));
    const g1r = Math.round(jitter(rng, 70, 15));

    const g2cx = Math.round(jitter(rng, 65, 20));
    const g2cy = Math.round(jitter(rng, 65, 20));
    const g2r = Math.round(jitter(rng, 60, 15));

    // Unique ID for gradients (avoids SVG ID collisions in DOM)
    const uid = `va${Math.floor(rng() * 1e8)}`;

    // ── Face parameters ──────────────────────────────────
    // Center face in the circle with slight offset for character
    const faceCx = 50 + jitter(rng, 0, 3);
    const faceCy = 50 + jitter(rng, 2, 3);

    // Eye spacing & size (scaled up for presence)
    const eyeSpacing = lerp(13, 18, rng());
    const eyeY = faceCy - lerp(4, 8, rng());
    const eyeWidth = lerp(8, 11, rng());
    const eyeArc = lerp(3.5, 5.5, rng());

    // Closed-eye style variant
    const eyeStyle = rng(); // 0-0.33: arcs, 0.33-0.66: small lines, 0.66-1: dots with line

    // Smile parameters (wider, more expressive)
    const smileY = faceCy + lerp(4, 8, rng());
    const smileWidth = lerp(10, 16, rng());
    const smileArc = lerp(4, 7, rng());

    // Blush (optional — 60% chance)
    const showBlush = rng() > 0.4;
    const blushOpacity = lerp(0.18, 0.32, rng());
    const blushR = lerp(5, 7, rng());
    const blushY = lerp(smileY - 3, smileY + 1, rng());

    // Face color (dark, semi-transparent to work on any gradient)
    const faceAlpha = lerp(0.45, 0.65, rng());

    // Build face elements
    let eyesMarkup = '';
    if (eyeStyle < 0.4) {
        // Arc closed eyes (⌒ ⌒) — most common, cutest
        const lx = faceCx - eyeSpacing;
        const rx = faceCx + eyeSpacing;
        eyesMarkup = `
            <path d="M${lx - eyeWidth / 2} ${eyeY} Q${lx} ${eyeY - eyeArc} ${lx + eyeWidth / 2} ${eyeY}"
                  fill="none" stroke="rgba(60,40,80,${faceAlpha})" stroke-width="2.4" stroke-linecap="round"/>
            <path d="M${rx - eyeWidth / 2} ${eyeY} Q${rx} ${eyeY - eyeArc} ${rx + eyeWidth / 2} ${eyeY}"
                  fill="none" stroke="rgba(60,40,80,${faceAlpha})" stroke-width="2.4" stroke-linecap="round"/>`;
    } else if (eyeStyle < 0.7) {
        // Gentle dash eyes (– –)
        const lx = faceCx - eyeSpacing;
        const rx = faceCx + eyeSpacing;
        eyesMarkup = `
            <line x1="${lx - eyeWidth / 2}" y1="${eyeY}" x2="${lx + eyeWidth / 2}" y2="${eyeY}"
                  stroke="rgba(60,40,80,${faceAlpha})" stroke-width="2.4" stroke-linecap="round"/>
            <line x1="${rx - eyeWidth / 2}" y1="${eyeY}" x2="${rx + eyeWidth / 2}" y2="${eyeY}"
                  stroke="rgba(60,40,80,${faceAlpha})" stroke-width="2.4" stroke-linecap="round"/>`;
    } else {
        // Inverted arc eyes (happy squint ∪ ∪)
        const lx = faceCx - eyeSpacing;
        const rx = faceCx + eyeSpacing;
        eyesMarkup = `
            <path d="M${lx - eyeWidth / 2} ${eyeY} Q${lx} ${eyeY + eyeArc} ${lx + eyeWidth / 2} ${eyeY}"
                  fill="none" stroke="rgba(60,40,80,${faceAlpha})" stroke-width="2.4" stroke-linecap="round"/>
            <path d="M${rx - eyeWidth / 2} ${eyeY} Q${rx} ${eyeY + eyeArc} ${rx + eyeWidth / 2} ${eyeY}"
                  fill="none" stroke="rgba(60,40,80,${faceAlpha})" stroke-width="2.4" stroke-linecap="round"/>`;
    }

    const smileMarkup = `
        <path d="M${faceCx - smileWidth / 2} ${smileY} Q${faceCx} ${smileY + smileArc} ${faceCx + smileWidth / 2} ${smileY}"
              fill="none" stroke="rgba(60,40,80,${faceAlpha})" stroke-width="2.2" stroke-linecap="round"/>`;

    const blushMarkup = showBlush ? `
        <circle cx="${faceCx - eyeSpacing - 1}" cy="${blushY}" r="${blushR}"
                fill="rgba(255,160,160,${blushOpacity})" />
        <circle cx="${faceCx + eyeSpacing + 1}" cy="${blushY}" r="${blushR}"
                fill="rgba(255,160,160,${blushOpacity})" />` : '';

    // ── Build SVG ────────────────────────────────────────
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
        width="${size}" height="${size}" role="img" aria-label="Avatar de usuario"
        style="display:block;border-radius:50%;">
    <defs>
        <radialGradient id="${uid}a" cx="${g1cx}%" cy="${g1cy}%" r="${g1r}%">
            <stop offset="0%" stop-color="${hsl(c1.h, c1.s, c1.l)}"/>
            <stop offset="100%" stop-color="${hsl(c2.h, c2.s, c2.l)}"/>
        </radialGradient>
        <radialGradient id="${uid}b" cx="${g2cx}%" cy="${g2cy}%" r="${g2r}%">
            <stop offset="0%" stop-color="${hsl(c3.h, c3.s, c3.l)}" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="${hsl(c2.h, c2.s, Math.min(85, c2.l + 12))}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="${uid}c" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.35)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
    </defs>
    <!-- Background sphere -->
    <circle cx="50" cy="50" r="50" fill="url(#${uid}a)"/>
    <circle cx="50" cy="50" r="50" fill="url(#${uid}b)"/>
    <!-- Glossy highlight -->
    <circle cx="50" cy="50" r="50" fill="url(#${uid}c)"/>
    <!-- Face -->
    <g class="vitalia-avatar-face">${eyesMarkup}${smileMarkup}${blushMarkup}
    </g>
</svg>`;
}

/**
 * Injects a gradient avatar SVG into a DOM element.
 * Replaces any existing text/children.
 *
 * @param {HTMLElement} el    — Target element
 * @param {string}      seed  — User identifier for deterministic generation
 * @param {number}     [size] — Explicit size override (defaults to element's width or 40)
 */
export function injectGradientAvatar(el, seed, size) {
    if (!el) return;
    const s = size || el.offsetWidth || parseInt(getComputedStyle(el).width) || 40;
    el.innerHTML = renderGradientAvatar(seed, s);
    el.setAttribute('aria-label', 'Avatar de usuario');
}
