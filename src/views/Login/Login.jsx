import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { submitRecoveryRequest } from "../../firebase/services";
import { ArrowRight, HelpCircle, CheckCircle, ShieldCheck, Mail, Phone, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import logoImg from "../../assets/logoz.png";

export default function Login() {
  const { login, register } = useAuth();
  
  // View states
  const [isRegister, setIsRegister] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("student");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("Seleccionar");
  const [telefono, setTelefono] = useState("");
  const [cedula, setCedula] = useState("");
  const [nacionalidad, setNacionalidad] = useState("Nicaragüense");
  
  // Recovery states - NEW MULTI-STEP CODE VERIFICATION
  const [recoveryStep, setRecoveryStep] = useState(1); // 1=email, 2=code, 3=newPassword, 4=success
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryCodeInput, setRecoveryCodeInput] = useState(["", "", "", "", "", ""]);
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");
  const [recoveryUserInfo, setRecoveryUserInfo] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Status states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        const extraData = { edad, sexo, telefono, cedula, nacionalidad };
        await register(nombre, email, password, rol, extraData);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error en la autenticación.");
    } finally {
      setLoading(false);
    }
  };

  // ===== RECOVERY STEP 1: Find account by email =====
  const handleRecoveryStep1 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const normalizedEmail = recoveryEmail.toLowerCase().trim();
      if (!normalizedEmail) throw new Error("Ingresa tu correo electrónico.");

      // Search user in localStorage (robust: check all keys case-insensitive, also check email field)
      const users = JSON.parse(localStorage.getItem("polaris_users")) || {};
      let userKey = Object.keys(users).find(k => k.toLowerCase().trim() === normalizedEmail);
      
      // If not found by key, search by email field inside each user object
      if (!userKey) {
        userKey = Object.keys(users).find(k => {
          const u = users[k];
          return u && u.email && u.email.toLowerCase().trim() === normalizedEmail;
        });
      }

      if (!userKey) throw new Error("No existe una cuenta registrada con ese correo. Verifica que esté bien escrito.");
      
      const user = users[userKey];
      setRecoveryUserInfo(user);

      // Generate 6-digit verification code
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setRecoveryCode(code);

      // Store code temporarily in localStorage with expiry (5 minutes)
      const codeData = {
        code,
        email: normalizedEmail,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0
      };
      localStorage.setItem("polaris_recovery_code", JSON.stringify(codeData));

      const maskedPhone = user.telefono 
        ? user.telefono.replace(/(\d{3})\d+(\d{2})/, "$1****$2")
        : "no registrado";
      const maskedEmail = normalizedEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3");

      // Show the code (in production: send via EmailJS / Twilio SMS)
      alert(
        `🔐 CÓDIGO DE VERIFICACIÓN ZYNATRA\n\n` +
        `Se ha enviado el código de verificación a:\n` +
        `📧 Correo: ${maskedEmail}\n` +
        `📱 Teléfono: ${maskedPhone}\n\n` +
        `Tu código es: ${code}\n\n` +
        `⏱️ El código expira en 5 minutos.`
      );

      setRecoveryStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== RECOVERY STEP 2: Verify code =====
  const handleRecoveryStep2 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const enteredCode = recoveryCodeInput.join("");
      if (enteredCode.length !== 6) throw new Error("Ingresa el código completo de 6 dígitos.");

      const codeData = JSON.parse(localStorage.getItem("polaris_recovery_code"));
      if (!codeData) throw new Error("No hay un código de verificación activo. Solicita uno nuevo.");

      // Check expiry
      if (Date.now() > codeData.expiresAt) {
        localStorage.removeItem("polaris_recovery_code");
        throw new Error("El código ha expirado. Solicita uno nuevo.");
      }

      // Check attempts (max 5)
      if (codeData.attempts >= 5) {
        localStorage.removeItem("polaris_recovery_code");
        throw new Error("Demasiados intentos fallidos. Solicita un nuevo código.");
      }

      // Validate code
      if (enteredCode !== codeData.code) {
        codeData.attempts += 1;
        localStorage.setItem("polaris_recovery_code", JSON.stringify(codeData));
        throw new Error(`Código incorrecto. Te quedan ${5 - codeData.attempts} intentos.`);
      }

      // Code is valid!
      setRecoveryStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== RECOVERY STEP 3: Set new password =====
  const handleRecoveryStep3 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (recoveryNewPassword.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
      if (recoveryNewPassword !== recoveryConfirmPassword) throw new Error("Las contraseñas no coinciden.");

      const normalizedEmail = recoveryEmail.toLowerCase().trim();
      const users = JSON.parse(localStorage.getItem("polaris_users")) || {};
      const userKey = Object.keys(users).find(k => k.toLowerCase() === normalizedEmail);

      if (!userKey) throw new Error("Error al localizar la cuenta.");

      // Update password
      users[userKey].contrasena = recoveryNewPassword;
      localStorage.setItem("polaris_users", JSON.stringify(users));

      // Clean up recovery code
      localStorage.removeItem("polaris_recovery_code");

      setRecoveryStep(4); // Success!
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle individual code digit input
  const handleCodeDigitChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...recoveryCodeInput];
    newCode[index] = value;
    setRecoveryCodeInput(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !recoveryCodeInput[index] && index > 0) {
      const prevInput = document.getElementById(`code-digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste of full code
  const handleCodePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedText.length === 6) {
      setRecoveryCodeInput(pastedText.split(""));
      const lastInput = document.getElementById("code-digit-5");
      if (lastInput) lastInput.focus();
    }
  };

  // Resend code
  const handleResendCode = () => {
    setRecoveryCodeInput(["", "", "", "", "", ""]);
    setError("");
    setRecoveryStep(1);
  };

  // Reset recovery flow
  const resetRecovery = () => {
    setShowRecovery(false);
    setRecoveryStep(1);
    setRecoveryEmail("");
    setRecoveryCode("");
    setRecoveryCodeInput(["", "", "", "", "", ""]);
    setRecoveryNewPassword("");
    setRecoveryConfirmPassword("");
    setRecoveryUserInfo(null);
    setError("");
    setShowNewPassword(false);
  };

  const styles = {
    outerWrapper: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f5f0e8',
      zIndex: 9999,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    },
    container: {
      minHeight: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      boxSizing: 'border-box',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    },
    cardWrapper: {
      width: '100%',
      maxWidth: '420px',
      display: 'flex',
      flexDirection: 'column'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '2rem',
      width: '100%',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
      boxSizing: 'border-box',
      borderTop: '4px solid #5bbfbf',
      borderBottom: '4px solid #5bbfbf'
    },
    logoContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '0.5rem'
    },
    title: {
      color: '#5bbfbf',
      fontSize: '1.8rem',
      fontWeight: '800',
      textAlign: 'center',
      margin: '0 0 0.5rem 0',
      letterSpacing: '1px'
    },
    recoveryTitle: {
      color: '#5bbfbf',
      fontSize: '1.4rem',
      fontWeight: '700',
      textAlign: 'center',
      margin: '0 0 0.5rem 0'
    },
    tagline: {
      color: '#636e72',
      fontSize: '0.85rem',
      textAlign: 'center',
      marginBottom: '1.5rem',
      lineHeight: '1.4'
    },
    recoverySubtitle: {
      color: '#636e72',
      fontSize: '0.85rem',
      textAlign: 'center',
      marginBottom: '1.5rem',
      lineHeight: '1.4',
      fontWeight: '500'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '1rem',
      width: '100%'
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      gap: '1rem',
      marginBottom: '1rem',
      width: '100%',
      flexWrap: 'wrap'
    },
    col: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    },
    label: {
      color: '#2d3436',
      fontSize: '0.8rem',
      marginBottom: '0.4rem',
      fontWeight: '600',
      paddingLeft: '0.5rem'
    },
    input: {
      backgroundColor: '#e8e8e8',
      border: 'none',
      borderRadius: '25px',
      padding: '0.75rem 1.25rem',
      fontSize: '16px',
      color: '#2d3436',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none'
    },
    select: {
      backgroundColor: '#e8e8e8',
      border: 'none',
      borderRadius: '25px',
      padding: '0.75rem 1.25rem',
      paddingRight: '2.5rem',
      fontSize: '16px',
      color: '#2d3436',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%235bbfbf\' stroke-width=\'2\' fill=\'none\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1.25rem center',
      backgroundSize: '12px'
    },
    textarea: {
      backgroundColor: '#e8e8e8',
      border: 'none',
      borderRadius: '16px',
      padding: '0.75rem 1.25rem',
      fontSize: '16px',
      color: '#2d3436',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box',
      minHeight: '80px',
      resize: 'vertical',
      fontFamily: 'inherit',
      WebkitAppearance: 'none'
    },
    primaryBtn: {
      backgroundColor: '#5bbfbf',
      color: '#ffffff',
      border: 'none',
      borderRadius: '25px',
      padding: '0.85rem 1.5rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      marginTop: '1rem',
      boxSizing: 'border-box',
      WebkitAppearance: 'none'
    },
    cancelBtn: {
      backgroundColor: '#f0edeb',
      color: '#5bbfbf',
      border: 'none',
      borderRadius: '25px',
      padding: '0.85rem 1.5rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      marginTop: '0.5rem',
      boxSizing: 'border-box',
      WebkitAppearance: 'none'
    },
    tealLink: {
      color: '#5bbfbf',
      textAlign: 'center',
      display: 'block',
      marginTop: '1.25rem',
      fontSize: '0.9rem',
      cursor: 'pointer',
      fontWeight: '600',
      background: 'none',
      border: 'none',
      width: '100%',
      padding: '0.5rem 0'
    },
    darkLink: {
      color: '#2c3e50',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.4rem',
      marginTop: '0.75rem',
      fontSize: '0.85rem',
      cursor: 'pointer',
      fontWeight: '600',
      background: 'none',
      border: 'none',
      width: '100%',
      padding: '0.5rem 0'
    },
    errorBox: {
      backgroundColor: '#fdecea',
      color: '#e74c3c',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      fontSize: '0.85rem',
      marginBottom: '1rem',
      textAlign: 'center',
      fontWeight: '500'
    },
    successBox: {
      backgroundColor: '#e8f8f5',
      color: '#1abc9c',
      padding: '1.5rem',
      borderRadius: '12px',
      fontSize: '0.95rem',
      marginBottom: '1rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
      fontWeight: '500'
    },
    // Code input digit box
    codeDigit: {
      width: '48px',
      height: '56px',
      textAlign: 'center',
      fontSize: '1.5rem',
      fontWeight: '800',
      borderRadius: '14px',
      border: '2px solid #e0e0e0',
      backgroundColor: '#f8f8f8',
      color: '#2d3436',
      outline: 'none',
      caretColor: '#5bbfbf',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none'
    },
    codeDigitFocused: {
      borderColor: '#5bbfbf',
      boxShadow: '0 0 0 3px rgba(91, 191, 191, 0.2)'
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      marginBottom: '1.5rem'
    },
    stepDot: (active) => ({
      width: active ? '24px' : '8px',
      height: '8px',
      borderRadius: '4px',
      backgroundColor: active ? '#5bbfbf' : '#e0e0e0',
      transition: 'all 0.3s ease'
    }),
    infoCard: {
      backgroundColor: '#f0fafa',
      border: '1px solid rgba(91, 191, 191, 0.3)',
      borderRadius: '14px',
      padding: '1rem',
      marginBottom: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.8rem',
      color: '#4a5568'
    },
    passwordToggle: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#9ca3af',
      padding: '0.25rem',
      display: 'flex',
      alignItems: 'center'
    }
  };

  const renderLogoAndHeader = () => (
    <>
      <div style={styles.logoContainer}>
        <img 
          src={logoImg} 
          alt="Zynatra Logo" 
          style={{ width: '84px', height: '84px', objectFit: 'contain', display: 'block', margin: '0 auto' }} 
        />
      </div>
      <h1 style={styles.title}>ZYNATRA</h1>
      <p style={styles.tagline}>
        El futuro no se espera, se crea! Tu viaje hacia lo que amas empieza hoy.
      </p>
    </>
  );

  // ===== VIEW 3: MULTI-STEP RECOVERY =====
  if (showRecovery) {
    return (
      <div style={styles.outerWrapper}>
      <div style={styles.container}>
        <div style={styles.cardWrapper}>
          <div style={styles.card}>
            {renderLogoAndHeader()}
            
            {/* Step Indicator */}
            <div style={styles.stepIndicator}>
              {[1, 2, 3].map(s => (
                <div key={s} style={styles.stepDot(recoveryStep >= s)} />
              ))}
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}
            
            {/* STEP 1: Enter email */}
            {recoveryStep === 1 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f0fafa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                    <ShieldCheck size={28} color="#5bbfbf" />
                  </div>
                  <h2 style={styles.recoveryTitle}>Recuperar mi Contraseña</h2>
                  <p style={styles.recoverySubtitle}>
                    Ingresa el correo electrónico con el que te registraste. Te enviaremos un código de verificación.
                  </p>
                </div>

                <form onSubmit={handleRecoveryStep1}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Correo electrónico registrado</label>
                    <input
                      type="email"
                      style={styles.input}
                      placeholder="tu-correo@ejemplo.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <button type="submit" style={styles.primaryBtn} disabled={loading}>
                    {loading ? "Buscando cuenta..." : "Enviar código de verificación"} <ArrowRight size={18} />
                  </button>
                  <button type="button" style={styles.cancelBtn} onClick={resetRecovery}>
                    Cancelar
                  </button>
                </form>
              </>
            )}

            {/* STEP 2: Enter verification code */}
            {recoveryStep === 2 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f0fafa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                    <KeyRound size={28} color="#5bbfbf" />
                  </div>
                  <h2 style={styles.recoveryTitle}>Ingresa el Código</h2>
                  <p style={styles.recoverySubtitle}>
                    Hemos enviado un código de 6 dígitos a tu correo y teléfono registrado.
                  </p>
                </div>

                {/* Info card showing where code was sent */}
                <div style={styles.infoCard}>
                  <div style={styles.infoRow}>
                    <Mail size={16} color="#5bbfbf" />
                    <span>Código enviado a: <strong>{recoveryEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")}</strong></span>
                  </div>
                  {recoveryUserInfo?.telefono && (
                    <div style={styles.infoRow}>
                      <Phone size={16} color="#5bbfbf" />
                      <span>SMS enviado a: <strong>{recoveryUserInfo.telefono.replace(/(\d{3})\d+(\d{2})/, "$1****$2")}</strong></span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleRecoveryStep2}>
                  {/* 6-digit code input */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(6px, 2vw, 10px)', marginBottom: '1.25rem' }}>
                    {recoveryCodeInput.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`code-digit-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleCodePaste : undefined}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#5bbfbf';
                          e.target.style.boxShadow = '0 0 0 3px rgba(91, 191, 191, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.boxShadow = 'none';
                        }}
                        style={styles.codeDigit}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  <button type="submit" style={styles.primaryBtn} disabled={loading}>
                    {loading ? "Verificando..." : "Verificar código"} <ShieldCheck size={18} />
                  </button>

                  <button type="button" style={{ ...styles.tealLink, marginTop: '1rem', fontSize: '0.8rem' }} onClick={handleResendCode}>
                    ¿No recibiste el código? Reenviar código
                  </button>

                  <button type="button" style={styles.cancelBtn} onClick={resetRecovery}>
                    Cancelar
                  </button>
                </form>
              </>
            )}

            {/* STEP 3: New password */}
            {recoveryStep === 3 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e8f8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                    <Lock size={28} color="#10b981" />
                  </div>
                  <h2 style={styles.recoveryTitle}>Nueva Contraseña</h2>
                  <p style={styles.recoverySubtitle}>
                    ¡Código verificado con éxito! Ahora establece tu nueva contraseña.
                  </p>
                </div>

                <form onSubmit={handleRecoveryStep3}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Nueva contraseña (mínimo 6 caracteres)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        style={{ ...styles.input, paddingRight: '3rem' }}
                        placeholder="••••••••"
                        value={recoveryNewPassword}
                        onChange={(e) => setRecoveryNewPassword(e.target.value)}
                        required
                        minLength={6}
                        autoFocus
                      />
                      <button type="button" style={styles.passwordToggle} onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Confirmar nueva contraseña</label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      style={styles.input}
                      placeholder="••••••••"
                      value={recoveryConfirmPassword}
                      onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  {/* Password strength indicator */}
                  {recoveryNewPassword && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ height: '4px', borderRadius: '2px', backgroundColor: '#e8e8e8', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease',
                          width: recoveryNewPassword.length >= 10 ? '100%' : recoveryNewPassword.length >= 8 ? '75%' : recoveryNewPassword.length >= 6 ? '50%' : '25%',
                          backgroundColor: recoveryNewPassword.length >= 10 ? '#10b981' : recoveryNewPassword.length >= 8 ? '#f59e0b' : recoveryNewPassword.length >= 6 ? '#f59e0b' : '#ef4444'
                        }} />
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.3rem', textAlign: 'right' }}>
                        {recoveryNewPassword.length >= 10 ? '🟢 Contraseña fuerte' : recoveryNewPassword.length >= 6 ? '🟡 Contraseña aceptable' : '🔴 Muy corta'}
                      </p>
                    </div>
                  )}

                  <button type="submit" style={styles.primaryBtn} disabled={loading}>
                    {loading ? "Guardando..." : "Guardar nueva contraseña"} <CheckCircle size={18} />
                  </button>
                  <button type="button" style={styles.cancelBtn} onClick={resetRecovery}>
                    Cancelar
                  </button>
                </form>
              </>
            )}

            {/* STEP 4: Success */}
            {recoveryStep === 4 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#e8f8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <CheckCircle size={40} color="#10b981" />
                </div>
                <h2 style={{ ...styles.recoveryTitle, color: '#10b981' }}>¡Contraseña Actualizada!</h2>
                <p style={styles.recoverySubtitle}>
                  Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>

                <div style={{
                  backgroundColor: '#f0fafa',
                  border: '1px solid rgba(91,191,191,0.3)',
                  borderRadius: '14px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  textAlign: 'left'
                }}>
                  <p style={{ fontSize: '0.8rem', color: '#4a5568', marginBottom: '0.5rem' }}>
                    <strong>📧 Correo:</strong> {recoveryEmail}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Recuerda guardar tu nueva contraseña en un lugar seguro.
                  </p>
                </div>

                <button style={styles.primaryBtn} onClick={() => { resetRecovery(); }}>
                  Ir a Iniciar Sesión <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    );
  }

  // VIEW 1 & 2: LOGIN & REGISTER
  return (
    <div style={styles.outerWrapper}>
    <div style={styles.container}>
      <div style={styles.cardWrapper}>
        <div style={styles.card}>
          {renderLogoAndHeader()}

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Correo Electrónico</label>
              <input
                type="email"
                style={styles.input}
                placeholder="tu-correo@persola.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  style={{ ...styles.input, paddingRight: '3rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nombre y apellido</label>
                  <input
                    type="text"
                    style={{...styles.input, color: nombre ? '#2d3436' : '#5bbfbf'}}
                    placeholder="Ejem.jose luis"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nivel de estudio</label>
                  <select 
                    style={styles.select}
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                  >
                    <option value="student">Estudiante(primaria/secundaria)</option>
                    <option value="teacher">Docente / Profesor</option>
                  </select>
                </div>

                <div style={styles.row}>
                  <div style={styles.col}>
                    <label style={styles.label}>Edad</label>
                    <input
                      type="number"
                      style={styles.input}
                      placeholder="••••••••"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      required
                    />
                  </div>
                  <div style={styles.col}>
                    <label style={styles.label}>Sexo</label>
                    <select 
                      style={styles.select}
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value)}
                      required
                    >
                      <option value="Seleccionar">Seleccionar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Numero de Telefono</label>
                  <input
                    type="tel"
                    style={{...styles.input, color: telefono ? '#2d3436' : '#5bbfbf'}}
                    placeholder="505+5824-8955"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Numero de Cédula</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="••••••••"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nacionalidad</label>
                  <select 
                    style={styles.select}
                    value={nacionalidad}
                    onChange={(e) => setNacionalidad(e.target.value)}
                    required
                  >
                    <option value="Nicaragüense">Nicaragüense</option>
                    <option value="Costarricense">Costarricense</option>
                    <option value="Hondureña">Hondureña</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </>
            )}

            <button type="submit" style={styles.primaryBtn} disabled={loading}>
              {loading ? "Procesando..." : "Ingresar"} <ArrowRight size={18} />
            </button>
          </form>

          <button 
            type="button" 
            style={styles.tealLink} 
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate aquí"}
          </button>

          {!isRegister && (
            <button 
              type="button"
              style={styles.darkLink}
              onClick={() => setShowRecovery(true)}
            >
              <HelpCircle size={16} /> ¿Olvidaste tu contraseña o usuario?
            </button>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
