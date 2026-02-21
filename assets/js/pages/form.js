import { validateSection } from './form-validation.js';
import { handleSubmit } from './form-submit.js';

document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".section");
    const steps = document.querySelectorAll(".step");
    let currentStep = 0;
    let isTransitioning = false;
    const body = document.body;
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const sendButton = document.querySelector('.send-btn');
    const ningunaCheckbox = document.getElementById('ninguna');
    const otherCheckboxes = ['lactosa', 'celiacia', 'otros'].map(id => document.getElementById(id));
    const otrosCheckbox = document.getElementById('otros');
    const otrosEspecificar = document.getElementById('otros-especificar');

    // --- NAVIGATION LOGIC ---
    const animationHandlers = new Map();

    function toggleButton(button, show, animationClassIn = 'active') {
        const isHidden = button.classList.contains('hidden');
        const isDisplayNone = button.style.display === 'none' || getComputedStyle(button).display === 'none';

        if (show) {
            if (animationHandlers.has(button)) {
                button.removeEventListener('animationend', animationHandlers.get(button));
                animationHandlers.delete(button);
            }

            if (isDisplayNone || isHidden) {
                button.classList.remove('hidden');
                button.style.display = 'inline-block';
                void button.offsetWidth;
                button.classList.add(animationClassIn);
            }
        } else {
            if (!isDisplayNone && !isHidden) {
                button.classList.remove(animationClassIn);
                button.classList.add('hidden');

                const handler = function () {
                    if (button.classList.contains('hidden')) {
                        button.style.display = 'none';
                        button.classList.remove('hidden');
                    }
                    animationHandlers.delete(button);
                };

                animationHandlers.set(button, handler);
                button.addEventListener('animationend', handler, { once: true });
            }
        }
    }

    function updateButtons() {
        if (currentStep === 0) {
            toggleButton(prevButton, false);
        } else {
            toggleButton(prevButton, true);
        }

        if (currentStep === sections.length - 1) {
            toggleButton(nextButton, false);
            toggleButton(sendButton, true);
        } else {
            toggleButton(nextButton, true);
            toggleButton(sendButton, false);
        }
    }

    function showSection(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        const currentSection = document.querySelector('.section.active');
        const newSection = sections[index];

        if (currentSection) {
            currentSection.classList.add('fade-out');
            currentSection.addEventListener('animationend', function hideSection() {
                currentSection.classList.remove('active', 'fade-out');
                newSection.classList.add('active', 'fade-in');
                newSection.addEventListener('animationend', function removeFadeIn() {
                    newSection.classList.remove('fade-in');
                    isTransitioning = false;
                }, { once: true });
                currentSection.removeEventListener('animationend', hideSection);
            }, { once: true });
        } else {
            newSection.classList.add('active', 'fade-in');
            newSection.addEventListener('animationend', function removeFadeIn() {
                newSection.classList.remove('fade-in');
                isTransitioning = false;
            }, { once: true });
        }

        steps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });

        updateButtons();
    }

    // --- EVENT LISTENERS ---

    document.querySelectorAll(".next-btn").forEach(button => {
        button.addEventListener("click", () => {
            if (currentStep < sections.length - 1) {
                if (validateSection(currentStep)) {
                    currentStep++;
                    showSection(currentStep);
                }
            }
        });
    });

    document.querySelectorAll(".prev-btn").forEach(button => {
        button.addEventListener("click", () => {
            if (currentStep > 0) {
                prevButton.classList.remove('active');
                currentStep--;
                showSection(currentStep);
            }
        });
    });

    steps.forEach((step, index) => {
        step.addEventListener("click", () => {
            if (index < currentStep) {
                currentStep = index;
                showSection(currentStep);
            } else if (index > currentStep) {
                if (index === currentStep + 1 && validateSection(currentStep)) {
                    currentStep = index;
                    showSection(currentStep);
                }
            }
        });
    });

    // Handle "Ninguna" checkbox logic
    ningunaCheckbox.addEventListener('change', function () {
        if (this.checked) {
            otherCheckboxes.forEach(function (checkbox) {
                checkbox.checked = false;
                if (checkbox.id === 'otros') {
                    otrosEspecificar.value = '';
                    otrosEspecificar.disabled = true;
                }
            });
        }
    });

    otherCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                ningunaCheckbox.checked = false;
            }
        });
    });

    // Handle "Otros" text field
    otrosCheckbox.addEventListener('change', function () {
        if (otrosCheckbox.checked) {
            otrosEspecificar.disabled = false;
            otrosEspecificar.focus();
        } else {
            otrosEspecificar.value = "";
            otrosEspecificar.disabled = true;
        }
    });

    // Initial state
    showSection(currentStep);
    updateButtons();
    otrosEspecificar.disabled = true;

    // --- FORM SUBMIT INTERCEPTION ---
    const form = document.getElementById('myForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (validateSection(sections.length - 1)) {
                handleSubmit();
            } else {
                e.stopImmediatePropagation();
                return false;
            }
        });
    }

    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateSection(currentStep)) {
            handleSubmit();
        } else {
            e.stopPropagation();
        }
    });
});
