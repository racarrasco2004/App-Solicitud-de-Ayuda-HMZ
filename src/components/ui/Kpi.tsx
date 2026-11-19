import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

const tonos = {
  purple: 'bg-uc-purple-light text-uc-purple-texto',
  amber: 'bg-uc-amber-light text-uc-amber-texto',
  blue: 'bg-uc-blue-light text-uc-blue-texto',
  green: 'bg-uc-green-light text-uc-green-texto',
  red: 'bg-uc-red-light text-uc-red-texto',
}

export function Kpi({
  icono: Icono,
  etiqueta,
  valor,
  tono = 'purple',
}: {
  icono: LucideIcon
  etiqueta: string
  valor: number
  tono?: keyof typeof tonos
}) {
  return (
    <div className="alza relative flex items-center gap-3 overflow-hidden rounded-2xl border border-linea bg-superficie p-3.5 shadow-sm">
      <span className="gradiente-marca absolute inset-x-0 top-0 h-0.5 opacity-80" aria-hidden />
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-current/15', tonos[tono])}>
        <Icono size={20} aria-hidden />
      </span>
      <div>
        <p className="texto-gradiente text-2xl leading-none font-extrabold tabular-nums">{valor}</p>
        <p className="mt-1 text-xs text-tinta-3">{etiqueta}</p>
      </div>
    </div>
  )
}
