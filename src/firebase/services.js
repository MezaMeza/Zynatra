import { auth, db, isFirebaseConfigured } from "./config";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc 
} from "firebase/firestore";

// --- DATOS MOCK INICIALES (Para desarrollo local offline) ---
const MOCK_USERS = {
  "cristianbarrerasp@gmail.com": { 
    uid: "master_admin_1", 
    nombre: "Cristian Barreras (Administrador General)", 
    email: "cristianbarrerasp@gmail.com", 
    rol: "admin", 
    colegioId: "col1", 
    contrasena: "larreynaga2026", 
    estado: "activo" 
  },
  "estudiante@polaris.edu": { uid: "std1", nombre: "Mateo Silva", email: "estudiante@polaris.edu", rol: "student", colegioId: "col1", contrasena: "123456", estado: "activo", edad: "16", sexo: "Masculino", telefono: "505+5824-8955", cedula: "001-120508-1002U", nacionalidad: "Nicaragüense" },
  "estudiante2@polaris.edu": { uid: "std2", nombre: "Ana Morales", email: "estudiante2@polaris.edu", rol: "student", colegioId: "col1", contrasena: "123456", estado: "activo", edad: "17", sexo: "Femenino", telefono: "505+8899-7711", cedula: "001-040807-1005A", nacionalidad: "Nicaragüense" },
  "estudiante@zynatra.edu": { uid: "std3", nombre: "Luis Fernando Pérez", email: "estudiante@zynatra.edu", rol: "student", colegioId: "col1", contrasena: "123456", estado: "activo", edad: "16", sexo: "Masculino", telefono: "505+7744-1122", cedula: "001-150908-1001B", nacionalidad: "Nicaragüense" },
  "docente@polaris.edu": { uid: "tch1", nombre: "Prof. Sofía Méndez", email: "docente@polaris.edu", rol: "teacher", colegioId: "col1", contrasena: "123456", estado: "activo" },
  "profesional@zynatra.edu": { uid: "pro1", nombre: "Ing. Gabriel Torrez (Mentor Tech)", email: "profesional@zynatra.edu", rol: "teacher", colegioId: "col1", contrasena: "123456", estado: "activo" }
};

const MOCK_STUDENTS = {
  "std1": {
    id: "std1", xp: 320, nivel: 3, talentProfile: null,
    goals: [], achievements: [], resourcesRead: [],
    dailyChallenges: { date: "", completed: [] },
    streak: { count: 2, lastDate: new Date().toISOString().split("T")[0] },
    gamesCompleted: []
  },
  "std2": {
    id: "std2",
    xp: 480,
    nivel: 4,
    talentProfile: {
      perfilTop: "Arquitecto de Software y Creador Digital",
      areaPrincipal: "Tecnología y Ciencias de la Computación",
      disciplinaClave: "Tecnología",
      scores: { ecologia: 0, tecnologia: 60, ingenieria: 20, arte: 20 }
    },
    goals: [
      { id: "g1", titulo: "Aprobar informática con 90+", plazo: "corto", completado: true },
      { id: "g2", titulo: "Inscribirme en curso INATEC", plazo: "mediano", completado: false }
    ],
    achievements: ["first_test", "first_goal"],
    resourcesRead: ["res1"],
    dailyChallenges: { date: "", completed: [] },
    streak: { count: 5, lastDate: new Date().toISOString().split("T")[0] },
    gamesCompleted: ["ecology_quiz", "code_loop"]
  }
};

const MOCK_TASKS = [
  { id: "task1", titulo: "Proyecto de Compostaje y Reciclaje", descripcion: "Crea una compostera casera con residuos orgánicos y documenta el proceso en 3 pasos con fotos.", materia: "Ecología y Ciencias", fechaLimite: "2026-06-25", docenteId: "tch1" },
  { id: "task2", titulo: "Investigación sobre Paneles Solares", descripcion: "Describe cómo funciona una celda fotovoltaica y cuáles son las ventajas ecológicas sobre la energía fósil.", materia: "Física y Tecnología", fechaLimite: "2026-06-30", docenteId: "tch1" },
  { id: "task3", titulo: "Introducción a Algoritmos Dinámicos", descripcion: "Resuelve los 3 acertijos lúdicos de lógica secuencial en la sección de juegos.", materia: "Informática", fechaLimite: "2026-07-05", docenteId: "tch2" }
];

