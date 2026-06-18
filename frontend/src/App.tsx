import { useState } from "react";
import RequiredProductsPage from "./pages/RequiredProductsPage";
import SuppliersPage from "./pages/SuppliersPage";
import RoundPage from "./pages/RoundPage";
import RoundHistoryPage from "./pages/RoundHistoryPage";

type view = "products" | "suppliers" | "round" | "order" | "history"
export default function App() {

  const [view, setView] = useState<view>("round")

  return (
    <>
      <header className="app-header" aria-label="Identidad de la app">
        <span>RONDA_T</span>
      </header>
      <main>
        {view === "suppliers" && <SuppliersPage/>}
        {view === "products" && <RequiredProductsPage/>}
        {view === "history" && <RoundHistoryPage/>}
        {(view === "round" || view === "order") && (
          <RoundPage
            view={view === "order" ? "order" : "round"}
            onViewChange={(nextView) => setView(nextView)}
          />
        )}
      </main>
      <nav className="app-nav" aria-label="Secciones principales">
        <button
          className={view === "round" ? "is-active" : ""}
          onClick={() => {
            setView("round")
          }}>
          <span className="nav-icon nav-icon-round" aria-hidden="true"></span>
          Ronda
        </button>
        <button
          type="button"
          className={view === "order" ? "is-active" : ""}
          onClick={() => setView("order")}>
          <span className="nav-icon nav-icon-order" aria-hidden="true"></span>
          Pedido
        </button>
        <button
          type="button"
          className={view === "history" ? "is-active" : ""}
          onClick={() => setView("history")}>
          <span className="nav-icon nav-icon-history" aria-hidden="true"></span>
          Historial
        </button>
        <button
          type="button"
          className={view === "products" ? "is-active" : ""}
          onClick={() => setView("products")}>
          <span className="nav-icon nav-icon-catalog" aria-hidden="true"></span>
          Catalogo
        </button>
        <button
          type="button"
          className={view === "suppliers" ? "is-active" : ""}
          onClick={() => setView("suppliers")}>
          <span className="nav-icon nav-icon-suppliers" aria-hidden="true"></span>
          Proveedores
        </button>
      </nav>
    </>
  )
}
