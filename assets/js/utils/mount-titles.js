// Script to mount independent React components for section titles

(function () {
    const GradientText = window.GradientText;
    const { createRoot } = ReactDOM;

    // Defines title configurations
    const titles = [
        {
            id: 'faq-title-root',
            text: '¿Tienes alguna duda? Nosotros te respondemos',
            className: 'reading-heading wobble landing-dynamic-title',
        },
        {
            id: 'premium-title-root',
            text: 'Lleva tu experiencia al siguiente nivel',
            className: 'reading-heading wobble landing-dynamic-title',
        }
    ];

    titles.forEach(config => {
        const rootEl = document.getElementById(config.id);
        if (rootEl && GradientText) {
            const createRoot = ReactDOM.createRoot;
            const root = createRoot(rootEl);

            // We can wrap the text in GradientText
            // Need to handle the styling carefully seamlessly integrating with existing CSS
            // The existing CSS uses .reading-heading for font size etc.

            root.render(
                <GradientText
                    colors={['#E1947F', '#9d60cf', '#80CACD']}
                    animationSpeed={8}
                    showBorder={false}
                    className={config.className}
                >
                    <span>{config.text}</span>
                </GradientText>
            );
        }
    });

})();
