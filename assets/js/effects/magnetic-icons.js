/**
 * Magnetic effect for .thanks-float-icon elements and .category-pill.
 * Only activates on devices with a fine pointer (mouse/trackpad).
 */
(function () {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    // --- 1. Thanks Section Floating Icons ---
    const section = document.querySelector('.thanks-redesign-inner');
    const floatIcons = document.querySelectorAll('.thanks-float-icon');
    
    if (section && floatIcons.length) {
        const STRENGTH_FLOAT = 0.45;
        const RADIUS_FLOAT = 120;
        
        section.addEventListener('mousemove', e => {
            floatIcons.forEach(icon => {
                const wrapper = icon.parentElement;
                const rect = wrapper.getBoundingClientRect();
                
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                
                const dx = e.clientX - cx;
                const dy = e.clientY - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < RADIUS_FLOAT) {
                    const pull = Math.pow((RADIUS_FLOAT - dist) / RADIUS_FLOAT, 1.5) * STRENGTH_FLOAT;
                    icon.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
                } else {
                    icon.style.transform = '';
                }
            });
        });

        section.addEventListener('mouseleave', () => {
            floatIcons.forEach(icon => {
                icon.style.transform = '';
            });
        });
    }

    // --- 2. Blog Category Pills ---
    const pills = document.querySelectorAll('.category-pill');
    if (pills.length) {
        const STRENGTH_PILL = 0.3;
        const RADIUS_PILL = 80;
        const EASE = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        const EASE_BACK = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        pills.forEach(pill => {
            pill.style.willChange = 'transform';
            
            // Apply effect when mouse moves over the pill itself
            pill.addEventListener('mousemove', e => {
                const rect = pill.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                
                const dx = e.clientX - cx;
                const dy = e.clientY - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < RADIUS_PILL) {
                    pill.style.transition = EASE;
                    // Slightly pull the pill towards the cursor
                    pill.style.transform = `translate(${dx * STRENGTH_PILL}px, ${dy * STRENGTH_PILL}px)`;
                }
            });

            pill.addEventListener('mouseleave', () => {
                pill.style.transition = EASE_BACK;
                pill.style.transform = '';
            });
        });
    }
})();
