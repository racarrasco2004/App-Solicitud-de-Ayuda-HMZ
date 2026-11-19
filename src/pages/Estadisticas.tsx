import { useMemo, type ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MapaDeCalor } from '@/components/MapaDeCalor'
import { PageHeader } from '@/components/ui/PageHeader'
import { useSolicitudes } from '@/context/SolicitudesContext'
import type { Solicitud } from '@/types'

// Colores en hexadecimal porque los gráficos SVG no leen variables CSS; se ven bien en claro y oscuro.
const MORADO = '#8a3fa8'
const COLORES_ESTADO: Record<string, string> = { Pendiente: '#d99a1c', 'En proceso': '#2f7fc4', Cerrada: '#2e9d6a' }
const EJE = '#8a8a99'

function contar(lista: Solicitud[], clave: (s: Solicitud) => string) {
  const m = new Map<string, number>()
  lista.forEach((s) => m.set(clave(s), (m.get(clave(s)) ?? 0) + 1))
  return [...m.entries()].map(([nombre, total]) => ({ nombre, total }))
}

function Tarjeta({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-linea bg-superficie p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-bold text-tinta">{titulo}</h2>
      <div className="h-64">{children}</div>
    </section>
  )
}

function Barras({ datos, horizontal = false }: { datos: { nombre: string; total: number }[]; horizontal?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={datos} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ left: horizontal ? 20 : 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={EJE} strokeOpacity={0.25} />
        {horizontal ? (
          <>
            <XAxis type="number" allowDecimals={false} tick={{ fill: EJE, fontSize: 11 }} />
            <YAxis type="category" dataKey="nombre" width={130} tick={{ fill: EJE, fontSize: 11 }} />
          </>
        ) : (
          <>
            <XAxis dataKey="nombre" tick={{ fill: EJE, fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fill: EJE, fontSize: 11 }} />
          </>
        )}
        <Tooltip />
        <Bar isAnimationActive={false} dataKey="total" name="Solicitudes" fill={MORADO} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Estadisticas() {
  const { solicitudes } = useSolicitudes()

  const d = useMemo(() => {
    const porMes = contar(solicitudes, (s) => s.fecha.slice(0, 7)).sort((a, b) => a.nombre.localeCompare(b.nombre))
    return {
      estado: contar(solicitudes, (s) => s.estado),
      mes: porMes,
      centro: contar(solicitudes, (s) => s.subcentro).sort((a, b) => b.total - a.total).slice(0, 8),
      tipo: contar(solicitudes, (s) => s.tipoSolicitante),
      programa: contar(solicitudes, (s) => s.programa ?? 'Apoyo espiritual'),
    }
  }, [solicitudes])

  return (
    <>
      <PageHeader titulo="Estadísticas" subtitulo={`Indicadores de ${solicitudes.length} solicitudes.`} />
      <div className="mb-4">
        <MapaDeCalor solicitudes={solicitudes} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Tarjeta titulo="Por estado">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie isAnimationActive={false} data={d.estado} dataKey="total" nameKey="nombre" innerRadius={50} outerRadius={85} label>
                {d.estado.map((e) => <Cell key={e.nombre} fill={COLORES_ESTADO[e.nombre] ?? MORADO} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Tarjeta>
        <Tarjeta titulo="Por mes"><Barras datos={d.mes} /></Tarjeta>
        <Tarjeta titulo="Por centro (los 8 con más solicitudes)"><Barras datos={d.centro} horizontal /></Tarjeta>
        <Tarjeta titulo="Por quién pide"><Barras datos={d.tipo} /></Tarjeta>
        <Tarjeta titulo="Por programa"><Barras datos={d.programa} /></Tarjeta>
      </div>
    </>
  )
}
