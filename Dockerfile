FROM node:20.5.1-slim

USER node

RUN npm install -g @nestjs/cli@10.1.17

WORKDIR /home/node/app

CMD ["tail", "-f", "/dev/null"]