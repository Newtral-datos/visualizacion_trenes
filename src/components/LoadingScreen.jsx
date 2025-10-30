import React from "react";
import train from "../assets/train.gif"; // <- cambia a tu fichero real: train.svg / train.gif / train.png

export default function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        inset: 0,
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16
        }}
      >
        <img
          src={train}
          alt="Animación del tren"
          style={{ width: 140, height: "auto" }}
        />
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: 0.3,
            color: "#111"
          }}
        >
          cargando...
        </div>
      </div>
    </div>
  );
}
