/**
 * Datos de la app registrada en Microsoft Entra ID (los entrega TI).
 * Se ponen en un archivo .env.local (ver .env.example). Si faltan, el portal funciona
 * en MODO DEMOSTRACIÓN con el inicio de sesión simulado.
 */
const clientId = (import.meta.env.VITE_ENTRA_CLIENT_ID as string | undefined)?.trim() ?? ''
const tenantId = (import.meta.env.VITE_ENTRA_TENANT_ID as string | undefined)?.trim() ?? ''

export const MICROSOFT_ACTIVO = Boolean(clientId && tenantId)
export const ENTRA = { clientId, tenantId }

/**
 * Correos que siempre entran como administrador (para poder dar los primeros permisos).
 * Se escriben separados por coma en VITE_ADMINISTRADORES.
 */
export const ADMINISTRADORES: string[] = ((import.meta.env.VITE_ADMINISTRADORES as string | undefined) ?? '')
  .split(',')
  .map((c) => c.trim().toLowerCase())
  .filter(Boolean)
