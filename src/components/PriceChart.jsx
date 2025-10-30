import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Gráfico de precios por empresa.
 * Props:
 *  - data: Array<{ date: string, [empresa]: number }>
 *  - companies?: string[]        (orden externo si se quiere forzar)
 */
export default function PriceChart({
  data = [],
  companies = [],
}) {
  const norm = (name) =>
    String(name || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ")
      .replace(/_/g, "-");

  const isTotal = (name) => norm(name) === "TOTAL";

  const COLOR_MAP = {
    IRYO: "#D90A15",
    OUIGO: "#E50A70",
    "RENFE-AVE": "#830065",
    "RENFE AVE": "#830065",
    "RENFE – AVE": "#830065",
    "RENFE—AVE": "#830065",
    "RENFE-AVLO": "#27C7BF",
    "RENFE AVLO": "#27C7BF",
    "RENFE – AVLO": "#27C7BF",
    "RENFE—AVLO": "#27C7BF",
  };

  const colorFor = (name, i) => {
    const N = norm(name);
    if (COLOR_MAP[N]) return COLOR_MAP[N];
    if (N.includes("RENFE") && N.includes("AVLO")) return COLOR_MAP["RENFE-AVLO"];
    if (N.includes("RENFE") && N.includes("AVE")) return COLOR_MAP["RENFE-AVE"];
    if (N.includes("OUIGO")) return COLOR_MAP["OUIGO"];
    if (N.includes("IRYO")) return COLOR_MAP["IRYO"];
    const palette = [
      "#1976d2",
      "#e53935",
      "#8e24aa",
      "#43a047",
      "#fb8c00",
      "#00838f",
      "#6d4c41",
      "#3949ab",
      "#d81b60",
      "#7cb342",
    ];
    return palette[i % palette.length];
  };

  const derivedCompanies = useMemo(() => {
    let list = [];
    if (Array.isArray(companies) && companies.length > 0) {
      list = companies;
    } else {
      const keys = new Set();
      for (const row of data || []) {
        Object.keys(row || {}).forEach((k) => {
          if (k !== "date") keys.add(k);
        });
      }
      list = Array.from(keys);
    }
    return list.filter((n) => !isTotal(n));
  }, [companies, data]);

  // 🔹 Leyenda personalizada (más grande y separada)
  const renderLegend = () => {
    const items = derivedCompanies.map((name, i) => {
      const color = colorFor(name, i);

      return (
        <div
          key={name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minWidth: 120,
            margin: "6px 12px",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 16, // tamaño aumentado
              height: 16,
              borderRadius: "50%",
              background: color,
              display: "inline-block",
              boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            }}
          />
          <strong style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{name}</strong>
        </div>
      );
    });

    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          padding: "6px 0 10px 0",
          gap: "8px 20px", // separación uniforme horizontal y vertical
        }}
        aria-label="Leyenda de empresas"
      >
        {items}
      </div>
    );
  };

  // ✅ formatea AAAA-MM-DD → MM/AAAA
  const formatDate = (str) => {
    if (!str) return str;
    const [y, m] = String(str).split("-");
    return m && y ? `${m}/${y}` : str;
  };

  if (!Array.isArray(data) || data.length === 0 || derivedCompanies.length === 0) {
    return (
      <div style={{ opacity: 0.7, fontSize: 13 }}>
        No hay datos de precios disponibles.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 360 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} />

          <YAxis
            tickFormatter={(v) =>
              typeof v === "number"
                ? v.toLocaleString("es-ES", { maximumFractionDigits: 0 })
                : v
            }
          />

          <Tooltip
            formatter={(value, name) => [
              typeof value === "number"
                ? `${value.toLocaleString("es-ES", { maximumFractionDigits: 2 })} €`
                : value,
              name,
            ]}
            labelFormatter={(l) => `Fecha: ${formatDate(l)}`}
          />

          <Legend verticalAlign="top" align="center" content={renderLegend} />

          {derivedCompanies.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={colorFor(name, i)}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
