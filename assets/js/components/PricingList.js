const { useState, useEffect } = React;

const pricingData = [
    {
        title: "Esencial",
        price: "Gratis",
        description: "Perfecto para descubrir el bienestar.",
        features: [
            "Acceso a la comunidad",
            "Rutinas básicas de bienestar",
            "1 sesión introductoria",
            "Blog educativo"
        ],
        buttonText: "Comenzar ahora",
        highlight: false
    },
    {
        title: "Transformación",
        price: "$19",
        period: "/mes",
        description: "Para un cambio real y profundo.",
        features: [
            "Coaching personalizado (5 sesiones)",
            "Recursos exclusivos ilimitados",
            "Análisis de progreso semanal",
            "Talleres de crecimiento"
        ],
        buttonText: "Suscribirse",
        highlight: true // We can use this to add extra emphasis if needed, or just keep uniform
    },
    {
        title: "Corporativo",
        price: "$29",
        period: "/mes",
        description: "Bienestar integral para tu equipo.",
        features: [
            "Todo lo incluido en Transformación",
            "Gestión de equipos y reportes",
            "Soporte prioritario 24/7",
            "Consultoría de bienestar"
        ],
        buttonText: "Contactar ventas",
        highlight: false
    }
];

const PricingCard = ({ plan }) => {
    // 0: Cyan, 1: Purple, 2: Orange
    const colorMap = {
        'Esencial': '128, 202, 205',
        'Transformación': '157, 96, 207',
        'Corporativo': '225, 148, 127'
    };
    const glowColor = colorMap[plan.title] || '157, 96, 207';

    // Manual glow tracking
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        e.currentTarget.style.setProperty('--glow-x', `${x}%`);
        e.currentTarget.style.setProperty('--glow-y', `${y}%`);
        e.currentTarget.style.setProperty('--glow-intensity', '1');
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.setProperty('--glow-intensity', '0');
    };

    return (
        <window.ParticleCard
            enableStars={true}
            enableSpotlight={false}
            enableBorderGlow={true}
            particleCount={10}
            glowColor={glowColor}
            clickEffect={true}
            className="magic-bento-card magic-bento-card--border-glow"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            tiltMaxAngle={3}
            tiltDuration={0.4}
            style={{
                aspectRatio: 'unset',
                minHeight: '340px', // Further reduced height
                height: '100%',
                backgroundColor: '#FFFFFF',
                color: '#000',
                overflow: 'hidden',
                padding: '1.5rem', // Further reduced padding
                border: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                // Initialize glow vars
                '--glow-x': '50%',
                '--glow-y': '50%',
                '--glow-intensity': '0',
                '--glow-radius': '300px'
            }}
        >
            <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#666' }}>
                    {plan.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: '#000' }}>{plan.price}</span>
                    {plan.period && <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '5px' }}>{plan.period}</span>}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#444', marginBottom: '1rem', lineHeight: 1.4 }}>
                    {plan.description}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
                    {plan.features.map((feature, i) => (
                        <li key={i} style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', color: '#333', fontSize: '0.85rem' }}>
                            <span style={{ color: `rgba(${glowColor}, 1)`, marginRight: '8px', fontSize: '0.9rem' }}>✔</span>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            <button
                className="btn"
                style={{
                    marginTop: '1.5rem',
                    width: '100%',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    padding: '10px 16px'
                }}
            >
                {plan.buttonText}
            </button>
        </window.ParticleCard>
    );
};

const PricingList = () => {
    return (
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                paddingBottom: '3rem'
            }}>
                {pricingData.map((plan, index) => (
                    <PricingCard key={index} plan={plan} />
                ))}
            </div>
        </div>
    );
};

// Mount
const rootElement = document.getElementById('pricing-list-root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<PricingList />);
}
