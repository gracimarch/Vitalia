// Selección del formulario
const form = document.getElementById('myForm');

// Función para validar los campos del formulario
function validateForm() {
    let isValid = true;
    const errorMessages = new Set();
    const fields = form.querySelectorAll("input[required], select[required], textarea[required]");
    const emailInputs = form.querySelectorAll("input[type='email']");
    const passwordInputs = form.querySelectorAll("input[type='password']");
    const checkboxes = form.querySelectorAll("input[type='checkbox'][required]");
    const radios = form.querySelectorAll("input[type='radio'][required]");

    // Limpiar errores
    fields.forEach(field => field.classList.remove('error'));
    emailInputs.forEach(emailInput => emailInput.classList.remove('error'));
    passwordInputs.forEach(passwordInput => passwordInput.classList.remove('error'));

    // Validar campos requeridos
    fields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            errorMessages.add("— Todos los campos de texto deben ser completados.");
            isValid = false;
        }
    });

    // Validar correos electrónicos
    emailInputs.forEach(emailInput => {
        if (!validateEmail(emailInput.value)) {
            emailInput.classList.add('error');
            errorMessages.add("— Ingrese una dirección de correo electrónico válida.");
            isValid = false;
        }
    });

    // Validar contraseñas
    passwordInputs.forEach(passwordInput => {
        if (!validatePassword(passwordInput.value)) {
            passwordInput.classList.add('error');
            errorMessages.add("— La contraseña debe tener al menos una letra mayúscula, una minúscula y un número.");
            isValid = false;
        }
    });

    if (passwordInputs.length > 1 && passwordInputs[0].value !== passwordInputs[1].value) {
        passwordInputs[1].classList.add('error');
        errorMessages.add("— Las contraseñas no coinciden.");
        isValid = false;
    }

    // Validar casillas de verificación
    const checkedCheckboxes = Array.from(checkboxes).some(checkbox => checkbox.checked);
    if (!checkedCheckboxes) {
        errorMessages.add("— Seleccione al menos una opción en las casillas de verificación.");
        isValid = false;
    }

    // Validar botones de opción
    const radioGroups = new Set(Array.from(radios).map(radio => radio.name));
    radioGroups.forEach(name => {
        if (!document.querySelector(`input[name="${name}"]:checked`)) {
            errorMessages.add("— Seleccione una opción en los grupos de botones.");
            isValid = false;
        }
    });

    // Validar términos y condiciones
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox && !termsCheckbox.checked) {
        errorMessages.add("— Debe aceptar los términos y condiciones.");
        isValid = false;
    }

    if (!isValid) {
        alert(Array.from(errorMessages).join('\n'));
    } else {
        // Enviar datos a la consola
        const formData = new FormData(form);
        const formDataObject = Object.fromEntries(formData.entries());
        console.log("Formulario enviado con éxito. Datos:", formDataObject);

        // Asegurarse de que la alerta se muestre solo una vez
        if (!form.dataset.submitted) {
            alert("Formulario enviado correctamente.");
            form.dataset.submitted = "true";
        }
    }
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(password);
}

// Añadir eventos a los botones
document.querySelector('.send-btn').addEventListener('click', (event) => {
    event.preventDefault(); // Evitar que el formulario se envíe automáticamente
    validateForm();
});

// Restablecer el estado de envío al cambiar el formulario
form.addEventListener('reset', () => {
    form.dataset.submitted = "false";
});
