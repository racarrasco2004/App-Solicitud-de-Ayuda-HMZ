import { X, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

type TonoModal = 'purple' | 'blue' | 'red' | 'green' | 'amber'

const encabezados: Record<TonoModal, string> = {
  purple: 'gradiente-marca',
  blue: 'bg-uc-blue',
  red: 'bg-uc-red',
  green: 'bg-uc-green',
  amber: 'bg-uc-amber-fuerte',
}

interface ModalProps {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  subtitulo?: string
  icono?: LucideIcon
  /** Color del encabezado: el de la acción (morado, azul, rojo, verde o ámbar) */
  tono?: TonoModal
  children: ReactNode
  /** Botones del pie, alineados a la derecha */
  pie?: ReactNode
  /** Si es true, solo se cierra con la X o con los botones: ni al pinchar afuera ni con Esc */
  soloCerrarConX?: boolean
}

/**
 * Ventana modal basada en <dialog>: el navegador se encarga del foco, de Esc
 * y de bloquear lo que hay detrás. Ancho máximo 600 px.
 */
export function Modal({
  abierto,
  onCerrar,
  titulo,
  subtitulo,
  icono: Icono,
  tono = 'purple',
  children,
  pie,
  soloCerrarConX = false,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onCancel={(e) => soloCerrarConX && e.preventDefault()}
      onClick={(e) => {
        // Un clic en el fondo oscuro cierra la ventana (salvo que se pida lo contrario)
        if (!soloCerrarConX && e.target === e.currentTarget) onCerrar()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-[600px] overflow-hidden rounded-2xl bg-superficie p-0 text-tinta shadow-2xl"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className={cn('flex items-start gap-3 px-5 py-3.5 text-white', encabezados[tono])}>
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 text-base font-bold">
              {Icono && <Icono size={18} aria-hidden />}
              {titulo}
            </h2>
            {subtitulo && <p className="mt-0.5 text-xs opacity-85">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar ventana"
            className="cursor-pointer rounded-md p-1 hover:bg-white/15"
          >
            <X size={20} aria-hidden />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-4">{children}</div>

        {pie && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-linea px-5 py-3">
            {pie}
          </footer>
        )}
      </div>
    </dialog>
  )
}
