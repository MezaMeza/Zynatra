export const GAMES = [
  // 12 JUEGOS INICIALES
  {
    id: "accounting_quiz",
    titulo: "Contabilidad & Finanzas",
    emoji: "📑",
    disciplina: "Contabilidad",
    tipo: "quiz",
    xp: 45,
    dificultad: "Medio",
    color: "#10b981",
    descripcion: "Ecuación patrimonial, balances, activo, pasivo y costos"
  },
  {
    id: "math_extreme",
    titulo: "Maestro de Matemáticas",
    emoji: "📐",
    disciplina: "Matemáticas",
    tipo: "quiz",
    xp: 50,
    dificultad: "Avanzado",
    color: "#ef4444",
    descripcion: "Álgebra, geometría analítica, cálculo e integrales"
  },
  {
    id: "science_lab",
    titulo: "Laboratorio de Ciencias",
    emoji: "🔬",
    disciplina: "Ciencias",
    tipo: "quiz",
    xp: 40,
    dificultad: "Medio",
    color: "#8b5cf6",
    descripcion: "Física, química, biología y leyes del universo"
  },
  {
    id: "code_loop",
    titulo: "Algoritmo Veloz",
    emoji: "💻",
    disciplina: "Tecnología",
    tipo: "quiz",
    xp: 40,
    dificultad: "Medio",
    color: "#50b8c4",
    descripcion: "Lógica de programación, bucles e Inteligencia Artificial"
  },
  {
    id: "ecology_quiz",
    titulo: "Reto Eco-Lógico",
    emoji: "🌱",
    disciplina: "Ecología",
    tipo: "quiz",
    xp: 35,
    dificultad: "Fácil",
    color: "#10b981",
    descripcion: "Biodiversidad, reciclaje y medio ambiente"
  },
  {
    id: "eng_renewable",
    titulo: "Energía del Futuro",
    emoji: "⚙️",
    disciplina: "Ingeniería",
    tipo: "quiz",
    xp: 35,
    dificultad: "Fácil",
    color: "#8b5cf6",
    descripcion: "Ingeniería civil, física y energías renovables"
  },
  {
    id: "art_color",
    titulo: "Paleta Creativa",
    emoji: "🎨",
    disciplina: "Arte",
    tipo: "quiz",
    xp: 35,
    dificultad: "Fácil",
    color: "#f59e0b",
    descripcion: "Diseño gráfico, UX/UI, teoría del color y 3D"
  },
  {
    id: "health_medical",
    titulo: "Desafío Médico & Salud",
    emoji: "🩺",
    disciplina: "Medicina",
    tipo: "quiz",
    xp: 45,
    dificultad: "Medio",
    color: "#ef4444",
    descripcion: "Anatomía, salud pública, biología y prevención"
  },
  {
    id: "finance_business",
    titulo: "Maestro de Finanzas",
    emoji: "📊",
    disciplina: "Negocios",
    tipo: "quiz",
    xp: 40,
    dificultad: "Medio",
    color: "#3b82f6",
    descripcion: "Emprendimiento, finanzas personales y economía"
  },
  {
    id: "cyber_defense",
    titulo: "Ciberdefensor IA",
    emoji: "🛡️",
    disciplina: "Tecnología",
    tipo: "quiz",
    xp: 45,
    dificultad: "Avanzado",
    color: "#06b6d4",
    descripcion: "Ciberseguridad, encriptación y redes seguras"
  },
  {
    id: "memory_vocational",
    titulo: "Memoria Vocacional",
    emoji: "🧠",
    disciplina: "Todos",
    tipo: "memory",
    xp: 50,
    dificultad: "Medio",
    color: "#50b8c4",
    descripcion: "Empareja carreras con sus áreas de talento",
    pares: [
      { id: "a1", emoji: "🌱", label: "Biología" },
      { id: "a2", emoji: "🌱", label: "Ecología" },
      { id: "b1", emoji: "💻", label: "Programación" },
      { id: "b2", emoji: "💻", label: "Software" },
      { id: "c1", emoji: "⚙️", label: "Robótica" },
      { id: "c2", emoji: "⚙️", label: "Ingeniería" },
      { id: "d1", emoji: "🎨", label: "Diseño UX" },
      { id: "d2", emoji: "🎨", label: "Arte digital" }
    ]
  },
  {
    id: "rapid_true",
    titulo: "Verdadero o Falso",
    emoji: "⚡",
    disciplina: "Todos",
    tipo: "rapid",
    xp: 40,
    dificultad: "Rápido",
    color: "#8b5cf6",
    descripcion: "Agilidad mental sobre mitos y carreras en Nicaragua",
    rondas: [
      { texto: "INATEC ofrece formación técnica gratuita en Nicaragua.", correcta: true },
      { texto: "El test vocacional de Zynatra te limita a una sola opción.", correcta: false },
      { texto: "La UNI es referente en carreras de ingeniería.", correcta: true },
      { texto: "La tecnología no requiere creatividad.", correcta: false },
      { texto: "Completar juegos didácticos otorga XP en tu perfil.", correcta: true }
    ]
  },

  // 20 JUEGOS ADICIONALES (DESPLEGABLES CON EL BOTÓN MÁS)
  {
    id: "robotics_quiz",
    titulo: "Robótica & Sensores",
    emoji: "🤖",
    disciplina: "Ingeniería",
    tipo: "quiz",
    xp: 50,
    dificultad: "Avanzado",
    color: "#3b82f6",
    descripcion: "Arduino, servos, microcontroladores y automatización"
  },
  {
    id: "chemistry_quiz",
    titulo: "Química & Moléculas",
    emoji: "🧪",
    disciplina: "Ciencias",
    tipo: "quiz",
    xp: 40,
    dificultad: "Medio",
    color: "#ec4899",
    descripcion: "Tabla periódica, enlaces químicos y laboratorio"
  },
  {
    id: "physics_space",
    titulo: "Física del Universo",
    emoji: "🌌",
    disciplina: "Física",
    tipo: "quiz",
    xp: 45,
    dificultad: "Medio",
    color: "#8b5cf6",
    descripcion: "Astrofísica, fuerza gravitatoria y energía cuántica"
  },
  {
    id: "architecture_quiz",
    titulo: "Arquitectura & Planos",
    emoji: "🏛️",
    disciplina: "Arquitectura",
    tipo: "quiz",
    xp: 40,
    dificultad: "Medio",
    color: "#f59e0b",
    descripcion: "Estructuras, escala de planos y diseño 3D"
  },
  {
    id: "law_justice",
    titulo: "Derecho & Justicia",
    emoji: "⚖️",
    disciplina: "Leyes",
    tipo: "quiz",
    xp: 40,
    dificultad: "Medio",
    color: "#64748b",
    descripcion: "Constitución, Derechos Humanos y jurisprudencia"
  },
  {
    id: "psychology_mind",
    titulo: "Psicología & Mente",
    emoji: "🧠",
    disciplina: "Psicología",
    tipo: "quiz",
    xp: 40,
    dificultad: "Medio",
    color: "#a855f7",
    descripcion: "Inteligencia emocional, conducta y neurociencia"
  },
  {
    id: "agronomy_quiz",
    titulo: "Desafío Agrónomo",
    emoji: "🌾",
    disciplina: "Agronomía",
    tipo: "quiz",
    xp: 40,
    dificultad: "Fácil",
    color: "#10b981",
    descripcion: "Cultivos, suelos fértiles y producción sostenible"
  },
  {
    id: "biotech_dna",
    titulo: "Biotecnología & ADN",
    emoji: "🧬",
    disciplina: "Biotecnología",
    tipo: "quiz",
    xp: 50,
    dificultad: "Avanzado",
    color: "#06b6d4",
    descripcion: "Genética, edición CRISPR y laboratorio celular"
  },
  {
    id: "trade_global",
    titulo: "Comercio Global",
    emoji: "🚢",
    disciplina: "Negocios",
    tipo: "quiz",
    xp: 40,
    dificultad: "Medio",
    color: "#3b82f6",
    descripcion: "Logística internacional, aduanas e importación"
  },
  {
    id: "fauna_nicaragua",
    titulo: "Fauna Silvestre",
    emoji: "🐆",
    disciplina: "Ecología",
    tipo: "quiz",
    xp: 35,
    dificultad: "Fácil",
    color: "#10b981",
    descripcion: "Especies protegidas y biósfera de Nicaragua"
  },
  {
    id: "vfx_animation",
    titulo: "Animación 3D & VFX",
    emoji: "🎬",
    disciplina: "Arte",
    tipo: "quiz",
    xp: 45,
    dificultad: "Medio",
    color: "#f59e0b",
    descripcion: "Efectos especiales, animación digital y cine"
  },
  {
    id: "math_geometry",
    titulo: "Geometría & Trigonometría",
    emoji: "📏",
    disciplina: "Matemáticas",
    tipo: "quiz",
    xp: 45,
    dificultad: "Medio",
    color: "#ef4444",
    descripcion: "Ángulos, teoremas, volúmenes y perímetros"
  },
  {
    id: "marketing_digital",
    titulo: "Marketing & Redes",
    emoji: "📱",
    disciplina: "Negocios",
    tipo: "quiz",
    xp: 35,
    dificultad: "Fácil",
    color: "#ec4899",
    descripcion: "Branding, redes sociales y estrategia de marca"
  },
  {
    id: "history_nicaragua",
    titulo: "Historia & Cultura",
    emoji: "📜",
    disciplina: "Historia",
    tipo: "quiz",
    xp: 35,
    dificultad: "Fácil",
    color: "#8b5cf6",
    descripcion: "Patrimonio histórico y cultura de Nicaragua"
  },
  {
    id: "climate_weather",
    titulo: "Meteorología & Clima",
    emoji: "🌩️",
    disciplina: "Ciencias",
    tipo: "quiz",
    xp: 40,
    dificultad: "Medio",
    color: "#06b6d4",
    descripcion: "Fenómenos atmosféricos y prevención de desastres"
  },
  {
    id: "nutrition_health",
    titulo: "Nutrición & Metabolismo",
    emoji: "🍎",
    disciplina: "Medicina",
    tipo: "quiz",
    xp: 35,
    dificultad: "Fácil",
    color: "#10b981",
    descripcion: "Alimentación balanceada, dietética y salud"
  },
  {
    id: "dental_science",
    titulo: "Ciencias Odontológicas",
    emoji: "🦷",
    disciplina: "Medicina",
    tipo: "quiz",
    xp: 40,
    dificultad: "Medio",
    color: "#3b82f6",
    descripcion: "Salud bucal, prevención y anatomía dental"
  },
  {
    id: "english_tech",
    titulo: "Inglés Técnico & Global",
    emoji: "🌐",
    disciplina: "Idiomas",
    tipo: "quiz",
    xp: 40,
    dificultad: "Medio",
    color: "#50b8c4",
    descripcion: "Vocabulario profesional e inglés de tecnología"
  },
  {
    id: "match_careers",
    titulo: "Conecta tu Talento",
    emoji: "🔗",
    disciplina: "Todos",
    tipo: "match",
    xp: 45,
    dificultad: "Medio",
    color: "#10b981",
    descripcion: "Une cada institución nicaragüense con su especialidad",
    pares: [
      { izq: "INATEC", der: "Tecnología e informática" },
      { izq: "UNA", der: "Agronomía y recursos naturales" },
      { izq: "UCA", der: "Diseño y artes" },
      { izq: "UNI", der: "Ingeniería civil y mecánica" }
    ]
  },
  {
    id: "word_scramble",
    titulo: "Palabra Vocacional",
    emoji: "🔤",
    disciplina: "Todos",
    tipo: "scramble",
    xp: 30,
    dificultad: "Fácil",
    color: "#3b82f6",
    descripcion: "Ordena las letras para descubrir la palabra clave",
    palabra: "VOCACION",
    pista: "Lo que Zynatra te ayuda a descubrir sobre tu futuro profesional"
  }
];

export function getGameById(id) {
  return GAMES.find(g => g.id === id);
}

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
