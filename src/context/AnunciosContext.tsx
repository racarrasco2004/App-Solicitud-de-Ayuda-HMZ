import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { anunciosIniciales, fotosDeEjemplo } from '@/data/anunciosIniciales'
import type { Anuncio } from '@/types'
import { guardarJSON, leerJSON } from '@/utils/almacenamiento'

/**
 * Anuncios y campañas editables desde la pestaña «Anuncios».
 * Hoy se guardan en el navegador; después pasan a una lista de SharePoint con biblioteca de imágenes.
 */
const CLAVE = 'portal-apoyo:anuncios:v1'

export type DatosAnuncio = Pick<Anuncio, 'titulo' | 'texto' | 'imagen'>

interface AnunciosValor {
  anuncios: Anuncio[]
  /** Solo los activos, en orden: lo que ve el solicitante */
  visibles: Anuncio[]
  agregar: (datos: DatosAnuncio) => void
  actualizar: (id: string, datos: DatosAnuncio) => void
  alternar: (id: string) => void
  eliminar: (id: string) => void
  mover: (id: string, direccion: -1 | 1) => void
  /** Convierte la referencia guardada en una dirección de imagen que se puede mostrar */
  srcDe: (imagen: string) => string
}

const Contexto = createContext<AnunciosValor | null>(null)

export function AnunciosProvider({ children }: { children: ReactNode }) {
  const [anuncios, setAnuncios] = useState<Anuncio[]>(() => leerJSON<Anuncio[]>(CLAVE) ?? anunciosIniciales)

  const aplicar = useCallback((fn: (lista: Anuncio[]) => Anuncio[]) => {
    setAnuncios((previa) => {
      const nueva = fn(previa)
      guardarJSON(CLAVE, nueva)
      return nueva
    })
  }, [])

  const valor = useMemo<AnunciosValor>(
    () => ({
      anuncios,
      visibles: anuncios.filter((a) => a.activo),
      agregar: (d) => aplicar((l) => [...l, { ...d, id: `a${Date.now()}`, activo: true }]),
      actualizar: (id, d) => aplicar((l) => l.map((a) => (a.id === id ? { ...a, ...d } : a))),
      alternar: (id) => aplicar((l) => l.map((a) => (a.id === id ? { ...a, activo: !a.activo } : a))),
      eliminar: (id) => aplicar((l) => l.filter((a) => a.id !== id)),
      mover: (id, dir) =>
        aplicar((l) => {
          const i = l.findIndex((a) => a.id === id)
          const j = i + dir
          if (i < 0 || j < 0 || j >= l.length) return l
          const copia = [...l]
          ;[copia[i], copia[j]] = [copia[j], copia[i]]
          return copia
        }),
      srcDe: (imagen) => (imagen.startsWith('ejemplo:') ? (fotosDeEjemplo[imagen.slice(8)] ?? '') : imagen),
    }),
    [anuncios, aplicar],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useAnuncios() {
  const c = useContext(Contexto)
  if (!c) throw new Error('useAnuncios debe usarse dentro de AnunciosProvider')
  return c
}
