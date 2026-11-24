import { ArrowLeft, Check, Save, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, EstadoBadge, ProgramaBadge, TipoBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CampoLista } from '@/components/ui/Campos'
import { EstadoVacio } from '@/components/ui/EstadoVacio'
import { PageHeader } from '@/components/ui/PageHeader'
import { horasDesde } from '@/config/escalamiento'
import { useCatalogos } from '@/context/CatalogosContext'
import { useConfiguracionPortal } from '@/context/ConfiguracionPortalContext'
import { useSolicitudes } from '@/context/SolicitudesContext'
import type { Estado, Solicitud } from '@/types'
import { cn } from '@/utils/cn'
import { fechaYHora } from '@/utils/formato'

const estados: { valor: Estado; activo: string }[] = [
  { valor: 'Pendiente', activo: 'border-uc-amber-borde bg-uc-amber-light text-uc-amber-texto' },
  { valor: 'En proceso', activo: 'border-uc-blue-borde bg-uc-blue-light text-uc-blue-texto' },
  { valor: 'Cerrada', activo: 'border-uc-green-borde bg-uc-green-light text-uc-green-texto' },
]

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-wide text-tinta-3 uppercase">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm text-tinta">{children || '—'}</dd>
    </div>
  )
}

function Gestion({ s }: { s: Solicitud }) {
  const { actualizar } = useSolicitudes()
  const { responsablesActivos } = useCatalogos()
  const opciones =
    s.responsable && !responsablesActivos.includes(s.responsable)
      ? [s.responsable, ...responsablesActivos]
      : responsablesActivos
  const [estado, setEstado] = useState<Estado>(s.estado)
  const [responsable, setResponsable] = useState(s.responsable ?? '')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null)
  const [intentado, setIntentado] = useState(false)

  const falta = estado !== 'Pendiente' && !responsable
  const cambio = estado !== s.estado || (responsable || null) !== s.responsable

  const guardar = async () => {
    setIntentado(true)
    if (falta) return
    setGuardando(true)
    setMensaje(null)
    try {
      await actualizar(s.id, { estado, responsable: responsable || null })
      setMensaje({ ok: true, texto: 'Cambios guardados.' })
    } catch {
      setMensaje({ ok: false, texto: 'No pudimos guardar. Intenta de nuevo.' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="rounded-2xl border border-linea bg-superficie p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-tinta">Gestión</h2>
      <fieldset className="mb-3">
        <legend className="mb-1.5 text-xs font-bold tracking-wide text-uc-purple-texto uppercase">Estado</legend>
        <div className="grid grid-cols-3 gap-2">
          {estados.map((e) => (
            <button
              key={e.valor}
              type="button"
              aria-pressed={estado === e.valor}
              onClick={() => setEstado(e.valor)}
              className={cn(
                'relieve flex cursor-pointer items-center justify-center gap-1 rounded-lg border px-2 py-2.5 text-sm font-semibold',
                estado === e.valor ? e.activo : 'border-linea-fuerte/50 bg-superficie text-tinta-2',
              )}
            >
              {estado === e.valor && <Check size={14} aria-hidden />}
              {e.valor}
            </button>
          ))}
        </div>
      </fieldset>
      <CampoLista
        etiqueta="Responsable"
        obligatorio={estado !== 'Pendiente'}
        textoVacio="Sin asignar"
        opciones={opciones}
        value={responsable}
        onChange={(e) => setResponsable(e.target.value)}
        error={intentado && falta ? 'Elige a la persona responsable para pasar de Pendiente.' : ''}
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button relieve icono={Save} cargando={guardando} disabled={!cambio} onClick={guardar}>
          Guardar cambios
        </Button>
        {mensaje && (
          <p role="status" className={cn('text-sm', mensaje.ok ? 'text-uc-green-texto' : 'text-uc-red-texto')}>
            {mensaje.texto}
          </p>
        )}
      </div>
    </section>
  )
}

export function DetalleSolicitud() {
  const { id } = useParams()
  const { solicitudes, cargando } = useSolicitudes()
  const { config } = useConfiguracionPortal()
  const s = solicitudes.find((x) => x.id === id)

  if (cargando && !s) return <p className="p-8 text-center text-sm text-tinta-3">Cargando…</p>
  if (!s) {
    return (
      <div className="rounded-2xl border border-linea bg-superficie shadow-sm">
        <EstadoVacio
          icono={TriangleAlert}
          titulo="No encontramos esa solicitud"
          accion={<Link to="/solicitudes"><Button relieve>Volver a solicitudes</Button></Link>}
        />
      </div>
    )
  }

  const sinAtender = s.estado === 'Pendiente' && horasDesde(s.fecha) > config.horasEscalamiento

  return (
    <>
      <Link to="/solicitudes" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-uc-purple-texto hover:underline">
        <ArrowLeft size={16} aria-hidden /> Volver a solicitudes
      </Link>
      <PageHeader titulo={s.id} subtitulo={`Recibida el ${fechaYHora(s.fecha)}`} acciones={<EstadoBadge estado={s.estado} />} />

      {sinAtender && (
        <p className="mb-4 flex items-start gap-2 rounded-lg border border-uc-red-borde bg-uc-red-light p-3 text-sm text-uc-red-texto">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden />
          Lleva más de {config.horasEscalamiento} horas pendiente. Debe escalarse a la jefatura de Humanización y Misión y RSE.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-linea bg-superficie p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-tinta">Datos de la solicitud</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Dato etiqueta="Apoyo para"><TipoBadge tipo={s.tipoSolicitante} /></Dato>
            <Dato etiqueta="Programa">{s.programa ? <ProgramaBadge programa={s.programa} /> : <Badge tono="muted">Apoyo espiritual</Badge>}</Dato>
            <Dato etiqueta="Persona a acompañar">{s.personaApoyo}</Dato>
            <Dato etiqueta="Solicita">{s.solicitante}</Dato>
            <Dato etiqueta="Teléfono de quien solicita">{s.telefono}</Dato>
            <Dato etiqueta="Centro">{s.subcentro}</Dato>
            <Dato etiqueta="Servicio">{s.servicio}</Dato>
            <Dato etiqueta="Tipo de centro">{s.centro}</Dato>
            {s.apoyoEspiritual && <Dato etiqueta="Apoyo espiritual">{s.apoyoEspiritual}</Dato>}
            <Dato etiqueta="Religión o creencia">{s.religion}</Dato>
          </dl>
          <div className="mt-4">
            <p className="text-xs font-bold tracking-wide text-tinta-3 uppercase">Comentario</p>
            <p className="mt-0.5 rounded-lg bg-superficie-2 p-3 text-sm text-tinta-2">{s.comentario || 'Sin comentario.'}</p>
          </div>
        </section>
        <Gestion s={s} />
      </div>
    </>
  )
}