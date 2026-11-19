import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { guardarJSON, leerJSON } from '@/utils/almacenamiento'

export type Tema = 'claro' | 'oscuro' | 'sistema'
export type Movimiento = 'sistema' | 'reducido'

export interface Ajustes {
  tema: Tema
  /** Porcentaje del tamaño de letra: 87.5, 100, 112.5, 125 o 150 */
  tamano: number
  movimiento: Movimiento
}

const CLAVE = 'portal-apoyo:ajustes'
const POR_DEFECTO: Ajustes = { tema: 'sistema', tamano: 100, movimiento: 'sistema' }

interface AjustesValor {
  ajustes: Ajustes
  /** Tema que realmente se está mostrando */
  temaEfectivo: 'claro' | 'oscuro'
  cambiar: (cambios: Partial<Ajustes>) => void
  restablecer: () => void
}

const AjustesContext = createContext<AjustesValor | null>(null)

const consultaOscuro = '(prefers-color-scheme: dark)'

export function AjustesProvider({ children }: { children: ReactNode }) {
  const [ajustes, setAjustes] = useState<Ajustes>({
    ...POR_DEFECTO,
    ...(leerJSON<Partial<Ajustes>>(CLAVE) ?? {}),
  })
  const [sistemaOscuro, setSistemaOscuro] = useState(() => window.matchMedia(consultaOscuro).matches)

  // Sigue el tema del equipo cuando está en "sistema"
  useEffect(() => {
    const consulta = window.matchMedia(consultaOscuro)
    const alCambiar = (e: MediaQueryListEvent) => setSistemaOscuro(e.matches)
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  const temaEfectivo: 'claro' | 'oscuro' =
    ajustes.tema === 'sistema' ? (sistemaOscuro ? 'oscuro' : 'claro') : ajustes.tema

  // Aplica los ajustes al documento
  useEffect(() => {
    const raiz = document.documentElement
    raiz.classList.toggle('dark', temaEfectivo === 'oscuro')
    raiz.style.fontSize = `${ajustes.tamano}%`
    if (ajustes.movimiento === 'reducido') raiz.setAttribute('data-movimiento', 'reducido')
    else raiz.removeAttribute('data-movimiento')
  }, [temaEfectivo, ajustes.tamano, ajustes.movimiento])

  const cambiar = useCallback((cambios: Partial<Ajustes>) => {
    setAjustes((actuales) => {
      const nuevos = { ...actuales, ...cambios }
      guardarJSON(CLAVE, nuevos)
      return nuevos
    })
  }, [])

  const restablecer = useCallback(() => {
    guardarJSON(CLAVE, POR_DEFECTO)
    setAjustes(POR_DEFECTO)
  }, [])

  const valor = useMemo(
    () => ({ ajustes, temaEfectivo, cambiar, restablecer }),
    [ajustes, temaEfectivo, cambiar, restablecer],
  )

  return <AjustesContext.Provider value={valor}>{children}</AjustesContext.Provider>
}

export function useAjustes(): AjustesValor {
  const contexto = useContext(AjustesContext)
  if (!contexto) throw new Error('useAjustes debe usarse dentro de <AjustesProvider>.')
  return contexto
}
