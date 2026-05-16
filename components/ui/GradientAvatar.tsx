import React, { useMemo } from 'react';

// Seeded PRNG (mulberry32)
function createRng(seed: string) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    }
    h = Math.abs(h) || 1;

    return function () {
        h |= 0;
        h = h + 0x6D2B79F5 | 0;
        let t = Math.imul(h ^ (h >>> 15), 1 | h);
        t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const PALETTE_GROUPS = [
    // Purple family
    [
        { h: 279, s: 62, l: 67 },
        { h: 279, s: 55, l: 58 },
        { h: 290, s: 50, l: 72 },
        { h: 265, s: 60, l: 62 },
        { h: 300, s: 40, l: 75 },
    ],
    // Turquoise family
    [
        { h: 182, s: 40, l: 65 },
        { h: 174, s: 60, l: 55 },
        { h: 170, s: 50, l: 70 },
        { h: 190, s: 45, l: 60 },
        { h: 160, s: 55, l: 65 },
    ],
    // Orange / warm family
    [
        { h: 14, s: 64, l: 69 },
        { h: 30, s: 88, l: 67 },
        { h: 20, s: 70, l: 72 },
        { h: 40, s: 80, l: 65 },
        { h: 10, s: 55, l: 75 },
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

function hsl(h: number, s: number, l: number) {
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function jitter(rng: () => number, base: number, range: number) {
    return base + (rng() - 0.5) * range * 2;
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

interface GradientAvatarProps {
    uid: string;
    size?: number;
    className?: string;
}

export default function GradientAvatar({ uid, size = 40, className = '' }: GradientAvatarProps) {
    const data = useMemo(() => {
        const rng = createRng(uid || 'vitalia-default');
        const groupIdx = Math.floor(rng() * PALETTE_GROUPS.length);
        const group = PALETTE_GROUPS[groupIdx];

        const pickColor = (idx: number) => {
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

        const g1cx = Math.round(jitter(rng, 35, 20));
        const g1cy = Math.round(jitter(rng, 35, 20));
        const g1r = Math.round(jitter(rng, 70, 15));

        const g2cx = Math.round(jitter(rng, 65, 20));
        const g2cy = Math.round(jitter(rng, 65, 20));
        const g2r = Math.round(jitter(rng, 60, 15));

        const gradientId = `va${Math.floor(rng() * 1e8)}`;

        const faceCx = 50 + jitter(rng, 0, 3);
        const faceCy = 50 + jitter(rng, 2, 3);

        const eyeSpacing = lerp(13, 18, rng());
        const eyeY = faceCy - lerp(4, 8, rng());
        const eyeWidth = lerp(8, 11, rng());
        const eyeArc = lerp(3.5, 5.5, rng());

        const eyeStyle = rng();

        const smileY = faceCy + lerp(4, 8, rng());
        const smileWidth = lerp(10, 16, rng());
        const smileArc = lerp(4, 7, rng());

        const showBlush = rng() > 0.4;
        const blushOpacity = lerp(0.18, 0.32, rng());
        const blushR = lerp(5, 7, rng());
        const blushY = lerp(smileY - 3, smileY + 1, rng());

        const faceAlpha = lerp(0.45, 0.65, rng());

        let eyesMarkup = null;
        if (eyeStyle < 0.4) {
            const lx = faceCx - eyeSpacing;
            const rx = faceCx + eyeSpacing;
            eyesMarkup = (
                <>
                    <path d={`M${lx - eyeWidth / 2} ${eyeY} Q${lx} ${eyeY - eyeArc} ${lx + eyeWidth / 2} ${eyeY}`}
                          fill="none" stroke={`rgba(60,40,80,${faceAlpha})`} strokeWidth="2.4" strokeLinecap="round"/>
                    <path d={`M${rx - eyeWidth / 2} ${eyeY} Q${rx} ${eyeY - eyeArc} ${rx + eyeWidth / 2} ${eyeY}`}
                          fill="none" stroke={`rgba(60,40,80,${faceAlpha})`} strokeWidth="2.4" strokeLinecap="round"/>
                </>
            );
        } else if (eyeStyle < 0.7) {
            const lx = faceCx - eyeSpacing;
            const rx = faceCx + eyeSpacing;
            eyesMarkup = (
                <>
                    <line x1={lx - eyeWidth / 2} y1={eyeY} x2={lx + eyeWidth / 2} y2={eyeY}
                          stroke={`rgba(60,40,80,${faceAlpha})`} strokeWidth="2.4" strokeLinecap="round"/>
                    <line x1={rx - eyeWidth / 2} y1={eyeY} x2={rx + eyeWidth / 2} y2={eyeY}
                          stroke={`rgba(60,40,80,${faceAlpha})`} strokeWidth="2.4" strokeLinecap="round"/>
                </>
            );
        } else {
            const lx = faceCx - eyeSpacing;
            const rx = faceCx + eyeSpacing;
            eyesMarkup = (
                <>
                    <path d={`M${lx - eyeWidth / 2} ${eyeY} Q${lx} ${eyeY + eyeArc} ${lx + eyeWidth / 2} ${eyeY}`}
                          fill="none" stroke={`rgba(60,40,80,${faceAlpha})`} strokeWidth="2.4" strokeLinecap="round"/>
                    <path d={`M${rx - eyeWidth / 2} ${eyeY} Q${rx} ${eyeY + eyeArc} ${rx + eyeWidth / 2} ${eyeY}`}
                          fill="none" stroke={`rgba(60,40,80,${faceAlpha})`} strokeWidth="2.4" strokeLinecap="round"/>
                </>
            );
        }

        const smileMarkup = (
            <path d={`M${faceCx - smileWidth / 2} ${smileY} Q${faceCx} ${smileY + smileArc} ${faceCx + smileWidth / 2} ${smileY}`}
                  fill="none" stroke={`rgba(60,40,80,${faceAlpha})`} strokeWidth="2.2" strokeLinecap="round"/>
        );

        const blushMarkup = showBlush ? (
            <>
                <circle cx={faceCx - eyeSpacing - 1} cy={blushY} r={blushR}
                        fill={`rgba(255,160,160,${blushOpacity})`} />
                <circle cx={faceCx + eyeSpacing + 1} cy={blushY} r={blushR}
                        fill={`rgba(255,160,160,${blushOpacity})`} />
            </>
        ) : null;

        return {
            gradientId,
            c1, c2, c3,
            g1cx, g1cy, g1r,
            g2cx, g2cy, g2r,
            eyesMarkup, smileMarkup, blushMarkup
        };
    }, [uid]);

    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
             width={size} height={size} role="img" aria-label="Avatar de usuario"
             className={className}
             style={{ display: 'block', borderRadius: '50%', flexShrink: 0 }}>
            <defs>
                <radialGradient id={`${data.gradientId}a`} cx={`${data.g1cx}%`} cy={`${data.g1cy}%`} r={`${data.g1r}%`}>
                    <stop offset="0%" stopColor={hsl(data.c1.h, data.c1.s, data.c1.l)}/>
                    <stop offset="100%" stopColor={hsl(data.c2.h, data.c2.s, data.c2.l)}/>
                </radialGradient>
                <radialGradient id={`${data.gradientId}b`} cx={`${data.g2cx}%`} cy={`${data.g2cy}%`} r={`${data.g2r}%`}>
                    <stop offset="0%" stopColor={hsl(data.c3.h, data.c3.s, data.c3.l)} stopOpacity="0.85"/>
                    <stop offset="100%" stopColor={hsl(data.c2.h, data.c2.s, Math.min(85, data.c2.l + 12))} stopOpacity="0"/>
                </radialGradient>
                <radialGradient id={`${data.gradientId}c`} cx="50%" cy="30%" r="50%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.35)"/>
                    <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="50" fill={`url(#${data.gradientId}a)`}/>
            <circle cx="50" cy="50" r="50" fill={`url(#${data.gradientId}b)`}/>
            <circle cx="50" cy="50" r="50" fill={`url(#${data.gradientId}c)`}/>
            <g className="vitalia-avatar-face">
                {data.eyesMarkup}
                {data.smileMarkup}
                {data.blushMarkup}
            </g>
        </svg>
    );
}
