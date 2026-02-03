const { useRef, useEffect, useCallback, useState } = React;
// gsap is available globally

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

// Adapted content for Vitalia with Footer Colors
const cardData = [
    {
        color: '#FFFFFF',
        title: 'Planes personalizados',
        description: 'Algoritmo inteligente que se adapta a tu estilo de vida',
        label: 'Bienestar a tu medida',
        glowColor: '128, 202, 205' // --cyan
    },
    {
        color: '#FFFFFF',
        title: 'Cuerpo y Mente',
        description: 'Meditaciones guiadas y rutinas de ejercicio adaptadas',
        label: 'Equilibrio',
        glowColor: '157, 96, 207' // --purple
    },
    {
        color: '#FFFFFF',
        title: 'Viti: Chatbot IA',
        description: 'Tu asistente personal, adaptado a tu ritmo de vida.',
        label: 'Soporte Inteligente',
        glowColor: '225, 148, 127' // --soft-orange
    },
    {
        color: '#FFFFFF',
        title: '+100 Recursos',
        description: 'Cientos de rutinas, artículos, meditaciones y planes alimenticios para tu bienestar',
        label: 'Biblioteca',
        glowColor: '225, 148, 127' // --soft-orange
    },
    {
        color: '#FFFFFF',
        title: 'Contenido de calidad',
        description: 'Contenido creado y revisado por expertos en salud y bienestar',
        label: 'Información verificada',
        glowColor: '174, 125, 215' // --purple-light
    },
    {
        color: '#FFFFFF',
        title: 'Blog educativo',
        description: 'Artículos y guías sobre todos los aspectos del bienestar',
        label: 'Contenido',
        glowColor: '128, 202, 205' // --cyan
    }
];

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
    return el;
};

