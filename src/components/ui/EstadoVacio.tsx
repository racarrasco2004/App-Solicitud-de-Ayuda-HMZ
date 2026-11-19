import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EstadoVacioProps {
  icono: LucideIcon
  titulo: string
  texto?: string
  accion?: ReactNode
}

/** Se muestra cuando no hay nada que listar todavía. */
export function EstadoVacio({ icono: Icono, titulo, texto, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-3 grid size-14 place-items-center rounded-full bg-uc-purple-light text-uc-purple-texto">
        <Icono size={26} aria-hidden />
      </span>
      <h2 className="text-base font-bold text-tinta">{titulo}</h2>
      {texto && <p className="mt-1 max-w-sm text-sm text-tinta-3">{texto}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
