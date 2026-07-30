import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  ClipboardCheck, 
  Send,
  X,
  Award,
  Compass,
  Users
} from "lucide-react";
import { getDisciplineBadgeClass, getDisciplineFromProfile } from "../../utils/vocational";

export default function TeacherDashboard({ setActiveTab }) {
  const { currentUser } = useAuth();
  const { tasks, submissions, schoolStudents, addAssignment, gradeAssignment } = useData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(null); // submission object
  
  // Formulario de creación
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskSubject, setTaskSubject] = useState("Ecología");
  const [taskDate, setTaskDate] = useState("");
  
  // Formulario de calificación
  const [gradeScore, setGradeScore] = useState("10");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Mapear nombres de alumnos de forma local
  const getStudentName = (uid) => {
    const localUsers = JSON.parse(localStorage.getItem("polaris_users")) || {};
    const match = Object.values(localUsers).find(u => u.uid === uid);
    return match ? match.nombre : "Alumno Mateo Silva"; // fallback
  };

  const getTaskTitle = (taskId) => {
    // Buscar en la lista general de tareas
    const localTasks = JSON.parse(localStorage.getItem("polaris_tasks")) || [];
    const match = localTasks.find(t => t.id === taskId);
    return match ? match.titulo : "Tarea Escolar";
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDesc || !taskDate) return;
    
    setIsActionLoading(true);
    try {
      await addAssignment(taskTitle, taskDesc, taskSubject, taskDate);
      setShowCreateModal(false);
      // Resetear formulario
      setTaskTitle("");
      setTaskDesc("");
      setTaskDate("");
    } catch (e) {
      alert("Error al crear la tarea.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenGrade = (sub) => {
    setShowGradeModal(sub);
    setGradeScore("10");
    setGradeFeedback("");
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!showGradeModal || !gradeScore) return;

    setIsActionLoading(true);
    try {
      await gradeAssignment(showGradeModal.id, showGradeModal.estudianteId, gradeScore, gradeFeedback);
      setShowGradeModal(null);
    } catch (e) {
      alert("Error al calificar.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const withProfile = schoolStudents.filter(s => s.talentProfile).length;
  const pendingSubs = submissions.filter(s => s.estado !== "calificado").length;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
            Panel de <span className="text-gradient-secondary">Docentes</span> 👩‍🏫
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Administra tus asignaturas, orienta a tus alumnos y evalúa su desarrollo vocacional.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-secondary" 
          style={{ gap: "0.5rem" }}
        >
          <Plus size={18} />
          <span>Crear Nueva Tarea</span>
        </button>
      </div>

      {/* Teacher analytics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div className="glass-card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>ALUMNOS ORIENTADOS</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>{withProfile}/{schoolStudents.length}</p>
        </div>
        <div className="glass-card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>TAREAS PUBLICADAS</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--secondary)" }}>{tasks.length}</p>
        </div>
        <div className="glass-card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>ENTREGAS PENDIENTES</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--warning)" }}>{pendingSubs}</p>
        </div>
        {setActiveTab && (
          <button onClick={() => setActiveTab("resources")} className="glass-card btn-glass" style={{ textAlign: "center", cursor: "pointer", border: "1px dashed var(--border-glass)" }}>
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent)" }}>📚 Biblioteca Vocacional</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Recursos para tus clases</p>
          </button>
        )}
      </div>

      {/* Vocational Guidance Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Compass size={20} style={{ color: "var(--primary)" }} />
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Orientación Vocacional de Alumnos</h3>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem"
        }}>
          {schoolStudents.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center", padding: "2rem", gridColumn: "1 / -1" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No hay estudiantes registrados en tu colegio.</p>
            </div>
          ) : (
            schoolStudents.map((student) => {
              const profile = student.talentProfile;
              const disciplina = getDisciplineFromProfile(profile);
              return (
                <div key={student.uid || student.id} className="glass-card" style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  borderLeft: `4px solid ${profile ? "var(--primary)" : "var(--text-muted)"}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.9rem"
                      }}>
                        {student.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{student.nombre}</h4>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Nivel {student.nivel || 1} · {student.xp || 0} XP</p>
                      </div>
                    </div>
                    <span className={`badge ${profile ? "badge-accent" : "badge-warning"}`} style={{ fontSize: "0.6rem" }}>
                      {profile ? "Perfil listo" : "Sin test"}
                    </span>
                  </div>

                  {profile ? (
                    <>
                      <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--primary)" }}>{profile.perfilTop}</p>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: "1.4" }}>
                        {profile.areaPrincipal}
                      </p>
                      {disciplina && (
                        <span className={`badge ${getDisciplineBadgeClass(disciplina)}`} style={{ alignSelf: "flex-start", fontSize: "0.7rem" }}>
                          {disciplina}
                        </span>
                      )}
                    </>
                  ) : (
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontStyle: "italic" }}>
                      Aún no ha completado el test de orientación vocacional.
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Grid Dashboard view: Left (Tasks Created), Right (Submissions to grade) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1.8fr",
        gap: "2rem"
      }} className="responsive-grid">
        
        {/* Left Side: Tasks Created by this Teacher */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <BookOpen size={20} style={{ color: "var(--secondary)" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Tus Tareas Publicadas</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {tasks.length === 0 ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No has publicado ninguna tarea aún.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <span className="badge badge-secondary" style={{ fontSize: "0.65rem" }}>{task.materia}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      <Calendar size={12} />
                      <span>Límite: {task.fechaLimite}</span>
                    </div>
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>{task.titulo}</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: "1.4" }}>
                    {task.descripcion}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Student Submissions Checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <ClipboardCheck size={20} style={{ color: "var(--accent)" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Evaluar Entregas de Alumnos</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {submissions.length === 0 ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ color: "var(--text-secondary)" }}>No hay entregas pendientes de tus alumnos.</p>
              </div>
            ) : (
              submissions.map((sub) => {
                const isGraded = sub.estado === "calificado";
                return (
                  <div key={sub.id} className="glass-card" style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    borderLeft: `4px solid ${isGraded ? "var(--accent)" : "var(--warning)"}`
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div>
                        <span className={`badge ${isGraded ? "badge-accent" : "badge-warning"}`} style={{ fontSize: "0.65rem", marginBottom: "0.5rem" }}>
                          {isGraded ? `Calificado: ${sub.calificacion}/10` : "Pendiente de Calificar"}
                        </span>
                        <h4 style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                          Estudiante: {getStudentName(sub.estudianteId)}
                        </h4>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                          Materia: {getTaskTitle(sub.tareaId)}
                        </p>
                      </div>
                      
                      {sub.fechaEntrega && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          Entregado: {sub.fechaEntrega}
                        </span>
                      )}
                    </div>

                    <div style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-glass)",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.85rem"
                    }}>
                      <p style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Respuesta enviada:</p>
                      <p style={{ color: "var(--text-primary)", fontStyle: "italic" }}>
                        "{sub.feedbackEstudiante || "El alumno ha cargado la respuesta digital del proyecto."}"
                      </p>
                    </div>

                    {isGraded ? (
                      <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.85rem" }}>
                        <p style={{ fontWeight: 700, color: "var(--accent)" }}>Tu Calificación & Feedback:</p>
                        <p style={{ color: "var(--text-secondary)" }}>
                          "{sub.feedback || "¡Buen trabajo!"}"
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenGrade(sub)}
                        className="btn btn-primary"
                        style={{ alignSelf: "flex-end", fontSize: "0.8rem", padding: "0.4rem 1rem" }}
                      >
                        Evaluar y Otorgar XP
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem"
        }}>
          <form onSubmit={handleCreateTask} className="glass-panel animate-fade-in" style={{
            width: "100%", maxWidth: "550px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Crear Nueva Tarea</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Título de la Tarea</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ej. Análisis de Huella Ecológica"
                value={taskTitle} 
                onChange={(e) => setTaskTitle(e.target.value)} 
                required 
                disabled={isActionLoading}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Descripción detallada</label>
              <textarea 
                className="input-field" 
                rows="4" 
                placeholder="Indica las instrucciones del trabajo para tus alumnos..."
                value={taskDesc} 
                onChange={(e) => setTaskDesc(e.target.value)} 
                required 
                disabled={isActionLoading}
                style={{ resize: "none" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Disciplina / Materia</label>
                <select 
                  className="input-field" 
                  value={taskSubject} 
                  onChange={(e) => setTaskSubject(e.target.value)}
                  style={{ background: "#161f30", color: "#fff" }}
                >
                  <option value="Ecología">🌱 Ecología y Medioambiente</option>
                  <option value="Tecnología">💻 Informática y Algoritmos</option>
                  <option value="Ingeniería">⚙️ Física y Mecánica</option>
                  <option value="Arte">🎨 Arte y Comunicación</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Fecha Límite</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={taskDate} 
                  onChange={(e) => setTaskDate(e.target.value)} 
                  required
                  disabled={isActionLoading}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn-glass" onClick={() => setShowCreateModal(false)} disabled={isActionLoading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-secondary" disabled={isActionLoading}>
                {isActionLoading ? "Publicando..." : "Publicar Tarea"}
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GRADE SUBMISSION MODAL */}
      {showGradeModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem"
        }}>
          <form onSubmit={handleSaveGrade} className="glass-panel animate-fade-in" style={{
            width: "100%", maxWidth: "500px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Evaluar Alumno</h3>
              <button type="button" onClick={() => setShowGradeModal(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Estudiante:</p>
              <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>{getStudentName(showGradeModal.estudianteId)}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem", alignItems: "center" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Nota de Calificación (1 al 10)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  className="input-field"
                  value={gradeScore} 
                  onChange={(e) => setGradeScore(e.target.value)} 
                  required
                  disabled={isActionLoading}
                />
              </div>
              
              <div style={{ alignSelf: "flex-end" }}>
                <span className="badge badge-accent" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.7rem",
                  padding: "0.5rem"
                }}>
                  <Award size={12} />
                  <span>Calificación aprobatoria (+100 XP)</span>
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Retroalimentación / Comentarios</label>
              <textarea 
                className="input-field" 
                rows="4" 
                placeholder="Excelente trabajo resolviendo el problema. Sigue así..."
                value={gradeFeedback} 
                onChange={(e) => setGradeFeedback(e.target.value)} 
                required 
                disabled={isActionLoading}
                style={{ resize: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn-glass" onClick={() => setShowGradeModal(null)} disabled={isActionLoading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-accent" disabled={isActionLoading}>
                {isActionLoading ? "Guardando..." : "Guardar Calificación"}
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
    </div>
  );
}