const MOCK_SUBMISSIONS = [
  { id: "sub1", tareaId: "task1", estudianteId: "std1", estado: "pendiente", calificacion: null, feedback: "", fechaEntrega: null }
];

const MOCK_CONNECTIONS = [
  {
    id: "conn1",
    nombre: "Universidad Nacional Autónoma de Nicaragua (UNAN-Managua)",
    tipo: "Universidad",
    disciplina: "Ecología",
    descripcion: "Carreras en Biología, Agronomía y Gestión Ambiental. Referente del Sistema de Educación Superior nicaragüense.",
    logo: "🌱",
    ubicacion: "Managua, Nicaragua"
  },
  {
    id: "conn2",
    nombre: "Universidad Nacional de Ingeniería (UNI)",
    tipo: "Universidad",
    disciplina: "Ingeniería",
    descripcion: "Formación en Ingeniería Civil, Mecánica, Eléctrica y Energías Renovables para el desarrollo nacional.",
    logo: "⚙️",
    ubicacion: "Managua, Nicaragua"
  },
  {
    id: "conn3",
    nombre: "INATEC — Instituto Nacional Tecnológico",
    tipo: "Instituto Técnico",
    disciplina: "Tecnología",
    descripcion: "Capacitación técnica en informática, redes, desarrollo de software y oficios digitales de alta demanda en Nicaragua.",
    logo: "💻",
    ubicacion: "Managua, Nicaragua"
  },
  {
    id: "conn4",
    nombre: "Universidad Centroamericana (UCA)",
    tipo: "Universidad",
    disciplina: "Arte",
    descripcion: "Programas en Diseño Gráfico, Comunicación Visual, Arquitectura y Artes Digitales con enfoque social.",
    logo: "🎨",
    ubicacion: "Managua, Nicaragua"
  },
  {
    id: "conn5",
    nombre: "Universidad Nacional Agraria (UNA)",
    tipo: "Universidad",
    disciplina: "Ecología",
    descripcion: "Especialización en recursos naturales, veterinaria, ecología y producción agroecológica sostenible.",
    logo: "🚜",
    ubicacion: "Managua, Nicaragua"
  },
  {
    id: "conn6",
    nombre: "Politécnico Nacional de Nicaragua",
    tipo: "Instituto Técnico",
    disciplina: "Ingeniería",
    descripcion: "Técnicos en mecánica industrial, electrónica, mantenimiento y manufactura para el sector productivo.",
    logo: "🔧",
    ubicacion: "León, Nicaragua"
  },
  {
    id: "conn7",
    nombre: "UNI — Sede Regional Norte",
    tipo: "Universidad",
    disciplina: "Tecnología",
    descripcion: "Ingeniería en Sistemas, Ciencia de Datos y Tecnologías de la Información para la región norte del país.",
    logo: "🤖",
    ubicacion: "Estelí, Nicaragua"
  },
  {
    id: "conn8",
    nombre: "Instituto de Arte y Diseño de Nicaragua",
    tipo: "Instituto Técnico",
    disciplina: "Arte",
    descripcion: "Formación técnica en animación digital, diseño UX/UI, fotografía y producción audiovisual.",
    logo: "📸",
    ubicacion: "Granada, Nicaragua"
  }
];

const CONNECTIONS_VERSION = 2;
const DATA_VERSION = 7;

const defaultProgress = () => ({
  goals: [],
  achievements: [],
  resourcesRead: [],
  dailyChallenges: { date: "", completed: [] },
  streak: { count: 0, lastDate: "" },
  gamesCompleted: []
});

const ensureStudentProgress = (student) => ({
  ...defaultProgress(),
  ...student,
  goals: student.goals || [],
  achievements: student.achievements || [],
  resourcesRead: student.resourcesRead || [],
  dailyChallenges: student.dailyChallenges || { date: "", completed: [] },
  streak: student.streak || { count: 0, lastDate: "" },
  gamesCompleted: student.gamesCompleted || []
});

