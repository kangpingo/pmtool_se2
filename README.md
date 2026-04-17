# PMTool SE2 – 轻量级项目管理工具

<img width="1274" height="706" alt="Dashboard" src="https://github.com/user-attachments/assets/fac8fbbe-85c8-4f20-bdda-86b25043fbd9" />

一个现代化的响应式项目管理系统，帮助团队和个人跟踪任务、管理项目，通过看板、甘特图等直观视图可视化进度。

## 核心功能

### 项目与任务管理
- **总览仪表盘** – 一目了然查看所有项目、任务和截止日期
- **项目管理** – 创建、编辑、复制、删除项目，支持完整元数据（负责人、日期、进度）
- **任务管理** – 完整的任务生命周期管理，支持状态跟踪（TODO / IN_PROGRESS / DONE）
- **看板视图** – 拖拽式任务管理，列按状态分组（待办 / 进行中 / 逾期 / 已完成）
- **甘特图** – 时间轴视图，支持日/周/月视图切换
- **项目状态自动标识**：
  - 🟢 **未开始** (0% 进度)
  - 🔵 **进行中** (1-99% 进度)
  - 🔴 **逾期** (超过计划结束日期)
  - ⚫ **已完成** (100% 进度)

### 双向日期-工期同步
- 调整日期自动更新工期
- 调整工期自动更新结束日期

### 搜索与导航
- **全局搜索** – 头部搜索栏，支持项目/任务切换
- **项目搜索** – 按名称搜索，显示状态图标和进度
- **任务搜索** – 显示任务名、所属项目、进度百分比，点击跳转并高亮

### 任务筛选与排序
- **状态筛选** – 全部 / 进行中 / 已完成 / 逾期
- **排序方式** – 按进度 / 开始日期 / 结束日期
- **批量操作** – 多选任务，批量删除

### UI/UX
- **深色/浅色主题** – 一键切换
- **国际化** – 完整的中英文支持
- **响应式设计** – 适配桌面和移动端
- **留言板** – 团队快速沟通
- **数据导入/导出** – CSV 格式

### 用户管理
- **用户注册** – 带验证的账户创建
- **用户登录** – Cookie 认证，支持管理员账户
- **用户列表** – 设置菜单查看所有用户
- **用户资料** – 可编辑的显示名和邮箱

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + Next.js 15 (App Router) + TypeScript |
| UI 组件 | shadcn/ui + Radix UI |
| 样式 | Tailwind CSS 3.4 |
| 图标 | Lucide React |
| ORM | Prisma |
| 数据库 | PostgreSQL |
| 日期处理 | date-fns |

## 数据库模型

```
Project          # 项目
├── id, name, fullName, shortName
├── plannedStartDate, duration, completionTime
├── description, owner, link, image
├── progress (自动计算)
└── tasks[]

Task             # 任务
├── id, name, keyPoints
├── plannedStartDate, plannedEndDate, actualFinishDate
├── duration, includeWeekend
├── status (TODO|IN_PROGRESS|DONE), progress
├── favorite, projectId
└── project→

User             # 用户
├── id, username (唯一), passwordHash
├── name, email
└── createdAt, updatedAt

Message          # 留言板
├── id, content, author, likes
├── likedBy[] (点赞用户列表)
└── replies[]

Reply            # 留言回复
├── id, content, author, likes
├── likedBy[], messageId
└── message→

LoginLog         # 登录日志
SystemLog        # 系统日志
```

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 14+

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/kangpingo/pmtool_se2.git
cd pmtool_se2

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，设置 DATABASE_URL

# 初始化数据库
npm run db:generate
npm run db:push
npm run db:seed    # 可选：初始化演示数据

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 默认登录账户
- 用户名：`admin`
- 密码：`admin@123`

## 页面路由

| 路由 | 说明 |
|------|------|
| `/` | 总览仪表盘 |
| `/projects` | 项目列表 |
| `/projects/[id]` | 项目详情（概览） |
| `/projects/[id]/tasks` | 项目任务列表 |
| `/projects/[id]/kanban` | 项目看板 |
| `/projects/[id]/gantt` | 项目甘特图 |
| `/tasks` | 全局任务列表 |
| `/kanban` | 全局看板 |
| `/gantt` | 全局甘特图 |
| `/login` | 登录 |
| `/login/register` | 注册 |

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint |
| `npm run db:generate` | 生成 Prisma 客户端 |
| `npm run db:push` | 推送 schema 到数据库 |
| `npm run db:migrate` | 运行数据库迁移 |
| `npm run db:seed` | 初始化演示数据 |
| `npm run db:studio` | 打开 Prisma Studio |

## 版本历史

### v2.0.0 (2026-04-18)
- 导航重构：侧边栏 Logo + 动态项目列表（带状态图标）
- 项目头部：状态色彩标识（绿/蓝/红/黑）
- 搜索栏：项目/任务切换，状态色彩文件夹图标
- 任务列表：状态筛选 Tab，彩色统计数字
- 项目/任务创建：负责人和完成日期改为必填
- 演示数据：10 个项目（2 未开始、4 进行中、2 逾期、2 已完成）

### v1.0.0 (2026-04-17)
- 用户管理：注册、显示名、用户列表
- 双向日期-工期同步
- 国际化操作日志
- Docker + Vercel 部署支持

## 截图展示

**总览仪表盘**
<img width="1267" height="713" alt="Dashboard" src="https://github.com/user-attachments/assets/f01a3586-0ec4-4108-89a8-96eb1757d19c" />

**项目视图**
<img width="1266" height="695" alt="Project" src="https://github.com/user-attachments/assets/38749e00-3eb5-4116-b471-c7badd531386" />

**看板视图**
<img width="1262" height="819" alt="Kanban" src="https://github.com/user-attachments/assets/7ed2c540-ca74-404b-aea2-3a81979d14dd" />

**甘特图**
<img width="1267" height="824" alt="Gantt" src="https://github.com/user-attachments/assets/55e2305f-322b-4c88-8454-589a622fe9cf" />

## License

MIT License
