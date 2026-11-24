import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { catalogoCentros, responsablesIniciales } from '@/data/catalogos'
import { usuariosDemo } from '@/data/usuariosDemo'
import type { Centro, Responsable, Rol, Usuario } from '@/types'
import { guardarJSON, leerJSON } from '@/utils/almacenamiento'
import { normalizarCorreoInstitucional, validarCorreoInstitucional } from '@/utils/validaciones'

export type { Responsable }

const CLAVE_RESP = 'portal-apoyo:responsables:v2'
const CLAVE_USU = 'portal-apoyo:usuarios:v1'
const CLAVE_CENTROS = 'portal-apoyo:centros:v3'

const ordenar = (a: string, b: string) => a.localeCompare(b, 'es', { sensitivity: 'base' })
const existe = (lista: string[], nombre: string) =>
  lista.some((x) => x.toLowerCase() === nombre.trim().toLowerCase())

interface CatalogosValor {
  responsables: Responsable[]
  responsablesActivos: string[]
  agregarResponsable: (nombre: string, correo: string) => string
  actualizarCorreoResponsable: (nombre: string, correo: string) => string
  alternarResponsable: (nombre: string) => void
  eliminarResponsable: (nombre: string) => void
  usuarios: Usuario[]
  agregarUsuario: (u: Usuario) => string
  cambiarRol: (correo: string, rol: Rol) => void
  quitarUsuario: (correo: string) => void
  centros: Centro[]
  tiposDeCentro: () => string[]
  subcentrosDe: (tipo: string) => string[]
  serviciosDe: (tipo: string, subcentro: string) => string[]
  agregarSubcentro: (tipo: string, nombre: string) => string
  agregarServicio: (tipo: string, subcentro: string, nombre: string) => string
  agregarVariosServicios: (
    tipo: string,
    subcentro: string,
    nombres: string[],
  ) => { agregados: number; duplicados: string[] }
  quitarServicio: (tipo: string, subcentro: string, nombre: string) => void
  restaurarCatalogoCentros: () => void
}

const CatalogosContext = createContext<CatalogosValor | null>(null)

