# AlphaMind Landing Page Design

这是一个基于 Vite + React 的 AlphaMind 落地页项目，包含页面结构、UI 组件、静态资源，以及本地开发和 PM2 后台运行方式。

## 仓库内容

- `src/main.tsx`：应用入口。
- `src/app/`：页面组件、共享组件和功能模块。
- `src/imports/`：页面使用的图片资源。
- `src/styles/`：Tailwind 和全局样式。
- `index.html`：Vite 入口 HTML。
- `vite.config.ts`：Vite 配置。

## 环境要求

- 已安装 Node.js。
- 终端中可使用 npm。

## 安装依赖

为了方便查看安装过程，建议使用详细输出：

```bash
npm install --verbose
```

如果你后续要在 Windows 11 电脑上继续修改，建议先在本机安装依赖，然后再启动项目。

## 本地运行

启动开发服务器：

```bash
npm run dev
```

如果你希望局域网中的其他设备也能访问，可以这样启动：

```bash
npm run dev -- --host 0.0.0.0 --port 3001
```

## 生产构建

打包生产版本：

```bash
npm run build
```

构建结果会输出到 `dist/`。

## 使用 PM2 后台运行

如果希望把开发服务器放到后台运行，可以使用 PM2：

```bash
pm2 start npm --name alphamind -- run dev -- --host 0.0.0.0 --port 3001
pm2 save
```

## 资源引用建议

- 图片等静态资源请从 `src/imports/` 中通过模块导入方式使用。
- 不要直接写源码目录路径去引用图片，这样在构建后容易失效。
- `node_modules/`、`dist/` 这类生成物不建议提交到仓库。

## 后续维护建议

- 你打算在自己的 Win11 电脑上继续修改时，建议先执行 `npm install --verbose`，确保依赖完整。
- 如果当前仓库出现 `package-lock.json`，可以按你的团队习惯决定是否一并提交；如果希望依赖版本固定，通常建议提交。
- 修改完成后，再运行 `npm run build` 检查是否能正常打包。

## 项目来源

原始设计来自 Figma：

https://www.figma.com/design/LgCYrVM3biRMlC9ZWR0CQq/AlphaMind-Landing-Page-Design