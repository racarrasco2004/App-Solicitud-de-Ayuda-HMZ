import type { Usuario } from '@/types'

/**
 * Usuarios de demostración del inicio de sesión SIMULADO.
 * ⚠️ Se eliminan cuando se conecte el inicio de sesión real con Microsoft (Entra ID).
 */
export const usuariosDemo: Usuario[] = [
  { correo: 'solicitante@ucchristus.cl', nombre: 'Solicitante Demo', rol: 'solicitante' },
  { correo: 'coordinador@ucchristus.cl', nombre: 'Coordinador Demo', rol: 'coordinador' },
  { correo: 'admin@ucchristus.cl', nombre: 'Administrador Demo', rol: 'administrador' },
]

export const DOMINIO_CORREO = '@ucchristus.cl'
