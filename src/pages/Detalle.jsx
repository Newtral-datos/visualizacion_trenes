import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import PriceChart from "../components/PriceChart";
import TravellersChart from "../components/TravellersChart";
import PunctualityChart from "../components/PunctualityChart";

const PUNTUALIDAD_EMPRESAS = Object.freeze({
  Iryo: 85.0,
  Ouigo: 82.21,
  "RENFE AVE-AVLO": 79.72,
});

export default function Detalle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    loading,
    error,
    trayectos,
    preciosPorTrayecto,
    viajerosPorTrayecto,
    empresasPorTrayecto,
  } = useData();

  if (loading) return <div>Cargando…</div>;
  if (error)
    return (
      <div className="card" style={{ color: "crimson" }}>
        {error}
      </div>
    );

  const trayecto = trayectos.find((t) => String(t.id) === String(id));
  if (!trayecto) {
    return (
      <div className="card" style={{ maxWidth: 960, margin: "0 auto" }}>
        <p>
          No se ha encontrado el trayecto con id <strong>{id}</strong>.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "6px 12px",
            background: "#01f3b3",
            color: "#111827",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  const preciosData = preciosPorTrayecto?.[id] || {};
  const mergedPrecios = Array.isArray(preciosData._merged)
    ? preciosData._merged
    : [];
  const empresas =
    empresasPorTrayecto?.[id] ||
    Object.keys(preciosData).filter((k) => k !== "_merged");
  const viajeros = viajerosPorTrayecto?.[id] || [];
  const puntualidad = trayecto.puntualidadEmpresas || PUNTUALIDAD_EMPRESAS;

  const empresasOrdenadas = ["Iryo", "OUIGO", "Renfe-AVE", "Renfe-AVLO"].filter(
    (e) => empresas.includes(e)
  );

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 22,
        padding: "10px 14px 40px",
      }}
    >
      {/* Cabecera con botón volver */}
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          padding: "22px 28px 26px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Botón volver — con diseño adaptable */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 12,
          }}
          className="volver-wrapper"
        >
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#01f3b3",
              color: "#111827",
              border: "none",
              fontSize: 15,
              fontWeight: 700,
              padding: "6px 14px",
              borderRadius: 8,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#00d19d")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#01f3b3")}
          >
            <span style={{ fontSize: 18 }}>←</span>
            <span>Volver</span>
          </button>
        </div>

        <h1
          style={{
            fontSize: 26,
            margin: "0 0 6px 0",
            fontWeight: 800,
            color: "#111827",
            wordWrap: "break-word",
          }}
        >
          {trayecto.nombre}
        </h1>
      </div>

      {/* Gráfico de precios */}
      <div
        style={{
          background: "#f9fafb",
          borderRadius: 18,
          padding: 18,
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            margin: "0 0 8px 0",
            color: "#111827",
            textAlign: "center",
          }}
        >
          Evolución de precios por empresa
        </h3>

        {mergedPrecios.length > 0 ? (
          <PriceChart data={mergedPrecios} companies={empresasOrdenadas} />
        ) : (
          <p style={{ opacity: 0.7, fontSize: 13, textAlign: "center" }}>
            No hay datos de precios disponibles.
          </p>
        )}
      </div>

      {/* Gráfico de puntualidad */}
      <div
        style={{
          background: "#f9fafb",
          borderRadius: 18,
          padding: 18,
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            margin: "0 0 8px 0",
            color: "#111827",
            textAlign: "center",
          }}
        >
          Puntualidad por empresa
        </h3>

        <PunctualityChart data={puntualidad} />
      </div>

      {/* Gráfico de viajeros */}
      <div
        style={{
          background: "#f9fafb",
          borderRadius: 18,
          padding: 18,
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            margin: "0 0 8px 0",
            color: "#111827",
            textAlign: "center",
          }}
        >
          Viajeros anuales
        </h3>

        {Array.isArray(viajeros) && viajeros.length > 0 ? (
          <TravellersChart data={viajeros} />
        ) : (
          <p style={{ opacity: 0.7, fontSize: 13, textAlign: "center" }}>
            No hay datos de viajeros disponibles.
          </p>
        )}

        {/* Botón volver al final */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#01f3b3",
              color: "#111827",
              border: "none",
              fontSize: 15,
              fontWeight: 700,
              padding: "8px 20px",
              borderRadius: 8,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
              transition: "all 0.2s ease",
            }}
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
}
