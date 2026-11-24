import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FilterX,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { MapaDeCalor } from '@/components/MapaDeCalor'
import { Button } from '@/components/ui/Button'
import { CampoLista } from '@/components/ui/Campos'
import { Kpi } from '@/components/ui/Kpi'
import { PageHeader } from '@/components/ui/PageHeader'
import { horasDesde } from '@/config/escalamiento'
import { useCatalogos } from '@/context/CatalogosContext'
import { useConfiguracionPortal } from '@/context/ConfiguracionPortalContext'
import { useSolicitudes } from '@/context/SolicitudesContext'
import type { Solicitud } from '@/types'
import { cn } from '@/utils/cn'

const MORADO = '#8a3fa8'
const AZUL = '#2f7fc4'
const VERDE = '#2e9d6a'
const AMBAR = '#d99a1c'
const PALETA = [MORADO, AZUL, VERDE, AMBAR, '#6366f1', '#ec4899']
const COLORES_ESTADO: Record<string, string> = {
  Pendiente: AMBAR,
  'En proceso': AZUL,
  Cerrada: VERDE,
}
const EJE = '#7c7c8c'

type PeriodoFiltro = 'Todo el historial' | 'Últimos 30 días' | 'Últimos 3 meses' | 'Este año'
const PERIODOS: PeriodoFiltro[] = [
  'Todo el historial',
  'Últimos 30 días',
  'Últimos 3 meses',
  'Este año',
]

function contar(lista: Solicitud[], clave: (s: Solicitud) => string) {
  const m = new Map<string, number>()
  lista.forEach((s) => {
    const k = clave(s)
    m.set(k, (m.get(k) ?? 0) + 1)
  })
  return [...m.entries()].map(([nombre, total]) => ({ nombre, total }))
}

function formatearMesCorto(ym: string) {
  const d = new Date(`${ym}-15T12:00:00`)
  if (Number.isNaN(d.getTime())) return ym
  return new Intl.DateTimeFormat('es-CL', { month: 'short', year: '2-digit' })
    .format(d)
    .replace('.', '')
}

function TarjetaGrafico({
  titulo,
  subtitulo,
  accion,
  children,
}: {
  titulo: string
  subtitulo?: string
  accion?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex flex-col rounded-2xl border border-linea bg-superficie p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-tinta">{titulo}</h2>
          {subtitulo && <p className="text-xs text-tinta-3">{subtitulo}</p>}
        </div>
        {accion}
      </div>
      <div className="h-64 w-full">{children}</div>
    </section>
  )
}

