/**
 * form-particles.js
 * Adapts the Magic Bento particle and glow effects for the form container.
 */

const DEFAULT_GLOW_COLOR = '132, 0, 255'; // Purple
const PARTICLE_COUNT = 12;

// Create a particle element
const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(${color}, 1);
        box-shadow: 0 0 6px rgba(${color}, 0.6);
        pointer-events: none;
        z-index: 100;
        left: ${x}px;
        top: ${y}px;
    `;
    return el;
};

document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.wrapper');
    if (!wrapper) return;

    // State
    let isHovered = false;
    let particles = [];
    let timeouts = [];

    // Initialize CSS variables
    wrapper.style.setProperty('--glow-x', '50%');
    wrapper.style.setProperty('--glow-y', '50%');
    wrapper.style.setProperty('--glow-intensity', '0');
    wrapper.style.setProperty('--glow-radius', '200px');
    wrapper.style.setProperty('--glow-color', DEFAULT_GLOW_COLOR);

    // --- Particle Animation Logic ---

    const clearAllParticles = () => {
        timeouts.forEach(clearTimeout);
        timeouts = [];

        particles.forEach(particle => {
            gsap.to(particle, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                ease: 'back.in(1.7)',
                onComplete: () => {
                    particle.remove();
                }
            });
        });
        particles = [];
    };

    const animateParticles = () => {
        if (!isHovered) return;

        const { width, height } = wrapper.getBoundingClientRect();

        // Create initial batch of particles
        const newParticles = Array.from({ length: PARTICLE_COUNT }, () =>
            createParticleElement(Math.random() * width, Math.random() * height, DEFAULT_GLOW_COLOR)
        );

        newParticles.forEach((particle, index) => {
            const timeoutId = setTimeout(() => {
                if (!isHovered) return;

                wrapper.appendChild(particle);
                particles.push(particle);

                // Entrance animation
                gsap.fromTo(particle,
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
                );

                // Floating movement
                gsap.to(particle, {
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100,
                    rotation: Math.random() * 360,
                    duration: 2 + Math.random() * 2,
                    ease: 'none',
                    repeat: -1,
                    yoyo: true
                });

                // Pulping opacity
                gsap.to(particle, {
                    opacity: 0.3,
                    duration: 1.5,
                    ease: 'power2.inOut',
                    repeat: -1,
                    yoyo: true
                });

            }, index * 100);

            timeouts.push(timeoutId);
        });
    };

    // --- Event Handlers ---

    wrapper.addEventListener('mouseenter', () => {
        isHovered = true;
        animateParticles();
        // wrapper.style.setProperty('--glow-intensity', '1'); // Handled by mousemove
    });

    wrapper.addEventListener('mouseleave', () => {
        isHovered = false;
        clearAllParticles();
        wrapper.style.setProperty('--glow-intensity', '0');

        // Reset tilt if we had it, but for form we might just want to reset glow
        gsap.to(wrapper, {
            '--glow-intensity': 0,
            duration: 0.3
        });
    });

    wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calculate relative position for glow
        const relativeX = ((mouseX - rect.left) / rect.width) * 100;
        const relativeY = ((mouseY - rect.top) / rect.height) * 100;

        wrapper.style.setProperty('--glow-x', `${relativeX}%`);
        wrapper.style.setProperty('--glow-y', `${relativeY}%`);
        wrapper.style.setProperty('--glow-intensity', '1');
    });
});
