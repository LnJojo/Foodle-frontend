# ─── Étape 1 : Build ────────────────────────────────────────────────────────
# On utilise Node pour compiler le projet React en fichiers statiques
FROM node:20-alpine AS builder

WORKDIR /app

# Copie séparée de package*.json pour le cache Docker
COPY package*.json .
RUN npm install

COPY . .

# VITE_API_URL est une variable de build (elle est injectée dans le JS compilé)
# L'URL doit être accessible depuis le NAVIGATEUR de l'utilisateur, pas depuis Docker
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─── Étape 2 : Serveur ──────────────────────────────────────────────────────
# On repart d'une image Nginx vierge et on copie UNIQUEMENT le dossier dist/
# L'image finale ne contient pas Node.js, npm, ni le code source → bien plus légère
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
