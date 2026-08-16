const PHOTO_DISPLAY_TIME = 8000; // 8 secondi
const photoDisplay = document.getElementById('photoDisplay');
const logoScreen = document.getElementById('logoScreen');
const currentPhoto = document.getElementById('currentPhoto');

let photoQueue = [];
let isDisplaying = false;
let displayedPhotos = new Set();
let ws = null;

// Connessione WebSocket
function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('Connessione WebSocket a:', wsUrl);
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('✅ WebSocket connesso');
        loadInitialPhotos();
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('📩 Messaggio ricevuto:', data);
            
            if (data.type === 'new_photo') {
                addToQueue(data.data);
            }
        } catch (error) {
            console.error('❌ Errore parsing messaggio:', error);
        }
    };
    
    ws.onclose = () => {
        console.log('⚠️ WebSocket disconnesso, riconnessione in 3s...');
        setTimeout(connectWebSocket, 3000);
    };
    
    ws.onerror = (error) => {
        console.error('❌ Errore WebSocket:', error);
    };
}

// Carica foto iniziali
async function loadInitialPhotos() {
    try {
        console.log('📸 Caricamento foto iniziali...');
        const response = await fetch('/api/photos');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const photos = await response.json();
        console.log(`✅ Caricate ${photos.length} foto totali`);
        
        // Separa foto visualizzate da quelle nuove
        const notDisplayed = photos.filter(p => !p.displayed);
        const alreadyDisplayed = photos.filter(p => p.displayed);
        
        console.log(`📋 Non visualizzate: ${notDisplayed.length}, Già visualizzate: ${alreadyDisplayed.length}`);
        
        // Aggiungi prima quelle non visualizzate
        notDisplayed.forEach(photo => addToQueue(photo));
        
        // Segna le foto già mostrate
        alreadyDisplayed.forEach(photo => {
            displayedPhotos.add(photo.filename);
        });
        
        // Avvia il display
        if (photoQueue.length > 0) {
            displayNextPhoto();
        } else {
            showLogoScreen();
        }
    } catch (error) {
        console.error('❌ Errore nel caricamento foto:', error);
        showLogoScreen();
    }
}

// Aggiungi foto alla coda
function addToQueue(photo) {
    if (!displayedPhotos.has(photo.filename) && 
        !photoQueue.find(p => p.filename === photo.filename)) {
        console.log('➕ Aggiunta alla coda:', photo.filename);
        photoQueue.push(photo);
        
        if (!isDisplaying) {
            displayNextPhoto();
        }
    }
}

// Mostra prossima foto
async function displayNextPhoto() {
    if (photoQueue.length === 0) {
        console.log('📺 Coda vuota, mostro logo screen');
        showLogoScreen();
        return;
    }
    
    isDisplaying = true;
    const photo = photoQueue.shift();
    
    console.log(`🖼️ Mostro foto: ${photo.filename} (${photoQueue.length} in coda)`);
    
    // Mostra la foto
    currentPhoto.src = `/uploads/${photo.filename}`;
    logoScreen.classList.add('hidden');
    photoDisplay.classList.add('active');
    
    // Segna come visualizzata
    displayedPhotos.add(photo.filename);
    
    try {
        const response = await fetch(`/api/photos/${photo.filename}/displayed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('❌ Errore nel marcare foto come visualizzata');
        } else {
            console.log('✅ Foto marcata come visualizzata');
        }
    } catch (error) {
        console.error('❌ Errore aggiornamento stato:', error);
    }
    
    // Attendi e mostra la prossima
    setTimeout(() => {
        if (photoQueue.length > 0) {
            displayNextPhoto();
        } else {
            isDisplaying = false;
            showLogoScreen();
        }
    }, PHOTO_DISPLAY_TIME);
}

// Mostra schermata logo
function showLogoScreen() {
    console.log('🎨 Mostro logo screen');
    photoDisplay.classList.remove('active');
    logoScreen.classList.remove('hidden');
    isDisplaying = false;
}

// Gestione errori caricamento immagini
currentPhoto.onerror = () => {
    console.error('❌ Errore nel caricamento immagine');
    if (photoQueue.length > 0) {
        displayNextPhoto();
    } else {
        showLogoScreen();
    }
};

// Preload dell'immagine
currentPhoto.onload = () => {
    console.log('✅ Immagine caricata con successo');
};

// Log iniziale
console.log('🚀 Display service avviato');
console.log('📍 Host:', window.location.host);
console.log('🔗 Protocol:', window.location.protocol);

// Avvia connessione
connectWebSocket();

// Check periodico per nuove foto (backup se WebSocket fallisce)
setInterval(async () => {
    if (!isDisplaying && photoQueue.length === 0) {
        try {
            const response = await fetch('/api/photos');
            const photos = await response.json();
            const newPhotos = photos.filter(p => !displayedPhotos.has(p.filename));
            
            if (newPhotos.length > 0) {
                console.log(`🔄 Trovate ${newPhotos.length} nuove foto via polling`);
                newPhotos.forEach(photo => addToQueue(photo));
            }
        } catch (error) {
            console.error('❌ Errore controllo nuove foto:', error);
        }
    }
}, 10000); // Ogni 10 secondi

// Log dello stato ogni minuto
setInterval(() => {
    console.log('📊 Stato corrente:', {
        isDisplaying,
        queueLength: photoQueue.length,
        displayedCount: displayedPhotos.size,
        wsConnected: ws && ws.readyState === WebSocket.OPEN
    });
}, 60000);
