document.addEventListener('DOMContentLoaded', function () {

    // =========================================
    // 1. NAVBAR TOGGLE
    // =========================================
    const togglers = document.querySelectorAll('.navbar-toggler');

    togglers.forEach(toggler => {
        toggler.addEventListener('click', function () {
            const targetId = this.getAttribute('data-bs-target');
            const target = document.querySelector(targetId);

            if (target) {
                target.classList.toggle('show');

                // Toggle aria-expanded for accessibility
                const isExpanded = target.classList.contains('show');
                this.setAttribute('aria-expanded', isExpanded);

                // Visual toggle for the icon
                if (isExpanded) {
                    this.classList.remove('collapsed');
                } else {
                    this.classList.add('collapsed');
                }
            }
        });
    });

    // =========================================
    // 2. LOADER & SCROLL HANDLING
    // =========================================
    const loader = document.querySelector('.loader-container');
    const body = document.body;
    const header = document.querySelector('.header');
    let lastScrollPosition = 0;

    // Remove loader when window is fully loaded
    window.addEventListener('load', function () {
        if (loader) {
            loader.style.display = 'none';
        }
        body.classList.remove('no-scroll');
    });

    // Initially prevent scroll if loader is present
    if (loader) {
        body.classList.add('no-scroll');
    }

    // Sticky Header Scroll Effect
    if (header) {
        window.addEventListener('scroll', function () {
            const currentScrollPosition = window.pageYOffset;

            if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 50) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }

            lastScrollPosition = currentScrollPosition;
        });
    }
});
