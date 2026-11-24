/** Devuelve el mensaje de error, o '' si el valor es válido. */

export function validarNombre(valor: string): string {
  const limpio = valor.trim()
  if (limpio.length === 0) return 'Escribe un nombre de contacto.'
  if (limpio.length < 3) return 'El nombre es muy corto.'
  return ''
}

export function validarTelefono(valor: string): string {
  const limpio = valor.trim()
  if (limpio.length === 0) return 'Escribe un teléfono para que podamos contactarte.'
  if (!/^[+\d\s()-]+$/.test(limpio)) return 'Usa solo números (puedes incluir +, espacios o guiones).'
  const digitos = limpio.replace(/\D/g, '')
  if (digitos.length < 8 || digitos.length > 12) return 'El teléfono debe tener entre 8 y 12 dígitos.'
  return ''
}

/** Si la persona escribe solo el usuario sin @, completa @ucchristus.cl automáticamente. */
export function normalizarCorreoInstitucional(valor: string): string {
  const limpio = valor.trim().toLowerCase()
  if (!limpio) return ''
  if (!limpio.includes('@')) return `${limpio}@ucchristus.cl`
  return limpio
}

export function validarCorreoInstitucional(valor: string): string {
  const correo = normalizarCorreoInstitucional(valor)
  if (!correo) return 'Escribe el correo institucional.'
  if (!/^[a-z0-9._-]+@(ucchristus\.cl|uc\.cl)$/.test(correo)) {
    return 'Usa un correo institucional válido (@ucchristus.cl o @uc.cl).'
  }
  return ''
}