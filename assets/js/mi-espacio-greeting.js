const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

const GreetingComponent = () => {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const updateGreeting = () => {
            const currentHour = new Date().getHours();
            let newGreeting = '';

            if (currentHour >= 6 && currentHour < 12) {
                newGreeting = '¡Buenos días!';
            } else if (currentHour >= 12 && currentHour < 20) {
                newGreeting = '¡Buenas tardes!';
            } else {
                newGreeting = '¡Buenas noches!';
            }
            setGreeting(newGreeting);
        };

        updateGreeting();
        // Optional: Update every minute to ensure correctness if the page is left open across boundaries
        const interval = setInterval(updateGreeting, 60000);
        return () => clearInterval(interval);
    }, []);

    const subtitleStyle = {
        fontSize: '1.25rem', // Similar to h4 or large paragraph
        fontWeight: '300',
        color: 'var(--text-muted)', // Using CSS variable if available, or fallback
        marginTop: '0.5rem',
        marginBottom: '0',
        fontFamily: "'Poppins', sans-serif"
    };

    return (
        <div className="greeting-container">
            <GradientText
                colors={['#E1947F', '#9d60cf', '#80CACD']}
                animationSpeed={8}
                showBorder={false}
                className="welcome-heading"
            >
                <span style={{ fontSize: '2.5rem', fontWeight: '600' }}>{greeting}</span>
            </GradientText>
            <p style={subtitleStyle}>Disfruta de tu contenido seleccionado para hoy</p>
        </div>
    );
};

const rootElement = document.getElementById('greeting-root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<GreetingComponent />);
}
