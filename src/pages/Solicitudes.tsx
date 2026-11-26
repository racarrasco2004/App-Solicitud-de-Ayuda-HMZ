import {
  CircleCheck,
  ClipboardList,
  Clock,
  Eye,
  Hourglass,
  Search,
  TriangleAlert,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, EstadoBadge, ProgramaBadge, TipoBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CampoLista } from '@/components/ui/Campos'
import { EstadoVacio } from '@/components/ui/EstadoVacio'
import { Kpi } from '@/components/ui/Kpi'
import { PageHeader } from '@/components/ui/PageHeader'
import { horasDesde } from '@/config/escalamiento'
import { useCatalogos } from '@/context/CatalogosContext'
import { useConfiguracionPortal } from '@/context/ConfiguracionPortalContext'
import { useSolicitudes } from '@/context/SolicitudesContext'
import type { Solicitud } from '@/types'
import { fechaCorta } from '@/utils/formato'

const estados = ['Pendiente', 'En proceso', 'Cerrada']
const tipos = ['Paciente', 'Familiar', 'Colaborador', 'Equipo']
const programasOpc = ['PAEC', 'PARES']

export function Solicitudes() {
  const { solicitudes, cargando, error } = useSolicitudes()
  const { tiposDeCentro } = useCatalogos()
  const { config } = useConfiguracionPortal()

  const [busca, setBusca] = useState('')
  const [estado, setEstado] = useState('')
  const [tipo, setTipo] = useState('')
  const [programa, setPrograma] = useState('')
  const [centro, setCentro] = useState('')
  const [soloSinAtender, setSoloSinAtender] = useState(false)

  const sinAtender = useCallback(
    (s: Solicitud) => s.estado === 'Pendiente' && horasDesde(s.fecha) > config.horasEscalamiento,
    [config.horasEscalamiento],
  )

  const kpi = useMemo(
    () => ({
      total: solicitudes.length,
      pendientes: solicitudes.filter((s) => s.estado === 'Pendiente').length,
      proceso: solicitudes.filter((s) => s.estado === 'En proceso').length,
      cerradas: solicitudes.filter((s) => s.estado === 'Cerrada').length,
      sinAtender: solicitudes.filter(sinAtender).length,
    }),
    [solicitudes, sinAtender],
  )

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return solicitudes.filter(
      (s) =>
        (!estado || s.estado === estado) &&
        (!tipo || s.tipoSolicitante === tipo) &&
        (!programa || s.programa === programa) &&
        (!centro || s.centro === centro) &&
        (!soloSinAtender || sinAtender(s)) &&
        (!q ||
          [s.id, s.solicitante, s.subcentro, s.servicio, s.responsable ?? '']
            .join(' ')
            .toLowerCase()
            .includes(q)),
    )
  }, [solicitudes, busca, estado, tipo, programa, centro, soloSinAtender, sinAtender])

  const hayFiltros = Boolean(busca || estado || tipo || programa || centro || soloSinAtender)
  const limpiar = () => {
    setBusca('')
    setEstado('')
    setTipo('')
    setPrograma('')
    setCentro('')
    setSoloSinAtender(false)
  }

  return (
    <>
      <PageHeader
        titulo="Solicitudes"
        subtitulo={`Todas las solicitudes de apoyo que llegan al equipo de ${config.nombreArea}.`}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi icono={ClipboardList} etiqueta="Total" valor={kpi.total} />
        <Kpi icono={Hourglass} etiqueta="Pendientes" valor={kpi.pendientes} tono="amber" />
        <Kpi icono={Clock} etiqueta="En proceso" valor={kpi.proceso} tono="blue" />
        <Kpi icono={CircleCheck} etiqueta="Cerradas" valor={kpi.cerradas} tono="green" />
        <button
          type="button"
          onClick={() => setSoloSinAtender((v) => !v)}
          aria-pressed={soloSinAtender}
          className="col-span-2 cursor-pointer text-left lg:col-span-1"
          title={`Pendientes por más de ${config.horasEscalamiento} horas`}
        >
          <Kpi
            icono={TriangleAlert}
            etiqueta={`Sin atender (+${config.horasEscalamiento} h)`}
            valor={kpi.sinAtender}
            tono="red"
          />
        </button>
      </div>

      <section className="mb-4 rounded-2xl border border-linea bg-superficie p-4 shadow-sm">
        <div className="relative mb-3">
          <Search
            size={16}
            aria-hidden
            className="absolute top-1/2 left-3 -translate-y-1/2 text-tinta-3"
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por código, nombre, centro, servicio o responsable…"
            aria-label="Buscar solicitudes"
            className="h-10 w-full rounded-md border border-linea-fuerte/60 bg-superficie pr-3 pl-9 text-sm focus:border-uc-blue focus:ring-2 focus:ring-uc-blue/30 focus:outline-none"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CampoLista
            etiqueta="Estado"
            textoVacio="Todos"
            opciones={estados}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          />
          <CampoLista
            etiqueta="Apoyo para"
            textoVacio="Todos"
            opciones={tipos}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          />
          <CampoLista
            etiqueta="Programa"
            textoVacio="Todos"
            opciones={programasOpc}
            value={programa}
            onChange={(e) => setPrograma(e.target.value)}
          />
          <CampoLista
            etiqueta="Tipo de centro"
            textoVacio="Todos"
            opciones={tiposDeCentro()}
            value={centro}
            onChange={(e) => setCentro(e.target.value)}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-tinta-3">
          <span>
            {filtradas.length} de {solicitudes.length} solicitudes
          </span>
          {hayFiltros && (
            <Button variante="link" tamano="sm" onClick={limpiar}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg border border-uc-red-borde bg-uc-red-light p-3 text-sm text-uc-red-texto"
        >
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-linea bg-superficie shadow-sm">
        {cargando ? (
          <p className="p-8 text-center text-sm text-tinta-3">Cargando…</p>
        ) : filtradas.length === 0 ? (
          <EstadoVacio
            icono={ClipboardList}
            titulo="No hay solicitudes con esos filtros"
            texto="Prueba quitando algún filtro."
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="encabezado-tabla">
                  <tr className="text-left text-[0.6875rem] font-bold tracking-wide text-uc-purple-texto uppercase">
                    {[
                      'Código',
                      'Fecha',
                      'Apoyo para',
                      'Programa',
                      'Dónde',
                      'Estado',
                      'Responsable',
                      '',
                    ].map((c) => (
                      <th key={c} className="px-3 py-2.5">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-linea last:border-0 hover:bg-uc-blue-light/50"
                    >
                      <td className="px-3 py-3 font-mono font-bold whitespace-nowrap text-uc-purple-texto">
                        {s.id}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">{fechaCorta(s.fecha)}</td>
                      <td className="px-3 py-3">
                        <TipoBadge tipo={s.tipoSolicitante} />
                        <p className="mt-0.5 text-xs text-tinta-3">{s.solicitante}</p>
                      </td>
                      <td className="px-3 py-3">
                        <ProgramaBadge programa={s.programa} />
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold">{s.subcentro}</p>
                        <p className="text-xs text-tinta-3">{s.servicio}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <EstadoBadge estado={s.estado} />
                          {sinAtender(s) && <Badge tono="red">Sin atender</Badge>}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-tinta-2">{s.responsable ?? 'Por asignar'}</td>
                      <td className="px-3 py-3">
                        <Link to={`/solicitudes/${s.id}`}>
                          <Button tamano="sm" variante="blue" relieve icono={Eye} tabIndex={-1}>
                            Ver
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-linea md:hidden">
              {filtradas.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/solicitudes/${s.id}`}
                    className="block space-y-1.5 p-4 hover:bg-superficie-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-uc-purple-texto">{s.id}</span>
                      <EstadoBadge estado={s.estado} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <TipoBadge tipo={s.tipoSolicitante} />
                      {s.programa && <ProgramaBadge programa={s.programa} />}
                      {sinAtender(s) && <Badge tono="red">Sin atender</Badge>}
                    </div>
                    <p className="text-sm font-semibold">
                      {s.subcentro}{' '}
                      <span className="font-normal text-tinta-3">· {s.servicio}</span>
                    </p>
                    <p className="text-xs text-tinta-3">
                      {fechaCorta(s.fecha)} · {s.responsable ?? 'Por asignar'}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}