document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const submitButton = document.querySelector(".send-btn");

    // Function to validate form fields
    function validateForm() {
        let isValid = true;
        const errorMessages = new Set(); // To store unique error messages
        const fields = form.querySelectorAll("input[required], select[required], textarea[required]");
        const emailInputs = form.querySelectorAll("input[type='email']");
        const passwordInputs = form.querySelectorAll("input[type='password']");
        const checkboxes = form.querySelectorAll("input[type='checkbox'][required]");
        const radios = form.querySelectorAll("input[type='radio'][required]");

        // Reset previous errors
        fields.forEach(field => field.classList.remove('error'));
        emailInputs.forEach(emailInput => emailInput.classList.remove('error'));
        passwordInputs.forEach(passwordInput => passwordInput.classList.remove('error'));

        // Check for empty required fields
        fields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                errorMessages.add("Todos los campos obligatorios deben ser completados.");
                isValid = false;
            }
        });

        // Check for email format
        emailInputs.forEach(emailInput => {
            if (!validateEmail(emailInput.value)) {
                emailInput.classList.add('error');
                errorMessages.add("Ingrese una dirección de correo electrónico válida.");
                isValid = false;
            }
        });

        // Check for password validity
        passwordInputs.forEach(passwordInput => {
            if (!validatePassword(passwordInput.value)) {
                passwordInput.classList.add('error');
                errorMessages.add("La contraseña debe contener al menos una letra mayúscula, una minúscula y un número.");
                isValid = false;
            }
        });

        // Check for checked checkboxes (only one checkbox needs to be checked)
        const checkedCheckboxes = Array.from(checkboxes).some(checkbox => checkbox.checked);
        if (!checkedCheckboxes) {
            errorMessages.add("Seleccione al menos una opción en las casillas de verificación.");
            isValid = false;
        }

        // Check for selected radio buttons
        const radioGroups = new Set(Array.from(radios).map(radio => radio.name));
        radioGroups.forEach(name => {
            if (!document.querySelector(`input[name="${name}"]:checked`)) {
                errorMessages.add("Seleccione una opción en los grupos de botones.");
                isValid = false;
            }
        });

        // Display the error messages or success message
        if (!isValid) {
            alert(Array.from(errorMessages).join('\n'));
        } else {
            alert("Formulario enviado correctamente.");
            setTimeout(() => location.reload(), 0); // Reload the page
        }

        return isValid;
    }

    // Validate email format
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Validate password (at least one uppercase, one lowercase, and one number)
    function validatePassword(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        return regex.test(password);
    }

    // Handle form submit
    submitButton.addEventListener("click", (event) => {
        if (!validateForm()) {
            event.preventDefault(); // Prevent form submission if validation fails
        }
    });

    // Optionally, handle form submit via form submission as well
    form.addEventListener("submit", (event) => {
        if (!validateForm()) {
            event.preventDefault(); // Prevent form submission if validation fails
        }
    });
});
