import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

const DataContext = createContext(null);

const DATA_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp4T0F85CSlwWAVNPl3IK7ezpDibMg60WEoFFibQZyWPfMpoIxI0k2_WNpM3tEHw/pub?gid=574403046&single=true&output=csv";

export function DataProvider({ children }) {
  const [rawRows, setRawRows] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const rows = await fetchTable(DATA_URL);
        console.log("[Data] Filas cargadas:", rows?.length ?? 0);
        setRawRows(rows);
        setError(null);
      } catch (e) {
        console.error("Error cargando datos:", e);
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const value = useMemo(() => {
    if (!rawRows) {
      return {
        loading,
        error,
        trayectos: [],
        preciosPorTrayecto: {},
        viajerosPorTrayecto: {},
        empresasPorTrayecto: {},
      };
    }

    const trayectosMap = new Map();
    const preciosPorTrayecto = {};
    const viajerosPorTrayecto = {};
    const empresasPorTrayecto = {};
    const viajerosMap = new Map();

    for (const r0 of rawRows) {
      const r = normalizeRowKeys(r0); // normaliza nombres de columnas

      const id = r["ID"];
      if (id == null) continue;

      const nombre =
        r["TRAYECTO"] ?? `${r["ORIGEN"] ?? "?"} → ${r["DESTINO"] ?? "?"}`;
      const origen = r["ORIGEN"] ?? null;
      const destino = r["DESTINO"] ?? null;
      if (!trayectosMap.has(id)) {
        trayectosMap.set(id, { id, nombre, origen, destino });
      }

      const empresa = r["EMPRESA"];
      const precio = toNumberSafe(r["PRECIO"]);
      const year = toNumberSafe(r["AÑO"]);
      const month = toNumberSafe(r["MES"]);
      const fecha = buildDate(r["FECHA"], year, month);

      if (empresa && fecha) {
        if (!preciosPorTrayecto[id]) preciosPorTrayecto[id] = {};
        if (!preciosPorTrayecto[id][empresa]) preciosPorTrayecto[id][empresa] = [];
        preciosPorTrayecto[id][empresa].push({ date: fecha, precio });
      }

      if (!viajerosMap.has(id)) viajerosMap.set(id, new Map());
      const m = viajerosMap.get(id);

      // Lee columnas de años detectándolas por patrón 4 dígitos
      for (const key of Object.keys(r)) {
        if (/^\d{4}$/.test(key)) {
          const y = Number(key);
          const v = toNumberSafe(r[key]);
          if (v == null) continue;
          if (!m.has(y)) m.set(y, v);
        }
      }
    }

    for (const [id, mapYearVal] of viajerosMap.entries()) {
      const arr = Array.from(mapYearVal.entries())
        .map(([year, value]) => ({ year, value }))
        .sort((a, b) => a.year - b.year);
      viajerosPorTrayecto[id] = arr;
    }

    for (const id of Object.keys(preciosPorTrayecto)) {
      const empresas = Object.keys(preciosPorTrayecto[id]);
      empresasPorTrayecto[id] = new Set(empresas);
      for (const e of empresas) {
        preciosPorTrayecto[id][e].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
      }
      const allDates = Array.from(
        new Set(
          empresas.flatMap((e) => preciosPorTrayecto[id][e].map((p) => p.date))
        )
      ).sort((a, b) => new Date(a) - new Date(b));
      const merged = allDates.map((d) => {
        const row = { date: d };
        for (const e of empresas) {
          const found = preciosPorTrayecto[id][e].find((p) => p.date === d);
          row[e] = found?.precio ?? null;
        }
        return row;
      });
      preciosPorTrayecto[id]._merged = merged;
    }

    return {
      loading,
      error,
      trayectos: Array.from(trayectosMap.values()),
      preciosPorTrayecto,
      viajerosPorTrayecto,
      empresasPorTrayecto: Object.fromEntries(
        Object.entries(empresasPorTrayecto).map(([k, v]) => [k, Array.from(v)])
      ),
    };
  }, [rawRows, loading, error]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

/** === helpers === */

async function fetchTable(url) {
  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) throw new Error(`No se pudo cargar ${url} (${resp.status})`);

  const ct = resp.headers.get("content-type") || "";
  const u = new URL(url, location.href);
  const isCSV =
    /\.csv(\?|$)/i.test(u.pathname) || u.searchParams.get("output") === "csv" || ct.includes("text/csv");

  if (isCSV) {
    const text = await resp.text();
    const wb = XLSX.read(stripBOM(text), { type: "string" });
    const sheetName = wb.SheetNames[0] || "Sheet1";
    const sheet = wb.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet, { defval: null });
  } else {
    const buf = await resp.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheetName = wb.SheetNames[0] || "Sheet1";
    const sheet = wb.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet, { defval: null });
  }
}

function stripBOM(s) {
  if (typeof s === "string" && s.charCodeAt(0) === 0xfeff) {
    return s.slice(1);
  }
  return s;
}

// Normaliza nombres de columnas: quita espacios, BOM, normaliza tildes raras y mayúsculas
function normalizeRowKeys(row) {
  const out = {};
  for (const [k0, v] of Object.entries(row)) {
    if (k0 == null) continue;
    let k = String(k0).trim().replace(/\uFEFF/g, ""); // quita BOM
    k = k.normalize("NFC"); // normaliza acentos
    // corrige casos comunes de mojibake
    k = k.replace("AÃ‘O", "AÑO").replace("AÃ\u0083O", "AÑO");
    // mayúsculas uniformes
    k = k.toUpperCase();
    out[k] = v;
  }
  return out;
}

function toNumberSafe(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const t = v.trim();
    const cleaned = t.replace(/\./g, "").replace(/,/g, ".").replace(/[^\d.-]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

function buildDate(fechaCell, year, month) {
  if (typeof fechaCell === "number" && Number.isFinite(fechaCell)) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const millis = fechaCell * 24 * 60 * 60 * 1000;
    return new Date(epoch.getTime() + millis).toISOString().slice(0, 10);
  }
  if (typeof fechaCell === "string" && fechaCell.trim()) {
    const t = fechaCell.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(t)) return new Date(t).toISOString().slice(0, 10);
    const m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m) {
      const d = Number(m[1]),
        mo = Number(m[2]) - 1,
        y = Number(m[3].length === 2 ? "20" + m[3] : m[3]);
      return new Date(Date.UTC(y, mo, d)).toISOString().slice(0, 10);
    }
  }
  if (year && month) {
    const y = Number(year),
      m = Number(month) - 1;
    if (Number.isFinite(y) && Number.isFinite(m)) {
      return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
    }
  }
  return null;
}
