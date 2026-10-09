import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { 
  Trophy, BookOpen, Calendar, Gamepad2, Brain,
  ArrowRight, Send, Zap, Flame, Bot, Library, Target
} from "lucide-react";
import { getTodaysChallenges } from "../../data/achievements";
import GameCenter from "../../components/GameCenter";

export default function StudentDashboard({ setActiveTab }) {
  const { currentUser } = useAuth();
  const { studentInfo, tasks, submissions, submitAssignment, finishGame } = useData();
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionFeedback, setSubmissionFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tutorial interactivo de 3 pasos tras registro/bienvenida
  const [showTutorial, setShowTutorial] = useState(() => {
    return sessionStorage.getItem("zynatra_show_tutorial") === "true";
  });
  const [tutorialStep, setTutorialStep] = useState(1);

  const handleNextTutorialStep = () => {
    if (tutorialStep < 3) {
      setTutorialStep(prev => prev + 1);
    } else {
      handleCloseTutorial();
    }
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    sessionStorage.removeItem("zynatra_show_tutorial");
  };

  if (!currentUser || !studentInfo) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>Cargando datos del estudiante...</div>;
  }

  const studentLevel = studentInfo.nivel || 1;
  const studentXP = studentInfo.xp || 0;
  const xpNeeded = studentLevel * 150;
  const currentProgress = (studentXP % 150);
  const percentage = Math.min(100, Math.floor((currentProgress / 150) * 100));

  // Buscar el estado de una tarea en las entregas
  const getTaskStatus = (taskId) => {
    const sub = submissions.find(s => s.tareaId === taskId);
    if (!sub) return { state: "pendiente", label: "Pendiente", color: "badge-primary" };
    if (sub.estado === "calificado") return { state: "calificado", label: `Nota: ${sub.calificacion}/10`, color: "badge-accent", data: sub };
    return { state: "entregado", label: "Entregado (En revisión)", color: "badge-warning", data: sub };
  };

  const handleOpenSubmit = (task) => {
    setSelectedTask(task);
    setSubmissionFeedback("");
  };

  const handleSendSubmission = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await submitAssignment(selectedTask.id, submissionFeedback);
      setSelectedTask(null);
    } catch (e) {
      alert("Error al enviar la tarea.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const streak = studentInfo.streak?.count || 0;
  const todayChallenges = getTodaysChallenges();
  const completedChallenges = studentInfo.dailyChallenges?.completed || [];

  const quickModules = [
    { id: "advisor", label: "Asesor IA", icon: Bot, color: "var(--primary)" },
    { id: "resources", label: "Biblioteca", icon: Library, color: "var(--secondary)" },
    { id: "progress", label: "Mi Progreso", icon: Target, color: "var(--accent)" },
    { id: "games", label: "Juegos", icon: Gamepad2, color: "var(--warning)" },
    { id: "vocational", label: "Test Vocacional", icon: Brain, color: "#a78bfa" }
  ];

  const mainCards = [
    {
      id: "games",
      title: "Test",
      icon: (
        <svg viewBox="0 0 100 100" width="52" height="52">
          <path d="M 50 15 C 32 15 22 28 22 45 C 22 56 28 64 36 70 L 36 82 C 36 85 39 88 42 88 L 58 88 C 61 88 64 85 64 82 L 64 70 C 72 64 78 56 78 45 C 78 28 68 15 50 15 Z" fill="#50b8c4" />
          <text x="50" y="50" fill="#ffffff" fontSize="22" fontWeight="900" textAnchor="middle" dominantBaseline="middle" fontFamily="sans-serif">IQ</text>
        </svg>
      )
    },
    {
      id: "vocational",
      title: "Test Vocional",
      icon: (
        <svg viewBox="0 0 100 100" width="52" height="52">
          <polygon points="50,10 88,26 50,42 12,26" fill="#50b8c4" />
          <polygon points="35,34 35,46 50,52 65,46 65,34" fill="#50b8c4" />
          <path d="M 50 40 C 36 40 26 50 26 64 C 26 73 32 80 40 84 L 40 92 L 60 92 L 60 84 C 68 80 74 73 74 64 C 74 50 64 40 50 40 Z" fill="none" stroke="#50b8c4" strokeWidth="5" />
          <path d="M 44 70 C 44 64 56 64 56 70" stroke="#50b8c4" strokeWidth="4" fill="none" />
          <line x1="44" y1="92" x2="56" y2="92" stroke="#50b8c4" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: "progress",
      title: "Habilidades",
      icon: (
        <svg viewBox="0 0 100 100" width="52" height="52">
          <circle cx="50" cy="50" r="32" stroke="#50b8c4" strokeWidth="4" fill="none" />
          <circle cx="50" cy="18" r="5" fill="#ffffff" stroke="#50b8c4" strokeWidth="4" />
          <circle cx="82" cy="50" r="5" fill="#ffffff" stroke="#50b8c4" strokeWidth="4" />
          <circle cx="50" cy="82" r="5" fill="#ffffff" stroke="#50b8c4" strokeWidth="4" />
          <circle cx="18" cy="50" r="5" fill="#ffffff" stroke="#50b8c4" strokeWidth="4" />
          <circle cx="50" cy="42" r="8" fill="none" stroke="#50b8c4" strokeWidth="4" />
          <path d="M 37 62 C 37 54 43 50 50 50 C 57 50 63 54 63 62" stroke="#50b8c4" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: "resources",
      title: "Información",
      icon: (
        <svg viewBox="0 0 100 100" width="52" height="52">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#50b8c4" strokeWidth="6" />
          <circle cx="50" cy="30" r="5" fill="#50b8c4" />
          <line x1="50" y1="44" x2="50" y2="70" stroke="#50b8c4" strokeWidth="7" strokeLinecap="round" />
        </svg>
      )
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px", margin: "0 auto", width: "100%", overflow: "hidden" }}>
      {/* Header Greeting - Exact format from screenshot */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(1.4rem, 5vw, 2.4rem)", fontWeight: 800, color: "#000000", margin: 0, letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "break-word" }}>
              Hola,<span style={{ color: "#50b8c4", marginLeft: "0.3rem" }}>{currentUser?.nombre || "Estudiante"}</span>
            </h1>
            {/* Teal Waving Hand SVG */}
            <svg viewBox="0 0 100 100" style={{ width: "clamp(32px, 8vw, 48px)", height: "clamp(32px, 8vw, 48px)", flexShrink: 0 }}>
              <path d="M50,15 C54,15 57,18 57,22 L57,45 L62,45 C66,45 69,48 69,52 L69,65 C69,78 58,88 45,88 C32,88 22,78 22,65 L22,40 C22,36 25,33 29,33 C33,33 36,36 36,40 L36,30 C36,26 39,23 43,23 C47,23 50,26 50,30 L50,15 Z" fill="#50b8c4" />
              <path d="M75,25 A20,20 0 0,1 85,45" fill="none" stroke="#50b8c4" strokeWidth="4" strokeLinecap="round" />
              <path d="M82,18 A30,30 0 0,1 94,45" fill="none" stroke="#50b8c4" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ color: "#000000", fontSize: "1.05rem", fontWeight: 700, marginTop: "0.75rem", marginBottom: "0.2rem" }}>
            ¡Tu viaje de aprendizaje está por comenzar!
          </p>
          <p style={{ color: "#000000", fontSize: "1rem", fontWeight: 600 }}>
            Resuelve tareas,gana xp y descubre tu vocación.
          </p>
        </div>

        {/* Stats Badges */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            padding: "0.6rem 1.25rem",
            borderRadius: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <Trophy size={22} style={{ color: "#f59e0b" }} />
            <div>
              <span style={{ fontSize: "0.65rem", color: "#636e72", fontWeight: 700, display: "block" }}>NIVEL</span>
              <strong style={{ fontSize: "1.1rem", color: "#2d3436" }}>Lvl {studentInfo.nivel}</strong>
            </div>
          </div>
          <div style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            padding: "0.6rem 1.25rem",
            borderRadius: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <Flame size={22} style={{ color: "#f59e0b" }} />
            <div>
              <span style={{ fontSize: "0.65rem", color: "#636e72", fontWeight: 700, display: "block" }}>RACHA</span>
              <strong style={{ fontSize: "1.1rem", color: "#2d3436" }}>{streak} días</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Card Buttons - 2x2 Layout matching screenshot on Desktop & Android */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "clamp(0.75rem, 2vw, 1.25rem)",
        marginTop: "0.5rem"
      }}>
        {mainCards.map(card => (
          <button
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            style={{
              backgroundColor: "#e7eaee",
              border: "none",
              borderRadius: "32px",
              padding: "clamp(1.2rem, 4vw, 2.2rem) clamp(0.5rem, 2vw, 1rem)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.85rem",
              cursor: "pointer",
              transition: "transform 0.18s ease, backgroundColor 0.18s ease",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
              width: "100%",
              boxSizing: "border-box",
              WebkitTapHighlightColor: "transparent",
              appearance: "none"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.backgroundColor = "#dfdfdf";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.backgroundColor = "#e7eaee";
            }}
          >
            {card.icon}
            <span style={{
              fontSize: "clamp(0.85rem, 2.5vw, 1.15rem)",
              fontWeight: 700,
              color: "#000000",
              textAlign: "center",
              fontFamily: "'Outfit', sans-serif"
            }}>
              {card.title}
            </span>
          </button>
        ))}
      </div>

      {/* Access Cards Row for Comunidad & Asesor IA */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
        <button
          onClick={() => setActiveTab("network")}
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid #50b8c4",
            borderRadius: "20px",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#2d3436",
            boxShadow: "0 4px 15px rgba(80, 184, 196, 0.1)"
          }}
        >
          <span>💬 Comunidad Zynatra</span>
        </button>

        <button
          onClick={() => setActiveTab("advisor")}
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid #50b8c4",
            borderRadius: "20px",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#2d3436",
            boxShadow: "0 4px 15px rgba(80, 184, 196, 0.1)"
          }}
        >
          <span>🤖 Asesor IA</span>
        </button>
      </div>

      {/* Daily challenges preview */}
      <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap size={18} style={{ color: "var(--warning)" }} /> Retos de hoy
          </span>
          <button onClick={() => setActiveTab("progress")} className="btn btn-glass" style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem" }}>
            Ver todos
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {todayChallenges.map(ch => (
            <span key={ch.id} className={`badge ${completedChallenges.includes(ch.id) ? "badge-accent" : "badge-glass"}`} style={{ fontSize: "0.75rem" }}>
              {completedChallenges.includes(ch.id) ? "✓ " : ""}{ch.titulo}
            </span>
          ))}
        </div>
      </div>

      {/* Gamification Progress Bar */}
      <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap size={20} style={{ color: "var(--primary)" }} />
            <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Progreso de Nivel</span>
          </div>
          <span style={{ fontSize: "0.95rem", color: "var(--text-secondary)", fontWeight: 600 }}>
            {studentInfo.xp} XP acumulados
          </span>
        </div>
        <div style={{
          height: "14px",
          width: "100%",
          background: "#eef2f6",
          borderRadius: "10px",
          overflow: "hidden",
          border: "1px solid var(--border-glass)"
        }}>
          <div style={{
            height: "100%",
            width: `${percentage}%`,
            background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)",
            borderRadius: "10px",
            transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)"
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <span>Lvl {studentInfo.nivel}</span>
          <span>{currentProgress} / 150 XP para Lvl {studentInfo.nivel + 1}</span>
          <span>Lvl {studentInfo.nivel + 1}</span>
        </div>
      </div>

      {/* Vocational / Talent AI Widget */}
      <div className="glass-panel" style={{
        padding: "2rem",
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)",
        border: "1px solid rgba(139, 92, 246, 0.25)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "150px",
          height: "150px",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            background: "rgba(139, 92, 246, 0.2)",
            padding: "1rem",
            borderRadius: "50%",
            border: "1px solid rgba(139, 92, 246, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Brain size={36} style={{ color: "#a78bfa" }} />
          </div>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              {studentInfo.talentProfile 
                ? `Tu Talento: ${studentInfo.talentProfile.perfilTop}` 
                : "Descubre tu Vocación con Inteligencia Artificial"
              }
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              {studentInfo.talentProfile 
                ? `Tu perfil destaca en ${studentInfo.talentProfile.areaPrincipal}. Explora universidades e institutos en Nicaragua acordes a tu vocación.` 
                : "Realiza nuestro test interactivo gamificado. Analizaremos tus habilidades e intereses en ecología, tecnología y más para guiar tu futuro académico."
              }
            </p>
            {studentInfo.talentProfile && (
              <button
                onClick={() => setActiveTab("network")}
                className="btn btn-glass"
                style={{ marginTop: "0.75rem", fontSize: "0.85rem", gap: "0.4rem", alignSelf: "flex-start" }}
              >
                Ver instituciones recomendadas
                <ArrowRight size={14} />
              </button>
            )}
          </div>
          <button 
            onClick={() => setActiveTab("vocational")}
            className="btn btn-primary"
            style={{ gap: "0.5rem" }}
          >
            {studentInfo.talentProfile ? "Ver Mi Perfil Vocacional" : "Comenzar Test"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Grid: Tasks & Mini Games */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.2fr",
        gap: "2rem",
      }} className="responsive-grid">
        
        {/* Homework Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <BookOpen size={22} style={{ color: "var(--secondary)" }} />
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Tareas Pendientes</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {tasks.length === 0 ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: "var(--text-secondary)" }}>No tienes tareas asignadas en este momento.</p>
              </div>
            ) : (
              tasks.map((task) => {
                const status = getTaskStatus(task.id);
                return (
                  <div key={task.id} className="glass-card" style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    borderLeft: `4px solid ${
                      status.state === "calificado" ? "var(--accent)" : status.state === "entregado" ? "var(--warning)" : "var(--primary)"
                    }`
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                      <div>
                        <span className={`badge ${status.color}`} style={{ marginBottom: "0.5rem" }}>{status.label}</span>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{task.titulo}</h4>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                          Materia: {task.materia}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                        <Calendar size={14} />
                        <span>Vence: {task.fechaLimite}</span>
                      </div>
                    </div>
                    
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.4" }}>
                      {task.descripcion}
                    </p>

                    {status.state === "pendiente" ? (
                      <button 
                        onClick={() => handleOpenSubmit(task)}
                        className="btn btn-glass"
                        style={{ alignSelf: "flex-end", fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                      >
                        Entregar Tarea
                      </button>
                    ) : (
                      <div style={{
                        background: "#f8fafc",
                        padding: "0.75rem",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-glass)",
                        fontSize: "0.85rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem"
                      }}>
                        <p style={{ fontWeight: 600 }}>Tu respuesta:</p>
                        <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
                          "{status.data?.feedbackEstudiante || "Respuesta enviada de forma digital."}"
                        </p>
                        {status.state === "calificado" && (
                          <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                            <p style={{ color: "var(--accent)", fontWeight: 700 }}>Feedback del Profesor:</p>
                            <p style={{ color: "var(--text-secondary)" }}>
                              "{status.data?.feedback || "¡Buen trabajo!"}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gamified Didactic Games Center */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Gamepad2 size={22} style={{ color: "var(--accent)" }} />
              <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Juegos Didácticos</h3>
            </div>
            <button onClick={() => setActiveTab("games")} className="btn btn-glass" style={{ fontSize: "0.8rem", gap: "0.35rem" }}>
              Ver todos <ArrowRight size={14} />
            </button>
          </div>
          <GameCenter studentInfo={studentInfo} finishGame={finishGame} compact />
        </div>
      </div>

      {/* Submit Assignment Inline Modal/View */}
      {selectedTask && createPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: "100%",
            maxWidth: "500px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem"
          }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Entregar Tarea</h3>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Tarea seleccionada:</p>
              <p style={{ fontWeight: 700 }}>{selectedTask.titulo}</p>
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Escribe tu entrega o respuesta aquí:
              </label>
              <textarea 
                className="input-field" 
                rows="5"
                placeholder="Escribe la resolución de la tarea o detalla el enlace de tu proyecto..."
                value={submissionFeedback}
                onChange={(e) => setSubmissionFeedback(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button 
                onClick={() => setSelectedTask(null)}
                className="btn btn-glass"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSendSubmission}
                className="btn btn-primary"
                disabled={isSubmitting || !submissionFeedback.trim()}
              >
                <span>Enviar Entrega</span>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL TUTORIAL INTERACTIVO DE BIENVENIDA (3 PASOS) */}
      {showTutorial && createPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(8px)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem"
        }}>
          <div className="animate-fade-in" style={{
            backgroundColor: "#ffffff",
            borderRadius: "28px",
            maxWidth: "520px",
            width: "100%",
            padding: "2.2rem",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
            borderTop: "6px solid #50b8c4",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            boxSizing: "border-box"
          }}>
            {/* Steps Progress Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {[1, 2, 3].map(stepNum => (
                  <span
                    key={stepNum}
                    style={{
                      height: "8px",
                      width: tutorialStep === stepNum ? "32px" : "12px",
                      backgroundColor: tutorialStep >= stepNum ? "#50b8c4" : "#e2e8f0",
                      borderRadius: "4px",
                      transition: "all 0.3s ease"
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#50b8c4", backgroundColor: "#e6f7f8", padding: "0.25rem 0.75rem", borderRadius: "12px" }}>
                Paso {tutorialStep} de 3
              </span>
            </div>

            {/* STEP 1 CONTENT */}
            {tutorialStep === 1 && (
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ fontSize: "3.5rem", margin: "0 auto" }}>🚀</div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
                  ¡Bienvenido a <span style={{ color: "#50b8c4" }}>Zynatra</span>, {currentUser?.nombre}!
                </h2>
                <p style={{ fontSize: "0.95rem", color: "#4a5568", lineHeight: "1.6", margin: 0 }}>
                  Tu registro ha sido exitoso. Has ingresado a la plataforma inteligente diseñada para medir tus aptitudes intelectuales, descubrir tu vocación y conectarte con tu futuro.
                </p>
              </div>
            )}

            {/* STEP 2 CONTENT */}
            {tutorialStep === 2 && (
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ fontSize: "3.5rem", margin: "0 auto" }}>🧠</div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
                  Test IQ (Raven) & Asistente IA
                </h2>
                <p style={{ fontSize: "0.95rem", color: "#4a5568", lineHeight: "1.6", margin: 0 }}>
                  Prueba tu razonamiento abstracto con el método psicométrico de <strong>Raven</strong>. Nuestro Asistente IA supervisará tu ritmo y te ofrecerá consejos de temperamento en tiempo real.
                </p>
              </div>
            )}

            {/* STEP 3 CONTENT */}
            {tutorialStep === 3 && (
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ fontSize: "3.5rem", margin: "0 auto" }}>💬</div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
                  Comunidad Zynatra & Red de Mentores
                </h2>
                <p style={{ fontSize: "0.95rem", color: "#4a5568", lineHeight: "1.6", margin: 0 }}>
                  Participa en canales interactivos estilo <strong>Discord</strong> (#software-y-tech, #orientacion), interactúa con mentores verificados y comparte tus certificados en LinkedIn.
                </p>
              </div>
            )}

            {/* Footer Actions */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #edf2f7",
              gap: "1rem"
            }}>
              <button
                onClick={handleCloseTutorial}
                className="btn btn-glass"
                style={{ fontSize: "0.85rem", color: "#718096" }}
              >
                Omitir tutorial
              </button>

              <button
                onClick={handleNextTutorialStep}
                className="btn btn-primary"
                style={{
                  backgroundColor: "#50b8c4",
                  borderColor: "#50b8c4",
                  padding: "0.65rem 1.6rem",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  borderRadius: "14px"
                }}
              >
                {tutorialStep === 3 ? "Fin / Comenzar 🎉" : "Continuar ➡️"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Inject custom styles for responsive layout mapping */}
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
