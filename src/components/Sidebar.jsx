import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Compass,
  Network,
  LogOut,
  GraduationCap,
  BookOpen,
  Settings,
  Bot,
  Library,
  Target,
  MoreHorizontal,
  X,
  Gamepad2,
  Brain
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser, logout, viewAs, setViewAs, effectiveRole } = useAuth();
  const [mobileMore, setMobileMore] = useState(false);

  if (!currentUser) return null;

  const getMenuItems = () => {
    if (effectiveRole === "student") {
      return [
        { id: "dashboard", label: "Mi Panel", icon: LayoutDashboard },
        { id: "vocational", label: "Test IQ & Vocación", icon: Brain },
        { id: "advisor", label: "Asesor IA", icon: Bot },
        { id: "resources", label: "Biblioteca", icon: Library },
        { id: "progress", label: "Mi Progreso", icon: Target },
        { id: "games", label: "Juegos", icon: Gamepad2 },
        { id: "network", label: "Red Académica", icon: Network }
      ];
    }

    if (effectiveRole === "teacher") {
      return [
        { id: "dashboard", label: "Clases y Tareas", icon: BookOpen },
        { id: "resources", label: "Biblioteca", icon: Library },
        { id: "network", label: "Convenios", icon: Network }
      ];
    }

    if (effectiveRole === "admin") {
      return [
        { id: "dashboard", label: "Dirección", icon: Settings },
        { id: "network", label: "Convenios", icon: Network }
      ];
    }

    return [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "network", label: "Red Escolar", icon: Network }
    ];
  };

  const menuItems = getMenuItems();
  const mobilePrimary = effectiveRole === "student"
    ? menuItems.slice(0, 4)
    : menuItems.slice(0, 3);
  const mobileMoreItems = effectiveRole === "student"
    ? menuItems.slice(4)
    : menuItems.slice(3);

  const NavButton = ({ item, compact }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={() => { setActiveTab(item.id); setMobileMore(false); }}
        className="btn"
        style={{
          width: compact ? "auto" : "100%",
          justifyContent: compact ? "center" : "flex-start",
          background: isActive ? "rgba(80, 184, 196, 0.15)" : "transparent",
          color: isActive ? "#000000" : "#4a5568",
          fontWeight: isActive ? 800 : 600,
          border: "1.5px solid",
          borderColor: isActive ? "#50b8c4" : "transparent",
          padding: compact ? "0.5rem" : "0.85rem 1.25rem",
          borderRadius: "16px",
          flexDirection: compact ? "column" : "row",
          gap: compact ? "2px" : "0.75rem",
          fontSize: compact ? "0.65rem" : "0.95rem",
          transition: "all 0.2s ease"
        }}
      >
        <Icon size={20} style={{
          color: isActive ? "#50b8c4" : "#64748b"
        }} />
        {!compact && <span>{item.label}</span>}
        {compact && <span>{item.label.split(" ")[0]}</span>}
      </button>
    );
  };

  return (
    <>
      <aside className="glass-panel desktop-sidebar" style={{
        width: "260px",
        height: "calc(100vh - 2rem)",
        margin: "1rem",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem",
        zIndex: 10,
        position: "sticky",
        top: "1rem"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "2rem",
          borderBottom: "1px solid var(--border-glass)",
          paddingBottom: "1.25rem"
        }}>
          <img src="/logoz.png" alt="Zynatra" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.05em", color: "#5bbfbf" }}>
              ZYNATRA
            </h2>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              {effectiveRole === "student" && "Estudiante"}
              {effectiveRole === "teacher" && "Docente"}
              {effectiveRole === "admin" && "Dirección"}
            </span>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1, overflowY: "auto" }}>
          {menuItems.map((item) => <NavButton key={item.id} item={item} />)}
        </nav>

        <div style={{
          borderTop: "1px solid var(--border-glass)",
          paddingTop: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          {currentUser.rol === "admin" && (
            <div>
              <p style={{ fontSize: "0.66rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                Modo de vista (admin)
              </p>
              <div style={{ display: "flex", gap: "0.2rem", background: "rgba(80,184,196,0.10)", padding: "0.25rem", borderRadius: "12px" }}>
                {[
                  { id: "student", label: "Estudiante" },
                  { id: "teacher", label: "Docente" },
                  { id: "admin", label: "Dirección" }
                ].map(m => {
                  const active = (effectiveRole || "admin") === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setViewAs(m.id === currentUser.rol ? null : m.id)}
                      style={{
                        flex: 1,
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "9px",
                        padding: "0.4rem 0.25rem",
                        fontSize: "0.68rem",
                        fontWeight: active ? 800 : 600,
                        background: active ? "#50b8c4" : "transparent",
                        color: active ? "#fff" : "var(--text-secondary)",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
              {viewAs && (
                <p style={{ fontSize: "0.68rem", color: "#b7791f", marginTop: "0.4rem", fontWeight: 600 }}>
                  Viendo como {viewAs === "student" ? "Estudiante" : viewAs === "teacher" ? "Docente" : "Dirección"}
                </p>
              )}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "1rem", color: "#fff"
            }}>
              {(currentUser.nombre || currentUser.email || "?").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>{currentUser.nombre}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{currentUser.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-glass" style={{ width: "100%", justifyContent: "center", gap: "0.5rem" }}>
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav glass-panel">
        {mobilePrimary.map(item => (
          <NavButton key={item.id} item={item} compact />
        ))}
        {mobileMoreItems.length > 0 && (
          <button
            onClick={() => setMobileMore(!mobileMore)}
            style={{
              background: "none", border: "none",
              color: mobileMore ? "#fff" : "var(--text-secondary)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", cursor: "pointer"
            }}
          >
            <MoreHorizontal size={20} />
            <span style={{ fontSize: "0.65rem" }}>Más</span>
          </button>
        )}
        <button onClick={logout} style={{
          background: "none", border: "none", color: "var(--text-secondary)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", cursor: "pointer"
        }}>
          <LogOut size={20} />
          <span style={{ fontSize: "0.65rem" }}>Salir</span>
        </button>
      </nav>

      {mobileMore && (
        <div style={{
          position: "fixed",
          bottom: "60px",
          left: 0,
          right: 0,
          backgroundColor: "#ffffff",
          borderTop: "2px solid #50b8c4",
          borderRadius: "24px 24px 0 0",
          padding: "1.5rem 1.25rem 1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
          zIndex: 10001,
          boxShadow: "0 -10px 35px rgba(0, 0, 0, 0.15)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#2d3436" }}>Más Secciones</span>
            <button
              onClick={() => setMobileMore(false)}
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                cursor: "pointer"
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
            {mobileMoreItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMore(false); }}
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "0.85rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    color: "#1e293b",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <Icon size={18} style={{ color: "#50b8c4" }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .mobile-bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          height: calc(60px + env(safe-area-inset-bottom, 0px));
          padding-bottom: env(safe-area-inset-bottom, 0px);
          border-radius: 0; border-top: 1px solid var(--border-glass);
          display: none; justify-content: space-around; align-items: center;
          padding-left: 0.5rem; padding-right: 0.5rem;
          z-index: 100;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
          background: #ffffff;
        }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-bottom-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
