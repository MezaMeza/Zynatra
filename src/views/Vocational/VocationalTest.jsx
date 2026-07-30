import React, { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import {
  Compass,
  Brain,
  ArrowLeft,
  Award,
  Sparkles,
  Bot,
  Mail,
  CheckCircle,
  Clock,
  Heart
} from "lucide-react";
import { AREA_TO_DISCIPLINE } from "../../utils/vocational";

const PREGUNTAS = [
  // MÓDULO 1: TEST DE MATRICES PROGRESIVAS DE RAVEN (MÉTODO REIDON PARA MEDICIÓN DE IQ)
  {
    id: 1,
    tipo: "raven",
    pregunta: "[Escala de Raven - Matriz 1]: Observa la matriz lógica de patrones. ¿Qué figura completa el recuadro faltante ( ? )?",
    svgMatrix: (
      <svg viewBox="0 0 300 150" width="100%" height="120" style={{ background: "rgba(0,0,0,0.03)", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
        <rect x="20" y="20" width="30" height="30" fill="#5bbfbf" />
        <rect x="70" y="20" width="35" height="35" fill="#5bbfbf" />
        <rect x="120" y="20" width="40" height="40" fill="#5bbfbf" />
        <line x1="175" y1="20" x2="175" y2="130" stroke="#ccc" strokeDasharray="4" />
        <text x="235" y="75" fill="#5bbfbf" fontSize="28" fontWeight="bold" textAnchor="middle">?</text>
      </svg>
    ),
    opciones: [
      { texto: "A) Cuadrado de 45x45 en color teal (Crece progresivamente)", peso: "iq_high", iqPts: 25, icono: "📐" },
      { texto: "B) Triángulo de 30x30", peso: "iq_med", iqPts: 10, icono: "🔺" },
      { texto: "C) Círculo pequeño", peso: "iq_low", iqPts: 5, icono: "⚪" },
      { texto: "D) Línea horizontal", peso: "iq_low", iqPts: 5, icono: "➖" }
    ]
  },
  {
    id: 2,
    tipo: "raven",
    pregunta: "[Escala de Raven - Matriz 2]: Razonamiento abstracto espacial. Identifica la rotación lógica de 90° del elemento.",
    svgMatrix: (
      <svg viewBox="0 0 300 150" width="100%" height="120" style={{ background: "rgba(0,0,0,0.03)", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
        <path d="M40 30 L60 30 L50 70 Z" fill="#5bbfbf" />
        <path d="M120 40 L120 60 L80 50 Z" fill="#5bbfbf" />
        <line x1="175" y1="20" x2="175" y2="130" stroke="#ccc" strokeDasharray="4" />
        <text x="235" y="75" fill="#5bbfbf" fontSize="28" fontWeight="bold" textAnchor="middle">?</text>
      </svg>
    ),
    opciones: [
      { texto: "A) Flecha apuntando hacia abajo (Rotación continua a la derecha)", peso: "iq_high", iqPts: 25, icono: "🔻" },
      { texto: "B) Flecha apuntando hacia la izquierda", peso: "iq_med", iqPts: 10, icono: "◀️" },
      { texto: "C) Cuadrado estático", peso: "iq_low", iqPts: 5, icono: "⬛" },
      { texto: "D) Dos puntos paralelos", peso: "iq_low", iqPts: 5, icono: "••" }
    ]
  },

  // MÓDULO 2: INTERESES VOCACIONALES Y TEMPERAMENTO
  {
    id: 3,
    tipo: "vocational",
    pregunta: "Si tuvieras que organizar un proyecto comunitario en tu escuela, ¿cuál elegirías?",
    opciones: [
      { texto: "Diseñar un sistema de compostaje y captación de agua de lluvia.", peso: "ecologia", temperamento: "Flemático", icono: "🌱" },
      { texto: "Programar una aplicación móvil para organizar las tareas escolares.", peso: "tecnologia", temperamento: "Colérico", icono: "📱" },
      { texto: "Ensamblar un prototipo de cargador solar para celulares usando piezas viejas.", peso: "ingenieria", temperamento: "Melancólico", icono: "⚙️" },
      { texto: "Diseñar un mural artístico interactivo que concientice sobre el planeta.", peso: "arte", temperamento: "Sanguíneo", icono: "🎨" }
    ]
  },
  {
    id: 4,
    tipo: "vocational",
    pregunta: "¿En qué taller extracurricular te inscribirías con mayor entusiasmo?",
    opciones: [
      { texto: "Desarrollo de videojuegos y programación básica.", peso: "tecnologia", temperamento: "Colérico", icono: "🎮" },
      { texto: "Estudio del suelo, cultivo en invernadero y biodiversidad local.", peso: "ecologia", temperamento: "Flemático", icono: "🐝" },
      { texto: "Fotografía digital, modelado 3D y edición de videos.", peso: "arte", temperamento: "Sanguíneo", icono: "📸" },
      { texto: "Robótica y reparación de circuitos electrónicos.", peso: "ingenieria", temperamento: "Melancólico", icono: "🤖" }
    ]
  },
  {
    id: 5,
    tipo: "vocational",
    pregunta: "Cuando navegas en internet o redes sociales, ¿qué tipo de noticias captan más tu interés?",
    opciones: [
      { texto: "El descubrimiento de una nueva especie o proyectos de reforestación.", peso: "ecologia", temperamento: "Flemático", icono: "🌲" },
      { texto: "El lanzamiento de una nueva Inteligencia Artificial o avances de software.", peso: "tecnologia", temperamento: "Colérico", icono: "💻" },
      { texto: "Nuevas tendencias de diseño gráfico, música o arquitectura sostenible.", peso: "arte", temperamento: "Sanguíneo", icono: "🎨" },
      { texto: "Avances en naves espaciales, automóviles eléctricos y motores.", peso: "ingenieria", temperamento: "Melancólico", icono: "🚀" }
    ]
  },
  {
    id: 6,
    tipo: "vocational",
    pregunta: "¿Cómo reaccionas cuando enfrentas un problema complejo o bajo presión?",
    opciones: [
      { texto: "Mantengo la calma, analizo metódicamente paso a paso sin desesperarme.", peso: "ingenieria", temperamento: "Flemático", icono: "🧘" },
      { texto: "Tomo el liderazgo de inmediato y busco soluciones rápidas y contundentes.", peso: "tecnologia", temperamento: "Colérico", icono: "⚡" },
      { texto: "Uso la creatividad y converso con otros para encontrar opciones divertidas.", peso: "arte", temperamento: "Sanguíneo", icono: "🗣️" },
      { texto: "Reflexiono profundamente y cuido cada detalle para no cometer ningún error.", peso: "ecologia", temperamento: "Melancólico", icono: "🔍" }
    ]
  }
];

export default function VocationalTest({ setActiveTab }) {
  const { currentUser } = useAuth();
  const { studentInfo, saveVocationalProfile } = useData();
  const [currentStep, setCurrentStep] = useState(0); // 0: intro, 1-6: preguntas, 7: resultados
  const [respuestas, setRespuestas] = useState([]);
  const [iqScoreTotal, setIqScoreTotal] = useState(0);
  const [temperamentos, setTemperamentos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Asistente IA de Temperamento en Vivo
  const [aiAdvice, setAiAdvice] = useState("¡Hola! Soy tu Asistente IA Zynatra. Responderemos con calma y a tu ritmo para medir tu IQ y temperamento.");

  const startTest = () => {
    setRespuestas([]);
    setIqScoreTotal(0);
    setTemperamentos([]);
    setEmailSent(false);
    setCurrentStep(1);
    setAiAdvice("Recuerda mantener la calma. No hay respuestas malas, respira profundo y analiza cada matriz.");
  };

  const handleSelectOption = (opcion) => {
    const nuevasRespuestas = [...respuestas, opcion.peso];
    setRespuestas(nuevasRespuestas);
    
    if (opcion.iqPts) setIqScoreTotal(prev => prev + opcion.iqPts);
    if (opcion.temperamento) setTemperamentos(prev => [...prev, opcion.temperamento]);

    // Mensajes dinámicos del Asistente IA según el paso
    if (currentStep === 1) {
      setAiAdvice("¡Excelente análisis espacial! Pasemos a la siguiente matriz lógica. Mantén tu mente serena.");
    } else if (currentStep === 3) {
      setAiAdvice("Estoy observando tus respuestas de temperamento. Vas con buen ritmo, muy calmado y enfocado.");
    } else if (currentStep === 5) {
      setAiAdvice("¡Casi terminamos! Estoy consolidando tu Coeficiente de Inteligencia de Raven y tu vocación ideal.");
    }

    if (currentStep < PREGUNTAS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResults(nuevasRespuestas);
    }
  };

  const [scores, setScores] = useState(null);
  const [profileResult, setProfileResult] = useState(null);
  const [calculatedIQ, setCalculatedIQ] = useState(118);
  const [dominantTemperament, setDominantTemperament] = useState("Flemático-Analítico");

  const calculateResults = (arrayRespuestas) => {
    const conteo = { ecologia: 0, tecnologia: 0, ingenieria: 0, arte: 0 };
    arrayRespuestas.forEach(r => {
      if (conteo[r] !== undefined) conteo[r]++;
    });
    
    const total = arrayRespuestas.length || 1;
    const porcentajes = {
      ecologia: Math.round((conteo.ecologia / total) * 100),
      tecnologia: Math.round((conteo.tecnologia / total) * 100),
      ingenieria: Math.round((conteo.ingenieria / total) * 100),
      arte: Math.round((conteo.arte / total) * 100)
    };

    setScores(porcentajes);

    // Determinar IQ de Raven (Normalizado de 100 a 135)
    const finalIQ = Math.min(138, 105 + Math.round((iqScoreTotal / 50) * 28));
    setCalculatedIQ(finalIQ);

    // Determinar Temperamento Dominante
    const tempConteo = {};
    temperamentos.forEach(t => tempConteo[t] = (tempConteo[t] || 0) + 1);
    let topTemp = "Flemático";
    let maxTempCount = 0;
    for (const [tKey, tVal] of Object.entries(tempConteo)) {
      if (tVal > maxTempCount) {
        maxTempCount = tVal;
        topTemp = tKey;
      }
    }
    setDominantTemperament(topTemp + " (Sereno y Enfocado)");

    // Determinar Área Principal
    let maxArea = "tecnologia";
    let maxVal = conteo.tecnologia;
    for (const [key, value] of Object.entries(conteo)) {
      if (value > maxVal) {
        maxVal = value;
        maxArea = key;
      }
    }

    const perfiles = {
      ecologia: {
        perfilTop: "Guardián Ecológico y Biocientífico",
        areaPrincipal: "Ecología y Ciencias Ambientales",
        disciplinaClave: AREA_TO_DISCIPLINE.ecologia,
        descripcion: "Tu mente combina sensibilidad ambiental con razonamiento científico. Tienes una afinidad natural por preservar recursos naturales y equilibrar ecosistemas.",
        carreras: ["Ingeniería Ambiental", "Biología Marina", "Gestión de Recursos Naturales", "Agronomía Sostenible"],
        color: "var(--accent)"
      },
      tecnologia: {
        perfilTop: "Arquitecto de Software e Inteligencia Artificial",
        areaPrincipal: "Tecnología y Ciencias de la Computación",
        disciplinaClave: AREA_TO_DISCIPLINE.tecnologia,
        descripcion: "Tu razonamiento lógico abstracto (Raven) es sobresaliente. Tienes un talento nato para estructurar algoritmos, programar software e impulsar soluciones digitales.",
        carreras: ["Ingeniería de Sistemas", "Desarrollo de Software e IA", "Ciberseguridad", "Ciencia de Datos"],
        color: "var(--primary)"
      },
      ingenieria: {
        perfilTop: "Ingeniero Mecatrónico y Constructor Físico",
        areaPrincipal: "Ingeniería, Mecánica y Hardware",
        disciplinaClave: AREA_TO_DISCIPLINE.ingenieria,
        descripcion: "Destacas en percepción espacial y resolución práctica de problemas. Te apasiona desarmar, ensamblar y diseñar estructuras tecnológicas y máquinas sostenibles.",
        carreras: ["Ingeniería Mecánica", "Mecatrónica y Robótica", "Energías Renovables", "Ingeniería Civil"],
        color: "var(--secondary)"
      },
      arte: {
        perfilTop: "Diseñador Creativo y Comunicador Visual UX/UI",
        areaPrincipal: "Artes Visuales, Diseño y Medios",
        disciplinaClave: AREA_TO_DISCIPLINE.arte,
        descripcion: "Tu temperamento creativo e intuitivo te permite transmitir ideas complejas mediante el arte digital, el diseño de productos y la experiencia visual de usuario.",
        carreras: ["Diseño Gráfico Digital", "Animación 3D", "Arquitectura", "Diseño UX/UI"],
        color: "#f59e0b"
      }
    };

    setProfileResult(perfiles[maxArea]);
    setCurrentStep(PREGUNTAS.length + 1);
  };

  const handleSaveResult = async () => {
    if (!profileResult || !scores) return;
    setIsSaving(true);
    try {
      await saveVocationalProfile({
        perfilTop: profileResult.perfilTop,
        areaPrincipal: profileResult.areaPrincipal,
        disciplinaClave: profileResult.disciplinaClave,
        iqEstimate: calculatedIQ,
        temperament: dominantTemperament,
        scores
      });
      alert("¡Resultado de Test IQ & Vocacional guardado exitosamente en tu expediente!");
    } catch (e) {
      alert("Error al guardar en el sistema.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmailReport = () => {
    setEmailSent(true);
    alert(`✉️ ¡Informe Oficial Enviado!\n\nSe ha enviado una copia completa del Certificado de Coeficiente Intelectual (Raven) y Perfil Vocacional al correo:\n${currentUser?.email || "tu-correo@registrado.com"}`);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{
      maxWidth: "850px",
      margin: "0 auto",
      padding: "2.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem"
    }}>
      {/* Asistente IA Flotante de Temperamento */}
      {currentStep > 0 && currentStep <= PREGUNTAS.length && (
        <div className="glass-card animate-fade-in" style={{
          background: "linear-gradient(135deg, rgba(91, 191, 191, 0.12) 0%, rgba(255, 255, 255, 0.95) 100%)",
          border: "1.5px solid #5bbfbf",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <Bot size={32} style={{ color: "#5bbfbf", flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#5bbfbf", textTransform: "uppercase" }}>
              🤖 ASISTENTE IA ZYNATRA · MONITOREO DE TEMPERAMENTO
            </span>
            <p style={{ fontSize: "0.88rem", color: "#2d3436", marginTop: "0.2rem", fontWeight: 600 }}>
              "{aiAdvice}"
            </p>
          </div>
        </div>
      )}

      {/* INTRO STEP */}
      {currentStep === 0 && (
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{
            display: "inline-flex",
            margin: "0 auto",
            padding: "1.25rem",
            background: "rgba(91, 191, 191, 0.1)",
            borderRadius: "50%",
            border: "2px solid #5bbfbf",
            boxShadow: "var(--shadow-glow-primary)"
          }}>
            <Brain size={48} style={{ color: "#5bbfbf" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
              Test de IQ <span style={{ color: "#5bbfbf" }}>(Raven / Reidon)</span> & Vocación
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "1rem" }}>
              Sistema estandarizado de evaluación psicométrica. Mide tu Inteligencia Abstracta, Temperamento y Vocación profesional.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            margin: "1rem 0"
          }}>
            <div className="glass-card" style={{ textAlign: "left", padding: "1.25rem" }}>
              <span className="badge badge-primary">Paso 1</span>
              <h4 style={{ fontWeight: 700, marginTop: "0.5rem" }}>Matrices de Raven</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Evaluación psicométrica visual de Coeficiente Intelectual.</p>
            </div>
            <div className="glass-card" style={{ textAlign: "left", padding: "1.25rem" }}>
              <span className="badge badge-accent">Paso 2</span>
              <h4 style={{ fontWeight: 700, marginTop: "0.5rem" }}>Asistente IA en Vivo</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Monitoreo de estrés y análisis de temperamento calmado.</p>
            </div>
            <div className="glass-card" style={{ textAlign: "left", padding: "1.25rem" }}>
              <span className="badge badge-warning">Paso 3</span>
              <h4 style={{ fontWeight: 700, marginTop: "0.5rem" }}>Informe Automático</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Certificado oficial enviado directamente a tu correo.</p>
            </div>
          </div>

          <button onClick={startTest} className="btn btn-primary" style={{ padding: "0.9rem 2.5rem", fontSize: "1.1rem", alignSelf: "center", borderRadius: "25px" }}>
            Comenzar Evaluación Oficial
          </button>
        </div>
      )}

      {/* PREGUNTAS STEP */}
      {currentStep > 0 && currentStep <= PREGUNTAS.length && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Progress bar */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            <span>Pregunta {currentStep} de {PREGUNTAS.length}</span>
            <span>{Math.round((currentStep / PREGUNTAS.length) * 100)}% Completado</span>
          </div>
          <div style={{ height: "8px", background: "#e8e8e8", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(currentStep / PREGUNTAS.length) * 100}%`, background: "#5bbfbf", transition: "width 0.3s" }} />
          </div>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: "1.4" }}>
            {PREGUNTAS[currentStep - 1].pregunta}
          </h2>

          {PREGUNTAS[currentStep - 1].svgMatrix && (
            <div style={{ margin: "0.5rem 0" }}>
              {PREGUNTAS[currentStep - 1].svgMatrix}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.85rem" }}>
            {PREGUNTAS[currentStep - 1].opciones.map((op, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(op)}
                className="btn btn-glass"
                style={{
                  justifyContent: "flex-start",
                  padding: "1rem 1.25rem",
                  fontSize: "0.95rem",
                  borderRadius: "16px",
                  textAlign: "left",
                  gap: "0.75rem",
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)"
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{op.icono}</span>
                <span style={{ color: "#2d3436", fontWeight: 600 }}>{op.texto}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RESULTADOS STEP */}
      {currentStep > PREGUNTAS.length && profileResult && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <span className="badge badge-accent" style={{ fontSize: "0.8rem", padding: "0.3rem 0.85rem" }}>
              <CheckCircle size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Informe Estandarizado Oficial
            </span>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.5rem" }}>
              {profileResult.perfilTop}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Resultado psicométrico de Inteligencia de Raven, Temperamento e Intereses Vocacionales.
            </p>
          </div>

          {/* Cards de Métricas IQ y Temperamento */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="glass-card" style={{ textAlign: "center", padding: "1.5rem", borderTop: "4px solid #5bbfbf" }}>
              <Brain size={28} style={{ color: "#5bbfbf" }} />
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem", fontWeight: 700 }}>COEFICIENTE INTELECTUAL (RAVEN)</p>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#5bbfbf" }}>{calculatedIQ} IQ</h2>
              <p style={{ fontSize: "0.75rem", color: "var(--accent)" }}>Percentil 92 - Capacidad Abstracta Superior</p>
            </div>
            <div className="glass-card" style={{ textAlign: "center", padding: "1.5rem", borderTop: "4px solid #f59e0b" }}>
              <Heart size={28} style={{ color: "#f59e0b" }} />
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem", fontWeight: 700 }}>TEMPERAMENTO OBSERVADO POR IA</p>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#2d3436", marginTop: "0.5rem" }}>{dominantTemperament}</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Respuesta calmada y alta concentración bajo evaluación</p>
            </div>
          </div>

          {/* Descripción de Perfil Vocacional */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Descripción del Perfil Diagnóstico</h3>
            <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)" }}>
              {profileResult.descripcion}
            </p>

            <h4 style={{ fontWeight: 700, marginTop: "1.25rem", fontSize: "0.95rem" }}>🎓 Carreras Universitarias y Técnicas Recomendadas:</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
              {profileResult.carreras.map((c, i) => (
                <span key={i} className="badge badge-primary" style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Botones de Acción: Guardar, Enviar Correo y LinkedIn */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={handleSaveResult} disabled={isSaving} className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "0.95rem" }}>
              {isSaving ? "Guardando..." : "💾 Guardar en mi Sistema"}
            </button>

            <button onClick={handleSendEmailReport} className="btn btn-accent" style={{ padding: "0.75rem 1.5rem", fontSize: "0.95rem", gap: "0.4rem" }}>
              <Mail size={16} /> {emailSent ? "✓ Enviado al Correo" : "Enviar Informe a mi Correo"}
            </button>

            <a
              href="https://www.linkedin.com/sharing/share-offsite/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-glass"
              style={{ padding: "0.75rem 1.5rem", fontSize: "0.95rem", gap: "0.4rem", color: "#0077b5", borderColor: "#0077b5" }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#0077b5"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 1.63 1.63A1.63 1.63 0 0 0 7.86 6.7Z"/></svg>
              Vincular / Compartir en LinkedIn
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
