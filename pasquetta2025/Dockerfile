# Usa un'immagine base leggera di Node.js
FROM node:18-alpine

# Imposta la cartella di lavoro
WORKDIR /app

# Copia i file package.json e package-lock.json dal progetto (se presente)
COPY project/package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto dei file del progetto
COPY project/ .

# Avvia il server in modalità dev (modifica se la tua app richiede un comando diverso)
CMD ["npm", "run", "dev"]
