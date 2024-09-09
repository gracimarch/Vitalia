document.addEventListener('DOMContentLoaded', function () {
    let lastScrollPosition = 0;
    const header = document.querySelector('.header');
    const loader = document.getElementById('loader');
    const body = document.body;

    // No permitir que el usuario scrollee mientras esté la pantalla de carga
    window.addEventListener('load', function () {
        loader.style.display = 'none';
        body.classList.remove('no-scroll');
    });

    // Mantener 'no-scroll' hasta que esté completamente cargada
    window.addEventListener('load', function () {
        body.classList.remove('no-scroll');

        // Animación de los blocks
        const blocks = document.querySelectorAll('.title, .article, .image, .article-title, .responsive-table');

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        });

        blocks.forEach(block => {
            observer.observe(block);
        });

    });

    // Animación de desplazamiento suave del header
    window.addEventListener('scroll', function () {
        const currentScrollPosition = window.pageYOffset;

        if (currentScrollPosition > lastScrollPosition) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        lastScrollPosition = currentScrollPosition;
    });

    // Botón de volver arriba
    const scrollToTopBtn = document.getElementById('scrollToTop');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 200) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Añadir 'no-scroll' a la web mientras el loader está visible
    body.classList.add('no-scroll');
});
