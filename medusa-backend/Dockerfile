ARG NODE_IMAGE=node:20-bookworm
FROM ${NODE_IMAGE}

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

EXPOSE 9000

CMD ["npm", "run", "docker:dev"]
