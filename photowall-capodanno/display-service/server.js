const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3002;
const UPLOAD_DIR = '/app/uploads';
const IMG_DIR = '/app/img';

// Serve static files from public
app.use(express.static('public'));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/img', express.static(IMG_DIR));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'display' });
});

// Display page - serve index.html for /display route
app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
    
    // Notify all WebSocket clients
    notifyClients({ type: 'photo_displayed', filename: req.params.filename });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Errore aggiornamento:', error);
    res.status(500).json({ error: 'Errore aggiornamento' });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Display service in esecuzione sulla porta ${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Client display connesso');
  
  ws.on('close', () => {
    console.log('Client display disconnesso');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function notifyClients(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Cleanup on exit
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server terminato');
  });
});
