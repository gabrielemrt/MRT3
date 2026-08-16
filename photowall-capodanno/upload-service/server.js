const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = '/app/uploads';
const IMG_DIR = '/app/img';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760;

// Security
app.use(helmet({
    contentSecurityPolicy: false
}));

app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: 'Troppi caricamenti, riprova tra un minuto'
});

// Multer configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await fs.mkdir(UPLOAD_DIR, { recursive: true });
            cb(null, UPLOAD_DIR);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Solo immagini sono permesse (jpg, jpeg, png, gif, webp)'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter
});

// WebSocket connections storage
const wsConnections = new Set();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'upload' });
});

// Upload endpoint
app.post('/api/upload', uploadLimiter, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nessun file caricato' });
        }

        const photoData = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            uploadTime: Date.now(),
            displayed: false
        };

        // Save metadata
        const metadataPath = path.join(UPLOAD_DIR, req.file.filename + '.json');
        await fs.writeFile(metadataPath, JSON.stringify(photoData));

        // Notify WebSocket clients
        notifyClients({ type: 'new_photo', data: photoData });

        res.json({
            success: true,
            message: 'Foto caricata con successo!',
            filename: req.file.filename
        });

    } catch (error) {
        console.error('Errore upload:', error);
        res.status(500).json({ error: 'Errore durante il caricamento' });
    }
});

// Get all photos
app.get('/api/photos', async (req, res) => {
    try {
        const files = await fs.readdir(UPLOAD_DIR);
        const photos = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                const data = await fs.readFile(path.join(UPLOAD_DIR, file), 'utf8');
                photos.push(JSON.parse(data));
            }
        }

        photos.sort((a, b) => a.uploadTime - b.uploadTime);
        res.json(photos);

    } catch (error) {
        console.error('Errore nel recupero foto:', error);
        res.status(500).json({ error: 'Errore nel recupero delle foto' });
    }
});

// Mark photo as displayed
app.post('/api/photos/:filename/displayed', async (req, res) => {
    try {
        const metadataPath = path.join(UPLOAD_DIR, req.params.filename + '.json');
        const data = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
        data.displayed = true;
        await fs.writeFile(metadataPath, JSON.stringify(data));
        res.json({ success: true });
    } catch (error) {
        console.error('Errore aggiornamento:', error);
        res.status(500).json({ error: 'Errore aggiornamento' });
    }
});

// Serve uploaded images
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/img', express.static(IMG_DIR));

// WebSocket server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Upload service in esecuzione sulla porta ${PORT}`);
});

const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
    console.log('Client WebSocket connesso');
    wsConnections.add(ws);

    ws.on('close', () => {
        console.log('Client WebSocket disconnesso');
        wsConnections.delete(ws);
    });
});

function notifyClients(data) {
    wsConnections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    });
}

// Cleanup on exit
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server terminato');
    });
});