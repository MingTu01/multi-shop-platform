# PACKAGES.md - 包详细说明

## 包依赖图

```
apps/admin ──────┐
                  ├────► @msp/ui ──────┐
apps/store-tpl ──┘                     ├────► @msp/shared
                  ┌────────────────────┘
@msp/push-core ───┘
```

**依赖方向**：
- `@msp/shared` 是最底层包，无内部依赖
- `@msp/ui` 依赖 `@msp/shared`
- `@msp/push-core` 依赖 `@msp/shared`
- `apps/*` 可依赖任意共享包

---

## @msp/shared 详细说明

> 核心共享逻辑包，纯 TypeScript + 少量 React hooks，无 UI 依赖
> 包名：`@msp/shared`
> 版本：`0.1.0`
> 位置：`packages/shared/`

### 目录结构

```
packages/shared/src/
├── index.ts              # 统一出口
├── push-config.ts        # 推送类型配置（单一来源）
├── types/                # 类型定义
│   ├── index.ts
│   └── notify.ts
├── role/                 # 角色与权限
│   ├── index.ts
│   ├── constants.ts
│   ├── permissions.ts
│   └── labels.ts
├── utils/                # 工具函数
│   ├── index.ts
│   ├── format.ts
│   └── network.ts
├── api/                  # API client
│   ├── index.ts
│   └── config.ts
├── stores/               # 状态管理（zustand）
│   ├── index.ts
│   ├── data.ts           # auth store
│   ├── data-sync.ts      # 数据同步版本号
│   ├── notification.ts   # 通知 store
│   └── useUnreadPolling.ts
└── sse/                  # SSE 客户端
    └── index.ts
```

### 导出入口配置

在 `package.json` 中配置了子路径导出：

| 导入路径 | 对应模块 |
|---------|---------|
| `@msp/shared` | 全部导出 |
| `@msp/shared/types` | 类型定义 |
| `@msp/shared/role` | 角色与权限 |
| `@msp/shared/utils` | 工具函数 |
| `@msp/shared/api` | API client |
| `@msp/shared/stores` | 状态管理 |
| `@msp/shared/sse` | SSE 客户端 |
| `@msp/shared/push-config` | 推送配置 |

---

### 1. types/ 模块

**文件路径**：`packages/shared/src/types/`

**用途**：全局 TypeScript 类型定义的唯一来源，管理端和店铺端共用。

#### 1.1 types/notify.ts

**关键导出**：

| 导出 | 类型 | 说明 |
|------|------|------|
| `Role` | type | 角色类型联合：`'ADMIN' \| 'STORE_ADMIN' \| 'MANAGER' \| 'STAFF' \| 'SHAREHOLDER'` |
| `NotifyType` | type | 通知类型联合，共 17 种（见下方列表） |
| `NotifyParams` | interface | 通知触发参数 |

**NotifyType 完整列表**：
- `entry` - 记账
- `payroll` - 工资
- `dividend` - 分红
- `inventory` - 库存
- `shift` - 排班/开闭店
- `health_cert` - 健康证
- `staff` - 员工
- `store` - 门店
- `purchase` - 进货
- `salary_confirm` - 工资确认
- `inventory_alert` - 库存预警
- `store_alert` - 门店预警
- `daily_report` - 每日经营简报
- `weekly_report` - 每周经营报告
- `monthly_report` - 月度经营报告
- `review_reminder` - 审核提醒
- `alert` - 系统告警

**使用示例**：
```typescript
import type { Role, NotifyType } from '@msp/shared/types';

const role: Role = 'ADMIN';
const type: NotifyType = 'daily_report';
```

#### 1.2 types/index.ts

**关键导出**：

| 导出 | 类型 | 说明 |
|------|------|------|
| `StoreInfo` | interface | 店铺信息 |
| `Shareholder` | interface | 股东信息 |
| `Entry` | interface | 记账条目 |
| `UserInfo` | interface | 用户信息 |
| `InventoryItem` | interface | 库存项 |
| `Notification` | interface | 通知 |
| `UserPushSettings` | interface | 用户推送设置 |

