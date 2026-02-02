
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { auth } from '../auth/firebase.js';
import './formvalidation.js';

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // El usuario está autenticado
        console.log('Usuario autenticado')
    } else {
        // El usuario no está autenticado
        console.log('Usuario no autenticado')
    }
});