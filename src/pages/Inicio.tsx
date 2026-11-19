import { ArrowRight, Check, ClipboardPlus, HandHeart, Inbox, Pause, Phone, Play, Sparkles, UserCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import edificio from '@/assets/edificio-uc-christus.jpg'
import { AvisoHorario } from '@/components/AvisoHorario'
import { CarruselAnuncios } from '@/components/CarruselAnuncios'
import { LogosAreas } from '@/components/LogosAreas'
import espiritual from '@/assets/marca/area-espiritual.png'
import { Button } from '@/components/ui/Button'
import { descripcionDeRol } from '@/config/navegacion'
import { programas } from '@/config/programas'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'
import { primerNombre } from '@/utils/formato'

const [paec, pares] = programas

/** Todas las tarjetas comparten la misma forma: banda de logo, texto y «Conocer más» abajo */
const tarjeta = 'alza flex h-full flex-col rounded-3xl border border-linea bg-superficie p-5 shadow-sm'

function BandaLogo({ src, alt, alto = 'h-20' }: { src: string; alt: string; alto?: string }) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-2xl bg-white p-2 ring-1 ring-linea', alto)}>
      <img src={src} alt={alt} className="h-full w-auto max-w-full object-contain" />
    </span>
  )
}

function ConocerMas() {
  return (
    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-bold text-uc-purple-texto">
      Conocer más <ArrowRight size={14} aria-hidden />
    </span>
  )
}

const pasos = [
  { icono: ClipboardPlus, titulo: 'Pides apoyo', texto: 'Respondes unas pocas preguntas en el portal. Es rápido.' },
  { icono: Inbox, titulo: 'Le llega a un equipo', texto: 'Tu solicitud llega al instante al equipo de Humanización y Misión y RSE.' },
  { icono: UserCheck, titulo: 'Se asigna a tu contraparte', texto: 'Una persona del equipo se hace cargo y será quien te acompañe.' },
  { icono: Phone, titulo: 'Te contactamos', texto: 'Te llamamos al teléfono que indicaste, en horario hábil.' },
]

