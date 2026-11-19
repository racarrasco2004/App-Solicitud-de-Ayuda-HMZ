import { ChevronLeft, ChevronRight, ImageOff, Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useAnuncios } from '@/context/AnunciosContext'

/** Tarjetas deslizantes con foto y texto. Se desliza con el dedo, con las flechas o solo cada pocos segundos. */
const DURACION_MS = 5000

export function CarruselAnuncios({ titulo = 'Novedades y campañas' }: { titulo?: string }) {
  const { visibles, srcDe } = useAnuncios()
  const pista = useRef<HTMLDivElement>(null)
  const [pausado, setPausado] = useState(false)
  const [encima, setEncima] = useState(false)
  const [ciclo, setCiclo] = useState(0)
  const [desborda, setDesborda] = useState(false)
  const detenido = pausado || encima

  // Si todas las tarjetas caben en pantalla no hay nada que mover: se ocultan los controles
  useEffect(() => {
    const el = pista.current
    if (!el) return
    const medir = () => setDesborda(el.scrollWidth > el.clientWidth + 8)
    medir()
    const obs = new ResizeObserver(medir)
    obs.observe(el)
    return () => obs.disconnect()
  }, [visibles.length])

  const mover = (dir: 1 | -1) => {
    const el = pista.current
    if (!el) return
    const paso = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth
    const alFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
    if (dir === 1 && alFinal) el.scrollTo({ left: 0, behavior: 'smooth' })
    else el.scrollBy({ left: dir * (paso + 16), behavior: 'smooth' })
  }

  // Cada vuelta del círculo mueve la tarjeta; «ciclo» reinicia el reloj y el círculo juntos
  useEffect(() => {
    if (detenido || !desborda) return
    const t = setTimeout(() => {
      mover(1)
      setCiclo((c) => c + 1)
    }, DURACION_MS)
    return () => clearTimeout(t)
  }, [detenido, desborda, ciclo])

  const manual = (dir: 1 | -1) => {
    mover(dir)
    setCiclo((c) => c + 1)
  }

  if (visibles.length === 0) return null

  return (
    <section aria-label={titulo} onMouseEnter={() => setEncima(true)} onMouseLeave={() => setEncima(false)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="fuente-cercana text-2xl font-bold text-uc-purple-texto">{titulo}</h2>
        {desborda && (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setPausado((p) => !p)} aria-label={pausado ? 'Reanudar el avance automático' : 'Pausar el avance automático'} title="El círculo se llena cuando va a pasar a la siguiente tarjeta" className="relative grid size-9 cursor-pointer place-items-center rounded-full bg-superficie text-tinta-2 hover:bg-superficie-2">
              <svg viewBox="0 0 36 36" className="pointer-events-none absolute inset-0 -rotate-90" aria-hidden>
                <circle cx="18" cy="18" r="16.5" fill="none" strokeWidth="2.5" className="stroke-linea" />
                {!detenido && (
                  <circle key={ciclo} cx="18" cy="18" r="16.5" fill="none" strokeWidth="2.5" strokeLinecap="round" pathLength={100} className="anillo-progreso stroke-uc-purple" style={{ '--dur': `${DURACION_MS}ms` } as CSSProperties} />
                )}
              </svg>
              {pausado ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
            </button>
            <button type="button" onClick={() => manual(-1)} aria-label="Anterior" className="grid size-9 cursor-pointer place-items-center rounded-full border border-linea bg-superficie text-tinta-2 hover:bg-superficie-2">
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button type="button" onClick={() => manual(1)} aria-label="Siguiente" className="grid size-9 cursor-pointer place-items-center rounded-full border border-linea bg-superficie text-tinta-2 hover:bg-superficie-2">
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        )}
      </div>
      <div
        ref={pista}
        tabIndex={0}
        aria-label="Tarjetas, desliza para ver más"
        onPointerDown={() => setCiclo((c) => c + 1)}
        className="escalonar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-3 [scrollbar-width:thin]"
      >
        {visibles.map((a) => {
          const src = srcDe(a.imagen)
          return (
            <article key={a.id} className="group alza w-[85%] shrink-0 snap-start overflow-hidden rounded-3xl border border-linea bg-superficie shadow-sm sm:w-[46%] lg:w-[32%]">
              <div className="aspect-[16/9] overflow-hidden bg-white">
                {src ? (
                  <img src={src} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <span className="grid size-full place-items-center bg-superficie-3 text-tinta-3"><ImageOff size={28} aria-hidden /></span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-base font-extrabold text-tinta">{a.titulo}</h3>
                <p className="mt-1 text-sm text-tinta-2">{a.texto}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
