import React from "react";
import { Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext.jsx";
import Trayectos from "./pages/Trayectos.jsx";
import Detalle from "./pages/Detalle.jsx";
import Footer from "./components/Footer";

/**
 * App sin centrado vertical (para reducir el hueco)
 * y con encabezado mínimo (solo el emoji).
 */
export default function App() {
  return (
    <DataProvider>
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          paddingTop: 10,
        }}
      >
        <header
          className="header"
          style={{ textAlign: "center", margin: "0 0 6px" }}
        >
          <span className="mono" style={{ fontSize: 28 }}></span>
        </header>

        {/* Contenido principal */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Trayectos />} />
            <Route path="/trayecto/:id" element={<Detalle />} />
          </Routes>
        </main>

        {/* Footer global con logo */}
        <Footer />
      </div>
    </DataProvider>
  );
}
