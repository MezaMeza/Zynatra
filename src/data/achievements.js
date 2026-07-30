export const ACHIEVEMENTS = [
  { id: "first_test", titulo: "Autodescubrimiento", descripcion: "Completa tu primer test vocacional", icono: "🧭", xp: 50 },
  { id: "streak_3", titulo: "Constancia Digital", descripcion: "Mantén una racha de 3 días activos", icono: "🔥", xp: 75 },
  { id: "streak_7", titulo: "Hábito Productivo", descripcion: "Racha de 7 días usando Polaris Edu", icono: "⚡", xp: 150 },
  { id: "first_goal", titulo: "Visionario", descripcion: "Define tu primera meta de futuro", icono: "🎯", xp: 40 },
  { id: "goals_3", titulo: "Planificador", descripcion: "Completa 3 metas en tu plan de futuro", icono: "📋", xp: 100 },
  { id: "daily_5", titulo: "Retador Diario", descripcion: "Completa 5 retos diarios", icono: "🏆", xp: 120 },
  { id: "resource_3", titulo: "Explorador", descripcion: "Lee 3 recursos de la biblioteca", icono: "📚", xp: 60 },
  { id: "network_link", titulo: "Conector", descripcion: "Vincula una institución educativa", icono: "🔗", xp: 80 },
  { id: "level_5", titulo: "Estrella Polaris", descripcion: "Alcanza el nivel 5", icono: "⭐", xp: 200 },
  { id: "games_all", titulo: "Mente Ágil", descripcion: "Completa 8 juegos de la arena", icono: "🎮", xp: 90 },
];

export const DAILY_CHALLENGES = [
  { id: "dc_read", titulo: "Lee un recurso vocacional", descripcion: "Explora la biblioteca y aprende sobre una carrera", xp: 25, tab: "resources" },
  { id: "dc_advisor", titulo: "Consulta al Orientador IA", descripcion: "Haz una pregunta sobre tu futuro académico", xp: 25, tab: "advisor" },
  { id: "dc_game", titulo: "Entrena tu mente", descripcion: "Completa un juego didáctico en tu panel", xp: 30, tab: "dashboard" },
  { id: "dc_goal", titulo: "Avanza tu plan", descripcion: "Marca una meta como completada o agrega una nueva", xp: 35, tab: "progress" },
  { id: "dc_reflect", titulo: "Reflexión vocacional", descripcion: "Escribe en tu plan qué habilidad quieres desarrollar", xp: 30, tab: "progress" }
];

export function getTodaysChallenges() {
  const day = new Date().getDate();
  const shuffled = [...DAILY_CHALLENGES].sort((a, b) => ((day + a.id.length) % 5) - ((day + b.id.length) % 5));
  return shuffled.slice(0, 3);
}