// Inicializar localStorage si no existen datos locales
const initLocalStorage = () => {
  let users = JSON.parse(localStorage.getItem("polaris_users")) || {};
  users["cristianbarrerasp@gmail.com"] = MOCK_USERS["cristianbarrerasp@gmail.com"];
  delete users["admin@zynatra.edu"];
  delete users["director@polaris.edu"];
  localStorage.setItem("polaris_users", JSON.stringify(users));

  if (!localStorage.getItem("polaris_students")) {
    localStorage.setItem("polaris_students", JSON.stringify(MOCK_STUDENTS));
  } else if (localStorage.getItem("polaris_data_version") !== String(DATA_VERSION)) {
    const students = JSON.parse(localStorage.getItem("polaris_students"));
    for (const [uid, data] of Object.entries(MOCK_STUDENTS)) {
      students[uid] = ensureStudentProgress({ ...students[uid], ...data });
    }
    localStorage.setItem("polaris_students", JSON.stringify(students));
  }

  if (!localStorage.getItem("polaris_tasks")) localStorage.setItem("polaris_tasks", JSON.stringify(MOCK_TASKS));
  if (!localStorage.getItem("polaris_submissions")) localStorage.setItem("polaris_submissions", JSON.stringify(MOCK_SUBMISSIONS));

  const storedVersion = localStorage.getItem("polaris_connections_version");
  if (!localStorage.getItem("polaris_connections") || storedVersion !== String(CONNECTIONS_VERSION)) {
    localStorage.setItem("polaris_connections", JSON.stringify(MOCK_CONNECTIONS));
    localStorage.setItem("polaris_connections_version", String(CONNECTIONS_VERSION));
  }

  if (!localStorage.getItem("polaris_recovery_requests")) {
    localStorage.setItem("polaris_recovery_requests", JSON.stringify([]));
  }

  localStorage.setItem("polaris_data_version", String(DATA_VERSION));
};

initLocalStorage();

// --- SERVICIOS DE AUTENTICACIÓN ---

export const loginUser = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Acceso Maestro Garantizado para Administrador General
  if (normalizedEmail === "cristianbarrerasp@gmail.com" && password === "larreynaga2026") {
    const masterAdminData = {
      uid: "master_admin_1",
      nombre: "Cristian Barreras (Administrador General)",
      email: "cristianbarrerasp@gmail.com",
      rol: "admin",
      colegioId: "col1",
      estado: "activo"
    };

    if (isFirebaseConfigured) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        return userDoc.exists() ? userDoc.data() : masterAdminData;
      } catch (fbErr) {
        try {
          const newCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          await setDoc(doc(db, "users", newCredential.user.uid), { ...masterAdminData, uid: newCredential.user.uid });
          return { ...masterAdminData, uid: newCredential.user.uid };
        } catch (createErr) {
          return masterAdminData;
        }
      }
    } else {
      const users = JSON.parse(localStorage.getItem("polaris_users")) || {};
      users["cristianbarrerasp@gmail.com"] = { ...masterAdminData, contrasena: password };
      localStorage.setItem("polaris_users", JSON.stringify(users));
      return masterAdminData;
    }
  }

  // Flujo estándar
  if (isFirebaseConfigured) {
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    const userData = userDoc.exists() ? userDoc.data() : { uid: userCredential.user.uid, email: normalizedEmail, rol: "student" };
    
    // Sync to localStorage for local recovery support
    const localUsers = JSON.parse(localStorage.getItem("polaris_users")) || {};
    localUsers[normalizedEmail] = { ...userData, contrasena: password };
    localStorage.setItem("polaris_users", JSON.stringify(localUsers));
    
    return userData;
  } else {
    // Simulación local
    const users = JSON.parse(localStorage.getItem("polaris_users")) || {};
    const matchedUser = users[normalizedEmail];
    if (!matchedUser) throw new Error("No existe una cuenta con ese correo electrónico.");
    if (matchedUser.estado === "suspendido") {
      throw new Error("Tu cuenta está suspendida. Contacta a la dirección del sistema.");
    }
    if (matchedUser.contrasena === password) {
      return { ...matchedUser };
    }
    throw new Error("Contraseña incorrecta. Usa 'Recuperar acceso' si la olvidaste.");
  }
};

