/** Une clases CSS ignorando los valores vacíos: cn('a', false && 'b', 'c') → 'a c' */
export function cn(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(' ')
}
