document.addEventListener("DOMContentLoaded", function() {
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

    // No permitir que el usuario haga scroll mientras esté la pantalla de carga
    window.addEventListener('load', function () {
        loader.style.display = 'none';
        body.classList.remove('no-scroll');
    });

    // Actualizar los botones de navegación
    function updateButtons() {
        if (currentStep === 0) {
            if (prevButton.classList.contains('active')) {
                prevButton.classList.add('hidden');
                prevButton.addEventListener('animationend', function hideButton() {
                    prevButton.style.display = 'none';
                    prevButton.classList.remove('active', 'hidden');
                    prevButton.removeEventListener('animationend', hideButton);
                }, { once: true });
            }
        } else {
            if (!prevButton.classList.contains('active')) {
                prevButton.style.display = 'inline-block';
                prevButton.classList.add('active');
                prevButton.classList.remove('hidden');
            }
        }

        // Al llegar a la última sección, ocultar el botón Continuar y mostrar el botón Enviar
        if (currentStep === sections.length - 1) {
            nextButton.classList.add('hidden');
            sendButton.classList.remove('hidden');
        } else {
            nextButton.classList.remove('hidden');
            sendButton.classList.add('hidden');
        }
    }

    // Función para mostrar la sección correspondiente según el índice
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

        // Actualizar el estado de los pasos (marcar el paso actual como activo)
        steps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });

        updateButtons();
    }

    // Manejar el clic en los botones Siguiente
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

    // Manejar el clic en los botones Anterior
    document.querySelectorAll(".prev-btn").forEach(button => {
        button.addEventListener("click", () => {
            if (currentStep > 0) {
                prevButton.classList.remove('active');
                currentStep--;
                showSection(currentStep);
            }
        });
    });

    // Permitir que el usuario navegue entre las secciones haciendo clic en los pasos
    steps.forEach((step, index) => {
        step.addEventListener("click", () => {
            currentStep = index;
            showSection(currentStep);
        });
    });

    // Mostrar la primera sección al cargar la página y actualizar los botones
    showSection(currentStep);
    updateButtons();

    // Inicia deshabilitado el campo de texto
    otrosEspecificar.disabled = true;

    // Habilitar o deshabilitar el campo de texto cuando se seleccione o deseleccione "Otros"
    otrosCheckbox.addEventListener('change', function () {
        if (otrosCheckbox.checked) {
            otrosEspecificar.disabled = false;
            otrosEspecificar.focus();
        } else {
            otrosEspecificar.value = "";
            otrosEspecificar.disabled = true;
        }
    });

    // Validación: Si se selecciona "Ninguna", se desmarcan las demás opciones, y viceversa
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
});
