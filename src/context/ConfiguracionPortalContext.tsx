import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { FORMULARIO_PAEC_URL, TEXTO_UIC } from '@/config/enlaces'
import { HORAS_ESCALAMIENTO } from '@/config/escalamiento'
import { AREAS, AVISO_HORARIO } from '@/config/marca'
import { descripcionDeRol } from '@/config/navegacion'
import {
  programas as programasIniciales,
  talleresGrupales as talleresIniciales,
  type InfoPrograma,
} from '@/config/programas'
import { religiones as religionesIniciales } from '@/data/catalogos'
import type { Rol, TipoSolicitante } from '@/types'
import { guardarJSON, leerJSON } from '@/utils/almacenamiento'

export interface PasoInicioConfig {
  titulo: string
  texto: string
}

export interface InfoEspiritualConfig {
  nombre: string
  resumenInicio: string
  descripcionInicio: string
  explicacionFormulario: string
  puntos: string[]
  activo: boolean
}

export interface TarjetaTipoSolicitanteConfig {
  valor: TipoSolicitante
  titulo: string
  texto: string
  activo: boolean
}

export interface OpcionApoyoConfig {
  clave: 'PAEC' | 'PARES' | 'UIC'
  titulo: string
  texto: string
  activo: boolean
}

export type ReglaEspiritualColaborador = 'solo-pares' | 'todos-colaboradores' | 'oculto'

export interface ConfiguracionPortal {
  // Reglas operativas y alertas
  horasEscalamiento: number
  mensajeEscalamiento: string
  avisoHorario: string
  formularioPaecUrl: string
  textoUic: string

  // Identidad y portada
  nombreArea: string
  avisoPortada: string
  contactoSoporte: string
  descripcionRoles: Record<Rol, string>

  // Programas y asistencia espiritual
  programas: InfoPrograma[]
  espiritual: InfoEspiritualConfig
  talleresGrupales: string[]
  pasosInicio: PasoInicioConfig[]
  religiones: string[]
  tiposApoyoEspiritual: string[]

  // Personalización del formulario de solicitud
  tiposSolicitante: TarjetaTipoSolicitanteConfig[]
  opcionesApoyo: OpcionApoyoConfig[]
  reglaEspiritualColaborador: ReglaEspiritualColaborador
  consentimientoPersonal: string
  consentimientoColaborador: string
  mensajeConfirmacion: string
}

const CLAVE_CONFIG = 'portal-apoyo:config:v1'

