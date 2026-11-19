import { LoaderCircle, type LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type VarianteBoton =
  | 'purple'
  | 'blue'
  | 'green'
  | 'red'
  | 'amber'
  | 'aviso'
  | 'outline'
  | 'ghost'
  | 'link'

type TamanoBoton = 'sm' | 'md' | 'lg'

const variantes: Record<VarianteBoton, string> = {
  // Acción principal (Continuar, Guardar, Enviar)
  purple: 'gradiente-marca text-white shadow-[0_8px_22px_-8px_rgb(var(--uc-purple)/0.65)] hover:brightness-110',
  // Registrar, consultar, nuevo
  blue: 'bg-uc-blue text-white shadow-[0_8px_22px_-8px_rgb(var(--uc-blue)/0.65)] hover:brightness-110',
  // Confirmar lo bueno (Aprobar, Activar)
  green: 'bg-uc-green text-white hover:brightness-90',
  // Lo que no se deshace (Eliminar, Cancelar solicitud)
  red: 'bg-uc-red text-white hover:brightness-90',
  // Lo que espera una decisión
  amber: 'bg-uc-amber-fuerte text-white hover:brightness-90',
  // Avisos que piden atención
  aviso: 'bg-aviso text-white hover:brightness-90',
  // Secundario, con borde (Descargar, Cancelar en una ventana)
  outline: 'border border-linea-fuerte bg-superficie text-tinta hover:bg-superficie-2',
  // Discreto, sin fondo
  ghost: 'text-tinta-2 hover:bg-superficie-3',
  // Como enlace
  link: 'text-uc-purple-texto hover:underline',
}

const tamanos: Record<TamanoBoton, string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-9 gap-2 px-4 text-sm',
  lg: 'h-10 gap-2 px-5 text-sm',
}

const tamanoIcono: Record<TamanoBoton, number> = { sm: 14, md: 18, lg: 18 }

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton
  tamano?: TamanoBoton
  icono?: LucideIcon
  /** "En relieve": parece una tecla. Se usa en las acciones de una pantalla y en las ventanas. */
  relieve?: boolean
  cargando?: boolean
  anchoCompleto?: boolean
  children?: ReactNode
}

export function Button({
  variante = 'purple',
  tamano = 'md',
  icono: Icono,
  relieve = false,
  cargando = false,
  anchoCompleto = false,
  className,
  children,
  disabled,
  type = 'button',
  ...resto
}: ButtonProps) {
  const sinFondo = variante === 'ghost' || variante === 'link'
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold whitespace-nowrap',
        'cursor-pointer transition duration-150 select-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100',
        variantes[variante],
        tamanos[tamano],
        relieve && !sinFondo && 'relieve',
        anchoCompleto && 'w-full',
        className,
      )}
      {...resto}
    >
      {cargando ? (
        <LoaderCircle size={tamanoIcono[tamano]} className="animate-spin" aria-hidden />
      ) : (
        Icono && <Icono size={tamanoIcono[tamano]} aria-hidden />
      )}
      {children}
    </button>
  )
}
