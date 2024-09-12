$(document).ready(function () {
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function showToastMessages(messages) {
        messages.forEach((message, index) => {
            setTimeout(() => {
                Toastify({
                    text: message,
                    duration: 3000,
                    newWindow: true,
                    close: true,
                    gravity: "top", // `top` or `bottom`
                    position: "center", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        background: "linear-gradient(to right, #9D43D9, #BD82B7)",
                        borderRadius: "15px",
                        maxWidth: "350px",
                        whiteSpace: "normal",
                        wordWrap: "break-word"
                    },
                    onClick: function () { } // Callback after click
                }).showToast();
            }, index * 3500); // Se muestra cada mensaje con 3.5 segundos de diferencia
        });
    }

    function validateForm() {
        const errorMessages = [];

        // Validación de email
        const email = $('input[type="email"]').val();
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (email.length > 254 || !emailPattern.test(email)) {
            errorMessages.push("Por favor, ingrese un correo electrónico válido que no exceda los 254 caracteres.");
        }

        const forbiddenDomains = ["mailinator.com", "tempmail.com", "10minutemail.com"];
        const domain = email.split('@')[1];
        if (forbiddenDomains.includes(domain)) {
            errorMessages.push("El dominio de correo electrónico que estás utilizando no está permitido.");
        }

        // Validación de contraseña
        const password = $('input[placeholder="Crea una contraseña"]').val();
        const confirmPassword = $('input[placeholder="Repite tu contraseña"]').val();
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (password === "" || confirmPassword === "" || password !== confirmPassword) {
            errorMessages.push("Las contraseñas no coinciden o no se han completado.");
        }
        if (!passwordPattern.test(password)) {
            errorMessages.push("La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial.");
        }

        // Validación de aceptar términos
        const acceptTermsChecked = $('#accept-terms input[type="checkbox"]').is(":checked");
        if (!acceptTermsChecked) {
            errorMessages.push("Debe aceptar los términos y condiciones para continuar.");
        }

        // Validación de nombre y apellido
        const firstName = sanitizeInput($('#firstName').val());
        const lastName = sanitizeInput($('#lastName').val());
        const nombrePattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]{1,30}$/;
        if (!nombrePattern.test(firstName) || !nombrePattern.test(lastName) || firstName.length > 30 || lastName.length > 30) {
            errorMessages.push("Por favor, ingrese un nombre y apellido válidos (máximo 30 caracteres).");
        }

        // Validación de país seleccionado
        const pais = $('select.form-control').val();
        if (!pais) {
            errorMessages.push("Por favor, seleccione un país.");
        }

        // Validación de edad
        const edad = parseInt($('input[type="number"]').val(), 10);
        if (edad < 13 || edad > 100 || isNaN(edad)) {
            errorMessages.push("Por favor, ingrese una edad válida (entre 13 y 100 años).");
        }

        // Validación de preguntas con al menos una opción marcada
        const radioGroups = $('input[type="radio"]').map(function () {
            return $(this).attr('name');
        }).get();
        const uniqueRadioGroups = [...new Set(radioGroups)];
        let questionsUnchecked = false;
        for (let group of uniqueRadioGroups) {
            if (!$(`input[name="${group}"]:checked`).length) {
                questionsUnchecked = true;
                break;
            }
        }
        if (questionsUnchecked) {
            errorMessages.push("Por favor, asegúrese de responder todas las preguntas.");
        }

        // Mostrar todos los mensajes de error
        if (errorMessages.length > 0) {
            showToastMessages(errorMessages);
            return false;
        }

        return true;
    }

    function handleSubmit() {
        if (validateForm()) {
            // Si el formulario es válido, redirige al usuario
            window.location.href = '../index.html'; // Redirige a la página principal
        }
    }

    // Evento click en el botón de enviar
    $('.send-btn').click(function (event) {
        event.preventDefault();
        handleSubmit();
    });
});
