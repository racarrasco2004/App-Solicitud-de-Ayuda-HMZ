import { ArrowRight, ClipboardPlus, HandHeart, Inbox, Pause, Phone, Play, UserCheck } from 'lucide-react'
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
      <header className="animar-aparecer gradiente-marca relative overflow-hidden rounded-3xl p-6 text-white shadow-md md:p-9">
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

      <CarruselAnuncios />

      {/* Programas */}
      <section aria-label="Nuestros programas">
        <h2 className="fuente-cercana mb-3 text-2xl font-bold text-uc-purple-texto">Nuestros programas</h2>
        <div className="escalonar grid gap-4 md:grid-cols-3">
          {[
            ...programas.map((p) => ({ id: p.sigla.toLowerCase(), logo: p.logo, alt: p.nombre, texto: p.descripcion })),
            { id: 'espiritual', logo: espiritual, alt: 'Área de Asistencia Espiritual y Pastoral', texto: 'Acompañamiento espiritual para pacientes y familias, desde cualquier religión o creencia. Lo pides tú, por ellos.' },
          ].map((p) => (
            <Link key={p.id} to={`/programas#${p.id}`} className="alza flex flex-col rounded-3xl border border-linea bg-superficie p-4 shadow-sm">
              <span className="flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-white p-2">
                <img src={p.logo} alt={p.alt} className="h-full w-auto max-w-full object-contain" />
              </span>
              <p className="mt-3 flex-1 text-sm text-tinta-2">{p.texto}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-uc-purple-texto">
                Conocer más <ArrowRight size={14} aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="animar-aparecer"><ComoAvanza /></div>

      <section aria-label="Humanización y Misión y RSE" className="flex flex-wrap items-center gap-5 rounded-3xl border border-linea bg-superficie p-5 shadow-sm">
        <LogosAreas alto="h-14" className="p-3" />
        <p className="min-w-60 flex-1 text-sm text-tinta-2">
          Humanización y Misión y RSE trabajan de la mano para cuidar a pacientes, familias y colaboradores de la red, desde la cultura, la vinculación con el medio, el fin de vida y el apoyo a colaboradores.
        </p>
      </section>
    </div>
  )
}
