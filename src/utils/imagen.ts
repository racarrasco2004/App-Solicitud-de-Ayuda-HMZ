/** Reduce una foto para que ocupe poco espacio en el navegador (máx. 1200 px, JPEG). */
export function reducirImagen(archivo: File, maxAncho = 1200, calidad = 0.82): Promise<string> {
  return new Promise((resolver, rechazar) => {
    if (!archivo.type.startsWith('image/')) return rechazar(new Error('Elige un archivo de imagen (JPG o PNG).'))
    const url = URL.createObjectURL(archivo)
    const img = new Image()
    img.onload = () => {
      const escala = Math.min(1, maxAncho / img.width)
      const lienzo = document.createElement('canvas')
      lienzo.width = Math.round(img.width * escala)
      lienzo.height = Math.round(img.height * escala)
      const ctx = lienzo.getContext('2d')
      if (!ctx) return rechazar(new Error('No pudimos leer la imagen.'))
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, lienzo.width, lienzo.height)
      ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height)
      URL.revokeObjectURL(url)
      resolver(lienzo.toDataURL('image/jpeg', calidad))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      rechazar(new Error('No pudimos abrir esa imagen. Prueba con otra.'))
    }
    img.src = url
  })
}