export const configuracionInicial: ConfiguracionPortal = {
  horasEscalamiento: HORAS_ESCALAMIENTO,
  mensajeEscalamiento:
    'Esta solicitud lleva más tiempo del esperado sin atención. Debe escalarse a la jefatura de Humanización y Misión y RSE.',
  avisoHorario: AVISO_HORARIO,
  formularioPaecUrl: FORMULARIO_PAEC_URL,
  textoUic: TEXTO_UIC,

  nombreArea: AREAS,
  avisoPortada: '',
  contactoSoporte: 'Si tienes dudas o necesitas ayuda urgente, comunícate con el equipo de Humanización y Misión y RSE.',
  descripcionRoles: { ...descripcionDeRol },

  programas: structuredClone(programasIniciales),
  espiritual: {
    nombre: 'Área de Asistencia Espiritual y Pastoral',
    resumenInicio: 'Acompañamiento espiritual para pacientes, familias y colaboradores.',
    descripcionInicio:
      'Puedes pedir acompañamiento espiritual para un paciente, su familia, para ti o para tu equipo, desde cualquier religión o creencia. Lo entrega el Área de Asistencia Espiritual y Pastoral.',
    explicacionFormulario:
      'Es un acompañamiento que respeta la fe, las creencias y los valores de cada persona, desde cualquier religión o sin una en particular. Te escucha, te acompaña y, si lo deseas, comparte un momento de oración o de silencio. Lo entrega el Área de Asistencia Espiritual y Pastoral.',
    puntos: [
      'Escucha y acompañamiento espiritual',
      'Oración o bendición (personal o para el equipo)',
      'Sacramentos o ritos según mi fe',
      'Acompañamiento espiritual en duelo o momento difícil',
    ],
    activo: true,
  },
  talleresGrupales: [...talleresIniciales],
  pasosInicio: [
    { titulo: 'Pides apoyo', texto: 'Respondes unas pocas preguntas en el portal. Es rápido.' },
    {
      titulo: 'Le llega a un equipo',
      texto: 'Tu solicitud llega al instante al equipo de Humanización y Misión y RSE.',
    },
    {
      titulo: 'Se asigna a tu contraparte',
      texto: 'Una persona del equipo se hace cargo y será quien te acompañe.',
    },
    { titulo: 'Te contactamos', texto: 'Te llamamos al teléfono que indicaste, en horario hábil.' },
  ],
  religiones: [...religionesIniciales],
  tiposApoyoEspiritual: [
    'Escucha y acompañamiento espiritual',
    'Oración o bendición (personal o para el equipo)',
    'Sacramentos o ritos según mi fe',
    'Acompañamiento espiritual en duelo o momento difícil',
  ],

  tiposSolicitante: [
    {
      valor: 'Paciente',
      titulo: 'Para un paciente',
      texto: 'Una persona hospitalizada o en atención a quien quieres que acompañemos.',
      activo: true,
    },
    {
      valor: 'Familiar',
      titulo: 'Para un familiar',
      texto: 'Alguien de la familia de un paciente, para que también reciba apoyo.',
      activo: true,
    },
    {
      valor: 'Colaborador',
      titulo: 'Para mí',
      texto: 'Tú, que trabajas en la red y necesitas apoyo.',
      activo: true,
    },
    {
      valor: 'Equipo',
      titulo: 'Para mi equipo',
      texto: 'Tu equipo de trabajo, para que lo acompañemos juntos.',
      activo: true,
    },
  ],
  opcionesApoyo: [
    {
      clave: 'PAEC',
      titulo: 'Apoyo emocional - Psicólogo/a',
      texto: 'Conversar con un psicólogo/a y sentirte acompañado(a).',
      activo: true,
    },
    {
      clave: 'PARES',
      titulo: 'Evento difícil - PARES',
      texto: 'Tú o alguien de tu equipo vivió un evento muy estresante o de seguridad grave.',
      activo: true,
    },
    {
      clave: 'UIC',
      titulo: 'Crisis en tu unidad - UIC',
      texto: 'Quieres saber cómo pedir una intervención en crisis.',
      activo: true,
    },
  ],
  reglaEspiritualColaborador: 'solo-pares',
  consentimientoPersonal:
    'Confirmo que la persona sabe de esta solicitud y está de acuerdo en recibir acompañamiento, y acepto que Humanización y Misión y RSE use estos datos para contactarme.',
  consentimientoColaborador:
    'Acepto que el equipo de Humanización y Misión y RSE use estos datos para contactarme.',
  mensajeConfirmacion: 'Recibimos tu solicitud. Nuestro equipo se comunicará contigo a la brevedad.',
}

interface ConfiguracionPortalValor {
  config: ConfiguracionPortal
  actualizarReglas: (datos: {
    horasEscalamiento: number
    mensajeEscalamiento: string
    avisoHorario: string
    formularioPaecUrl: string
    textoUic: string
  }) => void
  actualizarIdentidad: (datos: {
    nombreArea: string
    avisoPortada: string
    contactoSoporte: string
    descripcionRoles: Record<Rol, string>
  }) => void
  actualizarPrograma: (
    sigla: InfoPrograma['sigla'],
    datos: Pick<InfoPrograma, 'nombre' | 'descripcion' | 'puntos'>,
  ) => void
  actualizarEspiritual: (datos: InfoEspiritualConfig) => void
  actualizarTalleres: (talleres: string[]) => void
  actualizarPasosInicio: (pasos: PasoInicioConfig[]) => void
  actualizarReligiones: (religiones: string[]) => void
  actualizarTiposApoyoEspiritual: (tipos: string[]) => void
  actualizarFlujoSolicitud: (datos: {
    tiposSolicitante: TarjetaTipoSolicitanteConfig[]
    opcionesApoyo: OpcionApoyoConfig[]
    reglaEspiritualColaborador: ReglaEspiritualColaborador
    consentimientoPersonal: string
    consentimientoColaborador: string
    mensajeConfirmacion: string
  }) => void
  restaurarConfiguracion: () => void
}

const ConfiguracionPortalContext = createContext<ConfiguracionPortalValor | null>(null)

