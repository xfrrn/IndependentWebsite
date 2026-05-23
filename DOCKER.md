# Docker 启动说明

这个项目现在可以用 Docker Compose 一次性启动：Postgres、Redis、Medusa 后端和 Next.js 前端。

## 启动

```powershell
cd D:\codes\IndependentWebsite
docker compose up --build
```

访问地址：

- 前端商城：http://localhost:8000
- Medusa API：http://localhost:9000
- Medusa Admin：http://localhost:9000/app
- Postgres：localhost:5433
- Redis：localhost:6379

后端容器启动时会等待 Postgres 和 Redis 就绪，自动执行数据库迁移；如果数据库里还没有 region 数据，会自动执行一次 seed。

## 后台运行

```powershell
docker compose up --build -d
```

查看日志：

```powershell
docker compose logs -f medusa-backend medusa-frontend
```

## 停止

```powershell
docker compose down
```

如果要连数据库、依赖缓存等 Docker volumes 一起删除：

```powershell
docker compose down -v
```

## 说明

- 前后端源码会挂载进容器，本地改代码后开发服务可以直接响应。
- 依赖安装在 Docker volume 里，不依赖本机的 `node_modules`。
- Compose 中的密钥是本地开发占位值，正式部署前需要替换。