export function CatalogosProvider({ children }: { children: ReactNode }) {
  const [responsables, setResponsables] = useState<Responsable[]>(() => {
    const guardados = leerJSON<Responsable[]>(CLAVE_RESP)
    if (guardados) {
      return guardados.map((r) => ({ ...r, correo: r.correo ?? '' }))
    }
    return structuredClone(responsablesIniciales)
  })

  const [usuarios, setUsuarios] = useState<Usuario[]>(
    () => leerJSON<Usuario[]>(CLAVE_USU) ?? usuariosDemo,
  )

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
    (nombre: string, correo: string) => {
      const limpio = nombre.trim()
      if (limpio.length < 3) return 'Escribe el nombre completo del responsable.'
      if (responsables.some((r) => r.nombre.toLowerCase() === limpio.toLowerCase())) {
        return 'Esa persona ya está en la lista.'
      }
      const errorCorreo = validarCorreoInstitucional(correo)
      if (errorCorreo) return errorCorreo

      const correoNormalizado = normalizarCorreoInstitucional(correo)
      if (responsables.some((r) => r.correo && r.correo.toLowerCase() === correoNormalizado)) {
        return 'Ese correo institucional ya está asignado a otro responsable.'
      }

      guardarResp([...responsables, { nombre: limpio, correo: correoNormalizado, activo: true }])
      return ''
    },
    [responsables],
  )

  const actualizarCorreoResponsable = useCallback(
    (nombre: string, correo: string) => {
      const errorCorreo = validarCorreoInstitucional(correo)
      if (errorCorreo) return errorCorreo
      const correoNormalizado = normalizarCorreoInstitucional(correo)
      if (
        responsables.some(
          (r) => r.nombre !== nombre && r.correo && r.correo.toLowerCase() === correoNormalizado,
        )
      ) {
        return 'Ese correo institucional ya pertenece a otro responsable.'
      }
      guardarResp(
        responsables.map((r) => (r.nombre === nombre ? { ...r, correo: correoNormalizado } : r)),
      )
      return ''
    },
    [responsables],
  )

  const alternarResponsable = useCallback(
    (nombre: string) =>
      guardarResp(
        responsables.map((r) => (r.nombre === nombre ? { ...r, activo: !r.activo } : r)),
      ),
    [responsables],
  )

  const eliminarResponsable = useCallback(
    (nombre: string) => guardarResp(responsables.filter((r) => r.nombre !== nombre)),
    [responsables],
  )

  const agregarUsuario = useCallback(
    (u: Usuario) => {
      const errorCorreo = validarCorreoInstitucional(u.correo)
      if (errorCorreo) return errorCorreo
      const correo = normalizarCorreoInstitucional(u.correo)
      if (u.nombre.trim().length < 3) return 'Escribe el nombre completo.'
      if (usuarios.some((x) => x.correo === correo)) return 'Ese correo ya tiene acceso.'
      guardarUsu([...usuarios, { correo, nombre: u.nombre.trim(), rol: u.rol }])
      return ''
    },
    [usuarios],
  )

  const cambiarRol = useCallback(
    (correo: string, rol: Rol) =>
      guardarUsu(usuarios.map((u) => (u.correo === correo ? { ...u, rol } : u))),
    [usuarios],
  )

  const quitarUsuario = useCallback(
    (correo: string) => guardarUsu(usuarios.filter((u) => u.correo !== correo)),
    [usuarios],
  )

  const tiposDeCentro = useCallback(() => centros.map((c) => c.nombre), [centros])

  const subcentrosDe = useCallback(
    (tipo: string) => centros.find((c) => c.nombre === tipo)?.subcentros.map((x) => x.nombre) ?? [],
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
      if (existe(subcentrosDe(tipo), limpio)) return 'Ese centro ya existe en esta área.'
      guardarCentros(
        centros.map((c) =>
          c.nombre === tipo
            ? {
                ...c,
                subcentros: [...c.subcentros, { nombre: limpio, servicios: [] }].sort((a, b) =>
                  ordenar(a.nombre, b.nombre),
                ),
              }
            : c,
        ),
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
      if (!t) return 'Elige un área.'
      const repetidos = subcentro
        ? serviciosDe(tipo, subcentro)
        : [...t.serviciosComunes, ...t.subcentros.flatMap((x) => x.servicios)]
      if (existe(repetidos, limpio)) return 'Ese servicio ya existe aquí.'
      guardarCentros(
        centros.map((c) =>
          c.nombre !== tipo
            ? c
            : subcentro
              ? {
                  ...c,
                  subcentros: c.subcentros.map((x) =>
                    x.nombre === subcentro
                      ? { ...x, servicios: [...x.servicios, limpio].sort(ordenar) }
                      : x,
                  ),
                }
              : { ...c, serviciosComunes: [...c.serviciosComunes, limpio].sort(ordenar) },
        ),
      )
      return ''
    },
    [centros, serviciosDe],
  )

  const agregarVariosServicios = useCallback(
    (tipo: string, subcentro: string, nombres: string[]) => {
      const t = centros.find((c) => c.nombre === tipo)
      if (!t) return { agregados: 0, duplicados: [] }

      const limpios = [...new Set(nombres.map((n) => n.trim()).filter((n) => n.length >= 2))]
      const existentes = subcentro
        ? serviciosDe(tipo, subcentro)
        : [...t.serviciosComunes, ...t.subcentros.flatMap((x) => x.servicios)]

      const nuevos: string[] = []
      const duplicados: string[] = []

      for (const item of limpios) {
        if (existe([...existentes, ...nuevos], item)) {
          duplicados.push(item)
        } else {
          nuevos.push(item)
        }
      }

      if (nuevos.length > 0) {
        guardarCentros(
          centros.map((c) =>
            c.nombre !== tipo
              ? c
              : subcentro
                ? {
                    ...c,
                    subcentros: c.subcentros.map((x) =>
                      x.nombre === subcentro
                        ? { ...x, servicios: [...x.servicios, ...nuevos].sort(ordenar) }
                        : x,
                    ),
                  }
                : { ...c, serviciosComunes: [...c.serviciosComunes, ...nuevos].sort(ordenar) },
          ),
        )
      }

      return { agregados: nuevos.length, duplicados }
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
              ? {
                  ...c,
                  subcentros: c.subcentros.map((x) =>
                    x.nombre === subcentro
                      ? { ...x, servicios: x.servicios.filter((n) => n !== nombre) }
                      : x,
                  ),
                }
              : { ...c, serviciosComunes: c.serviciosComunes.filter((n) => n !== nombre) },
        ),
      ),
    [centros],
  )

  const restaurarCatalogoCentros = useCallback(() => {
    guardarCentros(structuredClone(catalogoCentros))
  }, [])

  const valor = useMemo(
    () => ({
      responsables,
      responsablesActivos: responsables.filter((r) => r.activo).map((r) => r.nombre),
      agregarResponsable,
      actualizarCorreoResponsable,
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
      agregarVariosServicios,
      quitarServicio,
      restaurarCatalogoCentros,
    }),
    [
      responsables,
      usuarios,
      agregarResponsable,
      actualizarCorreoResponsable,
      alternarResponsable,
      eliminarResponsable,
      agregarUsuario,
      cambiarRol,
      quitarUsuario,
      centros,
      tiposDeCentro,
      subcentrosDe,
      serviciosDe,
      agregarSubcentro,
      agregarServicio,
      agregarVariosServicios,
      quitarServicio,
      restaurarCatalogoCentros,
    ],
  )

  return <CatalogosContext.Provider value={valor}>{children}</CatalogosContext.Provider>
}

export function useCatalogos(): CatalogosValor {
  const c = useContext(CatalogosContext)
  if (!c) throw new Error('useCatalogos debe usarse dentro de <CatalogosProvider>.')
  return c
}