export function ConfiguracionPortalProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfiguracionPortal>(() => {
    const guardada = leerJSON<Partial<ConfiguracionPortal>>(CLAVE_CONFIG)
    const base = structuredClone(configuracionInicial)
    if (!guardada) return base

    return {
      ...base,
      ...guardada,
      descripcionRoles: {
        ...base.descripcionRoles,
        ...(guardada.descripcionRoles ?? {}),
      },
      espiritual: {
        ...base.espiritual,
        ...(guardada.espiritual ?? {}),
      },
      programas: (guardada.programas ?? base.programas).map((p) => {
        const orig = base.programas.find((item) => item.sigla === p.sigla)
        return { ...p, logo: orig?.logo ?? p.logo }
      }),
      tiposSolicitante:
        guardada.tiposSolicitante && guardada.tiposSolicitante.length > 0
          ? guardada.tiposSolicitante
          : base.tiposSolicitante,
      opcionesApoyo:
        guardada.opcionesApoyo && guardada.opcionesApoyo.length > 0
          ? guardada.opcionesApoyo
          : base.opcionesApoyo,
    }
  })

  const guardar = useCallback((nueva: ConfiguracionPortal) => {
    guardarJSON(CLAVE_CONFIG, nueva)
    setConfig(nueva)
  }, [])

  const actualizarReglas = useCallback(
    (datos: {
      horasEscalamiento: number
      mensajeEscalamiento: string
      avisoHorario: string
      formularioPaecUrl: string
      textoUic: string
    }) => {
      guardar({
        ...config,
        horasEscalamiento: Math.max(1, Math.round(datos.horasEscalamiento || 24)),
        mensajeEscalamiento:
          datos.mensajeEscalamiento.trim() || configuracionInicial.mensajeEscalamiento,
        avisoHorario: datos.avisoHorario.trim() || configuracionInicial.avisoHorario,
        formularioPaecUrl: datos.formularioPaecUrl.trim() || configuracionInicial.formularioPaecUrl,
        textoUic: datos.textoUic.trim() || configuracionInicial.textoUic,
      })
    },
    [config, guardar],
  )

  const actualizarIdentidad = useCallback(
    (datos: {
      nombreArea: string
      avisoPortada: string
      contactoSoporte: string
      descripcionRoles: Record<Rol, string>
    }) => {
      guardar({
        ...config,
        nombreArea: datos.nombreArea.trim() || configuracionInicial.nombreArea,
        avisoPortada: datos.avisoPortada.trim(),
        contactoSoporte: datos.contactoSoporte.trim(),
        descripcionRoles: {
          solicitante:
            datos.descripcionRoles.solicitante.trim() ||
            configuracionInicial.descripcionRoles.solicitante,
          coordinador:
            datos.descripcionRoles.coordinador.trim() ||
            configuracionInicial.descripcionRoles.coordinador,
          administrador:
            datos.descripcionRoles.administrador.trim() ||
            configuracionInicial.descripcionRoles.administrador,
        },
      })
    },
    [config, guardar],
  )

  const actualizarPrograma = useCallback(
    (
      sigla: InfoPrograma['sigla'],
      datos: Pick<InfoPrograma, 'nombre' | 'descripcion' | 'puntos'>,
    ) => {
      guardar({
        ...config,
        programas: config.programas.map((p) =>
          p.sigla === sigla
            ? {
                ...p,
                nombre: datos.nombre.trim() || p.nombre,
                descripcion: datos.descripcion.trim() || p.descripcion,
                puntos: datos.puntos.map((x) => x.trim()).filter(Boolean),
              }
            : p,
        ),
      })
    },
    [config, guardar],
  )

  const actualizarEspiritual = useCallback(
    (datos: InfoEspiritualConfig) => {
      guardar({
        ...config,
        espiritual: {
          nombre: datos.nombre.trim() || configuracionInicial.espiritual.nombre,
          resumenInicio: datos.resumenInicio.trim() || configuracionInicial.espiritual.resumenInicio,
          descripcionInicio:
            datos.descripcionInicio.trim() || configuracionInicial.espiritual.descripcionInicio,
          explicacionFormulario:
            datos.explicacionFormulario.trim() ||
            configuracionInicial.espiritual.explicacionFormulario,
          puntos: datos.puntos.map((x) => x.trim()).filter(Boolean),
          activo: datos.activo,
        },
      })
    },
    [config, guardar],
  )

  const actualizarTalleres = useCallback(
    (talleres: string[]) => {
      guardar({
        ...config,
        talleresGrupales: [...new Set(talleres.map((t) => t.trim()).filter(Boolean))],
      })
    },
    [config, guardar],
  )

  const actualizarPasosInicio = useCallback(
    (pasos: PasoInicioConfig[]) => {
      guardar({
        ...config,
        pasosInicio: pasos.map((p, i) => ({
          titulo: p.titulo.trim() || configuracionInicial.pasosInicio[i]?.titulo || `Paso ${i + 1}`,
          texto: p.texto.trim() || configuracionInicial.pasosInicio[i]?.texto || '',
        })),
      })
    },
    [config, guardar],
  )

  const actualizarReligiones = useCallback(
    (religiones: string[]) => {
      guardar({
        ...config,
        religiones: [...new Set(religiones.map((r) => r.trim()).filter(Boolean))],
      })
    },
    [config, guardar],
  )

  const actualizarTiposApoyoEspiritual = useCallback(
    (tipos: string[]) => {
      const limpios = [...new Set(tipos.map((t) => t.trim()).filter(Boolean))]
      guardar({
        ...config,
        tiposApoyoEspiritual: limpios,
        espiritual: {
          ...config.espiritual,
          puntos: limpios,
        },
      })
    },
    [config, guardar],
  )

  const actualizarFlujoSolicitud = useCallback(
    (datos: {
      tiposSolicitante: TarjetaTipoSolicitanteConfig[]
      opcionesApoyo: OpcionApoyoConfig[]
      reglaEspiritualColaborador: ReglaEspiritualColaborador
      consentimientoPersonal: string
      consentimientoColaborador: string
      mensajeConfirmacion: string
    }) => {
      guardar({
        ...config,
        tiposSolicitante: datos.tiposSolicitante.map((t, idx) => ({
          ...t,
          titulo: t.titulo.trim() || configuracionInicial.tiposSolicitante[idx].titulo,
          texto: t.texto.trim() || configuracionInicial.tiposSolicitante[idx].texto,
        })),
        opcionesApoyo: datos.opcionesApoyo.map((o, idx) => ({
          ...o,
          titulo: o.titulo.trim() || configuracionInicial.opcionesApoyo[idx].titulo,
          texto: o.texto.trim() || configuracionInicial.opcionesApoyo[idx].texto,
        })),
        reglaEspiritualColaborador: datos.reglaEspiritualColaborador,
        consentimientoPersonal:
          datos.consentimientoPersonal.trim() || configuracionInicial.consentimientoPersonal,
        consentimientoColaborador:
          datos.consentimientoColaborador.trim() || configuracionInicial.consentimientoColaborador,
        mensajeConfirmacion:
          datos.mensajeConfirmacion.trim() || configuracionInicial.mensajeConfirmacion,
      })
    },
    [config, guardar],
  )

  const restaurarConfiguracion = useCallback(() => {
    guardar(structuredClone(configuracionInicial))
  }, [guardar])

  const valor = useMemo(
    () => ({
      config,
      actualizarReglas,
      actualizarIdentidad,
      actualizarPrograma,
      actualizarEspiritual,
      actualizarTalleres,
      actualizarPasosInicio,
      actualizarReligiones,
      actualizarTiposApoyoEspiritual,
      actualizarFlujoSolicitud,
      restaurarConfiguracion,
    }),
    [
      config,
      actualizarReglas,
      actualizarIdentidad,
      actualizarPrograma,
      actualizarEspiritual,
      actualizarTalleres,
      actualizarPasosInicio,
      actualizarReligiones,
      actualizarTiposApoyoEspiritual,
      actualizarFlujoSolicitud,
      restaurarConfiguracion,
    ],
  )

  return (
    <ConfiguracionPortalContext.Provider value={valor}>
      {children}
    </ConfiguracionPortalContext.Provider>
  )
}

export function useConfiguracionPortal(): ConfiguracionPortalValor {
  const c = useContext(ConfiguracionPortalContext)
  if (!c)
    throw new Error('useConfiguracionPortal debe usarse dentro de <ConfiguracionPortalProvider>.')
  return c
}