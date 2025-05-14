import { supabase } from './supabaseClient'

export async function validarUsuario(usuario: string, contraseña: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('usuario', usuario)
    .eq('contraseña', contraseña)
    .single()

  if (error || !data) return null

  return {
    usuario: data.usuario,
    rol: data.rol
  }
}
