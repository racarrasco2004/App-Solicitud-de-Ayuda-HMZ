import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { FORMULARIO_PAEC_URL, TEXTO_UIC } from '@/config/enlaces'
import { HORAS_ESCALAMIENTO } from '@/config/escalamiento'
import { AVISO_HORARIO } from '@/config/marca'
import { programas as programasIniciales, talleresGrupales as talleresIniciales, type InfoPrograma } from '@/config/programas'
import { religiones as religionesIniciales } from '@/data/catalogos'
import { guardarJSON, leerJSON } from '@/utils/almacenamiento'

export interface PasoInicioConfig {
  titulo: string
  texto: string
}

export interface ConfiguracionPortal {
  horasEscalamiento: number
  avisoHorario: string
  formularioPaecUrl: string
  textoUic: string
  programas: InfoPrograma[]
  talleresGrupales: string[]
  pasosInicio: PasoInicioConfig[]
  religiones: string[]
  tiposApoyoEspiritual: string[]
}

const CLAVE_CONFIG = 'portal-apoyo:config:v1'

export const configuracionInicial: ConfiguracionPortal = {
  horasEscalamiento: HORAS_ESCALAMIENTO,
  avisoHorario: AVISO_HORARIO,
  formularioPaecUrl: FORMULARIO_PAEC_URL,
  textoUic: TEXTO_UIC,
  programas: structuredClone(programasIniciales),
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
}

interface ConfiguracionPortalValor {
  config: ConfiguracionPortal
  actualizarReglas: (datos: {
    horasEscalamiento: number
    avisoHorario: string
    formularioPaecUrl: string
    textoUic: string
  }) => void
  actualizarPrograma: (sigla: InfoPrograma['sigla'], datos: Pick<InfoPrograma, 'nombre' | 'descripcion' | 'puntos'>) => void
  actualizarTalleres: (talleres: string[]) => void
  actualizarPasosInicio: (pasos: PasoInicioConfig[]) => void
  actualizarReligiones: (religiones: string[]) => void
  actualizarTiposApoyoEspiritual: (tipos: string[]) => void
  restaurarConfiguracion: () => void
}

const ConfiguracionPortalContext = createContext<ConfiguracionPortalValor | null>(null)

export function ConfiguracionPortalProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfiguracionPortal>(() => {
    const guardada = leerJSON<Partial<ConfiguracionPortal>>(CLAVE_CONFIG)
    if (!guardada) return structuredClone(configuracionInicial)
    return {
      ...structuredClone(configuracionInicial),
      ...guardada,
      programas: (guardada.programas ?? configuracionInicial.programas).map((p) => {
        const base = configuracionInicial.programas.find((orig) => orig.sigla === p.sigla)
        return { ...p, logo: base?.logo ?? p.logo }
      }),
    }
  })

  const guardar = useCallback((nueva: ConfiguracionPortal) => {
    guardarJSON(CLAVE_CONFIG, nueva)
    setConfig(nueva)
  }, [])

  const actualizarReglas = useCallback(
    (datos: {
      horasEscalamiento: number
      avisoHorario: string
      formularioPaecUrl: string
      textoUic: string
    }) => {
      guardar({
        ...config,
        horasEscalamiento: Math.max(1, Math.round(datos.horasEscalamiento || 24)),
        avisoHorario: datos.avisoHorario.trim() || configuracionInicial.avisoHorario,
        formularioPaecUrl: datos.formularioPaecUrl.trim() || configuracionInicial.formularioPaecUrl,
        textoUic: datos.textoUic.trim() || configuracionInicial.textoUic,
      })
    },
    [config, guardar],
  )

  const actualizarPrograma = useCallback(
    (sigla: InfoPrograma['sigla'], datos: Pick<InfoPrograma, 'nombre' | 'descripcion' | 'puntos'>) => {
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
      guardar({
        ...config,
        tiposApoyoEspiritual: [...new Set(tipos.map((t) => t.trim()).filter(Boolean))],
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
      actualizarPrograma,
      actualizarTalleres,
      actualizarPasosInicio,
      actualizarReligiones,
      actualizarTiposApoyoEspiritual,
      restaurarConfiguracion,
    }),
    [
      config,
      actualizarReglas,
      actualizarPrograma,
      actualizarTalleres,
      actualizarPasosInicio,
      actualizarReligiones,
      actualizarTiposApoyoEspiritual,
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
  if (!c) throw new Error('useConfiguracionPortal debe usarse dentro de <ConfiguracionPortalProvider>.')
  return c
}