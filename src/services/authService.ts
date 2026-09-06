import { User } from '../types';
// import { supabase } from './supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const delay = <T,>(data: T, ms = 1200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

// Código mock fijo para desarrollo — el usuario ingresa este código para pasar
const MOCK_OTP = '123456';

// ─────────────────────────────────────────────────────────────────────────────
// sendOtp — Envía el código OTP al correo del usuario
// ─────────────────────────────────────────────────────────────────────────────
export const sendOtp = async (email: string): Promise<void> => {
  // ── Supabase real (descomentar cuando conectes tu proyecto) ──
  // const { error } = await supabase.auth.signInWithOtp({ email });
  // if (error) throw new Error(error.message);

  // ── Mock para desarrollo ──
  console.log(`📧 OTP mock enviado a: ${email} → Código: ${MOCK_OTP}`);
  await delay(undefined, 800);
};

// ─────────────────────────────────────────────────────────────────────────────
// verifyOtp — Verifica el código OTP ingresado por el usuario
// ─────────────────────────────────────────────────────────────────────────────
export const verifyOtp = async (email: string, token: string): Promise<User> => {
  // ── Supabase real (descomentar cuando conectes tu proyecto) ──
  // const { data, error } = await supabase.auth.verifyOtp({
  //   email,
  //   token,
  //   type: 'email',
  // });
  // if (error) throw new Error(error.message);
  // const sbUser = data.user;
  // return {
  //   id: sbUser?.id || '',
  //   name: sbUser?.user_metadata?.name || email.split('@')[0],
  //   email: sbUser?.email || email,
  //   role: 'customer',
  // };

  // ── Mock para desarrollo ──
  if (token !== MOCK_OTP) {
    throw new Error('Código incorrecto. Intenta de nuevo.');
  }

  return delay<User>({
    id: 'usr-' + Math.random().toString(36).substring(2, 11),
    name: email.split('@')[0],
    email,
    role: 'customer',
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// logout — Cierra la sesión
// ─────────────────────────────────────────────────────────────────────────────
export const apiLogout = async (): Promise<void> => {
  // ── Supabase real ──
  // await supabase.auth.signOut();

  // ── Mock ──
  console.log('🚪 Sesión cerrada (mock)');
};
