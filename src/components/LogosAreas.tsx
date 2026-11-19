import logoHumanizacion from '@/assets/marca/humanizacion.png'
import logoMision from '@/assets/marca/mision-rse.png'
import { cn } from '@/utils/cn'

/** Los logos de Humanización y de Misión y RSE siempre van juntos. */
export function LogosAreas({ className, alto = 'h-10' }: { className?: string; alto?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 rounded-xl bg-white px-2 py-1', className)}>
      <img src={logoHumanizacion} alt="Humanización UC CHRISTUS" className={cn(alto, 'w-auto')} />
      <span className="h-6 w-px bg-gray-300" aria-hidden />
      <img src={logoMision} alt="Misión y RSE" className={cn('w-auto', alto === 'h-10' ? 'h-7' : 'h-6')} />
    </span>
  )
}
