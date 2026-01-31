const { useState, useEffect } = React;
// Requires ParticleCard, DEFAULT_GLOW_COLOR from MagicBento.js (exposed globally)

const faqData = [
    {
        question: "¿Cómo funciona el proceso de personalización en Vitalia?",
        answer: "Al registrarte en Vitalia, completarás un formulario que nos permitirá conocer tus objetivos, hábitos y preferencias. Con esta información, crearemos un plan de bienestar único, que incluirá recomendaciones de alimentación, rutinas de ejercicio y meditaciones, ajustadas a tu estilo de vida y necesidades. A medida que avanzas, el plan se ajustará para seguir siendo relevante y efectivo."
    },
    {
        question: "¿Vitalia está diseñada para cualquier persona?",
        answer: "Sí, Vitalia está diseñada para todos. Sin importar tu estilo de vida o tus necesidades específicas, nuestros planes se ajustan a tus preferencias y objetivos. Ya sea que tengas una vida activa, restricciones alimenticias o de movilidad, o busques mejorar tu salud mental, te ofrecemos una orientación personalizada que responde a cada uno de estos aspectos."
    },
    {
        question: "¿Existen opciones gratuitas o solo puedo acceder mediante suscripción?",
        answer: "Ofrecemos tanto planes gratuitos como premium. El plan gratuito incluye acceso básico a nuestra plataforma, con rutinas de ejercicio, meditación, planes de nutrición y artículos educativos. Los planes premium te ofrecen acceso a una experiencia personalizada más avanzada, con contenido exclusivo, asesoría con profesionales y seguimiento continuo."
    },
    {
        question: "¿Es Vitalia accesible desde cualquier dispositivo?",
        answer: "¡Sí! Vitalia está diseñada para ser accesible desde cualquier dispositivo, ya sea desde tu computadora, teléfono móvil o tablet. Todo lo que necesitas es acceso a internet para que puedas disfrutar de tus planes de bienestar en cualquier lugar y en cualquier momento."
    }
];

const FAQItem = ({ item, isOpen, onClick }) => {
    // Determine glow color - using footer colors cycling
    // 0: Cyan, 1: Purple, 2: Orange, 3: Cyan
    const colors = ['128, 202, 205', '157, 96, 207', '225, 148, 127'];
    const glowColor = colors[Math.abs(item.question.length) % 3]; // Deterministic random color

    // Manual glow tracking since we don't use GlobalSpotlight here
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
        <div style={{ marginBottom: '15px' }}>
            <window.ParticleCard
                enableStars={true}
                enableSpotlight={false}
                enableBorderGlow={true}
                particleCount={8}
                glowColor={glowColor}
                clickEffect={true}
                className="magic-bento-card magic-bento-card--border-glow"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                tiltMaxAngle={3}
                tiltDuration={0.4}
                style={{
                    aspectRatio: 'unset',
                    minHeight: 'unset',
                    height: 'auto',
                    backgroundColor: '#FFFFFF',
                    color: '#333',
                    overflow: 'hidden',
                    padding: 0,
                    border: '1px solid rgba(0,0,0,0.08)',
                    // Initialize glow vars
                    '--glow-x': '50%',
                    '--glow-y': '50%',
                    '--glow-intensity': '0',
                    '--glow-radius': '300px'
                }}
            >
                <div
                    className={`question ${isOpen ? 'active' : ''}`}
                    onClick={onClick}
                    style={{
                        margin: 0,
                        backgroundColor: 'transparent',
                        border: 'none',
                        zIndex: 2,
                        position: 'relative',
                        color: '#000',
                        fontWeight: 600
                    }}
                >
                    {item.question}
                </div>

                <div
                    className="answercont"
                    style={{
                        maxHeight: isOpen ? '500px' : '0',
                        opacity: isOpen ? 1 : 0,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        zIndex: 2
                    }}
                >
                    <div className="answer" style={{ color: '#000', padding: '0 40px 40px 40px', lineHeight: '1.6' }}>
                        {item.answer}
                    </div>
                </div>
            </window.ParticleCard>
        </div>
    );
};

const FAQList = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="faq-list">
            {faqData.map((item, index) => (
                <FAQItem
                    key={index}
                    item={item}
                    isOpen={openIndex === index}
                    onClick={() => toggleFAQ(index)}
                />
            ))}
        </div>
    );
};

// Mount
const rootElement = document.getElementById('faq-list-root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<FAQList />);
}
