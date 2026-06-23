ARG NODE_IMAGE=node:20-bookworm
FROM ${NODE_IMAGE}

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
COPY prisma ./prisma/
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

EXPOSE 8000

CMD ["npm", "run", "docker:dev"]
