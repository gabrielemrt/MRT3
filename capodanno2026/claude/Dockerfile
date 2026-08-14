# Usa Nginx Alpine per un'immagine leggera
FROM nginx:alpine

# Rimuovi la configurazione di default di Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia tutti i file del sito nella directory di Nginx
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Esponi la porta 80
EXPOSE 80

# Nginx si avvia automaticamente
CMD ["nginx", "-g", "daemon off;"]