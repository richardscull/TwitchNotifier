# Build stage needs devDependencies (typescript) to run tsc.
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage ships production deps and the compiled output only.
FROM node:22-alpine
LABEL maintainer="richardscull"
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm install -g pm2

COPY --from=build /app/build ./build
COPY --from=build /app/localization ./localization
COPY --from=build /app/assets ./assets

CMD ["pm2-runtime", "start", "build/index.js", "--name", "bot"]