**使用示例**：
```typescript
import type { StoreInfo, Entry } from '@msp/shared/types';

const store: StoreInfo = {
  id: 'S001',
  name: '示例店铺',
  is_open: 1,
};
```

---

### 2. role/ 模块

**文件路径**：`packages/shared/src/role/`

**用途**：角色常量、权限判断函数、权限矩阵、角色显示配置。

#### 2.1 role/constants.ts

**关键导出**：

| 导出 | 类型 | 说明 |
|------|------|------|
| `ROLES` | const object | 角色常量对象（as const） |
| `isAdmin(role)` | function | 判断是否是系统管理员 |
| `isStoreAdmin(role)` | function | 判断是否是店铺管理员及以上 |
| `isManagerOrAbove(role)` | function | 判断是否是店长及以上 |
| `isReadonly(role)` | function | 判断是否是只读角色（股东） |
| `entryFilterClause(role)` | function | 返回 SQL 过滤子句（当前返回空） |

**使用示例**：
```typescript
import { ROLES, isAdmin, isManagerOrAbove } from '@msp/shared/role';

if (isAdmin(user.role)) {
  // 管理员专属操作
}

if (isManagerOrAbove(user.role)) {
  // 店长及以上可操作
}
```

#### 2.2 role/permissions.ts

**关键导出**：

| 导出 | 类型 | 说明 |
|------|------|------|
| `canAccess(key, role)` | function | 检查某功能/路由的访问权限 |
| `PermissionKey` | type | 权限键类型（string） |
| `ROLE_ALLOWED_TYPES` | Record | 角色 -> 允许接收的通知类型 |
| `isContentTypeAllowed(role, type)` | function | 检查某角色是否能接收某类型通知 |

**权限矩阵（部分）**：

| 权限键 | 允许角色 | 说明 |
|--------|---------|------|
| `dashboard` | ADMIN, STORE_ADMIN, MANAGER | 仪表盘 |
| `stores` | 所有角色 | 店铺列表 |
| `notifications` | 所有角色 | 通知中心 |
| `upgrade` | ADMIN | 升级管理 |
| `adminSettings` | ADMIN | 系统设置 |
| `storeDividends` | ADMIN, STORE_ADMIN, SHAREHOLDER | 分红管理 |
| `storeStaff` | ADMIN, STORE_ADMIN, MANAGER | 员工管理 |
| `storeAdmin` | ADMIN, STORE_ADMIN | 店铺管理后台 |

**使用示例**：
```typescript
import { canAccess, isContentTypeAllowed } from '@msp/shared/role';

if (canAccess('upgrade', user.role)) {
  // 显示升级入口
}

if (isContentTypeAllowed(user.role, 'daily_report')) {
  // 订阅日报推送
}
```

#### 2.3 role/labels.ts

**关键导出**：

| 导出 | 类型 | 说明 |
|------|------|------|
| `ROLE_CONFIG` | Record | 角色显示配置（label + color + bg） |
| `getRoleLabel(role)` | function | 获取角色中文名 |
| `getRoleColor(role)` | function | 获取角色文字颜色（Tailwind class） |
| `getRoleBg(role)` | function | 获取角色背景色（Tailwind class） |

**ROLE_CONFIG 结构**：

| 角色 | label | color | bg |
|------|-------|-------|-----|
| ADMIN | 系统管理员 | text-amber-700 | bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 |
| STORE_ADMIN | 店铺管理员 | text-sky-700 | bg-sky-50 |
| MANAGER | 店长 | text-emerald-700 | bg-emerald-50 |
| STAFF | 员工 | text-slate-600 | bg-slate-100 |
| SHAREHOLDER | 股东 | text-violet-700 | bg-violet-50 |

**使用示例**：
```typescript
import { getRoleLabel, getRoleColor, ROLE_CONFIG } from '@msp/shared/role';

const label = getRoleLabel('ADMIN'); // '系统管理员'
const color = getRoleColor('MANAGER'); // 'text-emerald-700'
```