export const registerUser = async (nombre, email, password, rol, colegioId = "col1", extraData = {}) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Protección del rol Administrador General
  if (rol === "admin" && normalizedEmail !== "cristianbarrerasp@gmail.com") {
    throw new Error("Acceso denegado: El rol de Administrador General está estrictamente protegido y restringido.");
  }

  // extraData may contain: edad, sexo, telefono, cedula, nacionalidad
  const profileFields = {};
  if (extraData.edad) profileFields.edad = extraData.edad;
  if (extraData.sexo) profileFields.sexo = extraData.sexo;
  if (extraData.telefono) profileFields.telefono = extraData.telefono;
  if (extraData.cedula) profileFields.cedula = extraData.cedula;
  if (extraData.nacionalidad) profileFields.nacionalidad = extraData.nacionalidad;

  if (isFirebaseConfigured) {
    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    const userData = { uid: userCredential.user.uid, nombre, email: normalizedEmail, rol, colegioId, estado: "activo", ...profileFields };
    await setDoc(doc(db, "users", userCredential.user.uid), userData);
    
    if (rol === "student") {
      await setDoc(doc(db, "students", userCredential.user.uid), {
        id: userCredential.user.uid,
        xp: 0,
        nivel: 1,
        talentProfile: null,
        ...defaultProgress()
      });
    }

    // Also sync to localStorage for local recovery support
    const localUsers = JSON.parse(localStorage.getItem("polaris_users")) || {};
    localUsers[normalizedEmail] = { ...userData, contrasena: password };
    localStorage.setItem("polaris_users", JSON.stringify(localUsers));

    return userData;
  } else {
    // Simulación local
    const users = JSON.parse(localStorage.getItem("polaris_users"));
    if (users[normalizedEmail]) throw new Error("El usuario ya existe.");
    
    const uid = "user_" + Date.now();
    const userData = { uid, nombre, email: normalizedEmail, rol, colegioId, contrasena: password, estado: "activo", ...profileFields };
    users[normalizedEmail] = userData;
    localStorage.setItem("polaris_users", JSON.stringify(users));
    
    if (rol === "student") {
      const students = JSON.parse(localStorage.getItem("polaris_students"));
      students[uid] = { id: uid, xp: 0, nivel: 1, talentProfile: null, ...defaultProgress() };
      localStorage.setItem("polaris_students", JSON.stringify(students));
    }
    return userData;
  }
};

export const logoutUser = async () => {
  if (isFirebaseConfigured) {
    await signOut(auth);
  }
};

// --- SERVICIOS DE NEGOCIO (FIRESTORE / LOCALSTORAGE) ---

export const getStudentData = async (studentId) => {
  if (isFirebaseConfigured) {
    const studentDoc = await getDoc(doc(db, "students", studentId));
    if (studentDoc.exists()) {
      return ensureStudentProgress(studentDoc.data());
    }
    const defaultData = ensureStudentProgress({ id: studentId, xp: 0, nivel: 1, talentProfile: null });
    await setDoc(doc(db, "students", studentId), defaultData);
    return defaultData;
  } else {
    const students = JSON.parse(localStorage.getItem("polaris_students")) || {};
    if (!students[studentId]) {
      students[studentId] = { id: studentId, xp: 0, nivel: 1, talentProfile: null, ...defaultProgress() };
      localStorage.setItem("polaris_students", JSON.stringify(students));
    }
    return ensureStudentProgress(students[studentId]);
  }
};

// Guardar resultado del test vocacional
export const saveVocationalResult = async (studentId, profile) => {
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, "students", studentId), { talentProfile: profile });
  } else {
    const students = JSON.parse(localStorage.getItem("polaris_students")) || {};
    if (!students[studentId]) {
      students[studentId] = { id: studentId, xp: 0, nivel: 1, talentProfile: null, ...defaultProgress() };
    }
    students[studentId].talentProfile = profile;
    localStorage.setItem("polaris_students", JSON.stringify(students));
  }
};

