import "server-only";

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { nowStamp } from "@/lib/format";
import { SEED_WAYBILLS } from "@/lib/samples";
import type {
  LogisticsNode,
  NodeInput,
  Waybill,
  WaybillDetail,
  WaybillFilters,
  WaybillInput,
} from "@/lib/types";

type WaybillRow = {
  id: number;
  tracking_number: string;
  origin: string;
  destination: string;
  customer_name: string;
  customer_phone: string;
  cargo_name: string;
  pieces: number;
  weight_kg: number;
  status: string;
  eta: string;
  remark: string;
  created_at: string;
  updated_at: string;
};

type NodeRow = {
  id: number;
  waybill_id: number;
  event_time: string;
  location: string;
  status: string;
  note: string;
};

type DbGlobal = { db?: DatabaseSync };

const globalForDb = globalThis as typeof globalThis & { __jingrunDb?: DbGlobal };

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "jingrun.db");

function mapWaybill(row: WaybillRow): Waybill {
  return {
    id: Number(row.id),
    trackingNumber: row.tracking_number,
    origin: row.origin,
    destination: row.destination,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    cargoName: row.cargo_name,
    pieces: Number(row.pieces),
    weightKg: Number(row.weight_kg),
    status: row.status,
    eta: row.eta,
    remark: row.remark,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapNode(row: NodeRow): LogisticsNode {
  return {
    id: Number(row.id),
    waybillId: Number(row.waybill_id),
    eventTime: row.event_time,
    location: row.location,
    status: row.status,
    note: row.note,
  };
}

function asRow<T>(value: unknown): T | undefined {
  if (!value || typeof value !== "object") return undefined;
  return value as T;
}

function migrate(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS waybills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_number TEXT NOT NULL UNIQUE,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL DEFAULT '',
      cargo_name TEXT NOT NULL,
      pieces INTEGER NOT NULL DEFAULT 1,
      weight_kg REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      eta TEXT NOT NULL DEFAULT '',
      remark TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      waybill_id INTEGER NOT NULL REFERENCES waybills(id) ON DELETE CASCADE,
      event_time TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS idx_nodes_waybill_time
      ON nodes (waybill_id, event_time, id);
  `);
}

function seed(db: DatabaseSync) {
  const insertWaybill = db.prepare(`
    INSERT INTO waybills (
      tracking_number, origin, destination, customer_name, customer_phone,
      cargo_name, pieces, weight_kg, status, eta, remark, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertNode = db.prepare(`
    INSERT INTO nodes (waybill_id, event_time, location, status, note)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const sample of SEED_WAYBILLS) {
    const first = sample.nodes[0];
    const last = sample.nodes[sample.nodes.length - 1];
    const createdAt = first?.eventTime ?? nowStamp();
    const updatedAt = last?.eventTime ?? createdAt;
    const status = last?.status ?? "已揽收";
    const result = insertWaybill.run(
      sample.trackingNumber,
      sample.origin,
      sample.destination,
      sample.customerName,
      sample.customerPhone,
      sample.cargoName,
      sample.pieces,
      sample.weightKg,
      status,
      sample.eta,
      sample.remark,
      createdAt,
      updatedAt,
    );
    const waybillId = Number(result.lastInsertRowid);
    for (const node of sample.nodes) {
      insertNode.run(waybillId, node.eventTime, node.location, node.status, node.note);
    }
  }
}

export function getDb() {
  if (!globalForDb.__jingrunDb?.db) {
    fs.mkdirSync(dataDir, { recursive: true });
    const isNew = !fs.existsSync(dbPath);
    const db = new DatabaseSync(dbPath);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    migrate(db);
    if (isNew) seed(db);
    globalForDb.__jingrunDb = { db };
  }
  const db = globalForDb.__jingrunDb?.db;
  if (!db) throw new Error("数据库没有打开");
  return db;
}

function withTransaction(work: () => void) {
  const db = getDb();
  db.exec("BEGIN");
  try {
    work();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function nodesFor(waybillId: number) {
  const rows = getDb()
    .prepare(
      `SELECT id, waybill_id, event_time, location, status, note
       FROM nodes
       WHERE waybill_id = ?
       ORDER BY event_time DESC, id DESC`,
    )
    .all(waybillId);
  return rows.map((item) => mapNode(asRow<NodeRow>(item)!));
}

function readWaybill(row: WaybillRow | undefined): WaybillDetail | null {
  if (!row) return null;
  const waybill = mapWaybill(row);
  return { ...waybill, nodes: nodesFor(waybill.id) };
}

export function findWaybillByTracking(trackingNumber: string) {
  const row = asRow<WaybillRow>(
    getDb()
      .prepare(`SELECT * FROM waybills WHERE tracking_number = ? COLLATE NOCASE`)
      .get(trackingNumber.trim()),
  );
  return readWaybill(row);
}

export function findWaybillById(id: number) {
  const row = asRow<WaybillRow>(getDb().prepare(`SELECT * FROM waybills WHERE id = ?`).get(id));
  return readWaybill(row);
}

export function findWaybillsByTrackingNumbers(numbers: string[]) {
  if (numbers.length === 0) return [];
  const placeholders = numbers.map(() => "?").join(", ");
  const rows = getDb()
    .prepare(`SELECT * FROM waybills WHERE tracking_number IN (${placeholders})`)
    .all(...numbers);
  return rows.map((item) => mapWaybill(asRow<WaybillRow>(item)!));
}

function likePattern(value: string) {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

export function listWaybillRows(filters: WaybillFilters) {
  const q = filters.q.trim();
  const status = filters.status.trim();
  const pattern = likePattern(q.toLowerCase());
  const rows = getDb()
    .prepare(
      `SELECT * FROM waybills
       WHERE (
         ? = ''
         OR LOWER(tracking_number) LIKE ? ESCAPE '\\'
         OR LOWER(customer_name) LIKE ? ESCAPE '\\'
         OR LOWER(cargo_name) LIKE ? ESCAPE '\\'
         OR LOWER(origin) LIKE ? ESCAPE '\\'
         OR LOWER(destination) LIKE ? ESCAPE '\\'
       )
       AND (? = '' OR status = ?)
       ORDER BY updated_at DESC, id DESC`,
    )
    .all(q, pattern, pattern, pattern, pattern, pattern, status, status);
  return rows.map((item) => mapWaybill(asRow<WaybillRow>(item)!));
}

export function isUniqueViolation(error: unknown) {
  return error instanceof Error && error.message.includes("UNIQUE constraint failed");
}

export function insertWaybill(input: WaybillInput) {
  const stamp = nowStamp();
  const result = getDb()
    .prepare(
      `INSERT INTO waybills (
        tracking_number, origin, destination, customer_name, customer_phone,
        cargo_name, pieces, weight_kg, status, eta, remark, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.trackingNumber,
      input.origin,
      input.destination,
      input.customerName,
      input.customerPhone,
      input.cargoName,
      input.pieces,
      input.weightKg,
      input.status,
      input.eta,
      input.remark,
      stamp,
      stamp,
    );
  return Number(result.lastInsertRowid);
}

export function updateWaybill(id: number, input: WaybillInput) {
  const result = getDb()
    .prepare(
      `UPDATE waybills SET
        tracking_number = ?,
        origin = ?,
        destination = ?,
        customer_name = ?,
        customer_phone = ?,
        cargo_name = ?,
        pieces = ?,
        weight_kg = ?,
        status = ?,
        eta = ?,
        remark = ?,
        updated_at = ?
      WHERE id = ?`,
    )
    .run(
      input.trackingNumber,
      input.origin,
      input.destination,
      input.customerName,
      input.customerPhone,
      input.cargoName,
      input.pieces,
      input.weightKg,
      input.status,
      input.eta,
      input.remark,
      nowStamp(),
      id,
    );
  return Number(result.changes) > 0;
}

export function deleteWaybill(id: number) {
  const result = getDb().prepare(`DELETE FROM waybills WHERE id = ?`).run(id);
  return Number(result.changes) > 0;
}

function syncStatusFromLatestNode(waybillId: number) {
  const latest = asRow<{ status: string }>(
    getDb()
      .prepare(
        `SELECT status FROM nodes
         WHERE waybill_id = ?
         ORDER BY event_time DESC, id DESC
         LIMIT 1`,
      )
      .get(waybillId),
  );
  if (!latest) return;
  getDb()
    .prepare(`UPDATE waybills SET status = ?, updated_at = ? WHERE id = ?`)
    .run(latest.status, nowStamp(), waybillId);
}

export function insertNode(waybillId: number, input: NodeInput) {
  let nodeId = 0;
  withTransaction(() => {
    const result = getDb()
      .prepare(
        `INSERT INTO nodes (waybill_id, event_time, location, status, note)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(waybillId, input.eventTime, input.location, input.status, input.note);
    nodeId = Number(result.lastInsertRowid);
    syncStatusFromLatestNode(waybillId);
  });
  return nodeId;
}

export function updateNode(nodeId: number, input: NodeInput) {
  const existing = asRow<NodeRow>(
    getDb().prepare(`SELECT * FROM nodes WHERE id = ?`).get(nodeId),
  );
  if (!existing) return null;
  withTransaction(() => {
    getDb()
      .prepare(
        `UPDATE nodes
         SET event_time = ?, location = ?, status = ?, note = ?
         WHERE id = ?`,
      )
      .run(input.eventTime, input.location, input.status, input.note, nodeId);
    syncStatusFromLatestNode(Number(existing.waybill_id));
  });
  return Number(existing.waybill_id);
}

export function deleteNode(nodeId: number) {
  const existing = asRow<NodeRow>(
    getDb().prepare(`SELECT * FROM nodes WHERE id = ?`).get(nodeId),
  );
  if (!existing) return null;
  withTransaction(() => {
    getDb().prepare(`DELETE FROM nodes WHERE id = ?`).run(nodeId);
    syncStatusFromLatestNode(Number(existing.waybill_id));
  });
  return Number(existing.waybill_id);
}
