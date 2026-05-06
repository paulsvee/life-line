import { neon } from "@neondatabase/serverless";
import { getLine, saveLine } from "./db";

let sql;
let initialized = false;

const EMPTY_LINE = {
  id: "default",
  anchor: "",
  keywordsInput: "",
  chips: [""],
  colors: [null],
  createdAt: 0,
  updatedAt: 0,
};

function normalizeColors(colors, chipCount) {
  const safeColors = Array.isArray(colors) ? colors : [];
  return Array.from({ length: chipCount }, (_, index) => {
    const color = safeColors[index];
    return typeof color === "string" && color ? color : null;
  });
}

function normalizeLine(row) {
  if (!row) return null;
  const chips = Array.isArray(row.chips) && row.chips.length > 0 ? row.chips : [row.anchor || ""];
  return {
    id: "default",
    anchor: row.anchor || "",
    keywordsInput: row.keywords_input || row.keywordsInput || chips.slice(1).join(", "),
    chips,
    colors: normalizeColors(row.colors, chips.length),
    createdAt: Number(row.created_at || row.createdAt || Date.now()),
    updatedAt: Number(row.updated_at || row.updatedAt || Date.now()),
  };
}

function userKey(session) {
  return session?.user?.email?.toLowerCase() || session?.user?.id || "";
}

function canUsePostgres() {
  return !!process.env.DATABASE_URL;
}

function getSql() {
  if (!sql) sql = neon(process.env.DATABASE_URL);
  return sql;
}

async function ensureTable() {
  if (initialized) return;
  await getSql()`
    CREATE TABLE IF NOT EXISTS life_lines (
      user_id TEXT PRIMARY KEY,
      anchor TEXT NOT NULL DEFAULT '',
      keywords_input TEXT NOT NULL DEFAULT '',
      chips_json JSONB NOT NULL DEFAULT '[""]'::jsonb,
      colors_json JSONB NOT NULL DEFAULT '[null]'::jsonb,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    )
  `;
  initialized = true;
}

export function getPublicLine() {
  return getLine("default") || EMPTY_LINE;
}

export async function getLineForSession(session) {
  const key = userKey(session);
  if (!key) return getPublicLine();

  if (!canUsePostgres()) {
    return getLine(`user:${key}`) || { ...EMPTY_LINE, createdAt: Date.now(), updatedAt: Date.now() };
  }

  await ensureTable();
  const rows = await getSql()`
    SELECT anchor, keywords_input, chips_json, colors_json, created_at, updated_at
    FROM life_lines
    WHERE user_id = ${key}
    LIMIT 1
  `;
  if (!rows.length) {
    return { ...EMPTY_LINE, createdAt: Date.now(), updatedAt: Date.now() };
  }

  return normalizeLine({
    ...rows[0],
    chips: rows[0].chips_json,
    colors: rows[0].colors_json,
  });
}

export async function saveLineForSession(session, input) {
  const key = userKey(session);
  if (!key) {
    throw new Error("authentication required");
  }

  const chips = Array.isArray(input.chips) && input.chips.length > 0 ? input.chips : [input.anchor || ""];
  const colors = normalizeColors(input.colors, chips.length);
  const now = Date.now();

  if (!canUsePostgres()) {
    return saveLine({
      id: `user:${key}`,
      anchor: input.anchor || "",
      keywordsInput: input.keywordsInput || "",
      chips,
      colors,
    });
  }

  await ensureTable();
  await getSql()`
    INSERT INTO life_lines (user_id, anchor, keywords_input, chips_json, colors_json, created_at, updated_at)
    VALUES (
      ${key},
      ${input.anchor || ""},
      ${input.keywordsInput || ""},
      ${JSON.stringify(chips)}::jsonb,
      ${JSON.stringify(colors)}::jsonb,
      ${now},
      ${now}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      anchor = excluded.anchor,
      keywords_input = excluded.keywords_input,
      chips_json = excluded.chips_json,
      colors_json = excluded.colors_json,
      updated_at = excluded.updated_at
  `;

  return getLineForSession(session);
}
