/**
 * Lectura y escritura segura en el navegador.
 * localStorage puede fallar (modo privado, almacenamiento bloqueado...), por eso todo va en try/catch.
 */

export function leerJSON<T>(clave: string, almacen: 'local' | 'sesion' = 'local'): T | null {
  try {
    const bruto = (almacen === 'local' ? localStorage : sessionStorage).getItem(clave)
    return bruto ? (JSON.parse(bruto) as T) : null
  } catch {
    return null
  }
}

export function guardarJSON(clave: string, valor: unknown, almacen: 'local' | 'sesion' = 'local') {
  try {
    ;(almacen === 'local' ? localStorage : sessionStorage).setItem(clave, JSON.stringify(valor))
  } catch {
    /* sin almacenamiento: la aplicación sigue funcionando, solo no recuerda */
  }
}

export function borrarClave(clave: string, almacen: 'local' | 'sesion' = 'local') {
  try {
    ;(almacen === 'local' ? localStorage : sessionStorage).removeItem(clave)
  } catch {
    /* nada que hacer */
  }
}
