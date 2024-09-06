document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const submitButton = document.querySelector(".send-btn");

    // Función para validar los campos del formulario
    function validateForm() {
        let isValid = true;
        const errorMessages = new Set();
        const fields = form.querySelectorAll("input[required], select[required], textarea[required]");
        const emailInputs = form.querySelectorAll("input[type='email']");
        const passwordInputs = form.querySelectorAll("input[type='password']");
        const checkboxes = form.querySelectorAll("input[type='checkbox'][required]");
        const radios = form.querySelectorAll("input[type='radio'][required]");

        fields.forEach(field => field.classList.remove('error'));
        emailInputs.forEach(emailInput => emailInput.classList.remove('error'));
        passwordInputs.forEach(passwordInput => passwordInput.classList.remove('error'));

        fields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                errorMessages.add("Todos los campos de texto deben ser completados.");
                isValid = false;
            }
        });

        emailInputs.forEach(emailInput => {
            if (!validateEmail(emailInput.value)) {
                emailInput.classList.add('error');
                errorMessages.add("Ingrese una dirección de correo electrónico válida.");
                isValid = false;
            }
        });

        passwordInputs.forEach(passwordInput => {
            if (!validatePassword(passwordInput.value)) {
                passwordInput.classList.add('error');
                errorMessages.add("La contraseña debe tener mínimo 6 caracteres y contener al menos una letra mayúscula, una minúscula y un número.");
                isValid = false;
            }
        });

        const checkedCheckboxes = Array.from(checkboxes).some(checkbox => checkbox.checked);
        if (!checkedCheckboxes) {
            errorMessages.add("Seleccione al menos una opción en las casillas de verificación.");
            isValid = false;
        }

        const radioGroups = new Set(Array.from(radios).map(radio => radio.name));
        radioGroups.forEach(name => {
            if (!document.querySelector(`input[name="${name}"]:checked`)) {
                errorMessages.add("Seleccione una opción en los grupos de botones.");
                isValid = false;
            }
        });

        if (!isValid) {
            alert(Array.from(errorMessages).join('\n'));
        } else {
            alert("Formulario enviado correctamente.");
        }

        return isValid;
    }

    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function validatePassword(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        return regex.test(password);
    }

    // Función para capturar los datos del formulario
    function captureFormData() {
        const formData = {};
        const inputs = form.querySelectorAll("input, select, textarea");

        inputs.forEach(input => {
            if (input.type === "checkbox" || input.type === "radio") {
                if (input.checked) {
                    if (!formData[input.name]) {
                        formData[input.name] = [];
                    }
                    formData[input.name].push(input.value);
                }
            } else {
                formData[input.name || input.id] = input.value.trim();
            }
        });

        console.log("Datos del formulario:", formData);
    }

    submitButton.addEventListener("click", (event) => {
        event.preventDefault();  // Evitar la recarga de la página
        if (validateForm()) {
            const data = captureFormData();
        }
    });
});
