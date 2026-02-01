const {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    useEffect,
    useMemo,
    useRef,
    useState
} = React;

const Card = forwardRef(({ customClass, ...rest }, ref) => (
    <div ref={ref} {...rest} className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
Card.displayName = 'Card';

const makeSlot = (i, distX, distY, total) => ({
    x: i * distX,
    y: -i * distY,
    z: -i * distX * 1.5,
    zIndex: total - i
});

const placeNow = (el, slot, skew) =>
    gsap.set(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skew,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true
    });

const CardSwap = ({
    width = 500,
    height = 400,
    cardDistance = 60,
    verticalDistance = 70,
    delay = 5000,
    pauseOnHover = false,
    onCardClick,
    skewAmount = 6,
    easing = 'elastic',
    children
}) => {
    const config =
        easing === 'elastic'
            ? {
                ease: 'elastic.out(0.6,0.9)',
                durDrop: 2,
                durMove: 2,
                durReturn: 2,
                promoteOverlap: 0.9,
                returnDelay: 0.05
            }
            : {
                ease: 'power1.inOut',
                durDrop: 0.8,
                durMove: 0.8,
                durReturn: 0.8,
                promoteOverlap: 0.45,
                returnDelay: 0.2
            };

    const childArr = useMemo(() => Children.toArray(children), [children]);

    // Create refs using React.createRef() in useMemo to ensure stability
    const refs = useMemo(
        () => childArr.map(() => React.createRef()),
        [childArr.length]
    );

    const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));

    const tlRef = useRef(null);
    const intervalRef = useRef();
    const container = useRef(null);

    useEffect(() => {
        // Initial placement
        const total = refs.length;
        refs.forEach((r, i) => {
            if (r.current) {
                placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
            }
        });

        const swap = () => {
            if (order.current.length < 2) return;

            const [front, ...rest] = order.current;
            const elFront = refs[front].current;

            if (!elFront) return;

            const tl = gsap.timeline();
            tlRef.current = tl;

            tl.to(elFront, {
                y: '+=500',
                duration: config.durDrop,
                ease: config.ease
            });

            tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);

            rest.forEach((idx, i) => {
                const el = refs[idx].current;
                if (!el) return;

                const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
                tl.set(el, { zIndex: slot.zIndex }, 'promote');
                tl.to(
                    el,
                    {
                        x: slot.x,
                        y: slot.y,
                        z: slot.z,
                        duration: config.durMove,
                        ease: config.ease
                    },
                    `promote+=${i * 0.15}`
                );
            });

            const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
            tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);

            tl.call(
                () => {
                    gsap.set(elFront, { zIndex: backSlot.zIndex });
                },
                undefined,
                'return'
            );

            tl.to(
                elFront,
                {
                    x: backSlot.x,
                    y: backSlot.y,
                    z: backSlot.z,
                    duration: config.durReturn,
                    ease: config.ease
                },
                'return'
            );

            tl.call(() => {
                order.current = [...rest, front];
            });
        };

        // Start swap loop
        // Initial delay before first swap
        const timeoutId = setTimeout(() => {
            swap();
            intervalRef.current = window.setInterval(swap, delay);
        }, 1000); // Small initial delay

        if (pauseOnHover && container.current) {
            const node = container.current;
            const pause = () => {
                tlRef.current?.pause();
                clearInterval(intervalRef.current);
            };
            const resume = () => {
                tlRef.current?.play();
                intervalRef.current = window.setInterval(swap, delay);
            };
            node.addEventListener('mouseenter', pause);
            node.addEventListener('mouseleave', resume);
            return () => {
                node.removeEventListener('mouseenter', pause);
                node.removeEventListener('mouseleave', resume);
                clearInterval(intervalRef.current);
                clearTimeout(timeoutId);
            };
        }

        return () => {
            clearInterval(intervalRef.current);
            clearTimeout(timeoutId);
        };
    }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, config, refs]);

    const rendered = childArr.map((child, i) =>
        isValidElement(child)
            ? cloneElement(child, {
                key: i,
                ref: refs[i],
                style: { width, height, ...(child.props.style ?? {}) },
                onClick: e => {
                    child.props.onClick?.(e);
                    onCardClick?.(i);
                }
            })
            : child
    );

    return (
        <div ref={container} className="card-swap-container" style={{ width: width, height: height }}>
            {rendered}
        </div>
    );
};

