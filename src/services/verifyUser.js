import { supabase } from "../supaBase/supaBase";

export async function verifyUser({ correo, codigo, nombreCompleto }) {
  // 1️⃣ Verificar el código OTP → esto activa la sesión
  const { data, error } = await supabase.auth.verifyOtp({
    email: correo,
    token: codigo,
    type: "signup"
  });

  if (error) return { ok: false, error: "Código incorrecto o expirado" };

  const user = data.user;
  if (!user) return { ok: false, error: "No se pudo verificar el usuario" };

  // 2️⃣ Ahora SÍ hay sesión activa → auth.uid() coincide → policy pasa ✅
  const { error: insertError } = await supabase
    .from("usuarios")
    .insert({
      auth_user_id: user.id,
      correo: correo,
      nombre_completo: nombreCompleto,
      id_rol_fk: 2,
      id_estado_fk: 1
    });

  if (insertError) {
    console.error("Error insertando perfil:", insertError);
    return { ok: false, error: "Error al crear el perfil interno" };
  }

  return { ok: true, user };
}