---

### 3. utils/ 模块

**文件路径**：`packages/shared/src/utils/`

**用途**：通用工具函数，包括格式化和网络安全。

#### 3.1 utils/format.ts

**关键导出**：

| 导出 | 签名 | 说明 |
|------|------|------|
| `formatMoney(n)` | (number) => string | 金额格式化，自动万进制，支持负数 |
| `formatDate(d)` | (string\|Date) => string | 日期格式化（YYYY-MM-DD） |
| `formatTime(d)` | (string\|Date) => string | 时间格式化（HH:mm） |
| `localDate(d?)` | (Date?) => string | 本地日期字符串 YYYY-MM-DD |
| `localDateTime()` | () => string | 本地日期时间字符串 YYYY-MM-DD HH:mm:ss |

**使用示例**：
```typescript
import { formatMoney, formatDate, localDate } from '@msp/shared/utils';

formatMoney(12345.67); // '1.23万'
formatMoney(-500); // '-500.00'
formatDate('2024-01-15T10:30:00Z'); // '2024/01/15'
localDate(); // '2024-01-15'
```

#### 3.2 utils/network.ts

**关键导出**：

| 导出 | 签名 | 说明 |
|------|------|------|
| `isPrivateIp(hostname)` | (string) => boolean | 检查 IP 是否为内网/私有地址 |
| `validateWebhookUrl(url)` | (string) => {valid, error?} | 同步校验 webhook URL 安全性 |
| `validateWebhookUrlAsync(url)` | (string) => Promise<{valid, error?}> | 异步校验（含 DNS 解析） |

**SSRF 防护覆盖范围**：
- IPv4 内网：10.x、172.16-31.x、192.168.x、127.x、169.254.x
- IPv6 内网：fc/fd 开头、fe80 开头、::1
- 特殊地址：localhost、云元数据地址
- DNS 解析后二次校验（异步版本）

**使用示例**：
```typescript
import { validateWebhookUrl, validateWebhookUrlAsync } from '@msp/shared/utils';

// 同步校验
const result = validateWebhookUrl('https://example.com/webhook');
if (!result.valid) {
  console.error(result.error);
}

// 异步校验（含 DNS 解析）
const asyncResult = await validateWebhookUrlAsync('https://example.com/webhook');
```

---

### 4. api/ 模块

**文件路径**：`packages/shared/src/api/`

**用途**：统一的 API 客户端，内置 LRU 缓存、401 自动重定向、原生 App 模式支持。

#### 4.1 api/config.ts

**关键导出**：

| 导出 | 签名 | 说明 |
|------|------|------|
| `getBaseURL()` | () => string | 获取 API 基础 URL |
| `setServerURL(url)` | (string) => void | 设置服务器地址（原生 App） |
| `getServerURL()` | () => string | 获取已设置的服务器地址 |
| `clearServerURL()` | () => void | 清除服务器地址 |
| `isNativeApp()` | () => boolean | 是否是原生 App 环境 |

**模式说明**：
- **Web 模式**（同源）：返回空字符串，使用相对路径
- **原生 App 模式**（Capacitor）：返回 localStorage 中配置的服务器 URL，CapacitorHttp 原生发送请求（无 CORS）

**使用示例**：
```typescript
import { getBaseURL, setServerURL, isNativeApp } from '@msp/shared/api';

if (isNativeApp()) {
  setServerURL('https://api.example.com');
}

const base = getBaseURL();
```

#### 4.2 api/index.ts

**关键导出**：

| 导出 | 类型 | 说明 |
|------|------|------|
| `api.get(url, opts?)` | async function | GET 请求，带缓存 |
| `api.post(url, body)` | async function | POST 请求，自动失效相关缓存 |
| `api.put(url, body)` | async function | PUT 请求，自动失效相关缓存 |
| `api.del(url, body?)` | async function | DELETE 请求，自动失效相关缓存 |
| `api.upload(url, formData)` | async function | 文件上传 |
| `invalidateCache(pattern?)` | function | 清除缓存（可选匹配模式） |
| `resetRedirectFlag()` | function | 重置 401 重定向标志 |

