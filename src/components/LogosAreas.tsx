import logoHumanizacion from '@/assets/marca/humanizacion.png'
import logoMision from '@/assets/marca/mision-rse.png'
import logoUc from '@/assets/marca/uc-christus.png'
import { cn } from '@/utils/cn'

/** Los logos de Humanización, Misión y RSE y UC CHRISTUS siempre van juntos. */
export function LogosAreas({ className, alto = 'h-10' }: { className?: string; alto?: string }) {
  const esGrande = alto === 'h-14'

  const altoHumanizacion = esGrande ? 'h-11 sm:h-14' : alto === 'h-10' ? 'h-8 sm:h-10' : 'h-7 sm:h-9'
  const altoMision = esGrande ? 'h-8 sm:h-10' : alto === 'h-10' ? 'h-6 sm:h-7' : 'h-5 sm:h-6'
  const altoUc = esGrande ? 'h-6 sm:h-7' : 'h-4 sm:h-5'
  const altoSeparador = esGrande ? 'h-8' : 'h-5 sm:h-6'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-xl bg-white px-2.5 py-1 sm:gap-2.5',
        className,
      )}
    >
      <img
        src={logoHumanizacion}
        alt="Humanización UC CHRISTUS"
        className={cn(altoHumanizacion, 'w-auto object-contain')}
      />
      <span className={cn(altoSeparador, 'w-px bg-gray-300')} aria-hidden />
      <img
        src={logoMision}
        alt="Misión y RSE"
        className={cn(altoMision, 'w-auto object-contain')}
      />
      <span className={cn(altoSeparador, 'w-px bg-gray-300')} aria-hidden />
      <img
        src={logoUc}
        alt="UC CHRISTUS"
        className={cn(altoUc, 'w-auto object-contain')}
      />
    </span>
  )
}