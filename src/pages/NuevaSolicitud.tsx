import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  ExternalLink,
  HeartPulse,
  Info,
  Send,
  Sparkles,
  UserRound,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AvisoHorario } from '@/components/AvisoHorario'
import { Button } from '@/components/ui/Button'
import { CampoLista, CampoTexto, CampoTextoLargo } from '@/components/ui/Campos'
import { FORMULARIO_PAEC_URL, TEXTO_UIC } from '@/config/enlaces'
import { AREAS } from '@/config/marca'
import { programas } from '@/config/programas'
import { useCatalogos } from '@/context/CatalogosContext'
import { useSolicitudes } from '@/context/SolicitudesContext'
import {
  OTRO_SERVICIO,
  religiones,
} from '@/data/catalogos'
import type { Programa, Solicitud, TipoSolicitante } from '@/types'
import { cn } from '@/utils/cn'
import { validarNombre, validarTelefono } from '@/utils/validaciones'

type Apoyo = Programa | 'UIC' | ''
type Paso = 'donde' | 'quien' | 'fe' | 'apoyo' | 'contacto' | 'revisar'

const tipos: { valor: TipoSolicitante; titulo: string; texto: string; icono: LucideIcon }[] = [
  { valor: 'Paciente', titulo: 'Para un paciente', texto: 'Una persona hospitalizada o en atención a quien quieres que acompañemos.', icono: HeartPulse },
  { valor: 'Familiar', titulo: 'Para un familiar', texto: 'Alguien de la familia de un paciente, para que también reciba apoyo.', icono: Users },
  { valor: 'Colaborador', titulo: 'Para mí', texto: 'Tú, que trabajas en la red y necesitas apoyo.', icono: UserRound },
  { valor: 'Equipo', titulo: 'Para mi equipo', texto: 'Tu equipo de trabajo, para que lo acompañemos juntos.', icono: UsersRound },
]

const opcionesApoyo: { clave: Apoyo; titulo: string; texto: string }[] = [
  { clave: 'PAEC', titulo: 'Apoyo emocional - Psicólogo/a', texto: 'Conversar con un psicólogo/a y sentirte acompañado(a).' },
  { clave: 'PARES', titulo: 'Evento difícil - PARES', texto: 'Tú o alguien de tu equipo vivió un evento muy estresante o de seguridad grave.' },
  { clave: 'UIC', titulo: 'Crisis en tu unidad - UIC', texto: 'Quieres saber cómo pedir una intervención en crisis.' },
]

function Pregunta({ titulo, texto, children }: { titulo: string; texto?: string; children: ReactNode }) {
  return (
    <div className="animar-aparecer">
      <h2 className="text-xl font-extrabold text-uc-purple-texto">{titulo}</h2>
      {texto && <p className="mt-1 mb-4 text-sm text-tinta-2">{texto}</p>}
      {!texto && <div className="mb-4" />}
      <div className="escalonar space-y-3">{children}</div>
    </div>
  )
}

function Opcion({
  activa,
  onClick,
  titulo,
  texto,
  icono: Icono,
}: {
  activa: boolean
  onClick: () => void
  titulo: string
  texto?: string
  icono?: LucideIcon
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={cn(
        'alza flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 p-3.5 text-left',
        activa ? 'border-uc-purple bg-uc-purple-light' : 'border-linea bg-superficie',
      )}
    >
      {Icono && (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-uc-purple text-white">
          <Icono size={20} aria-hidden />
        </span>
      )}
      <span className="flex-1">
        <span className="block text-sm font-bold text-tinta">{titulo}</span>
        {texto && <span className="block text-xs text-tinta-3">{texto}</span>}
      </span>
      {activa && <CircleCheck size={20} className="shrink-0 text-uc-purple-texto" aria-hidden />}
    </button>
  )
}

const Error = ({ texto }: { texto: string }) =>
  texto ? (
    <p role="alert" className="text-xs text-uc-red-texto">
      {texto}
    </p>
  ) : null

