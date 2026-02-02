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
        const blocks = document.querySelectorAll('.articles .block, .articles .info-block, .lecturas .block, .lecturas .info-block, .reading .reading-section, .welcome .welcome-section, .ejercicios .block, .thanks .thanks-section, .audio-blocks .audio-block');

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

    // STICKY HEADER LOGIC
    // We need to wait for the header to be injected by load-components.js
    const headerObserver = new MutationObserver((mutations, obs) => {
        const header = document.querySelector('.header');
        if (header) {
            // Initial check in case we reload scrolled down
            checkHeaderVisibility();

            // Add scroll listener
            window.addEventListener('scroll', checkHeaderVisibility);

            function checkHeaderVisibility() {
                const triggerHeight = window.innerHeight - 50; // Buffer
                if (window.scrollY < triggerHeight) {
                    header.classList.add('transparent-mode');
                } else {
                    header.classList.remove('transparent-mode');
                }
            }

            obs.disconnect(); // Stop observing once we found and attached
        }
    });

    // Start observing the placeholder
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerObserver.observe(headerPlaceholder, { childList: true, subtree: true });
    } else {
        // Fallback if placeholder doesn't exist (unlikely)
        const header = document.querySelector('.header');
        if (header) {
            // Check immediately
            if (window.scrollY < window.innerHeight - 50) {
                header.classList.add('transparent-mode');
            }

            window.addEventListener('scroll', () => {
                if (window.scrollY < window.innerHeight - 50) {
                    header.classList.add('transparent-mode');
                } else {
                    header.classList.remove('transparent-mode');
                }
            });
        }
    }

    // Añadir 'no-scroll' a la web mientras el loader está visible
    body.classList.add('no-scroll');

    // Rotating Text Animation
    const wrapper = document.querySelector(".words");
    if (wrapper) {
        const words = wrapper.querySelectorAll("span");
        const currentWord = wrapper.querySelector("span.current");
        const wordsWidths = Array.from(words).map((word) => word.offsetWidth);
        const maxWordsWidth = Math.max(...wordsWidths);
        const CURRENT_CLASS = "current";
        const NEXT_CLASS = "next";
        wrapper.style.setProperty("--width", `${currentWord.offsetWidth}px`);
        wrapper.style.setProperty("--width-mobile", `${maxWordsWidth}px`);
        setInterval(() => {
            const currentWord = wrapper.querySelector("span.current");
            const nextWord = wrapper.querySelector("span.next");
            const nextNextWord = nextWord.nextElementSibling
                ? nextWord.nextElementSibling
                : wrapper.firstElementChild;
            currentWord.classList.remove(CURRENT_CLASS);
            nextWord.classList.remove(NEXT_CLASS);
            nextWord.classList.add(CURRENT_CLASS);
            nextNextWord.classList.add(NEXT_CLASS);
            wrapper.style.setProperty("--color", nextWord.dataset.color);
            wrapper.style.setProperty("--color-bg", nextWord.dataset.bgColor);
            wrapper.style.setProperty("--width", `${nextWord.offsetWidth}px`);
        }, 1500);
    }

    // FAQ Accordion
    document.querySelectorAll('.question').forEach(question => {
        question.addEventListener('click', () => {
            question.classList.toggle('active');

            const answer = question.nextElementSibling;
            if (question.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
        });
    });

});
