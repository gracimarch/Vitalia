import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { auth } from './firebase.js';

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
                    gravity: "top",
                    position: "center",
                    stopOnFocus: true,
                    style: {
                        background: "linear-gradient(to right, #9D43D9, #BD82B7)",
                        borderRadius: "15px",
                        maxWidth: "350px",
                        whiteSpace: "normal",
                        wordWrap: "break-word"
                    },
                    onClick: function () { }
                }).showToast();
            }, index * 2500);
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

    function calculatePoints() {
        let planPoints = {
            1: 0, // Plan para personas con movilidad reducida
            2: 0, // Plan para personas ocupadas
            3: 0, // Plan ecológico
            4: 0, // Plan espiritual
            5: 0, // Plan para personas activas
            6: 0, // Plan holístico general
            7: 0, // Plan para reducir estrés
            8: 0, // Plan para dormir mejor
            9: 0  // Plan para personas mayores
        };
    
        const disability = $('input[name="disability"]:checked').val();
        const age = parseInt($('#age').val(), 10);
        const qualityOfSleep = $('input[name="calidad-sueño"]:checked').val();
        const physicalActivity = $('input[name="physicalActivity"]:checked').val();
        const diet = $('input[name="diet"]:checked').val();
        const lifeStyle = $('input[name="estilo-de-vida"]:checked').val();
        const stressAnxiety = $('input[name="estres-ansiedad"]:checked').val();
        const objectives = {
            reduceStress: $('#reducir-estres').is(':checked'),
            improveSleep: $('#mejorar-sueno').is(':checked'),
            connectSpiritual: $('#conectar-espiritual').is(':checked')
        };
        const obstacles = {
            lackOfTime: $('#falta-tiempo').is(':checked'),
            physicalProblems: $('#problemas-fisicos').is(':checked'),
            fatigue: $('#cansancio-fatiga').is(':checked'),
            highSelfDemand: $('#autoexigencia').is(':checked'),
            olderPerson: $('#persona-mayor').is(':checked')
        };
    
        // Plan 1: Movilidad reducida
        if (disability === 'Sí') {
            planPoints[1] += 15;
        }
        if (obstacles.physicalProblems) {
            planPoints[1] += 10;
        }
    
        // Plan 2: Ocupados
        let busyCount = 0;
        if (obstacles.lackOfTime) busyCount += 1;
        if (physicalActivity === 'Soy una persona ocupada') busyCount += 1;
        if (lifeStyle === 'Soy una persona con una vida laboral intensa') busyCount += 1;
        if (busyCount >= 2) {
            planPoints[2] += 15;
        } else if (busyCount === 1) {
            planPoints[2] += 5;
        }
    
        // Plan 3: Ecológico
        if (diet === 'Vegetariana' || diet === 'Vegana') {
            planPoints[3] += 10;
            if (lifeStyle === 'Soy una persona enfocada en llevar un estilo de vida ecológico') {
                planPoints[3] += 15;
            }
        }
    
        // Plan 4: Espiritual
        if (objectives.connectSpiritual) {
            planPoints[4] += 10;
        }
        if (lifeStyle === 'Soy una persona espiritual') {
            planPoints[4] += 15;
        }
    
        // Plan 5: Activos
        if (physicalActivity === 'Activo' || physicalActivity === 'En transición') {
            planPoints[5] += 10;
            if (lifeStyle === 'Soy entusiasta del fitness') {
                planPoints[5] += 15;
            }
        }
    
        // Plan 6: General
        if (physicalActivity === 'Moderado') {
            planPoints[6] += 10;
        }
        if (objectives.improveSleep) {
            planPoints[6] += 10;
        }
        if (lifeStyle === 'Soy una persona centrada en el equilibrio personal') {
            planPoints[6] += 15;
        }
    
        // Plan 7: Estrés
        if (objectives.reduceStress) {
            planPoints[7] += 10;
        }
        if (obstacles.highSelfDemand) {
            planPoints[7] += 10;
        }
        if (stressAnxiety === 'Alto') {
            planPoints[7] += 15;
        }
    
        // Plan 8: Dormir mejor
        if (objectives.improveSleep) {
            planPoints[8] += 10;
        }
        if (obstacles.fatigue) {
            planPoints[8] += 10;
        }
        if (qualityOfSleep === 'Duermo menos de 5 horas' || qualityOfSleep === 'Tengo problemas para dormir') {
            planPoints[8] += 15;
        }
    
        // Plan 9: Tercera edad
        if (age > 65) {
            planPoints[9] += 10;
        }
        if (obstacles.olderPerson) {
            planPoints[9] += 10;
        }
        if (qualityOfSleep === 'Duermo menos de 5 horas' || qualityOfSleep === 'Tengo problemas para dormir') {
            planPoints[9] += 10;
        }
    
        return planPoints;
    }
    
    function assignPlan() {
        const points = calculatePoints();
        let selectedPlan = 6; // Por defecto
    
        let maxPoints = 0;
        for (const plan in points) {
            if (points[plan] > maxPoints) {
                maxPoints = points[plan];
                selectedPlan = plan;
            }
        }
    
        if (maxPoints > 0) {
            if (points[1] === maxPoints) selectedPlan = 1;
            else if (points[2] === maxPoints) selectedPlan = 2;
            else if (points[3] === maxPoints) selectedPlan = 3;
            else if (points[4] === maxPoints) selectedPlan = 4;
            else if (points[5] === maxPoints) selectedPlan = 5;
            else if (points[7] === maxPoints) selectedPlan = 7;
            else if (points[8] === maxPoints) selectedPlan = 8;
            else if (points[9] === maxPoints) selectedPlan = 9;
        }
    
        return selectedPlan;
    }    

    function handleSubmit() {
        if (validateForm()) {
            const email = $('input[type="email"]').val();
            const password = $('input[placeholder="Crea una contraseña"]').val();

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("Usuario registrado:", user);

                    const planAsignado = assignPlan();
                    window.location.href = `../mi-espacio.html`;
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;

                    if (errorCode === 'auth/email-already-in-use') {
                        alert("El correo electrónico ya está en uso. Por favor, use otro.");
                    } else {
                        alert("Error en el registro: " + errorMessage);
                    }
                });
        }
    }

    // Evento de envío del formulario
    $('.send-btn').click(function (event) {
        event.preventDefault();
        handleSubmit();
    });
});
