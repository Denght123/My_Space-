# MySpace 个人极简博客 AI 开发指令

## 项目概述

这是一个**极简风格的个人博客系统**，基于 Next.js 14 (App Router) + TypeScript 开发，核心功能为内容展示、轻量化互动与便捷后台管理，目标是打造 “内容至上” 的个人展示站点，兼顾开发效率与用户体验。

## 开发规范

- 采用 **Next.js 14 (App Router)** 作为全栈框架，优先使用 SSR/SSG 保障 SEO 效果
- 样式使用 **Tailwind CSS + Shadcn/ui**，直接复用 Shadcn/ui 极简组件，避免自定义复杂样式
- 数据库 ORM 使用 **Prisma**，本地开发用 SQLite，线上环境用 PostgreSQL
- 鉴权使用 **NextAuth.js**，仅实现博主后台登录功能（支持邮箱 / 第三方登录任选一种）
- 文章内容使用 **NextMDX + React Markdown Renderer** 渲染 Markdown，支持代码高亮与图片自适应
- 所有动态数据（文章、评论、配置）存储于数据库，不使用 LocalStorage
- 评论提交采用 **AJAX 异步交互**，无需刷新页面

## 代码风格

- 使用 **ESLint + Prettier** 保证代码格式统一
- 组件名使用 **PascalCase**（如 `ArticleCard`、`CommentInput`）
- 函数名与变量名使用 **camelCase**（如 `getArticleList`、`commentText`）
- 常量名使用 **UPPER_SNAKE_CASE**（如 `ARTICLE_STATUS`、`COMMENT_STATUS`）
- Next.js 路由文件遵循 App Router 规范（如 `page.tsx`、`layout.tsx`）
- 组件优先拆分为**原子化小组件**，保持单一职责，避免过度封装

## 测试要求

- 核心功能（文章增删改查、评论提交 / 审核、个人配置修改）完成后必须手动测试
- 验证数据库数据的**存储与读取正确性**，包括草稿、隐藏文章等状态数据
- 测试移动端适配效果，重点验证评论输入、后台审核的移动端操作流畅性
- 测试 SEO 效果：确保文章详情页 Meta 标签、静态资源加载符合 Lighthouse 要求
- 测试边界场景：空文章列表、无评论状态、异常数据输入的容错处理

## 注意事项

- 严格遵循「**内容至上**」的设计原则，避免添加冗余装饰、动画或复杂交互
- 优先实现 **MVP 核心功能**（展示 + 管理闭环），再迭代互动与优化功能
- 保证代码简洁，避免过度设计，组件与函数尽量保持轻量
- 必须适配移动端，所有按钮、输入框的点击区域需符合手机操作习惯
- 性能优化：首屏加载时间需 < 1.5s，图片需支持懒加载与 WebP 格式转换
- 安全防护：评论内容需做 XSS 过滤，后台接口需验证用户身份