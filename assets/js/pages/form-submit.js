import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { auth, db } from '../auth/firebase.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { showToast } from './form-validation.js';

const API_BASE_URL = "https://vitalia-core-api.onrender.com";

export async function handleSubmit() {
    const email = $('#email').val();
    const password = $('#password').val();
    const confirmPassword = $('#confirmPassword').val();

    if (password !== confirmPassword) {
        showToast("Las contraseñas no coinciden.", "error");
        return;
    }

    try {
        // Registrar usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user || !user.uid) {
            showToast("Error al obtener la información del usuario.", "error");
            return;
        }

        // Capturar los datos del formulario
        const userData = {
            email: email,
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            country: $('#country').val(),
            age: parseInt($('#age').val(), 10),
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

        // Si se seleccionó "Otros", agregar el valor especificado
        const otrosEspecificar = $('#otros-especificar').val();
        if ($('#otros').is(':checked') && otrosEspecificar) {
            userData.otherRestrictions = otrosEspecificar;
        }

        // Guardar datos en Firestore, en la colección "users"
        await setDoc(doc(db, "users", user.uid), userData);

        // Generar recomendaciones personalizadas en el backend
        try {
            await fetch(`${API_BASE_URL}/api/v1/scores/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    disability: userData.disability,
                    physicalActivity: userData.physicalActivity,
                    diet: userData.diet,
                    restrictions: userData.restrictions,
                    wellbeingGoals: userData.wellbeingGoals,
                    obstacles: userData.obstacles,
                    sleepQuality: userData.sleepQuality,
                    stressLevel: userData.stressLevel,
                    dailyRoutine: userData.dailyRoutine,
                    lifestyle: userData.lifestyle,
                }),
            });
        } catch (scoreError) {
            // No bloqueamos el registro si falla la generación de score
            console.warn("No se pudieron generar las recomendaciones:", scoreError);
        }

        showToast("Registro exitoso. ¡Bienvenido!", "success");

        // Redirigir después de guardar en Firestore
        setTimeout(() => {
            window.location.href = "../mi-espacio.html";
        }, 2000);

    } catch (error) {
        console.error("Error en el registro:", error);

        let errorMsg = error.message;
        if (error.code === 'auth/email-already-in-use') {
            errorMsg = "El correo electrónico ya está en uso.";
        } else if (error.code === 'auth/weak-password') {
            errorMsg = "La contraseña es muy débil.";
        }

        showToast("Error al registrar usuario: " + errorMsg, "error");
    }
}
