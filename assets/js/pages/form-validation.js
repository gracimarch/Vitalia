export function sanitizeInput(str) {
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

export function showToast(message, type = "error") {
    // Limitar a un máximo de 3 toasts en pantalla a la vez
    const existingToasts = document.querySelectorAll('.toastify');
    if (existingToasts.length >= 3) {
        // Eliminamos los más antiguos para dejar espacio (nos quedamos máximo con 2 antes de agregar uno nuevo)
        for (let i = 0; i <= existingToasts.length - 3; i++) {
            existingToasts[i].remove();
        }
    }

    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        className: type === "error" ? "toast-error" : "toast-success",
        style: {
            background: "transparent",
            boxShadow: "none",
        },
    }).showToast();
}

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
        showToast("Por favor, ingresa una edad válida.");
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
    const otrosCheckbox = document.getElementById('otros');
    const otrosEspecificar = document.getElementById('otros-especificar');

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

    if (otrosCheckbox && otrosCheckbox.checked) {
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

export function validateSection(index) {
    switch (index) {
        case 0: return validateStep1();
        case 1: return validateStep2();
        case 2: return validateStep3();
        case 3: return validateStep4();
        case 4: return validateStep5();
        default: return true;
    }
}
