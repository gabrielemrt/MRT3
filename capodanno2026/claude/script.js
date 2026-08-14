// Neve animata
function createSnow() {
    const snowContainer = document.getElementById('snow');
    const snowflakeCount = 50;

    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄';
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = Math.random() * 3 + 7 + 's';
        snowflake.style.animationDelay = Math.random() * 5 + 's';
        snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
        snowflake.style.opacity = Math.random() * 0.6 + 0.4;
        snowContainer.appendChild(snowflake);
    }
}
createSnow();

// Countdown
function updateCountdown() {
    const eventDate = new Date('2025-12-31T21:30:00').getTime();
    const now = new Date().getTime();
    const distance = eventDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

// Easter Eggs - Messaggi aggiornati senza sconti economici
let starsFound = 0;
const totalStars = 3;
const starMessages = [
    "🌟 Prima stella trovata! Accesso prioritario alla zona VIP! Continua a cercare le altre stelle...",
    "✨ Seconda stella scoperta! Ti riserviamo il miglior tavolo della serata! Una stella rimasta...",
    "🎊 INCREDIBILE! Hai trovato tutte le stelle! Menzione speciale durante l'evento + sorpresa esclusiva alla mezzanotte! Ricordati di comunicarlo al check-in!"
];

document.querySelectorAll('.hidden-star').forEach((star, index) => {
    star.addEventListener('click', function () {
        if (!this.classList.contains('found')) {
            this.classList.add('found');
            this.style.display = 'none';
            starsFound++;
            showModal(starMessages[starsFound - 1]);
            createSparkles(event.clientX, event.clientY);
        }
    });
});

// Easter Egg sul logo - aggiornato
let logoClicks = 0;
document.getElementById('mainLogo').addEventListener('click', function () {
    logoClicks++;
    if (logoClicks === 5) {
        showModal("🎩 Hai scoperto il segreto del logo! Accesso esclusivo alla playlist personalizzata dell'evento + una dedica speciale dal DJ!");
        this.style.animation = 'shimmer 0.5s ease-in-out infinite';
    }
});

// Modal functions
function showModal(text) {
    document.getElementById('modalText').textContent = text;
    document.getElementById('easterEggModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('easterEggModal').style.display = 'none';
}

// Sparkles effect
function createSparkles(x, y) {
    for (let i = 0; i < 10; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        sparkle.innerHTML = '✨';
        sparkle.style.left = x + (Math.random() - 0.5) * 100 + 'px';
        sparkle.style.top = y + (Math.random() - 0.5) * 100 + 'px';
        sparkle.style.fontSize = Math.random() * 20 + 10 + 'px';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }
}

// Effetti hover sulle card
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-10px) rotate(' + (Math.random() * 4 - 2) + 'deg)';
    });
    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) rotate(0deg)';
    });
});

// Cursor effects - sparkles al movimento del mouse
document.addEventListener('mousemove', function (e) {
    if (Math.random() > 0.95) {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.style.position = 'fixed';
        sparkle.style.left = e.clientX + 'px';
        sparkle.style.top = e.clientY + 'px';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.fontSize = '10px';
        sparkle.style.animation = 'sparkleAnim 1s ease-out forwards';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }
});