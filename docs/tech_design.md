# 技术设计文档 (TDD) - MySpace 极简博客系统

| 文档版本 | V1.0                                         |
| :------- | :------------------------------------------- |
| 项目代号 | MySpace-Lite                                 |
| 设计目标 | 构建高性能、SEO 友好、极低运维成本的个人博客 |
---
1. 技术栈选择 (Tech Stack)
    考虑到“个人开发”和“全栈展示”的需求，我们选择目前 React 生态中最成熟、部署最便捷的方案。
    1.1 前端 & 后端 (The Framework)
* 核心框架: Next.js 14 (App Router)

* 语言: TypeScript 

  2.样式与UI(styling)

* CSS 框架: Tailwind CSS 

* 组件库: Shadcn/ui

* Markdown 渲染: react-markdown + rehype-highlight (代码高亮) + @tailwindcss/typography (排版插件)。
  1.3 数据层 (Data Layer)

* 数据库: PostgreSQL 

* ORM (对象关系映射): Prisma

* 图片存储: Vercel Blob 或 Cloudinary 

* 身份验证: Auth.js (NextAuth v5) (处理博主登录 Session)。

  1.4 其他服务

  *   图片存储: Vercel Blob 或 Cloudinary (免费图床，避免数据库存大文件)。
  *   身份验证: Auth.js (NextAuth v5) (处理博主登录 Session)。
---
2. 项目结构 (Project Structure)
采用 Next.js App Router 的标准结构，逻辑清晰分层。
/my-blog
├── prisma/
│   └── schema.prisma      # 数据库模型定义
├── public/                # 静态资源 (favicon, robots.txt)
├── src/
│   ├── app/               # 页面路由 (基于文件系统的路由)
│   │   ├── (auth)/login/  # 登录页 (括号代表路由分组，不影响URL)
│   │   ├── (admin)/       # 后台管理路由 (受保护)
│   │   │   ├── dashboard/ # 仪表盘
│   │   │   ├── posts/     # 文章管理
│   │   │   └── comments/  # 评论审核
│   │   ├── api/           # 后端 API 接口
│   │   ├── blog/[slug]/   # 文章详情页 (动态路由)
│   │   ├── page.tsx       # 首页
│   │   └── layout.tsx     # 全局布局 (导航栏、Footer)
│   ├── components/        # UI 组件
│   │   ├── ui/            # Shadcn 基础组件 (Button, Input)
│   │   ├── block/         # 业务组件 (ArticleCard, CommentList)
│   │   └── editor/        # Markdown 编辑器组件
│   ├── lib/               # 工具函数
│   │   ├── db.ts          # Prisma 数据库实例
│   │   └── utils.ts       # 通用工具
│   └── types/             # TypeScript 类型定义
├── middleware.ts          # 路由拦截 (用于后台鉴权)
└── ...config files        # 配置文件
---
3. 数据模型 (Data Model)
    基于 Prisma Schema 语法设计。我们需要 4 个核心模型：User (博主), SiteConfig (站点配置), Post (文章), Comment (评论)。
    // 1. 博主/管理员表 (极简，单用户系统)
    model User {
    id        String   @id @default(cuid())
    username  String   @unique
    password  String   // 加密存储 (bcrypt)
    createdAt DateTime @default(now())
    }
    // 2. 站点动态配置表 (用于“关于我”、Slogan、头像的动态修改)
    // 这是一个单行表，永远只读取 ID 为 1 的记录
    model SiteConfig {
    id          Int      @id @default(1)
    avatarUrl   String?  // 头像链接
    nickname    String   @default("My Name")
    slogan      String?  // 一句话介绍
    aboutMe     String?  // "关于我"页面的 Markdown 源码
    socialLinks Json?    // 存 JSON: { github: "...", email: "..." }
    }
    // 3. 文章表
    model Post {
    id          String   @id @default(cuid())
    title       String
    slug        String   @unique // 自定义 URL，如 /blog/my-first-post
    excerpt     String?  // 摘要
    content     String   // Markdown 源码
    coverImage  String?  // 封面图 URL
    published   Boolean  @default(false) // 是否发布
    pinned      Boolean  @default(false) // 是否置顶

  // 关联分类 (为了简化，这里使用 String 数组存 Tags，不建 Tag 表)
  tags        String[] 
  category    String?  // 分类名称，如 "技术", "生活"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  comments    Comment[] // 关联评论
}
// 4. 评论表 (访客无需登录)
model Comment {
  id        String   @id @default(cuid())
  nickname  String   // 访客昵称
  content   String   // 评论内容
  isAdmin   Boolean  @default(false) // 是否是博主回复
  isApproved Boolean @default(false) // 审核状态：false=待审, true=公开

  createdAt DateTime @default(now())

  // 关联文章
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String
  // 支持简单的嵌套回复 (父子评论)
  parentId  String?
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
}
---
4. 关键技术点与难点 (Key Technical Points)
    4.1 Markdown 编辑与渲染
*   难点: 在后台实现“所见即所得”的编辑体验，以及前台的代码高亮。
*   方案:
    *   后台编辑器: 使用开源库（如 react-md-editor 或 tiptap），支持分屏预览。
    *   图片粘贴: 监听编辑器的 onPaste 事件，检测剪贴板中的 Image File，自动上传到云存储并替换为 Markdown 图片语法 ![](url)。
    * 前台渲染: 使用 CSS 的 prose 类 (Tailwind Typography 插件) 自动排版，无需手动写 h1, p, blockquote 的样式。

      4.2动态配置 (Dynamic Config)
*   难点: 如何不改代码就能改“关于我”页面的内容？
*   方案: 
    *   每次页面加载（Layout）时，从数据库 SiteConfig 表读取数据。
    *   利用 Next.js 的缓存机制 unstable_cache，将配置数据缓存。只有当后台修改配置时，才手动清除缓存 (Revalidate)。这保证了数据库不会被频繁读取，页面加载极快。
