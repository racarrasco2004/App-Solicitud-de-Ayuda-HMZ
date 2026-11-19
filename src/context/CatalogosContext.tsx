import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { catalogoCentros, responsables as responsablesIniciales } from '@/data/catalogos'
import { usuariosDemo } from '@/data/usuariosDemo'
import type { Centro, Rol, Usuario } from '@/types'
import { guardarJSON, leerJSON } from '@/utils/almacenamiento'

/**
 * Catálogos editables desde Administración (responsables y usuarios).
 * Hoy se guardan en el navegador; después se reemplazan por listas de SharePoint.
 */
export interface Responsable {
  nombre: string
  activo: boolean
}

const CLAVE_RESP = 'portal-apoyo:responsables:v1'
const CLAVE_USU = 'portal-apoyo:usuarios:v1'
const CLAVE_CENTROS = 'portal-apoyo:centros:v1'

const ordenar = (a: string, b: string) => a.localeCompare(b, 'es')
const existe = (lista: string[], nombre: string) => lista.some((x) => x.toLowerCase() === nombre.toLowerCase())

interface CatalogosValor {
  responsables: Responsable[]
  /** Solo los activos, para elegir al asignar */
  responsablesActivos: string[]
  agregarResponsable: (nombre: string) => string
  alternarResponsable: (nombre: string) => void
  eliminarResponsable: (nombre: string) => void
  usuarios: Usuario[]
  agregarUsuario: (u: Usuario) => string
  cambiarRol: (correo: string, rol: Rol) => void
  quitarUsuario: (correo: string) => void
  /** Centros y servicios (editables desde Administración) */
  centros: Centro[]
  tiposDeCentro: () => string[]
  subcentrosDe: (tipo: string) => string[]
  /** Servicios del centro más los comunes del tipo, ordenados y sin repetir */
  serviciosDe: (tipo: string, subcentro: string) => string[]
  agregarSubcentro: (tipo: string, nombre: string) => string
  /** subcentro = '' agrega un servicio común a todos los centros del tipo */
  agregarServicio: (tipo: string, subcentro: string, nombre: string) => string
  quitarServicio: (tipo: string, subcentro: string, nombre: string) => void
}

const CatalogosContext = createContext<CatalogosValor | null>(null)

