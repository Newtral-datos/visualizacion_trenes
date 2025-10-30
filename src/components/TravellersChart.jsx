import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/**
 * Tooltip personalizado sin "label : value".
 * Solo muestra:
 *   Año: 2024
 *   6,7 millones
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  const raw = payload[0]?.value;
  const millones =
    typeof raw === "number"
      ? (raw / 1_000_000).toLocaleString("es-ES", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })
      : raw;

  return (
    <div
      className="recharts-default-tooltip"
      style={{
        background: "rgba(255,255,255,0.98)",
        border: "1px solid rgba(0,0,0,0.15)",
        borderRadius: 8,
        padding: "8px 10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Año: {label}</div>
      <div style={{ fontVariantNumeric: "tabular-nums" }}>{millones} millones</div>
    </div>
  );
}

/**
 * Gráfico de viajeros anuales.
 * - Espera data: Array<{ year: number, value: number }>
 * - Eje Y en millones (6,7 M)
 * - Tooltip personalizado sin "value:" ni dos puntos
 * - Color principal #01f3b3
 */
export default function TravellersChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ opacity: 0.7, fontSize: 13 }}>
        No hay datos de viajeros disponibles.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 360 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />

          {/* Eje Y en millones */}
          <YAxis
            tickFormatter={(v) =>
              typeof v === "number"
                ? `${(v / 1_000_000).toLocaleString("es-ES", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })} M`
                : v
            }
          />

          {/* Tooltip sin "value:" ni ":" */}
          <Tooltip content={<CustomTooltip />} />

          {/* Color principal #01f3b3 */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#01f3b3"
            fill="rgba(1, 243, 179, 0.22)"
            strokeWidth={2}
            isAnimationActive={false}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
