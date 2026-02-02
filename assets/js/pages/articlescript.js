// Activar sistema de animaciones mediante Mejora Progresiva
document.documentElement.classList.add('js-active');

document.addEventListener('DOMContentLoaded', function () {
    let lastScrollPosition = 0;
    const header = document.querySelector('.header');
    const loader = document.querySelector('.loader-container');
    const body = document.body;

    // --- SISTEMA DE ANIMACIONES (IntersectionObserver + MutationObserver) ---

    // Configuración del observador de intersección
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                animationObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Función para observar elementos específicos
    const observeElements = (container = document) => {
        const selector = '.title, .article, .image, .article-title, .responsive-table';
        const elements = container.querySelectorAll(selector);
        elements.forEach(el => {
            if (!el.classList.contains('animate')) {
                animationObserver.observe(el);
            }
        });
    };

    // Observar elementos iniciales
    observeElements();

    // MutationObserver: Detectar automáticamente cuando se añade contenido dinámico (como lecturas de JSON)
    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Si es un elemento HTML
                    // Si el nodo mismo coincide o contiene elementos animables
                    if (node.matches && node.matches('.title, .article, .image, .article-title, .responsive-table')) {
                        animationObserver.observe(node);
                    }
                    observeElements(node);
                }
            });
        });
    });

    // Empezar a vigilar el cuerpo del documento para cambios
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // --- MANEJO DE CARGA Y HEADER ---

    // Quitar loader y permitir scroll cuando todo esté listo
    window.addEventListener('load', function () {
        if (loader) loader.style.display = 'none';
        body.classList.remove('no-scroll');
    });

    // Animación de ocultar/mostrar header al scrollear
    window.addEventListener('scroll', function () {
        const currentScrollPosition = window.pageYOffset;
        if (!header) return;

        if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 100) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        lastScrollPosition = currentScrollPosition;
    });

    // Estado inicial de scroll
    body.classList.add('no-scroll');

    // Escuchar evento de contenido cargado dinámicamente
    document.addEventListener('article-content-loaded', () => {
        // Pequeño delay para asegurar que el DOM está listo
        setTimeout(() => {
            observeElements();
            // Forzar .animate en elementos ya visibles para evitar que se queden ocultos
            document.querySelectorAll('.article, .title, .article-title, .responsive-table').forEach(el => {
                if (!el.classList.contains('animate')) {
                    // Si el IntersectionObserver no lo ha pillado, lo forzamos si está en viewport o simplemente lo mostramos
                    // Una estrategia segura es forzar la observación de nuevo
                    animationObserver.observe(el);
                }
            });
        }, 100);
    });
});
