import { useState } from "react";
import { createPortal } from "react-dom";
import { useData } from "../../context/DataContext";
import { BookOpen, Search, Clock, CheckCircle, Eye, X } from "lucide-react";
import { RESOURCES } from "../../data/resources";
import { DISCIPLINES, getDisciplineBadgeClass } from "../../utils/vocational";

export default function ResourceLibrary() {
  const { studentInfo, readResource } = useData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [selected, setSelected] = useState(null);
  const readIds = studentInfo?.resourcesRead || [];

  const filtered = RESOURCES.filter(r => {
    const matchSearch = r.titulo.toLowerCase().includes(search.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(search.toLowerCase());
    const matchDisc = filter === "Todos" || r.disciplina === filter || r.disciplina === "Todos";
    return matchSearch && matchDisc;
  });

  const handleOpen = async (resource) => {
    setSelected(resource);
    if (!readIds.includes(resource.id)) {
      await readResource(resource.id);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="page-header">
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
          Biblioteca <span className="text-gradient-secondary">Vocacional</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          Artículos, guías y recursos sobre carreras y oportunidades en Nicaragua. +15 XP por cada recurso leído.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar recursos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.75rem" }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["Todos", ...DISCIPLINES].map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`btn ${filter === d ? "btn-secondary" : "btn-glass"}`}
              style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", borderRadius: "20px" }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)" }}>Recursos ({filtered.length})</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {filtered.map(resource => {
          const isRead = readIds.includes(resource.id);
          return (
            <button
              key={resource.id}
              onClick={() => handleOpen(resource)}
              className="glass-card"
              style={{ textAlign: "left", cursor: "pointer", display: "flex", gap: "1rem", alignItems: "flex-start", width: "100%" }}
            >
              <span style={{ fontSize: "2rem" }}>{resource.icono}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                  <span className={`badge ${getDisciplineBadgeClass(resource.disciplina === "Todos" ? "Tecnología" : resource.disciplina)}`} style={{ fontSize: "0.65rem" }}>
                    {resource.disciplina}
                  </span>
                  <span className="badge badge-glass" style={{ fontSize: "0.65rem" }}>{resource.tipo}</span>
                  {isRead && <CheckCircle size={14} style={{ color: "var(--accent)" }} />}
                </div>
                <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{resource.titulo}</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{resource.descripcion}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  <Clock size={12} /> {resource.duracion}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && createPortal(
        <div
          onClick={() => setSelected(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", zIndex: 1000 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass-panel animate-fade-in"
            style={{ background: "#fff", maxWidth: "720px", width: "100%", maxHeight: "88vh", overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <BookOpen size={24} style={{ color: "var(--secondary)" }} />
                <h3 style={{ fontWeight: 800, fontSize: "1.2rem" }}>{selected.titulo}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="btn btn-glass" style={{ padding: "0.4rem" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span className="badge badge-secondary">{selected.tipo}</span>
              <span className="badge badge-glass"><Eye size={12} /> +15 XP al leer</span>
            </div>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>{selected.contenido}</p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
