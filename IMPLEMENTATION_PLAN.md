# IMPLEMENTATION_PLAN.md - 完整实施计划

> 本文档在 [ROADMAP.md](./ROADMAP.md) 基础上细化，给出 Phase 2 ~ Phase 7 的可执行实施计划。
> 包含：技术选型决策、目录结构、关键接口契约、里程碑、验收标准、风险与依赖。
> Phase 1 已完成（`@msp/shared` 包），本计划从 Phase 2 开始。

## 0. 全局技术决策（落地）

下列决策需在 Phase 2 启动前确认，一旦确定全仓库统一遵循：

| 决策项 | 选型 | 理由 |
|--------|------|------|
| UI 样式方案 | **Tailwind CSS v4** | shared/role/labels.ts 已使用 Tailwind class；零运行时、主题易切换 |
| UI 构建 | **Vite library mode + tsc(emit d.ts)** | Vite 出 ESM 产物，tsc 出类型声明 |
| 组件文档 | **Storybook 8** | 业界标准，支持交互式预览与视觉回归 |
| 单元测试 | **Vitest** | Vite 原生、与 monorepo workspace 兼容、快 |
| Lint/格式化 | **ESLint flat config + Prettier** | 统一代码风格 |
| 后端 ORM | **better-sqlite3 + 轻量 Repository 封装**（不引入全功能 ORM） | 保留同步查询性能，可控；如需迁移可加 Drizzle |
| 后端校验 | **zod** | 与 TypeScript 类型联动，前后端复用 schema |
| 路由 | **React Router v7（data mode）** | 支持数据加载与 Suspense |
| 表单 | **react-hook-form + zod** | 性能好、与 zod 校验统一 |
| 图表 | **ECharts（echarts-for-react）** | 报表需求多，ECharts 能力全面 |
| 包产物格式 | **ESM only + .d.ts** | 与 shared 包一致，目标 ES2022 |
| Node 运行时 | **Node.js >= 20 LTS** | 与根 package.json engines 一致 |
| 包管理 | **pnpm workspace（已定）** | - |

### 0.1 仓库级基础设施（Phase 2 开工第一周完成）

- [ ] 根目录新增 `eslint.config.js`（flat config，含 TS + React 规则）
- [ ] 根目录新增 `.prettierrc` + `.prettierignore`
- [ ] 根目录新增 `vitest.workspace.ts`（按包配置测试）
- [ ] 根目录新增 `.github/workflows/ci.yml` 雏形（lint + typecheck + test），Phase 7 完善
- [ ] 根目录新增 `.nvmrc`（node 20）与 `.pnpmfile.cjs`（如需）
- [ ] 根 `package.json` 增加脚本：`lint`、`lint:fix`、`format`、`test`、`test:coverage`
- [ ] 约定提交规范：Conventional Commits + `commitlint`（可选）

---

## 1. 阶段依赖与执行顺序

```
Phase 2 (UI) ──────┐
                   ├──► Phase 4 (admin) ──► Phase 6 (API 进店) ──┐
Phase 3 (push-core)─┘                   └──► Phase 7 (CI/CD) ────┴──► v1.0.0
                   └──► Phase 5 (store-template) ─────────────────►
```

**并行策略**：Phase 2 与 Phase 3 互不依赖，可并行推进。Phase 4/5 依赖 2+3。Phase 6、7 依赖 4。

**建议执行节奏**：
1. 先并行启动 Phase 2、Phase 3（共 3-4 周）
2. Phase 2、3 收尾时启动 Phase 4（管理端，最长关键路径 6-8 周）
3. Phase 4 后端就绪后启动 Phase 5
4. Phase 4 完成后启动 Phase 6、Phase 7

---

## Phase 2：UI 组件库（@msp/ui）

**版本**：v0.2.0
**依赖**：Phase 1
**目标**：沉淀 17 个通用组件，管理端与店铺端共用。

### 2.1 包脚手架

目录结构：

