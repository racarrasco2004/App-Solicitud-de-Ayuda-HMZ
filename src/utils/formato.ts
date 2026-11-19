const formatoFecha = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const formatoFechaHora = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** 2026-11-16T10:00:00 → 16-11-2026 */
export function fechaCorta(iso: string): string {
  return formatoFecha.format(new Date(iso)).replaceAll('/', '-')
}

export function fechaYHora(iso: string): string {
  return formatoFechaHora.format(new Date(iso)).replaceAll('/', '-')
}

/** "ana maria" → "Ana Maria" */
export function capitalizar(texto: string): string {
  return texto
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ')
}

/** "María Fuentes Pérez" → "MF" */
export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  const primera = partes[0].charAt(0)
  const segunda = partes.length > 1 ? partes[1].charAt(0) : ''
  return (primera + segunda).toUpperCase()
}

export function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] ?? ''
}
