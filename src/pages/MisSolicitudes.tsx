import { ClipboardList, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EstadoBadge, ProgramaBadge, TipoBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EstadoVacio } from '@/components/ui/EstadoVacio'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAuth } from '@/context/AuthContext'
import { useSolicitudes } from '@/context/SolicitudesContext'
import { fechaCorta } from '@/utils/formato'

export function MisSolicitudes() {
  const { usuario } = useAuth()
  const { solicitudes, cargando, error } = useSolicitudes()
  const mias = solicitudes.filter((s) => s.creadaPor === usuario?.correo)

  const nueva = (
    <Link to="/nueva-solicitud">
      <Button relieve icono={Plus}>
        Nueva solicitud
      </Button>
    </Link>
  )

  return (
    <>
      <PageHeader
        titulo="Mis solicitudes"
        subtitulo="Lo que has pedido y en qué estado va."
        acciones={nueva}
      />

      {error && (
        <p role="alert" className="mb-3 rounded-lg border border-uc-red-borde bg-uc-red-light p-3 text-sm text-uc-red-texto">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-linea bg-superficie shadow-sm">
        {cargando ? (
          <p className="p-8 text-center text-sm text-tinta-3">Cargando…</p>
        ) : mias.length === 0 ? (
          <EstadoVacio
            icono={ClipboardList}
            titulo="Aún no has hecho solicitudes"
            texto="Cuando pidas apoyo, la verás aquí con su estado."
            accion={nueva}
          />
        ) : (
          <>
            {/* Escritorio: tabla */}
            <table className="hidden w-full text-sm md:table">
              <thead className="encabezado-tabla">
                <tr className="text-left text-uc-purple-texto text-[0.6875rem] font-bold tracking-wide uppercase">
                  {['Código', 'Fecha', 'Programa', 'Apoyo para', 'Dónde', 'Estado', 'Responsable'].map((c) => (
                    <th key={c} className="px-3 py-2.5">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mias.map((s) => (
                  <tr key={s.id} className="border-b border-linea last:border-0 hover:bg-uc-blue-light/50">
                    <td className="px-3 py-3 font-bold text-uc-purple-texto">{s.id}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{fechaCorta(s.fecha)}</td>
                    <td className="px-3 py-3">
                      <ProgramaBadge programa={s.programa} />
                    </td>
                    <td className="px-3 py-3">
                      <TipoBadge tipo={s.tipoSolicitante} />
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold">{s.subcentro}</p>
                      <p className="text-xs text-tinta-3">{s.servicio}</p>
                    </td>
                    <td className="px-3 py-3">
                      <EstadoBadge estado={s.estado} />
                    </td>
                    <td className="px-3 py-3 text-tinta-2">{s.responsable ?? 'Por asignar'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Móvil: tarjetas */}
            <ul className="divide-y divide-linea md:hidden">
              {mias.map((s) => (
                <li key={s.id} className="space-y-1.5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-uc-purple-texto">{s.id}</span>
                    <EstadoBadge estado={s.estado} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <ProgramaBadge programa={s.programa} />
                    <TipoBadge tipo={s.tipoSolicitante} />
                  </div>
                  <p className="text-sm font-semibold">
                    {s.subcentro} <span className="font-normal text-tinta-3">· {s.servicio}</span>
                  </p>
                  <p className="text-xs text-tinta-3">
                    {fechaCorta(s.fecha)} · {s.responsable ?? 'Por asignar'}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
