import type { ReactNode } from 'react'

interface PageHeaderProps {
  titulo: string
  subtitulo?: string
  /** Botones a la derecha del título */
  acciones?: ReactNode
  children?: ReactNode
}

/** Encabezado de página: título grande con una marca de color, sin caja. */
export function PageHeader({ titulo, subtitulo, acciones, children }: PageHeaderProps) {
  return (
    <header className="animar-aparecer mb-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] leading-tight font-extrabold text-tinta">{titulo}</h1>
          <span className="gradiente-marca mt-1.5 block h-1 w-14 rounded-full" aria-hidden />
          {subtitulo && <p className="mt-2 text-sm text-tinta-3">{subtitulo}</p>}
        </div>
        {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
      </div>
      {children && <div className="mt-2 max-w-3xl text-sm text-tinta-2">{children}</div>}
    </header>
  )
}
