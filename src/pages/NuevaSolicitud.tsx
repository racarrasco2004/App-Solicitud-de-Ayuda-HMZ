import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  ExternalLink,
  HeartHandshake,
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
import espiritual from '@/assets/marca/area-espiritual.png'
import { AvisoHorario } from '@/components/AvisoHorario'
import { Button } from '@/components/ui/Button'
import { CampoLista, CampoTexto, CampoTextoLargo } from '@/components/ui/Campos'
import { useCatalogos } from '@/context/CatalogosContext'
import { useConfiguracionPortal } from '@/context/ConfiguracionPortalContext'
import { useSolicitudes } from '@/context/SolicitudesContext'
import type { Programa, Solicitud, TipoSolicitante } from '@/types'
import { cn } from '@/utils/cn'
import { validarNombre, validarTelefono } from '@/utils/validaciones'

type Apoyo = Programa | 'UIC' | ''
type Paso = 'donde' | 'quien' | 'fe' | 'apoyo' | 'contacto' | 'revisar'

const OTRO_SERVICIO_OPCION = 'Otro (especifique)'

const ICONO_POR_TIPO: Record<TipoSolicitante, LucideIcon> = {
  Paciente: HeartPulse,
  Familiar: Users,
  Colaborador: UserRound,
  Equipo: UsersRound,
}

