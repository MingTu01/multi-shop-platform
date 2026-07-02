// 模板管理路由（Phase 5 扩展：导入/导出/在线导入/更新/分配）
import { Router } from 'express';
import type { Database as DB } from 'better-sqlite3';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { sseManager } from '../services/sse-manager.js';
import { assertSafeUrl } from '@msp/push-core';

// 可序列化的模板配置 schema（不含组件引用，用于服务端存储与交换）
const RouteItemSchema = z.object({
  path: z.string(),
  label: z.string(),
});

const TemplateConfigJsonSchema = z.object({
  name: z.string(),
  version: z.string(),
  features: z.object({
    inventory: z.boolean().default(true),
    shifts: z.boolean().default(true),
    payroll: z.boolean().default(true),
    dividends: z.boolean().default(true),
    reports: z.boolean().default(true),
    notifications: z.boolean().default(true),
    pushSettings: z.boolean().default(true),
  }).default({}),
  theme: z.object({
    primary: z.string().default('#16a34a'),
  }).default({}),
  routes: z.array(RouteItemSchema).default([]),
});

export interface TemplateRow {
  id: string;
  name: string;
  version: string;
  config_json: string;
  description: string | null;
  source: string;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

// 将行转换为对外输出（解析 config_json）
function rowToTemplate(row: TemplateRow) {
  let config: any = null;
  try {
    config = JSON.parse(row.config_json);
  } catch {
    config = {};
  }
  return {
    id: row.id,
    name: row.name,
    version: row.version,
    description: row.description,
    source: row.source,
    source_url: row.source_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    config,
  };
}

// 生成唯一模板 id
function genTemplateId(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().slice(0, 20) || 'tpl';
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}`;
}

// 校验配置并返回标准化 JSON 字符串
function validateConfig(config: unknown): { name: string; version: string; configJson: string } {
  const parsed = TemplateConfigJsonSchema.parse(config);
  return {
    name: parsed.name,
    version: parsed.version,
    configJson: JSON.stringify(parsed),
  };
}

export function createTemplatesRouter(db: DB): Router {
  const router = Router();

  // 列表
  router.get('/', requireAuth, (_req, res) => {
    const rows = db.prepare('SELECT * FROM templates ORDER BY updated_at DESC').all() as TemplateRow[];
    res.json(rows.map(rowToTemplate));
  });

  // 单个
  router.get('/:id', requireAuth, (req, res, next) => {
    try {
      const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id) as TemplateRow | undefined;
      if (!row) throw new ApiError(404, '模板不存在');
      res.json(rowToTemplate(row));
    } catch (e) {
      next(e);
    }
  });

  // 新建（手动）
  router.post('/', requireAuth, requireRole('ADMIN'), (req, res, next) => {
    try {
      const { id, config, description } = req.body as any;
      const { name, version, configJson } = validateConfig(config);
      const tplId = id || genTemplateId(name);
      const exists = db.prepare('SELECT 1 FROM templates WHERE id = ?').get(tplId);
      if (exists) throw new ApiError(409, '模板 id 已存在');
      db.prepare(
        'INSERT INTO templates (id, name, version, config_json, description, source) VALUES (?, ?, ?, ?, ?, ?)',
      ).run(tplId, name, version, configJson, description || null, 'manual');
      const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(tplId) as TemplateRow;
      res.json(rowToTemplate(row));
    } catch (e) {
      next(e);
    }
  });

  // 更新
  router.put('/:id', requireAuth, requireRole('ADMIN'), (req, res, next) => {
    try {
      const exists = db.prepare('SELECT 1 FROM templates WHERE id = ?').get(req.params.id);
      if (!exists) throw new ApiError(404, '模板不存在');
      const { config, description } = req.body as any;
      const { name, version, configJson } = validateConfig(config);
      db.prepare(
        'UPDATE templates SET name = ?, version = ?, config_json = ?, description = COALESCE(?, description), updated_at = datetime(\'now\') WHERE id = ?',
      ).run(name, version, configJson, description ?? null, req.params.id);
      const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id) as TemplateRow;
      sseManager.broadcastDataChange({ type: 'template', storeId: req.params.id });
      res.json(rowToTemplate(row));
    } catch (e) {
      next(e);
    }
  });

  // 删除
  router.delete('/:id', requireAuth, requireRole('ADMIN'), (req, res, next) => {
    try {
      const row = db.prepare('SELECT 1 FROM templates WHERE id = ?').get(req.params.id);
      if (!row) throw new ApiError(404, '模板不存在');
      if (req.params.id === 'default' || req.params.id === 'retail-demo') {
        throw new ApiError(400, '内置模板不可删除');
      }
      db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);
      db.prepare('DELETE FROM store_template_assignments WHERE template_id = ?').run(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  // 导出（下载 JSON）
  router.get('/:id/export', requireAuth, (req, res, next) => {
    try {
      const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id) as TemplateRow | undefined;
      if (!row) throw new ApiError(404, '模板不存在');
      const payload = rowToTemplate(row);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${row.id}-${row.version}.json"`);
      res.json(payload);
    } catch (e) {
      next(e);
    }
  });

  // 导入（上传 JSON 内容，body 直接放整份导出的 JSON）
  router.post('/import', requireAuth, requireRole('ADMIN'), (req, res, next) => {
    try {
      const payload = req.body as any;
      // 兼容导出格式：{ id, name, version, config, ... } 或纯 config
      const config = payload.config || payload;
      const { name, version, configJson } = validateConfig(config);
      const newId = payload.id && payload.id !== 'default' && payload.id !== 'retail-demo'
        ? payload.id + '-' + Math.random().toString(36).slice(2, 6)
        : genTemplateId(name);
      db.prepare(
        'INSERT INTO templates (id, name, version, config_json, description, source, source_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ).run(
        newId,
        name,
        version,
        configJson,
        payload.description || '导入的模板',
        'import',
        null,
      );
      const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(newId) as TemplateRow;
      res.json(rowToTemplate(row));
    } catch (e) {
      next(e);
    }
  });

  // 在线导入（从 URL 拉取 JSON）
  router.post('/import-url', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
    try {
      const { url } = req.body as { url: string };
      if (!url) throw new ApiError(400, 'url 必填');
      await assertSafeUrl(url);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      let resp: Response;
      try {
        resp = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
      } finally {
        clearTimeout(timer);
      }
      if (!resp.ok) throw new ApiError(502, `远端返回 ${resp.status}`);
      const payload = await resp.json();
      const config = payload.config || payload;
      const { name, version, configJson } = validateConfig(config);
      const newId = genTemplateId(name);
      db.prepare(
        'INSERT INTO templates (id, name, version, config_json, description, source, source_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ).run(
        newId,
        name,
        version,
        configJson,
        payload.description || '在线导入的模板',
        'online',
        url,
      );
      const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(newId) as TemplateRow;
      res.json(rowToTemplate(row));
    } catch (e) {
      next(e);
    }
  });

  // 分配模板给店铺
  router.post('/:id/assign', requireAuth, requireRole('ADMIN'), (req, res, next) => {
    try {
      const { storeId } = req.body as { storeId: string };
      if (!storeId) throw new ApiError(400, 'storeId 必填');
      const tpl = db.prepare('SELECT 1 FROM templates WHERE id = ?').get(req.params.id);
      if (!tpl) throw new ApiError(404, '模板不存在');
      const store = db.prepare('SELECT 1 FROM stores WHERE id = ?').get(storeId);
      if (!store) throw new ApiError(404, '店铺不存在');
      db.prepare('INSERT OR REPLACE INTO store_template_assignments (store_id, template_id) VALUES (?, ?)').run(storeId, req.params.id);
      sseManager.broadcastDataChange({ type: 'template', storeId });
      res.json({ ok: true, store_id: storeId, template_id: req.params.id });
    } catch (e) {
      next(e);
    }
  });

  // 查询店铺分配的模板
  router.get('/store/:storeId', requireAuth, (req, res, next) => {
    try {
      const assign = db.prepare('SELECT template_id FROM store_template_assignments WHERE store_id = ?').get(req.params.storeId) as { template_id: string } | undefined;
      if (!assign) {
        // 未分配时返回 default
        const row = db.prepare('SELECT * FROM templates WHERE id = ?').get('default') as TemplateRow | undefined;
        if (!row) return res.json({ template_id: 'default', config: null });
        return res.json({ template_id: 'default', ...rowToTemplate(row) });
      }
      const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(assign.template_id) as TemplateRow | undefined;
      if (!row) throw new ApiError(404, '分配的模板不存在');
      res.json({ template_id: row.id, ...rowToTemplate(row) });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
