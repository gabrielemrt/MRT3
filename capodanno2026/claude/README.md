# NYE Cortina San Mauro 2026 - Season 2

Sito web per l'evento di Capodanno 2026 a San Mauro di Saline.

## 📁 Struttura del Progetto

```
nye-cortina-2026/
├── index.html          # Pagina HTML principale
├── style.css           # Foglio di stile
├── script.js           # JavaScript per animazioni e interattività
├── Dockerfile          # Configurazione Docker
├── docker-compose.yml  # Orchestrazione Docker
└── README.md          # Questo file
```

## 🚀 Deployment con Docker

### Prerequisiti
- Docker installato sul sistema
- Docker Compose installato (opzionale ma consigliato)

### Metodo 1: Docker Compose (Consigliato)

1. **Costruisci e avvia il container:**
```bash
docker-compose up -d --build
```

2. **Verifica che il container sia in esecuzione:**
```bash
docker-compose ps
```

3. **Visualizza i logs:**
```bash
docker-compose logs -f
```

4. **Ferma il container:**
```bash
docker-compose down
```

### Metodo 2: Docker CLI

1. **Costruisci l'immagine:**
```bash
docker build -t nye-cortina-2026 .
```

2. **Avvia il container:**
```bash
docker run -d -p 8080:80 --name nye-event nye-cortina-2026
```

3. **Verifica lo stato:**
```bash
docker ps
```

4. **Ferma il container:**
```bash
docker stop nye-event
docker rm nye-event
```

## 🌐 Accesso al Sito

Dopo aver avviato il container, il sito sarà disponibile su:
- **Locale:** http://localhost:8080
- **Network locale:** http://[tuo-ip]:8080

## 🎯 Easter Eggs

Il sito include diversi Easter Eggs per coinvolgere gli utenti:

1. **3 Stelle Nascoste ⭐**
   - Posizionate in punti strategici della pagina
   - Ogni stella sbloccata offre un premio speciale
   - Premi: accesso VIP, tavolo riservato, menzione speciale

2. **Logo Segreto 🎩**
   - Clicca 5 volte sul logo principale
   - Sblocca accesso alla playlist e dedica dal DJ

## 📋 Registrazione

Il sito si collega al modulo Google Forms per la registrazione:
- Link: https://forms.gle/TeGzeXUS9j3yrkcGA
- I dati vengono sincronizzati automaticamente con Google Sheets

## 🎨 Caratteristiche

- ✨ Design elegante e moderno
- 📱 Responsive (mobile, tablet, desktop)
- ❄️ Animazioni neve in tempo reale
- ⏰ Countdown live fino all'evento
- 🎭 Easter eggs interattivi
- 🌟 Effetti sparkle al movimento del mouse

## 🔧 Modifiche e Personalizzazione

### Modificare i contenuti:
- **Testi:** Modifica `index.html`
- **Stili:** Modifica `style.css`
- **Animazioni/Logica:** Modifica `script.js`

Dopo ogni modifica, ricostruisci il container:
```bash
docker-compose up -d --build
```

## 📦 Pubblicazione Online

### Opzione 1: Server VPS (DigitalOcean, Linode, AWS EC2)
```bash
# Sul server
git clone [tuo-repo]
cd nye-cortina-2026
docker-compose up -d
```

### Opzione 2: Servizi Docker Cloud
- **Railway.app** (Consigliato per semplicità)
- **Render.com**
- **Fly.io**
- **Google Cloud Run**
- **AWS ECS**

### Opzione 3: Docker Hub
```bash
# Tag e push dell'immagine
docker tag nye-cortina-2026 tuousername/nye-cortina-2026:latest
docker push tuousername/nye-cortina-2026:latest
```

## 🔒 Sicurezza

Per produzione, considera:
- Utilizzare HTTPS (certificato SSL/TLS)
- Configurare un reverse proxy (Nginx, Traefik)
- Limitare l'accesso alle porte
- Backup regolari dei dati di registrazione

## 📞 Supporto

Per problemi o domande:
- Verifica i logs: `docker-compose logs -f`
- Controlla che la porta 8080 sia libera
- Assicurati che Docker sia in esecuzione

## 🎉 Evento

**Data:** 31 Dicembre 2025  
**Ora:** 21:30  
**Luogo:** San Mauro di Saline - Stanza privata riscaldata

---

**Buon Capodanno 2026! 🥂✨**