export function NuevaSolicitud() {
  const { crear } = useSolicitudes()
  const { tiposDeCentro, subcentrosDe, serviciosDe } = useCatalogos()
  const [indice, setIndice] = useState(0)
  const [centro, setCentro] = useState('')
  const [subcentro, setSubcentro] = useState('')
  const [servicio, setServicio] = useState('')
  const [tipo, setTipo] = useState<TipoSolicitante | ''>('')
  const [religion, setReligion] = useState('')
  const [apoyo, setApoyo] = useState<Apoyo>('')
  const [personaApoyo, setPersonaApoyo] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [comentario, setComentario] = useState('')
  const [consiente, setConsiente] = useState(false)
  const [intentado, setIntentado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [creada, setCreada] = useState<Solicitud | null>(null)

  const subcentros = useMemo(() => subcentrosDe(centro), [centro, subcentrosDe])
  const servicios = useMemo(
    () => (subcentro ? [...serviciosDe(centro, subcentro), OTRO_SERVICIO] : []),
    [centro, subcentro, serviciosDe],
  )

  // Reglas: pacientes y familiares piden apoyo espiritual (religión obligatoria, sin programa).
  // Colaboradores y equipos eligen PAEC, PARES o UIC. PAEC individual redirige y UIC solo informa.
  const esPersonal = tipo === 'Paciente' || tipo === 'Familiar'
  const esColaborador = tipo === 'Colaborador' || tipo === 'Equipo'
  const redirige = tipo === 'Colaborador' && apoyo === 'PAEC'
  const soloInforma = esColaborador && apoyo === 'UIC'
  const guarda = esPersonal || (esColaborador && (apoyo === 'PARES' || (apoyo === 'PAEC' && !redirige)))

  const pasos: Paso[] = ['donde', 'quien']
  if (esPersonal) pasos.push('fe', 'contacto', 'revisar')
  else if (esColaborador) pasos.push('apoyo', ...(guarda ? (['contacto', 'revisar'] as Paso[]) : []))
  const paso = pasos[Math.min(indice, pasos.length - 1)]

  const errores: Record<Paso, Record<string, string>> = {
    donde: {
      centro: centro ? '' : 'Elige el tipo de centro.',
      subcentro: subcentro ? '' : 'Elige el centro.',
      servicio: servicio ? '' : 'Elige el servicio, o «Otro» si no lo sabes.',
    },
    quien: { tipo: tipo ? '' : 'Elige una opción para continuar.' },
    fe: { religion: religion ? '' : 'Elige una opción (puede ser «Prefiero no decirlo»).' },
    apoyo: { apoyo: apoyo ? '' : 'Elige una opción para continuar.' },
    contacto: {
      ...(esPersonal ? { personaApoyo: validarNombre(personaApoyo) } : {}),
      nombre: validarNombre(nombre),
      telefono: validarTelefono(telefono),
    },
    revisar: { consiente: consiente ? '' : 'Necesitamos tu autorización para contactarte.' },
  }
  const erroresPaso = errores[paso]
  const ver = (c: string) => (intentado ? (erroresPaso[c] ?? '') : '')
  const pasoValido = Object.values(erroresPaso).every((e) => !e)

  const siguiente = () => {
    setIntentado(true)
    if (!pasoValido) return
    setIntentado(false)
    setIndice((i) => i + 1)
    window.scrollTo(0, 0)
  }
  const atras = () => {
    setIntentado(false)
    setIndice((i) => Math.max(0, i - 1))
  }

  const enviar = async () => {
    setIntentado(true)
    if (!pasoValido || !tipo) return
    setEnviando(true)
    setErrorEnvio('')
    try {
      const nueva = await crear({
        programa: esColaborador && apoyo !== 'UIC' && apoyo ? apoyo : null,
        centro,
        subcentro,
        servicio,
        tipoSolicitante: tipo,
        personaApoyo: esPersonal ? personaApoyo.trim() : undefined,
        solicitante: nombre.trim(),
        telefono: telefono.trim(),
        religion: religion || undefined,
        comentario: comentario.trim(),
      })
      setCreada(nueva)
      window.scrollTo(0, 0)
    } catch {
      setErrorEnvio('No pudimos enviar tu solicitud. Intenta de nuevo en un momento.')
    } finally {
      setEnviando(false)
    }
  }

  if (creada) {
    return (
      <div className="animar-aparecer mx-auto max-w-lg rounded-2xl border border-uc-green-borde bg-superficie p-8 text-center shadow-sm">
        <span className="relative mx-auto mb-3 grid size-16 place-items-center">
          <span className="animar-onda absolute inset-0 rounded-full bg-uc-green" aria-hidden />
          <span className="animar-pop relative grid size-16 place-items-center rounded-full bg-uc-green-light text-uc-green-texto">
            <CircleCheck size={34} aria-hidden />
          </span>
        </span>
        <h1 className="text-2xl font-extrabold text-tinta">Gracias por escribirnos</h1>
        <p className="mt-2 text-sm text-tinta-2">
          Recibimos tu solicitud. El equipo de {AREAS} se comunicará contigo.
        </p>
        <AvisoHorario className="mt-4 text-left" />
        <p className="mt-5 text-sm text-tinta-2">
          Si quieres agregar una nueva solicitud, no dudes en hacerla.
        </p>
        <p className="mt-5 text-xs font-bold tracking-wide text-tinta-3 uppercase">Tu código</p>
        <p className="text-2xl font-extrabold text-uc-purple-texto">{creada.id}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/">
            <Button relieve>Volver al inicio</Button>
          </Link>
          <Button variante="outline" relieve onClick={() => window.location.reload()}>
            Agregar otra solicitud
          </Button>
        </div>
      </div>
    )
  }

  const esUltimo = paso === 'revisar'
  const sinSiguiente = (paso === 'apoyo' && !guarda && Boolean(apoyo)) // PAEC redirige o UIC informa

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-extrabold text-uc-purple-texto">Estamos para acompañarte</h1>
        <p className="mt-1 text-sm text-tinta-2">
          Cuéntanos con calma lo que necesitas. Son pocas preguntas y puedes volver atrás cuando quieras.
        </p>
        <AvisoHorario className="mt-3 text-left" />
      </header>

      <div className="mb-3" aria-label={`Paso ${indice + 1} de ${pasos.length}`}>
        <div className="mb-1 flex justify-between text-xs text-tinta-3">
          <span>
            Paso {Math.min(indice + 1, pasos.length)} de {pasos.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-superficie-3">
          <div
            className="h-full rounded-full bg-uc-purple transition-all duration-300"
            style={{ width: `${((indice + 1) / pasos.length) * 100}%` }}
          />
        </div>
      </div>

      <section className="rounded-2xl border border-linea bg-superficie p-5 shadow-sm md:p-6">
        {paso === 'donde' && (
          <Pregunta titulo="¿Dónde te encuentras?" texto="Así sabremos a quién avisar y dónde ir.">
            <CampoLista
              etiqueta="Tipo de centro"
              obligatorio
              textoVacio="Selecciona un tipo de centro"
              opciones={tiposDeCentro()}
              value={centro}
              error={ver('centro')}
              onChange={(e) => {
                setCentro(e.target.value)
                setSubcentro('')
                setServicio('')
              }}
            />
            <CampoLista
              etiqueta="Centro"
              obligatorio
              textoVacio="Selecciona tu centro"
              opciones={subcentros}
              value={subcentro}
              disabled={!centro}
              error={ver('subcentro')}
              onChange={(e) => {
                setSubcentro(e.target.value)
                setServicio('')
              }}
            />
            <CampoLista
              etiqueta="Servicio o unidad"
              obligatorio
              textoVacio="Selecciona el servicio"
              opciones={servicios}
              value={servicio}
              disabled={!subcentro}
              error={ver('servicio')}
              onChange={(e) => setServicio(e.target.value)}
            />
          </Pregunta>
        )}

        {paso === 'quien' && (
          <Pregunta titulo="¿Para quién pides apoyo?" texto="Elige a quién quieres que acompañemos.">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {tipos.map((t) => (
                <Opcion
                  key={t.valor}
                  activa={tipo === t.valor}
                  titulo={t.titulo}
                  texto={t.texto}
                  icono={t.icono}
                  onClick={() => {
                    setTipo(t.valor)
                    setApoyo('')
                  }}
                />
              ))}
            </div>
            <Error texto={ver('tipo')} />
          </Pregunta>
        )}

        {paso === 'fe' && (
          <Pregunta
            titulo="¿Desde qué fe o creencia quieres que acompañemos a esta persona?"
            texto="Si no lo sabes, elige «Prefiero no decirlo»."
          >
            <div className="flex gap-3 rounded-2xl border border-uc-purple/20 bg-uc-purple-light p-4 text-sm text-uc-purple-texto">
              <Sparkles size={20} className="mt-0.5 shrink-0" aria-hidden />
              <p>
                <strong>¿Qué es el apoyo espiritual?</strong> Es un acompañamiento que respeta la fe, las creencias y los valores de cada persona,
                desde cualquier religión o sin una en particular. Te escucha, te acompaña y, si lo deseas, comparte un momento de oración o de silencio.
                Lo entrega el Área de Asistencia Espiritual y Pastoral.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {religiones.map((r) => (
                <Opcion key={r} activa={religion === r} titulo={r} onClick={() => setReligion(r)} />
              ))}
            </div>
            <Error texto={ver('religion')} />
          </Pregunta>
        )}

        {paso === 'apoyo' && (
          <Pregunta titulo="¿Qué tipo de apoyo necesitas?" texto="Elige lo que más se parezca a tu situación.">
            {opcionesApoyo.map((o) => (
              <Opcion key={o.clave} activa={apoyo === o.clave} titulo={o.titulo} texto={o.texto} onClick={() => setApoyo(o.clave)} />
            ))}
            <Error texto={ver('apoyo')} />
            {apoyo && apoyo !== 'UIC' && (
              <p className="rounded-xl bg-superficie-2 px-3 py-2 text-xs text-tinta-2">
                <strong>{apoyo}</strong>: {programas.find((p) => p.sigla === apoyo)?.nombre}. {programas.find((p) => p.sigla === apoyo)?.descripcion}
              </p>
            )}
            {redirige && (
              <div className="rounded-2xl border border-uc-blue-borde bg-uc-blue-light p-4 text-sm text-uc-blue-texto">
                <p className="mb-3">Este apoyo se agenda en un sitio aparte. Te llevamos allí y aquí no se guarda nada.</p>
                <a href={FORMULARIO_PAEC_URL} target="_blank" rel="noreferrer">
                  <Button variante="blue" relieve icono={ExternalLink} tabIndex={-1}>
                    Ir a la agenda de apoyo
                  </Button>
                </a>
              </div>
            )}
            {soloInforma && (
              <p className="flex gap-2 rounded-2xl border border-uc-blue-borde bg-uc-blue-light p-4 text-sm text-uc-blue-texto">
                <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
                {TEXTO_UIC}
              </p>
            )}
          </Pregunta>
        )}

        {paso === 'contacto' && (
          <Pregunta
            titulo={esPersonal ? '¿A quién vamos a acompañar y cómo te contactamos?' : '¿Cómo te contactamos?'}
            texto="Usaremos estos datos solo para coordinar el acompañamiento."
          >
            {esPersonal && (
              <CampoTexto etiqueta={tipo === 'Paciente' ? 'Nombre del paciente' : 'Nombre del familiar'} obligatorio value={personaApoyo} error={ver('personaApoyo')} onChange={(e) => setPersonaApoyo(e.target.value)} />
            )}
            <CampoTexto etiqueta={esPersonal ? 'Tu nombre (quien solicita)' : 'Tu nombre'} obligatorio value={nombre} error={ver('nombre')} autoComplete="name" onChange={(e) => setNombre(e.target.value)} />
            <CampoTexto etiqueta={esPersonal ? 'Tu teléfono o anexo' : 'Teléfono'} obligatorio type="tel" value={telefono} error={ver('telefono')} ayuda="Es el número al que te vamos a llamar." autoComplete="tel" onChange={(e) => setTelefono(e.target.value)} />
            {esColaborador && (
              <CampoLista etiqueta="Religión o creencia (opcional)" textoVacio="Prefiero no indicarlo" opciones={religiones} value={religion} onChange={(e) => setReligion(e.target.value)} />
            )}
            <CampoTextoLargo
              etiqueta="¿Quieres contarnos algo más? (opcional)"
              value={comentario}
              maxLength={500}
              ayuda="No necesitas escribir datos clínicos. Con lo esencial nos basta."
              onChange={(e) => setComentario(e.target.value)}
            />
          </Pregunta>
        )}

        {paso === 'revisar' && (
          <Pregunta titulo="Revisa y envía" texto="Si algo no está bien, puedes volver atrás y cambiarlo.">
            <dl className="divide-y divide-linea rounded-2xl border border-linea text-sm">
              {[
                ['Dónde', `${subcentro} · ${servicio}`],
                ['Apoyo para', tipo],
                esPersonal ? ['Fe o creencia de la persona', religion] : ['Apoyo', opcionesApoyo.find((o) => o.clave === apoyo)?.titulo ?? ''],
                ...(esPersonal ? [['Persona a acompañar', personaApoyo]] : []),
                [esPersonal ? 'Solicita' : 'Contacto', `${nombre} · ${telefono}`],
                ...(comentario ? [['Comentario', comentario]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:gap-4">
                  <dt className="w-28 shrink-0 text-xs font-bold tracking-wide text-tinta-3 uppercase">{k}</dt>
                  <dd className="text-tinta">{v}</dd>
                </div>
              ))}
            </dl>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-tinta-2">
              <input type="checkbox" checked={consiente} onChange={(e) => setConsiente(e.target.checked)} className="mt-1 accent-uc-purple" />
              {esPersonal ? 'Confirmo que la persona sabe de esta solicitud y está de acuerdo en recibir acompañamiento, y acepto que Humanización y Misión y RSE use estos datos para contactarme.' : 'Acepto que el equipo de Humanización y Misión y RSE use estos datos para contactarme.'}
            </label>
            <Error texto={ver('consiente')} />
            {errorEnvio && <p role="alert" className="rounded-lg border border-uc-red-borde bg-uc-red-light p-3 text-sm text-uc-red-texto">{errorEnvio}</p>}
          </Pregunta>
        )}

        <div className="mt-6 flex items-center justify-between gap-2">
          <Button variante="outline" relieve icono={ArrowLeft} onClick={atras} disabled={indice === 0}>
            Atrás
          </Button>
          {!sinSiguiente &&
            (esUltimo ? (
              <Button relieve icono={Send} cargando={enviando} onClick={enviar}>
                Enviar solicitud
              </Button>
            ) : (
              <Button relieve onClick={siguiente}>
                Siguiente <ArrowRight size={18} aria-hidden />
              </Button>
            ))}
        </div>
      </section>
    </div>
  )
}