const calculateSpotlightValues = radius => ({
    proximity: radius * 0.5,
    fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
    const rect = card.getBoundingClientRect();
    const relativeX = ((mouseX - rect.left) / rect.width) * 100;
    const relativeY = ((mouseY - rect.top) / rect.height) * 100;

    card.style.setProperty('--glow-x', `${relativeX}%`);
    card.style.setProperty('--glow-y', `${relativeY}%`);
    card.style.setProperty('--glow-intensity', glow.toString());
    card.style.setProperty('--glow-radius', `${radius}px`);
};

// ... (ParticleCard, GlobalSpotlight, BentoCardGrid - generic components kept same but logic cleaned)

const ParticleCard = ({
    children,
    className = '',
    disableAnimations = false,
    style,
    particleCount = DEFAULT_PARTICLE_COUNT,
    glowColor = DEFAULT_GLOW_COLOR,
    enableTilt = true,
    clickEffect = false,
    enableMagnetism = false,
    tiltMaxAngle = 10,
    tiltDuration = 0.1,
    ...rest
}) => {
    const cardRef = useRef(null);
    const particlesRef = useRef([]);
    const timeoutsRef = useRef([]);
    const isHoveredRef = useRef(false);
    const memoizedParticles = useRef([]);
    const particlesInitialized = useRef(false);
    const magnetismAnimationRef = useRef(null);

    const initializeParticles = useCallback(() => {
        if (particlesInitialized.current || !cardRef.current) return;

        const { width, height } = cardRef.current.getBoundingClientRect();
        memoizedParticles.current = Array.from({ length: particleCount }, () =>
            createParticleElement(Math.random() * width, Math.random() * height, glowColor)
        );
        particlesInitialized.current = true;
    }, [particleCount, glowColor]);

    const clearAllParticles = useCallback(() => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        magnetismAnimationRef.current?.kill();

        particlesRef.current.forEach(particle => {
            gsap.to(particle, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                ease: 'back.in(1.7)',
                onComplete: () => {
                    particle.parentNode?.removeChild(particle);
                }
            });
        });
        particlesRef.current = [];
    }, []);

    const animateParticles = useCallback(() => {
        if (!cardRef.current || !isHoveredRef.current) return;

        if (!particlesInitialized.current) {
            initializeParticles();
        }

        memoizedParticles.current.forEach((particle, index) => {
            const timeoutId = setTimeout(() => {
                if (!isHoveredRef.current || !cardRef.current) return;

                const clone = particle.cloneNode(true);
                cardRef.current.appendChild(clone);
                particlesRef.current.push(clone);

                gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

                gsap.to(clone, {
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100,
                    rotation: Math.random() * 360,
                    duration: 2 + Math.random() * 2,
                    ease: 'none',
                    repeat: -1,
                    yoyo: true
                });

                gsap.to(clone, {
                    opacity: 0.3,
                    duration: 1.5,
                    ease: 'power2.inOut',
                    repeat: -1,
                    yoyo: true
                });
            }, index * 100);

            timeoutsRef.current.push(timeoutId);
        });
    }, [initializeParticles]);

    useEffect(() => {
        if (disableAnimations || !cardRef.current) return;

        const element = cardRef.current;

        const handleMouseEnter = () => {
            isHoveredRef.current = true;
            animateParticles();

            if (enableTilt) {
                gsap.to(element, {
                    rotateX: tiltMaxAngle / 2,
                    rotateY: tiltMaxAngle / 2,
                    duration: 0.3,
                    ease: 'power2.out',
                    transformPerspective: 1000
                });
            }
        };

        const handleMouseLeave = () => {
            isHoveredRef.current = false;
            clearAllParticles();

            if (enableTilt) {
                gsap.to(element, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: tiltDuration,
                    ease: 'power2.out',
                    onComplete: () => {
                        gsap.set(element, { clearProps: "rotateX,rotateY,transformPerspective,transform" });
                    }
                });
            }

            if (enableMagnetism) {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };

        const handleMouseMove = e => {
            if (!enableTilt && !enableMagnetism) return;

            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            if (enableTilt) {
                const rotateX = ((y - centerY) / centerY) * -tiltMaxAngle;
                const rotateY = ((x - centerX) / centerX) * tiltMaxAngle;

                gsap.to(element, {
                    rotateX,
                    rotateY,
                    duration: tiltDuration,
                    ease: 'power2.out',
                    transformPerspective: 1000
                });
            }

            if (enableMagnetism) {
                const magnetX = (x - centerX) * 0.05;
                const magnetY = (y - centerY) * 0.05;

                magnetismAnimationRef.current = gsap.to(element, {
                    x: magnetX,
                    y: magnetY,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };

        const handleClick = e => {
            if (!clickEffect) return;

            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const maxDistance = Math.max(
                Math.hypot(x, y),
                Math.hypot(x - rect.width, y),
                Math.hypot(x, y - rect.height),
                Math.hypot(x - rect.width, y - rect.height)
            );

            const ripple = document.createElement('div');
            ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

            element.appendChild(ripple);

            gsap.fromTo(
                ripple,
                {
                    scale: 0,
                    opacity: 1
                },
                {
                    scale: 1,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    onComplete: () => ripple.remove()
                }
            );
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('click', handleClick);

        return () => {
            isHoveredRef.current = false;
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('click', handleClick);
            clearAllParticles();
        };
    }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor, tiltMaxAngle, tiltDuration]);

    return (
        <div
            ref={cardRef}
            className={`${className} particle-container`}
            style={{ ...style, position: 'relative', overflow: 'hidden' }}
            {...rest}
        >
            {children}
        </div>
    );
};

const GlobalSpotlight = ({
    gridRef,
    disableAnimations = false,
    enabled = true,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    glowColor = DEFAULT_GLOW_COLOR
}) => {
    const spotlightRef = useRef(null);
    const isInsideSection = useRef(false);

    useEffect(() => {
        if (disableAnimations || !gridRef?.current || !enabled) return;

        const spotlight = document.createElement('div');
        spotlight.className = 'global-spotlight';
        spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
        document.body.appendChild(spotlight);
        spotlightRef.current = spotlight;

        const handleMouseMove = e => {
            if (!spotlightRef.current || !gridRef.current) return;

            const section = gridRef.current.closest('.bento-section');
            const rect = section?.getBoundingClientRect();
            const mouseInside =
                rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

            isInsideSection.current = mouseInside || false;
            const cards = gridRef.current.querySelectorAll('.magic-bento-card');

            if (!mouseInside) {
                gsap.to(spotlightRef.current, {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                cards.forEach(card => {
                    card.style.setProperty('--glow-intensity', '0');
                });
                return;
            }

            const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
            let minDistance = Infinity;

            cards.forEach(card => {
                const cardElement = card;
                const cardRect = cardElement.getBoundingClientRect();
                const centerX = cardRect.left + cardRect.width / 2;
                const centerY = cardRect.top + cardRect.height / 2;
                const distance =
                    Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
                const effectiveDistance = Math.max(0, distance);

                minDistance = Math.min(minDistance, effectiveDistance);

                let glowIntensity = 0;
                if (effectiveDistance <= proximity) {
                    glowIntensity = 1;
                } else if (effectiveDistance <= fadeDistance) {
                    glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
                }

                updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
            });

            gsap.to(spotlightRef.current, {
                left: e.clientX,
                top: e.clientY,
                duration: 0.1,
                ease: 'power2.out'
            });

            const targetOpacity =
                minDistance <= proximity
                    ? 0.8
                    : minDistance <= fadeDistance
                        ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
                        : 0;

            gsap.to(spotlightRef.current, {
                opacity: targetOpacity,
                duration: targetOpacity > 0 ? 0.2 : 0.5,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            isInsideSection.current = false;
            gridRef.current?.querySelectorAll('.magic-bento-card').forEach(card => {
                card.style.setProperty('--glow-intensity', '0');
            });
            if (spotlightRef.current) {
                gsap.to(spotlightRef.current, {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
        };
    }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

    return null;
};

const BentoCardGrid = ({ children, gridRef }) => (
    <div className="card-grid bento-section" ref={gridRef}>
        {children}
    </div>
);

const useMobileDetection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

const MagicBento = ({
    cards = cardData,
    textAutoHide = true,
    enableStars = true,
    enableSpotlight = true,
    enableBorderGlow = true,
    disableAnimations = false,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    particleCount = DEFAULT_PARTICLE_COUNT,
    enableTilt = false,
    glowColor = DEFAULT_GLOW_COLOR,
    clickEffect = true,
    enableMagnetism = true
}) => {
    const gridRef = useRef(null);
    const isMobile = useMobileDetection();
    const shouldDisableAnimations = disableAnimations || isMobile;

    return (
        <React.Fragment>
            {enableSpotlight && (
                <GlobalSpotlight
                    gridRef={gridRef}
                    disableAnimations={shouldDisableAnimations}
                    enabled={enableSpotlight}
                    spotlightRadius={spotlightRadius}
                    glowColor={glowColor}
                />
            )}

            <BentoCardGrid gridRef={gridRef}>
                {cards.map((card, index) => {
                    const effectiveGlowColor = card.glowColor || glowColor;
                    const baseClassName = `magic-bento-card ${textAutoHide ? 'magic-bento-card--text-autohide' : ''} ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''}`;
                    const cardProps = {
                        className: baseClassName,
                        style: {
                            backgroundColor: card.color,
                            '--glow-color': effectiveGlowColor,
                            // Since bg is white, set text color to dark
                            color: '#333',
                            cursor: card.onClick ? 'pointer' : 'default',
                            // Add custom styles from card data
                            ...card.style
                        },
                        onClick: card.onClick
                    };

                    if (card.customRender) {
                        if (enableStars) {
                            return (
                                <ParticleCard
                                    key={index}
                                    {...cardProps}
                                    disableAnimations={shouldDisableAnimations}
                                    particleCount={particleCount}
                                    glowColor={effectiveGlowColor}
                                    enableTilt={enableTilt}
                                    clickEffect={card.clickEffect !== undefined ? card.clickEffect : clickEffect}
                                    enableMagnetism={enableMagnetism}
                                    className={`${baseClassName} ${card.className || ''}`}
                                >
                                    {card.customRender()}
                                </ParticleCard>
                            );
                        }
                        return (
                            <div key={index} {...cardProps} className={`${baseClassName} ${card.className || ''}`}>
                                {card.customRender()}
                            </div>
                        );
                    }

                    if (enableStars) {
                        return (
                            <ParticleCard
                                key={index}
                                {...cardProps}
                                disableAnimations={shouldDisableAnimations}
                                particleCount={particleCount}
                                glowColor={effectiveGlowColor}
                                enableTilt={enableTilt}
                                clickEffect={clickEffect}
                                enableMagnetism={enableMagnetism}
                            >
                                <div className="magic-bento-card__header">
                                    <div className="magic-bento-card__label" style={{ color: '#777' }}>{card.label}</div>
                                    {/* Add icon or small colored dot corresponding to glow? */}
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `rgb(${effectiveGlowColor})` }}></div>
                                </div>
                                <div className="magic-bento-card__content">
                                    <h2 className="magic-bento-card__title" style={{ color: '#333', fontWeight: 'bold' }}>{card.title}</h2>
                                    <p className="magic-bento-card__description" style={{ color: '#666' }}>{card.description}</p>
                                </div>
                            </ParticleCard>
                        );
                    }

                    // Fallback if stars disabled (kept for completeness)
                    return (
                        <div key={index} {...cardProps}>...</div>
                    )
                })}
            </BentoCardGrid>
        </React.Fragment>
    );
};


// --- App / Usage with Title ---
const AppBento = ({ showTitle = true }) => {
    // Use window.vitaliaBentoData if available, otherwise default to cardData
    const dataToUse = window.vitaliaBentoData || cardData;
    const isMobile = useMobileDetection();

    return (
        <div className="container py-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {showTitle && (
                <div className="reading-section text-center p-0 mb-5" style={{ textAlign: 'center' }}>
                    <p className="reading-subtext">
                        ¿Qué ofrece Vitalia?
                    </p>

                    {/* Animated Gradient Title */}
                    <div style={{ display: 'inline-block' }}>
                        <GradientText
                            colors={['#E1947F', '#9d60cf', '#80CACD']}
                            animationSpeed={6}
                        >
                            <h2 className="reading-heading" style={{ margin: 0, fontWeight: 500 }}>
                                Nuestras funcionalidades
                            </h2>
                        </GradientText>
                    </div>
                </div>
            )}

            <MagicBento
                cards={dataToUse}
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={false}
                enableMagnetism={false}
                clickEffect={true}
                spotlightRadius={530}
                particleCount={12}
                glowColor="132, 0, 255"
                disableAnimations={false}
            />
        </div>
    );
};

// Expose MagicBento for custom usage if needed
window.MagicBento = MagicBento;

// Mount the app
const rootElement = document.getElementById('magic-bento-root');
if (rootElement) {
    const showTitle = rootElement.getAttribute('data-hide-title') !== 'true';
    const root = ReactDOM.createRoot(rootElement);
    root.render(<AppBento showTitle={showTitle} />);
}

// Expose components for FAQ usage
window.ParticleCard = ParticleCard;
window.createParticleElement = createParticleElement;
window.DEFAULT_GLOW_COLOR = DEFAULT_GLOW_COLOR;
window.DEFAULT_PARTICLE_COUNT = DEFAULT_PARTICLE_COUNT;
