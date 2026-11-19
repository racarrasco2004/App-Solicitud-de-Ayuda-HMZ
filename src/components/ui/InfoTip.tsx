import { CircleHelp } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

interface InfoTipProps {
  /** Título de la ventana, por ejemplo el nombre del programa */
  titulo: string
  children: ReactNode
}

/** Botón (?) que abre una ventana pequeña con una explicación. */
export function InfoTip({ titulo, children }: InfoTipProps) {
  const [abierto, setAbierto] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setAbierto(true)
        }}
        aria-label={`¿Qué es? ${titulo}`}
        className="inline-flex cursor-pointer rounded-full p-1 text-uc-blue-texto hover:bg-uc-blue-light"
      >
        <CircleHelp size={18} aria-hidden />
      </button>
      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo={titulo}
        icono={CircleHelp}
        tono="blue"
        pie={
          <Button relieve onClick={() => setAbierto(false)}>
            Entendido
          </Button>
        }
      >
        <div className="text-sm leading-relaxed text-tinta-2">{children}</div>
      </Modal>
    </>
  )
}
