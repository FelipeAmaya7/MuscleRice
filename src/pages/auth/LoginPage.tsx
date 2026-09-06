import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '@/styles/pages/_auth.css';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type AuthStep = 'email' | 'otp';

// ─────────────────────────────────────────────────────────────────────────────
// OTP Input Component — 6 dígitos con auto-focus
// ─────────────────────────────────────────────────────────────────────────────
interface OtpInputProps {
  value: string[];
  onChange: (otp: string[]) => void;
  disabled?: boolean;
}

function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    // Solo aceptar dígitos
    if (char && !/^\d$/.test(char)) return;

    const next = [...value];
    next[index] = char;
    onChange(next);

    // Auto-focus al siguiente input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const next = [...value];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    onChange(next);

    // Focus en el último dígito pegado
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="otp-container" onPaste={handlePaste}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className={`otp-input ${digit ? 'otp-input--filled' : ''}`}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          autoFocus={i === 0}
          id={`otp-digit-${i}`}
          aria-label={`Dígito ${i + 1} del código`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LoginPage — Flujo unificado de 2 pasos
// ─────────────────────────────────────────────────────────────────────────────
function LoginPage() {
  const { sendOtp, verifyOtp, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));

  // Resend timer
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Auth-page body class
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Start resend countdown ──
  const startResendTimer = useCallback(() => {
    setResendTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Step 1: Submit email ──
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);

    try {
      await sendOtp(email);
      setStep('otp');
      startResendTimer();
    } catch {
      // Error already set in context
    }
  };

  // ── Step 2: Submit OTP ──
  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    const code = otp.join('');
    if (code.length !== 6) return;

    try {
      await verifyOtp(email, code);
      // Navigation handled by isAuthenticated effect
    } catch {
      // Error displayed from context, clear the OTP inputs
      setOtp(Array(6).fill(''));
    }
  };

  // ── Auto-submit when 6 digits are filled ──
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && step === 'otp' && !loading) {
      verifyOtp(email, code).catch(() => {
        setOtp(Array(6).fill(''));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // ── Resend OTP ──
  const handleResend = async () => {
    if (resendTimer > 0 || loading) return;
    clearError();
    setOtp(Array(6).fill(''));
    try {
      await sendOtp(email);
      startResendTimer();
    } catch {
      // handled
    }
  };

  // ── Go back to email step ──
  const handleBackToEmail = () => {
    setStep('email');
    setOtp(Array(6).fill(''));
    clearError();
  };

  return (
    <>
      <Link to="/" className="auth-back-btn" id="btn-back">
        <i className="fa-solid fa-arrow-left"></i>
        Regresar
      </Link>

      <div className="auth-card" id="login-card">
        <img
          src="/img/logo-musclerice..webp"
          alt="MuscleRice Logo"
          className="auth-logo"
          id="auth-logo"
        />

        {/* ─── STEP 1: EMAIL ─── */}
        {step === 'email' && (
          <div className="auth-step" key="step-email">
            <h1 className="auth-title">Iniciar sesión</h1>
            <p className="auth-subtitle">
              Ingresa tu correo electrónico y te enviaremos un código de verificación.
            </p>

            {error && (
              <div className="alert alert-danger">
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
                {error}
              </div>
            )}

            <form id="emailForm" noValidate onSubmit={handleEmailSubmit}>
              <div className="auth-field" id="field-email">
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                <i className="fa-solid fa-envelope field-icon"></i>
                <span
                  className={`field-error ${emailError ? 'visible' : ''}`}
                  id="error-email"
                >
                  Ingresa un correo electrónico válido
                </span>
              </div>

              <button
                type="submit"
                className={`auth-btn ${loading ? 'loading' : ''}`}
                id="btn-continue"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span className="btn-loading-text">Enviando...</span>
                  </>
                ) : (
                  <span className="btn-text">Continuar</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ─── STEP 2: OTP ─── */}
        {step === 'otp' && (
          <div className="auth-step" key="step-otp">
            <div className="otp-header">
              <div className="otp-icon-wrap" aria-hidden="true">
                <i className="fa-solid fa-envelope-circle-check"></i>
              </div>
              <h1 className="auth-title">Verifica tu correo</h1>
              <p className="auth-subtitle">
                Enviamos un código de 6 dígitos a{' '}
                <strong className="otp-email-highlight">{email}</strong>
              </p>
            </div>

            {error && (
              <div className="alert alert-danger">
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
                {error}
              </div>
            )}

            <form id="otpForm" noValidate onSubmit={handleOtpSubmit}>
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />

              <button
                type="submit"
                className={`auth-btn ${loading ? 'loading' : ''}`}
                id="btn-verify"
                disabled={loading || otp.join('').length !== 6}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span className="btn-loading-text">Verificando...</span>
                  </>
                ) : (
                  <span className="btn-text">Verificar código</span>
                )}
              </button>
            </form>

            <div className="otp-actions">
              <button
                type="button"
                className="otp-resend"
                onClick={handleResend}
                disabled={resendTimer > 0 || loading}
                id="btn-resend-otp"
              >
                {resendTimer > 0
                  ? `Reenviar código en ${resendTimer}s`
                  : '¿No recibiste el código? Reenviar'}
              </button>

              <button
                type="button"
                className="otp-back"
                onClick={handleBackToEmail}
                id="btn-back-email"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Usar otro correo
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default LoginPage;
