/**
 * Component: Daily Quote
 * Displays a random wellness quote and handles social sharing.
 */

document.addEventListener('DOMContentLoaded', function () {
    // --- Configuration ---
    const quoteElementId = "share-text";
    const phrases = [
        "Estás exactamente donde necesitas estar en este momento",
        "Confía en el proceso, estás creciendo cada día",
        "Hoy es el mejor día para cuidar de ti",
        "Cada pequeño avance es un gran logro en tu camino",
        "La paz interior se encuentra en el momento presente",
        "Donde estás ahora es justo donde necesitas estar",
        "La calma que buscas está dentro de ti",
        "Cada respiro es una nueva oportunidad para empezar de nuevo",
        "Eres más fuerte de lo que crees, sigue adelante",
        "Escucha a tu cuerpo y mente, ellos saben lo que necesitas",
        "Tu bienestar es una prioridad, no una opción",
        "El viaje hacia la paz interior comienza ahora",
        "Abraza el presente, es un regalo para tu bienestar",
        "Hoy elige cuidarte con amor y paciencia",
        "La gratitud transforma el momento presente en suficiente",
        "Estás creando un futuro lleno de bienestar y equilibrio",
        "El equilibrio que buscas comienza desde dentro",
        "Hoy es el día perfecto para reconectar contigo",
        "Cada día es una nueva oportunidad para nutrir tu mente y tu cuerpo",
        "Tu bienestar es una inversión en tu felicidad futura"
    ];

    const quoteElement = document.getElementById(quoteElementId);

    // Check if element exists before runnning
    if (!quoteElement) return;

    // --- Initialization ---
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    quoteElement.textContent = `"${randomPhrase}"`;

    // --- Helpers ---
    function getDisplayedPhrase() {
        return quoteElement.textContent;
    }

    function share(urlTemplate) {
        const currentPhrase = getDisplayedPhrase();
        const fullMessage = `${currentPhrase} Frase del día de Vitalia, únete en https://vitalia-selfcare.vercel.app/ 🧘‍♀️🌷`;
        const url = urlTemplate.replace('{TEXT}', encodeURIComponent(fullMessage));
        window.open(url, '_blank');
    }

    // --- Event Listeners: Social Sharing ---
    const linkedinBtn = document.getElementById('shareLinkedIn');
    if (linkedinBtn) {
        linkedinBtn.addEventListener('click', () => {
            // LinkedIn format is slightly different for sharing urls vs text, standard share url used here
            const url = `https://www.linkedin.com/shareArticle?mini=true&url=https://vitalia-selfcare.vercel.app/&title=${encodeURIComponent(getDisplayedPhrase() + " - Frase del día Vitalia")}`;
            window.open(url, '_blank');
        });
    }

    const twitterBtn = document.getElementById('shareTwitter');
    if (twitterBtn) {
        twitterBtn.addEventListener('click', () => {
            share('https://twitter.com/intent/tweet?text={TEXT}');
        });
    }

    const whatsappBtn = document.getElementById('shareWhatsApp');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            share('https://api.whatsapp.com/send?text={TEXT}');
        });
    }
});
