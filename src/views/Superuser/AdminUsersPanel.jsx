import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import {
  Users, KeyRound, Shield, Plus, X, Mail, UserCheck, AlertCircle, CheckCircle,
  Search, Eye, Gamepad2, Zap, Flame, Compass, Copy, Edit3
} from "lucide-react";
import { getDisciplineFromProfile } from "../../utils/vocational";
import { GAMES } from "../../data/games";

const ROL_LABELS = { student: "Estudiante", teacher: "Docente", admin: "Dirección" };

export default function AdminUsersPanel() {
  const { currentUser } = useAuth();
  const {
    allUsers, recoveryRequests,
    adminResetPassword, adminToggleStatus, adminResolveRecovery, adminCreateStudent, adminUpdateUser
  } = useData();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [filterRol, setFilterRol] = useState("Todos");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [resolveModal, setResolveModal] = useState(null);
  const [resolveRespuesta, setResolveRespuesta] = useState("");
  const [resolveClave, setResolveClave] = useState("Polaris2026");
  const [detailUser, setDetailUser] = useState(null);
  const [editNombre, setEditNombre] = useState("");

  const students = allUsers.filter(u => u.rol === "student");
  const pendingRecoveries = recoveryRequests.filter(r => r.estado === "pendiente");
  const activos = allUsers.filter(u => (u.estado || "activo") === "activo").length;
  const suspendidos = allUsers.filter(u => u.estado === "suspendido").length;

  const filteredUsers = allUsers.filter(u => {
    if (filterRol !== "Todos" && u.rol !== filterRol) return false;
    if (filterEstado === "activo" && u.estado === "suspendido") return false;
    if (filterEstado === "suspendido" && u.estado !== "suspendido") return false;
    if (filterEstado === "sin_test" && u.rol === "student" && u.talentProfile) return false;
    if (filterEstado === "con_test" && u.rol === "student" && !u.talentProfile) return false;
    const q = searchTerm.toLowerCase();
    if (q && !u.nombre.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    return true;
  });

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const { user, tempPassword } = await adminCreateStudent(newNombre, newEmail, currentUser.colegioId);
      setShowCreateModal(false);
      setNewNombre("");
      setNewEmail("");
      alert(`¡Estudiante ${user.nombre} registrado!\n\nCorreo: ${user.email}\nClave temporal: ${tempPassword}\n\nEntrega estos datos al estudiante de forma segura.`);
    } catch (err) {
      alert(err.message || "Error al crear estudiante.");
    }
  };

  const handleResetPassword = async (email, nombre) => {
    if (!window.confirm(`¿Restablecer contraseña de ${nombre}?`)) return;
    try {
      const clave = await adminResetPassword(email);
      alert(`Contraseña restablecida para ${nombre}.\n\nNueva clave temporal: ${clave}`);
      if (detailUser?.email === email) setDetailUser(prev => ({ ...prev, lastClave: clave }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (email, nombre, currentEstado) => {
    const nuevo = currentEstado === "activo" ? "suspendido" : "activo";
    if (!window.confirm(`¿Deseas ${nuevo === "suspendido" ? "suspender" : "reactivar"} la cuenta de ${nombre}?`)) return;
    try {
      await adminToggleStatus(email, nuevo);
      if (detailUser?.email === email) setDetailUser(prev => ({ ...prev, estado: nuevo }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolveModal) return;
    try {
      const clave = await adminResolveRecovery(resolveModal.id, {
        respuesta: resolveRespuesta,
        nuevaClave: resolveClave,
        adminNombre: currentUser.nombre
      });
      const msg = resolveModal.tipo === "usuario"
        ? `Solicitud resuelta. Usuario: ${resolveModal.email}`
        : `Solicitud resuelta. Clave temporal: ${clave}`;
      alert(msg);
      setResolveModal(null);
      setResolveRespuesta("");
    } catch (err) {
      alert(err.message);
    }
  };

  const openDetail = (user) => {
    setDetailUser(user);
    setEditNombre(user.nombre);
  };

  const saveNombre = async () => {
    if (!detailUser || editNombre === detailUser.nombre) return;
    try {
      await adminUpdateUser(detailUser.email, { nombre: editNombre });
      setDetailUser(prev => ({ ...prev, nombre: editNombre }));
      alert("Nombre actualizado correctamente.");
    } catch (err) {
      alert(err.message);
    }
  };

  const copyCredentials = (user, clave) => {
    const text = `Polaris Edu — Acceso\nUsuario: ${user.email}\n${clave ? `Clave: ${clave}\n` : ""}Nombre: ${user.nombre}`;
    navigator.clipboard?.writeText(text);
    alert("Datos copiados al portapapeles.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
        <div className="glass-card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>TOTAL USUARIOS</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 800 }}>{allUsers.length}</p>
        </div>
        <div className="glass-card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>ESTUDIANTES</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>{students.length}</p>
        </div>
        <div className="glass-card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>ACTIVOS</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)" }}>{activos}</p>
        </div>
        <div className="glass-card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>RECUPERACIONES</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--warning)" }}>{pendingRecoveries.length}</p>
        </div>
      </div>

      {/* Recovery requests */}
      <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <KeyRound size={22} style={{ color: "var(--warning)" }} />
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Solicitudes de Recuperación de Acceso</h3>
          {pendingRecoveries.length > 0 && <span className="badge badge-warning">{pendingRecoveries.length} pendientes</span>}
        </div>

        {recoveryRequests.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center", padding: "1rem" }}>
            Los jóvenes pueden solicitar ayuda desde la pantalla de inicio de sesión.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {recoveryRequests.map(req => (
              <div key={req.id} className="glass-card" style={{
                borderLeft: `4px solid ${req.estado === "pendiente" ? "var(--warning)" : "var(--accent)"}`,
                display: "flex", flexDirection: "column", gap: "0.75rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <span className={`badge ${req.estado === "pendiente" ? "badge-warning" : "badge-accent"}`} style={{ fontSize: "0.65rem" }}>
                      {req.estado === "pendiente" ? "Pendiente" : "Resuelto"}
                    </span>
                    <h4 style={{ fontWeight: 700, marginTop: "0.35rem" }}>{req.nombre}</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{req.email}</p>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <p>{req.fecha}</p>
                    <p style={{ fontWeight: 600, color: "var(--primary)", marginTop: "0.25rem" }}>
                      {req.tipo === "contrasena" && "🔑 Contraseña"}
                      {req.tipo === "usuario" && "👤 Usuario"}
                      {req.tipo === "ambos" && "🔑👤 Ambos"}
                    </p>
                  </div>
                </div>
                {req.mensaje && <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic" }}>"{req.mensaje}"</p>}
                {req.estado === "pendiente" && (
                  <button
                    onClick={() => {
                      setResolveModal(req);
                      setResolveRespuesta(
                        req.tipo === "usuario"
                          ? `Tu usuario de acceso es: ${req.email}. Usa este correo para ingresar a Polaris Edu.`
                          : "Hemos restablecido tu contraseña. Usa la clave temporal que te entregará tu orientador."
                      );
                    }}
                    className="btn btn-accent"
                    style={{ alignSelf: "flex-start", fontSize: "0.85rem", gap: "0.4rem" }}
                  >
                    <CheckCircle size={16} /> Atender solicitud
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User management */}
      <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={22} style={{ color: "var(--primary)" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Gestión de Juventud y Usuarios</h3>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ gap: "0.4rem", fontSize: "0.85rem" }}>
            <Plus size={16} /> Registrar estudiante
          </button>
        </div>

        <div style={{ position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%", color: "var(--text-muted)" }} />
          <input
            className="input-field"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "2.75rem" }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["Todos", "student", "teacher", "admin"].map(r => (
            <button key={r} onClick={() => setFilterRol(r)} className={`btn ${filterRol === r ? "btn-secondary" : "btn-glass"}`} style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", borderRadius: "20px" }}>
              {r === "Todos" ? "Todos" : ROL_LABELS[r]}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { id: "Todos", label: "Todos los estados" },
            { id: "activo", label: "Activos" },
            { id: "suspendido", label: "Suspendidos" },
            { id: "sin_test", label: "Sin test vocacional" },
            { id: "con_test", label: "Con perfil vocacional" }
          ].map(f => (
            <button key={f.id} onClick={() => setFilterEstado(f.id)} className={`btn ${filterEstado === f.id ? "btn-accent" : "btn-glass"}`} style={{ padding: "0.35rem 0.85rem", fontSize: "0.75rem", borderRadius: "20px" }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-secondary)" }}>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Nombre</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Correo</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Rol</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>XP / Nivel</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Estado</th>
                <th style={{ padding: "0.75rem", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.uid || user.email} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                  <td style={{ padding: "0.85rem", fontWeight: 600 }}>{user.nombre}</td>
                  <td style={{ padding: "0.85rem", color: "var(--text-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><Mail size={14} />{user.email}</span>
                  </td>
                  <td style={{ padding: "0.85rem" }}>
                    <span className="badge badge-glass" style={{ fontSize: "0.65rem" }}>{ROL_LABELS[user.rol]}</span>
                  </td>
                  <td style={{ padding: "0.85rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {user.rol === "student" ? `${user.xp || 0} XP · Lvl ${user.nivel || 1}` : "—"}
                  </td>
                  <td style={{ padding: "0.85rem" }}>
                    <span className={`badge ${user.estado === "suspendido" ? "badge-danger" : "badge-accent"}`} style={{ fontSize: "0.65rem" }}>
                      {user.estado || "activo"}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.35rem", justifyContent: "flex-end" }}>
                      <button onClick={() => openDetail(user)} className="btn btn-glass" style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem" }} title="Ver detalle">
                        <Eye size={12} />
                      </button>
                      {user.rol !== "admin" && (
                        <>
                          <button onClick={() => handleResetPassword(user.email, user.nombre)} className="btn btn-glass" style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem" }} title="Restablecer clave">
                            <KeyRound size={12} />
                          </button>
                          <button onClick={() => handleToggleStatus(user.email, user.nombre, user.estado || "activo")} className="btn btn-glass" style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem" }} title="Suspender/reactivar">
                            <Shield size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <AlertCircle size={14} style={{ display: "inline", verticalAlign: "middle" }} />
          {" "}Mostrando {filteredUsers.length} de {allUsers.length} usuarios · {suspendidos} suspendidos
        </p>
      </div>

      {/* User detail modal */}
      {detailUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="glass-panel animate-fade-in" style={{ width: "100%", maxWidth: "520px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Perfil del usuario</h3>
              <button onClick={() => setDetailUser(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.25rem"
              }}>
                {detailUser.nombre.charAt(0)}
              </div>
              <div>
                <span className={`badge ${detailUser.estado === "suspendido" ? "badge-danger" : "badge-accent"}`}>{detailUser.estado || "activo"}</span>
                <p style={{ fontWeight: 700, marginTop: "0.25rem" }}>{detailUser.email}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{ROL_LABELS[detailUser.rol]}</p>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.4rem" }}>
                <Edit3 size={14} /> Editar nombre
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input className="input-field" value={editNombre} onChange={e => setEditNombre(e.target.value)} />
                <button onClick={saveNombre} className="btn btn-glass" style={{ fontSize: "0.8rem" }}>Guardar</button>
              </div>
            </div>

            {/* Datos de registro adicionales */}
            <div className="glass-card" style={{ padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Edad / Sexo:</span>
                <strong>{detailUser.edad ? `${detailUser.edad} años` : "No especificado"} / {detailUser.sexo || "N/A"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Teléfono:</span>
                <strong>{detailUser.telefono || "No registrado"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Número de Cédula:</span>
                <strong>{detailUser.cedula || "No registrada"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Nacionalidad:</span>
                <strong>{detailUser.nacionalidad || "Nicaragüense"}</strong>
              </div>
            </div>

            {detailUser.rol === "student" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="glass-card" style={{ textAlign: "center", padding: "1rem" }}>
                    <Zap size={18} style={{ color: "var(--primary)" }} />
                    <p style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: "0.35rem" }}>{detailUser.xp || 0}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>XP · Nivel {detailUser.nivel || 1}</p>
                  </div>
                  <div className="glass-card" style={{ textAlign: "center", padding: "1rem" }}>
                    <Flame size={18} style={{ color: "#f59e0b" }} />
                    <p style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: "0.35rem" }}>{detailUser.streak?.count || 0}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Días de racha</p>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: "1rem" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.5rem" }}>
                    <Compass size={16} /> Perfil vocacional
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {detailUser.talentProfile?.perfilTop || "Aún no ha completado el test vocacional"}
                  </p>
                </div>

                <div className="glass-card" style={{ padding: "1rem" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.5rem" }}>
                    <Gamepad2 size={16} /> Juegos completados ({(detailUser.gamesCompleted || []).length}/{GAMES.length})
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {GAMES.map(g => (
                      <span key={g.id} className={`badge ${(detailUser.gamesCompleted || []).includes(g.id) ? "badge-accent" : "badge-glass"}`} style={{ fontSize: "0.65rem" }}>
                        {g.emoji} {g.titulo}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {detailUser.rol !== "admin" && (
                <>
                  <button onClick={() => handleResetPassword(detailUser.email, detailUser.nombre)} className="btn btn-glass" style={{ fontSize: "0.8rem", gap: "0.35rem" }}>
                    <KeyRound size={14} /> Restablecer clave
                  </button>
                  <button onClick={() => copyCredentials(detailUser, detailUser.lastClave)} className="btn btn-glass" style={{ fontSize: "0.8rem", gap: "0.35rem" }}>
                    <Copy size={14} /> Copiar acceso
                  </button>
                  <button onClick={() => handleToggleStatus(detailUser.email, detailUser.nombre, detailUser.estado || "activo")} className="btn btn-glass" style={{ fontSize: "0.8rem", gap: "0.35rem" }}>
                    <Shield size={14} /> {detailUser.estado === "suspendido" ? "Reactivar" : "Suspender"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create student modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <form onSubmit={handleCreateStudent} className="glass-panel animate-fade-in" style={{ width: "100%", maxWidth: "480px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Registrar nuevo estudiante</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Nombre completo</label>
              <input className="input-field" value={newNombre} onChange={e => setNewNombre(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Correo (usuario de acceso)</label>
              <input type="email" className="input-field" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" className="btn btn-glass" onClick={() => setShowCreateModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ gap: "0.4rem" }}><UserCheck size={16} /> Crear cuenta</button>
            </div>
          </form>
        </div>
      )}

      {/* Resolve recovery modal */}
      {resolveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <form onSubmit={handleResolve} className="glass-panel animate-fade-in" style={{ width: "100%", maxWidth: "500px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Atender recuperación</h3>
              <button type="button" onClick={() => setResolveModal(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}><strong>{resolveModal.nombre}</strong> — {resolveModal.email}</p>
            {(resolveModal.tipo === "contrasena" || resolveModal.tipo === "ambos") && (
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Nueva clave temporal</label>
                <input className="input-field" value={resolveClave} onChange={e => setResolveClave(e.target.value)} required />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Mensaje para el estudiante</label>
              <textarea className="input-field" rows="3" value={resolveRespuesta} onChange={e => setResolveRespuesta(e.target.value)} required style={{ resize: "none" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" className="btn btn-glass" onClick={() => setResolveModal(null)}>Cancelar</button>
              <button type="submit" className="btn btn-accent">Marcar como resuelto</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
