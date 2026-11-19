import edificio from '@/assets/edificio-uc-christus.jpg'
import grupal from '@/assets/marca/ilustracion-grupal.png'
import online from '@/assets/marca/ilustracion-online.png'
import type { Anuncio } from '@/types'

/** Fotos de muestra. Se reemplazan subiendo fotos propias desde la pestaña «Anuncios». */
export const fotosDeEjemplo: Record<string, string> = {
  edificio,
  grupal,
  online,
}

export const anunciosIniciales: Anuncio[] = [
  {
    id: 'a1',
    titulo: 'Espacio Libre de Estrés',
    texto: 'Talleres grupales de autocuidado, manejo de ansiedad, higiene del sueño y más. Parte del programa PAEC.',
    imagen: 'ejemplo:grupal',
    activo: true,
  },
  {
    id: 'a2',
    titulo: 'Apoyo emocional con psicólogo/a',
    texto: 'Hasta 8 sesiones de 30 minutos, gratuitas y confidenciales, online o presencial.',
    imagen: 'ejemplo:online',
    activo: true,
  },
  {
    id: 'a3',
    titulo: 'Humanización y Misión y RSE',
    texto: 'Dos áreas que trabajan juntas para cuidar a pacientes, familias y colaboradores de la red.',
    imagen: 'ejemplo:edificio',
    activo: true,
  },
]
