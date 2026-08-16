const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const uploadQueue = document.getElementById('uploadQueue');
const queueCount = document.getElementById('queueCount');
const queueList = document.getElementById('queueList');
const clearQueueBtn = document.getElementById('clearQueueBtn');
const uploadAllBtn = document.getElementById('uploadAllBtn');
const loading = document.getElementById('loading');
const uploadProgress = document.getElementById('uploadProgress');
const uploadTotal = document.getElementById('uploadTotal');
const success = document.getElementById('success');
const error = document.getElementById('error');
const errorText = document.getElementById('errorText');

let selectedFiles = [];

fileInput.addEventListener('change', handleFileSelect);
clearQueueBtn.addEventListener('click', clearQueue);
uploadAllBtn.addEventListener('click', uploadAll);

function handleFileSelect(e) {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Filtra e valida i file
    const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
            showError(`${file.name} non è un'immagine valida`);
            return false;
        }
        if (file.size > 10 * 1024 * 1024) {
            showError(`${file.name} è troppo grande (max 10MB)`);
            return false;
        }
        return true;
    });

    if (validFiles.length === 0) return;

    // Aggiungi alla coda
    selectedFiles = [...selectedFiles, ...validFiles];
    updateQueue();

    // Reset input
    fileInput.value = '';
}

function updateQueue() {
    if (selectedFiles.length === 0) {
        uploadQueue.classList.add('hidden');
        uploadZone.classList.remove('hidden');
        return;
    }

    uploadZone.classList.add('hidden');
    uploadQueue.classList.remove('hidden');

    queueCount.textContent = selectedFiles.length;
    queueList.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'queue-item';

        const reader = new FileReader();
        reader.onload = (e) => {
            item.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <div class="queue-item-info">
                    <div class="queue-item-name">${file.name}</div>
                    <div class="queue-item-size">${formatFileSize(file.size)}</div>
                </div>
                <button class="queue-item-remove" data-index="${index}">Rimuovi</button>
            `;

            const removeBtn = item.querySelector('.queue-item-remove');
            removeBtn.addEventListener('click', () => removeFromQueue(index));
        };
        reader.readAsDataURL(file);

        queueList.appendChild(item);
    });
}

function removeFromQueue(index) {
    selectedFiles.splice(index, 1);
    updateQueue();
}

function clearQueue() {
    selectedFiles = [];
    updateQueue();
}

async function uploadAll() {
    if (selectedFiles.length === 0) return;

    uploadQueue.classList.add('hidden');
    loading.classList.remove('hidden');

    uploadTotal.textContent = selectedFiles.length;
    let uploaded = 0;
    let failed = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        uploadProgress.textContent = i + 1;

        try {
            const formData = new FormData();
            formData.append('photo', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                uploaded++;
            } else {
                failed++;
                console.error(`Errore caricamento ${file.name}`);
            }
        } catch (err) {
            failed++;
            console.error(`Errore caricamento ${file.name}:`, err);
        }

        // Piccola pausa tra un upload e l'altro
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    loading.classList.add('hidden');

    if (failed === 0) {
        success.classList.remove('hidden');
        setTimeout(() => {
            success.classList.add('hidden');
            clearQueue();
        }, 3000);
    } else {
        showError(`${uploaded} foto caricate, ${failed} fallite`);
    }
}

function showError(message) {
    errorText.textContent = message;
    error.classList.remove('hidden');
    setTimeout(() => {
        error.classList.add('hidden');
    }, 3000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}