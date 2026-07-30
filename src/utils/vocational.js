export const DISCIPLINES = ["Ecología", "Tecnología", "Ingeniería", "Arte"];

export const AREA_TO_DISCIPLINE = {
  ecologia: "Ecología",
  tecnologia: "Tecnología",
  ingenieria: "Ingeniería",
  arte: "Arte"
};

export const AREA_FROM_DISCIPLINE = {
  Ecología: "ecologia",
  Tecnología: "tecnologia",
  Ingeniería: "ingenieria",
  Arte: "arte"
};

export function getDisciplineBadgeClass(disciplina) {
  switch (disciplina) {
    case "Ecología": return "badge-accent";
    case "Tecnología": return "badge-primary";
    case "Ingeniería": return "badge-secondary";
    case "Arte": return "badge-warning";
    default: return "badge-glass";
  }
}

export function getDisciplineButtonClass(disciplina) {
  switch (disciplina) {
    case "Ecología": return "btn-accent";
    case "Tecnología": return "btn-primary";
    case "Ingeniería": return "btn-secondary";
    case "Arte": return "btn-glass";
    default: return "btn-glass";
  }
}

export function getDisciplineFromProfile(talentProfile) {
  if (!talentProfile) return null;
  if (talentProfile.disciplinaClave) return talentProfile.disciplinaClave;

  const area = talentProfile.areaPrincipal || "";
  if (area.includes("Ecología") || area.includes("Ambiental")) return "Ecología";
  if (area.includes("Tecnología") || area.includes("Computación")) return "Tecnología";
  if (area.includes("Ingeniería") || area.includes("Mecánica")) return "Ingeniería";
  if (area.includes("Arte") || area.includes("Diseño")) return "Arte";
  return null;
}

export function getTopDisciplineFromScores(scores) {
  if (!scores) return null;
  let top = null;
  let max = -1;
  for (const [area, pct] of Object.entries(scores)) {
    if (pct > max) {
      max = pct;
      top = AREA_TO_DISCIPLINE[area];
    }
  }
  return top;
}