**缓存特性**：
- LRU 策略，最大 200 条
- 按 URL 维度配置 TTL（3s ~ 5min）
- 写操作（POST/PUT/DELETE）自动失效相关路径缓存
- 缓存键为完整 URL（含查询参数）

**TTL 配置（部分）**：

| URL 模式 | TTL | 说明 |
|---------|-----|------|
| `/categories` | 60s | 分类数据 |
| `/auth/me` | 300s | 用户信息 |
| `/stores$` | 30s | 店铺列表 |
| `/dashboard` | 5s | 仪表盘 |
| `/entries` | 3s | 记账条目 |
| `/notifications/` | 3s | 通知 |

**401 处理**：
- 非登录页遇到 401 自动跳转登录页
- 防重入：5 秒内只跳转一次
- 登出后重置标志

**使用示例**：
```typescript
import { api, invalidateCache } from '@msp/shared/api';

// GET 请求（自动缓存）
const stores = await api.get('/stores');

// POST 请求（自动失效缓存）
const newEntry = await api.post('/stores/S001/entries', entryData);

// 手动清除缓存
invalidateCache('/stores/S001');
invalidateCache(); // 清除全部
```

---

### 5. stores/ 模块

**文件路径**：`packages/shared/src/stores/`

**用途**：基于 zustand 的共享状态管理。

#### 5.1 stores/data.ts（Auth Store）

**关键导出**：

| 导出 | 类型 | 说明 |
|------|------|------|
| `useStore` | zustand store | 认证状态 store |
| `User` | interface | 用户类型（store 内部用） |

**State 结构**：
- `user: User | null` - 当前用户
- `token: string | null` - token（cookie 模式为 'cookie'）
- `loading: boolean` - 加载状态

**Action 方法**：
- `login(username, password)` - 登录
- `logout()` - 登出（清缓存 + 断 SSE + 跳登录）
- `restore()` - 恢复会话（页面加载时调用，重试 3 次）

**使用示例**：
```typescript
import { useStore } from '@msp/shared/stores';

function UserProfile() {
  const user = useStore(s => s.user);
  const logout = useStore(s => s.logout);

  return (
    <div>
      <span>{user?.name}</span>
      <button onClick={logout}>退出</button>
    </div>
  );
}
```

#### 5.2 stores/data-sync.ts

**关键导出**：

| 导出 | 类型 | 说明 |
|------|------|------|
| `useDataSync` | zustand store | 数据同步版本号 store |
| `useDataVersion(scope, storeId?)` | React hook | 获取指定作用域的版本号 |

**State 结构**：
- `version: number` - 全局数据版本
- `storeVersions: Record<string, number>` - 单店铺数据版本
- `notificationVersion: number` - 通知版本

**Action 方法**：
- `bumpGlobal()` - 全局版本 +1
- `bumpStore(storeId)` - 指定店铺版本 +1
- `bumpNotifications()` - 通知版本 +1

**设计目的**：
- 用于 SSE 数据变更通知后，触发组件重新拉取数据
- 避免在 store 中存储大量数据，仅用版本号作为失效标记

**使用示例**：
```typescript
import { useDataVersion, useDataSync } from '@msp/shared/stores';

function StoreEntries({ storeId }) {
  const version = useDataVersion('store', storeId);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    // 版本号变化时重新拉取
    fetchEntries(storeId).then(setEntries);
  }, [storeId, version]);

  return <EntryList entries={entries} />;
}
```

#### 5.3 stores/notification.ts

**关键导出**：

| 导出 | 类型 | 说明 |
|------|------|------|
| `useNotificationStore` | zustand store | 通知状态 store |

**State 结构**：
- `unreadCount: number` - 未读通知数