// --- App / Usage ---

const App = () => {
    return (
        <React.Fragment>
            <div className="container py-5" style={{ overflow: 'visible' }}>
                <div className="row align-items-center" style={{ minHeight: '600px' }}>
                    {/* Left Column: Text */}
                    <div className="col-lg-5 mb-5 mb-lg-0">
                        {/* Use standard reading-section class structure */}
                        <div className="reading-section text-start p-0" style={{ textAlign: 'left' }}>
                            <p className="reading-subtext">
                                Acerca de nuestra iniciativa
                            </p>

                            {/* Animated Gradient Title */}
                            <div style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
                                <GradientText
                                    colors={['#E1947F', '#9d60cf', '#80CACD']}
                                    animationSpeed={6}
                                >
                                    {/* Removed inline font-size/weight to let reading-heading control it, 
                                        but kept basic resets if needed or just use class only */}
                                    <h2 className="reading-heading" style={{ margin: 0 }}>
                                        Por qué elegir <span className="dif-txt" style={{ fontSize: 'inherit' }}>vitalia</span>
                                    </h2>
                                </GradientText>
                            </div>

                            <p className="mt-4 text-muted" style={{ fontSize: '1.1rem' }}>
                                Descubre una nueva forma de cuidar tu bienestar con tecnología adaptada a ti.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Cards */}
                    <div className="col-lg-7 position-relative" style={{ height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CardSwap
                            cardDistance={70}
                            verticalDistance={50}
                            delay={4000}
                            pauseOnHover={true}
                            width={320}
                            height={420}
                            skewAmount={0}
                        >
                            <Card style={{ background: '#fefbf3', color: '#333', display: 'flex', flexDirection: 'column', padding: '30px', justifyContent: 'center', alignItems: 'center', filter: 'drop-shadow(0px 15px 30px rgba(0,0,0,0.1))', border: '1px solid #eee' }}>
                                <div style={{ background: 'rgba(157, 96, 207, 0.1)', borderRadius: '50%', padding: '15px', marginBottom: '20px' }}>
                                    <i className="bi bi-person-heart" style={{ fontSize: '30px', color: '#9d60cf' }}></i>
                                </div>
                                <h3 style={{ color: '#9d60cf', marginBottom: '15px', fontWeight: '600' }}>Personalización Real</h3>
                                <p style={{ textAlign: 'center', color: '#666' }}>
                                    Planes que evolucionan contigo. Nuestro algoritmo aprende de tus progresos para ajustar tus rutinas.
                                </p>
                            </Card>

                            <Card style={{ background: '#fff', color: '#333', display: 'flex', flexDirection: 'column', padding: '30px', justifyContent: 'center', alignItems: 'center', filter: 'drop-shadow(0px 15px 30px rgba(0,0,0,0.1))', border: '1px solid #eee' }}>
                                <div style={{ background: 'rgba(128, 202, 205, 0.1)', borderRadius: '50%', padding: '15px', marginBottom: '20px' }}>
                                    <i className="bi bi-people" style={{ fontSize: '30px', color: '#80CACD' }}></i>
                                </div>
                                <h3 style={{ color: '#80CACD', marginBottom: '15px', fontWeight: '600' }}>Comunidad Activa</h3>
                                <p style={{ textAlign: 'center', color: '#666' }}>
                                    No estás solo. Únete a miles de personas compartiendo logros, consejos y motivación diaria.
                                </p>
                            </Card>

                            <Card style={{ background: '#E1947F', color: '#fff', display: 'flex', flexDirection: 'column', padding: '30px', justifyContent: 'center', alignItems: 'center', filter: 'drop-shadow(0px 15px 30px rgba(0,0,0,0.1))', border: 'none' }}>
                                <div style={{ background: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%', padding: '15px', marginBottom: '20px' }}>
                                    <i className="bi bi-graph-up-arrow" style={{ fontSize: '30px', color: '#fff' }}></i>
                                </div>
                                <h3 style={{ color: '#fff', marginBottom: '15px', fontWeight: '600' }}>Progreso Visual</h3>
                                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)' }}>
                                    Visualiza tu transformación con gráficas intuitivas y celebra cada pequeña victoria.
                                </p>
                            </Card>
                        </CardSwap>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

// Mount the app
const rootElement = document.getElementById('card-swap-root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}
