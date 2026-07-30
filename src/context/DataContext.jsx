import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { ACHIEVEMENTS } from "../data/achievements";
import { GAMES } from "../data/games";
import {
  getStudentData,
  getTasks,
  getSubmissions,
  getConnections,
  getSchoolStudents,
  getLeaderboard,
  getAllSchoolUsers,
  getRecoveryRequests,
  resetUserPassword,
  updateUserStatus,
  resolveRecoveryRequest,
  createStudentByAdmin,
  updateUserByAdmin,
  submitTask,
  gradeSubmission,
  createTask,
  awardXP,
  saveVocationalResult,
  recordStreak,
  addGoal,
  toggleGoal,
  markResourceRead,
  completeDailyChallenge,
  unlockAchievement,
  markGameCompleted
} from "../firebase/services";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [studentInfo, setStudentInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [schoolStudents, setSchoolStudents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [recoveryRequests, setRecoveryRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const checkAchievements = async (studentId, data) => {
    if (!data) return [];
    const unlocked = [];
    const tryUnlock = async (id, xp) => {
      const isNew = await unlockAchievement(studentId, id);
      if (isNew) {
        unlocked.push(id);
        await awardXP(studentId, xp);
      }
    };

    if (data.talentProfile) await tryUnlock("first_test", 50);
    if ((data.goals || []).length > 0) await tryUnlock("first_goal", 40);
    if ((data.goals || []).filter(g => g.completado).length >= 3) await tryUnlock("goals_3", 100);
    if ((data.streak?.count || 0) >= 3) await tryUnlock("streak_3", 75);
    if ((data.streak?.count || 0) >= 7) await tryUnlock("streak_7", 150);
    if ((data.dailyChallenges?.completed || []).length >= 5) await tryUnlock("daily_5", 120);
    if ((data.resourcesRead || []).length >= 3) await tryUnlock("resource_3", 60);
    if ((data.nivel || 1) >= 5) await tryUnlock("level_5", 200);
    if ((data.gamesCompleted || []).length >= Math.min(8, GAMES.length)) await tryUnlock("games_all", 90);

    return unlocked;
  };

  const refreshData = async () => {
    if (!currentUser) {
      setStudentInfo(null);
      setTasks([]);
      setSubmissions([]);
      setConnections([]);
      setSchoolStudents([]);
      setLeaderboard([]);
      setAllUsers([]);
      setRecoveryRequests([]);
      return;
    }

    setLoading(true);
    try {
      const connData = await getConnections();
      setConnections(connData);

      if (currentUser.rol === "student") {
        await recordStreak(currentUser.uid);
        const stdData = await getStudentData(currentUser.uid);
        await checkAchievements(currentUser.uid, stdData);
        const refreshed = await getStudentData(currentUser.uid);
        setStudentInfo(refreshed);

        const tasksData = await getTasks();
        setTasks(tasksData);

        const subsData = await getSubmissions(currentUser.uid);
        setSubmissions(subsData);

        const board = await getLeaderboard(currentUser.colegioId);
        setLeaderboard(board);
      } else if (currentUser.rol === "teacher") {
        const tasksData = await getTasks(currentUser.uid);
        setTasks(tasksData);

        const subsData = await getSubmissions(null, currentUser.uid);
        setSubmissions(subsData);

        const studentsData = await getSchoolStudents(currentUser.colegioId);
        setSchoolStudents(studentsData);
      } else if (currentUser.rol === "admin") {
        const tasksData = await getTasks();
        setTasks(tasksData);

        const subsData = await getSubmissions();
        setSubmissions(subsData);

        const studentsData = await getSchoolStudents(currentUser.colegioId);
        setSchoolStudents(studentsData);

        const board = await getLeaderboard(currentUser.colegioId);
        setLeaderboard(board);

        const users = await getAllSchoolUsers(currentUser.colegioId);
        setAllUsers(users);

        const recoveries = await getRecoveryRequests(currentUser.colegioId);
        setRecoveryRequests(recoveries);
      }
    } catch (err) {
      console.error("Error al refrescar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const submitAssignment = async (tareaId, feedbackEstudiante) => {
    if (!currentUser) return;
    try {
      await submitTask(tareaId, currentUser.uid, feedbackEstudiante);
      const updatedXp = await awardXP(currentUser.uid, 50);
      if (updatedXp) setStudentInfo(prev => ({ ...prev, ...updatedXp }));
      await refreshData();
    } catch (error) {
      console.error("Error al enviar la tarea:", error);
      throw error;
    }
  };

  const gradeAssignment = async (submissionId, estudianteId, calificacion, feedback) => {
    try {
      await gradeSubmission(submissionId, calificacion, feedback);
      if (parseFloat(calificacion) >= 7) await awardXP(estudianteId, 100);
      await refreshData();
    } catch (error) {
      console.error("Error al calificar:", error);
      throw error;
    }
  };

  const addAssignment = async (titulo, descripcion, materia, fechaLimite) => {
    if (!currentUser || currentUser.rol !== "teacher") return;
    try {
      const newTask = await createTask(titulo, descripcion, materia, fechaLimite, currentUser.uid);
      setTasks(prev => [...prev, newTask]);
      await refreshData();
      return newTask;
    } catch (error) {
      console.error("Error al crear tarea:", error);
      throw error;
    }
  };

  const saveVocationalProfile = async (profile) => {
    if (!currentUser || currentUser.rol !== "student") return;
    try {
      await saveVocationalResult(currentUser.uid, profile);
      setStudentInfo(prev => ({ ...prev, talentProfile: profile }));
      const updatedXp = await awardXP(currentUser.uid, 200);
      if (updatedXp) setStudentInfo(prev => ({ ...prev, ...updatedXp }));
      await unlockAchievement(currentUser.uid, "first_test");
      await refreshData();
    } catch (error) {
      console.error("Error al guardar perfil vocacional:", error);
      throw error;
    }
  };

  const createGoal = async (titulo, plazo) => {
    if (!currentUser || currentUser.rol !== "student") return;
    await addGoal(currentUser.uid, titulo, plazo);
    await refreshData();
  };

  const completeGoal = async (goalId) => {
    if (!currentUser || currentUser.rol !== "student") return;
    await toggleGoal(currentUser.uid, goalId);
    await awardXP(currentUser.uid, 40);
    await refreshData();
  };

  const readResource = async (resourceId) => {
    if (!currentUser || currentUser.rol !== "student") return;
    await markResourceRead(currentUser.uid, resourceId);
    await awardXP(currentUser.uid, 15);
    await refreshData();
  };

  const finishDailyChallenge = async (challengeId, xpReward) => {
    if (!currentUser || currentUser.rol !== "student") return;
    const { isNew } = await completeDailyChallenge(currentUser.uid, challengeId);
    if (isNew) {
      await awardXP(currentUser.uid, xpReward);
      await refreshData();
    }
  };

  const finishGame = async (gameId) => {
    if (!currentUser || currentUser.rol !== "student") return false;
    const game = GAMES.find(g => g.id === gameId);
    const xpReward = game?.xp || 30;
    const { isNew } = await markGameCompleted(currentUser.uid, gameId);
    if (isNew) {
      await awardXP(currentUser.uid, xpReward);
      await refreshData();
    }
    return isNew;
  };

  const adminResetPassword = async (email) => {
    const clave = await resetUserPassword(email);
    await refreshData();
    return clave;
  };

  const adminToggleStatus = async (email, estado) => {
    await updateUserStatus(email, estado);
    await refreshData();
  };

  const adminResolveRecovery = async (requestId, payload) => {
    const clave = await resolveRecoveryRequest(requestId, payload);
    await refreshData();
    return clave;
  };

  const adminCreateStudent = async (nombre, email, colegioId) => {
    const result = await createStudentByAdmin(nombre, email, colegioId);
    await refreshData();
    return result;
  };

  const adminUpdateUser = async (email, fields) => {
    await updateUserByAdmin(email, fields);
    await refreshData();
  };

  const value = {
    studentInfo,
    tasks,
    submissions,
    connections,
    schoolStudents,
    leaderboard,
    allUsers,
    recoveryRequests,
    achievements: ACHIEVEMENTS,
    loading,
    refreshData,
    submitAssignment,
    gradeAssignment,
    addAssignment,
    saveVocationalProfile,
    createGoal,
    completeGoal,
    readResource,
    finishDailyChallenge,
    finishGame,
    adminResetPassword,
    adminToggleStatus,
    adminResolveRecovery,
    adminCreateStudent,
    adminUpdateUser
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