export function CatalogosProvider({ children }: { children: ReactNode }) {
  const [responsables, setResponsables] = useState<Responsable[]>(
    () => leerJSON<Responsable[]>(CLAVE_RESP) ?? responsablesIniciales.map((nombre) => ({ nombre, activo: true })),
  )
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => leerJSON<Usuario[]>(CLAVE_USU) ?? usuariosDemo)

  const [centros, setCentros] = useState<Centro[]>(
    () => leerJSON<Centro[]>(CLAVE_CENTROS) ?? structuredClone(catalogoCentros),
  )
  const guardarCentros = (lista: Centro[]) => {
    guardarJSON(CLAVE_CENTROS, lista)
    setCentros(lista)
  }

  const guardarResp = (lista: Responsable[]) => {
    guardarJSON(CLAVE_RESP, lista)
    setResponsables(lista)
  }
  const guardarUsu = (lista: Usuario[]) => {
    guardarJSON(CLAVE_USU, lista)
    setUsuarios(lista)
  }

  const agregarResponsable = useCallback(
    (nombre: string) => {
      const limpio = nombre.trim()
      if (limpio.length < 3) return 'Escribe el nombre completo.'
      if (responsables.some((r) => r.nombre.toLowerCase() === limpio.toLowerCase())) return 'Esa persona ya está en la lista.'
      guardarResp([...responsables, { nombre: limpio, activo: true }])
      return ''
    },
    [responsables],
  )

  const alternarResponsable = useCallback(
    (nombre: string) => guardarResp(responsables.map((r) => (r.nombre === nombre ? { ...r, activo: !r.activo } : r))),
    [responsables],
  )

  const eliminarResponsable = useCallback(
    (nombre: string) => guardarResp(responsables.filter((r) => r.nombre !== nombre)),
    [responsables],
  )

  const agregarUsuario = useCallback(
    (u: Usuario) => {
      const correo = u.correo.trim().toLowerCase()
      if (!/^[a-z0-9._-]+@ucchristus\.cl$/.test(correo)) return 'Usa un correo @ucchristus.cl.'
      if (u.nombre.trim().length < 3) return 'Escribe el nombre.'
      if (usuarios.some((x) => x.correo === correo)) return 'Ese correo ya tiene acceso.'
      guardarUsu([...usuarios, { correo, nombre: u.nombre.trim(), rol: u.rol }])
      return ''
    },
    [usuarios],
  )

  const cambiarRol = useCallback(
    (correo: string, rol: Rol) => guardarUsu(usuarios.map((u) => (u.correo === correo ? { ...u, rol } : u))),
    [usuarios],
  )
  const quitarUsuario = useCallback(
    (correo: string) => guardarUsu(usuarios.filter((u) => u.correo !== correo)),
    [usuarios],
  )

  const tiposDeCentro = useCallback(() => centros.map((c) => c.nombre), [centros])
  const subcentrosDe = useCallback(
    (tipo: string) => (centros.find((c) => c.nombre === tipo)?.subcentros.map((x) => x.nombre) ?? []),
    [centros],
  )
  const serviciosDe = useCallback(
    (tipo: string, subcentro: string) => {
      const t = centros.find((c) => c.nombre === tipo)
      if (!t) return []
      const propios = t.subcentros.find((x) => x.nombre === subcentro)?.servicios ?? []
      return [...new Set([...t.serviciosComunes, ...propios])].sort(ordenar)
    },
    [centros],
  )

  const agregarSubcentro = useCallback(
    (tipo: string, nombre: string) => {
      const limpio = nombre.trim()
      if (limpio.length < 3) return 'Escribe el nombre del centro.'
      if (existe(subcentrosDe(tipo), limpio)) return 'Ese centro ya existe en este tipo.'
      guardarCentros(
        centros.map((c) => (c.nombre === tipo ? { ...c, subcentros: [...c.subcentros, { nombre: limpio, servicios: [] }] } : c)),
      )
      return ''
    },
    [centros, subcentrosDe],
  )

  const agregarServicio = useCallback(
    (tipo: string, subcentro: string, nombre: string) => {
      const limpio = nombre.trim()
      if (limpio.length < 2) return 'Escribe el nombre del servicio.'
      const t = centros.find((c) => c.nombre === tipo)
      if (!t) return 'Elige un tipo de centro.'
      // Revisa repetidos contra comunes y propios del centro (o de todos, si es común)
      const repetidos = subcentro
        ? serviciosDe(tipo, subcentro)
        : [...t.serviciosComunes, ...t.subcentros.flatMap((x) => x.servicios)]
      if (existe(repetidos, limpio)) return 'Ese servicio ya existe.'
      guardarCentros(
        centros.map((c) =>
          c.nombre !== tipo
            ? c
            : subcentro
              ? { ...c, subcentros: c.subcentros.map((x) => (x.nombre === subcentro ? { ...x, servicios: [...x.servicios, limpio] } : x)) }
              : { ...c, serviciosComunes: [...c.serviciosComunes, limpio] },
        ),
      )
      return ''
    },
    [centros, serviciosDe],
  )

  const quitarServicio = useCallback(
    (tipo: string, subcentro: string, nombre: string) =>
      guardarCentros(
        centros.map((c) =>
          c.nombre !== tipo
            ? c
            : subcentro
              ? { ...c, subcentros: c.subcentros.map((x) => (x.nombre === subcentro ? { ...x, servicios: x.servicios.filter((n) => n !== nombre) } : x)) }
              : { ...c, serviciosComunes: c.serviciosComunes.filter((n) => n !== nombre) },
        ),
      ),
    [centros],
  )

  const valor = useMemo(
    () => ({
      responsables,
      responsablesActivos: responsables.filter((r) => r.activo).map((r) => r.nombre),
      agregarResponsable,
      alternarResponsable,
      eliminarResponsable,
      usuarios,
      agregarUsuario,
      cambiarRol,
      quitarUsuario,
      centros,
      tiposDeCentro,
      subcentrosDe,
      serviciosDe,
      agregarSubcentro,
      agregarServicio,
      quitarServicio,
    }),
    [responsables, usuarios, agregarResponsable, alternarResponsable, eliminarResponsable, agregarUsuario, cambiarRol, quitarUsuario, centros, tiposDeCentro, subcentrosDe, serviciosDe, agregarSubcentro, agregarServicio, quitarServicio],
  )
  return <CatalogosContext.Provider value={valor}>{children}</CatalogosContext.Provider>
}

export function useCatalogos(): CatalogosValor {
  const c = useContext(CatalogosContext)
  if (!c) throw new Error('useCatalogos debe usarse dentro de <CatalogosProvider>.')
  return c
}
