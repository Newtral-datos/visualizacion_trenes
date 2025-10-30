import React from "react";

/**
 * PunctualityChart
 * Barras horizontales (0–100) para TODAS las empresas del trayecto,
 * ordenadas por puntualidad DESCENDENTE y con color corporativo.
 *
 * Props:
 * - data: { [empresa]: number } (0–100)
 * - min?: number (default 0)
 * - max?: number (default 100)
 */
export default function PunctualityChart({ data = {}, min = 0, max = 100 }) {
  // Mapa de colores corporativos (ajusta si usas otros nombres)
  const COMPANY_COLORS = {
    "RENFE AVE-AVLO": "#6b21a8", // morado Renfe/AVE
    "Renfe-AVE": "#6b21a8",
    "Renfe AVE": "#6b21a8",
    "Renfe-AVLO": "#06b6d4",     // cian AVLO
    "Renfe AVLO": "#06b6d4",
    Iryo: "#ef4444",            // rojo Iryo
    Ouigo: "#ec4899",           // rosa Ouigo
  };
  const BRAND = "#01f3b3";

  const clamp = (v) => Math.max(min, Math.min(max, Number(v ?? 0)));

  // Orden descendente por valor
  const entries = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null && !Number.isNaN(Number(v)))
    .map(([k, v]) => [k, clamp(v)])
    .sort((a, b) => b[1] - a[1]); // mayor a menor

  if (!entries.length) {
    return (
      <p style={{ opacity: 0.7, fontSize: 13, textAlign: "center" }}>
        No hay datos de puntualidad disponibles.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {entries.map(([empresa, val]) => {
        const pct = ((val - min) / (max - min)) * 100;
        const color = COMPANY_COLORS[empresa] || BRAND;

        return (
          <div
            key={empresa}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 60px",
              alignItems: "center",
              gap: 14,
            }}
          >
            {/* Columna principal: nombre + barra */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                <span>{empresa}</span>
                <span
                  aria-hidden
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: color,
                    marginLeft: 10,
                    boxShadow: "0 1px 4px rgba(0,0,0,.15)",
                  }}
                />
              </div>

              {/* Barra horizontal */}
              <div
                role="img"
                aria-label={`${empresa}: ${val.toFixed(0)}% de puntualidad`}
                style={{
                  position: "relative",
                  height: 14,
                  background: "#e5e7eb",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${pct}%`,
                    background: color,
                    borderRadius: 999,
                    transition: "width 400ms ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,.08) inset",
                  }}
                />
              </div>
            </div>

            {/* Valor numérico */}
            <div
              style={{
                fontVariantNumeric: "tabular-nums",
                fontWeight: 800,
                color: "#0f172a",
                textAlign: "left",
              }}
            >
              {val.toFixed(0)}%
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: 10,
          fontSize: 12,
          fontStyle: "italic",
          color: "#64748b",
        }}
      >
        Fuente: Datos anuales de 2024 (RENFE y Ouigo) y anuales de 2023 (Iryo)
      </div>
    </div>
  );
}