// Sumar XP y subir nivel al estudiante
export const awardXP = async (studentId, xpAmount) => {
  if (isFirebaseConfigured) {
    const studentDoc = await getDoc(doc(db, "students", studentId));
    if (studentDoc.exists()) {
      const data = studentDoc.data();
      const newXp = (data.xp || 0) + xpAmount;
      const newLevel = Math.floor(newXp / 150) + 1; // 150 XP por nivel
      await updateDoc(doc(db, "students", studentId), { xp: newXp, nivel: newLevel });
      return { xp: newXp, nivel: newLevel };
    }
  } else {
    const students = JSON.parse(localStorage.getItem("polaris_students"));
    if (students[studentId]) {
      const newXp = students[studentId].xp + xpAmount;
      const newLevel = Math.floor(newXp / 150) + 1;
      students[studentId].xp = newXp;
      students[studentId].nivel = newLevel;
      localStorage.setItem("polaris_students", JSON.stringify(students));
      return { xp: newXp, nivel: newLevel };
    }
  }
  return null;
};

// Obtener todas las tareas
export const getTasks = async (docenteId = null) => {
  if (isFirebaseConfigured) {
    const q = docenteId 
      ? query(collection(db, "tasks"), where("docenteId", "==", docenteId))
      : collection(db, "tasks");
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } else {
    const tasks = JSON.parse(localStorage.getItem("polaris_tasks"));
    if (docenteId) {
      return tasks.filter(t => t.docenteId === docenteId);
    }
    return tasks;
  }
};

// Crear nueva tarea
export const createTask = async (titulo, descripcion, materia, fechaLimite, docenteId) => {
  const taskData = { titulo, descripcion, materia, fechaLimite, docenteId };
  if (isFirebaseConfigured) {
    const docRef = await addDoc(collection(db, "tasks"), taskData);
    return { id: docRef.id, ...taskData };
  } else {
    const tasks = JSON.parse(localStorage.getItem("polaris_tasks"));
    const id = "task_" + Date.now();
    const newTask = { id, ...taskData };
    tasks.push(newTask);
    localStorage.setItem("polaris_tasks", JSON.stringify(tasks));
    return newTask;
  }
};

// Obtener entregas
export const getSubmissions = async (estudianteId = null, docenteId = null) => {
  if (isFirebaseConfigured) {
    let q = collection(db, "submissions");
    if (estudianteId) {
      q = query(q, where("estudianteId", "==", estudianteId));
    }
    const snap = await getDocs(q);
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    if (docenteId) {
      // Filtrar tareas creadas por el docente en memoria si Firestore query es limitado
      const tasks = await getTasks(docenteId);
      const taskIds = tasks.map(t => t.id);
      list = list.filter(sub => taskIds.includes(sub.tareaId));
    }
    return list;
  } else {
    const subs = JSON.parse(localStorage.getItem("polaris_submissions"));
    let filtered = subs;
    if (estudianteId) {
      filtered = filtered.filter(s => s.estudianteId === estudianteId);
    }
    if (docenteId) {
      const tasks = JSON.parse(localStorage.getItem("polaris_tasks"));
      const teacherTaskIds = tasks.filter(t => t.docenteId === docenteId).map(t => t.id);
      filtered = filtered.filter(s => teacherTaskIds.includes(s.tareaId));
    }
    return filtered;
  }
};

