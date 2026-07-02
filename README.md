# multi-shop-platform

> 管理端与店铺端分离的可插拔多店管理系统 monorepo

## 项目简介

multi-shop-platform 是一个多店铺管理平台，采用 monorepo 架构，将管理端（Admin）与店铺端（Store）完全分离，店铺端设计为可插拔模板，支持灵活定制。

## 为什么拆分成新仓库

本项目从 [multi-store-manager](https://github.com/MingTu01/multi-store-manager) (v2.1.4) 拆分而来，拆分动机如下：

1. **架构解耦**：原仓库管理端和店铺端耦合在同一应用中，难以独立开发、部署和迭代
2. **可插拔模板**：店铺端需要做成可插拔模板，支持不同行业、不同规模的店铺快速定制
3. **共享层沉淀**：将类型、权限、工具函数、状态管理等通用逻辑抽离为独立的 shared 包，两端复用
4. **独立部署**：管理端和店铺端可以独立部署、独立扩缩容
5. **多端扩展**：为未来原生 App、小程序等多端形态预留架构空间

## 技术栈一览

| 类别 | 技术 | 版本 |
|------|------|------|
| 包管理 | pnpm | >= 9.0.0 |
| Monorepo | pnpm workspace | - |
| 语言 | TypeScript | ^5.6.0 |
| 前端框架 | React | ^19.0.0 |
| 状态管理 | zustand | ^5.0.0 |
| 构建工具 | Vite | - |
| 后端框架 | Express | - |
| 数据库 | SQLite + better-sqlite3 | - |
| 运行时 | Node.js | >= 20.0.0 |

## 快速开始

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### 安装依赖

```bash
pnpm install
```

### 类型检查

```bash
pnpm run typecheck
```

### 构建所有包

```bash
pnpm run build:packages
```

### 构建单个包

```bash
# 构建 shared 包
pnpm run build:shared

# 构建 UI 组件库（待实现）
pnpm run build:ui

# 构建 push-core 包（待实现）
pnpm run build:push-core
```

### 清理

```bash
pnpm run clean
```

## 目录结构总览

```
multi-shop-platform/
├── packages/              # 共享包（可被 apps 下的应用引用）
│   ├── shared/           # 核心共享逻辑包（纯逻辑，无 UI）
│   ├── ui/               # UI 组件库（待实现）
│   └── push-core/        # 推送核心包（待实现）
│
├── apps/                  # 应用层（可独立部署的应用）
│   ├── admin/            # 管理端应用（待迁移）
│   └── store-template/   # 店铺端模板（待实现）
│
├── package.json           # 根 package.json
├── pnpm-workspace.yaml    # pnpm workspace 配置
├── tsconfig.base.json     # 根 TypeScript 配置
└── pnpm-lock.yaml         # 依赖锁定文件
```

### 两层架构说明

- **packages/ 层**：共享库，提供可复用的代码单元，不直接部署
  - `shared`：类型定义、角色权限、工具函数、API client、状态管理、SSE、推送配置
  - `ui`：通用 UI 组件库（基于 shared）
  - `push-core`：推送核心逻辑 + Repo 接口注入

- **apps/ 层**：应用层，可独立部署的完整应用
  - `admin`：管理端（后端 + 前端），面向系统管理员和店铺管理员
  - `store-template`：店铺端模板，可插拔设计，面向店长、员工、股东

## 与旧仓库 multi-store-manager 的关系

| 维度 | multi-store-manager (v2.1.4) | multi-shop-platform (v0.1.0) |
|------|------------------------------|------------------------------|
| 架构 | 单仓库，管理端+店铺端耦合 | Monorepo，两端完全分离 |
| 代码组织 | 单应用 | packages/* + apps/* 两层 |
| 店铺端 | 内置在管理端中 | 独立的可插拔模板 |
| 共享逻辑 | 散落在各处 | 统一沉淀到 @msp/shared |
| 推送系统 | 与业务耦合 | 独立 push-core 包（待实现） |
| UI 组件 | 分散在各页面 | 独立 ui 组件库（待实现） |

### 迁移路线

本仓库是旧仓库的继任者，迁移计划：
1. Phase 1（已完成）：搭建 monorepo 骨架，抽离 shared 共享包
2. Phase 2（进行中）：UI 组件库建设
3. Phase 3：推送核心包抽离
4. Phase 4：管理端完整迁移
5. Phase 5：店铺端模板化
6. Phase 6：API 进店通道
7. Phase 7：CI/CD + 部署体系

## 当前状态：v0.1.0

当前处于 **v0.1.0 骨架阶段**，已完成：

- pnpm workspace monorepo 骨架搭建
- TypeScript 基础配置
- `@msp/shared` 包核心模块：
  - `types/`：实体类型定义（StoreInfo、Entry、UserInfo、Notification 等）
  - `role/`：角色常量、权限矩阵、角色配置
  - `utils/`：格式化工具、网络安全（SSRF 防护）
  - `api/`：API client + LRU 缓存 + 401 自动重定向
  - `stores/`：auth store、data-sync store、notification store、未读轮询 hook
  - `sse/`：EventSource + leader 选举 + BroadcastChannel 多 Tab 同步
  - `push-config/`：16 种推送类型完整配置（单一来源）

尚未开始：
- UI 组件库（@msp/ui）
- 推送核心包（@msp/push-core）
- 管理端应用（apps/admin）
- 店铺端模板（apps/store-template）
- CI/CD 流水线
- 部署体系

## 文档索引

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 架构设计文档
- [PACKAGES.md](./PACKAGES.md) - 包详细说明
- [ROADMAP.md](./ROADMAP.md) - 版本路线图
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - 完整实施计划（Phase 2~7 细化）

## License

MIT
