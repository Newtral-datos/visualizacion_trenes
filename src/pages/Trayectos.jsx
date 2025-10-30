import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import "./Trayectos.css";

/** Animación del tren (SVG) con ruedas recortadas por clipPath */
function TrainHeroAnimation() {
  return (
    <div className="t-train" aria-hidden>
      <div className="t-train-track" />
      <svg
        className="t-train-svg"
        viewBox="0 0 260 80"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="t-body" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#0b1220" />
          </linearGradient>
          <linearGradient id="t-glass" x1="0" x2="1">
            <stop offset="0%" stopColor="#ecf9f5" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          {/* clip para que las ruedas no dejen restos fuera del círculo */}
          <clipPath id="wheelClip">
            <circle cx="0" cy="0" r="9" />
          </clipPath>
        </defs>

        {/* ===== cuerpo + nariz ===== */}
        <g transform="translate(6, 12)">
          <rect x="0" y="20" width="200" height="34" rx="10" fill="url(#t-body)" />
          <path
            d="M200 20 C235 20 255 28 258 36 C260 42 250 50 232 50 L200 50 Z"
            fill="url(#t-body)"
          />
          {/* franja */}
          <rect x="6" y="44" width="190" height="4" rx="2" fill="#01f3b3" />
          <path d="M200 46 C230 46 255 42 258 38" stroke="#01f3b3" strokeWidth="4" fill="none" />
          {/* ventanas */}
          <rect x="12" y="26" width="28" height="12" rx="3" fill="url(#t-glass)" />
          <rect x="44" y="26" width="28" height="12" rx="3" fill="url(#t-glass)" />
          <rect x="76" y="26" width="28" height="12" rx="3" fill="url(#t-glass)" />
          <rect x="108" y="26" width="28" height="12" rx="3" fill="url(#t-glass)" />
          {/* parabrisas */}
          <path d="M205 26 C225 26 245 30 252 34 C240 38 220 36 205 36 Z" fill="#dffcf3" />
          {/* luz */}
          <g>
            <circle cx="252" cy="39" r="4" fill="#01f3b3" />
            <circle cx="252" cy="39" r="8" fill="#01f3b3" opacity="0.18" />
          </g>
        </g>

        {/* ===== ruedas (con clipPath para evitar cualquier “resto”) ===== */}
        <g transform="translate(70, 66)" clipPath="url(#wheelClip)">
          <circle r="9" fill="#0b1220" />
          <g className="t-wheel">
            <circle r="3" fill="#9aa3b2" />
            <rect x="-1" y="-8" width="2" height="8" rx="1" fill="#9aa3b2" />
            <rect x="-1" y="-6" width="2" height="6" rx="1" fill="#9aa3b2" transform="rotate(60)" />
            <rect x="-1" y="-6" width="2" height="6" rx="1" fill="#9aa3b2" transform="rotate(120)" />
          </g>
        </g>
        <g transform="translate(160, 66)" clipPath="url(#wheelClip)">
          <circle r="9" fill="#0b1220" />
          <g className="t-wheel">
            <circle r="3" fill="#9aa3b2" />
            <rect x="-1" y="-8" width="2" height="8" rx="1" fill="#9aa3b2" />
            <rect x="-1" y="-6" width="2" height="6" rx="1" fill="#9aa3b2" transform="rotate(60)" />
            <rect x="-1" y="-6" width="2" height="6" rx="1" fill="#9aa3b2" transform="rotate(120)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function Trayectos() {
  const { loading, error, trayectos } = useData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (loading) return <div className="t-card">Cargando…</div>;
  if (error) return <div className="t-card" style={{ color: "crimson" }}>{String(error)}</div>;
  if (!trayectos?.length) return <div className="t-card">No hay trayectos disponibles.</div>;

  return (
    <div className="t-container">
      <header className="t-hero">
        <div className="t-hero-wrap">
          <TrainHeroAnimation />
          <h1 className={`t-title ${mounted ? "t-title--visible" : ""}`}>
            Los datos de los trenes de larga distancia en España
          </h1>
        </div>
        <p className="t-subtitle">
          Selecciona un trayecto para comparar precios entre empresas, tasas de puntualidad y número de viajeros
        </p>
      </header>

      <div className="t-grid">
        {trayectos.map((t, i) => {
          const delay = mounted ? `${60 * i}ms` : "0ms";
          return (
            <Link
              key={t.id ?? i}
              to={`/trayecto/${t.id}`}
              className={`t-card t-card--route ${mounted ? "t-fade-up" : ""}`}
              style={{ animationDelay: delay }}
              title={t.nombre}
            >
              <div className="t-pill" />
              <div className="t-card__body">
                <h3 className="t-route__title">{t.nombre}</h3>
              </div>
              <div className="t-cta">Ver detalles</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
