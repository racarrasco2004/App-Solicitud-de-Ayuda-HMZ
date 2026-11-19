import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { solicitudesRepository } from '@/services'
import type { CambiosSolicitud, DatosNuevaSolicitud, Solicitud } from '@/types'
import { useAuth } from './AuthContext'

interface SolicitudesValor {
  solicitudes: Solicitud[]
  cargando: boolean
  error: string
  crear: (datos: DatosNuevaSolicitud) => Promise<Solicitud>
  actualizar: (id: string, cambios: CambiosSolicitud) => Promise<void>
  recargar: () => Promise<void>
}

const SolicitudesContext = createContext<SolicitudesValor | null>(null)

export function SolicitudesProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const recargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setSolicitudes(await solicitudesRepository.listar())
    } catch {
      setError('No pudimos cargar las solicitudes. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }, [])

  // Carga las solicitudes cuando hay una sesión iniciada
  useEffect(() => {
    if (usuario) void recargar()
    else setSolicitudes([])
  }, [usuario, recargar])

  const crear = useCallback(
    async (datos: DatosNuevaSolicitud) => {
      if (!usuario) throw new Error('Debes iniciar sesión para crear una solicitud.')
      const nueva = await solicitudesRepository.crear(datos, usuario.correo)
      setSolicitudes((actuales) => [nueva, ...actuales])
      return nueva
    },
    [usuario],
  )

  const actualizar = useCallback(async (id: string, cambios: CambiosSolicitud) => {
    const actualizada = await solicitudesRepository.actualizar(id, cambios)
    setSolicitudes((actuales) => actuales.map((s) => (s.id === id ? actualizada : s)))
  }, [])

  const valor = useMemo(
    () => ({ solicitudes, cargando, error, crear, actualizar, recargar }),
    [solicitudes, cargando, error, crear, actualizar, recargar],
  )

  return <SolicitudesContext.Provider value={valor}>{children}</SolicitudesContext.Provider>
}

export function useSolicitudes(): SolicitudesValor {
  const contexto = useContext(SolicitudesContext)
  if (!contexto) throw new Error('useSolicitudes debe usarse dentro de <SolicitudesProvider>.')
  return contexto
}
