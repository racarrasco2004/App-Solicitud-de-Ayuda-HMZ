import { Check, ExternalLink, HandHeart, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import espiritual from '@/assets/marca/area-espiritual.png'
import { CarruselAnuncios } from '@/components/CarruselAnuncios'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { FORMULARIO_PAEC_URL } from '@/config/enlaces'
import { fotosProgramas } from '@/config/fotos'
import { programas, talleresGrupales } from '@/config/programas'

const Lista = ({ puntos }: { puntos: string[] }) => (
  <ul className="space-y-2">
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

export function Programas() {
  const paec = programas[0]
  const pares = programas[1]
  return (
    <>
      <PageHeader
        titulo="Programas de apoyo"
        subtitulo="Acompañamiento para colaboradores, pacientes y familias. Elige el que se parece a lo que necesitas."
      />

      <div className="space-y-6">
        <CarruselAnuncios titulo="Campañas" />

        <div className="grid gap-5 lg:grid-cols-2">
          <section id="paec" className="flex flex-col overflow-hidden rounded-3xl border border-linea bg-superficie shadow-sm">
            <img src={fotosProgramas.paec} alt="" aria-hidden className="h-44 w-full bg-white object-contain" />
            <div className="flex flex-1 flex-col p-5">
              <img src={paec.logo} alt={`Programa ${paec.sigla}: Apoyo Emocional para Colaboradores`} className="mb-3 h-20 w-auto self-start rounded-xl bg-white p-1" />
              <p className="mb-3 text-sm text-tinta-2">Para quienes trabajan en la red de salud UC CHRISTUS.</p>
              <Lista puntos={paec.puntos} />

              <div id="talleres" className="mt-5 rounded-2xl bg-uc-purple-light p-4">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-uc-purple-texto">
                  <Sparkles size={16} aria-hidden /> Espacio Libre de Estrés
                </h3>
                <p className="mt-1 mb-2.5 text-sm text-tinta-2">
                  Talleres grupales de salud mental, prevención y promoción. Forman parte de PAEC.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {talleresGrupales.map((t) => (
                    <span key={t} className="rounded-full bg-superficie px-3 py-1 text-xs font-semibold text-uc-purple-texto">{t}</span>
                  ))}
                </div>
              </div>

              <a href={FORMULARIO_PAEC_URL} target="_blank" rel="noreferrer" className="mt-5 inline-block self-start">
                <Button variante="blue" relieve icono={ExternalLink} tabIndex={-1}>Agendar mi atención</Button>
              </a>
            </div>
          </section>

          <div className="flex flex-col gap-5">
            <section id="pares" className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-linea bg-superficie shadow-sm">
              <img src={fotosProgramas.pares} alt="" aria-hidden className="h-44 w-full object-cover" />
              <div className="flex flex-1 flex-col p-5">
                <img src={pares.logo} alt={`Programa ${pares.sigla}`} className="mb-3 h-20 w-auto self-start rounded-xl bg-white p-1" />
                <h2 className="mb-3 text-base font-bold text-tinta">{pares.nombre}</h2>
                <Lista puntos={pares.puntos} />
                <Link to="/nueva-solicitud" className="mt-5 inline-block self-start">
                  <Button relieve icono={HandHeart} tabIndex={-1}>Pedir apoyo PARES</Button>
                </Link>
              </div>
            </section>
          <section id="espiritual" className="flex flex-col items-start gap-3 rounded-3xl border border-linea bg-superficie p-5 shadow-sm">
            <img src={espiritual} alt="Área de Asistencia Espiritual y Pastoral" className="h-20 w-auto rounded-xl bg-white p-1" />
            <p className="text-sm text-tinta-2">
              Si trabajas en la red, puedes pedir acompañamiento espiritual para un paciente o su familia, desde cualquier religión o creencia.
            </p>
            <Link to="/nueva-solicitud">
              <Button variante="outline" relieve tabIndex={-1}>Pedir acompañamiento</Button>
            </Link>
          </section>
          </div>
        </div>

      </div>
    </>
  )
}
