import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, isFirebaseConfigured } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { loginUser, registerUser, logoutUser } from "../firebase/services";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Admin-only "view as" override so administrators can preview the app as
  // student / teacher / admin without switching accounts.
  const [viewAs, setViewAs] = useState(null);

  useEffect(() => {
    if (isFirebaseConfigured) {
      // Usar Firebase Auth si está activo
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Conseguir información adicional del usuario (rol, nombre)
            const usersLocal = JSON.parse(localStorage.getItem("polaris_users")) || {};
            // Si el usuario existe localmente (por ejemplo, sincronizado), lo tomamos
            const match = Object.values(usersLocal).find(u => u.email === firebaseUser.email);
            if (match) {
              setCurrentUser(match);
            } else {
              setCurrentUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                rol: "student", // por defecto
                nombre: firebaseUser.displayName || firebaseUser.email.split("@")[0]
              });
            }
          } catch (err) {
            console.error("Error al sincronizar auth:", err);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Modo local: leer sesión de localStorage
      const savedSession = localStorage.getItem("polaris_session");
      if (savedSession) {
        setCurrentUser(JSON.parse(savedSession));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      setCurrentUser(user);
      if (!isFirebaseConfigured) {
        localStorage.setItem("polaris_session", JSON.stringify(user));
      }
      return user;
    } catch (err) {
      setError(err.message || "Error al iniciar sesión.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (nombre, email, password, rol, extraData = {}) => {
    setError(null);
    setLoading(true);
    try {
      const user = await registerUser(nombre, email, password, rol, "col1", extraData);
      // Auto-iniciar sesión inmediatamente tras registro exitoso
      setCurrentUser(user);
      if (!isFirebaseConfigured) {
        localStorage.setItem("polaris_session", JSON.stringify(user));
      }
      // Marcar tutorial de bienvenida interactivo de 3 pasos
      sessionStorage.setItem("zynatra_show_tutorial", "true");
      return user;
    } catch (err) {
      setError(err.message || "Error al registrarse.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);
      setViewAs(null);
      localStorage.removeItem("polaris_session");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setLoading(false);
    }
  };

  // Effective role: the admin's preview override wins, otherwise the real role.
  const effectiveRole = viewAs || currentUser?.rol || null;

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    viewAs,
    setViewAs,
    effectiveRole
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
