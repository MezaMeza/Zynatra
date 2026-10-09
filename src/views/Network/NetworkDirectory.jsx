import { useState, useMemo, useEffect } from "react";
import {
  Network,
  Search,
  MapPin,
  Wifi,
  RefreshCw,
  Calendar,
  Award,
  BookOpen,
  GraduationCap,
  CheckCircle,
  ChevronRight,
  Server,
  Activity,
  Sparkles,
  X,
  Clock,
  Building2,
  Users
} from "lucide-react";
import { INSTITUTIONS, ADMISSION_PHASES, TOTAL_CAREERS } from "../../data/academicNetwork";
import { SCHOLARSHIPS } from "../../data/scholarships";

const DISCIPLINES = ["Todos", "Ecología", "Tecnología", "Ingeniería", "Arte"];

export default function NetworkDirectory() {
  const [activeTab, setActiveTab] = useState("institutions");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [disciplineFilter, setDisciplineFilter] = useState("Todos");
  const [cycle, setCycle] = useState("2027");
  const [syncing, setSyncing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [infoTab, setInfoTab] = useState("news");
  const [detail, setDetail] = useState(null);

  // Pre-matrícula local
  const [preForm, setPreForm] = useState({ nombre: "", email: "", carrera: "", institucion: "" });
  const [preList, setPreList] = useState(() => {
    const saved = localStorage.getItem("zynatra_prematricula");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("zynatra_prematricula", JSON.stringify(preList));
  }, [preList]);

  const onlineNodes = useMemo(() => INSTITUTIONS.filter(i => i.status === "online").length, []);
  const totalNodes = INSTITUTIONS.length;

  const allCareers = useMemo(
    () => INSTITUTIONS.flatMap(inst => (inst.carreras || []).map(c => ({ ...c, institucion: inst.siglas, instNombre: inst.nombre, logo: inst.logo }))),
    []
  );

  const filteredInstitutions = useMemo(() => INSTITUTIONS.filter(inst => {
    const q = search.toLowerCase();
    const matchSearch = !q || inst.nombre.toLowerCase().includes(q) || inst.siglas.toLowerCase().includes(q) || inst.ubicacion.toLowerCase().includes(q);
    const matchType = typeFilter === "Todos" || inst.tipo.includes(typeFilter);
    return matchSearch && matchType;
  }), [search, typeFilter]);

  const filteredCareers = useMemo(() => allCareers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.nombre.toLowerCase().includes(q) || c.facultad?.toLowerCase().includes(q) || c.institucion.toLowerCase().includes(q);
    const matchDisc = disciplineFilter === "Todos" || c.disciplina === disciplineFilter;
    return matchSearch && matchDisc;
  }), [allCareers, search, disciplineFilter]);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1500);
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!preForm.nombre.trim() || !preForm.email.trim() || !preForm.carrera.trim()) return;
    setPreList([{ ...preForm, id: "pre_" + Date.now(), fecha: new Date().toLocaleString("es-NI"), ciclo: cycle, estado: "Pre-Matrícula Confirmada" }, ...preList]);
    setPreForm({ nombre: "", email: "", carrera: "", institucion: "" });
  };

  const tabBtn = (id, icon, label, extra) => (
    <button onClick={() => setActiveTab(id)} className={`btn ${activeTab === id ? "btn-secondary" : "btn-glass"}`} style={{ gap: "0.4rem" }}>
      {icon} {label}{extra}
    </button>
  );

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* HEADER */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(16,185,129,0.12)", color: "#10b981", padding: "0.3rem 0.75rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.03em" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            CONEXIÓN ACTIVA EN TIEMPO REAL
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sincronizado {new Date().toLocaleTimeString("es-NI", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "260px" }}>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Red Académica <span style={{ color: "#5bbfbf" }}>Universitaria &amp; Técnica</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.35rem", maxWidth: "900px" }}>
              Conexión directa y en tiempo real con universidades del CNU y colegios tecnológicos (INATEC).
              Explora la oferta académica en curso ({cycle === "2027" ? "2027" : "2026"}) y asegura tu cupo para el <strong>Año Académico 2027</strong>.
            </p>
          </div>
          <button
            onClick={() => setShowSearch(s => !s)}
            className={`btn ${showSearch ? "btn-secondary" : "btn-glass"}`}
            style={{ gap: "0.4rem", flexShrink: 0 }}
            aria-label="Buscar"
          >
            <Search size={18} /> Buscar
          </button>
        </div>
        {showSearch && (
          <div style={{ position: "relative", marginTop: "0.85rem" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="input-field"
              autoFocus
              placeholder="Buscar instituciones, carreras o ubicaciones..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: "2.75rem" }}
            />
          </div>
        )}
      </div>

      {/* INFO ROW: Nodo (izq) + Tabs Aviso/Convocatoria (der) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1rem" }}>
        {/* NODO */}
        <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
            <Wifi size={24} style={{ color: "#10b981" }} />
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em" }}>NODO CENTRAL CNU-MANAGUA</p>
              <p style={{ fontSize: "1.3rem", fontWeight: 800 }}>
                <span style={{ color: "#10b981" }}>{onlineNodes}/{totalNodes} Nodos</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "0.6rem" }}>100% En Línea</span>
              </p>
            </div>
          </div>
          <button onClick={handleSync} className="btn btn-glass" style={{ gap: "0.4rem", justifyContent: "center" }}>
            <RefreshCw size={16} className={syncing ? "spin" : ""} /> {syncing ? "Sincronizando..." : "Sincronizar Nodos"}
          </button>
        </div>

        {/* TABS: Aviso / Convocatoria */}
        <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => setInfoTab("news")} className={`btn ${infoTab === "news" ? "btn-secondary" : "btn-glass"}`} style={{ gap: "0.35rem", fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>
              <Activity size={14} /> Aviso CNU
            </button>
            <button onClick={() => setInfoTab("conv")} className={`btn ${infoTab === "conv" ? "btn-primary" : "btn-glass"}`} style={{ gap: "0.35rem", fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>
              <Sparkles size={14} /> Convocatoria
            </button>
          </div>

          {infoTab === "news" ? (
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <span style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: "#fff", fontWeight: 800, fontSize: "0.62rem", padding: "0.5rem 0.6rem", borderRadius: "10px", textAlign: "center", lineHeight: 1.1, flexShrink: 0 }}>
                EN<br />VIVO
              </span>
              <div>
                <p style={{ fontSize: "0.88rem" }}>
                  <strong>Bicentenario UNAN-León:</strong> Calendario de Admisión en León, CUR Somoto y Jinotega Ciclo 2027 — Publicado el calendario oficial para Medicina, Odontología, Farmacia y Telemática.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.6rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Hace 25 minutos</span>
                  <button onClick={() => setActiveTab("calendar")} className="btn btn-glass" style={{ gap: "0.3rem", fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}>
                    Revisar Calendario <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.6rem" }}>🚀</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                    {cycle === "2027" ? "Convocatoria & Admisión 2027" : "Ciclo Actual 2026"}
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                    Más de 74,800 cupos con 100% de gratuidad para el Año Académico 2027.
                  </p>
                </div>
                <span className="badge badge-accent" style={{ fontSize: "0.62rem", whiteSpace: "nowrap" }}>
                  {cycle === "2027" ? "PRE-MATRÍCULA ABIERTA" : "EN CURSO"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                <button onClick={() => setCycle("2027")} className={`btn ${cycle === "2027" ? "btn-primary" : "btn-glass"}`} style={{ gap: "0.35rem", fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>
                  <Sparkles size={13} /> Año 2027
                </button>
                <button onClick={() => setCycle("2026")} className={`btn ${cycle === "2026" ? "btn-secondary" : "btn-glass"}`} style={{ gap: "0.35rem", fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>
                  <Clock size={13} /> Año 2026
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {tabBtn("institutions", <Network size={16} />, <>Universidades &amp; Colegios Técnicos ({INSTITUTIONS.length})</>)}
        {tabBtn("careers", <GraduationCap size={16} />, <>Oferta de Carreras ({TOTAL_CAREERS})</>)}
        {tabBtn("prematricula", <CheckCircle size={16} />, <>Pre-Matrícula 2027 {preList.length > 0 && `(${preList.length})`}</>)}
        {tabBtn("calendar", <Calendar size={16} />, "Calendario CNU 2026-2027")}
        {tabBtn("scholarships", <Award size={16} />, "Becas & Gratuidad")}
        {tabBtn("salas", <Users size={16} />, "Salas en Vivo")}
        {tabBtn("articles", <BookOpen size={16} />, "Guías")}
      </div>

      {/* ===== INSTITUTIONS ===== */}
      {activeTab === "institutions" && (
        <>
          <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input className="input-field" placeholder="Buscar universidades o institutos en Nicaragua..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: "2.75rem" }} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["Todos", "Universidad", "Instituto"].map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`btn ${typeFilter === t ? "btn-secondary" : "btn-glass"}`} style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", borderRadius: "20px" }}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
            {filteredInstitutions.map(inst => (
              <div key={inst.id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}>
                  <span style={{ fontSize: "2rem" }}>{inst.logo}</span>
                  <div style={{ flex: 1 }}>
                    <span className="badge badge-secondary" style={{ fontSize: "0.62rem" }}>{inst.tipo}</span>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, marginTop: "0.25rem", lineHeight: 1.3 }}>{inst.nombre}</h4>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.72rem" }}>
                  <span className="badge badge-glass" style={{ color: "#10b981" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block", marginRight: 4 }} />
                    {inst.status === "online" ? "Nodo en línea" : "Offline"} · {inst.pingMs}ms
                  </span>
                  <span className="badge badge-glass">{inst.carreras?.length || 0} carreras</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Server size={13} /> {inst.serverNode}
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <MapPin size={13} /> {inst.ubicacion}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "0.75rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    <strong style={{ color: "var(--primary)" }}>{inst.totalCupos2027?.toLocaleString()}</strong> cupos 2027
                  </span>
                  <button onClick={() => setDetail(inst)} className="btn btn-glass" style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem", gap: "0.25rem" }}>
                    Ver detalles <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== CAREERS ===== */}
      {activeTab === "careers" && (
        <>
          <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input className="input-field" placeholder="Buscar entre 246 carreras..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: "2.75rem" }} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {DISCIPLINES.map(d => (
                <button key={d} onClick={() => setDisciplineFilter(d)} className={`btn ${disciplineFilter === d ? "btn-secondary" : "btn-glass"}`} style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", borderRadius: "20px" }}>{d}</button>
              ))}
            </div>
          </div>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)" }}>Oferta académica ({filteredCareers.length})</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {filteredCareers.slice(0, 120).map(c => (
              <div key={c.id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "1.4rem" }}>{c.logo}</span>
                  <span className="badge badge-glass" style={{ fontSize: "0.62rem" }}>{c.institucion}</span>
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>{c.nombre}</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c.facultad}</p>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                  <span className="badge badge-secondary" style={{ fontSize: "0.62rem" }}>{c.disciplina}</span>
                  <span className="badge badge-glass" style={{ fontSize: "0.62rem" }}>{c.duracion}</span>
                </div>
                <p style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700 }}>{c.cuposDisponibles2027} cupos disponibles 2027</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== PRE-MATRICULA ===== */}
      {activeTab === "prematricula" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 420px) 1fr", gap: "1.5rem" }}>
          <form onSubmit={handlePreSubmit} className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", height: "fit-content" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Expediente de Admisión 2027</h3>
            <input className="input-field" placeholder="Nombre completo" value={preForm.nombre} onChange={e => setPreForm({ ...preForm, nombre: e.target.value })} />
            <input className="input-field" type="email" placeholder="Correo electrónico" value={preForm.email} onChange={e => setPreForm({ ...preForm, email: e.target.value })} />
            <input className="input-field" placeholder="Carrera deseada" value={preForm.carrera} onChange={e => setPreForm({ ...preForm, carrera: e.target.value })} />
            <input className="input-field" placeholder="Institución (opcional)" value={preForm.institucion} onChange={e => setPreForm({ ...preForm, institucion: e.target.value })} />
            <button type="submit" className="btn btn-primary">Confirmar Pre-Matrícula en Línea</button>
          </form>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Mis pre-matrículas ({preList.length})</h3>
            {preList.length === 0 ? (
              <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>Aún no registraste ninguna pre-matrícula.</div>
            ) : preList.map(p => (
              <div key={p.id} className="glass-card" style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <div>
                  <p style={{ fontWeight: 700 }}>{p.carrera}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.nombre} · {p.email} {p.institucion && `· ${p.institucion}`}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{p.fecha}</p>
                </div>
                <span className="badge badge-accent" style={{ fontSize: "0.65rem" }}>{p.estado}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== CALENDAR ===== */}
      {activeTab === "calendar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {ADMISSION_PHASES.map((f, i) => (
            <div key={i} className="glass-card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start", borderLeft: `4px solid ${f.color}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: 800 }}>{f.fase}</h4>
                  <span className="badge" style={{ fontSize: "0.62rem", background: f.color, color: "#fff" }}>{f.estado}</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 700, margin: "0.25rem 0" }}>{f.periodo}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{f.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== SCHOLARSHIPS ===== */}
      {activeTab === "scholarships" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {SCHOLARSHIPS.map(b => (
            <div key={b.id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "2rem" }}>{b.icono}</span>
                <div>
                  <span className="badge badge-accent" style={{ fontSize: "0.62rem" }}>{b.monto}</span>
                  <h4 style={{ fontWeight: 700, fontSize: "0.95rem", marginTop: "0.3rem" }}>{b.titulo}</h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{b.institucion}</p>
                </div>
              </div>
              <ul style={{ fontSize: "0.82rem", color: "var(--text-secondary)", paddingLeft: "1.25rem" }}>
                {b.requisitos.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
              <p style={{ fontSize: "0.78rem", color: "var(--warning)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Calendar size={13} /> Cierre: {b.fechaLimite}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ===== SALAS EN VIVO ===== */}
      {activeTab === "salas" && (
        <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
          <Users size={40} style={{ color: "var(--primary)", margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Salas en Vivo de Orientación</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Conecta con mentores profesionales y orientadores del CNU en tiempo real. Iniciá sesión para unirte a las salas abiertas.
          </p>
        </div>
      )}

      {/* ===== ARTICLES / GUIDES ===== */}
      {activeTab === "articles" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {[
            { icono: "💻", titulo: "Cómo prepararte para el mercado laboral de IA y Desarrollo de Software", autor: "Ing. Gabriel Torrez", resumen: "Las tecnologías más demandadas en América Latina y cómo construir un portafolio desde el colegio." },
            { icono: "🌱", titulo: "El futuro de las Energías Renovables y la Agronomía Sostenible", autor: "Dra. Elena Ramos", resumen: "Proyectos de conservación y cómo la tecnología se une con las ciencias de la tierra." },
            { icono: "🎨", titulo: "Guía de UX/UI para Creativos Digitales", autor: "Lic. Roberto Ruiz", resumen: "Pasos para transformar tu pasión artística en una carrera de alta demanda global." }
          ].map((a, i) => (
            <div key={i} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <span style={{ fontSize: "2rem" }}>{a.icono}</span>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.3 }}>{a.titulo}</h3>
              <p style={{ fontSize: "0.8rem", color: "#5bbfbf", fontWeight: 600 }}>Por {a.autor}</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{a.resumen}</p>
            </div>
          ))}
        </div>
      )}

      {/* ===== DETAIL MODAL ===== */}
      {detail && (
        <div onClick={() => setDetail(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} className="glass-panel" style={{ background: "#fff", maxWidth: "760px", width: "100%", maxHeight: "88vh", overflowY: "auto", padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "2.5rem" }}>{detail.logo}</span>
                <div>
                  <span className="badge badge-secondary" style={{ fontSize: "0.62rem" }}>{detail.tipo}</span>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginTop: "0.3rem" }}>{detail.nombre}</h3>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="btn btn-glass" style={{ padding: "0.4rem" }}><X size={18} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", margin: "1.25rem 0", fontSize: "0.85rem" }}>
              <p><strong>Nodo:</strong> {detail.serverNode}</p>
              <p><strong>Estado:</strong> <span style={{ color: "#10b981" }}>{detail.status}</span> · {detail.pingMs}ms · {detail.uptime}</p>
              <p><strong>Ubicación:</strong> {detail.ubicacion}</p>
              <p><strong>Cupos 2027:</strong> {detail.totalCupos2027?.toLocaleString()} ({detail.admision2027Estado})</p>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>{detail.descripcion}</p>

            <h4 style={{ fontWeight: 800, marginBottom: "0.5rem" }}>Fechas clave 2027</h4>
            <ul style={{ fontSize: "0.85rem", color: "var(--text-secondary)", paddingLeft: "1.25rem", marginBottom: "1rem" }}>
              {detail.fechasClave2027 && Object.entries(detail.fechasClave2027).map(([k, v]) => <li key={k}><strong>{k}:</strong> {v}</li>)}
            </ul>

            <h4 style={{ fontWeight: 800, marginBottom: "0.5rem" }}>Sedes ({detail.sedes?.length || 0})</h4>
            <ul style={{ fontSize: "0.82rem", color: "var(--text-secondary)", paddingLeft: "1.25rem", marginBottom: "1rem" }}>
              {detail.sedes?.map((s, i) => <li key={i}>{s}</li>)}
            </ul>

            <h4 style={{ fontWeight: 800, marginBottom: "0.5rem" }}>Carreras ({detail.carreras?.length || 0})</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {detail.carreras?.map(c => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: "0.82rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.35rem" }}>
                  <span>{c.nombre} <span style={{ color: "var(--text-muted)" }}>· {c.duracion}</span></span>
                  <span style={{ color: "#10b981", fontWeight: 700, whiteSpace: "nowrap" }}>{c.cuposDisponibles2027} cupos</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <a href={detail.portalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ gap: "0.4rem" }}><Building2 size={15} /> Portal oficial</a>
              <a href={detail.admisionUrl} target="_blank" rel="noopener noreferrer" className="btn btn-glass" style={{ gap: "0.4rem" }}><Activity size={15} /> Admisión</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
