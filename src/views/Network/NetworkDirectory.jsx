import React, { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import {
  Network,
  Search,
  MapPin,
  Link,
  CheckCircle,
  Sparkles,
  GraduationCap,
  Compass,
  Award,
  Calendar
} from "lucide-react";
import { SCHOLARSHIPS } from "../../data/scholarships";
import {
  DISCIPLINES,
  getDisciplineBadgeClass,
  getDisciplineButtonClass,
  getDisciplineFromProfile
} from "../../utils/vocational";

function InstitutionCard({ conn, isConnected, isRecommended, onConnect }) {
  return (
    <div className="glass-card animate-fade-in" style={{
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
      height: "100%",
      border: isRecommended ? "1px solid rgba(139, 92, 246, 0.4)" : undefined,
      boxShadow: isRecommended ? "0 0 20px rgba(139, 92, 246, 0.15)" : undefined
    }}>
      {isRecommended && (
        <span className="badge badge-primary" style={{
          alignSelf: "flex-start",
          fontSize: "0.65rem",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem"
        }}>
          <Sparkles size={12} />
          Recomendado para tu perfil
        </span>
      )}

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{
          width: "50px",
          height: "50px",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid var(--border-glass)",
          fontSize: "1.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {conn.logo}
        </div>
        <div>
          <span className="badge badge-secondary" style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}>
            {conn.tipo}
          </span>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, marginTop: "0.25rem", lineHeight: "1.3" }}>
            {conn.nombre}
          </h4>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <span className={`badge ${getDisciplineBadgeClass(conn.disciplina)}`} style={{ fontSize: "0.7rem" }}>
          {conn.disciplina}
        </span>
        <span className="badge badge-glass" style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "none" }}>
          SEN / Educación Superior
        </span>
      </div>

      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.5", flex: 1 }}>
        {conn.descripcion}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
        <MapPin size={14} />
        <span>{conn.ubicacion}</span>
      </div>

      <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Convenio Polaris</span>
        <button
          onClick={() => onConnect(conn.id)}
          className={`btn ${isConnected ? "btn-accent" : "btn-glass"}`}
          style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", gap: "0.25rem" }}
        >
          {isConnected ? (
            <>
              <CheckCircle size={14} />
              <span>Conectado</span>
            </>
          ) : (
            <>
              <Link size={14} />
              <span>Vincular</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function NetworkDirectory({ setActiveTab }) {
  const { currentUser } = useAuth();
  const { connections, studentInfo, loading } = useData();
  const [viewMode, setViewMode] = useState("institutions");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [disciplineFilter, setDisciplineFilter] = useState("Todos");
  const [connectedIds, setConnectedIds] = useState([]);
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);
  const [activeChannel, setActiveChannel] = useState("general-vocacional");
  const [newPostText, setNewPostText] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [communityPosts, setCommunityPosts] = useState(() => {
    const saved = localStorage.getItem("zynatra_community_posts");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "p_docentes",
        channel: "sala-maestros-y-estudiantes",
        autor: "Prof. Carlos Mendoza",
        rol: "teacher",
        badge: "Docente de Ciencias & Matemáticas",
        avatar: "👨‍🏫",
        tiempo: "Hace 10 min",
        contenido: "¡Bienvenidos estudiantes! Esta sala está abierta para cualquier consulta académica, orientación sobre exámenes de admisión a universidades o consejos sobre materias científicas. ¿En qué temas les gustaría reforzar este trimestre?",
        likes: 24,
        comentarios: [
          { autor: "Sofía Gutiérrez", rol: "student", texto: "¡Hola Profe Carlos! ¿Qué temas de física y álgebra vienen con más peso en el examen de admisión de la UNI?" },
          { autor: "Prof. Carlos Mendoza", rol: "teacher", texto: "Hola Sofía. En la UNI el 40% del examen se centra en Trigonometría, Funciones y Física Mecánica (Cinemática y Dinámica). Les compartiré guías de estudio aquí en la plataforma." }
        ]
      },
      {
        id: "p_profesionales",
        channel: "sala-profesionales-mentores",
        autor: "Dra. Brenda Peralta",
        rol: "teacher",
        badge: "Mentora Verificada · Medicina & Salud Pública",
        avatar: "👩‍⚕️",
        tiempo: "Hace 25 min",
        contenido: "Para los jóvenes interesados en las Ciencias de la Salud y Medicina: el camino requiere disciplina y vocación de servicio. ¿Tienen dudas sobre los años de internado, especialidades o campo laboral en Nicaragua?",
        likes: 31,
        comentarios: [
          { autor: "Carlos Ruiz", rol: "student", texto: "Dra. Brenda, ¿cuántos años dura la especialización médica después de graduarse de Medicina General?" },
          { autor: "Dra. Brenda Peralta", rol: "teacher", texto: "Hola Carlos. Tras 6 años de carrera general, la especialización dura entre 3 y 4 años adicionales dependiendo de la rama (Cirugía, Pediatría, Cardiología, etc.). ¡Vale 100% la pena!" }
        ]
      },
      {
        id: "p1",
        channel: "software-y-tech",
        autor: "Ing. Gabriel Torrez",
        rol: "teacher",
        badge: "Mentor Verificado · Software & IA",
        avatar: "👨‍💻",
        tiempo: "Hace 45 min",
        contenido: "¡Hola a todos los futuros ingenieros y creadores de tecnología! Si te atrae la programación y la IA, te sugiero empezar explorando lógica y proyectos interactivos. ¿Alguien tiene dudas sobre carreras técnicas vs universitarias?",
        likes: 18,
        comentarios: [
          { autor: "Mateo Silva", rol: "student", texto: "¡Hola Ing. Gabriel! ¿Qué diferencia hay entre estudiar Ingeniería en Sistemas en la UNI vs un técnico en INATEC?" },
          { autor: "Ing. Gabriel Torrez", rol: "teacher", texto: "¡Excelente duda Mateo! En INATEC es 100% práctico e intensivo (2 años, rápida salida laboral). En la UNI dura 5 años y profundiza en arquitectura de software y matemáticas avanzadas." }
        ]
      },
      {
        id: "p2",
        channel: "general-vocacional",
        autor: "Dra. Elena Ramos",
        rol: "admin",
        badge: "Directora Zynatra",
        avatar: "🏛️",
        tiempo: "Hace 1 hora",
        contenido: "Bienvenidos a la comunidad Zynatra. Recuerden completar su test de orientación psicométrica para descubrir las habilidades que definirán su futuro profesional.",
        likes: 32,
        comentarios: []
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("zynatra_community_posts", JSON.stringify(communityPosts));
  }, [communityPosts]);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: "post_" + Date.now(),
      channel: activeChannel,
      autor: currentUser?.nombre || "Usuario Zynatra",
      rol: currentUser?.rol || "student",
      badge: currentUser?.rol === "admin" ? "Administrador Zynatra" : currentUser?.rol === "teacher" ? "Mentor / Profesional" : "Estudiante Explorador",
      avatar: currentUser?.rol === "admin" ? "🏛️" : currentUser?.rol === "teacher" ? "👨‍🏫" : "🎓",
      tiempo: "Justo ahora",
      contenido: newPostText,
      likes: 0,
      comentarios: []
    };

    setCommunityPosts([newPost, ...communityPosts]);
    setNewPostText("");
  };

  const handleLikePost = (postId) => {
    setCommunityPosts(communityPosts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleAddComment = (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    setCommunityPosts(communityPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comentarios: [
            ...p.comentarios,
            { autor: currentUser?.nombre || "Usuario", rol: currentUser?.rol || "student", texto: text }
          ]
        };
      }
      return p;
    }));

    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  const profileDiscipline = currentUser?.rol === "student"
    ? getDisciplineFromProfile(studentInfo?.talentProfile)
    : null;

  useEffect(() => {
    const savedDiscipline = sessionStorage.getItem("polaris_network_discipline");
    if (savedDiscipline && DISCIPLINES.includes(savedDiscipline)) {
      setDisciplineFilter(savedDiscipline);
      setShowOnlyRecommended(true);
      sessionStorage.removeItem("polaris_network_discipline");
    }
  }, []);

  const handleConnect = (id) => {
    if (connectedIds.includes(id)) return;
    setConnectedIds([...connectedIds, id]);
    alert("¡Solicitud de convenio enviada! La conexión académica se procesará con el orientador escolar.");
  };

  if (loading) return <div>Cargando red educativa...</div>;

  const recommendedConnections = profileDiscipline
    ? connections.filter(conn => conn.disciplina === profileDiscipline)
    : [];

  const filteredConnections = connections.filter(conn => {
    const matchesSearch = conn.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "Todos" || conn.tipo === typeFilter;
    const matchesDiscipline = disciplineFilter === "Todos" || conn.disciplina === disciplineFilter;
    const matchesRecommended = !showOnlyRecommended || conn.disciplina === profileDiscipline;

    return matchesSearch && matchesType && matchesDiscipline && matchesRecommended;
  });

  const applyProfileFilter = () => {
    if (!profileDiscipline) return;
    setDisciplineFilter(profileDiscipline);
    setShowOnlyRecommended(true);
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Red de Conexión <span style={{ color: "#5bbfbf" }}>Académica & Comunidad</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Universidades, institutos técnicos, mentores en vivo y comunidad tipo Discord para tu futuro profesional.
          </p>
        </div>
        
        {/* Live Connected Users Indicator */}
        <div style={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          padding: "0.5rem 1rem",
          borderRadius: "20px",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          boxShadow: "0 4px 15px rgba(0,0,0,0.03)"
        }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2d3436" }}>142 Usuarios Conectados en Vivo</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button onClick={() => setViewMode("institutions")} className={`btn ${viewMode === "institutions" ? "btn-secondary" : "btn-glass"}`} style={{ gap: "0.4rem" }}>
          <Network size={16} /> Instituciones
        </button>
        <button onClick={() => setViewMode("scholarships")} className={`btn ${viewMode === "scholarships" ? "btn-accent" : "btn-glass"}`} style={{ gap: "0.4rem" }}>
          <Award size={16} /> Becas y Oportunidades
        </button>
        <button onClick={() => setViewMode("discord")} className={`btn ${viewMode === "discord" ? "btn-primary" : "btn-glass"}`} style={{ gap: "0.4rem" }}>
          <Sparkles size={16} /> 💬 Comunidad Zynatra (Discord Hub)
        </button>
        <button onClick={() => setViewMode("articles")} className={`btn ${viewMode === "articles" ? "btn-secondary" : "btn-glass"}`} style={{ gap: "0.4rem" }}>
          📰 Artículos & Guías
        </button>
      </div>

      {viewMode === "articles" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {[
            {
              id: "art1",
              titulo: "Cómo prepararte para el mercado laboral de Inteligencia Artificial y Desarrollo de Software",
              autor: "Ing. Gabriel Torrez",
              rol: "Mentor Tech & Desarrollador Senior",
              minutos: "5 min de lectura",
              resumen: "Conoce las tecnologías más demandadas en América Latina y cómo construir un portafolio relevante desde tus años escolares.",
              icono: "💻"
            },
            {
              id: "art2",
              titulo: "El futuro de las Energías Renovables y la Agronomía Sostenible en Nicaragua",
              autor: "Dra. Elena Ramos",
              rol: "Bióloga & Investigadora Ambiental",
              minutos: "4 min de lectura",
              resumen: "Descubre los proyectos de conservación de ecosistemas y cómo la tecnología se une con las ciencias de la tierra.",
              icono: "🌱"
            },
            {
              id: "art3",
              titulo: "Guía de Diseño de Experiencia de Usuario (UX/UI) para Creativos Digitales",
              autor: "Lic. Roberto Ruiz",
              rol: "Diseñador Senior & Animador 3D",
              minutos: "6 min de lectura",
              resumen: "Pasos fundamentales para transformar tu pasión artística en una carrera lucrativa y de alta demanda global.",
              icono: "🎨"
            }
          ].map(art => (
            <div key={art.id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "2rem" }}>{art.icono}</span>
                <span className="badge badge-glass" style={{ fontSize: "0.75rem" }}>{art.minutos}</span>
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: "1.3" }}>{art.titulo}</h3>
                <p style={{ fontSize: "0.8rem", color: "#5bbfbf", fontWeight: 600, marginTop: "0.3rem" }}>Por {art.autor} · {art.rol}</p>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {art.resumen}
              </p>
              <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid var(--border-glass)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button onClick={() => alert(`Lectura del artículo: "${art.titulo}". ¡Artículo marcado como leído!`)} className="btn btn-primary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                  Leer Artículo Completo
                </button>
                <a
                  href="https://www.linkedin.com/sharing/share-offsite/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0077b5", fontSize: "0.8rem", textDecoration: "none", fontWeight: 600 }}
                >
                  Compartir en LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "discord" ? (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1.5rem", minHeight: "500px" }}>
          {/* Discord Channels Sidebar */}
          <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              CANALES DE COMUNIDAD
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {[
                { id: "sala-maestros-y-estudiantes", label: "# maestros-y-estudiantes", icon: "👨‍🏫" },
                { id: "sala-profesionales-mentores", label: "# profesionales-mentores", icon: "👩‍⚕️" },
                { id: "general-vocacional", label: "# orientacion-general", icon: "💬" },
                { id: "software-y-tech", label: "# software-y-tech", icon: "💻" },
                { id: "ingenieria-y-futuro", label: "# ingenieria-y-futuro", icon: "⚙️" },
                { id: "arte-y-diseno", label: "# arte-y-diseno", icon: "🎨" }
              ].map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`btn ${activeChannel === ch.id ? "btn-primary" : "btn-glass"}`}
                  style={{ justifyContent: "flex-start", padding: "0.6rem 0.85rem", fontSize: "0.85rem" }}
                >
                  <span>{ch.icon}</span>
                  <span>{ch.label}</span>
                </button>
              ))}
            </div>

            <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-glass)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>Comunidad Zynatra</p>
              <p>Conecta con mentores profesionales y estudiantes en tiempo real.</p>
            </div>
          </div>

          {/* Discord Main Chat Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Create Post Card */}
            <form onSubmit={handleCreatePost} className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{currentUser?.rol === "admin" ? "🏛️" : currentUser?.rol === "teacher" ? "👨‍🏫" : "🎓"}</span>
                <div>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                    {currentUser?.nombre || "Usuario"} <span style={{ color: "var(--primary)", fontSize: "0.75rem", fontWeight: 600 }}>#{activeChannel}</span>
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Publicar una pregunta o experiencia para la comunidad</p>
                </div>
              </div>
              <textarea
                className="input-field"
                rows="3"
                placeholder={`Escribe un mensaje o pregunta en #${activeChannel}...`}
                value={newPostText}
                onChange={e => setNewPostText(e.target.value)}
                style={{ resize: "vertical" }}
              />
              <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-end", padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
                Publicar Mensaje
              </button>
            </form>

            {/* Message Feed */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {communityPosts.filter(p => p.channel === activeChannel || activeChannel === "general-vocacional").map(post => (
                <div key={post.id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <span style={{ fontSize: "1.75rem" }}>{post.avatar}</span>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>{post.autor}</span>
                          <span className={`badge ${post.rol === "admin" ? "badge-warning" : post.rol === "teacher" ? "badge-accent" : "badge-secondary"}`} style={{ fontSize: "0.65rem" }}>
                            {post.badge}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{post.tiempo}</span>
                      </div>
                    </div>
                    <button onClick={() => handleLikePost(post.id)} className="btn btn-glass" style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem", gap: "0.3rem" }}>
                      ❤️ {post.likes}
                    </button>
                  </div>

                  <p style={{ fontSize: "0.9rem", lineHeight: "1.5", color: "var(--text-primary)" }}>
                    {post.contenido}
                  </p>

                  {/* Comments Thread */}
                  {post.comentarios.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", background: "rgba(0,0,0,0.2)", padding: "0.85rem", borderRadius: "8px" }}>
                      {post.comentarios.map((c, idx) => (
                        <div key={idx} style={{ fontSize: "0.82rem", lineHeight: "1.4" }}>
                          <strong style={{ color: c.rol === "teacher" ? "#34d399" : "#a78bfa" }}>{c.autor}:</strong> {" "}
                          <span style={{ color: "var(--text-secondary)" }}>{c.texto}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Escribir una respuesta..."
                      value={commentInputs[post.id] || ""}
                      onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      onKeyDown={e => e.key === "Enter" && handleAddComment(post.id)}
                      style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}
                    />
                    <button onClick={() => handleAddComment(post.id)} className="btn btn-glass" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                      Responder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : viewMode === "scholarships" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {SCHOLARSHIPS.filter(s => !profileDiscipline || s.disciplina === "Todos" || s.disciplina === profileDiscipline).map(beca => (
            <div key={beca.id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "2rem" }}>{beca.icono}</span>
                <div>
                  <span className="badge badge-accent" style={{ fontSize: "0.65rem" }}>{beca.monto}</span>
                  <h4 style={{ fontWeight: 700, fontSize: "1rem", marginTop: "0.35rem" }}>{beca.titulo}</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{beca.institucion}</p>
                </div>
              </div>
              <ul style={{ fontSize: "0.85rem", color: "var(--text-secondary)", paddingLeft: "1.25rem" }}>
                {beca.requisitos.map((r, i) => <li key={i} style={{ marginBottom: "0.25rem" }}>{r}</li>)}
              </ul>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--warning)" }}>
                <Calendar size={14} /> Cierre: {beca.fechaLimite}
              </div>
              <button onClick={() => alert("¡Postulación registrada! Tu orientador escolar te contactará.")} className="btn btn-glass" style={{ alignSelf: "flex-start", fontSize: "0.8rem" }}>
                Me interesa esta beca
              </button>
            </div>
          ))}
        </div>
      ) : (
      <>
      {profileDiscipline && (
        <div className="glass-panel" style={{
          padding: "1.5rem",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.05) 100%)",
          border: "1px solid rgba(139, 92, 246, 0.25)",
          display: "flex",
          gap: "1.25rem",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <div style={{
            background: "rgba(139, 92, 246, 0.2)",
            padding: "0.85rem",
            borderRadius: "50%",
            border: "1px solid rgba(139, 92, 246, 0.3)"
          }}>
            <Compass size={28} style={{ color: "#a78bfa" }} />
          </div>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
              {studentInfo.talentProfile.perfilTop}
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Según tu test vocacional, te recomendamos instituciones en <strong>{profileDiscipline}</strong>.
              {recommendedConnections.length > 0 && ` Hay ${recommendedConnections.length} opciones en Nicaragua.`}
            </p>
          </div>
          <button onClick={applyProfileFilter} className="btn btn-primary" style={{ gap: "0.5rem" }}>
            <Sparkles size={16} />
            Ver recomendadas
          </button>
        </div>
      )}

      {!profileDiscipline && currentUser?.rol === "student" && (
        <div className="glass-panel" style={{
          padding: "1.25rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
          border: "1px dashed var(--border-glass)"
        }}>
          <GraduationCap size={24} style={{ color: "var(--primary)" }} />
          <p style={{ flex: 1, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Completa el test de orientación vocacional para recibir recomendaciones personalizadas de instituciones nicaragüenses.
          </p>
          {setActiveTab && (
            <button onClick={() => setActiveTab("vocational")} className="btn btn-glass" style={{ fontSize: "0.85rem" }}>
              Ir al test vocacional
            </button>
          )}
        </div>
      )}

      <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ position: "relative" }}>
          <Search size={18} style={{
            position: "absolute",
            left: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)"
          }} />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar universidades o institutos en Nicaragua..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "2.75rem" }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Tipo de Institución
            </span>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["Todos", "Universidad", "Instituto Técnico"].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`btn ${typeFilter === type ? "btn-secondary" : "btn-glass"}`}
                  style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", borderRadius: "20px" }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Disciplina Clave
            </span>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["Todos", ...DISCIPLINES].map(discipline => (
                <button
                  key={discipline}
                  onClick={() => {
                    setDisciplineFilter(discipline);
                    if (discipline === "Todos") setShowOnlyRecommended(false);
                  }}
                  className={`btn ${
                    disciplineFilter === discipline
                      ? (discipline === "Todos" ? "btn-secondary" : getDisciplineButtonClass(discipline))
                      : "btn-glass"
                  }`}
                  style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", borderRadius: "20px" }}
                >
                  {discipline}
                </button>
              ))}
            </div>
          </div>
        </div>

        {profileDiscipline && (
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            cursor: "pointer"
          }}>
            <input
              type="checkbox"
              checked={showOnlyRecommended}
              onChange={(e) => setShowOnlyRecommended(e.target.checked)}
              style={{ accentColor: "var(--primary)" }}
            />
            Mostrar solo instituciones recomendadas para mi perfil ({profileDiscipline})
          </label>
        )}
      </div>

      {profileDiscipline && recommendedConnections.length > 0 && !showOnlyRecommended && disciplineFilter === "Todos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Network size={20} style={{ color: "var(--primary)" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Destacadas para ti</h3>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem"
          }}>
            {recommendedConnections.slice(0, 2).map(conn => (
              <InstitutionCard
                key={`rec-${conn.id}`}
                conn={conn}
                isConnected={connectedIds.includes(conn.id)}
                isRecommended
                onConnect={handleConnect}
              />
            ))}
          </div>
        </div>
      )}

      {filteredConnections.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--text-secondary)" }}>No se encontraron instituciones con los filtros seleccionados.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
            {showOnlyRecommended ? "Instituciones recomendadas" : "Todas las instituciones"}
            <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "0.9rem", marginLeft: "0.5rem" }}>
              ({filteredConnections.length})
            </span>
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem"
          }}>
            {filteredConnections.map(conn => (
              <InstitutionCard
                key={conn.id}
                conn={conn}
                isConnected={connectedIds.includes(conn.id)}
                isRecommended={profileDiscipline === conn.disciplina}
                onConnect={handleConnect}
              />
            ))}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
