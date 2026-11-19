import type { Solicitud } from '@/types'

/**
 * Horas que puede estar una solicitud pendiente antes de escalarse (definido por la jefatura: 24 h).
 * Se escala a la jefatura de Humanización y Misión y RSE. Para cambiarlo, edita solo este número.
 */
export const HORAS_ESCALAMIENTO = 24

export function horasDesde(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000
}

/** Pendiente y sin responsable por más horas de las permitidas. */
export function estaSinAtender(s: Solicitud): boolean {
  return s.estado === 'Pendiente' && horasDesde(s.fecha) > HORAS_ESCALAMIENTO
}
