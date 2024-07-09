# 个人文档搭建流程

### 准备工作
- node 18 ^

## 利用vitepress搭建项目
1. 安装vitepress
```sh
npm add -D vitepress
```

2. 使用向到导搭建vitepress项目
```sh
npx vitepress init
```

3. 将需要回答几个简单的问题, 全部默认即可
```sh
┌  Welcome to VitePress!
│
◇  Where should VitePress initialize the config?
│  ./docs
│
◇  Site title:
│  My Awesome Project
│
◇  Site description:
│  A VitePress Site
│
◆  Theme:
│  ● Default Theme (Out of the box, good-looking docs)
│  ○ Default Theme + Customization
│  ○ Custom Theme
└
```
4. 因为需要部署到github，所以需要将vitepress安装到项目中
```sh
# 安装vitepress到项目中
npm add -D vitepress

# 执行install生成package-lock.json
npm install
```

## 本地测试与构建
1. 运行以下命令来构建文档
```sh
npm run docs:build
```

2. 构建文档后，通过运行以下命令可以在本地预览它
```sh
npm run docs:preview
```

3. 设定 public 根目录
> `base`是设置在`.vitepress/config.mts`文件中的。  
```yml
export default defineConfig({
  base: '/doc/',
  title: "hhhhhtao",
  description: "个人文档",
  ...
})
```

默认情况下，我们假设站点将部署在域名 (`/`) 的根路径上。如果站点在子路径中提供服务，例如 `https://mywebsite.com/blog/`，则需要在 VitePress 配置中将 `base` 选项设置为 `'/blog/'`。

例：如果你使用的是 Github页面并部署到 `user.github.io/repo/`，请将 `base` 设置为 `/repo/`。  
  
例：我的仓库名是`doc`，那么我的`base`就应该是 `base: '/doc/'`

## 部署在Github Pages
1. 在项目的 .github/workflows 目录中创建一个名为 deploy.yml 的文件，其中包含这样的内容
```yml
# 构建 VitePress 站点并将其部署到 GitHub Pages 的示例工作流程
#
name: Deploy VitePress site to Pages

on:
  # 在针对 `main` 分支的推送上运行。如果你
  # 使用 `master` 分支作为默认分支，请将其更改为 `master`
  push:
    branches: [main]

  # 允许你从 Actions 选项卡手动运行此工作流程
  workflow_dispatch:

# 设置 GITHUB_TOKEN 的权限，以允许部署到 GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# 只允许同时进行一次部署，跳过正在运行和最新队列之间的运行队列
# 但是，不要取消正在进行的运行，因为我们希望允许这些生产部署完成
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  # 构建工作
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 如果未启用 lastUpdated，则不需要
      # - uses: pnpm/action-setup@v3 # 如果使用 pnpm，请取消注释
      # - uses: oven-sh/setup-bun@v1 # 如果使用 Bun，请取消注释
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm # 或 pnpm / yarn
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Install dependencies
        run: npm ci # 或 pnpm install / yarn install / bun install
      - name: Build with VitePress
        run: npm run docs:build # 或 pnpm docs:build / yarn docs:build / bun run docs:build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist # 如果.vitepress在根目录则将docs/去掉即可

  # 部署工作
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
2. 在存储库设置中的“Pages”菜单项下，选择“Build and deployment > Source > GitHub Actions”。

3. 将更改推送到 main 分支并等待 GitHub Action 工作流完成。你应该看到站点部署到 https://<username>.github.io/[repository]/ 或 https://<custom-domain>/，这取决于你的设置。你的站点将在每次推送到 main 分支时自动部署。