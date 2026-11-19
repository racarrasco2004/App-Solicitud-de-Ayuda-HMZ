import { ChevronDown, TriangleAlert } from 'lucide-react'
import {
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/utils/cn'

/** Estilo común de los campos: borde suave, foco azul, error en rojo. */
const base =
  'w-full rounded-md border bg-superficie px-3 text-sm text-tinta shadow-sm transition-colors ' +
  'placeholder:text-apagado focus:border-uc-blue focus:ring-2 focus:ring-uc-blue/30 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const bordeNormal = 'border-linea-fuerte/60'
const bordeError = 'border-uc-red'

interface ComunesCampo {
  etiqueta: string
  obligatorio?: boolean
  /** Mensaje de error, con palabras de la persona. Si viene vacío no se muestra. */
  error?: string
  ayuda?: string
}

function Etiqueta({
  htmlFor,
  texto,
  obligatorio,
}: {
  htmlFor: string
  texto: string
  obligatorio?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-bold tracking-wide text-uc-purple-texto uppercase"
    >
      {texto}
      {obligatorio && <span aria-hidden> *</span>}
    </label>
  )
}

function Mensajes({ id, error, ayuda }: { id: string; error?: string; ayuda?: string }) {
  if (error) {
    return (
      <p id={id} role="alert" className="mt-1 flex items-start gap-1 text-[0.75rem] text-uc-red-texto">
        <TriangleAlert size={13} className="mt-0.5 shrink-0" aria-hidden />
        {error}
      </p>
    )
  }
  if (ayuda) {
    return (
      <p id={id} className="mt-1 text-[0.75rem] text-tinta-3">
        {ayuda}
      </p>
    )
  }
  return null
}

/* ------------------------------ Texto ------------------------------ */

interface CampoTextoProps
  extends ComunesCampo, Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {}

export function CampoTexto({
  etiqueta,
  obligatorio,
  error,
  ayuda,
  className,
  ...resto
}: CampoTextoProps) {
  const id = useId()
  const idMensaje = `${id}-mensaje`
  return (
    <div className={className}>
      <Etiqueta htmlFor={id} texto={etiqueta} obligatorio={obligatorio} />
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error || ayuda ? idMensaje : undefined}
        aria-required={obligatorio}
        className={cn(base, 'h-10', error ? bordeError : bordeNormal)}
        {...resto}
      />
      <Mensajes id={idMensaje} error={error} ayuda={ayuda} />
    </div>
  )
}

/* ------------------------------ Lista ------------------------------ */

interface CampoListaProps
  extends ComunesCampo, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> {
  opciones: string[]
  /** Texto de la opción vacía, por ejemplo "Selecciona un centro" */
  textoVacio: string
}

export function CampoLista({
  etiqueta,
  obligatorio,
  error,
  ayuda,
  opciones,
  textoVacio,
  className,
  ...resto
}: CampoListaProps) {
  const id = useId()
  const idMensaje = `${id}-mensaje`
  return (
    <div className={className}>
      <Etiqueta htmlFor={id} texto={etiqueta} obligatorio={obligatorio} />
      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error || ayuda ? idMensaje : undefined}
          aria-required={obligatorio}
          className={cn(base, 'h-10 cursor-pointer appearance-none pr-9', error ? bordeError : bordeNormal)}
          {...resto}
        >
          <option value="">{textoVacio}</option>
          {opciones.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-tinta-3"
        />
      </div>
      <Mensajes id={idMensaje} error={error} ayuda={ayuda} />
    </div>
  )
}

/* ---------------------------- Texto largo ---------------------------- */

interface CampoTextoLargoProps
  extends ComunesCampo, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {}

export function CampoTextoLargo({
  etiqueta,
  obligatorio,
  error,
  ayuda,
  className,
  maxLength,
  value,
  ...resto
}: CampoTextoLargoProps) {
  const id = useId()
  const idMensaje = `${id}-mensaje`
  const largo = typeof value === 'string' ? value.length : 0
  return (
    <div className={className}>
      <Etiqueta htmlFor={id} texto={etiqueta} obligatorio={obligatorio} />
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error || ayuda ? idMensaje : undefined}
        className={cn(base, 'min-h-28 resize-y py-2.5', error ? bordeError : bordeNormal)}
        {...resto}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Mensajes id={idMensaje} error={error} ayuda={ayuda} />
        </div>
        {maxLength && (
          <p className="mt-1 shrink-0 text-[0.75rem] text-apagado">
            {largo}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
