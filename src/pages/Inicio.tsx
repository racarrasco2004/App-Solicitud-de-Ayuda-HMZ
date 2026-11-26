import {
  ClipboardList,
  ClipboardPlus,
  HandHeart,
  Inbox,
  Megaphone,
  Phone,
  UserCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import edificio from '@/assets/edificio-uc-christus.jpg'
import { CarruselAnuncios } from '@/components/CarruselAnuncios'
import { ProgramasDesplegables } from '@/components/ProgramasDesplegables'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useConfiguracionPortal } from '@/context/ConfiguracionPortalContext'
import { cn } from '@/utils/cn'

const ICONOS_PASOS = [ClipboardPlus, Inbox, UserCheck, Phone]

function ComoAvanza() {
  const { config } = useConfiguracionPortal()
  const pasos = config.pasosInicio
  const [paso, setPaso] = useState(0)
  const [interactuado, setInteractuado] = useState(false)

  useEffect(() => {
    if (interactuado || pasos.length === 0) return
    const t = setTimeout(() => setPaso((p) => (p + 1) % pasos.length), 3500)
    return () => clearTimeout(t)
  }, [interactuado, paso, pasos.length])

  const pasoActual = pasos[paso] ?? pasos[0]

  return (
    <section
      aria-label="Cómo funciona el acompañamiento"
      className="rounded-3xl border border-linea bg-superficie p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2 className="fuente-cercana text-2xl font-bold text-uc-purple-texto">
          Cómo avanzará tu solicitud
        </h2>
        <p className="mt-0.5 text-xs text-tinta-3">
          Selecciona cada etapa para revisar qué ocurre después de enviar tu formulario.
        </p>
      </div>

      <ol className="grid gap-2 md:grid-cols-4">
        {pasos.map(({ titulo }, i) => {
          const Icono = ICONOS_PASOS[i % ICONOS_PASOS.length]
          return (
            <li key={`${titulo}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  setPaso(i)
                  setInteractuado(true)
                }}
                aria-current={i === paso}
                className={cn(
                  'relative flex w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 md:flex-col md:text-center',
                  i === paso
                    ? 'gradiente-marca border-transparent text-white shadow-xs'
                    : 'border-linea bg-superficie-2 text-tinta-2 hover:border-uc-purple/40',
                )}
              >
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full',
                    i === paso ? 'bg-white/20' : 'bg-superficie text-uc-purple-texto',
                  )}
                >
                  <Icono size={18} aria-hidden />
                </span>
                <span className="text-sm font-bold">
                  {i + 1}. {titulo}
                </span>
                {i === paso && !interactuado && (
                  <span
                    key={paso}
                    className="barra-avance absolute inset-x-0 bottom-0 h-1 bg-white/70"
                    aria-hidden
                  />
                )}
              </button>
            </li>
          )
        })}
      </ol>

      {pasoActual && (
        <p
          className="mt-3 rounded-xl bg-uc-purple-light px-4 py-2.5 text-sm text-uc-purple-texto"
          aria-live="polite"
        >
          {pasoActual.texto}
        </p>
      )}
    </section>
  )
}

export function Inicio() {
  const { usuario } = useAuth()
  const { config } = useConfiguracionPortal()
  if (!usuario) return null

  const esGestion = usuario.rol === 'coordinador' || usuario.rol === 'administrador'

  return (
    <div className="space-y-6">
      <header className="animar-aparecer gradiente-marca hero-tech destello relative overflow-hidden rounded-3xl p-6 text-white shadow-lg md:p-9">
        <span className="rejilla absolute inset-0" aria-hidden />
        <img
          src={edificio}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-15 mix-blend-luminosity"
        />
        <span
          className="flotar absolute -top-10 right-10 size-44 rounded-full bg-white/10 blur-sm"
          aria-hidden
        />
        <span
          className="flotar absolute -right-8 bottom-4 size-28 rounded-full bg-white/10"
          style={{ animationDelay: '-3s' }}
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <p className="mb-1.5 text-xs font-bold tracking-wider text-white/85 uppercase">
            {config.nombreArea} · Red de Salud UC CHRISTUS
          </p>
          <h1 className="fuente-cercana text-3xl leading-tight font-bold md:text-5xl">
            Portal de Apoyo Emocional y Espiritual
          </h1>
          <p className="mt-3 text-base text-white/90">{config.descripcionRoles[usuario.rol]}</p>

          <div className="mt-6">
            {esGestion ? (
              <Link to="/solicitudes">
                <Button
                  variante="outline"
                  tamano="lg"
                  relieve
                  icono={ClipboardList}
                  tabIndex={-1}
                  className="border-white !bg-white !text-uc-purple"
                >
                  Gestionar solicitudes
                </Button>
              </Link>
            ) : (
              <Link to="/nueva-solicitud">
                <Button
                  variante="outline"
                  tamano="lg"
                  relieve
                  icono={HandHeart}
                  tabIndex={-1}
                  className="border-white !bg-white !text-uc-purple"
                >
                  Solicitar acompañamiento
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {config.avisoPortada && (
        <div
          role="status"
          className="animar-aparecer flex items-start gap-3 rounded-2xl border border-uc-purple/25 bg-uc-purple-light px-4 py-3.5 text-sm text-uc-purple-texto shadow-xs"
        >
          <Megaphone size={18} className="mt-0.5 shrink-0" aria-hidden />
          <p className="font-medium">{config.avisoPortada}</p>
        </div>
      )}

      {!esGestion && (
        <div className="animar-aparecer">
          <ComoAvanza />
        </div>
      )}

      <ProgramasDesplegables />

      <CarruselAnuncios />
    </div>
  )
}