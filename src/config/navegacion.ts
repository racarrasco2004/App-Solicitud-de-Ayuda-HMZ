import {
  ChartColumn,
  CirclePlus,
  ClipboardList,
  HeartHandshake,
  House,
  Megaphone,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import type { Rol } from '@/types'

export interface ItemMenu {
  ruta: string
  etiqueta: string
  descripcion: string
  icono: LucideIcon
  /** Roles que ven esta opción */
  roles: Rol[]
  /** Si aparece como tarjeta de atajo en la página de inicio */
  atajo: boolean
}

/**
 * Única fuente de verdad del menú y de las rutas permitidas por rol.
 * Para agregar una sección: súmala aquí y crea su ruta en App.tsx.
 */
export const menu: ItemMenu[] = [
  {
    ruta: '/',
    etiqueta: 'Inicio',
    descripcion: 'Resumen y accesos rápidos.',
    icono: House,
    roles: ['solicitante', 'coordinador', 'administrador'],
    atajo: false,
  },
  {
    ruta: '/programas',
    etiqueta: 'Programas',
    descripcion: 'Conoce los programas de apoyo para colaboradores y el acompañamiento espiritual.',
    icono: HeartHandshake,
    roles: ['solicitante', 'coordinador', 'administrador'],
    atajo: false,
  },
  {
    ruta: '/nueva-solicitud',
    etiqueta: 'Nueva solicitud',
    descripcion: 'Pide apoyo emocional o espiritual para un paciente, un familiar, para ti o para tu equipo.',
    icono: CirclePlus,
    roles: ['solicitante', 'coordinador', 'administrador'],
    atajo: true,
  },
  {
    ruta: '/mis-solicitudes',
    etiqueta: 'Mis solicitudes',
    descripcion: 'Revisa el estado y el historial de lo que has pedido.',
    icono: ClipboardList,
    roles: ['solicitante'],
    atajo: true,
  },
  {
    ruta: '/solicitudes',
    etiqueta: 'Solicitudes',
    descripcion: 'Revisa las solicitudes, cambia su estado y asigna responsables.',
    icono: ClipboardList,
    roles: ['coordinador', 'administrador'],
    atajo: true,
  },
  {
    ruta: '/estadisticas',
    etiqueta: 'Estadísticas',
    descripcion: 'Indicadores por centro, servicio, estado, tipo y mes.',
    icono: ChartColumn,
    roles: ['coordinador', 'administrador'],
    atajo: true,
  },
  {
    ruta: '/anuncios',
    etiqueta: 'Anuncios',
    descripcion: 'Crea y edita las tarjetas con fotos que ve el solicitante.',
    icono: Megaphone,
    roles: ['coordinador', 'administrador'],
    atajo: true,
  },
  {
    ruta: '/administracion',
    etiqueta: 'Administración',
    descripcion: 'Centros, servicios, programas y usuarios.',
    icono: Settings,
    roles: ['administrador'],
    atajo: true,
  },
]

export const nombreDeRol: Record<Rol, string> = {
  solicitante: 'Solicitante',
  coordinador: 'Coordinador',
  administrador: 'Administrador',
}

export const descripcionDeRol: Record<Rol, string> = {
  solicitante: 'Aquí puedes pedir apoyo emocional o espiritual para un paciente, un familiar, para ti o para tu equipo, y seguir el estado de tus solicitudes.',
  coordinador:
    'Revisas las solicitudes que llegan, cambias su estado y asignas a la persona responsable.',
  administrador:
    'Administras centros, servicios, programas y usuarios, y ves los indicadores globales.',
}
