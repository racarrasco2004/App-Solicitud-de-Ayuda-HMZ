import { cn } from '@/utils/cn'
import { iniciales } from '@/utils/formato'

interface AvatarProps {
  nombre: string
  /** "morado" para fondos claros; "blanco" sobre la barra superior */
  variante?: 'morado' | 'blanco'
  className?: string
}

/** Círculo con las iniciales de la persona. */
export function Avatar({ nombre, variante = 'morado', className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full text-xs font-bold',
        variante === 'morado' ? 'bg-uc-purple text-white' : 'bg-white text-uc-purple',
        className ?? 'size-9',
      )}
    >
      {iniciales(nombre)}
    </span>
  )
}
