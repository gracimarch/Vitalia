document.addEventListener('DOMContentLoaded', function () {
    let currentAudio = null;
    let currentAudioButton = null;
    let lastScrollPosition = 0;
    const header = document.querySelector('.header');
    const loader = document.querySelector('.loader-container');
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
        const blocks = document.querySelectorAll('.welcome, .articles .block, .articles .info-block, .lecturas .block, .lecturas .info-block, .reading .reading-section, .welcome .welcome-section, .ejercicios .block, .thanks .thanks-section, .audio-blocks .audio-block');

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

    // Añadir 'no-scroll' a la web mientras el loader está visible
    body.classList.add('no-scroll');

});
