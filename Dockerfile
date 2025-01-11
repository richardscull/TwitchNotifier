FROM node:16-alpine
LABEL maintainer="richardscull"

WORKDIR /telegram_bot

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npm install pm2 -g

RUN npm run build

CMD ["pm2-runtime", "start", "build/index.js", "--name", "bot"]