import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { GAMES, shuffleArray } from "../data/games";
import { Gamepad2, Timer, Trophy, ChevronLeft, CheckCircle, ArrowRight, Award, Star, RefreshCw } from "lucide-react";

import { getRandom12Questions, getRandom12TrueFalseStatements } from "../data/gamesQuestions";

function MultiStepQuizGame({ game, onFinishGame }) {
  const [questions, setQuestions] = useState(() => getRandom12Questions(game.id));
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    setQuestions(getRandom12Questions(game.id));
    setCurrentStep(0);
    setSelectedAnswers({});
  }, [game.id]);

  const handleSelect = (qIdx, optIdx) => setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx });
  const handleNext = () => currentStep < questions.length - 1 && setCurrentStep(currentStep + 1);
  const handlePrev = () => currentStep > 0 && setCurrentStep(currentStep - 1);
  const handleCalculateFinal = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      const selectedOptIdx = selectedAnswers[idx];
      if (selectedOptIdx !== undefined && q.opciones[selectedOptIdx]?.correcta) score++;
    });
    onFinishGame(score, questions.length);
  };

  const q = questions[currentStep];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
        <span className="badge badge-primary" style={{ padding: "0.3rem 0.8rem", backgroundColor: "#e6f7f8", color: "#50b8c4", fontWeight: 800 }}>
          Pregunta {currentStep + 1} de {questions.length} (Modo 12 Retos)
        </span>
        <span style={{ fontWeight: 700, color: "#2d3436" }}>
          {Math.round(((currentStep + 1) / questions.length) * 100)}% Completado
        </span>
      </div>
      <div style={{ height: "6px", width: "100%", background: "#e2e8f0", borderRadius: "3px" }}>
        <div style={{ height: "100%", width: `${((currentStep + 1) / questions.length) * 100}%`, background: "#50b8c4", borderRadius: "3px", transition: "width 0.3s ease" }} />
      </div>
      <div className="glass-card" style={{ padding: "1.5rem", background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.25rem", lineHeight: "1.5" }}>{q.pregunta}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {q.opciones.map((op, i) => {
            const isSelected = selectedAnswers[currentStep] === i;
            return (
              <button key={i} onClick={() => handleSelect(currentStep, i)} style={{ padding: "1rem 1.25rem", borderRadius: "16px", border: isSelected ? "2px solid #50b8c4" : "1px solid #e2e8f0", backgroundColor: isSelected ? "#e6f7f8" : "#ffffff", color: isSelected ? "#000000" : "#2d3436", fontWeight: isSelected ? 800 : 600, fontSize: "0.95rem", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s ease" }}>
                <span>{op.texto}</span>
                {isSelected && <CheckCircle size={18} style={{ color: "#50b8c4", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
        <button onClick={handlePrev} disabled={currentStep === 0} className="btn btn-glass" style={{ opacity: currentStep === 0 ? 0.4 : 1 }}>⬅️ Anterior</button>
        {currentStep < questions.length - 1 ? (
          <button onClick={handleNext} className="btn btn-primary" style={{ backgroundColor: "#50b8c4", borderColor: "#50b8c4", fontWeight: 700 }}><span>Siguiente</span> ➡️</button>
        ) : (
          <button onClick={handleCalculateFinal} className="btn btn-accent" style={{ backgroundColor: "#10b981", borderColor: "#10b981", color: "#ffffff", fontWeight: 800, padding: "0.65rem 1.5rem" }}><span>Finalizar y Ver Resultados</span> 🎉</button>
        )}
      </div>
    </div>
  );
}

function MemoryGame({ game, onWin }) {
  const buildCards = useCallback(() => shuffleArray(game.pares.map((p, i) => ({ uid: `${p.id}-${i}`, pairId: p.id, label: p.label, emoji: p.emoji }))), [game.pares]);
  const [cards] = useState(buildCards);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [lock, setLock] = useState(false);

  useEffect(() => {
    if (flipped.length !== 2) return;
    setLock(true);
    const [a, b] = flipped;
    const cardA = cards.find(c => c.uid === a);
    const cardB = cards.find(c => c.uid === b);
    if (cardA?.pairId === cardB?.pairId) {
      const newMatched = [...matched, a, b];
      setMatched(newMatched);
      setFlipped([]);
      setLock(false);
      if (newMatched.length === cards.length) onWin(cards.length / 2, cards.length / 2);
    } else setTimeout(() => { setFlipped([]); setLock(false); }, 700);
  }, [flipped]);

  const flip = (uid) => { if (!lock && !matched.includes(uid) && !flipped.includes(uid)) setFlipped([...flipped, uid]); };

  return (
    <div>
      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem", fontWeight: 600 }}>Toca las tarjetas y encuentra los pares ({matched.length / 2}/{cards.length / 2})</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
        {cards.map(card => {
          const isOpen = flipped.includes(card.uid) || matched.includes(card.uid);
          return (
            <button key={card.uid} onClick={() => flip(card.uid)} style={{ aspectRatio: "1", borderRadius: "18px", border: isOpen ? "2px solid #50b8c4" : "1px solid #cbd5e1", background: isOpen ? "#e6f7f8" : "#ffffff", cursor: "pointer", fontSize: isOpen ? "0.8rem" : "1.5rem", fontWeight: 700, color: "#1e293b", transition: "transform 0.2s ease", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0.5rem" }}>
              {isOpen ? `${card.emoji}\n${card.label}` : "❓"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RapidGame({ game, onFinishGame }) {
  const [statements] = useState(() => getRandom12TrueFalseStatements());
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  const current = statements[round] || statements[0];
  const answer = (val) => {
    const ok = val === current.correcta;
    const newScore = ok ? score + 1 : score;
    if (round + 1 >= statements.length) {
      onFinishGame(newScore, statements.length);
    } else {
      setRound(r => r + 1);
      setScore(newScore);
    }
  };

  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#64748b", fontWeight: 700 }}>
        <span>Afirmación {round + 1} de {statements.length}</span>
        <span>Aciertos: {score}</span>
      </div>
      <div className="glass-card" style={{ padding: "2rem", backgroundColor: "#ffffff", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1a1a1a", lineHeight: "1.5" }}>{current.texto}</h3>
      </div>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button onClick={() => answer(true)} className="btn btn-accent" style={{ minWidth: "140px", backgroundColor: "#10b981", color: "#ffffff", padding: "0.85rem", fontWeight: 800, borderRadius: "16px", cursor: "pointer" }}>✓ Verdadero</button>
        <button onClick={() => answer(false)} className="btn btn-glass" style={{ minWidth: "140px", backgroundColor: "#ef4444", color: "#ffffff", padding: "0.85rem", fontWeight: 800, borderRadius: "16px", cursor: "pointer" }}>✗ Falso</button>
      </div>
    </div>
  );
}

function MatchGame({ game, onFinishGame }) {
  const [selected, setSelected] = useState(null);
  const [matched, setMatched] = useState([]);
  const [izq] = useState(() => shuffleArray(game.pares.map((p, i) => ({ ...p, id: `l${i}` }))));
  const [der] = useState(() => shuffleArray(game.pares.map((p, i) => ({ text: p.der, id: `r${i}`, izq: p.izq }))));
  const pickLeft = (item) => !matched.includes(item.izq) && setSelected(item);
  const pickRight = (item) => {
    if (selected && item.izq === selected.izq) {
      const newM = [...matched, selected.izq];
      setMatched(newM);
      setSelected(null);
      if (newM.length === game.pares.length) onFinishGame(game.pares.length, game.pares.length);
    } else setSelected(null);
  };
  return (
    <div>
      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem", fontWeight: 600 }}>Conecta cada institución ({matched.length}/{game.pares.length})</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {izq.map(item => <button key={item.id} onClick={() => pickLeft(item)} style={{ padding: "0.75rem", fontSize: "0.85rem", opacity: matched.includes(item.izq) ? 0.4 : 1, borderColor: selected?.izq === item.izq ? "#50b8c4" : "#cbd5e1", backgroundColor: selected?.izq === item.izq ? "#e6f7f8" : "#ffffff", borderRadius: "12px", cursor: "pointer" }} disabled={matched.includes(item.izq)}>{item.izq}</button>)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {der.map(item => <button key={item.id} onClick={() => pickRight(item)} style={{ padding: "0.75rem", fontSize: "0.85rem", opacity: matched.includes(item.izq) ? 0.4 : 1, backgroundColor: "#ffffff", borderRadius: "12px", cursor: "pointer" }} disabled={matched.includes(item.izq)}>{item.text}</button>)}
        </div>
      </div>
    </div>
  );
}

function ScrambleGame({ game, onFinishGame }) {
  const [letters, setLetters] = useState(() => shuffleArray(game.palabra.split("")));
  const [built, setBuilt] = useState("");
  const pick = (ch, idx) => { setBuilt(built + ch); setLetters(letters.filter((_, i) => i !== idx)); };
  const reset = () => { setLetters(shuffleArray(game.palabra.split(""))); setBuilt(""); };
  const check = () => onFinishGame(built.toUpperCase() === game.palabra ? 1 : 0, 1);
  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", fontWeight: 600 }}>{game.pista}</p>
      <div style={{ minHeight: "54px", padding: "0.75rem", background: "#ffffff", borderRadius: "16px", border: "2px dashed #50b8c4", fontSize: "1.8rem", fontWeight: 900, color: "#50b8c4" }}>{built || "—"}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
        {letters.map((ch, i) => <button key={i} onClick={() => pick(ch, i)} style={{ width: "48px", height: "48px", fontWeight: 800, fontSize: "1.2rem", backgroundColor: "#ffffff", borderRadius: "12px", cursor: "pointer" }}>{ch}</button>)}
      </div>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}><button onClick={reset} className="btn btn-glass">Reiniciar</button><button onClick={check} className="btn btn-primary" disabled={built.length !== game.palabra.length}>Comprobar</button></div>
    </div>
  );
}

export default function GameCenter({ studentInfo, finishGame, compact = false }) {
  const [activeGameId, setActiveGameId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [resultSummary, setResultSummary] = useState(null);
  const [showMoreGames, setShowMoreGames] = useState(false);
  const completed = studentInfo?.gamesCompleted || [];
  
  useEffect(() => {
    if (!activeGameId) return;
    setTimer(0);
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [activeGameId]);

  const handleFinishGame = async (score, total) => {
    const game = GAMES.find(g => g.id === activeGameId);
    const isNew = await finishGame(game.id);
    const accuracy = Math.round((score / total) * 100);
    setResultSummary({ game, score, total, accuracy, stars: accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1, timer, isNew });
  };

  const closeGame = () => { setActiveGameId(null); setResultSummary(null); };
  const currentGame = activeGameId ? GAMES.find(g => g.id === activeGameId) : null;

  // Render 12 initial games or 32 all games based on showMoreGames toggle
  const visibleGames = compact
    ? GAMES.slice(0, 4)
    : showMoreGames
    ? GAMES
    : GAMES.slice(0, 12);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {!compact && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem", color: "#1a1a1a" }}>
              <Gamepad2 style={{ color: "#50b8c4" }} /> Arena de Juegos & Retos
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              {completed.length}/{GAMES.length} Juegos completados · Aprende, pon a prueba tu mente y gana XP
            </p>
          </div>
          <div className="glass-card" style={{ padding: "0.6rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#ffffff", borderRadius: "20px" }}>
            <Trophy size={20} style={{ color: "#f59e0b" }} />
            <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#2d3436" }}>{completed.length * 35}+ XP ganados</span>
          </div>
        </div>
      )}

      {/* GAME LIST SELECTION GRID */}
      {!activeGameId ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: compact ? "1fr" : "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
            gap: "1.25rem"
          }}>
            {visibleGames.map(g => {
              const done = completed.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => { setActiveGameId(g.id); setResultSummary(null); }}
                  style={{
                    padding: "clamp(1rem, 3vw, 1.5rem)",
                    borderRadius: "20px",
                    backgroundColor: "#ffffff",
                    border: done ? "2px solid #10b981" : "1px solid #cbd5e1",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.85rem",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                    transition: "transform 0.2s ease"
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "clamp(1.5rem, 5vw, 2.2rem)" }}>{g.emoji}</span>
                    {done ? (
                      <span className="badge badge-accent" style={{ backgroundColor: "#e6f4ea", color: "#10b981", fontWeight: 700, padding: "0.3rem 0.75rem", borderRadius: "12px", fontSize: "0.75rem" }}>
                        ✓ Completado
                      </span>
                    ) : (
                      <span className="badge badge-glass" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                        +{g.xp} XP
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", fontWeight: 800, color: "#1a1a1a" }}>{g.titulo}</h4>
                    <span style={{ fontSize: "0.75rem", color: "#50b8c4", fontWeight: 700, textTransform: "uppercase" }}>
                      {g.disciplina} · {g.dificultad}
                    </span>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.3rem", lineHeight: "1.4" }}>{g.descripcion}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* LOAD 20 MORE GAMES BUTTON - Exactly where red arrow points */}
          {!compact && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <button
                onClick={() => setShowMoreGames(!showMoreGames)}
                style={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #50b8c4",
                  color: "#1e293b",
                  borderRadius: "20px",
                  padding: "0.85rem 1.75rem",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  boxShadow: "0 6px 20px rgba(80, 184, 196, 0.15)",
                  transition: "all 0.2s ease"
                }}
              >
                <span>{showMoreGames ? "Mostrar Menos ▲" : "🚀 Desplegar 20 Juegos Más (+20 Retos Vocacionales) ➕"}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card animate-fade-in" style={{ padding: "2rem", backgroundColor: "#ffffff", borderRadius: "28px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", borderTop: "6px solid #50b8c4" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <button onClick={closeGame} className="btn btn-glass" style={{ gap: "0.4rem", fontSize: "0.85rem" }}>
              <ChevronLeft size={16} /> Salir al Menú de Juegos
            </button>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#50b8c4" }}>⏱️ {timer}s</span>
          </div>

          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "2.5rem" }}>{currentGame.emoji}</span>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a" }}>{currentGame.titulo}</h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>{currentGame.descripcion}</p>
          </div>

          {currentGame.tipo === "quiz" && <MultiStepQuizGame key={activeGameId + "_" + (resultSummary ? "done" : "play")} game={currentGame} onFinishGame={handleFinishGame} />}
          {currentGame.tipo === "memory" && <MemoryGame game={currentGame} onWin={handleFinishGame} />}
          {currentGame.tipo === "rapid" && <RapidGame key={activeGameId + "_" + (resultSummary ? "done" : "play")} game={currentGame} onFinishGame={handleFinishGame} />}
          {currentGame.tipo === "match" && <MatchGame game={currentGame} onFinishGame={handleFinishGame} />}
          {currentGame.tipo === "scramble" && <ScrambleGame game={currentGame} onFinishGame={handleFinishGame} />}
        </div>
      )}

      {/* RESULT MODAL - Rendered via Portal directly into document.body for dead-center alignment */}
      {resultSummary && ReactDOM.createPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          zIndex: 9999999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          boxSizing: "border-box"
        }}>
          <div className="animate-fade-in" style={{
            backgroundColor: "#ffffff",
            borderRadius: "28px",
            maxWidth: "460px",
            width: "100%",
            padding: "2rem 1.5rem",
            boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
            borderTop: "6px solid #10b981",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            maxHeight: "90vh",
            overflowY: "auto",
            margin: "auto"
          }}>
            <div>
              <div style={{ fontSize: "3.5rem" }}>🎉</div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1a1a1a" }}>¡Juego Completado!</h2>
              <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Resultados en {resultSummary.game.titulo}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
              {[1, 2, 3].map(starNum => (
                <Star
                  key={starNum}
                  size={36}
                  style={{
                    fill: starNum <= resultSummary.stars ? "#f59e0b" : "#e2e8f0",
                    color: starNum <= resultSummary.stars ? "#f59e0b" : "#cbd5e1"
                  }}
                />
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
              <div style={{ padding: "0.85rem", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700 }}>PRECISIÓN</p>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#10b981" }}>{resultSummary.accuracy}%</h3>
              </div>
              <div style={{ padding: "0.85rem", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700 }}>TIEMPO TOTAL</p>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#50b8c4" }}>{resultSummary.timer}s</h3>
              </div>
            </div>

            <div style={{ backgroundColor: "#e6f7f8", border: "1.5px solid #50b8c4", borderRadius: "16px", padding: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <Award size={22} style={{ color: "#50b8c4" }} />
              <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#2d3436" }}>
                {resultSummary.isNew ? `+${resultSummary.game.xp} XP Otorgados` : "Completado con Éxito"}
              </span>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "0.5rem" }}>
              <button
                onClick={() => { setResultSummary(null); setActiveGameId(activeGameId); }}
                className="btn btn-glass"
                style={{ fontSize: "0.9rem", padding: "0.6rem 1.25rem" }}
              >
                <RefreshCw size={16} /> Reintentar
              </button>

              <button
                onClick={closeGame}
                className="btn btn-primary"
                style={{ backgroundColor: "#50b8c4", borderColor: "#50b8c4", fontWeight: 800, fontSize: "0.9rem", padding: "0.6rem 1.4rem" }}
              >
                Ver Más Juegos 🎮
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* UNIQUE PERFORMANCE AND MASTERY STATISTICS DASHBOARD (NO REPETITION) */}
      <div className="glass-card" style={{
        marginTop: "2.5rem",
        padding: "2rem",
        backgroundColor: "#ffffff",
        borderRadius: "28px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
        border: "1px solid #e2e8f0"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              📊 Tu Panel de Desempeño y Maestría Vocacional
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              Estadísticas globales de tus habilidades demostradas en los retos de Zynatra.
            </p>
          </div>

          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#50b8c4", backgroundColor: "#e6f7f8", padding: "0.5rem 1rem", borderRadius: "16px" }}>
            Maestría Global: {Math.round((completed.length / GAMES.length) * 100)}%
          </span>
        </div>

        {/* Global Performance Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.25rem", backgroundColor: "#f8fafc", borderRadius: "20px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <span style={{ fontSize: "2rem" }}>🏆</span>
            <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, marginTop: "0.5rem" }}>RETO SUPERADOS</p>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#10b981", marginTop: "0.2rem" }}>
              {completed.length} / {GAMES.length}
            </h3>
          </div>

          <div style={{ padding: "1.25rem", backgroundColor: "#f8fafc", borderRadius: "20px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <span style={{ fontSize: "2rem" }}>⭐</span>
            <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, marginTop: "0.5rem" }}>ESTRELLAS GANADAS</p>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#f59e0b", marginTop: "0.2rem" }}>
              {completed.length * 3} ⭐
            </h3>
          </div>

          <div style={{ padding: "1.25rem", backgroundColor: "#f8fafc", borderRadius: "20px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <span style={{ fontSize: "2rem" }}>⚡</span>
            <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, marginTop: "0.5rem" }}>XP EN JUEGOS</p>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#50b8c4", marginTop: "0.2rem" }}>
              +{completed.length * 35} XP
            </h3>
          </div>

          <div style={{ padding: "1.25rem", backgroundColor: "#f8fafc", borderRadius: "20px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <span style={{ fontSize: "2rem" }}>🎯</span>
            <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, marginTop: "0.5rem" }}>PRECISIÓN PROMEDIO</p>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#8b5cf6", marginTop: "0.2rem" }}>
              {completed.length > 0 ? "95%" : "0%"}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