function Barras({
  datos,
  horizontal = false,
  color = MORADO,
  multicolor = false,
}: {
  datos: { nombre: string; total: number }[]
  horizontal?: boolean
  color?: string
  multicolor?: boolean
}) {
  if (datos.length === 0) {
    return (
      <div className="grid h-full place-items-center text-xs text-tinta-3">
        Sin datos para el filtro seleccionado.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={datos}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={
          horizontal
            ? { top: 4, right: 28, left: 8, bottom: 4 }
            : { top: 18, right: 12, left: -12, bottom: 4 }
        }
      >
        <CartesianGrid strokeDasharray="3 3" stroke={EJE} strokeOpacity={0.2} />
        {horizontal ? (
          <>
            <XAxis type="number" allowDecimals={false} tick={{ fill: EJE, fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="nombre"
              width={150}
              tick={{ fill: EJE, fontSize: 11 }}
              tickFormatter={(v: string) => (v.length > 24 ? `${v.slice(0, 23)}…` : v)}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="nombre"
              tick={{ fill: EJE, fontSize: 11 }}
              tickFormatter={(v: string) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
            />
            <YAxis allowDecimals={false} tick={{ fill: EJE, fontSize: 11 }} />
          </>
        )}
        <Tooltip
          cursor={{ fill: 'rgba(138, 63, 168, 0.08)' }}
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid rgba(138, 63, 168, 0.2)',
            fontSize: '12px',
          }}
        />
        <Bar
          isAnimationActive={false}
          dataKey="total"
          name="Solicitudes"
          fill={color}
          radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
          maxBarSize={36}
        >
          {multicolor &&
            datos.map((entry, idx) => (
              <Cell key={entry.nombre} fill={PALETA[idx % PALETA.length]} />
            ))}
          <LabelList
            dataKey="total"
            position={horizontal ? 'right' : 'top'}
            style={{ fill: EJE, fontSize: 11, fontWeight: 700 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Estadisticas() {
  const { solicitudes } = useSolicitudes()
  const { tiposDeCentro } = useCatalogos()
  const { config } = useConfiguracionPortal()

  const [periodo, setPeriodo] = useState<PeriodoFiltro>('Todo el historial')
  const [areaFiltro, setAreaFiltro] = useState('Todas')
  const [programaFiltro, setProgramaFiltro] = useState('Todos')
  const [vistaRanking, setVistaRanking] = useState<'servicio' | 'responsable'>('servicio')

  const filtradas = useMemo(() => {
    const ahora = new Date()
    return solicitudes.filter((s) => {
      if (areaFiltro !== 'Todas' && s.centro !== areaFiltro) return false

      const progNombre = s.programa ?? 'Apoyo espiritual'
      if (programaFiltro !== 'Todos' && progNombre !== programaFiltro) return false

      if (periodo !== 'Todo el historial') {
        const fechaSol = new Date(s.fecha)
        if (!Number.isNaN(fechaSol.getTime())) {
          const dias = (ahora.getTime() - fechaSol.getTime()) / 86_400_000
          if (periodo === 'Últimos 30 días' && dias > 30) return false
          if (periodo === 'Últimos 3 meses' && dias > 90) return false
          if (periodo === 'Este año' && fechaSol.getFullYear() !== ahora.getFullYear()) return false
        }
      }
      return true
    })
  }, [solicitudes, areaFiltro, programaFiltro, periodo])

  const kpis = useMemo(() => {
    const total = filtradas.length
    const abiertas = filtradas.filter((s) => s.estado !== 'Cerrada').length
    const cerradas = filtradas.filter((s) => s.estado === 'Cerrada').length
    const sinAtender = filtradas.filter(
      (s) => s.estado === 'Pendiente' && horasDesde(s.fecha) > config.horasEscalamiento,
    ).length
    const tasaCierre = total > 0 ? Math.round((cerradas / total) * 100) : 0
    return { total, abiertas, cerradas, sinAtender, tasaCierre }
  }, [filtradas, config.horasEscalamiento])

  const d = useMemo(() => {
    const porMes = contar(filtradas, (s) => s.fecha.slice(0, 7))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map((item) => ({ ...item, nombre: formatearMesCorto(item.nombre) }))

    const ordenEstados = ['Pendiente', 'En proceso', 'Cerrada']
    const estado = contar(filtradas, (s) => s.estado).sort(
      (a, b) => ordenEstados.indexOf(a.nombre) - ordenEstados.indexOf(b.nombre),
    )

    return {
      estado,
      mes: porMes,
      centro: contar(filtradas, (s) => s.subcentro)
        .sort((a, b) => b.total - a.total)
        .slice(0, 8),
      servicio: contar(filtradas, (s) => s.servicio)
        .sort((a, b) => b.total - a.total)
        .slice(0, 8),
      responsable: contar(filtradas, (s) => s.responsable?.trim() || 'Sin asignar').sort(
        (a, b) => b.total - a.total,
      ),
      tipo: contar(filtradas, (s) => s.tipoSolicitante).sort((a, b) => b.total - a.total),
      programa: contar(filtradas, (s) => s.programa ?? 'Apoyo espiritual').sort(
        (a, b) => b.total - a.total,
      ),
    }
  }, [filtradas])

  const hayFiltrosActivos =
    periodo !== 'Todo el historial' || areaFiltro !== 'Todas' || programaFiltro !== 'Todos'

  const limpiarFiltros = () => {
    setPeriodo('Todo el historial')
    setAreaFiltro('Todas')
    setProgramaFiltro('Todos')
  }

  const exportarCsv = () => {
    const encabezados = [
      'ID',
      'Fecha',
      'Estado',
      'Área',
      'Centro',
      'Servicio',
      'Solicitante',
      'Programa',
      'Responsable',
    ]
    const escapar = (v: string) => `"${v.replace(/"/g, '""')}"`
    const filas = filtradas.map((s) =>
      [
        s.id,
        s.fecha.slice(0, 10),
        s.estado,
        s.centro,
        s.subcentro,
        s.servicio,
        s.tipoSolicitante,
        s.programa ?? 'Apoyo espiritual',
        s.responsable ?? 'Sin asignar',
      ]
        .map(escapar)
        .join(';'),
    )
    const contenido = `\uFEFF${[encabezados.join(';'), ...filas].join('\n')}`
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estadisticas-humanizacion-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          titulo="Estadísticas"
          subtitulo={`Mostrando ${filtradas.length} de ${solicitudes.length} solicitudes registradas.`}
        />
        <Button
          variante="outline"
          relieve
          icono={Download}
          onClick={exportarCsv}
          disabled={filtradas.length === 0}
        >
          Descargar CSV (Excel)
        </Button>
      </div>

      {/* Barra de filtros */}
      <section className="rounded-2xl border border-linea bg-superficie p-3.5 shadow-sm">
        <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <CampoLista
            etiqueta="Período"
            textoVacio=""
            opciones={PERIODOS}
            value={periodo}
            onChange={(e) => setPeriodo((e.target.value as PeriodoFiltro) || 'Todo el historial')}
          />
          <CampoLista
            etiqueta="Área de atención"
            textoVacio=""
            opciones={['Todas', ...tiposDeCentro()]}
            value={areaFiltro}
            onChange={(e) => setAreaFiltro(e.target.value || 'Todas')}
          />
          <CampoLista
            etiqueta="Programa"
            textoVacio=""
            opciones={['Todos', 'Apoyo espiritual', ...config.programas.map((p) => p.sigla)]}
            value={programaFiltro}
            onChange={(e) => setProgramaFiltro(e.target.value || 'Todos')}
          />
          {hayFiltrosActivos && (
            <Button tamano="sm" variante="ghost" icono={FilterX} onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </section>

      {/* Fila de KPIs principales */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icono={ClipboardList} etiqueta="Total solicitudes" valor={kpis.total} tono="purple" />
        <Kpi icono={Clock} etiqueta="Activas (pendiente / proceso)" valor={kpis.abiertas} tono="blue" />
        <Kpi
          icono={CheckCircle2}
          etiqueta={`Cerradas (${kpis.tasaCierre}% resolución)`}
          valor={kpis.cerradas}
          tono="green"
        />
        <Kpi
          icono={AlertTriangle}
          etiqueta={`Sin atender (> ${config.horasEscalamiento}h)`}
          valor={kpis.sinAtender}
          tono={kpis.sinAtender > 0 ? 'red' : 'amber'}
        />
      </div>

      {/* Grilla ordenada de 6 gráficos (3 filas x 2 columnas) */}
      <div className="grid gap-4 md:grid-cols-2">
        <TarjetaGrafico
          titulo="1. Estado de las solicitudes"
          subtitulo="Distribución actual según etapa de gestión."
        >
          {d.estado.length === 0 ? (
            <div className="grid h-full place-items-center text-xs text-tinta-3">
              Sin datos para mostrar.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  isAnimationActive={false}
                  data={d.estado}
                  dataKey="total"
                  nameKey="nombre"
                  cx="42%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={84}
                  paddingAngle={3}
                  label={({ value }) => `${value}`}
                >
                  {d.estado.map((e) => (
                    <Cell key={e.nombre} fill={COLORES_ESTADO[e.nombre] ?? MORADO} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(138, 63, 168, 0.2)',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </TarjetaGrafico>

        <TarjetaGrafico
          titulo="2. Evolución mensual"
          subtitulo="Volumen de solicitudes recibidas por mes."
        >
          <Barras datos={d.mes} color={AZUL} />
        </TarjetaGrafico>

        <TarjetaGrafico
          titulo="3. Demanda por programa"
          subtitulo="Apoyo espiritual vs. PAEC y PARES."
        >
          <Barras datos={d.programa} multicolor />
        </TarjetaGrafico>

        <TarjetaGrafico
          titulo="4. Quién solicita el apoyo"
          subtitulo="Distribución según estamento o perfil del solicitante."
        >
          <Barras datos={d.tipo} multicolor />
        </TarjetaGrafico>

        <TarjetaGrafico
          titulo="5. Top 8 centros con mayor demanda"
          subtitulo="Hospitales y centros médicos ordenados de mayor a menor."
        >
          <Barras datos={d.centro} horizontal color={MORADO} />
        </TarjetaGrafico>

        <TarjetaGrafico
          titulo={
            vistaRanking === 'servicio'
              ? '6. Top 8 servicios clínicos'
              : '6. Asignación por responsable'
          }
          subtitulo={
            vistaRanking === 'servicio'
              ? 'Unidades clínicas con más solicitudes.'
              : 'Carga de solicitudes asignadas por integrante.'
          }
          accion={
            <div className="inline-flex rounded-lg border border-linea bg-fondo p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setVistaRanking('servicio')}
                className={cn(
                  'cursor-pointer rounded-md px-2.5 py-1 font-medium transition-colors',
                  vistaRanking === 'servicio'
                    ? 'bg-uc-purple text-white'
                    : 'text-tinta-2 hover:text-tinta',
                )}
              >
                Por servicio
              </button>
              <button
                type="button"
                onClick={() => setVistaRanking('responsable')}
                className={cn(
                  'cursor-pointer rounded-md px-2.5 py-1 font-medium transition-colors',
                  vistaRanking === 'responsable'
                    ? 'bg-uc-purple text-white'
                    : 'text-tinta-2 hover:text-tinta',
                )}
              >
                Por responsable
              </button>
            </div>
          }
        >
          <Barras
            datos={vistaRanking === 'servicio' ? d.servicio : d.responsable}
            horizontal
            color={vistaRanking === 'servicio' ? AZUL : VERDE}
          />
        </TarjetaGrafico>
      </div>

      {/* Mapa de calor ancho completo */}
      <MapaDeCalor solicitudes={filtradas} />
    </div>
  )
}