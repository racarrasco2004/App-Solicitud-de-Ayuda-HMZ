import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ADMINISTRADORES, MICROSOFT_ACTIVO } from '@/config/microsoft'
import { msal, PERMISOS } from '@/services/microsoft'
import { DOMINIO_CORREO } from '@/data/usuariosDemo'
import { useCatalogos } from './CatalogosContext'
import type { Usuario } from '@/types'
import { borrarClave, guardarJSON, leerJSON } from '@/utils/almacenamiento'
import { capitalizar } from '@/utils/formato'

/**
 * Inicio de sesión.
 * - Con los datos de Microsoft Entra ID (.env.local): inicio de sesión REAL con la cuenta UC CHRISTUS.
 * - Sin ellos: modo demostración con inicio de sesión simulado (sin contraseña).
 * El rol sale de la lista de usuarios (Administración); quien no esté en la lista entra como solicitante.
 */

const CLAVE = 'portal-apoyo:usuario'

type ResultadoEntrada = { ok: true } | { ok: false; error: string }

interface AuthValor {
  usuario: Usuario | null
  /** true mientras se confirma la sesión de Microsoft al abrir la página */
  cargando: boolean
  errorMicrosoft: string
  entrarConMicrosoft: () => void
  entrar: (entrada: string) => ResultadoEntrada
  entrarComo: (usuario: Usuario) => void
  salir: () => void
}

const AuthContext = createContext<AuthValor | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { usuarios } = useCatalogos()
  const [demo, setDemo] = useState<Usuario | null>(() => (MICROSOFT_ACTIVO ? null : leerJSON<Usuario>(CLAVE, 'sesion')))
  const [cuenta, setCuenta] = useState<{ correo: string; nombre: string } | null>(null)
  const [cargando, setCargando] = useState(MICROSOFT_ACTIVO)
  const [errorMicrosoft, setErrorMicrosoft] = useState('')

  // Al abrir la página: recoge el regreso desde Microsoft o la sesión que ya existía
  useEffect(() => {
    if (!msal) return
    let vivo = true
    ;(async () => {
      try {
        await msal.initialize()
        const resultado = await msal.handleRedirectPromise()
        const c = resultado?.account ?? msal.getAllAccounts()[0] ?? null
        if (c) msal.setActiveAccount(c)
        if (vivo) setCuenta(c ? { correo: c.username.toLowerCase(), nombre: c.name || c.username } : null)
      } catch {
        if (vivo) setErrorMicrosoft('No pudimos iniciar sesión con Microsoft. Intenta de nuevo.')
      } finally {
        if (vivo) setCargando(false)
      }
    })()
    return () => {
      vivo = false
    }
  }, [])

  const usuario = useMemo<Usuario | null>(() => {
    if (!cuenta) return demo
    const conocido = usuarios.find((u) => u.correo === cuenta.correo)
    const rol = ADMINISTRADORES.includes(cuenta.correo) ? 'administrador' : (conocido?.rol ?? 'solicitante')
    return { correo: cuenta.correo, nombre: conocido?.nombre ?? cuenta.nombre, rol }
  }, [cuenta, demo, usuarios])

  const entrarConMicrosoft = useCallback(() => {
    setErrorMicrosoft('')
    msal?.loginRedirect({ scopes: PERMISOS }).catch(() => setErrorMicrosoft('No pudimos abrir Microsoft. Intenta de nuevo.'))
  }, [])

  const entrarComo = useCallback((nuevo: Usuario) => {
    guardarJSON(CLAVE, nuevo, 'sesion')
    setDemo(nuevo)
  }, [])

  const entrar = useCallback(
    (entrada: string): ResultadoEntrada => {
      const texto = entrada.trim().toLowerCase()
      if (!texto) return { ok: false, error: 'Escribe tu correo UC CHRISTUS o tu usuario.' }

      const [nombreUsuario, dominio] = texto.split('@')
      if (dominio !== undefined && `@${dominio}` !== DOMINIO_CORREO) {
        return { ok: false, error: `Usa tu correo institucional (${DOMINIO_CORREO}).` }
      }
      if (!/^[a-z0-9._-]+$/.test(nombreUsuario)) {
        return { ok: false, error: 'El usuario solo puede tener letras, números, punto o guion.' }
      }

      const correo = `${nombreUsuario}${DOMINIO_CORREO}`
      const conocido = usuarios.find((u) => u.correo === correo)
      entrarComo(conocido ?? { correo, nombre: capitalizar(nombreUsuario), rol: 'solicitante' })
      return { ok: true }
    },
    [entrarComo, usuarios],
  )

  const salir = useCallback(() => {
    borrarClave(CLAVE, 'sesion')
    setDemo(null)
    if (msal && cuenta) {
      setCuenta(null)
      msal.logoutRedirect().catch(() => undefined)
    }
  }, [cuenta])

  const valor = useMemo(
    () => ({ usuario, cargando, errorMicrosoft, entrarConMicrosoft, entrar, entrarComo, salir }),
    [usuario, cargando, errorMicrosoft, entrarConMicrosoft, entrar, entrarComo, salir],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValor {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  return contexto
}