```
packages/ui/
├── src/
│   ├── index.ts                 # 统一出口
│   ├── theme/
│   │   ├── tokens.ts            # 设计 token（颜色/间距/圆角/阴影）
│   │   └── theme-provider.tsx   # 亮/暗主题 Provider
│   ├── primitives/              # 基础组件（7）
│   │   ├── button/
│   │   │   ├── Button.tsx
│   │   │   ├── button.test.tsx
│   │   │   └── index.ts
│   │   ├── input/
│   │   ├── select/
│   │   ├── modal/
│   │   ├── table/
│   │   ├── pagination/
│   │   └── badge/
│   ├── business/                # 业务组件（6）
│   │   ├── role-badge/          # 复用 @msp/shared ROLE_CONFIG
│   │   ├── money-display/       # 复用 formatMoney
│   │   ├── date-display/        # 复用 formatDate
│   │   ├── store-selector/
│   │   ├── notification-bell/   # 复用 useNotificationStore
│   │   └── push-type-switch/    # 复用 PUSH_TYPE_CONFIGS
│   ├── layout/                  # 布局组件（4）
│   │   ├── page-layout/
│   │   ├── card/
│   │   ├── tabs/
│   │   └── empty/
│   └── _internal/               # 内部工具（cn/merge 等）
├── .storybook/
│   ├── main.ts
│   └── preview.tsx
├── tsconfig.json
├── vite.config.ts               # library mode
├── package.json
└── README.md
```

### 2.2 package.json 关键配置

```jsonc
{
  "name": "@msp/ui",
  "version": "0.2.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./styles.css": "./dist/styles.css"
  },
  "scripts": {
    "build": "vite build && tsc -p tsconfig.json --emitDeclarationOnly",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "@msp/shared": "workspace:*",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  }
}
```

### 2.3 组件清单与接口契约

| 组件 | 关键 props | 依赖 shared |
|------|-----------|-------------|
| Button | `variant: 'primary'\|'secondary'\|'text'\|'danger'`, `size`, `loading`, `icon` | - |
| Input | `value`, `onChange`, `error?`, `label?`, `prefix?` | - |
| Select | `options: {label,value}[]`, `value`, `onChange`, `searchable?` | - |
| Modal | `open`, `onClose`, `title`, `size`, `footer?` | - |
| Table | `columns: Column[]`, `data`, `rowKey`, `loading?`, `empty?`, 支持排序/分页回调 | - |
| Pagination | `current`, `pageSize`, `total`, `onChange` | - |
| Badge | `color?`, `dot?`, `count?` | - |
| RoleBadge | `role: Role` → 自动取 label/color/bg | ROLE_CONFIG |
| MoneyDisplay | `value: number`, `currency?`, `colored?` | formatMoney |
| DateDisplay | `value: string\|Date`, `format?` | formatDate |
| StoreSelector | `value`, `onChange`, `filter?` | StoreInfo |
| NotificationBell | `onClick?` → 内部连 useNotificationStore | useNotificationStore |
| PushTypeSwitch | `value: Record<key,boolean>`, `onChange`, `category?` | PUSH_TYPE_CONFIGS, CATEGORY_COLORS |
| PageLayout | `sidebar`, `header`, `children` | - |
| Card | `title?`, `extra?`, `children` | - |
| Tabs | `items: {key,label,children}[]`, `activeKey`, `onChange` | - |
| Empty | `title?`, `description?`, `action?` | - |

### 2.4 主题系统

- `ThemeProvider` 通过 CSS 变量暴露 token（`--msp-color-primary` 等）
- Tailwind 配置 `darkMode: 'class'`，`<html class="dark">` 切换
- 亮/暗两套色板，组件内统一用 `cn()` 合并 class

### 2.5 里程碑与验收

| 里程碑 | 内容 | 验收 |
|--------|------|------|
| M2.1 | 脚手架 + 主题 + 1 个基础组件（Button）跑通 | `pnpm build:ui` 产物含 d.ts；Storybook 可访问 |
| M2.2 | 7 个基础组件完成 + 单测 | Vitest 通过；Storybook 文档齐全 |
| M2.3 | 6 个业务组件完成 | 复用 shared 无重复实现 |
| M2.4 | 4 个布局组件完成 + 主题切换演示 | 17 组件全导出；typecheck 通过 |

**Phase 2 验收标准**：17 组件全部实现并导出；TS 类型完整；支持主题定制；ESM+d.ts 产物正确；单测覆盖核心交互；Storybook 可构建。

---

## Phase 3：推送核心包（@msp/push-core）

**版本**：v0.3.0
**依赖**：Phase 1
**目标**：推送逻辑独立成包，Repo 接口注入，可在任意后端环境使用与测试。

### 3.1 目录结构

