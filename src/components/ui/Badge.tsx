import type { ReactNode } from 'react'
import type { Estado, Programa, TipoSolicitante } from '@/types'
import { cn } from '@/utils/cn'

export type TonoBadge = 'purple' | 'blue' | 'green' | 'red' | 'amber' | 'turquesa' | 'muted'

const tonos: Record<TonoBadge, string> = {
  purple: 'bg-uc-purple-light text-uc-purple-texto border-uc-purple-borde',
  blue: 'bg-uc-blue-light text-uc-blue-texto border-uc-blue-borde',
  green: 'bg-uc-green-light text-uc-green-texto border-uc-green-borde',
  red: 'bg-uc-red-light text-uc-red-texto border-uc-red-borde',
  amber: 'bg-uc-amber-light text-uc-amber-texto border-uc-amber-borde',
  turquesa: 'bg-turquesa-suave text-turquesa-texto border-turquesa-borde',
  muted: 'bg-superficie-3 text-tinta-3 border-linea',
}

/** Pastilla de 10,5 px en negrita: fondo suave, texto y borde del mismo color. */
export function Badge({
  tono = 'muted',
  children,
  className,
}: {
  tono?: TonoBadge
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 whitespace-nowrap',
        'text-[0.65625rem] leading-tight font-bold shadow-[0_1px_2px_rgb(var(--sombra)/0.15)]',
        tonos[tono],
        className,
      )}
    >
      {children}
    </span>
  )
}

const tonoEstado: Record<Estado, TonoBadge> = {
  Pendiente: 'amber',
  'En proceso': 'blue',
  Cerrada: 'green',
}

const tonoPrograma: Record<Programa, TonoBadge> = { PAEC: 'purple', PARES: 'turquesa' }

const tonoTipo: Record<TipoSolicitante, TonoBadge> = {
  Paciente: 'blue',
  Familiar: 'green',
  Colaborador: 'purple',
  Equipo: 'muted',
}

export function EstadoBadge({ estado }: { estado: Estado }) {
  return <Badge tono={tonoEstado[estado]}>{estado}</Badge>
}

export function ProgramaBadge({ programa }: { programa: Programa | null }) {
  if (!programa) return <span className="text-tinta-3">—</span>
  return <Badge tono={tonoPrograma[programa]}>{programa}</Badge>
}

export function TipoBadge({ tipo }: { tipo: TipoSolicitante }) {
  return <Badge tono={tonoTipo[tipo]}>{tipo}</Badge>
}
