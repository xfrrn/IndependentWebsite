FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 9000

CMD ["npm", "run", "docker:dev"]
