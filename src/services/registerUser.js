import { supabase } from "../supaBase/supaBase";

export async function registerUser({ nombreCompleto, correo, password }) {
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password,
    options: {
      data: { name: nombreCompleto }
    }
  });

  if (error) return { ok: false, error: error.message };

  return { ok: true, email: correo };
}