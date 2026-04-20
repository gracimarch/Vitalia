import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { auth, db } from '../auth/firebase.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { showToast } from './form-validation.js';

const API_BASE_URL = "https://vitalia-core-api.onrender.com";

let isSubmitting = false;

export async function handleSubmit() {
    if (isSubmitting) return;

    const submitBtn = document.querySelector('.send-btn');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';

    const email = $('#email').val();
    const password = $('#password').val();
    const confirmPassword = $('#confirmPassword').val();

    if (password !== confirmPassword) {
        showToast("Las contraseñas no coinciden.", "error");
        return;
    }

    // --- Loading state ON ---
    isSubmitting = true;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="btn-spinner"></span>
            Creando tu cuenta...
        `;
    }

    try {
        // Registrar usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user || !user.uid) {
            showToast("Error al obtener la información del usuario.", "error");
            resetBtn(submitBtn, originalBtnText);
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

        showToast("Generando tus recomendaciones con IA, esto puede tardar un momento...", "success");

        // Generar recomendaciones personalizadas en el backend
        try {
            console.log("⏳ Solicitando generación de score en la API para:", user.uid);
            const scoreRes = await fetch(`${API_BASE_URL}/api/v1/scores/generate`, {
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
            const scoreText = await scoreRes.text();
            console.log("-----------------------------------------");
            console.log("📡 DEBUGGING API REGISTER");
            console.log("API Score Status:", scoreRes.status);
            console.log("API Score Body:", scoreText);
            console.log("-----------------------------------------");

            if (!scoreRes.ok) {
                console.warn("⚠️ La API devolvió error al intentar crear el score. Revisa tu backend.");
            }
        } catch (scoreError) {
            // No bloqueamos el registro si falla la generación de score
            console.warn("No se pudieron generar las recomendaciones (Error de RED o Timeout):", scoreError);
        }

        showToast("¡Registro completado! Entrando a tu espacio...", "success");

        // Redirigir después de guardar en Firestore
        setTimeout(() => {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            window.location.href = isLocal ? '/pages/mi-espacio.html' : '/mi-espacio';
        }, 1500);

    } catch (error) {
        console.error("Error en el registro:", error);

        let errorMsg = error.message;
        if (error.code === 'auth/email-already-in-use') {
            errorMsg = "El correo electrónico ya está en uso.";
        } else if (error.code === 'auth/weak-password') {
            errorMsg = "La contraseña debe tener al menos 6 caracteres.";
        }

        showToast("Error al registrar: " + errorMsg, "error");
        resetBtn(submitBtn, originalBtnText);
    }
}

function resetBtn(btn, text) {
    isSubmitting = false;
    if (btn) {
        btn.disabled = false;
        btn.textContent = text;
    }
}
