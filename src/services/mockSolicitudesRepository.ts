import { solicitudesEjemplo } from '@/data/solicitudesEjemplo'
import type { Solicitud } from '@/types'
import { guardarJSON, leerJSON } from '@/utils/almacenamiento'
import type { SolicitudesRepository } from './solicitudesRepository'

const CLAVE = 'portal-apoyo:solicitudes:v2'
const LATENCIA_MS = 250

const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms))

function leerTodas(): Solicitud[] {
  return leerJSON<Solicitud[]>(CLAVE) ?? solicitudesEjemplo
}

function siguienteCodigo(lista: Solicitud[]): string {
  const anio = new Date().getFullYear()
  const mayor = lista
    .map((s) => Number(s.id.split('-')[2]))
    .filter((n) => Number.isFinite(n))
    .reduce((max, n) => Math.max(max, n), 0)
  return `SOL-${anio}-${String(mayor + 1).padStart(4, '0')}`
}

/** Repositorio de demostración: guarda en el navegador (localStorage). */
export function crearMockRepository(): SolicitudesRepository {
  return {
    async listar() {
      await esperar(LATENCIA_MS)
      return [...leerTodas()].sort((a, b) => b.fecha.localeCompare(a.fecha))
    },

    async crear(datos, creadaPor) {
      await esperar(LATENCIA_MS)
      const lista = leerTodas()
      const nueva: Solicitud = {
        ...datos,
        id: siguienteCodigo(lista),
        fecha: new Date().toISOString(),
        estado: 'Pendiente',
        responsable: null,
        creadaPor,
      }
      guardarJSON(CLAVE, [nueva, ...lista])
      return nueva
    },

    async actualizar(id, cambios) {
      await esperar(LATENCIA_MS)
      const lista = leerTodas()
      const indice = lista.findIndex((s) => s.id === id)
      if (indice === -1) throw new Error(`No existe la solicitud ${id}.`)
      const actualizada = { ...lista[indice], ...cambios }
      const nuevaLista = [...lista]
      nuevaLista[indice] = actualizada
      guardarJSON(CLAVE, nuevaLista)
      return actualizada
    },
  }
}