function ComoAvanza() {
  const [paso, setPaso] = useState(0)
  const [pausado, setPausado] = useState(false)

  // Cada paso dura 3 s: la barra de abajo se llena y entonces pasa al siguiente
  useEffect(() => {
    if (pausado) return
    const t = setTimeout(() => setPaso((p) => (p + 1) % pasos.length), 3000)
    return () => clearTimeout(t)
  }, [pausado, paso])

  return (
    <section aria-label="Cómo avanzará tu solicitud" className="rounded-3xl border border-linea bg-superficie p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="fuente-cercana text-2xl font-bold text-uc-purple-texto">Cómo avanzará tu solicitud</h2>
        <Button variante="outline" tamano="sm" icono={pausado ? Play : Pause} onClick={() => setPausado((p) => !p)}>
          {pausado ? 'Reanudar animación' : 'Pausar animación'}
        </Button>
      </div>
      <ol className="grid gap-2 md:grid-cols-4">
        {pasos.map(({ icono: Icono, titulo }, i) => (
          <li key={titulo}>
            <button
              type="button"
              onClick={() => setPaso(i)}
              aria-current={i === paso}
              className={cn(
                'relative flex w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-2xl border p-3 text-left transition-all duration-500 md:flex-col md:text-center',
                i === paso ? 'gradiente-marca border-transparent text-white' : 'border-linea bg-superficie-2 text-tinta-2',
              )}
            >
              <span className={cn('grid size-9 shrink-0 place-items-center rounded-full', i === paso ? 'bg-white/20' : 'bg-superficie text-uc-purple-texto')}>
                <Icono size={18} aria-hidden />
              </span>
              <span className="text-sm font-bold">
                {i + 1}. {titulo}
              </span>
              {i === paso && !pausado && <span key={paso} className="barra-avance absolute inset-x-0 bottom-0 h-1 bg-white/70" aria-hidden />}
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-3 rounded-xl bg-uc-purple-light px-4 py-2.5 text-sm text-uc-purple-texto" aria-live="polite">
        {pasos[paso].texto}
      </p>
      <AvisoHorario className="mt-2" />
    </section>
  )
}

export function Inicio() {
  const { usuario } = useAuth()
  if (!usuario) return null

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <header className="animar-aparecer gradiente-marca hero-tech destello relative overflow-hidden rounded-3xl p-6 text-white shadow-lg md:p-9">
        <span className="rejilla absolute inset-0" aria-hidden />
        <img src={edificio} alt="" aria-hidden className="absolute inset-0 size-full object-cover opacity-15 mix-blend-luminosity" />
        <span className="flotar absolute -top-10 right-10 size-44 rounded-full bg-white/10 blur-sm" aria-hidden />
        <span className="flotar absolute -right-8 bottom-4 size-28 rounded-full bg-white/10" style={{ animationDelay: '-3s' }} aria-hidden />
        <div className="relative max-w-2xl">
          <h1 className="fuente-cercana text-4xl leading-tight font-bold md:text-5xl">Hola, {primerNombre(usuario.nombre)}</h1>
          <p className="mt-2 text-base text-white/90">{descripcionDeRol[usuario.rol]}</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link to="/nueva-solicitud">
              <Button variante="outline" tamano="lg" relieve icono={HandHeart} tabIndex={-1} className="border-white !bg-white !text-uc-purple">
                Pedir apoyo
              </Button>
            </Link>
            <Link to="/programas">
              <Button variante="ghost" tamano="lg" tabIndex={-1} className="!text-white ring-1 ring-white/60 hover:!bg-white/15">
                Conocer los programas
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="animar-aparecer"><ComoAvanza /></div>

      {/* Programas en cuadrícula «bento»: uno destacado y los demás alrededor */}
      <section aria-label="Nuestros programas">
        <h2 className="fuente-cercana mb-3 text-2xl font-bold text-uc-purple-texto">Nuestros programas</h2>
        <div className="escalonar grid gap-4 md:grid-cols-3">
          {/* PAEC, destacado */}
          <Link to="/programas#paec" className={cn(tarjeta, 'md:col-span-2 md:row-span-2')}>
            <BandaLogo src={paec.logo} alt={paec.nombre} alto="h-28" />
            <p className="mt-4 text-base font-semibold text-tinta">{paec.descripcion}</p>
            <ul className="mt-3 grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
              {paec.puntos.map((punto) => (
                <li key={punto} className="flex gap-2 text-sm text-tinta-2">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-uc-green-light text-uc-green-texto">
                    <Check size={12} aria-hidden />
                  </span>
                  {punto}
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 rounded-2xl bg-uc-purple-light px-3 py-2 text-sm text-uc-purple-texto">
              <Sparkles size={16} className="shrink-0" aria-hidden />
              Incluye Espacio Libre de Estrés: talleres grupales de autocuidado.
            </p>
            <ConocerMas />
          </Link>

          {/* PARES */}
          <Link to="/programas#pares" className={tarjeta}>
            <BandaLogo src={pares.logo} alt={pares.nombre} />
            <p className="mt-3 text-sm text-tinta-2">{pares.descripcion}</p>
            <ConocerMas />
          </Link>

          {/* Espiritual */}
          <Link to="/programas#espiritual" className={tarjeta}>
            <BandaLogo src={espiritual} alt="Área de Asistencia Espiritual y Pastoral" />
            <p className="mt-3 text-sm text-tinta-2">Acompañamiento espiritual para pacientes y familias, desde cualquier religión o creencia. Lo pides tú, por ellos.</p>
            <ConocerMas />
          </Link>

          {/* Las dos áreas, juntas */}
          <div className={cn(tarjeta, 'md:col-span-2 md:flex-row md:items-center md:gap-5')}>
            <LogosAreas alto="h-14" className="shrink-0 self-start p-3 ring-1 ring-linea md:self-center" />
            <p className="mt-3 text-sm text-tinta-2 md:mt-0">
              Humanización y Misión y RSE trabajan de la mano para cuidar a pacientes, familias y colaboradores de la red, desde la cultura, la vinculación con el medio, el fin de vida y el apoyo a colaboradores.
            </p>
          </div>

          {/* Acción */}
          <Link to="/nueva-solicitud" className="alza hero-tech destello relative flex min-h-36 flex-col justify-between gap-4 overflow-hidden rounded-3xl p-5 text-white shadow-lg">
            <span className="rejilla absolute inset-0" aria-hidden />
            <HandHeart size={28} className="relative" aria-hidden />
            <span className="relative">
              <span className="fuente-cercana block text-2xl font-bold">¿Necesitas apoyo?</span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-white/90">
                Pedir apoyo ahora <ArrowRight size={14} aria-hidden />
              </span>
            </span>
          </Link>
        </div>
      </section>

      <CarruselAnuncios />
    </div>
  )
}