function Pregunta({
  titulo,
  texto,
  children,
}: {
  titulo: string
  texto?: string
  children: ReactNode
}) {
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
  logo,
}: {
  activa: boolean
  onClick: () => void
  titulo: string
  texto?: string
  icono?: LucideIcon
  logo?: string
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
      {logo && (
        <span className="grid h-14 w-28 shrink-0 place-items-center rounded-xl bg-white p-1 ring-1 ring-linea">
          <img src={logo} alt="" className="max-h-full max-w-full object-contain" />
        </span>
      )}
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
  const { config } = useConfiguracionPortal()

  const [indice, setIndice] = useState(0)
  const [centro, setCentro] = useState('')
  const [subcentro, setSubcentro] = useState('')
  const [servicio, setServicio] = useState('')
  const [otroServicio, setOtroServicio] = useState('')
  const [tipo, setTipo] = useState<TipoSolicitante | ''>('')
  const [religion, setReligion] = useState('')
  const [apoyo, setApoyo] = useState<Apoyo>('')
  const [deseaEspiritual, setDeseaEspiritual] = useState(false)
  const [tipoApoyoEspiritual, setTipoApoyoEspiritual] = useState('')
  const [personaApoyo, setPersonaApoyo] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [comentario, setComentario] = useState('')
  const [consiente, setConsiente] = useState(false)
  const [intentado, setIntentado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [creada, setCreada] = useState<Solicitud | null>(null)

  const tiposVisibles = useMemo(
    () =>
      config.tiposSolicitante
        .filter((t) => t.activo)
        .map((t) => ({ ...t, icono: ICONO_POR_TIPO[t.valor] })),
    [config.tiposSolicitante],
  )

  const opcionesApoyo = useMemo(() => {
    const paec = config.programas.find((p) => p.sigla === 'PAEC')
    const pares = config.programas.find((p) => p.sigla === 'PARES')
    return config.opcionesApoyo
      .filter((o) => o.activo)
      .map((o) => ({
        clave: o.clave as Apoyo,
        titulo: o.titulo,
        texto: o.texto,
        logo: o.clave === 'PAEC' ? paec?.logo : o.clave === 'PARES' ? pares?.logo : undefined,
      }))
  }, [config.opcionesApoyo, config.programas])

  const subcentros = useMemo(() => subcentrosDe(centro), [centro, subcentrosDe])
  const servicios = useMemo(() => {
    if (!subcentro) return []
    const filtrados = serviciosDe(centro, subcentro).filter(
      (s) => !/no s[eé]|prefiero no/i.test(s) && s !== OTRO_SERVICIO_OPCION,
    )
    return [...filtrados, OTRO_SERVICIO_OPCION]
  }, [centro, subcentro, serviciosDe])

  const esOtroServicio = servicio === OTRO_SERVICIO_OPCION
  const servicioFinal = esOtroServicio ? `Otro: ${otroServicio.trim()}` : servicio

  const esPersonal = tipo === 'Paciente' || tipo === 'Familiar'
  const esColaborador = tipo === 'Colaborador' || tipo === 'Equipo'

  const mostrarBloqueEspiritualColab =
    esColaborador &&
    ((config.reglaEspiritualColaborador === 'solo-pares' && apoyo === 'PARES') ||
      config.reglaEspiritualColaborador === 'todos-colaboradores')

  const redirige = tipo === 'Colaborador' && apoyo === 'PAEC'
  const soloInforma = esColaborador && apoyo === 'UIC'
  const guarda =
    esPersonal || (esColaborador && (apoyo === 'PARES' || (apoyo === 'PAEC' && !redirige)))

  const pasos: Paso[] = ['donde', 'quien']
  if (esPersonal) pasos.push('fe', 'contacto', 'revisar')
  else if (esColaborador) pasos.push('apoyo', ...(guarda ? (['contacto', 'revisar'] as Paso[]) : []))
  const paso = pasos[Math.min(indice, pasos.length - 1)]

  const errores: Record<Paso, Record<string, string>> = {
    donde: {
      centro: centro ? '' : 'Elige el tipo de centro.',
      subcentro: subcentro ? '' : 'Elige el centro.',
      servicio: servicio ? '' : 'Selecciona el servicio o unidad.',
      ...(esOtroServicio && !otroServicio.trim()
        ? { otroServicio: 'Indica el nombre del servicio o unidad.' }
        : {}),
    },
    quien: { tipo: tipo ? '' : 'Elige una opción para continuar.' },
    fe: { religion: religion ? '' : 'Elige una opción (puede ser «Prefiero no decirlo»).' },
    apoyo: { apoyo: apoyo ? '' : 'Elige una opción para continuar.' },
    contacto: {
      ...(esPersonal ? { personaApoyo: validarNombre(personaApoyo) } : {}),
      nombre: validarNombre(nombre),
      telefono: validarTelefono(telefono),
      ...(mostrarBloqueEspiritualColab && deseaEspiritual && !tipoApoyoEspiritual
        ? { tipoApoyoEspiritual: 'Selecciona el tipo de apoyo espiritual que prefieres.' }
        : {}),
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

  const seleccionarApoyo = (clave: Apoyo) => {
    setApoyo(clave)
    const seguiraMostrandoEspiritual =
      (config.reglaEspiritualColaborador === 'solo-pares' && clave === 'PARES') ||
      config.reglaEspiritualColaborador === 'todos-colaboradores'
    if (!seguiraMostrandoEspiritual) {
      setDeseaEspiritual(false)
      setTipoApoyoEspiritual('')
      setReligion('')
    }
  }

  const enviar = async () => {
    setIntentado(true)
    if (!pasoValido || !tipo) return
    setEnviando(true)
    setErrorEnvio('')
    try {
      const incluyeEspiritual = mostrarBloqueEspiritualColab && deseaEspiritual

      const nueva = await crear({
        programa: esColaborador && apoyo !== 'UIC' && apoyo ? apoyo : null,
        centro,
        subcentro,
        servicio: servicioFinal,
        tipoSolicitante: tipo,
        personaApoyo: esPersonal ? personaApoyo.trim() : undefined,
        apoyoEspiritual: incluyeEspiritual ? tipoApoyoEspiritual : undefined,
        solicitante: nombre.trim(),
        telefono: telefono.trim(),
        religion: esPersonal || incluyeEspiritual ? religion || undefined : undefined,
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
        <p className="mt-2 text-sm text-tinta-2">{config.mensajeConfirmacion}</p>
        <p className="mt-1 text-xs font-semibold text-uc-purple-texto">{config.nombreArea}</p>
        <AvisoHorario className="mt-4 text-left" />
        {config.contactoSoporte && (
          <p className="mt-3 text-xs text-tinta-3">{config.contactoSoporte}</p>
        )}
        <p className="mt-5 text-xs font-bold tracking-wide text-tinta-3 uppercase">Tu código</p>
        <p className="font-mono text-2xl font-extrabold tracking-tight text-uc-purple-texto">
          {creada.id}
        </p>
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
  const sinSiguiente = paso === 'apoyo' && !guarda && Boolean(apoyo)

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-extrabold text-uc-purple-texto">Estamos para acompañarte</h1>
        <p className="mt-1 text-sm text-tinta-2">
          Cuéntanos con calma lo que necesitas. Son pocas preguntas y puedes volver atrás cuando
          quieras.
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
                setOtroServicio('')
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
                setOtroServicio('')
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
              onChange={(e) => {
                setServicio(e.target.value)
                if (e.target.value !== OTRO_SERVICIO_OPCION) setOtroServicio('')
              }}
            />

            {esOtroServicio && (
              <div className="animar-aparecer rounded-2xl border border-uc-purple/25 bg-fondo/70 p-3.5">
                <CampoTexto
                  etiqueta="Especifica el servicio o unidad"
                  obligatorio
                  placeholder="Ej. Unidad de Procedimientos, Policlínico, Piso 3..."
                  ayuda="Indícanos el nombre del servicio, piso o unidad donde te encuentras."
                  value={otroServicio}
                  error={ver('otroServicio')}
                  onChange={(e) => setOtroServicio(e.target.value)}
                />
              </div>
            )}
          </Pregunta>
        )}

        {paso === 'quien' && (
          <Pregunta
            titulo="¿Para quién pides apoyo?"
            texto="Elige a quién quieres que acompañemos."
          >
            <div className="grid gap-2.5 sm:grid-cols-2">
              {tiposVisibles.map((t) => (
                <Opcion
                  key={t.valor}
                  activa={tipo === t.valor}
                  titulo={t.titulo}
                  texto={t.texto}
                  icono={t.icono}
                  onClick={() => {
                    setTipo(t.valor)
                    setApoyo('')
                    setDeseaEspiritual(false)
                    setTipoApoyoEspiritual('')
                    setReligion('')
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
              <img
                src={espiritual}
                alt={config.espiritual.nombre}
                className="h-14 w-28 shrink-0 rounded-xl bg-white object-contain p-1"
              />
              <p>
                <strong>¿Qué es el apoyo espiritual?</strong> {config.espiritual.explicacionFormulario}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {config.religiones.map((r) => (
                <Opcion key={r} activa={religion === r} titulo={r} onClick={() => setReligion(r)} />
              ))}
            </div>
            <Error texto={ver('religion')} />
          </Pregunta>
        )}

        {paso === 'apoyo' && (
          <Pregunta
            titulo="¿Qué tipo de apoyo necesitas?"
            texto="Elige lo que más se parezca a tu situación."
          >
            {opcionesApoyo.map((o) => (
              <Opcion
                key={o.clave}
                activa={apoyo === o.clave}
                titulo={o.titulo}
                texto={o.texto}
                logo={o.logo}
                onClick={() => seleccionarApoyo(o.clave)}
              />
            ))}
            <Error texto={ver('apoyo')} />
            {apoyo && apoyo !== 'UIC' && (
              <p className="rounded-xl bg-superficie-2 px-3 py-2 text-xs text-tinta-2">
                <strong>{apoyo}</strong>:{' '}
                {config.programas.find((p) => p.sigla === apoyo)?.nombre}.{' '}
                {config.programas.find((p) => p.sigla === apoyo)?.descripcion}
              </p>
            )}
            {redirige && (
              <div className="rounded-2xl border border-uc-blue-borde bg-uc-blue-light p-4 text-sm text-uc-blue-texto">
                <p className="mb-3">
                  Este apoyo se agenda en un sitio aparte. Te llevamos allí y aquí no se guarda
                  nada.
                </p>
                <a href={config.formularioPaecUrl} target="_blank" rel="noreferrer">
                  <Button variante="blue" relieve icono={ExternalLink} tabIndex={-1}>
                    Ir a la agenda de apoyo
                  </Button>
                </a>
              </div>
            )}
            {soloInforma && (
              <p className="flex gap-2 rounded-2xl border border-uc-blue-borde bg-uc-blue-light p-4 text-sm text-uc-blue-texto">
                <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
                {config.textoUic}
              </p>
            )}
          </Pregunta>
        )}

        {paso === 'contacto' && (
          <Pregunta
            titulo={
              esPersonal
                ? '¿A quién vamos a acompañar y cómo te contactamos?'
                : '¿Cómo te contactamos?'
            }
            texto="Usaremos estos datos solo para coordinar el acompañamiento."
          >
            {esPersonal && (
              <CampoTexto
                etiqueta={tipo === 'Paciente' ? 'Nombre del paciente' : 'Nombre del familiar'}
                obligatorio
                value={personaApoyo}
                error={ver('personaApoyo')}
                onChange={(e) => setPersonaApoyo(e.target.value)}
              />
            )}
            <CampoTexto
              etiqueta={esPersonal ? 'Tu nombre (quien solicita)' : 'Tu nombre'}
              obligatorio
              value={nombre}
              error={ver('nombre')}
              autoComplete="name"
              onChange={(e) => setNombre(e.target.value)}
            />
            <CampoTexto
              etiqueta={esPersonal ? 'Tu teléfono o anexo' : 'Teléfono'}
              obligatorio
              type="tel"
              value={telefono}
              error={ver('telefono')}
              ayuda="Es el número al que te vamos a llamar."
              autoComplete="tel"
              onChange={(e) => setTelefono(e.target.value)}
            />

            {mostrarBloqueEspiritualColab && (
              <div className="rounded-2xl border border-uc-purple/25 bg-fondo/70 p-4">
                <div className="flex items-start gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-uc-purple-light text-uc-purple-texto">
                    <HeartHandshake size={17} aria-hidden />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-tinta">
                      ¿Deseas apoyo espiritual? (opcional)
                    </p>
                    <p className="mt-0.5 text-xs text-tinta-3">
                      {config.espiritual.nombre} también puede acompañarte respetando tus creencias.
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    aria-pressed={!deseaEspiritual}
                    onClick={() => {
                      setDeseaEspiritual(false)
                      setTipoApoyoEspiritual('')
                      setReligion('')
                    }}
                    className={cn(
                      'cursor-pointer rounded-xl border-2 px-3 py-2 text-xs font-bold transition-colors',
                      !deseaEspiritual
                        ? 'border-uc-purple bg-uc-purple-light text-uc-purple-texto'
                        : 'border-linea bg-superficie text-tinta-2 hover:text-tinta',
                    )}
                  >
                    No por ahora
                  </button>
                  <button
                    type="button"
                    aria-pressed={deseaEspiritual}
                    onClick={() => setDeseaEspiritual(true)}
                    className={cn(
                      'cursor-pointer rounded-xl border-2 px-3 py-2 text-xs font-bold transition-colors',
                      deseaEspiritual
                        ? 'border-uc-purple bg-uc-purple-light text-uc-purple-texto'
                        : 'border-linea bg-superficie text-tinta-2 hover:text-tinta',
                    )}
                  >
                    Sí, deseo apoyo espiritual
                  </button>
                </div>

                {deseaEspiritual && (
                  <div className="animar-aparecer mt-3.5 space-y-3 border-t border-linea pt-3.5">
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-uc-purple-texto">
                        <Sparkles size={13} aria-hidden />
                        Selecciona el tipo de apoyo espiritual
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {config.tiposApoyoEspiritual.map((item) => {
                          const activo = tipoApoyoEspiritual === item
                          return (
                            <button
                              key={item}
                              type="button"
                              aria-pressed={activo}
                              onClick={() => setTipoApoyoEspiritual(item)}
                              className={cn(
                                'flex cursor-pointer items-center justify-between gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-xs font-semibold transition-all',
                                activo
                                  ? 'border-uc-purple bg-uc-purple-light text-uc-purple-texto'
                                  : 'border-linea bg-superficie text-tinta hover:border-uc-purple/40',
                              )}
                            >
                              <span>{item}</span>
                              {activo && <CircleCheck size={16} className="shrink-0" aria-hidden />}
                            </button>
                          )
                        })}
                      </div>
                      <Error texto={ver('tipoApoyoEspiritual')} />
                    </div>

                    <CampoLista
                      etiqueta="Religión o creencia (opcional)"
                      textoVacio="Prefiero no indicarlo"
                      opciones={config.religiones}
                      value={religion}
                      onChange={(e) => setReligion(e.target.value)}
                    />
                  </div>
                )}
              </div>
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
          <Pregunta
            titulo="Revisa y envía"
            texto="Si algo no está bien, puedes volver atrás y cambiarlo."
          >
            <dl className="divide-y divide-linea rounded-2xl border border-linea text-sm">
              {[
                ['Dónde', `${subcentro} · ${servicioFinal}`],
                ['Apoyo para', tipo],
                esPersonal
                  ? ['Fe o creencia de la persona', religion]
                  : ['Apoyo', opcionesApoyo.find((o) => o.clave === apoyo)?.titulo ?? ''],
                ...(mostrarBloqueEspiritualColab && deseaEspiritual && tipoApoyoEspiritual
                  ? [
                      [
                        'Apoyo espiritual',
                        religion ? `${tipoApoyoEspiritual} (${religion})` : tipoApoyoEspiritual,
                      ],
                    ]
                  : []),
                ...(esPersonal ? [['Persona a acompañar', personaApoyo]] : []),
                [esPersonal ? 'Solicita' : 'Contacto', `${nombre} · ${telefono}`],
                ...(comentario ? [['Comentario', comentario]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:gap-4">
                  <dt className="w-36 shrink-0 text-xs font-bold tracking-wide text-tinta-3 uppercase">
                    {k}
                  </dt>
                  <dd className="text-tinta">{v}</dd>
                </div>
              ))}
            </dl>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-tinta-2">
              <input
                type="checkbox"
                checked={consiente}
                onChange={(e) => setConsiente(e.target.checked)}
                className="mt-1 accent-uc-purple"
              />
              {esPersonal ? config.consentimientoPersonal : config.consentimientoColaborador}
            </label>
            <Error texto={ver('consiente')} />
            {errorEnvio && (
              <p
                role="alert"
                className="rounded-lg border border-uc-red-borde bg-uc-red-light p-3 text-sm text-uc-red-texto"
              >
                {errorEnvio}
              </p>
            )}
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