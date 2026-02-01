document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.blog-info-card');
    if (!card) return;

    // Settings
    const particleCount = 20;
    const colors = ['rgba(157, 96, 207, 0.6)', 'rgba(128, 202, 205, 0.6)', 'rgba(225, 148, 127, 0.6)']; // Vitalia colors: Higher alpha

    for (let i = 0; i < particleCount; i++) {
        createParticle(card, colors);
    }
});

function createParticle(container, colors) {
    const particle = document.createElement('div');
    const size = Math.random() * 5 + 3; // 3-8px
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = color;
    particle.style.position = 'absolute';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.opacity = Math.random() * 0.4 + 0.4; // 0.4 to 0.8 opacity
    particle.style.zIndex = '0'; // Behind text
    particle.classList.add('blog-particle');

    // Initial position
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    particle.style.left = `${startX}%`;
    particle.style.top = `${startY}%`;

    container.insertBefore(particle, container.firstChild);

    // Animate with GSAP
    if (window.gsap) {
        // Floating movement
        gsap.to(particle, {
            x: (Math.random() - 0.5) * 150,
            y: (Math.random() - 0.5) * 150,
            duration: Math.random() * 10 + 10, // 10-20s duration
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
        });

        // Pulsing opacity
        gsap.to(particle, {
            opacity: Math.random() * 0.5 + 0.4, // Pulse between 0.4 and 0.9
            scale: Math.random() * 0.5 + 0.8,
            duration: Math.random() * 3 + 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
}
