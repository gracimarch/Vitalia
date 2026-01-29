document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".section");
    const steps = document.querySelectorAll(".step");
    let currentStep = 0;
    let isTransitioning = false;
    const loader = document.getElementById('loader');
    const body = document.body;
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const sendButton = document.querySelector('.send-btn');
    const ningunaCheckbox = document.getElementById('ninguna');
    const otherCheckboxes = ['lactosa', 'celiacia', 'otros'].map(id => document.getElementById(id));
    const otrosCheckbox = document.getElementById('otros');
    const otrosEspecificar = document.getElementById('otros-especificar');

    // --- SECURITY & UTILS ---

    // Sanitize input to prevent XSS
    function sanitizeInput(str) {
        if (!str) return "";
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            "/": '&#x2F;',
        };
        const reg = /[&<>"'/]/ig;
        return str.replace(reg, (match) => (map[match]));
    }

    // Toast Notification helper
    function showToast(message, type = "error") {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: type === "error" ? "linear-gradient(to right, #ff5f6d, #ffc371)" : "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast();
    }

    // --- VALIDATION LOGIC ---

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    function validateStep1() {
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        const confirmPassInput = document.getElementById('confirmPassword');
        const termsInput = document.getElementById('terms');

        const email = sanitizeInput(emailInput.value.trim());
        const pass = passInput.value;
        const confirmPass = confirmPassInput.value;

        if (!email || !validateEmail(email)) {
            showToast("Por favor, introduce un correo electrónico válido.");
            emailInput.focus();
            return false;
        }

        if (pass.length < 8) {
            showToast("La contraseña debe tener al menos 8 caracteres.");
            passInput.focus();
            return false;
        }

        if (pass !== confirmPass) {
            showToast("Las contraseñas no coinciden.");
            confirmPassInput.focus();
            return false;
        }

        if (!termsInput.checked) {
            showToast("Debes aceptar los términos y condiciones.");
            return false;
        }

        return true;
    }

    function validateStep2() {
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const country = document.getElementById('country');
        const age = document.getElementById('age');
        const gender = document.querySelector('input[name="gender"]:checked');

        if (!sanitizeInput(firstName.value.trim())) {
            showToast("Por favor, ingresa tu nombre.");
            firstName.focus();
            return false;
        }
        if (!sanitizeInput(lastName.value.trim())) {
            showToast("Por favor, ingresa tu apellido.");
            lastName.focus();
            return false;
        }
        if (country.value === "") {
            showToast("Por favor, selecciona tu país.");
            country.focus();
            return false;
        }
        if (!age.value || age.value < 13 || age.value > 120) {
            showToast("Por favor, ingresa una edad válida (13-120).");
            age.focus();
            return false;
        }
        if (!gender) {
            showToast("Por favor, selecciona cómo te identificas.");
            return false;
        }

        return true;
    }

    function validateStep3() {
        const disability = document.querySelector('input[name="disability"]:checked');
        const activity = document.querySelector('input[name="physicalActivity"]:checked');
        const diet = document.querySelector('input[name="diet"]:checked');
        const restrictions = document.querySelectorAll('input[name="restriccion"]:checked');

        if (!disability) {
            showToast("Por favor, indica si tienes alguna discapacidad.");
            return false;
        }
        if (!activity) {
            showToast("Por favor, indica tu nivel de actividad física.");
            return false;
        }
        if (!diet) {
            showToast("Por favor, indica tu tipo de dieta.");
            return false;
        }
        if (restrictions.length === 0) {
            showToast("Por favor, selecciona alguna restricción alimentaria o 'Ninguna'.");
            return false;
        }

        if (otrosCheckbox.checked) {
            if (!sanitizeInput(otrosEspecificar.value.trim())) {
                showToast("Por favor, especifica tu otra restricción.");
                otrosEspecificar.focus();
                return false;
            }
        }

        return true;
    }

    function validateStep4() {
        const goals = document.querySelectorAll('input[name="objetivos-mentales"]:checked');
        const obstacles = document.querySelectorAll('input[name="obstaculos-bienestar"]:checked');
        const sleep = document.querySelector('input[name="calidad-sueño"]:checked');

        if (goals.length === 0) {
            showToast("Por favor, selecciona al menos una meta de bienestar.");
            return false;
        }
        if (obstacles.length === 0) {
            showToast("Por favor, selecciona al menos un obstáculo.");
            return false;
        }
        if (!sleep) {
            showToast("Por favor, indica tu calidad de sueño.");
            return false;
        }
        return true;
    }

    function validateStep5() {
        // This is the last step before submit, but helpful if we had more steps
        const stress = document.querySelector('input[name="estres-ansiedad"]:checked');
        const routine = document.querySelector('input[name="rutina-diaria"]:checked');
        const lifestyle = document.querySelector('input[name="estilo-de-vida"]:checked');

        if (!stress) {
            showToast("Por favor, indica tu nivel de estrés.");
            return false;
        }
        if (!routine) {
            showToast("Por favor, indica cómo es tu rutina diaria.");
            return false;
        }
        if (!lifestyle) {
            showToast("Por favor, define tu estilo de vida.");
            return false;
        }
        return true;
    }

    function validateSection(index) {
        switch (index) {
            case 0: return validateStep1();
            case 1: return validateStep2();
            case 2: return validateStep3();
            case 3: return validateStep4();
            case 4: return validateStep5(); // Optional, mainly for Submit
            default: return true;
        }
    }


    // --- SCREEN LOADER ---
    window.addEventListener('load', function () {
        loader.style.display = 'none';
        body.classList.remove('no-scroll');
    });

    // --- NAVIGATION LOGIC ---

    // Track ongoing animations to prevent conflicts
    const animationHandlers = new Map();

    function toggleButton(button, show, animationClassIn = 'active') {
        const isHidden = button.classList.contains('hidden');
        const isDisplayNone = button.style.display === 'none' || getComputedStyle(button).display === 'none';

        if (show) {
            // Cancel any pending hide operation
            if (animationHandlers.has(button)) {
                button.removeEventListener('animationend', animationHandlers.get(button));
                animationHandlers.delete(button);
            }

            // If it's hidden or currently animating out (has hidden class)
            if (isDisplayNone || isHidden) {
                button.classList.remove('hidden');

                // Ensure it's visible for animation
                button.style.display = 'inline-block';

                // Trigger reflow to restart animation
                void button.offsetWidth;

                button.classList.add(animationClassIn);
            }
        } else {
            // If it's showing and not already hidden/animating out
            if (!isDisplayNone && !isHidden) {
                button.classList.remove(animationClassIn);
                button.classList.add('hidden');

                const handler = function () {
                    // Only hide if the button is still supposed to be hidden (class wasn't removed)
                    if (button.classList.contains('hidden')) {
                        button.style.display = 'none';
                        button.classList.remove('hidden'); // Reset class to rely on style.display next time
                    }
                    animationHandlers.delete(button);
                };

                // Register handler
                animationHandlers.set(button, handler);
                button.addEventListener('animationend', handler, { once: true });
            }
        }
    }

    function updateButtons() {
        // Prev Button Logic
        if (currentStep === 0) {
            toggleButton(prevButton, false);
        } else {
            toggleButton(prevButton, true);
        }

        // Next/Send Button Logic
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
                // VALIDATION CHECK
                if (validateSection(currentStep)) {
                    currentStep++;
                    showSection(currentStep);
                }
            } else {
                // Final step validation before submit logic (if handled by button)
                // usually submit is handled by form.onsubmit
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

    // Disable step-click navigation if validation fails for intermediate steps
    // Or allow backward navigation always, but forward only if valid
    steps.forEach((step, index) => {
        step.addEventListener("click", () => {
            // Only allow jumping back or staying, OR jumping forward only if current is valid
            // Simplified: prevent jumping forward via steps to avoid bypassing validation
            if (index < currentStep) {
                currentStep = index;
                showSection(currentStep);
            } else if (index > currentStep) {
                // Optional: Validate all steps in between? 
                // For now, strict: use Next button to proceed.
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
                // Proceed with submission (e.g., Firebase logic in mainform.js)
                // We dispatch a custom event or let mainform.js handle the actual data
                // For now, assume mainform.js listens to submit or we just alert success
                console.log("Form valid, submitting...");
                // Note: The submit logic likely resides in mainform.js using the same ID.
                // We just ensure validation passes here.

                // If mainform.js is handling the submission, it will also trigger.
                // We need to ensure we don't block it if valid.
            } else {
                e.stopImmediatePropagation(); // Stop other listeners if invalid
                return false;
            }
        });
    }

    // Attach click to send button to trigger manual validation if needed
    sendButton.addEventListener('click', (e) => {
        if (!validateSection(currentStep)) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
});
