document.addEventListener("DOMContentLoaded", function() {
    const sections = document.querySelectorAll(".section");
    const steps = document.querySelectorAll(".step");
    let currentStep = 0;
    let isTransitioning = false; // Lock to prevent multiple clicks
    const loader = document.getElementById('loader');
    const body = document.body;
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const sendButton = document.querySelector('.send-btn');

    // No permitir que el usuario scrollee mientras esté la pantalla de carga
    window.addEventListener('load', function () {
        loader.style.display = 'none';
        body.classList.remove('no-scroll');
    });

    function updateButtons() {
        if (currentStep === 0) {
            if (prevButton.classList.contains('active')) {
                prevButton.classList.add('hidden'); // Slide-out animation
                prevButton.addEventListener('animationend', function hideButton() {
                    prevButton.style.display = 'none'; // Fully hide after animation
                    prevButton.classList.remove('active', 'hidden'); // Reset classes
                    prevButton.removeEventListener('animationend', hideButton); // Clean up
                }, { once: true });
            }
        } else {
            if (!prevButton.classList.contains('active')) {
                prevButton.style.display = 'inline-block';
                prevButton.classList.add('active');
                prevButton.classList.remove('hidden'); // Ensure it's visible
            }
        }

        if (currentStep === sections.length - 1) {
            nextButton.classList.add('hidden'); // Hide the "Continuar →" button with animation
            sendButton.classList.remove('hidden'); // Show the "Enviar" button
        } else {
            nextButton.classList.remove('hidden'); // Show the "Continuar →" button
            sendButton.classList.add('hidden'); // Hide the "Enviar" button with animation
        }
    }

    function showSection(index) {
        if (isTransitioning) return; // Prevent additional clicks
        isTransitioning = true; // Lock transitions

        const currentSection = document.querySelector('.section.active');
        const newSection = sections[index];

        if (currentSection) {
            currentSection.classList.add('fade-out');
            currentSection.addEventListener('animationend', function hideSection() {
                currentSection.classList.remove('active', 'fade-out');
                newSection.classList.add('active', 'fade-in');
                newSection.addEventListener('animationend', function removeFadeIn() {
                    newSection.classList.remove('fade-in');
                    isTransitioning = false; // Unlock transitions
                }, { once: true });
                currentSection.removeEventListener('animationend', hideSection);
            }, { once: true });
        } else {
            newSection.classList.add('active', 'fade-in');
            newSection.addEventListener('animationend', function removeFadeIn() {
                newSection.classList.remove('fade-in');
                isTransitioning = false; // Unlock transitions
            }, { once: true });
        }

        steps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });

        updateButtons();
    }

    document.querySelectorAll(".next-btn").forEach(button => {
        button.addEventListener("click", () => {
            if (currentStep < sections.length - 1) {
                currentStep++;
                showSection(currentStep);
            } else {
                alert('Formulario completado');
            }
        });
    });

    document.querySelectorAll(".prev-btn").forEach(button => {
        button.addEventListener("click", () => {
            if (currentStep > 0) {
                prevButton.classList.remove('active'); // Remove 'active' to hide the button smoothly
                currentStep--;
                showSection(currentStep);
            }
        });
    });

    steps.forEach((step, index) => {
        step.addEventListener("click", () => {
            currentStep = index;
            showSection(currentStep);
        });
    });

    // Show the first section on page load and update buttons
    showSection(currentStep);
    updateButtons();
});