// Enviar tarea (cambiar estado a entregado)
export const submitTask = async (tareaId, estudianteId, feedbackEstudiante = "") => {
  if (isFirebaseConfigured) {
    // Buscar si ya existe entrega
    const q = query(
      collection(db, "submissions"), 
      where("tareaId", "==", tareaId), 
      where("estudianteId", "==", estudianteId)
    );
    const snap = await getDocs(q);
    const date = new Date().toISOString().split("T")[0];
    
    if (!snap.empty) {
      const docId = snap.docs[0].id;
      await updateDoc(doc(db, "submissions", docId), {
        estado: "entregado",
        fechaEntrega: date,
        feedbackEstudiante
      });
    } else {
      await addDoc(collection(db, "submissions"), {
        tareaId,
        estudianteId,
        estado: "entregado",
        fechaEntrega: date,
        feedbackEstudiante,
        calificacion: null,
        feedback: ""
      });
    }
  } else {
    const subs = JSON.parse(localStorage.getItem("polaris_submissions"));
    const idx = subs.findIndex(s => s.tareaId === tareaId && s.estudianteId === estudianteId);
    const date = new Date().toISOString().split("T")[0];
    
    if (idx !== -1) {
      subs[idx].estado = "entregado";
      subs[idx].fechaEntrega = date;
      subs[idx].feedbackEstudiante = feedbackEstudiante;
    } else {
      subs.push({
        id: "sub_" + Date.now(),
        tareaId,
        estudianteId,
        estado: "entregado",
        fechaEntrega: date,
        feedbackEstudiante,
        calificacion: null,
        feedback: ""
      });
    }
    localStorage.setItem("polaris_submissions", JSON.stringify(subs));
  }
};

// Calificar una entrega
export const gradeSubmission = async (submissionId, calificacion, feedback) => {
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, "submissions", submissionId), {
      estado: "calificado",
      calificacion,
      feedback
    });
  } else {
    const subs = JSON.parse(localStorage.getItem("polaris_submissions"));
    const idx = subs.findIndex(s => s.id === submissionId);
    if (idx !== -1) {
      subs[idx].estado = "calificado";
      subs[idx].calificacion = parseFloat(calificacion);
      subs[idx].feedback = feedback;
      localStorage.setItem("polaris_submissions", JSON.stringify(subs));
    }
  }
};

// Obtener conexiones a escuelas e institutos
export const getConnections = async () => {
  if (isFirebaseConfigured) {
    const snap = await getDocs(collection(db, "connections"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } else {
    return JSON.parse(localStorage.getItem("polaris_connections"));
  }
};

// Obtener estudiantes de un colegio (para orientación docente)
export const getSchoolStudents = async (colegioId) => {
  if (isFirebaseConfigured) {
    const usersSnap = await getDocs(query(collection(db, "users"), where("rol", "==", "student"), where("colegioId", "==", colegioId)));
    const list = [];
    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const studentDoc = await getDoc(doc(db, "students", userDoc.id));
      const studentData = studentDoc.exists() ? studentDoc.data() : {};
      list.push({ ...userData, ...studentData });
    }
    return list;
  } else {
    const users = JSON.parse(localStorage.getItem("polaris_users"));
    const students = JSON.parse(localStorage.getItem("polaris_students"));
    return Object.values(users)
      .filter(u => u.rol === "student" && u.colegioId === colegioId)
      .map(u => ensureStudentProgress({ ...u, ...(students[u.uid] || {}) }));
  }
};

const updateStudentFields = async (studentId, fields) => {
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, "students", studentId), fields);
  } else {
    const students = JSON.parse(localStorage.getItem("polaris_students")) || {};
    if (!students[studentId]) {
      students[studentId] = { id: studentId, xp: 0, nivel: 1, talentProfile: null, ...defaultProgress() };
    }
    Object.assign(students[studentId], fields);
    localStorage.setItem("polaris_students", JSON.stringify(students));
  }
};

export const recordStreak = async (studentId) => {
  const data = await getStudentData(studentId);
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  let count = data.streak?.count || 0;
  const last = data.streak?.lastDate || "";

  if (last === today) return data.streak;
  if (last === yesterday) count += 1;
  else count = 1;

  const streak = { count, lastDate: today };
  await updateStudentFields(studentId, { streak });
  return streak;
};

export const addGoal = async (studentId, titulo, plazo) => {
  const data = await getStudentData(studentId);
  const goal = { id: "goal_" + Date.now(), titulo, plazo, completado: false };
  const goals = [...(data.goals || []), goal];
  await updateStudentFields(studentId, { goals });
  return goal;
};

