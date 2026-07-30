const GREETING = "¡Hola! Soy **Polaris**, tu orientador vocacional inteligente. Puedo ayudarte con carreras en Nicaragua, becas, habilidades y tu plan de futuro. ¿En qué te gustaría profundizar?";

const SUGGESTIONS = [
  "¿Qué carreras hay en Nicaragua?",
  "¿Cómo elegir entre técnico y universidad?",
  "¿Qué becas puedo solicitar?",
  "¿Qué habilidades necesito para tecnología?",
  "¿Cómo interpreto mi test vocacional?"
];

function getProfileContext(profile) {
  if (!profile) return "";
  return `El estudiante tiene perfil **${profile.perfilTop}** en el área de ${profile.areaPrincipal}. Disciplina clave: ${profile.disciplinaClave || "por definir"}.`;
}

export function getAdvisorGreeting(profile) {
  const ctx = profile
    ? `\n\nVeo que tu perfil destaca en **${profile.areaPrincipal}**. Puedo darte recomendaciones personalizadas.`
    : "\n\nTe recomiendo completar el test vocacional para orientarte mejor.";
  return GREETING + ctx;
}

export function getAdvisorSuggestions() {
  return SUGGESTIONS;
}

export function getAdvisorResponse(message, profile) {
  const msg = message.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  if (/hola|buenas|hey|saludos/.test(msg)) {
    return profile
      ? `¡Hola! Según tu test, tu talento principal es **${profile.perfilTop}**. ¿Quieres que te sugiera instituciones en Nicaragua o que exploremos carreras relacionadas?`
      : "¡Hola! Soy Polaris, tu orientador. Completa el test vocacional en la sección Orientación para recibir recomendaciones personalizadas. Mientras tanto, pregúntame sobre carreras, becas o habilidades.";
  }

  if (/carrera|estudiar|universidad|instituto|inatec|unan|uni|uca/.test(msg)) {
    if (profile?.disciplinaClave === "Tecnología") {
      return "**Para tu perfil tecnológico** en Nicaragua te recomiendo:\n\n• **INATEC** — formación técnica rápida en informática\n• **UNI Sede Norte** — Ingeniería en Sistemas\n• **UNAN** — Ciencias de la Computación\n\nPuedes empezar con técnico (2 años) y luego continuar a universidad. Revisa la **Red Académica** para vincular instituciones.";
    }
    if (profile?.disciplinaClave === "Ecología") {
      return "**Para tu perfil ecológico** considera:\n\n• **UNA** — Agronomía y Recursos Naturales\n• **UNAN** — Biología y Gestión Ambiental\n\nNicaragua necesita profesionales en conservación y agroecología. Explora recursos en la Biblioteca Vocacional.";
    }
    if (profile?.disciplinaClave === "Ingeniería") {
      return "**Para ingeniería** la **UNI** es la referencia nacional: Civil, Mecánica, Eléctrica y Energías Renovables. El **Politécnico Nacional** ofrece formación técnica como puente al mercado laboral.";
    }
    if (profile?.disciplinaClave === "Arte") {
      return "**Para arte y diseño**: **UCA** (Diseño Gráfico, Arquitectura) y el **Instituto de Arte y Diseño** en Granada. El portafolio creativo es clave para becas — revisa la sección de Becas en la Red Académica.";
    }
    return "En Nicaragua tienes excelentes opciones:\n\n• **Universidades**: UNAN, UNI, UCA, UNA\n• **Técnicos**: INATEC, Politécnico Nacional\n\nLa elección depende de tu vocación, tiempo y recursos. Haz el test vocacional y visita la Red Académica para comparar instituciones.";
  }

  if (/tecnico|técnico|universidad|diferencia|elegir/.test(msg)) {
    return "**Técnico vs Universidad:**\n\n• **Instituto técnico** (INATEC, politécnicos): 1-3 años, enfoque práctico, empleo rápido\n• **Universidad**: 4-5 años, formación profunda, más opciones de especialización\n\nMuchos jóvenes nicaragüenses empiezan con técnico y luego hacen la universidad. No hay una sola respuesta correcta — depende de tus metas en **Mi Plan de Futuro**.";
  }

  if (/beca|becas|financ|dinero|pagar|costo/.test(msg)) {
    return "**Becas y apoyo en Nicaragua:**\n\n• Becas de excelencia en UNAN y UNI\n• Programa Jóvenes en Tecnología (INATEC)\n• Apoyos del MINED para estudiantes del SEN\n• Becas por portafolio (UCA, arte)\n\nVe a **Red Académica → Becas** para ver convocatorias activas con fechas límite.";
  }

  if (/habilidad|habilidades|aprender|desarroll/.test(msg)) {
    const area = profile?.disciplinaClave || "tu área";
    return `**Habilidades clave para ${area}:**\n\n• Pensamiento crítico y resolución de problemas\n• Comunicación y trabajo en equipo\n• Uso productivo de tecnología (¡como en Polaris Edu!)\n• Constancia y aprendizaje autónomo\n\nCompleta los **retos diarios** y los juegos didácticos para fortalecer tu perfil.`;
  }

  if (/test|vocacional|resultado|perfil|interpret/.test(msg)) {
    if (profile) {
      const scores = profile.scores;
      const top = Object.entries(scores || {}).sort((a, b) => b[1] - a[1])[0];
      return `**Tu reporte vocacional:**\n\n• Perfil: **${profile.perfilTop}**\n• Área: ${profile.areaPrincipal}\n• Fortaleza principal: ${top ? `${top[0]} (${top[1]}%)` : "en análisis"}\n\nEsto no limita tu futuro — muestra dónde tienes más afinidad hoy. Explora carreras sugeridas y define metas en **Mi Progreso**.`;
    }
    return "El test vocacional analiza tus preferencias en 4 áreas: Ecología, Tecnología, Ingeniería y Arte. Responde con honestidad — no hay respuestas incorrectas. Ve a **Orientación IA** y completa las 8 preguntas para obtener tu perfil y +200 XP.";
  }

  if (/meta|plan|futuro|objetivo/.test(msg)) {
    return "En **Mi Progreso** puedes definir metas a corto, mediano y largo plazo:\n\n• **Corto**: terminar el año con buen promedio\n• **Mediano**: elegir carrera o instituto técnico\n• **Largo**: graduarte y trabajar en tu vocación\n\nCada meta completada te da XP y desbloquea logros.";
  }

  if (/xp|nivel|gamif|puntos/.test(msg)) {
    return "**Sistema de XP en Polaris Edu:**\n\n• Test vocacional: +200 XP\n• Retos diarios: +25-35 XP\n• Tareas aprobadas: +100 XP\n• Juegos didácticos: +30 XP\n• Logros especiales: hasta +200 XP\n\nSubir de nivel refleja tu compromiso con el aprendizaje productivo en el celular.";
  }

  if (/nicaragua|sen|mined|colegio/.test(msg)) {
    return "Polaris Edu está diseñada para jóvenes del **Sistema Educativo Nacional** de Nicaragua. Conectamos tu colegio con universidades e institutos nacionales, becas locales y recursos en español. Tu orientador escolar y docentes pueden ver tu progreso vocacional.";
  }

  return `Entiendo tu consulta sobre "${message}". ${getProfileContext(profile)}\n\nTe sugiero:\n1. Revisar la **Biblioteca Vocacional** para artículos relacionados\n2. Explorar la **Red Académica** con filtros por disciplina\n3. Definir metas en **Mi Progreso**\n\n¿Quieres saber sobre carreras, becas, habilidades o tu test vocacional?`;
}
