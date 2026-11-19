import { Clock } from 'lucide-react'
import { AVISO_HORARIO } from '@/config/marca'

export function AvisoHorario({ className = '' }: { className?: string }) {
  return (
    <p className={`flex items-start gap-2 rounded-2xl bg-uc-blue-light px-4 py-2.5 text-sm text-uc-blue-texto ${className}`}>
      <Clock size={18} className="mt-0.5 shrink-0" aria-hidden />
      {AVISO_HORARIO}
    </p>
  )
}
