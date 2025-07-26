FROM node:lts-bullseye-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends dumb-init \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

WORKDIR /usr/src/app

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public

RUN npm install --omit=dev --no-audit --no-fund

USER node

HEALTHCHECK CMD curl -fs http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "node", "src/server.js"]
