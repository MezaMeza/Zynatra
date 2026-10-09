import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { 
  Building2, Users, BookOpen, Activity, Plus, Trash2, ShieldCheck, X, Compass, BarChart3, UserCog
} from "lucide-react";
import { getDisciplineFromProfile } from "../../utils/vocational";
import AdminUsersPanel from "./AdminUsersPanel";

export default function SuperuserDashboard() {
  const { connections, schoolStudents, tasks, submissions, recoveryRequests } = useData();
  const [adminTab, setAdminTab] = useState("resumen");
  const [docentes, setDocentes] = useState([
    { id: "tch1", nombre: "Prof. Sofía Méndez", email: "docente@polaris.edu", materia: "Ecología y Ciencias Naturales", estado: "activo" },
    { id: "tch2", nombre: "Prof. Carlos Ruiz", email: "carlos@polaris.edu", materia: "Tecnología e Informática", estado: "activo" },
    { id: "tch3", nombre: "Prof. Laura Gaviria", email: "laura@polaris.edu", materia: "Artes y Diseño Gráfico", estado: "activo" }
  ]);
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newMateria, setNewMateria] = useState("Ecología");

  const handleInvite = (e) => {
    e.preventDefault();
    if (!newNombre || !newEmail) return;

    const newTeacher = {
      id: "tch_" + Date.now(),
      nombre: newNombre,
      email: newEmail,
      materia: newMateria,
      estado: "activo"
    };

    // Registrar docente de forma simulada en base de datos local
    const localUsers = JSON.parse(localStorage.getItem("polaris_users")) || {};
    localUsers[newEmail] = {
      uid: newTeacher.id,
      nombre: newNombre,
      email: newEmail,
      rol: "teacher",
      colegioId: "col1",
      contrasena: "123456"
    };
    localStorage.setItem("polaris_users", JSON.stringify(localUsers));

    setDocentes([...docentes, newTeacher]);
    setShowInviteModal(false);
    setNewNombre("");
    setNewEmail("");
    alert(`¡Profesor ${newNombre} invitado correctamente! Se ha creado su cuenta de acceso con la clave provisoria '123456'.`);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que deseas retirar los accesos a este docente del sistema escolar?")) {
      setDocentes(docentes.filter(d => d.id !== id));
    }
  };

  const vocationalStats = { Ecología: 0, Tecnología: 0, Ingeniería: 0, Arte: 0, "Sin test": 0 };
  schoolStudents.forEach(s => {
    const d = getDisciplineFromProfile(s.talentProfile);
    if (d) vocationalStats[d]++;
    else vocationalStats["Sin test"]++;
  });
  const maxStat = Math.max(...Object.values(vocationalStats), 1);
  const testsCompleted = schoolStudents.filter(s => s.talentProfile).length;
  const testRate = schoolStudents.length ? Math.round((testsCompleted / schoolStudents.length) * 100) : 0;
  const pendingRecoveries = recoveryRequests.filter(r => r.estado === "pendiente").length;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
            Panel de <span className="text-gradient-gold">Dirección</span> 🏛️
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Administración institucional: juventud, docentes, recuperación de cuentas y métricas vocacionales.
          </p>
        </div>
        {adminTab === "resumen" && (
        <button 
          onClick={() => setShowInviteModal(true)}
          className="btn btn-accent" 
          style={{ gap: "0.5rem", background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)", boxShadow: "0 0 15px rgba(245, 158, 11, 0.4)" }}
        >
          <Plus size={18} />
          <span>Invitar Docente</span>
        </button>
        )}
      </div>

      {/* Admin tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {[
          { id: "resumen", label: "Resumen Institucional", icon: BarChart3 },
          { id: "usuarios", label: "Gestión de Usuarios y Accesos", icon: UserCog },
          { id: "sicometrico", label: "Gestión de Test Sicométrico", icon: Compass },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`btn ${adminTab === tab.id ? "btn-secondary" : "btn-glass"}`}
              style={{ gap: "0.4rem", fontSize: "0.85rem" }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.id === "usuarios" && pendingRecoveries > 0 && (
                <span className="badge badge-warning" style={{ fontSize: "0.6rem", marginLeft: "0.25rem" }}>{pendingRecoveries}</span>
              )}
            </button>
          );
        })}
      </div>

      {adminTab === "usuarios" ? (
        <AdminUsersPanel />
      ) : adminTab === "sicometrico" ? (
        <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Gestor de Test Sicométrico y Habilidades</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Personaliza las preguntas del test vocacional para evaluar a los estudiantes e impulsarlos hacia la carrera adecuada.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>🛠️ Módulos de Evaluación Activos (8 Preguntas Diagnósticas)</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
              <div className="glass-card" style={{ padding: "1rem" }}>
                <span className="badge badge-primary">Área: Tecnología</span>
                <p style={{ fontWeight: 700, marginTop: "0.5rem", fontSize: "0.9rem" }}>Lógica, Algoritmos e IA</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Evalúa inclinación hacia desarrollo de software, robótica y sistemas.</p>
              </div>
              <div className="glass-card" style={{ padding: "1rem" }}>
                <span className="badge badge-accent">Área: Ecología</span>
                <p style={{ fontWeight: 700, marginTop: "0.5rem", fontSize: "0.9rem" }}>Ciencias de la Tierra & Ecosistemas</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Evalúa compromiso ambiental, biotecnología y agroecología.</p>
              </div>
              <div className="glass-card" style={{ padding: "1rem" }}>
                <span className="badge badge-warning">Área: Ingeniería</span>
                <p style={{ fontWeight: 700, marginTop: "0.5rem", fontSize: "0.9rem" }}>Mecánica & Energías Renovables</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Evalúa diseño de circuitos, estructuras y solución de problemas físicos.</p>
              </div>
              <div className="glass-card" style={{ padding: "1rem" }}>
                <span className="badge badge-secondary">Área: Arte & Diseño</span>
                <p style={{ fontWeight: 700, marginTop: "0.5rem", fontSize: "0.9rem" }}>Comunicación Visual & UX/UI</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Evalúa expresión artística, animación 3D y diseño de marcas.</p>
              </div>
            </div>

            <button onClick={() => alert("¡Nueva pregunta añadida al banco del test sicométrico!")} className="btn btn-primary" style={{ alignSelf: "flex-start", gap: "0.5rem", marginTop: "0.5rem" }}>
              <Plus size={16} /> Añadir nueva pregunta al test
            </button>
          </div>
        </div>
      ) : (
      <>

      {/* Analytics Statistics Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.5rem"
      }}>
        {/* Stat 1 */}
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{
            background: "rgba(139, 92, 246, 0.1)",
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            color: "var(--primary)"
          }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Estudiantes Registrados</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800 }}>{schoolStudents.length} alumnos</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{
            background: "rgba(6, 182, 212, 0.1)",
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(6, 182, 212, 0.2)",
            color: "var(--secondary)"
          }}>
            <BookOpen size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Docentes Activos</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800 }}>{docentes.length} profesores</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{
            background: "rgba(16, 185, 129, 0.1)",
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            color: "var(--accent)"
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Convenios Vinculados</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800 }}>{connections.length} convenios</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{
            background: "rgba(245, 158, 11, 0.1)",
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            color: "#fbbf24"
          }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Orientación Vocacional</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800 }}>{testRate}% completado</p>
          </div>
        </div>
      </div>

      {/* Vocational distribution chart */}
      <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BarChart3 size={20} style={{ color: "var(--primary)" }} />
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Distribución Vocacional del Colegio</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {Object.entries(vocationalStats).map(([label, count]) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Compass size={14} /> {label}
                </span>
                <span style={{ fontWeight: 700 }}>{count} estudiantes</span>
              </div>
              <div style={{ height: "10px", background: "#eef2f6", borderRadius: "5px" }}>
                <div style={{
                  height: "100%",
                  width: `${(count / maxStat) * 100}%`,
                  background: "linear-gradient(90deg, var(--primary), var(--secondary))",
                  borderRadius: "5px",
                  transition: "width 0.6s ease"
                }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {tasks.length} tareas activas · {submissions.filter(s => s.estado === "entregado").length} entregas pendientes de calificar
        </p>
      </div>

      {/* Grid Layout: Left (Teacher administration), Right (Active Partnerships summary) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.8fr 1.2fr",
        gap: "2rem"
      }} className="responsive-grid">
        
        {/* Left Side: Teachers list */}
        <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={20} style={{ color: "var(--primary)" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Gestión de la Planta Docente</h3>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>Nombre</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>E-mail</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>Materia</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>Estado</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 700, textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docentes.map((docente) => (
                  <tr key={docente.id} style={{ borderBottom: "1px solid var(--border-glass)", transition: "background 0.2s" }}>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>{docente.nombre}</td>
                    <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{docente.email}</td>
                    <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{docente.materia}</td>
                    <td style={{ padding: "1rem" }}>
                      <span className="badge badge-accent" style={{ fontSize: "0.6rem" }}>{docente.estado}</span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <button 
                        onClick={() => handleDelete(docente.id)}
                        style={{
                          background: "none", border: "none", color: "var(--danger)", cursor: "pointer",
                          padding: "0.25rem", borderRadius: "4px"
                        }}
                        title="Suspender acceso"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Quick view of Active Partnerships */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Building2 size={20} style={{ color: "var(--accent)" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Convenios Institucionales</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {connections.slice(0, 3).map((conn) => (
              <div key={conn.id} className="glass-card" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ fontSize: "1.75rem" }}>{conn.logo}</div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: "0.9rem" }}>{conn.nombre}</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Foco: {conn.disciplina}</p>
                </div>
              </div>
            ))}
            <div style={{
              background: "rgba(16, 185, 129, 0.05)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}>
              <ShieldCheck size={20} style={{ color: "var(--accent)" }} />
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                Convenios auditados y vinculados por la dirección del colegio para facilitar el ingreso de egresados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* INVITE TEACHER MODAL */}
      {showInviteModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem"
        }}>
          <form onSubmit={handleInvite} className="glass-panel animate-fade-in" style={{
            width: "100%", maxWidth: "500px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Invitar Docente</h3>
              <button type="button" onClick={() => setShowInviteModal(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Nombre del Docente</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ej. Prof. Carlos Ruiz"
                value={newNombre} 
                onChange={(e) => setNewNombre(e.target.value)} 
                required 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Correo Electrónico</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="correo@colegio.edu"
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                required 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Materia / Especialidad</label>
              <select 
                className="input-field" 
                value={newMateria} 
                onChange={(e) => setNewMateria(e.target.value)}
                style={{ background: "#161f30", color: "#fff" }}
              >
                <option value="Ecología y Ciencias Naturales">🌱 Ecología y Ciencias Naturales</option>
                <option value="Tecnología e Informática">💻 Tecnología e Informática</option>
                <option value="Física y Mecánica">⚙️ Física y Mecánica</option>
                <option value="Artes y Diseño Gráfico">🎨 Artes y Diseño Gráfico</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn-glass" onClick={() => setShowInviteModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-accent" style={{ background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)" }}>
                <span>Enviar Invitación</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Responsive adjustments CSS */}
      <style>{`
        @media (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      </>
      )}
    </div>
  );
}
