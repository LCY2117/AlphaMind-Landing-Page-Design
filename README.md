
# AlphaMind Landing Page Design

AlphaMind 的落地页项目，基于 Vite + React 构建，包含完整的页面组件、静态资源和本地部署入口。

## 项目说明

- 技术栈：React 18、Vite、TypeScript、Tailwind CSS、Radix UI、MUI
- 入口页面：`src/main.tsx`
- 主要组件：`src/app/components/`
- 静态资源：`src/imports/`
- 生产部署入口：`server.js`

## 本地运行

```bash
npm install
npm run dev
```

## 构建发布

```bash
npm run build
```

构建结果会输出到 `dist/`。

## PM2 部署

```bash
PORT=3001 pm2 start server.js --name alphamind
pm2 save
```

## 说明

- 图片和其他资源请通过模块导入方式引用，不要直接写源码路径。
- 如果使用压缩包分发，请先解压到临时目录，再选择性合并需要的源码文件，避免把 `dist/`、`node_modules/`、zip 文件直接提交到仓库。
  