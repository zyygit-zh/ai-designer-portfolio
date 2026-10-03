# AI 设计师个人作品集

深色响应式作品集，支持图片、HTML5 视频、Prompt 展示与复制、作品分类、个人介绍和履历。纯静态站点，无安装依赖，无后台。

## 更新内容

修改 `content.js` 的姓名、介绍、技能、履历与作品数组。文件底部包含作品格式示例。将实际图片、视频放进 `assets/`，并使用相对路径，例如 `assets/film.mp4`。视频建议使用兼容浏览器的 MP4；大文件建议使用外部视频托管的直链。当前未填充真实作品，避免示例内容被误认为个人作品。

## 预览

在此目录运行 `python3 -m http.server 8000`，浏览器打开 http://localhost:8000。直接打开 index.html 也能浏览，Prompt 自动复制需要 HTTPS 或 localhost 环境。

## GitHub Pages 发布

1. 在 GitHub 创建公开仓库 `ai-designer-portfolio`。
2. 将本目录里的文件上传至仓库根目录。
3. 进入 Settings → Pages，将 Source 设置为 Deploy from a branch，选择 main 与 / (root)，保存。
4. 等待 GitHub Pages 完成部署，使用设置页实际给出的地址访问。

每次提交 content.js 或媒体文件后，GitHub Pages 会自动更新。站点中的全部内容均为公开展示内容，请仅上传希望公开的资料。
