import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "life-line.db");

let db;

function getDb() {
  if (db) return db;
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS life_lines (
      id TEXT PRIMARY KEY,
      anchor TEXT NOT NULL,
      keywords_input TEXT NOT NULL,
      chips_json TEXT NOT NULL,
      colors_json TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
    );
  `);

  const columns = db.prepare("PRAGMA table_info(life_lines)").all();
  if (!columns.some((column) => column.name === "colors_json")) {
    db.exec("ALTER TABLE life_lines ADD COLUMN colors_json TEXT NOT NULL DEFAULT '[]';");
  }

  const existing = db.prepare("SELECT id FROM life_lines WHERE id = ?").get("default");
  if (!existing) {
    const chips = ["하나님", "가족", "건강", "소명", "성장", "관계", "재정", "휴식"];
    const colors = ["#FFEA00", "#FF80AB", "#00E676", "#82B1FF", "#00E5FF", "#FFD180", "#69F0AE", "#B388FF"];
    db.prepare(`
      INSERT INTO life_lines (id, anchor, keywords_input, chips_json, colors_json)
      VALUES (?, ?, ?, ?, ?)
    `).run("default", "하나님", chips.slice(1).join(", "), JSON.stringify(chips), JSON.stringify(colors));
  }

  return db;
}

function normalizeColors(colors, chipCount) {
  const safeColors = Array.isArray(colors) ? colors : [];
  return Array.from({ length: chipCount }, (_, index) => {
    const color = safeColors[index];
    return typeof color === "string" && color ? color : null;
  });
}

function normalizeRow(row) {
  const chips = JSON.parse(row.chips_json);
  const safeChips = Array.isArray(chips) && chips.length > 0 ? chips : [row.anchor];
  const colors = row.colors_json ? JSON.parse(row.colors_json) : [];

  return {
    id: row.id,
    anchor: row.anchor,
    keywordsInput: row.keywords_input,
    chips: safeChips,
    colors: normalizeColors(colors, safeChips.length),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getLine(id = "default") {
  const row = getDb().prepare(`
    SELECT id, anchor, keywords_input, chips_json, colors_json, created_at, updated_at
    FROM life_lines
    WHERE id = ?
  `).get(id);

  return row ? normalizeRow(row) : null;
}

export function saveLine({ id, anchor, keywordsInput, chips, colors }) {
  const now = Date.now();
  const safeChips = Array.isArray(chips) && chips.length > 0 ? chips : [anchor || ""];
  const safeColors = normalizeColors(colors, safeChips.length);

  getDb().prepare(`
    INSERT INTO life_lines (id, anchor, keywords_input, chips_json, colors_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      anchor = excluded.anchor,
      keywords_input = excluded.keywords_input,
      chips_json = excluded.chips_json,
      colors_json = excluded.colors_json,
      updated_at = excluded.updated_at
  `).run(id, anchor, keywordsInput, JSON.stringify(safeChips), JSON.stringify(safeColors), now, now);

  return getLine(id);
}
