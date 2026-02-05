// Activar sistema de animaciones mediante Mejora Progresiva
document.documentElement.classList.add('js-active');

// Activar sistema de animaciones mediante Mejora Progresiva
document.documentElement.classList.add('js-active');

document.addEventListener('DOMContentLoaded', function () {
    // Note: Loader and Sticky Header are now handled by main.js

    // --- SISTEMA DE ANIMACIONES ---
    // Re-use logic or keep specific if needed. 
    // Since scroll-animations.js is global, we might only need to trigger it for dynamic content.

    // Escuchar evento de contenido cargado dinámicamente from loaders
    document.addEventListener('article-content-loaded', () => {
        // Force re-check of animations for new content
        // This assumes scroll-animations.js might need an exposed method, 
        // OR we just manually add the class for now if it's simple.

        setTimeout(() => {
            const elements = document.querySelectorAll('.title, .article, .image, .article-title, .responsive-table');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            elements.forEach(el => {
                if (!el.classList.contains('animate')) {
                    observer.observe(el);
                }
            });
        }, 100);
    });
});
