$(document).ready(function() {
    function validateForm() {
        // Validación de email
        const email = $('input[type="email"]').val();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert("Por favor, ingrese un correo electrónico válido.");
            return false;
        }

        // Validación de nombre y apellido
        const firstName = $('#firstName').val();
        const lastName = $('#lastName').val();
        const nombrePattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]{1,30}$/; // Validación para nombres con máximo 30 caracteres
        if (!nombrePattern.test(firstName) || !nombrePattern.test(lastName)) {
            alert("Por favor, ingrese un nombre y apellido válidos (máximo 30 caracteres).");
            return false;
        }

        // Validación de edad
        const edad = parseInt($('input[type="number"]').val(), 10);
        if (edad < 13 || edad > 100 || isNaN(edad)) {
            alert("Por favor, ingrese una edad válida (entre 13 y 100 años).");
            return false;
        }

        // Validación de país seleccionado
        const pais = $('select.form-control').val();
        if (!pais) {
            alert("Por favor, seleccione un país.");
            return false;
        }

        // Validación de aceptar términos
        const acceptTermsChecked = $('#accept-terms input[type="checkbox"]').is(":checked");
        if (!acceptTermsChecked) {
            alert("Debe aceptar los términos y condiciones para continuar.");
            return false;
        }

        // Validación de checkboxes
        const validateCheckboxGroup = (name) => {
            const checkedCount = $(`input[name="${name}"]:checked`).length;
            return checkedCount > 0;
        };

        if (!validateCheckboxGroup('objetivos-mentales') || !validateCheckboxGroup('obstaculos-bienestar')) {
            alert("Por favor, asegúrese de responder todas las preguntas.");
            return false;
        }

        // Validación de preguntas con al menos una opción marcada
        const radioGroups = $('input[type="radio"]').map(function() {
            return $(this).attr('name');
        }).get();

        // Elimina duplicados para verificar cada grupo solo una vez
        const uniqueRadioGroups = [...new Set(radioGroups)];

        // Verifica si cada grupo tiene al menos una opción marcada
        for (let group of uniqueRadioGroups) {
            if (!$(`input[name="${group}"]:checked`).length) {
                alert("Por favor, asegúrese de responder todas las preguntas.");
                return false;
            }
        }

        // Validación de contraseña y repetición de contraseña
        const password = $('input[placeholder="Crea una contraseña"]').val();
        const confirmPassword = $('input[placeholder="Repite tu contraseña"]').val();
        if (password === "" || confirmPassword === "" || password !== confirmPassword) {
            alert("Las contraseñas no coinciden o no se han completado.");
            return false;
        }

        // Recoge los datos del formulario
        const formData = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            edad: edad,
            pais: pais,
            objetivosMentales: $('input[name="objetivos-mentales"]:checked').map(function() {
                return $(this).val();
            }).get(),
            obstaculosBienestar: $('input[name="obstaculos-bienestar"]:checked').map(function() {
                return $(this).val();
            }).get(),
            respuestasRadio: uniqueRadioGroups.reduce((acc, group) => {
                acc[group] = $(`input[name="${group}"]:checked`).val();
                return acc;
            }, {}),
            password: password
        };

        // Imprime los datos en la consola
        console.log("Datos del formulario:", formData);

        // Muestra alerta de éxito
        alert("Formulario enviado correctamente.");

        // Borra los datos del formulario
        $('input[type="text"], input[type="email"], input[type="number"], input[type="password"]').val('');
        $('select.form-control').val('');
        $('input[type="checkbox"]').prop('checked', false);
        $('input[type="radio"]').prop('checked', false);

        return false; // Evita el envío del formulario
    }

    // Evento click en el botón de enviar
    $('.send-btn').click(function(event) {
        event.preventDefault(); // Previene el envío del formulario
        if (validateForm()) {
        }
    });
});
