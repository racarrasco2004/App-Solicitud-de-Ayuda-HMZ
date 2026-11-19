import paec from '@/assets/marca/paec.png'
import pares from '@/assets/marca/pares.png'
import type { Programa } from '@/types'

export interface InfoPrograma {
  sigla: Programa
  nombre: string
  /** Texto corto (cuadro de ayuda y tarjetas) */
  descripcion: string
  /** Puntos clave, tomados de la presentación oficial de Humanización */
  puntos: string[]
  logo: string
}

export const programas: InfoPrograma[] = [
  {
    sigla: 'PAEC',
    nombre: 'Programa de Apoyo Emocional para Colaboradores',
    descripcion: 'Conversas con un psicólogo/a, de forma gratuita y confidencial. Es para quienes trabajan en la red.',
    puntos: [
      'Te acompaña un psicólogo/a',
      'Es gratuito y confidencial',
      'Tienes hasta 8 sesiones',
      'Cada sesión dura 30 minutos',
      'Puedes elegir online o presencial',
      'Derivación asistida si se requiere',
    ],
    logo: paec,
  },
  {
    sigla: 'PARES',
    nombre: 'Programa de Apoyo y Resiliencia para Eventos estresantes y de Seguridad graves',
    descripcion: 'Colegas capacitados en Primeros Auxilios Psicológicos te acompañan tras un evento estresante.',
    puntos: [
      'Te acompañan colegas de distintos estamentos: administrativos/as, TENS, enfermeros/as, médicos y otros profesionales',
      'Están capacitados en Primeros Auxilios Psicológicos',
      'Te escuchan frente a un evento estresante, con cuidado y sin juzgarte',
    ],
    logo: pares,
  },
]

export const talleresGrupales = [
  'Manejo de ansiedad',
  'Autocuidado',
  'Higiene del sueño',
  'Duelo',
  'Gestión emocional',
  'Ejercicios prácticos de relajación',
  'Comunicación',
  'Jardín de flores / Reencontrándonos',
]