export const toggleGoal = async (studentId, goalId) => {
  const data = await getStudentData(studentId);
  const goals = (data.goals || []).map(g =>
    g.id === goalId ? { ...g, completado: !g.completado } : g
  );
  await updateStudentFields(studentId, { goals });
  return goals;
};

export const markResourceRead = async (studentId, resourceId) => {
  const data = await getStudentData(studentId);
  if ((data.resourcesRead || []).includes(resourceId)) return data.resourcesRead;
  const resourcesRead = [...(data.resourcesRead || []), resourceId];
  await updateStudentFields(studentId, { resourcesRead });
  return resourcesRead;
};

export const completeDailyChallenge = async (studentId, challengeId) => {
  const data = await getStudentData(studentId);
  const today = new Date().toISOString().split("T")[0];
  let daily = data.dailyChallenges || { date: "", completed: [] };
  if (daily.date !== today) daily = { date: today, completed: [] };
  if (daily.completed.includes(challengeId)) return { daily, isNew: false };
  daily.completed.push(challengeId);
  await updateStudentFields(studentId, { dailyChallenges: daily });
  return { daily, isNew: true };
};

export const unlockAchievement = async (studentId, achievementId) => {
  const data = await getStudentData(studentId);
  if ((data.achievements || []).includes(achievementId)) return false;
  const achievements = [...(data.achievements || []), achievementId];
  await updateStudentFields(studentId, { achievements });
  return true;
};

export const markGameCompleted = async (studentId, gameId) => {
  const data = await getStudentData(studentId);
  if ((data.gamesCompleted || []).includes(gameId)) return { gamesCompleted: data.gamesCompleted, isNew: false };
  const gamesCompleted = [...(data.gamesCompleted || []), gameId];
  await updateStudentFields(studentId, { gamesCompleted });
  return { gamesCompleted, isNew: true };
};

export const getLeaderboard = async (colegioId) => {
  const students = await getSchoolStudents(colegioId);
  return students
    .map(s => ({ nombre: s.nombre, xp: s.xp || 0, nivel: s.nivel || 1, uid: s.uid || s.id }))
    .sort((a, b) => b.xp - a.xp);
};

// --- GESTIÓN DE USUARIOS Y RECUPERACIÓN DE CUENTAS ---

export const getAllSchoolUsers = async (colegioId) => {
  if (isFirebaseConfigured) {
    const snap = await getDocs(query(collection(db, "users"), where("colegioId", "==", colegioId)));
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  }
  const users = JSON.parse(localStorage.getItem("polaris_users"));
  const students = JSON.parse(localStorage.getItem("polaris_students"));
  return Object.values(users)
    .filter(u => u.colegioId === colegioId)
    .map(u => ({ ...u, ...(students[u.uid] || {}) }));
};

export const submitRecoveryRequest = async ({ nombre, email, tipo, mensaje, colegioId = "col1" }) => {
  const request = {
    id: "rec_" + Date.now(),
    nombre,
    email: email.toLowerCase().trim(),
    tipo,
    mensaje: mensaje || "",
    colegioId,
    estado: "pendiente",
    fecha: new Date().toISOString().split("T")[0],
    respuesta: "",
    claveTemporal: null
  };

  if (isFirebaseConfigured) {
    const docRef = await addDoc(collection(db, "recovery_requests"), request);
    return { id: docRef.id, ...request };
  }

  const list = JSON.parse(localStorage.getItem("polaris_recovery_requests"));
  const pending = list.filter(r => r.email === request.email && r.estado === "pendiente");
  if (pending.length > 0) {
    throw new Error("Ya tienes una solicitud pendiente. La dirección de tu colegio la revisará pronto.");
  }
  list.unshift(request);
  localStorage.setItem("polaris_recovery_requests", JSON.stringify(list));
  return request;
};

