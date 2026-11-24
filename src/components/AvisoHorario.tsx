import { Clock } from 'lucide-react'
import { useConfiguracionPortal } from '@/context/ConfiguracionPortalContext'

export function AvisoHorario({ className = '' }: { className?: string }) {
  const { config } = useConfiguracionPortal()
  return (
    <p className={`flex items-start gap-2 rounded-2xl bg-uc-blue-light px-4 py-2.5 text-sm text-uc-blue-texto ${className}`}>
      <Clock size={18} className="mt-0.5 shrink-0" aria-hidden />
      {config.avisoHorario}
    </p>
  )
}