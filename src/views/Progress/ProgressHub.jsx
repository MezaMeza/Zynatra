import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import {
  Target, Trophy, Flame, Medal, Plus, CheckCircle2, Zap, Crown
} from "lucide-react";
import { getTodaysChallenges } from "../../data/achievements";

const PLAZOS = [
  { id: "corto", label: "Corto plazo", color: "var(--accent)" },
  { id: "mediano", label: "Mediano plazo", color: "var(--secondary)" },
  { id: "largo", label: "Largo plazo", color: "var(--primary)" }
];

export default function ProgressHub({ setActiveTab }) {
  const { currentUser } = useAuth();
  const {
    studentInfo, achievements, leaderboard,
    createGoal, completeGoal, finishDailyChallenge
  } = useData();
  const [newGoal, setNewGoal] = useState("");
  const [newPlazo, setNewPlazo] = useState("corto");
  const [showForm, setShowForm] = useState(false);
  const [achPage, setAchPage] = useState(1);

  if (!studentInfo) return <div>Cargando progreso...</div>;

  const goals = studentInfo.goals || [];
  const unlocked = studentInfo.achievements || [];
  const streak = studentInfo.streak?.count || 0;
  const todayChallenges = getTodaysChallenges();
  const completedToday = studentInfo.dailyChallenges?.completed || [];

  const ACH_PAGE_SIZE = 8;
  const achTotalPages = Math.max(1, Math.ceil(achievements.length / ACH_PAGE_SIZE));
  const achPageItems = achievements.slice((achPage - 1) * ACH_PAGE_SIZE, achPage * ACH_PAGE_SIZE);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    await createGoal(newGoal.trim(), newPlazo);
    await finishDailyChallenge("dc_goal", 35);
    setNewGoal("");
    setShowForm(false);
  };

  const handleCompleteChallenge = async (ch) => {
    await finishDailyChallenge(ch.id, ch.xp);
    if (ch.tab && setActiveTab) setActiveTab(ch.tab);
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div className="page-header">
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
          Mi <span className="text-gradient-primary">Progreso</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          Metas de futuro, retos diarios, logros y ranking de tu colegio.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Flame size={28} style={{ color: "#f59e0b" }} />
          <div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>RACHA</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>{streak} días</p>
          </div>
        </div>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Trophy size={28} style={{ color: "var(--warning)" }} />
          <div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>LOGROS</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>{unlocked.length}/{achievements.length}</p>
          </div>
        </div>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Target size={28} style={{ color: "var(--accent)" }} />
          <div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>METAS</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>{goals.filter(g => g.completado).length}/{goals.length}</p>
          </div>
        </div>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Zap size={28} style={{ color: "var(--primary)" }} />
          <div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>XP TOTAL</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>{studentInfo.xp}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem" }} className="progress-grid">
        {/* Goals */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Target size={20} style={{ color: "var(--primary)" }} />
              <h3 style={{ fontWeight: 800, fontSize: "1.15rem" }}>Mi Plan de Futuro</h3>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem", gap: "0.3rem" }}>
              <Plus size={14} /> Nueva meta
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddGoal} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input
                className="input-field"
                placeholder="Ej. Ingresar a la UNI en Ingeniería de Sistemas"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                required
              />
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {PLAZOS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setNewPlazo(p.id)}
                    className={`btn ${newPlazo === p.id ? "btn-glass" : "btn-glass"}`}
                    style={{
                      fontSize: "0.75rem",
                      borderColor: newPlazo === p.id ? p.color : undefined,
                      color: newPlazo === p.id ? p.color : undefined
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button type="submit" className="btn btn-accent" style={{ alignSelf: "flex-end", fontSize: "0.85rem" }}>
                Guardar meta (+40 XP al completar)
              </button>
            </form>
          )}

          {goals.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center", padding: "1.5rem" }}>
              Define tus metas académicas y profesionales. ¡Cada meta te acerca a tu vocación!
            </p>
          ) : (
            PLAZOS.map(plazo => {
              const plazoGoals = goals.filter(g => g.plazo === plazo.id);
              if (plazoGoals.length === 0) return null;
              return (
                <div key={plazo.id}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: plazo.color, marginBottom: "0.5rem", textTransform: "uppercase" }}>
                    {plazo.label}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {plazoGoals.map(goal => (
                      <button
                        key={goal.id}
                        onClick={() => !goal.completado && completeGoal(goal.id)}
                        className="glass-card"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          cursor: goal.completado ? "default" : "pointer",
                          opacity: goal.completado ? 0.7 : 1,
                          textAlign: "left",
                          width: "100%"
                        }}
                      >
                        <CheckCircle2 size={20} style={{ color: goal.completado ? "var(--accent)" : "var(--text-muted)", flexShrink: 0 }} />
                        <span style={{
                          textDecoration: goal.completado ? "line-through" : "none",
                          fontSize: "0.9rem",
                          color: goal.completado ? "var(--text-muted)" : "var(--text-primary)"
                        }}>
                          {goal.titulo}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right column: challenges + leaderboard */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Zap size={20} style={{ color: "var(--warning)" }} />
              <h3 style={{ fontWeight: 800, fontSize: "1.05rem" }}>Retos de Hoy</h3>
            </div>
            {todayChallenges.map(ch => {
              const done = completedToday.includes(ch.id);
              return (
                <div key={ch.id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ fontWeight: 700, fontSize: "0.85rem" }}>{ch.titulo}</p>
                    <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>+{ch.xp} XP</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{ch.descripcion}</p>
                  <button
                    onClick={() => !done && handleCompleteChallenge(ch)}
                    className={`btn ${done ? "btn-accent" : "btn-glass"}`}
                    style={{ fontSize: "0.75rem", alignSelf: "flex-start", padding: "0.35rem 0.75rem" }}
                    disabled={done}
                  >
                    {done ? "✓ Completado" : "Ir al reto"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Crown size={20} style={{ color: "var(--warning)" }} />
              <h3 style={{ fontWeight: 800, fontSize: "1.05rem" }}>Ranking del Colegio</h3>
            </div>
            {leaderboard.map((entry, i) => (
              <div key={entry.uid} className="glass-card" style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                border: entry.uid === currentUser.uid ? "1px solid rgba(139, 92, 246, 0.4)" : undefined
              }}>
                <span style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: i === 0 ? "linear-gradient(135deg, #fbbf24, #d97706)" : "#eef2f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.8rem"
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                    {entry.nombre} {entry.uid === currentUser.uid && "(Tú)"}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Nivel {entry.nivel}</p>
                </div>
                <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>
                  <Medal size={12} /> {entry.xp} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements grid */}
      <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Trophy size={20} style={{ color: "var(--warning)" }} />
          <h3 style={{ fontWeight: 800, fontSize: "1.15rem" }}>Logros y Certificados</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          {achPageItems.map(ach => {
            const isUnlocked = unlocked.includes(ach.id);
            return (
              <div key={ach.id} className="glass-card" style={{
                textAlign: "center",
                opacity: isUnlocked ? 1 : 0.45,
                filter: isUnlocked ? "none" : "grayscale(0.8)"
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{ach.icono}</div>
                <h4 style={{ fontWeight: 700, fontSize: "0.9rem" }}>{ach.titulo}</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{ach.descripcion}</p>
                <span className={`badge ${isUnlocked ? "badge-accent" : "badge-glass"}`} style={{ marginTop: "0.5rem", fontSize: "0.65rem" }}>
                  {isUnlocked ? "Desbloqueado" : `+${ach.xp} XP`}
                </span>
              </div>
            );
          })}
        </div>
        {achTotalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button onClick={() => setAchPage(p => Math.max(1, p - 1))} disabled={achPage === 1} className="btn btn-glass" style={{ opacity: achPage === 1 ? 0.45 : 1, cursor: achPage === 1 ? "not-allowed" : "pointer" }}>Anterior</button>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>Página {achPage} de {achTotalPages}</span>
            <button onClick={() => setAchPage(p => Math.min(achTotalPages, p + 1))} disabled={achPage === achTotalPages} className="btn btn-glass" style={{ opacity: achPage === achTotalPages ? 0.45 : 1, cursor: achPage === achTotalPages ? "not-allowed" : "pointer" }}>Siguiente</button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .progress-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
