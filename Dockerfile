FROM node:20.18.3-slim

# Instala ferramentas para compilar módulos nativos (necessário para sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g @nestjs/cli@10.1.17

# Cria as pastas e garante que o usuário node seja o dono de tudo na home
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node

USER node

WORKDIR /home/node/app

CMD ["tail", "-f", "/dev/null"]