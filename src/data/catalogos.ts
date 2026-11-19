import type { Centro } from '@/types'

/**
 * Catálogos del portal (por ahora fijos; el módulo de Administración los editará).
 * Los servicios del Hospital Clínico son los reales. El resto son de ejemplo
 * y deben reemplazarse por los oficiales.
 */

export const catalogoCentros: Centro[] = [
  {
    nombre: 'Hospitales y clínicas',
    serviciosComunes: [],
    subcentros: [
      {
        nombre: 'Hospital Clínico UC CHRISTUS',
        servicios: [
          'INTERMEDIO PEDIATRICO',
          'PEDIATRIA',
          'ONCO PEDIATRIA',
          'UNIDAD CUIDADOS DE PEDIATRIA',
          'ALMACEN QX 3° PISO',
          'CENTRAL DE FARMACIA',
          'CENTRAL DE INSUMOS CLINICOS',
          'CENTRAL DE DIST DE INSUMOS',
          'CENTRAL DE ESTERILIZACION',
          'PABELLONES Y PROCEDIMIENTOS',
          'SERVICIO RECUPERACION 3° PISO',
          'UCI',
          'Intermedio 4P Cuc',
          'Intermedio Oncológico Piso 7',
          'UNIDAD DE PROC NEFROLOGICOS',
          'INTERMEDIO CORONARIO',
          'SERVICIO RECUPERACION 6° PISO',
          'UNIDAD CORONARIA',
          'SERVICIO DE URGENCIA',
          'LAB BANCO DE SANGRE',
          'GESTION DE CAMAS',
          'SERVICIOS GENERALES',
          'MEDICO QUIRURGICO 4A',
          'MEDICO QUIRURGICO 4B',
          'MEDICO QUIRURGICO 4C',
          'MEDICO QUIRURGICO 4DE',
          'MEDICO QUIRURGICO 5A',
          'MEDICO QUIRURGICO 5C',
          'Médico Quirúrgico 6G',
          'Oncología Adulto',
          'SERVICIO CIRUGIA 2° PISO',
          'PABELLON MATERNIDAD 1° PISO',
          'SERVICIO DE MATERNIDAD',
          'UNIDAD NEONATOLOGIA',
          'Seguridad Hospital',
        ],
      },
      { nombre: 'Clínica UC CHRISTUS', servicios: [] },
      { nombre: 'Clínica San Carlos de Apoquindo', servicios: ['Hospitalizados', 'Urgencia'] },
    ],
  },
  {
    nombre: 'Centros médicos',
    serviciosComunes: ['Consulta', 'Toma de muestras'],
    subcentros: [
      'Centro Médico Marcoleta',
      'Centro Médico Lira',
      'Centro Médico Santa Lucía',
      'Centro Médico San Joaquín',
      'Centro Médico Américo Vespucio',
      'Centro Médico Alcántara',
      'Centro Médico Bilbao',
      'Centro Médico Irarrázaval',
      'Centro Médico Vitacura',
    ].map((nombre) => ({ nombre, servicios: [] })),
  },
  {
    nombre: 'Centros de especialidad',
    serviciosComunes: ['Consulta'],
    subcentros: ['Centro de Cáncer UC CHRISTUS', 'Centro de Salud Mental Providencia'].map(
      (nombre) => ({ nombre, servicios: [] }),
    ),
  },
  {
    nombre: 'Red Áncora',
    serviciosComunes: ['Consulta general', 'Pediatría'],
    subcentros: [
      'CESFAM Juan Pablo II',
      'CESFAM Madre Teresa de Calcuta',
      'CESFAM San Alberto Hurtado',
      'Centro Áncora San Francisco',
    ].map((nombre) => ({ nombre, servicios: [] })),
  },
]

/** Opción que siempre se ofrece al final de la lista de servicios */
export const OTRO_SERVICIO = 'Otro servicio / no lo sé'

export const religiones = [
  'Católica',
  'Evangélica',
  'Judía',
  'Musulmana',
  'Sin religión',
  'Otra',
  'Prefiero no decirlo',
]

/** Catálogo oficial de responsables del equipo de Humanización */
export const responsables = [
  'Francisco Castro Jorquera',
  'Alexander Valenzuela Flores',
  'Felipe Muñoz Alvarez',
  'Maria Paz Moreno Cortez',
  'Catalina Mayorga Gajardo',
]

const ordenar = (a: string, b: string) => a.localeCompare(b, 'es', { sensitivity: 'base' })

export function nombresDeCentros(): string[] {
  return catalogoCentros.map((c) => c.nombre)
}

export function subcentrosDe(centro: string): string[] {
  const encontrado = catalogoCentros.find((c) => c.nombre === centro)
  return encontrado ? encontrado.subcentros.map((s) => s.nombre) : []
}

/** Servicios del subcentro + los comunes del tipo de centro, ordenados y sin repetir. */
export function serviciosDe(centro: string, subcentro: string): string[] {
  const tipo = catalogoCentros.find((c) => c.nombre === centro)
  if (!tipo) return []
  const propios = tipo.subcentros.find((s) => s.nombre === subcentro)?.servicios ?? []
  return [...new Set([...tipo.serviciosComunes, ...propios])].sort(ordenar)
}
