import {
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ClipboardEdit,
  Clock,
  Download,
  Eye,
  FileText,
  HelpCircle,
  Info,
  Mail,
  Megaphone,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TriangleAlert,
  Upload,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CampoLista, CampoTexto, CampoTextoLargo } from '@/components/ui/Campos'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { nombreDeRol } from '@/config/navegacion'
import { useAnuncios } from '@/context/AnunciosContext'
import { useAuth } from '@/context/AuthContext'
import { useCatalogos } from '@/context/CatalogosContext'
import {
  useConfiguracionPortal,
  type ReglaEspiritualColaborador,
} from '@/context/ConfiguracionPortalContext'
import { CentrosYServicios } from '@/pages/CentrosYServicios'
import type { Rol } from '@/types'
import { cn } from '@/utils/cn'
import { normalizarCorreoInstitucional } from '@/utils/validaciones'

const roles: Rol[] = ['solicitante', 'coordinador', 'administrador']

type TabAdmin = 'centros' | 'equipo' | 'contenidos' | 'formulario' | 'reglas'

function Tarjeta({
  titulo,
  nota,
  dondeAparece,
  children,
  ancha,
}: {
  titulo: string
  nota?: string
  dondeAparece?: string
  children: ReactNode
  ancha?: boolean
}) {
  return (
    <section
      className={`rounded-2xl border border-linea bg-superficie p-4 shadow-sm sm:p-5 ${ancha ? 'md:col-span-2' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-tinta">{titulo}</h2>
          {nota && <p className="mt-0.5 text-xs text-tinta-3">{nota}</p>}
        </div>
        {dondeAparece && <Badge tono="blue">Visible en: {dondeAparece}</Badge>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function BannerContexto({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-uc-purple/20 bg-uc-purple-light/60 px-4 py-3 text-xs text-tinta sm:text-sm">
      <Info size={18} className="mt-0.5 shrink-0 text-uc-purple-texto" aria-hidden />
      <div>
        <p className="font-bold text-uc-purple-texto">{titulo}</p>
        <p className="mt-0.5 text-tinta-2">{descripcion}</p>
      </div>
    </div>
  )
}

function GuiaRapidaModal({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const pasosGuia = [
    {
      num: '1',
      titulo: 'Centros y servicios clínicos',
      detalle:
        'Agrega o quita hospitales, centros médicos y unidades clínicas (ej. MQ 4A, Urgencia). Aparecen de inmediato en el formulario de solicitud.',
    },
    {
      num: '2',
      titulo: 'Equipo y permisos',
      detalle:
        'Gestiona quiénes reciben casos asignados ("Responsables") y quiénes entran a gestionar o configurar el portal ("Usuarios con permisos").',
    },
    {
      num: '3',
      titulo: 'Programas y contenidos',
      detalle:
        'Edita PAEC, PARES y Asistencia Espiritual con vista previa en vivo, además de talleres grupales, religiones, tipos de apoyo espiritual y los 4 pasos de Inicio.',
    },
    {
      num: '4',
      titulo: 'Formulario de solicitud',
      detalle:
        'Personaliza las tarjetas de solicitantes, activa o pausa programas en el formulario, define cuándo aparece el apoyo espiritual en colaboradores y edita los textos legales y de confirmación.',
    },
    {
      num: '5',
      titulo: 'Identidad, reglas y respaldo',
      detalle:
        'Configura el nombre del área, un anuncio destacado en portada, horas de alerta, mensajes de escalamiento y descarga o restaura copias de seguridad (.json).',
    },
  ]

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Guía rápida de Administración"
      icono={BookOpen}
      tono="purple"
      pie={
        <Button relieve onClick={onCerrar}>
          Entendido, volver al panel
        </Button>
      }
    >
      <div className="space-y-3 text-sm text-tinta-2">
        <p>
          Desde esta pantalla puedes controlar <strong className="text-tinta">todo el contenido y reglas del portal</strong>{' '}
          sin necesidad de programar. Todos los cambios se guardan al presionar los botones de guardar.
        </p>
        <div className="space-y-2 pt-1">
          {pasosGuia.map((p) => (
            <div key={p.num} className="rounded-xl border border-linea bg-fondo/80 p-3">
              <p className="font-bold text-tinta">
                <span className="mr-1.5 inline-grid size-5 place-items-center rounded-full bg-uc-purple text-xs text-white">
                  {p.num}
                </span>
                {p.titulo}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-tinta-2">{p.detalle}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

function Responsables() {
  const {
    responsables,
    usuarios,
    agregarResponsable,
    actualizarCorreoResponsable,
    alternarResponsable,
    eliminarResponsable,
    agregarUsuario,
  } = useCatalogos()

  const [porEliminar, setPorEliminar] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [darAccesoCoordinador, setDarAccesoCoordinador] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  const [editandoCorreoDe, setEditandoCorreoDe] = useState<string | null>(null)
  const [correoEditado, setCorreoEditado] = useState('')
  const [errorEdicion, setErrorEdicion] = useState('')

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    setExito('')
    const msg = agregarResponsable(nombre, correo)
    setError(msg)
    if (!msg) {
      const correoFinal = normalizarCorreoInstitucional(correo)
      const agregado = nombre.trim()
      if (darAccesoCoordinador && !usuarios.some((u) => u.correo.toLowerCase() === correoFinal)) {
        agregarUsuario({ nombre: agregado, correo: correoFinal, rol: 'coordinador' })
      }
      setNombre('')
      setCorreo('')
      setExito(`Se agregó a ${agregado} al equipo de responsables.`)
    }
  }

  const iniciarEdicionCorreo = (respNombre: string, respCorreo: string) => {
    setEditandoCorreoDe(respNombre)
    setCorreoEditado(respCorreo)
    setErrorEdicion('')
  }

  const guardarEdicionCorreo = (respNombre: string) => {
    const msg = actualizarCorreoResponsable(respNombre, correoEditado)
    if (msg) {
      setErrorEdicion(msg)
      return
    }
    setEditandoCorreoDe(null)
    setCorreoEditado('')
    setErrorEdicion('')
  }

  const vistaPreviaCorreo = correo.trim() ? normalizarCorreoInstitucional(correo) : ''

  return (
    <Tarjeta
      ancha
      titulo="1. Responsables de acompañamiento"
      nota="Integrantes del equipo a quienes se les puede asignar una solicitud para contactar y acompañar."
      dondeAparece="Selector de asignación en Solicitudes"
    >
      <ul className="mb-4 divide-y divide-linea text-sm">
        {responsables.map((r) => {
          const enEdicion = editandoCorreoDe === r.nombre
          return (
            <li key={r.nombre} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={r.activo ? 'font-medium text-tinta' : 'text-tinta-3 line-through'}>
                    {r.nombre}
                  </span>
                  <Badge tono={r.activo ? 'green' : undefined}>
                    {r.activo ? 'Disponible para asignar' : 'Pausado'}
                  </Badge>
                </div>

                {enEdicion ? (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <input
                      type="text"
                      value={correoEditado}
                      onChange={(e) => setCorreoEditado(e.target.value)}
                      placeholder="usuario@ucchristus.cl"
                      className="h-8 w-64 rounded-md border border-uc-blue bg-superficie px-2.5 text-xs text-tinta focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => guardarEdicionCorreo(r.nombre)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-uc-green px-2 py-1 text-xs font-semibold text-white hover:opacity-90"
                    >
                      <Check size={13} /> Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditandoCorreoDe(null)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-linea px-2 py-1 text-xs text-tinta-2 hover:bg-fondo"
                    >
                      <X size={13} /> Cancelar
                    </button>
                    {errorEdicion && (
                      <span className="w-full text-xs text-uc-red-texto">{errorEdicion}</span>
                    )}
                  </div>
                ) : (
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-tinta-2">
                    <Mail size={13} className="shrink-0 text-tinta-3" />
                    {r.correo ? (
                      <span>{r.correo}</span>
                    ) : (
                      <span className="italic text-tinta-3">Sin correo registrado</span>
                    )}
                    <button
                      type="button"
                      onClick={() => iniciarEdicionCorreo(r.nombre, r.correo)}
                      className="inline-flex cursor-pointer items-center gap-1 text-[0.75rem] font-medium text-uc-blue hover:underline"
                    >
                      <Pencil size={11} />
                      {r.correo ? 'Editar correo' : 'Agregar correo'}
                    </button>
                  </div>
                )}
              </div>

              <span className="flex shrink-0 gap-1.5">
                <Button
                  tamano="sm"
                  variante="outline"
                  icono={Power}
                  onClick={() => alternarResponsable(r.nombre)}
                >
                  {r.activo ? 'Pausar' : 'Reactivar'}
                </Button>
                <Button
                  tamano="sm"
                  variante="red"
                  icono={Trash2}
                  onClick={() => setPorEliminar(r.nombre)}
                  aria-label={`Eliminar a ${r.nombre}`}
                >
                  Eliminar
                </Button>
              </span>
            </li>
          )
        })}
      </ul>

      <form onSubmit={enviar} className="space-y-2.5 rounded-xl bg-fondo/70 p-3.5" noValidate>
        <p className="text-xs font-bold text-tinta">Agregar nuevo integrante al equipo</p>
        <div className="grid items-start gap-2.5 sm:grid-cols-[1fr_1fr_auto]">
          <CampoTexto
            etiqueta="Nombre y apellido"
            placeholder="Ej. Camila Soto Rojas"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              if (error) setError('')
              if (exito) setExito('')
            }}
          />
          <CampoTexto
            etiqueta="Correo institucional"
            placeholder="usuario o usuario@ucchristus.cl"
            ayuda={
              vistaPreviaCorreo && !error
                ? `Se guardará como: ${vistaPreviaCorreo}`
                : 'Puedes escribir solo el usuario antes del @'
            }
            value={correo}
            error={error}
            onChange={(e) => {
              setCorreo(e.target.value)
              if (error) setError('')
              if (exito) setExito('')
            }}
          />
          <Button type="submit" relieve icono={UserCheck} className="sm:mt-[1.6rem]">
            Agregar al equipo
          </Button>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-tinta-2">
          <input
            type="checkbox"
            checked={darAccesoCoordinador}
            onChange={(e) => setDarAccesoCoordinador(e.target.checked)}
            className="h-4 w-4 rounded border-linea-fuerte/60 accent-uc-purple"
          />
          Darle también permiso de <strong>Coordinador</strong> para entrar a revisar solicitudes
        </label>

        {exito && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-uc-green-texto">
            <CheckCircle2 size={14} /> {exito}
          </p>
        )}
      </form>

      <Modal
        abierto={porEliminar !== null}
        onCerrar={() => setPorEliminar(null)}
        titulo="¿Eliminar responsable?"
        icono={TriangleAlert}
        tono="red"
        pie={
          <>
            <Button variante="outline" relieve onClick={() => setPorEliminar(null)}>
              Cancelar
            </Button>
            <Button
              variante="red"
              relieve
              icono={Trash2}
              onClick={() => {
                if (porEliminar) eliminarResponsable(porEliminar)
                setPorEliminar(null)
              }}
            >
              Sí, eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-tinta-2">
          Vas a quitar a <strong>{porEliminar}</strong> de la lista. Las solicitudes que ya tenía
          asignadas conservan su nombre en el historial. Si es una ausencia temporal (ej.
          vacaciones), te recomendamos usar <strong>Pausar</strong>.
        </p>
      </Modal>
    </Tarjeta>
  )
}

function Usuarios() {
  const { usuarios, responsables, agregarUsuario, cambiarRol, quitarUsuario } = useCatalogos()
  const { usuario: yo } = useAuth()
  const [correo, setCorreo] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState<Rol>('coordinador')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    setExito('')
    const msg = agregarUsuario({ correo, nombre, rol })
    setError(msg)
    if (!msg) {
      setExito(`Permiso asignado a ${nombre.trim()} (${nombreDeRol[rol]}).`)
      setCorreo('')
      setNombre('')
    }
  }

  return (
    <Tarjeta
      ancha
      titulo="2. Usuarios con permisos especiales"
      nota="Define quién puede gestionar solicitudes (Coordinador) o editar esta pantalla (Administrador). El resto de la red entra automáticamente como Solicitante."
    >
      <div className="mb-4 overflow-x-auto rounded-xl border border-linea">
        <table className="w-full text-sm">
          <thead className="bg-fondo/80">
            <tr className="text-left text-[0.6875rem] font-bold tracking-wide text-tinta-3 uppercase">
              <th className="px-3 py-2">Persona</th>
              <th className="px-2 py-2">Correo institucional</th>
              <th className="px-2 py-2">Nivel de acceso</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const esYo = u.correo === yo?.correo
              const esResponsable = responsables.some(
                (r) =>
                  r.activo &&
                  (r.nombre.toLowerCase() === u.nombre.toLowerCase() ||
                    (r.correo && r.correo.toLowerCase() === u.correo.toLowerCase())),
              )
              return (
                <tr key={u.correo} className="border-t border-linea">
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-tinta">{u.nombre}</span>
                      {esYo && <Badge tono="purple">Tu cuenta</Badge>}
                      {esResponsable && <Badge tono="blue">Responsable</Badge>}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-tinta-2">{u.correo}</td>
                  <td className="px-2 py-2.5">
                    <select
                      aria-label={`Rol de ${u.nombre}`}
                      value={u.rol}
                      disabled={esYo}
                      onChange={(e) => cambiarRol(u.correo, e.target.value as Rol)}
                      className="rounded-lg border border-linea-fuerte/60 bg-superficie px-2.5 py-1 text-sm disabled:opacity-50"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {nombreDeRol[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Button
                      tamano="sm"
                      variante="red"
                      icono={Trash2}
                      disabled={esYo}
                      onClick={() => quitarUsuario(u.correo)}
                      aria-label={`Quitar acceso a ${u.nombre}`}
                    >
                      Quitar
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <form onSubmit={enviar} className="space-y-2.5 rounded-xl bg-fondo/70 p-3.5" noValidate>
        <p className="text-xs font-bold text-tinta">Otorgar permisos a otra persona</p>
        <div className="grid items-start gap-2.5 sm:grid-cols-[1fr_1fr_170px_auto]">
          <CampoTexto
            etiqueta="Nombre completo"
            placeholder="Ej. Juan Pérez"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              if (error) setError('')
              if (exito) setExito('')
            }}
          />
          <CampoTexto
            etiqueta="Correo institucional"
            placeholder="nombre@ucchristus.cl"
            value={correo}
            error={error}
            onChange={(e) => {
              setCorreo(e.target.value)
              if (error) setError('')
              if (exito) setExito('')
            }}
          />
          <CampoLista
            etiqueta="Nivel de acceso"
            textoVacio="Rol"
            opciones={roles.map((r) => nombreDeRol[r])}
            value={nombreDeRol[rol]}
            onChange={(e) =>
              setRol(roles.find((r) => nombreDeRol[r] === e.target.value) ?? 'solicitante')
            }
          />
          <Button type="submit" relieve icono={Plus} className="sm:mt-[1.6rem]">
            Dar acceso
          </Button>
        </div>

        {exito && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-uc-green-texto">
            <CheckCircle2 size={14} /> {exito}
          </p>
        )}
      </form>
    </Tarjeta>
  )
}

function EditorContenidos() {
  const {
    config,
    actualizarPrograma,
    actualizarEspiritual,
    actualizarTalleres,
    actualizarPasosInicio,
    actualizarReligiones,
    actualizarTiposApoyoEspiritual,
  } = useConfiguracionPortal()

  const [pilarSeleccionado, setPilarSeleccionado] = useState<'PAEC' | 'PARES' | 'ESPIRITUAL'>('PAEC')
  const programaActual =
    config.programas.find((p) => p.sigla === (pilarSeleccionado === 'ESPIRITUAL' ? 'PAEC' : pilarSeleccionado)) ??
    config.programas[0]

  // Estado PAEC / PARES
  const [nombreProg, setNombreProg] = useState(programaActual.nombre)
  const [descProg, setDescProg] = useState(programaActual.descripcion)
  const [puntosProg, setPuntosProg] = useState(programaActual.puntos.join('\n'))

  // Estado Asistencia Espiritual
  const [espNombre, setEspNombre] = useState(config.espiritual.nombre)
  const [espResumen, setEspResumen] = useState(config.espiritual.resumenInicio)
  const [espDescInicio, setEspDescInicio] = useState(config.espiritual.descripcionInicio)
  const [espExplicacionForm, setEspExplicacionForm] = useState(config.espiritual.explicacionFormulario)
  const [espActivo, setEspActivo] = useState(config.espiritual.activo)

  const [guardadoPilar, setGuardadoPilar] = useState('')

  // Listas y pasos
  const [talleresTexto, setTalleresTexto] = useState(config.talleresGrupales.join('\n'))
  const [religionesTexto, setReligionesTexto] = useState(config.religiones.join('\n'))
  const [apoyoEspiritualTexto, setApoyoEspiritualTexto] = useState(
    config.tiposApoyoEspiritual.join('\n'),
  )
  const [pasos, setPasos] = useState(config.pasosInicio)
  const [guardadoListas, setGuardadoListas] = useState('')

  const cambiarTabPilar = (clave: 'PAEC' | 'PARES' | 'ESPIRITUAL') => {
    setPilarSeleccionado(clave)
    setGuardadoPilar('')
    if (clave === 'PAEC' || clave === 'PARES') {
      const encontrado = config.programas.find((p) => p.sigla === clave)
      if (encontrado) {
        setNombreProg(encontrado.nombre)
        setDescProg(encontrado.descripcion)
        setPuntosProg(encontrado.puntos.join('\n'))
      }
    } else {
      setEspNombre(config.espiritual.nombre)
      setEspResumen(config.espiritual.resumenInicio)
      setEspDescInicio(config.espiritual.descripcionInicio)
      setEspExplicacionForm(config.espiritual.explicacionFormulario)
      setEspActivo(config.espiritual.activo)
    }
  }

  const puntosVistaPrevia = useMemo(() => {
    if (pilarSeleccionado === 'ESPIRITUAL') {
      return apoyoEspiritualTexto
        .split(/\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    }
    return puntosProg
      .split(/\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean)
  }, [pilarSeleccionado, puntosProg, apoyoEspiritualTexto])

  const guardarPilar = (e: FormEvent) => {
    e.preventDefault()
    if (pilarSeleccionado === 'PAEC' || pilarSeleccionado === 'PARES') {
      actualizarPrograma(pilarSeleccionado, {
        nombre: nombreProg,
        descripcion: descProg,
        puntos: puntosProg.split(/\r?\n/),
      })
      setGuardadoPilar(`Cambios en ${pilarSeleccionado} guardados correctamente.`)
    } else {
      actualizarEspiritual({
        nombre: espNombre,
        resumenInicio: espResumen,
        descripcionInicio: espDescInicio,
        explicacionFormulario: espExplicacionForm,
        puntos: apoyoEspiritualTexto.split(/\r?\n/),
        activo: espActivo,
      })
      setGuardadoPilar('Cambios en Asistencia Espiritual guardados correctamente.')
    }
  }

  const guardarListasYPasos = (e: FormEvent) => {
    e.preventDefault()
    actualizarTalleres(talleresTexto.split(/\r?\n/))
    actualizarReligiones(religionesTexto.split(/\r?\n/))
    actualizarTiposApoyoEspiritual(apoyoEspiritualTexto.split(/\r?\n/))
    actualizarPasosInicio(pasos)
    setGuardadoListas('Listas desplegables y pasos de bienvenida actualizados.')
  }

  return (
    <div className="space-y-4">
      <BannerContexto
        titulo="Personaliza programas, asistencia espiritual y listas del portal"
        descripcion="Edita los textos de PAEC, PARES y Asistencia Espiritual con vista previa en vivo, además de los talleres, religiones, tipos de apoyo espiritual y pasos de bienvenida."
      />

      <Tarjeta
        ancha
        titulo="Programas y áreas de acompañamiento"
        nota="Elige una pestaña, edita sus textos a la izquierda y revisa a la derecha cómo se verá en el portal."
        dondeAparece="Inicio y Formulario de Solicitud"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {(['PAEC', 'PARES', 'ESPIRITUAL'] as const).map((clave) => {
            const etiqueta =
              clave === 'ESPIRITUAL' ? 'Asistencia Espiritual' : `Programa ${clave}`
            return (
              <button
                key={clave}
                type="button"
                onClick={() => cambiarTabPilar(clave)}
                className={cn(
                  'cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-bold transition-all',
                  pilarSeleccionado === clave
                    ? 'border-uc-purple bg-uc-purple text-white shadow-xs'
                    : 'border-linea bg-fondo text-tinta-2 hover:text-tinta',
                )}
              >
                {etiqueta}
              </button>
            )
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={guardarPilar} className="space-y-3" noValidate>
            {pilarSeleccionado !== 'ESPIRITUAL' ? (
              <>
                <CampoTexto
                  etiqueta="Nombre completo del programa"
                  value={nombreProg}
                  onChange={(e) => {
                    setNombreProg(e.target.value)
                    if (guardadoPilar) setGuardadoPilar('')
                  }}
                />
                <CampoTextoLargo
                  etiqueta="Resumen breve (aparece bajo el título)"
                  value={descProg}
                  onChange={(e) => {
                    setDescProg(e.target.value)
                    if (guardadoPilar) setGuardadoPilar('')
                  }}
                  className="[&_textarea]:min-h-16"
                />
                <CampoTextoLargo
                  etiqueta="Características o beneficios (escribe uno por línea)"
                  value={puntosProg}
                  onChange={(e) => {
                    setPuntosProg(e.target.value)
                    if (guardadoPilar) setGuardadoPilar('')
                  }}
                  className="[&_textarea]:min-h-32"
                />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-xl border border-linea bg-fondo/60 px-3 py-2">
                  <span className="text-xs font-bold text-tinta">
                    Mostrar en el acordeón «Nuestros programas» de Inicio
                  </span>
                  <input
                    type="checkbox"
                    checked={espActivo}
                    onChange={(e) => {
                      setEspActivo(e.target.checked)
                      if (guardadoPilar) setGuardadoPilar('')
                    }}
                    className="h-4 w-4 accent-uc-purple"
                  />
                </div>
                <CampoTexto
                  etiqueta="Nombre del área"
                  value={espNombre}
                  onChange={(e) => {
                    setEspNombre(e.target.value)
                    if (guardadoPilar) setGuardadoPilar('')
                  }}
                />
                <CampoTexto
                  etiqueta="Bajada corta en fila cerrada (Inicio)"
                  value={espResumen}
                  onChange={(e) => {
                    setEspResumen(e.target.value)
                    if (guardadoPilar) setGuardadoPilar('')
                  }}
                />
                <CampoTextoLargo
                  etiqueta="Descripción desplegada en Inicio"
                  value={espDescInicio}
                  onChange={(e) => {
                    setEspDescInicio(e.target.value)
                    if (guardadoPilar) setGuardadoPilar('')
                  }}
                  className="[&_textarea]:min-h-16"
                />
                <CampoTextoLargo
                  etiqueta="Texto explicativo «¿Qué es el apoyo espiritual?» (Nueva Solicitud)"
                  value={espExplicacionForm}
                  onChange={(e) => {
                    setEspExplicacionForm(e.target.value)
                    if (guardadoPilar) setGuardadoPilar('')
                  }}
                  className="[&_textarea]:min-h-20"
                />
              </>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {guardadoPilar ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-uc-green-texto">
                  <CheckCircle2 size={14} /> {guardadoPilar}
                </span>
              ) : (
                <span />
              )}
              <Button type="submit" relieve icono={Check}>
                Guardar {pilarSeleccionado === 'ESPIRITUAL' ? 'Asistencia Espiritual' : pilarSeleccionado}
              </Button>
            </div>
          </form>

          {/* Vista previa en tiempo real */}
          <div className="flex flex-col justify-between rounded-2xl border border-dashed border-uc-purple/40 bg-fondo/70 p-4">
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[0.6875rem] font-bold tracking-wide text-uc-purple-texto uppercase">
                <Eye size={13} /> Vista previa (así lo verá el usuario)
              </div>
              <div className="rounded-xl border border-linea bg-superficie p-3.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <Badge tono="purple">
                    {pilarSeleccionado === 'ESPIRITUAL' ? 'Espiritual' : pilarSeleccionado}
                  </Badge>
                  <h3 className="text-sm font-bold text-tinta">
                    {(pilarSeleccionado === 'ESPIRITUAL' ? espNombre : nombreProg).trim() ||
                      'Nombre del programa'}
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-tinta-2">
                  {(pilarSeleccionado === 'ESPIRITUAL' ? espDescInicio : descProg).trim() ||
                    'Descripción breve...'}
                </p>
                {puntosVistaPrevia.length > 0 && (
                  <ul className="mt-2.5 list-disc space-y-1 pl-4 text-xs text-tinta-2">
                    {puntosVistaPrevia.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <p className="mt-3 text-[0.6875rem] text-tinta-3">
              Esta vista previa se actualiza automáticamente mientras escribes.
            </p>
          </div>
        </div>
      </Tarjeta>

      <Tarjeta
        ancha
        titulo="Listas desplegables y pasos de bienvenida"
        nota="Edita las opciones que aparecen en los formularios y la guía visual de la pantalla principal."
      >
        <form onSubmit={guardarListasYPasos} className="space-y-5" noValidate>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-linea bg-fondo/50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-tinta">Tipos de apoyo espiritual</span>
                <Badge tono="blue">Inicio y Solicitud</Badge>
              </div>
              <CampoTextoLargo
                etiqueta="Escribe una opción por línea"
                value={apoyoEspiritualTexto}
                onChange={(e) => {
                  setApoyoEspiritualTexto(e.target.value)
                  if (guardadoListas) setGuardadoListas('')
                }}
                className="[&_textarea]:min-h-36"
              />
            </div>

            <div className="rounded-xl border border-linea bg-fondo/50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-tinta">Opciones de religión / credo</span>
                <Badge tono="blue">Nueva Solicitud</Badge>
              </div>
              <CampoTextoLargo
                etiqueta="Escribe una opción por línea"
                value={religionesTexto}
                onChange={(e) => {
                  setReligionesTexto(e.target.value)
                  if (guardadoListas) setGuardadoListas('')
                }}
                className="[&_textarea]:min-h-36"
              />
            </div>

            <div className="rounded-xl border border-linea bg-fondo/50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-tinta">Talleres grupales PAEC</span>
                <Badge tono="blue">Inicio</Badge>
              </div>
              <CampoTextoLargo
                etiqueta="Escribe un taller por línea"
                value={talleresTexto}
                onChange={(e) => {
                  setTalleresTexto(e.target.value)
                  if (guardadoListas) setGuardadoListas('')
                }}
                className="[&_textarea]:min-h-36"
              />
            </div>
          </div>

          <div className="border-t border-linea pt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold tracking-wide text-uc-purple-texto uppercase">
                4 Pasos de «Cómo avanzará tu solicitud»
              </h3>
              <Badge tono="blue">Página de Inicio</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pasos.map((paso, idx) => (
                <div key={idx} className="space-y-2 rounded-xl border border-linea bg-fondo/60 p-3">
                  <CampoTexto
                    etiqueta={`Paso ${idx + 1} · Título corto`}
                    value={paso.titulo}
                    onChange={(e) => {
                      setPasos((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, titulo: e.target.value } : item)),
                      )
                      if (guardadoListas) setGuardadoListas('')
                    }}
                  />
                  <CampoTexto
                    etiqueta={`Paso ${idx + 1} · Mensaje explicativo`}
                    value={paso.texto}
                    onChange={(e) => {
                      setPasos((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, texto: e.target.value } : item)),
                      )
                      if (guardadoListas) setGuardadoListas('')
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {guardadoListas ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-uc-green-texto">
                <CheckCircle2 size={14} /> {guardadoListas}
              </span>
            ) : (
              <span />
            )}
            <Button type="submit" relieve icono={Check}>
              Guardar listas y pasos
            </Button>
          </div>
        </form>
      </Tarjeta>
    </div>
  )
}

function EditorFormulario() {
  const { config, actualizarFlujoSolicitud } = useConfiguracionPortal()

  const [tiposSolicitante, setTiposSolicitante] = useState(config.tiposSolicitante)
  const [opcionesApoyo, setOpcionesApoyo] = useState(config.opcionesApoyo)
  const [reglaEspiritual, setReglaEspiritual] = useState<ReglaEspiritualColaborador>(
    config.reglaEspiritualColaborador,
  )
  const [consentPersonal, setConsentPersonal] = useState(config.consentimientoPersonal)
  const [consentColab, setConsentColab] = useState(config.consentimientoColaborador)
  const [mensajeConfirm, setMensajeConfirm] = useState(config.mensajeConfirmacion)
  const [guardado, setGuardado] = useState('')

  const guardar = (e: FormEvent) => {
    e.preventDefault()
    actualizarFlujoSolicitud({
      tiposSolicitante,
      opcionesApoyo,
      reglaEspiritualColaborador: reglaEspiritual,
      consentimientoPersonal: consentPersonal,
      consentimientoColaborador: consentColab,
      mensajeConfirmacion: mensajeConfirm,
    })
    setGuardado('Configuración del formulario guardada correctamente.')
  }

  return (
    <form onSubmit={guardar} className="space-y-4" noValidate>
      <BannerContexto
        titulo="Controla las preguntas, opciones y textos del formulario Nueva Solicitud"
        descripcion="Personaliza las tarjetas que eligen los usuarios, activa o pausa opciones temporalmente y ajusta los textos legales y de confirmación."
      />

      <Tarjeta
        ancha
        titulo="1. Tarjetas de «¿Para quién pides apoyo?»"
        nota="Edita el título y descripción de cada perfil o desactívalo temporalmente si no está disponible."
        dondeAparece="Paso 2 de Nueva Solicitud"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {tiposSolicitante.map((item, idx) => (
            <div
              key={item.valor}
              className={cn(
                'space-y-2 rounded-xl border p-3.5 transition-opacity',
                item.activo ? 'border-linea bg-fondo/60' : 'border-dashed border-linea bg-fondo/30 opacity-70',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge tono={item.activo ? 'purple' : 'muted'}>{item.valor}</Badge>
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-tinta-2">
                  <input
                    type="checkbox"
                    checked={item.activo}
                    onChange={(e) => {
                      setTiposSolicitante((prev) =>
                        prev.map((t, i) => (i === idx ? { ...t, activo: e.target.checked } : t)),
                      )
                      if (guardado) setGuardado('')
                    }}
                    className="h-4 w-4 accent-uc-purple"
                  />
                  Visible
                </label>
              </div>
              <CampoTexto
                etiqueta="Título de la tarjeta"
                value={item.titulo}
                onChange={(e) => {
                  setTiposSolicitante((prev) =>
                    prev.map((t, i) => (i === idx ? { ...t, titulo: e.target.value } : t)),
                  )
                  if (guardado) setGuardado('')
                }}
              />
              <CampoTexto
                etiqueta="Texto explicativo"
                value={item.texto}
                onChange={(e) => {
                  setTiposSolicitante((prev) =>
                    prev.map((t, i) => (i === idx ? { ...t, texto: e.target.value } : t)),
                  )
                  if (guardado) setGuardado('')
                }}
              />
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta
        ancha
        titulo="2. Opciones de apoyo para Colaboradores y Equipos"
        nota="Define las tarjetas de PAEC, PARES y UIC y cuándo ofrecer acompañamiento espiritual opcional."
        dondeAparece="Paso 3 y Contacto en Nueva Solicitud"
      >
        <div className="grid gap-3 md:grid-cols-3">
          {opcionesApoyo.map((opc, idx) => (
            <div
              key={opc.clave}
              className={cn(
                'space-y-2 rounded-xl border p-3.5 transition-opacity',
                opc.activo ? 'border-linea bg-fondo/60' : 'border-dashed border-linea bg-fondo/30 opacity-70',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge tono={opc.activo ? 'blue' : 'muted'}>{opc.clave}</Badge>
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-tinta-2">
                  <input
                    type="checkbox"
                    checked={opc.activo}
                    onChange={(e) => {
                      setOpcionesApoyo((prev) =>
                        prev.map((o, i) => (i === idx ? { ...o, activo: e.target.checked } : o)),
                      )
                      if (guardado) setGuardado('')
                    }}
                    className="h-4 w-4 accent-uc-purple"
                  />
                  Visible
                </label>
              </div>
              <CampoTexto
                etiqueta="Título"
                value={opc.titulo}
                onChange={(e) => {
                  setOpcionesApoyo((prev) =>
                    prev.map((o, i) => (i === idx ? { ...o, titulo: e.target.value } : o)),
                  )
                  if (guardado) setGuardado('')
                }}
              />
              <CampoTextoLargo
                etiqueta="Descripción corta"
                value={opc.texto}
                onChange={(e) => {
                  setOpcionesApoyo((prev) =>
                    prev.map((o, i) => (i === idx ? { ...o, texto: e.target.value } : o)),
                  )
                  if (guardado) setGuardado('')
                }}
                className="[&_textarea]:min-h-16"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-uc-purple/25 bg-fondo/70 p-3.5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-uc-purple-texto">
            <Sparkles size={14} /> Regla del bloque «¿Deseas apoyo espiritual? (opcional)»
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              {
                val: 'solo-pares' as const,
                titulo: 'Solo en solicitudes PARES',
                desc: 'Aparece únicamente cuando el colaborador o equipo elige PARES.',
              },
              {
                val: 'todos-colaboradores' as const,
                titulo: 'En todos los colaboradores/equipos',
                desc: 'Aparece en cualquier solicitud de colaborador o equipo que se guarde.',
              },
              {
                val: 'oculto' as const,
                titulo: 'Oculto para colaboradores',
                desc: 'Solo se solicita apoyo espiritual para pacientes y familiares.',
              },
            ].map((op) => (
              <button
                key={op.val}
                type="button"
                onClick={() => {
                  setReglaEspiritual(op.val)
                  if (guardado) setGuardado('')
                }}
                className={cn(
                  'cursor-pointer rounded-xl border-2 p-2.5 text-left transition-all',
                  reglaEspiritual === op.val
                    ? 'border-uc-purple bg-uc-purple-light text-uc-purple-texto'
                    : 'border-linea bg-superficie text-tinta hover:border-uc-purple/40',
                )}
              >
                <p className="text-xs font-bold">{op.titulo}</p>
                <p className="mt-0.5 text-[0.7rem] text-tinta-2">{op.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </Tarjeta>

      <Tarjeta
        ancha
        titulo="3. Textos de autorización y mensaje final de envío"
        nota="Frases legales y de agradecimiento que lee el usuario antes y después de enviar su solicitud."
        dondeAparece="Paso final y pantalla de éxito"
      >
        <div className="space-y-3">
          <CampoTextoLargo
            etiqueta="Casilla de autorización (para Paciente o Familiar)"
            value={consentPersonal}
            onChange={(e) => {
              setConsentPersonal(e.target.value)
              if (guardado) setGuardado('')
            }}
            className="[&_textarea]:min-h-16"
          />
          <CampoTextoLargo
            etiqueta="Casilla de autorización (para Colaborador o Equipo)"
            value={consentColab}
            onChange={(e) => {
              setConsentColab(e.target.value)
              if (guardado) setGuardado('')
            }}
            className="[&_textarea]:min-h-16"
          />
          <CampoTextoLargo
            etiqueta="Mensaje de confirmación después de enviar"
            value={mensajeConfirm}
            onChange={(e) => {
              setMensajeConfirm(e.target.value)
              if (guardado) setGuardado('')
            }}
            className="[&_textarea]:min-h-16"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          {guardado ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-uc-green-texto">
              <CheckCircle2 size={14} /> {guardado}
            </span>
          ) : (
            <span />
          )}
          <Button type="submit" relieve icono={Check}>
            Guardar ajustes del formulario
          </Button>
        </div>
      </Tarjeta>
    </form>
  )
}

function ReglasYRespaldo() {
  const { config, actualizarReglas, actualizarIdentidad, restaurarConfiguracion } =
    useConfiguracionPortal()
  const { anuncios } = useAnuncios()

  // Identidad y portada
  const [nombreArea, setNombreArea] = useState(config.nombreArea)
  const [avisoPortada, setAvisoPortada] = useState(config.avisoPortada)
  const [contactoSoporte, setContactoSoporte] = useState(config.contactoSoporte)
  const [descSolicitante, setDescSolicitante] = useState(config.descripcionRoles.solicitante)
  const [descCoordinador, setDescCoordinador] = useState(config.descripcionRoles.coordinador)
  const [descAdministrador, setDescAdministrador] = useState(config.descripcionRoles.administrador)
  const [mensajeIdentidad, setMensajeIdentidad] = useState('')

  // Reglas y alertas
  const [horas, setHoras] = useState(String(config.horasEscalamiento))
  const [mensajeEscalamiento, setMensajeEscalamiento] = useState(config.mensajeEscalamiento)
  const [avisoHorario, setAvisoHorario] = useState(config.avisoHorario)
  const [urlPaec, setUrlPaec] = useState(config.formularioPaecUrl)
  const [textoUic, setTextoUic] = useState(config.textoUic)
  const [mensajeReglas, setMensajeReglas] = useState('')

  // Respaldos
  const [mensajeRespaldo, setMensajeRespaldo] = useState('')
  const [errorRespaldo, setErrorRespaldo] = useState('')
  const [modalReset, setModalReset] = useState(false)
  const [respaldoPendiente, setRespaldoPendiente] = useState<{
    nombreArchivo: string
    fechaExportacion?: string
    datos: Record<string, string | null>
  } | null>(null)
  const inputArchivoRef = useRef<HTMLInputElement | null>(null)

  const horasNum = Math.max(1, Number(horas) || 24)

  const guardarIdentidad = (e: FormEvent) => {
    e.preventDefault()
    actualizarIdentidad({
      nombreArea,
      avisoPortada,
      contactoSoporte,
      descripcionRoles: {
        solicitante: descSolicitante,
        coordinador: descCoordinador,
        administrador: descAdministrador,
      },
    })
    setMensajeIdentidad('Identidad, portada y textos de bienvenida guardados.')
  }

  const guardarReglas = (e: FormEvent) => {
    e.preventDefault()
    actualizarReglas({
      horasEscalamiento: horasNum,
      mensajeEscalamiento,
      avisoHorario,
      formularioPaecUrl: urlPaec,
      textoUic,
    })
    setMensajeReglas('Reglas operativas y alertas guardadas correctamente.')
  }

  const exportarRespaldoTotal = () => {
    const respaldo = {
      version: 2,
      exportadoEn: new Date().toISOString(),
      datos: {
        centros: localStorage.getItem('portal-apoyo:centros:v3'),
        responsables: localStorage.getItem('portal-apoyo:responsables:v2'),
        usuarios: localStorage.getItem('portal-apoyo:usuarios:v1'),
        anuncios: localStorage.getItem('portal-apoyo:anuncios:v1'),
        config: localStorage.getItem('portal-apoyo:config:v1'),
      },
    }
    const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `respaldo-portal-humanizacion-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMensajeRespaldo(
      'Copia de seguridad descargada. Guárdala en la carpeta compartida de OneDrive o SharePoint del equipo.',
    )
    setErrorRespaldo('')
  }

  const seleccionarArchivoRespaldo = (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    const lector = new FileReader()
    lector.onload = () => {
      try {
        const parsed = JSON.parse(String(lector.result)) as {
          exportadoEn?: string
          datos?: Record<string, string | null>
        }
        if (!parsed?.datos || typeof parsed.datos !== 'object') {
          throw new Error('Formato inválido')
        }
        setRespaldoPendiente({
          nombreArchivo: archivo.name,
          fechaExportacion: parsed.exportadoEn,
          datos: parsed.datos,
        })
        setErrorRespaldo('')
      } catch {
        setErrorRespaldo(
          'El archivo elegido no corresponde a una copia de seguridad válida del portal.',
        )
        setMensajeRespaldo('')
      }
    }
    lector.readAsText(archivo)
  }

  const confirmarRestauracionArchivo = () => {
    if (!respaldoPendiente) return
    const mapaClaves: Record<string, string> = {
      centros: 'portal-apoyo:centros:v3',
      responsables: 'portal-apoyo:responsables:v2',
      usuarios: 'portal-apoyo:usuarios:v1',
      anuncios: 'portal-apoyo:anuncios:v1',
      config: 'portal-apoyo:config:v1',
    }
    for (const [k, storageKey] of Object.entries(mapaClaves)) {
      const val = respaldoPendiente.datos[k]
      if (typeof val === 'string') localStorage.setItem(storageKey, val)
    }
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <BannerContexto
        titulo="Identidad institucional, tiempos de alerta y copias de seguridad"
        descripcion="Configura el nombre del área, un anuncio destacado en portada, las horas de alerta de escalamiento y descarga copias de seguridad del portal."
      />

      <Tarjeta
        ancha
        titulo="1. Portada, identidad institucional y contacto"
        nota="Personaliza el nombre del área, un banner opcional en Inicio y la bajada de bienvenida de cada rol."
        dondeAparece="Página de Inicio y Solicitudes"
      >
        <form onSubmit={guardarIdentidad} className="space-y-3" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <CampoTexto
              etiqueta="Nombre institucional del área"
              value={nombreArea}
              onChange={(e) => {
                setNombreArea(e.target.value)
                if (mensajeIdentidad) setMensajeIdentidad('')
              }}
            />
            <CampoTexto
              etiqueta="Dato de contacto o mesa de ayuda"
              placeholder="Ej. Anexo 1234 · humanizacion@ucchristus.cl"
              value={contactoSoporte}
              onChange={(e) => {
                setContactoSoporte(e.target.value)
                if (mensajeIdentidad) setMensajeIdentidad('')
              }}
            />
          </div>

          <CampoTextoLargo
            etiqueta="Aviso destacado en la portada de Inicio (déjalo vacío si no deseas mostrar ninguno)"
            placeholder="Ej. Esta semana realizaremos pausas activas en el Hospital Clínico de 11:00 a 13:00 hrs."
            value={avisoPortada}
            onChange={(e) => {
              setAvisoPortada(e.target.value)
              if (mensajeIdentidad) setMensajeIdentidad('')
            }}
            className="[&_textarea]:min-h-14"
          />

          <div className="grid gap-3 md:grid-cols-3">
            <CampoTextoLargo
              etiqueta="Bajada bienvenida · Solicitante"
              value={descSolicitante}
              onChange={(e) => {
                setDescSolicitante(e.target.value)
                if (mensajeIdentidad) setMensajeIdentidad('')
              }}
              className="[&_textarea]:min-h-20"
            />
            <CampoTextoLargo
              etiqueta="Bajada bienvenida · Coordinador"
              value={descCoordinador}
              onChange={(e) => {
                setDescCoordinador(e.target.value)
                if (mensajeIdentidad) setMensajeIdentidad('')
              }}
              className="[&_textarea]:min-h-20"
            />
            <CampoTextoLargo
              etiqueta="Bajada bienvenida · Administrador"
              value={descAdministrador}
              onChange={(e) => {
                setDescAdministrador(e.target.value)
                if (mensajeIdentidad) setMensajeIdentidad('')
              }}
              className="[&_textarea]:min-h-20"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {mensajeIdentidad ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-uc-green-texto">
                <CheckCircle2 size={14} /> {mensajeIdentidad}
              </span>
            ) : (
              <span />
            )}
            <Button type="submit" relieve icono={Check}>
              Guardar identidad y portada
            </Button>
          </div>
        </form>
      </Tarjeta>

      <Tarjeta
        ancha
        titulo="2. Tiempos de alerta y avisos del portal"
        nota="Ajusta las reglas de atención y escalamiento sin tocar código."
      >
        <form onSubmit={guardarReglas} className="space-y-4" noValidate>
          <div className="rounded-xl border border-linea bg-fondo/60 p-3.5">
            <div className="grid items-start gap-3 sm:grid-cols-[220px_1fr]">
              <CampoTexto
                etiqueta="Tiempo máximo sin atender (horas)"
                type="number"
                min={1}
                max={168}
                value={horas}
                onChange={(e) => {
                  setHoras(e.target.value)
                  if (mensajeReglas) setMensajeReglas('')
                }}
              />
              <div className="rounded-lg bg-superficie p-2.5 text-xs text-tinta-2 sm:mt-5">
                <p className="flex items-center gap-1.5 font-semibold text-tinta">
                  <Clock size={14} className="text-uc-amber-texto" /> ¿Cómo funciona esta alerta?
                </p>
                <p className="mt-1">
                  Si una solicitud queda en estado <strong>Pendiente</strong> por más de{' '}
                  <strong>{horasNum} horas</strong>, el sistema la destacará como{' '}
                  <strong>«Sin atender»</strong> en Solicitudes, Detalle y Estadísticas.
                </p>
              </div>
            </div>
          </div>

          <CampoTextoLargo
            etiqueta="Mensaje de alerta al superar las horas sin atender"
            value={mensajeEscalamiento}
            onChange={(e) => {
              setMensajeEscalamiento(e.target.value)
              if (mensajeReglas) setMensajeReglas('')
            }}
            className="[&_textarea]:min-h-14"
          />

          <CampoTexto
            etiqueta="Enlace de agenda online PAEC (Medilink)"
            ayuda="Dirección web a la que se redirige cuando un colaborador agenda sesión psicológica PAEC."
            value={urlPaec}
            onChange={(e) => {
              setUrlPaec(e.target.value)
              if (mensajeReglas) setMensajeReglas('')
            }}
          />

          <CampoTextoLargo
            etiqueta="Aviso de horario de atención (visible al crear solicitud)"
            value={avisoHorario}
            onChange={(e) => {
              setAvisoHorario(e.target.value)
              if (mensajeReglas) setMensajeReglas('')
            }}
            className="[&_textarea]:min-h-16"
          />

          <CampoTextoLargo
            etiqueta="Mensaje informativo sobre Unidad de Intervención en Crisis (UIC)"
            value={textoUic}
            onChange={(e) => {
              setTextoUic(e.target.value)
              if (mensajeReglas) setMensajeReglas('')
            }}
            className="[&_textarea]:min-h-16"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {mensajeReglas ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-uc-green-texto">
                <CheckCircle2 size={14} /> {mensajeReglas}
              </span>
            ) : (
              <span />
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variante="outline"
                icono={RotateCcw}
                onClick={() => setModalReset(true)}
              >
                Restaurar textos originales
              </Button>
              <Button type="submit" relieve icono={Check}>
                Guardar reglas y avisos
              </Button>
            </div>
          </div>
        </form>
      </Tarjeta>

      <Tarjeta
        ancha
        titulo="3. Carrusel de anuncios y copias de seguridad"
        nota="Administra las tarjetas con imágenes de la portada o guarda un respaldo completo en tu computador."
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-linea bg-fondo/60 p-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-uc-purple-light text-uc-purple-texto">
              <Megaphone size={16} />
            </span>
            <div>
              <p className="text-xs font-bold text-tinta">
                Carrusel «Novedades y campañas» ({anuncios.length} tarjetas registradas)
              </p>
              <p className="text-[0.75rem] text-tinta-3">
                Sube imágenes, reordena u oculta campañas visibles en la pantalla principal.
              </p>
            </div>
          </div>
          <Link to="/anuncios">
            <Button tamano="sm" variante="outline" icono={Megaphone} tabIndex={-1}>
              Gestionar anuncios
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button relieve icono={Download} onClick={exportarRespaldoTotal}>
            Descargar copia de seguridad
          </Button>
          <Button
            variante="outline"
            icono={Upload}
            onClick={() => inputArchivoRef.current?.click()}
          >
            Restaurar desde una copia
          </Button>
          <input
            ref={inputArchivoRef}
            type="file"
            accept=".json,application/json"
            onChange={seleccionarArchivoRespaldo}
            className="hidden"
          />
        </div>
        {mensajeRespaldo && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-uc-green-texto">
            <CheckCircle2 size={14} /> {mensajeRespaldo}
          </p>
        )}
        {errorRespaldo && <p className="mt-3 text-xs text-uc-red-texto">{errorRespaldo}</p>}
      </Tarjeta>

      {/* Modal confirmar restauración de textos base */}
      <Modal
        abierto={modalReset}
        onCerrar={() => setModalReset(false)}
        titulo="¿Volver a los textos y reglas originales?"
        icono={TriangleAlert}
        tono="amber"
        pie={
          <>
            <Button variante="outline" relieve onClick={() => setModalReset(false)}>
              Cancelar
            </Button>
            <Button
              relieve
              icono={RotateCcw}
              onClick={() => {
                restaurarConfiguracion()
                setModalReset(false)
                window.location.reload()
              }}
            >
              Sí, restaurar
            </Button>
          </>
        }
      >
        <p className="text-sm text-tinta-2">
          Se volverán a cargar todos los textos, programas, formulario y horas de alerta originales
          del portal. Los centros y responsables no se verán afectados.
        </p>
      </Modal>

      {/* Modal confirmar carga de respaldo desde archivo */}
      <Modal
        abierto={respaldoPendiente !== null}
        onCerrar={() => setRespaldoPendiente(null)}
        titulo="¿Cargar copia de seguridad?"
        icono={Upload}
        tono="blue"
        pie={
          <>
            <Button variante="outline" relieve onClick={() => setRespaldoPendiente(null)}>
              Cancelar
            </Button>
            <Button relieve icono={Check} onClick={confirmarRestauracionArchivo}>
              Sí, cargar esta copia
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-sm text-tinta-2">
          <p>
            Vas a cargar el archivo <strong>{respaldoPendiente?.nombreArchivo}</strong>.
          </p>
          {respaldoPendiente?.fechaExportacion && (
            <p className="text-xs text-tinta-3">
              Fecha de creación de la copia:{' '}
              {new Date(respaldoPendiente.fechaExportacion).toLocaleString('es-CL')}
            </p>
          )}
          <p className="text-xs text-tinta-3">
            La configuración actual de este navegador será reemplazada por la del archivo y la
            página se actualizará automáticamente.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export function Administracion() {
  const [tab, setTab] = useState<TabAdmin>('centros')
  const [verGuia, setVerGuia] = useState(false)

  const { centros, responsables, usuarios } = useCatalogos()
  const { config } = useConfiguracionPortal()

  const totalServicios = useMemo(
    () =>
      centros.reduce(
        (acc, c) =>
          acc +
          c.serviciosComunes.length +
          c.subcentros.reduce((sAcc, s) => sAcc + s.servicios.length, 0),
        0,
      ),
    [centros],
  )

  const responsablesActivos = responsables.filter((r) => r.activo).length
  const perfilesActivos = config.tiposSolicitante.filter((t) => t.activo).length

  const tabs: {
    id: TabAdmin
    etiqueta: string
    bajada: string
    resumen: string
    icono: typeof Building2
  }[] = [
    {
      id: 'centros',
      etiqueta: 'Centros y servicios',
      bajada: 'Hospitales, centros médicos y unidades clínicas',
      resumen: `${centros.length} áreas · ${totalServicios} servicios`,
      icono: Building2,
    },
    {
      id: 'equipo',
      etiqueta: 'Equipo y permisos',
      bajada: 'Quién atiende casos y quién administra el portal',
      resumen: `${responsablesActivos} activos · ${usuarios.length} permisos`,
      icono: Users,
    },
    {
      id: 'contenidos',
      etiqueta: 'Programas y textos',
      bajada: 'PAEC, PARES, Asistencia Espiritual, talleres y pasos',
      resumen: `3 áreas · ${config.talleresGrupales.length} talleres`,
      icono: FileText,
    },
    {
      id: 'formulario',
      etiqueta: 'Formulario de solicitud',
      bajada: 'Tarjetas, opciones activas, apoyo espiritual y legales',
      resumen: `${perfilesActivos} perfiles activos`,
      icono: ClipboardEdit,
    },
    {
      id: 'reglas',
      etiqueta: 'Identidad y reglas',
      bajada: 'Portada, tiempos de alerta, anuncios y respaldos',
      resumen: `Alerta: ${config.horasEscalamiento}h`,
      icono: SlidersHorizontal,
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          titulo="Administración"
          subtitulo={`Panel de control integral para ${config.nombreArea}.`}
        />
        <Button variante="outline" relieve icono={HelpCircle} onClick={() => setVerGuia(true)}>
          ¿Cómo usar esta pantalla?
        </Button>
      </div>

      <nav
        aria-label="Secciones de administración"
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5"
      >
        {tabs.map(({ id, etiqueta, bajada, resumen, icono: Icono }) => {
          const activa = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={activa ? 'page' : undefined}
              className={cn(
                'flex cursor-pointer flex-col justify-between rounded-2xl border p-3.5 text-left transition-all',
                activa
                  ? 'gradiente-marca border-transparent text-white shadow-md'
                  : 'border-linea bg-superficie text-tinta hover:border-uc-purple/40 hover:bg-fondo/60',
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'grid size-8 place-items-center rounded-xl',
                      activa ? 'bg-white/20 text-white' : 'bg-uc-purple-light text-uc-purple-texto',
                    )}
                  >
                    <Icono size={17} aria-hidden />
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold',
                      activa ? 'bg-white/20 text-white' : 'bg-fondo text-tinta-3',
                    )}
                  >
                    {resumen}
                  </span>
                </div>
                <p className="mt-2.5 text-sm font-bold">{etiqueta}</p>
                <p
                  className={cn(
                    'mt-0.5 text-xs leading-snug',
                    activa ? 'text-white/90' : 'text-tinta-3',
                  )}
                >
                  {bajada}
                </p>
              </div>
            </button>
          )
        })}
      </nav>

      {tab === 'centros' && (
        <div className="space-y-4">
          <BannerContexto
            titulo="Catálogo de ubicaciones clínicas del portal"
            descripcion="Elige un área arriba, selecciona un hospital o centro a la izquierda y administra sus servicios a la derecha. Los cambios se reflejan al instante en Nueva Solicitud."
          />
          <Tarjeta
            ancha
            titulo="Centros y servicios clínicos"
            nota="Puedes buscar por sigla (ej. MQ, UTIM, TMT) o agregar varios servicios pegando una lista."
            dondeAparece="Formulario de Nueva Solicitud"
          >
            <CentrosYServicios />
          </Tarjeta>
        </div>
      )}

      {tab === 'equipo' && (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-2xl border border-linea bg-superficie p-4 shadow-sm sm:grid-cols-2">
            <div className="rounded-xl bg-uc-blue-light/50 p-3">
              <p className="text-xs font-bold text-uc-blue-texto">¿Qué es un «Responsable»?</p>
              <p className="mt-1 text-xs text-tinta-2">
                Es la persona del equipo de {config.nombreArea} a quien se le asigna una solicitud
                para llamar y acompañar al paciente, familiar o colaborador.
              </p>
            </div>
            <div className="rounded-xl bg-uc-purple-light/50 p-3">
              <p className="text-xs font-bold text-uc-purple-texto">
                ¿Qué es un «Usuario con permiso»?
              </p>
              <p className="mt-1 text-xs text-tinta-2">
                Define qué puede hacer cada persona al iniciar sesión: <strong>Coordinador</strong>{' '}
                (gestiona casos) o <strong>Administrador</strong> (gestiona casos y edita esta
                pantalla).
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Responsables />
            <Usuarios />
          </div>

          <details className="rounded-2xl border border-linea bg-superficie px-4 py-3 text-xs text-tinta-2">
            <summary className="flex cursor-pointer items-center gap-2 font-semibold text-tinta">
              <ShieldCheck size={15} className="text-uc-purple-texto" />
              Información técnica para TI (administradores iniciales)
            </summary>
            <p className="mt-2 pl-6 text-tinta-3">
              Los correos configurados por el área de TI en la variable de entorno{' '}
              <code>VITE_ADMINISTRADORES</code> siempre ingresan con rol de Administrador para
              garantizar acceso inicial al portal.
            </p>
          </details>
        </div>
      )}

      {tab === 'contenidos' && <EditorContenidos />}

      {tab === 'formulario' && <EditorFormulario />}

      {tab === 'reglas' && <ReglasYRespaldo />}

      <GuiaRapidaModal abierto={verGuia} onCerrar={() => setVerGuia(false)} />
    </div>
  )
}