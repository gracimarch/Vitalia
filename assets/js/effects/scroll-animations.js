/**
 * Effect: Scroll Animations
 * Uses IntersectionObserver to trigger 'animate' class on elements as they scroll into view.
 */

document.addEventListener('DOMContentLoaded', function () {
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% visible triggers animation
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                obs.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // List of selectors to observe
    const selectors = [
        '.articles .block',
        '.articles .info-block',
        '.lecturas .block',
        '.lecturas .info-block',
        '.reading .reading-section',
        '.welcome .welcome-section',
        '.ejercicios .block',
        '.thanks .thanks-section',
        '.audio-blocks .audio-block',
        '.animate-on-scroll' // Generic class for future use
    ];

    const elements = document.querySelectorAll(selectors.join(', '));

    // Only run if elements exist to avoid overhead
    if (elements.length > 0) {
        elements.forEach(el => observer.observe(el));
    }
});
