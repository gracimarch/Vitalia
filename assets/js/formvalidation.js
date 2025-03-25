import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { auth, db } from './firebase.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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

    async function handleSubmit() {
        const email = $('#email').val();
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();

        if (password !== confirmPassword) {
            showToastMessages(["Las contraseñas no coinciden."]);
            return;
        }

        try {
            // Registrar usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user || !user.uid) {
                showToastMessages(["Error al obtener la información del usuario."]);
                return;
            }

            // Capturar los datos del formulario
            const userData = {
                email: email,
                firstName: $('#firstName').val(),
                lastName: $('#lastName').val(),
                country: $('#country').val(),
                age: $('#age').val(),
                gender: $("input[name='gender']:checked").val(),
                disability: $("input[name='disability']:checked").val(),
                physicalActivity: $("input[name='physicalActivity']:checked").val(),
                diet: $("input[name='diet']:checked").val(),
                restrictions: $("input[name='restriccion']:checked").map(function () { return this.value; }).get(),
                wellbeingGoals: $("input[name='objetivos-mentales']:checked").map(function () { return this.value; }).get(),
                obstacles: $("input[name='obstaculos-bienestar']:checked").map(function () { return this.value; }).get(),
                sleepQuality: $("input[name='calidad-sueño']:checked").val(),
                stressLevel: $("input[name='estres-ansiedad']:checked").val(),
                dailyRoutine: $("input[name='rutina-diaria']:checked").val(),
                lifestyle: $("input[name='estilo-de-vida']:checked").val(),
                createdAt: new Date()
            };

            // Guardar datos en Firestore, en una colección "users"
            await setDoc(doc(db, "users", user.uid), userData);

            showToastMessages(["Registro exitoso. ¡Bienvenido!"]);

            // Redirigir después de guardar en Firestore
            setTimeout(() => {
                window.location.href = "../mi-espacio.html";
            }, 2000);

        } catch (error) {
            console.error("Error en el registro:", error);
            showToastMessages(["Error al registrar usuario: " + error.message]);
        }
    }

    // Evento de envío del formulario
    $("#myForm").submit(function (event) {
        event.preventDefault();
        handleSubmit();
    });

    // Evento de botón "Enviar"
    $(".send-btn").click(function (event) {
        event.preventDefault();
        handleSubmit();
    });
});