export const getRecoveryRequests = async (colegioId, soloPendientes = false) => {
  if (isFirebaseConfigured) {
    let q = query(collection(db, "recovery_requests"), where("colegioId", "==", colegioId));
    const snap = await getDocs(q);
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (soloPendientes) list = list.filter(r => r.estado === "pendiente");
    return list.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
  const list = JSON.parse(localStorage.getItem("polaris_recovery_requests"));
  return list
    .filter(r => r.colegioId === colegioId && (!soloPendientes || r.estado === "pendiente"))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
};

export const resetUserPassword = async (email, newPassword = "Polaris2026") => {
  if (isFirebaseConfigured) {
    const snap = await getDocs(query(collection(db, "users"), where("email", "==", email)));
    if (snap.empty) throw new Error("Usuario no encontrado.");
    // En producción usar Firebase Auth resetPassword
    await updateDoc(doc(db, "users", snap.docs[0].id), { passwordResetPending: true });
    return newPassword;
  }
  const users = JSON.parse(localStorage.getItem("polaris_users"));
  const key = Object.keys(users).find(e => e.toLowerCase() === email.toLowerCase());
  if (!key) throw new Error("Usuario no encontrado.");
  users[key].contrasena = newPassword;
  localStorage.setItem("polaris_users", JSON.stringify(users));
  return newPassword;
};

export const updateUserStatus = async (email, estado) => {
  if (isFirebaseConfigured) {
    const snap = await getDocs(query(collection(db, "users"), where("email", "==", email)));
    if (snap.empty) throw new Error("Usuario no encontrado.");
    await updateDoc(doc(db, "users", snap.docs[0].id), { estado });
    return estado;
  }
  const users = JSON.parse(localStorage.getItem("polaris_users"));
  const key = Object.keys(users).find(e => e.toLowerCase() === email.toLowerCase());
  if (!key) throw new Error("Usuario no encontrado.");
  users[key].estado = estado;
  localStorage.setItem("polaris_users", JSON.stringify(users));
  return estado;
};

export const resolveRecoveryRequest = async (requestId, { respuesta, nuevaClave, adminNombre }) => {
  const clave = nuevaClave || "Polaris2026";

  if (isFirebaseConfigured) {
    await updateDoc(doc(db, "recovery_requests", requestId), {
      estado: "resuelto",
      respuesta,
      claveTemporal: clave,
      resueltoPor: adminNombre,
      fechaResolucion: new Date().toISOString().split("T")[0]
    });
    return clave;
  }

  const list = JSON.parse(localStorage.getItem("polaris_recovery_requests"));
  const idx = list.findIndex(r => r.id === requestId);
  if (idx === -1) throw new Error("Solicitud no encontrada.");

  const req = list[idx];
  if (req.tipo === "contrasena" || req.tipo === "ambos") {
    await resetUserPassword(req.email, clave);
  }

  list[idx] = {
    ...req,
    estado: "resuelto",
    respuesta,
    claveTemporal: req.tipo === "usuario" ? null : clave,
    resueltoPor: adminNombre,
    fechaResolucion: new Date().toISOString().split("T")[0]
  };
  localStorage.setItem("polaris_recovery_requests", JSON.stringify(list));
  return clave;
};

export const createStudentByAdmin = async (nombre, email, colegioId = "col1") => {
  const tempPassword = "Polaris" + Math.floor(1000 + Math.random() * 9000);
  const user = await registerUser(nombre, email, tempPassword, "student", colegioId);
  return { user, tempPassword };
};

export const updateUserByAdmin = async (email, fields) => {
  if (isFirebaseConfigured) {
    const snap = await getDocs(query(collection(db, "users"), where("email", "==", email)));
    if (snap.empty) throw new Error("Usuario no encontrado.");
    await updateDoc(doc(db, "users", snap.docs[0].id), fields);
    return fields;
  }
  const users = JSON.parse(localStorage.getItem("polaris_users"));
  const key = Object.keys(users).find(e => e.toLowerCase() === email.toLowerCase());
  if (!key) throw new Error("Usuario no encontrado.");
  Object.assign(users[key], fields);
  if (fields.email && fields.email !== key) {
    users[fields.email] = { ...users[key], email: fields.email };
    delete users[key];
  }
  localStorage.setItem("polaris_users", JSON.stringify(users));
  return users[fields.email || key];
};
