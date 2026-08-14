// Funzione per aggiornare il countdown
function updateCountdown() {
    const targetDate = new Date('January 1, 2025 00:00:00').getTime(); // Data di riferimento
    const now = new Date().getTime(); // Data corrente
    const timeLeft = targetDate - now; // Differenza tra le date

    if (timeLeft >= 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // Aggiorna il DOM con i valori
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
    } else {
        // Mostra un messaggio quando il countdown è terminato
        document.getElementById('countdown').innerHTML = "<h3>Buon Anno Nuovo!</h3>";
    }
}

// Aggiorna il countdown ogni secondo
setInterval(updateCountdown, 1000);

// GSAP Animazioni
gsap.fromTo(
    ".animated-title",
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 1.5, delay: 0.5 }
);

// Mostra/nasconde i dettagli nella sezione "Eventi"
document.getElementById('details-btn').addEventListener('click', function () {
    const eventDetails = document.getElementById('details-content');
    if (eventDetails) {
        if (eventDetails.classList.contains('hidden')) {
            eventDetails.classList.remove('hidden'); // Mostra i dettagli
            this.textContent = 'Nascondi dettagli';
        } else {
            eventDetails.classList.add('hidden'); // Nasconde i dettagli
            this.textContent = 'Mostra dettagli';
        }
    } else {
        console.error("Elemento con ID 'details-content' non trovato.");
    }
});

// Pulsante "Vedi il luogo"
document.getElementById('location-btn').addEventListener('click', function () {
    const url = 'https://maps.app.goo.gl/xs178HzJaQ5HbLrb8'; // Reindirizzamento al link specificato
    if (url) {
        window.location.href = url;
    } else {
        console.error("URL per 'Vedi il luogo' non definito.");
    }
});

// Pulsante "Iscriviti ora"
//document.getElementById('register-btn').addEventListener('click', function () {
//    const url = 'https://forms.gle/GHjFbTCCp6t7D77z9'; // Reindirizzamento al link specificato
//    if (url) {
//        window.location.href = url;
//    } else {
//        console.error("URL per 'Iscriviti ora' non definito.");
//    }
//});

// Mostra il popup
document.getElementById('register-btn').addEventListener('click', function () {
    document.getElementById('popup').classList.remove('hidden');
});

// Nascondi il popup
document.getElementById('close-popup').addEventListener('click', function () {
    document.getElementById('popup').classList.add('hidden');
});