```
packages/push-core/
├── src/
│   ├── index.ts
│   ├── core/
│   │   ├── push-service.ts      # PushService 主类
│   │   ├── trigger.ts           # 推送触发层
│   │   └── context.ts           # PushContext（含 user/store/actor）
│   ├── channels/
│   │   ├── channel.ts           # Channel 接口
│   │   ├── pushplus.ts
│   │   ├── wecom.ts
│   │   ├── iyuu.ts
│   │   └── web-push.ts          # Web Push（可选）
│   ├── repos/
│   │   └── interfaces.ts        # 仓储接口定义（UserRepo/SettingsRepo/NotifyRepo）
│   ├── templates/
│   │   ├── index.ts             # 模板注册表
│   │   └── default-templates.ts # 16 种类型模板
│   ├── scheduler/
│   │   ├── scheduler.ts         # 定时调度（日报/周报/月报）
│   │   └── queue.ts             # 异步队列 + 重试
│   ├── security/
│   │   └── url-guard.ts         # 复用 shared validateWebhookUrlAsync
│   └── types.ts
├── tests/
│   ├── push-service.test.ts
│   ├── channels.test.ts
│   └── repos.mock.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### 3.2 核心接口契约

```typescript
// repos/interfaces.ts —— 由宿主后端实现并注入
export interface UserRepo {
  findById(id: number): Promise<UserInfo | null>;
  findByStoreAndRole(storeId: string, role: Role): Promise<UserInfo[]>;
}

export interface PushSettingsRepo {
  getByUser(userId: number): Promise<UserPushSettings>;
}

export interface NotifyRepo {
  insert(n: { user_id: number; title: string; link?: string; type: NotifyType }): Promise<void>;
  broadcast(storeId: string, n: Omit<NotifyParams, 'storeId'>): Promise<void>;
}

// channels/channel.ts
export interface PushChannel {
  readonly key: string;
  send(opts: { token: string; title: string; content: string; link?: string }): Promise<{ ok: boolean; error?: string }>;
}

// core/push-service.ts
export interface PushDeps {
  userRepo: UserRepo;
  settingsRepo: PushSettingsRepo;
  notifyRepo: NotifyRepo;
  channels: PushChannel[];
}