**Action 方法**：
- `fetchUnread()` - 拉取未读数（静默请求）
- `decrementUnread(n?)` - 未读数 -n
- `resetUnread()` - 未读数归零

**使用示例**：
```typescript
import { useNotificationStore } from '@msp/shared/stores';

function NotifBadge() {
  const count = useNotificationStore(s => s.unreadCount);
  return count > 0 ? <span className="badge">{count}</span> : null;
}
```

#### 5.4 stores/useUnreadPolling.ts

**关键导出**：

| 导出 | 类型 | 说明 |
|------|------|------|
| `useUnreadPolling()` | React hook | 未读通知轮询 hook |

**功能**：
- 组件挂载时立即拉取一次未读数
- 每 30 秒轮询一次
- 组件卸载时清理定时器
- 作为 SSE 的降级方案

**使用示例**：
```typescript
import { useUnreadPolling } from '@msp/shared/stores';

function App() {
  useUnreadPolling(); // 放在根组件
  return <Layout />;
}
```

---

### 6. sse/ 模块

**文件路径**：`packages/shared/src/sse/index.ts`

**用途**：SSE（Server-Sent Events）客户端，支持多 Tab leader 选举。

**关键导出**：

| 导出 | 类型 | 说明 |
|------|------|------|
| `useSSE()` | React hook | 订阅 SSE 连接状态 |
| `disconnectSSE()` | function | 断开 SSE 连接 |
| `reconnectSSE()` | function | 重连 SSE |
| `cleanupSSEListeners()` | function | 清理全局事件监听器 |
| `ConnectionStatus` | type | 连接状态类型 |

**ConnectionStatus 类型**：
```typescript
type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';
```

**核心特性**：
- **Leader 选举**：多 Tab 下只有一个 leader 维护 SSE 连接
- **BroadcastChannel**：leader 收到消息后广播给所有 Tab
- **心跳机制**：leader 每 2s 写心跳，5s TTL
- **自动接管**：leader 关闭后，其他 Tab 自动竞选新 leader
- **指数退避重连**：断线后自动重连，最大延迟 60s
- **20 次最大重试**：超过后停止重连

**SSE 事件处理**：

| 事件 | 处理逻辑 |
|------|---------|
| `data-change` | bump 对应版本 + 清除相关 API 缓存 |
| `system` | 派发 CustomEvent（如 server-ready） |
| `message` | 通用消息（默认事件） |
| `heartbeat` | 忽略，保持连接活跃 |

**data-change 事件数据结构**：
- `type: string` - 数据类型（entry/inventory/shift 等）
- `storeId?: string` - 店铺 ID
- `unreadCount?: number` - 未读数

**使用示例**：
```typescript
import { useSSE, reconnectSSE, disconnectSSE } from '@msp/shared/sse';

function App() {
  const status = useSSE();

  return (
    <div>
      SSE 状态：{status}
    </div>
  );
}

// 登录成功后重连
reconnectSSE();

// 登出时断开
disconnectSSE();
```

---

### 7. push-config/ 模块

**文件路径**：`packages/shared/src/push-config.ts`

**用途**：推送类型配置的单一来源，整合了通知类型、推送字段、角色权限、UI 配置。

**关键导出**：

| 导出 | 类型 | 说明 |
|------|------|------|
| `PUSH_TYPE_CONFIGS` | PushTypeConfig[] | 16 种推送类型完整配置 |
| `PushTypeConfig` | interface | 推送类型配置结构 |
| `PushCategory` | type | 推送分类（4 类） |
| `CATEGORY_COLORS` | Record | 分类颜色配置 |
| `TYPE_TO_PUSH_FIELD` | Record | 通知类型 -> 推送字段名 |
| `getNotifyTitle(type)` | function | 获取通知标题 |
| `getNotifyLink(type, storeId?)` | function | 获取通知跳转链接 |
| `PUSH_CHANNELS` | ChannelDef[] | 推送渠道列表 |
| `CHANNEL_TUTORIALS` | Record | 渠道教程链接 |
| `ChannelDef` | interface | 渠道定义 |

