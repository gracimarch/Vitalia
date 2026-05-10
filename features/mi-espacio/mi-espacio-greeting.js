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

    return (
        <div className="greeting-container">
            <h1 className="welcome-heading">{greeting}</h1>
            <p className="greeting-subtitle">Disfruta de tu contenido seleccionado para hoy</p>
        </div>
    );
};

const rootElement = document.getElementById('greeting-root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<GreetingComponent />);
}