export class PushService {
  constructor(private deps: PushDeps) {}
  async trigger(params: NotifyParams): Promise<void>;          // 角色过滤 + 多渠道分发
  async sendToUser(userId: number, type: NotifyType, payload: unknown): Promise<void>;
  registerTemplate(type: NotifyType, fn: TemplateFn): void;
}
```

### 3.3 推送流程

1. `trigger(NotifyParams)` → 解析 `type` 与 `storeId`
2. 通过 `ROLE_ALLOWED_TYPES`（shared）筛选目标角色
3. `userRepo.findByStoreAndRole` 取出目标用户
4. 对每个用户：取 `pushSettings` → 命中 `TYPE_TO_PUSH_FIELD` 字段是否开启 → 命中渠道 token
5. 模板渲染标题/内容/链接（复用 `getNotifyTitle`、`getNotifyLink`）
6. `notifyRepo.insert` 落库 + 并发分发到各 channel
7. 失败入队、指数退避重试（最多 3 次）

### 3.4 调度

- `Scheduler` 基于 `setInterval` + cron 表达式（轻量自实现或用 `node-cron`）
- 注册：日报（每日 22:00）、周报（每周一 9:00）、月报（每月 1 日 9:00）
- 触发时遍历启用该类型推送的店铺，生成 `NotifyParams` 调 `trigger`

### 3.5 里程碑与验收

| 里程碑 | 内容 |
|--------|------|
| M3.1 | Repo 接口 + Channel 接口 + PushService 骨架 + Mock 测试跑通 |
| M3.2 | 3 个渠道实现（pushplus/wecom/iyuu）+ SSRF 复用 |
| M3.3 | 16 类型模板 + 定时调度 + 重试队列 |
| M3.4 | 单测覆盖率 > 70% |

**Phase 3 验收标准**：独立包；3 渠道可用；16 类型支持；Repo 注入可在任意后端运行；单测 > 70%。

---

## Phase 4：管理端迁移（apps/admin）

**版本**：v0.4.0
**依赖**：Phase 2、Phase 3
**目标**：将旧仓库 multi-store-manager v2.1.4 管理端完整迁移到 apps/admin。

### 4.1 应用结构

```
apps/admin/
├── server/                      # Express 后端
│   ├── src/
│   │   ├── index.ts             # 入口（启动 + src-seed 检查）
│   │   ├── app.ts               # Express app 装配
│   │   ├── config/
│   │   │   └── env.ts           # 环境变量 + 默认值
│   │   ├── db/
│   │   │   ├── connection.ts    # better-sqlite3 单例
│   │   │   ├── schema.ts        # 建表 SQL
│   │   │   └── migrate.ts       # 版本迁移
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT 解析 + cookie
│   │   │   ├── rbac.ts          # 基于 canAccess 的路由守卫
│   │   │   ├── rate-limit.ts
│   │   │   ├── upload.ts        # multer
│   │   │   └── error.ts
│   │   ├── routes/              # 按业务域分文件
│   │   │   ├── auth.ts
│   │   │   ├── stores.ts
│   │   │   ├── entries.ts
│   │   │   ├── inventory.ts
│   │   │   ├── shifts.ts
│   │   │   ├── payroll.ts
│   │   │   ├── dividends.ts
│   │   │   ├── staff.ts
│   │   │   ├── reports.ts
│   │   │   ├── notifications.ts
│   │   │   ├── settings.ts
│   │   │   ├── push.ts          # 推送设置
│   │   │   ├── logs.ts
│   │   │   ├── upload.ts
│   │   │   └── sse.ts           # SSE 服务端
│   │   ├── repos/               # 实现 push-core 的 Repo 接口
│   │   │   ├── user-repo.ts
│   │   │   ├── settings-repo.ts
│   │   │   └── notify-repo.ts
│   │   ├── services/
│   │   │   ├── push-bootstrap.ts# 装配 PushService + 注入 repos
│   │   │   └── upgrade.ts       # src-seed 升级
│   │   └── utils/
│   ├── tests/
│   ├── tsconfig.json
│   └── package.json
├── web/                         # React + Vite 前端
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx              # 路由 + Provider
│   │   ├── routes/              # 页面（对应 ROADMAP 4.2 清单）
│   │   ├── components/          # 管理端专属组件
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── Dockerfile
├── docker-compose.yml
└── package.json                 # 聚合脚本（dev/build/start）
```

### 4.2 数据库 Schema（核心表）

| 表 | 主键 | 关键字段 | 说明 |
|----|------|---------|------|
| users | id | username, password_hash, role, store_id | store_id 区分所属店 |
| stores | id | name, is_open, initial_capital | 店铺主表 |
| shareholders | id | store_id, name, ratio | 股东 |
| entries | id | store_id, type, category, amount, date | 记账 |
| inventory_items | id | store_id, name, quantity, status | 库存 |
| shifts | id | store_id, type(open/close), time | 开闭店 |
| payroll | id | store_id, user_id, amount, status | 工资 |
| dividends | id | store_id, shareholder_id, amount | 分红 |
| notifications | id | user_id, title, link, read, type | 通知 |
| push_settings | user_id | pushplus_token, wecom_secret, iyuu_token, push_* | 推送开关 |
| operation_logs | id | user_id, action, target, ip, time | 审计 |
| system_settings | key | value | 全局配置 |
| schema_version | version | applied_at | 迁移版本 |

所有业务表带 `store_id` 实现数据隔离（除 users 全局表、system_settings）。

### 4.3 关键 API 契约（示例）

```
POST   /api/auth/login            { username, password } → Set-Cookie token
POST   /api/auth/logout
GET    /api/auth/me               → UserInfo
GET    /api/stores                → StoreInfo[]
POST   /api/stores                创建店铺
GET    /api/stores/:id/entries    → Entry[]
POST   /api/stores/:id/entries    新增记账（触发 push trigger）
GET    /api/stores/:id/inventory
GET    /api/stores/:id/payroll
PUT    /api/stores/:id/payroll/:pid/confirm   工资确认
GET    /api/notifications         → Notification[]
GET    /api/notifications/unread-count
PUT    /api/push/settings         更新推送设置
GET    /api/sse                   SSE 长连接（data-change/system/heartbeat）
POST   /api/upgrade               上传 ZIP 升级包
```

每个写操作 API 内调用 `pushService.trigger(...)` 并通过 SSE 广播 `data-change`。

### 4.4 push-core 集成

`services/push-bootstrap.ts`：
```typescript
const pushService = new PushService({
  userRepo: new SqliteUserRepo(db),
  settingsRepo: new SqliteSettingsRepo(db),
  notifyRepo: new SqliteNotifyRepo(db),
  channels: [new PushPlusChannel(), new WecomChannel(), new IyuuChannel()],
});
// 注册定时调度
new Scheduler(pushService, storesRepo).start();
```

### 4.5 前端页面清单（对应 ROADMAP 4.2）

登录/登出 · 布局框架 · 仪表盘 · 店铺管理 · 记账 · 库存 · 排班 · 工资 · 分红 · 员工 · 报表 · 通知中心 · 系统设置 · 推送设置 · 升级管理 · 操作日志。

所有页面优先复用 `@msp/ui` 组件与 `@msp/shared` 的 stores/hooks（useStore / useSSE / useUnreadPolling / useDataVersion）。

### 4.6 里程碑

| 里程碑 | 内容 |
|--------|------|
| M4.1 | server 脚手架 + DB schema + auth/stores/entries API + 联调 |
| M4.2 | 全部业务 API（库存/排班/工资/分红/员工/报表/日志/设置） |
| M4.3 | push-core 集成 + SSE 服务端 + 端到端推送验证 |
| M4.4 | 前端全部页面 + 路由 + 联调 |
| M4.5 | 升级系统（src-seed）+ 性能优化 + Bug 修复 |

**Phase 4 验收标准**：功能对齐旧仓库 v2.1.4；推送/SSE/升级流程正常；构建产物正确。

---

## Phase 5：店铺端模板（apps/store-template）

**版本**：v0.5.0
**依赖**：Phase 2、Phase 3
**目标**：可插拔店铺端模板，至少 1 套完整可用。

### 5.1 可插拔模板规范

```
apps/store-template/
├── templates/
│   ├── default/                 # 通用模板
│   │   ├── template.config.ts   # 元数据：name/version/feature flags/主题
│   │   ├── pages/               # 模板页面
│   │   └── theme.css
│   └── retail-demo/             # 定制示例模板
├── core/                        # 模板运行时
│   ├── template-loader.ts       # 按 store 配置加载模板
│   ├── config-schema.ts         # zod schema 校验 template.config
│   └── feature-flags.ts
├── shared-pages/                # 所有模板共用基础页（登录等）
├── src/
│   ├── main.tsx
│   └── App.tsx                  # 根据 storeId 解析模板 → 注入路由
├── vite.config.ts
└── package.json
```

`template.config.ts` 示例：
```typescript
export default defineTemplateConfig({
  name: '通用模板',
  version: '1.0.0',
  features: { inventory: true, dividend: false },
  theme: { primary: '#16a34a' },
  routes: [/* 页面注册 */],
});
```

### 5.2 里程碑

| 里程碑 | 内容 |
|--------|------|
| M5.1 | 模板规范 + loader + config schema + default 模板登录页 |
| M5.2 | default 模板全部页面（记账/库存/排班/工资/分红/报表/通知/设置/推送设置） |
| M5.3 | retail-demo 定制示例 + 模板切换机制 |
| M5.4 | 与管理端 API 联调 + 模板开发文档 |

**Phase 5 验收标准**：1 套完整模板；可插拔架构验证；与管理端 API 联调通过；模板开发文档完整。

---

## Phase 6：API 进店通道（方案 B）

**版本**：v0.6.0
**依赖**：Phase 4
**目标**：店铺端通过统一 API 网关与管理端交互，店铺级鉴权与数据隔离。

### 6.1 设计

- 新增 `apps/admin/server/src/routes/gateway/` 进店 API
- 鉴权：店铺级 Token（`store_token`，每个店铺独立），与用户 JWT 并存
- 中间件 `store-token-auth.ts`：校验 token → 注入 `storeId` → 强制所有查询带 `storeId` 过滤
- 限流：按 token 维度限流（express-rate-limit）
- 路由前缀 `/api/gateway/v1/*`

### 6.2 进店 API 清单

```
GET    /api/gateway/v1/store                本店信息
GET    /api/gateway/v1/entries              POST 新增
GET    /api/gateway/v1/inventory
GET    /api/gateway/v1/shifts
GET    /api/gateway/v1/payroll
GET    /api/gateway/v1/reports/daily
GET    /api/gateway/v1/notifications
PUT    /api/gateway/v1/push/settings
```

### 6.3 里程碑

| 里程碑 | 内容 |
|--------|------|
| M6.1 | 网关鉴权 + 限流 + 数据隔离中间件 |
| M6.2 | 全部进店 API 实现 + 单测（含隔离测试） |
| M6.3 | 店铺端切换为进店 API + 错误处理 + 离线缓存（可选） |
| M6.4 | API 文档（OpenAPI） |

**Phase 6 验收标准**：进店 API 完整；店铺 A 无法访问店铺 B 数据；OpenAPI 文档完整。

---

## Phase 7：CI/CD + 部署体系

**版本**：v1.0.0
**依赖**：Phase 4
**目标**：生产可用，正式版发布。

### 7.1 CI 流水线（.github/workflows/ci.yml）

```yaml
jobs:
  quality:
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4  (node 20, cache: pnpm)
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: ppm typecheck
      - run: pnpm test:coverage
      - run: pnpm build:packages
  build-images:
    needs: quality
    strategy: { matrix: { arch: [amd64, arm64] } }
    steps:
      - uses: docker/build-push-action  (多架构 buildx)
      - push 到 GHCR
```

### 7.2 部署体系

- `apps/admin/Dockerfile`：多阶段构建（build web → 拷产物到 server 镜像）
- `docker-compose.yml`：volume 挂载 data/uploads/web-dist（对应 ARCHITECTURE 7.1）
- 一键部署脚本 `scripts/deploy.sh`
- 备份脚本 `scripts/backup.sh`（SQLite 文件 + uploads）

### 7.3 升级体系

- Web UI 上传 ZIP → `src-seed` 原子替换 → DB migrate → 重启
- 版本检查接口 `GET /api/upgrade/check`
- 回滚：保留上一版本 src 目录，失败自动切回

### 7.4 监控

- `GET /api/health` 健康检查
- 访问日志（morgan）+ 错误日志（写文件 + 滚动）
- 可选：Prometheus 指标

### 7.5 里程碑

| 里程碑 | 内容 |
|--------|------|
| M7.1 | CI 流水线（lint/typecheck/test/build） |
| M7.2 | 多架构 Docker 镜像 + Registry 推送 |
| M7.3 | docker-compose 部署 + 备份恢复脚本 + 文档 |
| M7.4 | 升级体系 + 健康检查 + 监控 |
| M7.5 | v1.0.0 正式发布 |

**Phase 7 验收标准**：CI 每 PR 自动检查；镜像自动构建发布；一键部署可用；升级可回滚；文档齐全；v1.0.0 发布。

---

## 2. 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| Phase 4 为关键长路径，延期影响 5/6/7 | 高 | Phase 2/3 并行；4.1 后端先行，前端可并行开发用 Mock |
| Tailwind v4 与 Storybook 兼容 | 中 | M2.1 即验证；必要时锁定 v3 |
| SQLite 单库多店并发写 | 中 | better-sqlite3 同步事务 + WAL 模式；预留 PG 迁移路径 |
| 推送渠道限流/封禁 | 中 | 队列重试 + 降级；多渠道并存 |
| 升级过程中断电 | 高 | 原子替换 + 保留旧版本 + 启动自检 |
| 模板可插拔过度设计 | 中 | 先实现 default，定制示例后再抽象 |

## 3. 版本里程碑汇总

| 版本 | 阶段完成 | 关键交付 |
|------|---------|---------|
| v0.2.0 | Phase 2 | @msp/ui 17 组件 + Storybook |
| v0.3.0 | Phase 3 | @msp/push-core + 3 渠道 + 调度 |
| v0.4.0 | Phase 4 | apps/admin 管理端完整 |
| v0.5.0 | Phase 5 | apps/store-template + 1 套模板 |
| v0.6.0 | Phase 6 | API 进店通道 + OpenAPI |
| v1.0.0 | Phase 7 | CI/CD + 部署 + 升级体系，正式发布 |

## 4. 立即可执行的第一步

1. 完成第 0.1 节仓库级基础设施（ESLint/Prettier/Vitest/CI 雏形）
2. 创建 `packages/ui` 与 `packages/push-core` 空脚手架（package.json + tsconfig + vite.config）
3. 并行启动 Phase 2 的 M2.1 与 Phase 3 的 M3.1
