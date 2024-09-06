document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const submitButton = document.querySelector(".send-btn");

    // Función para validar los campos del formulario
    function validateForm() {
        let isValid = true;
        const errorMessages = new Set(); // Para almacenar mensajes de error únicos
        const fields = form.querySelectorAll("input[required], select[required], textarea[required]");
        const emailInputs = form.querySelectorAll("input[type='email']");
        const passwordInputs = form.querySelectorAll("input[type='password']");
        const checkboxes = form.querySelectorAll("input[type='checkbox'][required]");
        const radios = form.querySelectorAll("input[type='radio'][required]");

        // Reiniciar los errores anteriores
        fields.forEach(field => field.classList.remove('error'));
        emailInputs.forEach(emailInput => emailInput.classList.remove('error'));
        passwordInputs.forEach(passwordInput => passwordInput.classList.remove('error'));

        // Verificar si los campos están vacíos
        fields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                errorMessages.add("Todos los campos de texto deben ser completados.");
                isValid = false;
            }
        });

        // Verificar el formato del correo
        emailInputs.forEach(emailInput => {
            if (!validateEmail(emailInput.value)) {
                emailInput.classList.add('error');
                errorMessages.add("Ingrese una dirección de correo electrónico válida.");
                isValid = false;
            }
        });

        // Verificar la contraseña
        passwordInputs.forEach(passwordInput => {
            if (!validatePassword(passwordInput.value)) {
                passwordInput.classList.add('error');
                errorMessages.add("La contraseña debe tener mínimo 6 caracteres y contener al menos una letra mayúscula, una minúscula y un número.");
                isValid = false;
            }
        });

        // Verificar que se haya seleccionado al menos una casilla de verificación
        const checkedCheckboxes = Array.from(checkboxes).some(checkbox => checkbox.checked);
        if (!checkedCheckboxes) {
            errorMessages.add("Seleccione al menos una opción en las casillas de verificación.");
            isValid = false;
        }

        // Verificar que se haya seleccionado una opción en los botones de radio
        const radioGroups = new Set(Array.from(radios).map(radio => radio.name));
        radioGroups.forEach(name => {
            if (!document.querySelector(`input[name="${name}"]:checked`)) {
                errorMessages.add("Seleccione una opción en los grupos de botones.");
                isValid = false;
            }
        });

        // Mostrar los mensajes de error o el mensaje de éxito
        if (!isValid) {
            alert(Array.from(errorMessages).join('\n'));
        } else {
            alert("Formulario enviado correctamente.");
            setTimeout(() => location.reload(), 0);
        }

        return isValid;
    }

    // Validar formato de correo electrónico
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Validar contraseña (al menos una mayúscula, una minúscula y un número)
    function validatePassword(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        return regex.test(password);
    }

    // Manejar el envío del formulario al hacer clic en el botón
    submitButton.addEventListener("click", (event) => {
        if (!validateForm()) {
            event.preventDefault();
        }
    });

    // Opcionalmente, manejar el envío del formulario mediante submit del formulario
    form.addEventListener("submit", (event) => {
        if (!validateForm()) {
            event.preventDefault();
        }
    });
});
