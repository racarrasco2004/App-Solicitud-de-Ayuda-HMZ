import { useMemo, useState } from 'react'
import { CampoLista } from '@/components/ui/Campos'
import type { Solicitud } from '@/types'

type Dim = { nombre: string; valor: (s: Solicitud) => string; orden?: (a: string, b: string) => number }

const mes = (iso: string) => iso.slice(0, 7)
const etiquetaMes = (m: string) =>
  new Intl.DateTimeFormat('es-CL', { month: 'short', year: '2-digit' }).format(new Date(`${m}-15T12:00:00`)).replace('.', '')

const filas: Dim[] = [
  { nombre: 'Centro', valor: (s) => s.subcentro },
  { nombre: 'Servicio', valor: (s) => s.servicio },
  { nombre: 'Tipo de centro', valor: (s) => s.centro },
]
const columnas: Dim[] = [
  { nombre: 'Mes', valor: (s) => mes(s.fecha), orden: (a, b) => a.localeCompare(b) },
  { nombre: 'Apoyo para', valor: (s) => s.tipoSolicitante },
  { nombre: 'Estado', valor: (s) => s.estado },
  { nombre: 'Programa', valor: (s) => s.programa ?? 'Sin programa' },
]
const MAX_FILAS = 15

// Escala de calor: poco = amarillo, medio = naranjo, harto = rojo
const PUNTOS: [number, [number, number, number]][] = [
  [0, [255, 236, 153]],
  [0.35, [253, 186, 80]],
  [0.65, [239, 98, 44]],
  [1, [185, 28, 28]],
]
function colorCalor(t: number): string {
  for (let i = 1; i < PUNTOS.length; i++) {
    const [t1, c1] = PUNTOS[i]
    const [t0, c0] = PUNTOS[i - 1]
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0)
      return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * k)).join(' ')})`
    }
  }
  return 'rgb(185 28 28)'
}
const GRADIENTE = `linear-gradient(90deg, ${PUNTOS.map(([t, c]) => `rgb(${c.join(' ')}) ${t * 100}%`).join(', ')})`

/**
 * Mapa de calor: cuántas solicitudes hay en cada cruce de dos dimensiones
 * (por ejemplo, centro por mes). Más oscuro = más solicitudes. Cada celda muestra su número,
 * así no depende solo del color.
 */
export function MapaDeCalor({ solicitudes }: { solicitudes: Solicitud[] }) {
  const [f, setF] = useState('Centro')
  const [c, setC] = useState('Mes')
  const filaDim = filas.find((d) => d.nombre === f) ?? filas[0]
  const colDim = columnas.find((d) => d.nombre === c) ?? columnas[0]

  const { cols, rows, max, oculto } = useMemo(() => {
    const m = new Map<string, Map<string, number>>()
    const totalCol = new Map<string, number>()
    solicitudes.forEach((s) => {
      const r = filaDim.valor(s)
      const k = colDim.valor(s)
      const fila = m.get(r) ?? new Map<string, number>()
      fila.set(k, (fila.get(k) ?? 0) + 1)
      m.set(r, fila)
      totalCol.set(k, (totalCol.get(k) ?? 0) + 1)
    })
    const cols = [...totalCol.keys()].sort(colDim.orden ?? ((a, b) => (totalCol.get(b) ?? 0) - (totalCol.get(a) ?? 0)))
    const todas = [...m.entries()]
      .map(([nombre, fila]) => ({ nombre, fila, total: [...fila.values()].reduce((x, y) => x + y, 0) }))
      .sort((a, b) => b.total - a.total)
    const rows = todas.slice(0, MAX_FILAS)
    let max = 0
    rows.forEach((r) => r.fila.forEach((v) => (max = Math.max(max, v))))
    return { cols, rows, max, oculto: todas.length - rows.length }
  }, [solicitudes, filaDim, colDim])

  const caliente = useMemo(() => {
    let mejor: { fila: string; col: string; v: number } | null = null
    rows.forEach((r) => r.fila.forEach((v, k) => { if (!mejor || v > mejor.v) mejor = { fila: r.nombre, col: k, v } }))
    return mejor as { fila: string; col: string; v: number } | null
  }, [rows])

  const etiquetaCol = (k: string) => (colDim.nombre === 'Mes' ? etiquetaMes(k) : k)
  const fondo = (v: number) => (v === 0 ? 'transparent' : colorCalor(max > 0 ? v / max : 0))
  const textoClaro = (v: number) => max > 0 && v / max > 0.6

  return (
    <section className="rounded-2xl border border-linea bg-superficie p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-tinta">Mapa de calor</h2>
          <p className="text-xs text-tinta-3">Dónde se concentran las solicitudes. Amarillo = pocas, rojo = muchas.</p>
        </div>
        <div className="flex gap-3">
          <CampoLista etiqueta="Filas" textoVacio="" opciones={filas.map((d) => d.nombre)} value={f} onChange={(e) => setF(e.target.value || 'Centro')} />
          <CampoLista etiqueta="Columnas" textoVacio="" opciones={columnas.map((d) => d.nombre)} value={c} onChange={(e) => setC(e.target.value || 'Mes')} />
        </div>
      </div>

      {caliente && caliente.v > 0 && (
        <p className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-uc-red-borde bg-uc-red-light px-3 py-2 text-sm text-uc-red-texto">
          <span aria-hidden>🔥</span>
          <span>
            Punto más caliente: <strong>{caliente.fila}</strong> · {etiquetaCol(caliente.col)} — <strong>{caliente.v}</strong>{' '}
            {caliente.v === 1 ? 'solicitud' : 'solicitudes'}
          </span>
        </p>
      )}

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-tinta-3">Aún no hay solicitudes para mostrar.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1 text-sm">
            <caption className="sr-only">Solicitudes por {f.toLowerCase()} y {c.toLowerCase()}</caption>
            <thead>
              <tr>
                <th scope="col" className="px-2 py-1 text-left text-[0.6875rem] font-bold tracking-wide text-tinta-3 uppercase">{f}</th>
                {cols.map((k) => (
                  <th key={k} scope="col" className="min-w-14 px-1 py-1 text-center text-[0.6875rem] font-bold tracking-wide text-tinta-3 uppercase">{etiquetaCol(k)}</th>
                ))}
                <th scope="col" className="px-2 py-1 text-center text-[0.6875rem] font-bold tracking-wide text-tinta-3 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.nombre}>
                  <th scope="row" className="max-w-56 truncate px-2 py-1 text-left text-xs font-semibold text-tinta" title={r.nombre}>{r.nombre}</th>
                  {cols.map((k) => {
                    const v = r.fila.get(k) ?? 0
                    return (
                      <td
                        key={k}
                        title={`${r.nombre} · ${etiquetaCol(k)}: ${v}`}
                        style={{ backgroundColor: fondo(v) }}
                        className={`rounded-lg px-1 py-3 text-center text-sm font-extrabold ${v === 0 ? 'bg-superficie-2 font-normal text-tinta-3/60' : textoClaro(v) ? 'text-white' : 'text-gray-900'}`}
                      >
                        {v}
                      </td>
                    )
                  })}
                  <td className="px-2 py-1 text-center text-xs font-bold text-tinta">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-tinta-3">
        <span aria-hidden className="flex items-center gap-2">
          Pocas
          <span className="h-3 w-40 rounded-full" style={{ backgroundImage: GRADIENTE }} />
          Muchas ({max})
        </span>
        {oculto > 0 && <span>Se muestran las {MAX_FILAS} filas con más solicitudes ({oculto} más sin mostrar).</span>}
      </div>
    </section>
  )
}
