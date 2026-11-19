import { PublicClientApplication } from '@azure/msal-browser'
import { ENTRA, MICROSOFT_ACTIVO } from '@/config/microsoft'

/** Cliente de Microsoft (MSAL). Solo existe si TI entregó los datos de la app. */
export const msal = MICROSOFT_ACTIVO
  ? new PublicClientApplication({
      auth: {
        clientId: ENTRA.clientId,
        authority: `https://login.microsoftonline.com/${ENTRA.tenantId}`,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: `${window.location.origin}/login`,
      },
      cache: { cacheLocation: 'sessionStorage' },
    })
  : null

/** Permiso mínimo: leer el nombre y el correo de quien entra. */
export const PERMISOS = ['User.Read']
