import { Check, ChevronDown, ExternalLink, HandHeart, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import espiritual from '@/assets/marca/area-espiritual.png'
import { Button } from '@/components/ui/Button'
import { useConfiguracionPortal } from '@/context/ConfiguracionPortalContext'
import { cn } from '@/utils/cn'

function Lista({ puntos }: { puntos: string[] }) {
  return (
    <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
      {puntos.map((p) => (
        <li key={p} className="flex gap-2 text-sm text-tinta-2">
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-uc-green-light text-uc-green-texto">
            <Check size={12} aria-hidden />
          </span>
          {p}
        </li>
      ))}
    </ul>
  )
}

interface Item {
  id: string
  logo: string
  alt: string
  resumen: string
  detalle: ReactNode
}

export function ProgramasDesplegables() {
  const { hash } = useLocation()
  const { config } = useConfiguracionPortal()
  const [abierto, setAbierto] = useState<string | null>(null)

  const items: Item[] = useMemo(() => {
    const paec = config.programas.find((p) => p.sigla === 'PAEC') ?? config.programas[0]
    const pares = config.programas.find((p) => p.sigla === 'PARES') ?? config.programas[1]

    return [
      {
        id: 'paec',
        logo: paec.logo,
        alt: paec.nombre,
        resumen: 'Apoyo emocional con psicólogo/a para colaboradores. Incluye talleres grupales.',
        detalle: (
          <>
            <p className="text-sm font-semibold text-tinta">{paec.descripcion}</p>
            <Lista puntos={paec.puntos} />
            <div className="rounded-2xl bg-uc-purple-light p-4">
              <p className="flex items-center gap-2 text-sm font-extrabold text-uc-purple-texto">
                <Sparkles size={16} aria-hidden /> Espacio Libre de Estrés
              </p>
              <p className="mt-1 mb-2.5 text-sm text-tinta-2">Talleres grupales de salud mental, prevención y promoción.</p>
              <div className="flex flex-wrap gap-1.5">
                {config.talleresGrupales.map((t) => (
                  <span key={t} className="rounded-full bg-superficie px-3 py-1 text-xs font-semibold text-uc-purple-texto">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <a href={config.formularioPaecUrl} target="_blank" rel="noreferrer" className="self-start">
              <Button variante="blue" relieve icono={ExternalLink} tabIndex={-1}>
                Agendar mi atención
              </Button>
            </a>
          </>
        ),
      },
      {
        id: 'pares',
        logo: pares.logo,
        alt: pares.nombre,
        resumen: 'Colegas que te acompañan después de un evento difícil.',
        detalle: (
          <>
            <p className="text-sm font-semibold text-tinta">{pares.nombre}</p>
            <Lista puntos={pares.puntos} />
            <Link to="/nueva-solicitud" className="self-start">
              <Button relieve icono={HandHeart} tabIndex={-1}>
                Pedir apoyo PARES
              </Button>
            </Link>
          </>
        ),
      },
      {
        id: 'espiritual',
        logo: espiritual,
        alt: 'Área de Asistencia Espiritual y Pastoral',
        resumen: 'Acompañamiento espiritual para pacientes, familias y colaboradores.',
        detalle: (
          <>
            <p className="text-sm text-tinta-2">
              Puedes pedir acompañamiento espiritual para un paciente, su familia, para ti o para tu equipo, desde cualquier religión o creencia.
              Lo entrega el Área de Asistencia Espiritual y Pastoral.
            </p>
            <Lista puntos={config.tiposApoyoEspiritual} />
            <Link to="/nueva-solicitud" className="self-start">
              <Button relieve icono={HandHeart} tabIndex={-1}>
                Pedir acompañamiento
              </Button>
            </Link>
          </>
        ),
      },
    ]
  }, [config])

  useEffect(() => {
    const id = hash.slice(1)
    if (items.some((i) => i.id === id)) setAbierto(id)
  }, [hash, items])

  return (
    <section id="programas" aria-label="Nuestros programas" className="scroll-mt-24 rounded-3xl border border-linea bg-superficie p-5 shadow-sm">
      <h2 className="fuente-cercana mb-2 text-2xl font-bold text-uc-purple-texto">Nuestros programas</h2>
      <ul className="divide-y divide-linea">
        {items.map((p) => {
          const activo = abierto === p.id
          return (
            <li key={p.id} id={p.id} className="scroll-mt-24">
              <button
                type="button"
                aria-expanded={activo}
                aria-controls={`detalle-${p.id}`}
                onClick={() => setAbierto(activo ? null : p.id)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-4 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-uc-purple-light',
                  activo && 'bg-uc-purple-light',
                )}
              >
                <span className="flex h-14 w-32 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 ring-1 ring-linea">
                  <img src={p.logo} alt={p.alt} className="h-full w-auto max-w-full object-contain" />
                </span>
                <span className="flex-1 text-sm text-tinta-2">{p.resumen}</span>
                <span className="hidden text-xs font-bold text-uc-purple-texto sm:inline">{activo ? 'Cerrar' : 'Ver más'}</span>
                <ChevronDown size={20} className={cn('shrink-0 text-uc-purple-texto transition-transform duration-300', activo && 'rotate-180')} aria-hidden />
              </button>
              <div
                id={`detalle-${p.id}`}
                className={cn('grid transition-[grid-template-rows] duration-300 ease-out', activo ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
              >
                <div className="overflow-hidden" inert={!activo}>
                  <div className="flex flex-col gap-4 px-2 pt-3 pb-5">{p.detalle}</div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}