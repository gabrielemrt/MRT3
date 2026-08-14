let eggClicks = 0;

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("stroke")) {
        eggClicks++;

        if (eggClicks === 5) {
            alert("🎁 Complimenti! Hai trovato l’Easter Egg. Alla festa avrai un drink premium omaggio!");
        }
    }
});
