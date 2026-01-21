import { supabase } from "../supaBase/supaBase";

export async function registerUser({ nombreCompleto, correo, password }) {

  // 1️⃣ Crear usuario en Auth primero
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: correo,
    password,
    options: {
      data: { name: nombreCompleto }
    }
  });

  if (authError) {
    return { ok: false, error: authError.message };
  }

  const user = authData.user;

  if (!user) {
    return { ok: false, error: "No se pudo obtener el usuario después del registro" };
  }

  const uid = user.id;

  // 2️⃣ Insertar el perfil en tabla usuarios
  // 🔥 Ahora auth.uid() SI coincide con uid
  const { error: insertError } = await supabase
    .from("usuarios")
    .insert({
      correo,
      nombre_completo: nombreCompleto,
      auth_user_id: uid,
      id_rol_fk: 2,
      id_estado_fk: 1
    });

  if (insertError) {
    console.error("Error de perfil:", insertError);
    return { ok: false, error: "Error al crear el perfil interno" };
  }

  return { ok: true, user };
}
