import { Check, Monitor, Moon, RotateCcw, SlidersHorizontal, Sun } from 'lucide-react'
import { useAjustes, type Tema } from '@/context/AjustesContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'

const tamanos = [
  { valor: 87.5, etiqueta: 'Pequeño' },
  { valor: 100, etiqueta: 'Normal' },
  { valor: 112.5, etiqueta: 'Mediano' },
  { valor: 125, etiqueta: 'Grande' },
  { valor: 150, etiqueta: 'Muy grande' },
]

const temas: { valor: Tema; etiqueta: string; icono: typeof Sun }[] = [
  { valor: 'claro', etiqueta: 'Claro', icono: Sun },
  { valor: 'oscuro', etiqueta: 'Oscuro', icono: Moon },
  { valor: 'sistema', etiqueta: 'Según el equipo', icono: Monitor },
]

function Opcion({
  activa,
  onClick,
  children,
  className,
}: {
  activa: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={cn(
        'relieve inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold',
        activa
          ? 'border-uc-purple bg-uc-purple text-white'
          : 'border-linea-fuerte/50 bg-superficie text-tinta hover:bg-superficie-2',
        className,
      )}
    >
      {children}
      {activa && <Check size={14} aria-hidden />}
    </button>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-4 last:mb-0">
      <h3 className="mb-2 text-sm font-bold text-tinta">{titulo}</h3>
      {children}
    </section>
  )
}

export function AjustesLecturaModal({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const { ajustes, cambiar, restablecer } = useAjustes()
  const actual = tamanos.find((t) => t.valor === ajustes.tamano)

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Ajustes de lectura"
      subtitulo="Elige cómo te resulta más cómodo leer la pantalla."
      icono={SlidersHorizontal}
      pie={
        <>
          <Button variante="outline" relieve icono={RotateCcw} onClick={restablecer}>
            Restablecer ajustes
          </Button>
          <Button relieve icono={Check} onClick={onCerrar}>
            Listo
          </Button>
        </>
      }
    >
      <Grupo titulo="Tamaño de letra">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {tamanos.map((t) => (
            <Opcion
              key={t.valor}
              activa={ajustes.tamano === t.valor}
              onClick={() => cambiar({ tamano: t.valor })}
            >
              {t.etiqueta}
            </Opcion>
          ))}
        </div>
        <p className="mt-2 text-xs text-tinta-3">
          {actual && actual.valor !== 100
            ? `Letra un ${actual.valor - 100} % más ${actual.valor > 100 ? 'grande' : 'chica'}.`
            : 'Tamaño de letra estándar.'}
        </p>
      </Grupo>

      <Grupo titulo="Apariencia">
        <div className="flex flex-wrap gap-2">
          {temas.map(({ valor, etiqueta, icono: Icono }) => (
            <Opcion key={valor} activa={ajustes.tema === valor} onClick={() => cambiar({ tema: valor })}>
              <Icono size={16} aria-hidden />
              {etiqueta}
            </Opcion>
          ))}
        </div>
      </Grupo>

      <Grupo titulo="Movimientos">
        <div className="flex flex-wrap gap-2">
          <Opcion
            activa={ajustes.movimiento === 'sistema'}
            onClick={() => cambiar({ movimiento: 'sistema' })}
          >
            <Monitor size={16} aria-hidden />
            Según el equipo
          </Opcion>
          <Opcion
            activa={ajustes.movimiento === 'reducido'}
            onClick={() => cambiar({ movimiento: 'reducido' })}
          >
            Reducir movimientos
          </Opcion>
        </div>
      </Grupo>
    </Modal>
  )
}