#### 7.1 PushTypeConfig 结构

```typescript
interface PushTypeConfig {
  key: string;                // 推送字段名（如 push_daily_report）
  type: NotifyType;           // 通知类型
  label: string;              // 显示标签
  title: string;              // 通知标题
  category: PushCategory;     // 分类
  roles: Role[];              // 允许接收的角色
  priority: 'high' | 'medium' | 'low';
  defaultSelected: boolean;   // 默认是否选中
  link: (storeId?: string) => string; // 跳转链接
}
```

#### 7.2 推送分类（PushCategory）

| 分类 | 颜色 | 包含类型数 |
|------|------|-----------|
| 经营报表 | 蓝色 | 3（日报/周报/月报） |
| 异常审核 | 红色 | 4（告警/审核/库存预警/门店预警） |
| 门店运营 | 绿色 | 6（开闭店/记账/盘点/进货/员工/门店） |
| 人事财务 | 琥珀色 | 3（工资确认/分红/健康证） |

#### 7.3 16 种推送类型一览

| key | type | 分类 | 优先级 | 默认选中 |
|-----|------|------|--------|---------|
| push_daily_report | daily_report | 经营报表 | medium | ✅ |
| push_weekly_report | weekly_report | 经营报表 | low | ❌ |
| push_monthly_report | monthly_report | 经营报表 | low | ❌ |
| push_alert | alert | 异常审核 | high | ✅ |
| push_review_reminder | review_reminder | 异常审核 | medium | ❌ |
| push_inventory_alert | inventory_alert | 异常审核 | high | ✅ |
| push_store_alert | store_alert | 异常审核 | high | ✅ |
| push_openclose_notify | shift | 门店运营 | medium | ✅ |
| push_bookkeeping_notify | entry | 门店运营 | low | ❌ |
| push_inventory_notify | inventory | 门店运营 | low | ❌ |
| push_purchase_notify | purchase | 门店运营 | low | ❌ |
| push_staff | staff | 门店运营 | low | ❌ |
| push_store | store | 门店运营 | low | ❌ |
| push_salary_confirm | salary_confirm | 人事财务 | medium | ✅ |
| push_dividend_notify | dividend | 人事财务 | medium | ✅ |
| push_health_cert | health_cert | 人事财务 | high | ✅ |

#### 7.4 推送渠道

| 渠道 | key | tokenKey | 管理员专属 |
|------|-----|----------|-----------|
| PushPlus | pushplus | pushplus_token | 否 |
| 企业微信 | wecom | wecom_secret | 是 |
| 爱语飞飞 | iyuu | iyuu_token | 否 |

**使用示例**：
```typescript
import {
  PUSH_TYPE_CONFIGS,
  getNotifyTitle,
  getNotifyLink,
  PUSH_CHANNELS,
  CATEGORY_COLORS,
} from '@msp/shared/push-config';

// 获取某类推送配置
const dailyReportConfig = PUSH_TYPE_CONFIGS.find(c => c.type === 'daily_report');

// 获取通知标题
const title = getNotifyTitle('entry'); // '记账通知'

// 获取跳转链接
const link = getNotifyLink('inventory_alert', 'S001');
// '/store/S001/inventory'

// 按分组展示
const categories = ['经营报表', '异常审核', '门店运营', '人事财务'];
categories.forEach(cat => {
  const items = PUSH_TYPE_CONFIGS.filter(c => c.category === cat);
  console.log(cat, items.length);
});
```

---

## @msp/ui（待实现）

> UI 组件库，基于 shared 包，提供通用 UI 组件
> 预计 17 个通用组件

详见 [ROADMAP.md](./ROADMAP.md) Phase 2。

---

## @msp/push-core（待实现）

> 推送核心包，推送逻辑 + Repo 接口注入
> 从管理端抽离，可独立测试和复用

详见 [ROADMAP.md](./ROADMAP.md) Phase 3。
