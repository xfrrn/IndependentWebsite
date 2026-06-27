This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Docker

### 开发环境

```bash
# 启动（首次或需要重新构建镜像时）
docker compose up -d --build

# 启动（镜像已存在时）
docker compose up -d

# 查看日志
docker compose logs -f app

# 重启应用
docker compose restart app

# 重启数据库
docker compose restart db

# 重启所有服务
docker compose restart
```

开发环境使用 `Dockerfile` + `docker-compose.yml`，端口 `7890`，数据库映射到 `5434`。

### 生产环境

```bash
# 启动（首次或需要重新构建镜像时）
docker compose -f docker-compose.prod.yml up -d --build

# 启动（镜像已存在时）
docker compose -f docker-compose.prod.yml up -d

# 查看日志
docker compose -f docker-compose.prod.yml logs -f app

# 重启应用
docker compose -f docker-compose.prod.yml restart app

# 重启所有服务
docker compose -f docker-compose.prod.yml restart
```

生产环境使用 `Dockerfile.prod` + `docker-compose.prod.yml`，多阶段构建，端口 `7890`，数据库不对外暴露。

### 常用操作

```bash
# 停止所有容器
docker compose down

# 停止并删除数据卷（⚠️ 会清除数据库和上传文件）
docker compose down -v

# 重新构建并启动（代码或依赖变更后）
docker compose up -d --build

# 进入应用容器
docker compose exec app sh

# 查看容器状态
docker compose ps
```

> 生产环境命令需加 `-f docker-compose.prod.yml`，下同。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
