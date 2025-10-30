import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        padding: "20px 0",
        marginTop: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderTop: "1px solid white",
        backgroundColor: "white",
      }}
    >
      <img
        src="/src/assets/powered_by_newtral.png"
        alt="Logo"
        style={{
          width: 120, // ✅ ajusta ancho
          height: "auto", // ✅ mantiene proporción
          opacity: 0.85,
          transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
      />
    </footer>
  );
}
