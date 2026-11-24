import type { Centro, Responsable } from '@/types'

/**
 * Catálogos oficiales del portal (servicios del motor + unidades históricas del Hospital Clínico).
 */
export const catalogoCentros: Centro[] = [
  {
    nombre: 'Hospitales y clínicas',
    serviciosComunes: [],
    subcentros: [
      {
        nombre: 'Hospital Clínico UC CHRISTUS',
        servicios: [
          'Almacén QX 3° Piso',
          'Atención Inmediata',
          'Central de Distribución de Insumos',
          'Central de Esterilización',
          'Central de Farmacia',
          'Central de Insumos Clínicos',
          'Gestión de Camas',
          'Intensivo Cardiovascular (Recuperación 6P)',
          'Intermedio Coronario (INCOR)',
          'Intermedio CUC',
          'Intermedio Neonatal',
          'Intermedio Oncológico',
          'Intermedio Pediátrico',
          'Lab. Banco de Sangre',
          'Maternidad 2A',
          'MQ 2B',
          'MQ 2G',
          'MQ 4A',
          'MQ 4B',
          'MQ 4C',
          'MQ 4DE',
          'MQ 4G',
          'MQ 5A',
          'MQ 5C',
          'MQ 5G',
          'MQ 6G',
          'MQ Mujer 2DE',
          'Oncología 10G',
          'Oncología 7G',
          'Oncología 8G',
          'Oncología 9G',
          'Oncología Adulto',
          'Oncología Pediátrica',
          'Pabellón',
          'Pabellón Maternidad',
          'Pabellones y Procedimientos',
          'Seguridad Hospital',
          'Servicio Cirugía 2° Piso',
          'Servicio de Pediatría',
          'Servicio Recuperación 3° Piso',
          'Servicios Generales',
          'UCI',
          'UCI Neonatal',
          'Unidad Coronaria (UCO)',
          'Unidad de Procedimientos Nefrológicos',
          'UPC',
          'UPC Pediátrica',
          'Urgencia Adulto',
          'Urgencia Pediátrica',
          'UTIM 1',
          'UTIM 2',
        ],
      },
      {
        nombre: 'Clínica San Carlos de Apoquindo',
        servicios: [
          'Consultas',
          'Hospitalizados',
          'Intermedio',
          'Maternidad',
          'Médico Quirúrgico',
          'PAB Maternidad',
          'Pabellón',
          'Pediatría',
          'Procedimientos',
          'Quimioterapia',
          'Radioterapia',
          'Recuperación',
          'Salud Mental',
          'UCI Adultos',
          'UCI NEO',
          'UCI PED',
          'Urgencia',
          'UTM',
          'Vacunatorio Campaña',
          'Vacunatorio PNI',
        ],
      },
      { nombre: 'Clínica UC CHRISTUS', servicios: [] },
    ],
  },
  {
    nombre: 'Centros médicos',
    serviciosComunes: ['Consulta', 'Toma de muestras'],
    subcentros: [
      {
        nombre: 'Centro Médico Alcántara',
        servicios: ['Consultas y Procedimientos TMT y Reumatología'],
      },
      { nombre: 'Centro Médico Américo Vespucio', servicios: [] },
      { nombre: 'Centro Médico Bilbao', servicios: [] },
      {
        nombre: 'Centro Médico Escuela Militar',
        servicios: ['Procedimientos'],
      },
      { nombre: 'Centro Médico Irarrázaval', servicios: [] },
      {
        nombre: 'Centro Médico Lira',
        servicios: [
          'Consultas Ginecología y Pediátricas (2do)',
          'Consultas Pediátricas (4to)',
        ],
      },
      { nombre: 'Centro Médico Marcoleta', servicios: [] },
      {
        nombre: 'Centro Médico San Joaquín',
        servicios: [
          'Cardiología',
          'Consultas (urología, ginecología, cardiología)',
          'Consultas Pediátricas',
          'Dermatología',
          'Emergencia',
          'Endoscopía',
          'Oftalmología',
          'Otorrino',
          'Procedimientos (curaciones y cirugía menor)',
          'Quimioterapia',
          'Vacunatorio',
        ],
      },
      {
        nombre: 'Centro Médico San Jorge',
        servicios: ['Consultas y Procedimientos'],
      },
      {
        nombre: 'Centro Médico Santa Lucía',
        servicios: [
          'Consultas (5to)',
          'Consultas y Procedimientos (3ro mar)',
          'Dermatología (4to mar)',
          'Ginecología (4to cordillera)',
          'Otorrino y Oftalmología (3ro cordillera)',
          'Pabellón',
          'Procedimientos TMT y Cirugía menor (1ero)',
          'Recuperación',
        ],
      },
      {
        nombre: 'Centro Médico Vitacura',
        servicios: ['Consultas y Procedimientos'],
      },
    ],
  },
  {
    nombre: 'Centros de especialidad',
    serviciosComunes: ['Consulta'],
    subcentros: [
      {
        nombre: 'Centro de Especialidades Médicas',
        servicios: [
          'Cardiología Adulto',
          'Cardiología Pediátrica',
          'Desinfección de Alto Nivel',
          'Lab. Proc. Gastroenterológicos',
          'Lab. Respiratorio (Adulto)',
          'Lab. Respiratorio (Adulto Broncoscopía)',
          'Medicina Integral',
          'Procedimientos Urología',
          'Vacunatorio',
          'Vacunatorio Campaña',
        ],
      },
      {
        nombre: 'Centro de Cáncer UC CHRISTUS',
        servicios: [
          'Consultas',
          'Lab. Quimioterapia (Adulto)',
          'Lab. Quimioterapia (Pediátrico)',
          'Lab. Radioterapia',
        ],
      },
      { nombre: 'Centro de Salud Mental Providencia', servicios: [] },
    ],
  },
  {
    nombre: 'Red Áncora',
    serviciosComunes: ['Consulta general', 'Pediatría'],
    subcentros: [
      { nombre: 'CESFAM Juan Pablo II', servicios: [] },
      { nombre: 'CESFAM Madre Teresa de Calcuta', servicios: [] },
      { nombre: 'CESFAM San Alberto Hurtado', servicios: [] },
      {
        nombre: 'Centro Áncora San Francisco',
        servicios: ['Consultas y Procedimientos'],
      },
    ],
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
export const responsablesIniciales: Responsable[] = [
  { nombre: 'Francisco Castro Jorquera', correo: '', activo: true },
  { nombre: 'Alexander Valenzuela Flores', correo: '', activo: true },
  { nombre: 'Felipe Muñoz Alvarez', correo: '', activo: true },
  { nombre: 'Maria Paz Moreno Cortez', correo: '', activo: true },
  { nombre: 'Catalina Mayorga Gajardo', correo: '', activo: true },
]

export const responsables = responsablesIniciales.map((r) => r.nombre)

/** Glosario de siglas clínicas frecuentes para mostrar ayuda visual sin alterar el nombre oficial */
export const GLOSARIO_SIGLAS: { sigla: string; significado: string }[] = [
  { sigla: 'MQ', significado: 'Médico Quirúrgico' },
  { sigla: 'UPC', significado: 'Unidad de Paciente Crítico' },
  { sigla: 'UCI', significado: 'Unidad de Cuidados Intensivos' },
  { sigla: 'UTIM', significado: 'Unidad de Tratamiento Intermedio Médico' },
  { sigla: 'INCOR', significado: 'Intermedio Coronario' },
  { sigla: 'UCO', significado: 'Unidad Coronaria' },
  { sigla: 'CUC', significado: 'Clínico UC' },
  { sigla: 'PAB / QX', significado: 'Pabellón / Quirúrgico' },
  { sigla: 'TMT', significado: 'Traumatología' },
  { sigla: 'PNI', significado: 'Programa Nacional de Inmunizaciones' },
  { sigla: 'UTM', significado: 'Unidad de Tratamiento Médico' },
  { sigla: 'PED / NEO', significado: 'Pediátrico / Neonatal' },
]

export interface InfoServicio {
  /** Clasificación clínica (ej. Médico Quirúrgico, UPC / Intermedio, Cardiocrítico) */
  unidad?: string
  /** Explicación legible cuando el nombre contiene siglas */
  detalle?: string
}

/** Devuelve la unidad clínica y el significado de las siglas de un servicio si aplica */
export function describirServicio(nombre: string): InfoServicio {
  const n = nombre.trim()
  const lower = n.toLowerCase()

  // 1. Detectar unidad clínica (basado en las áreas reales del catálogo)
  let unidad: string | undefined
  if (lower.startsWith('mq ') || lower.includes('médico quirúrgico') || lower.includes('cirugía')) {
    unidad = 'Médico Quirúrgico'
  } else if (
    lower.includes('coronari') ||
    lower.includes('cardiovascular') ||
    lower.includes('cardiología')
  ) {
    unidad = 'Cardiocrítico / Cardiología'
  } else if (lower.includes('oncolog') || lower.includes('quimioterapia') || lower.includes('radioterapia')) {
    unidad = 'Oncología'
  } else if (lower.includes('pediatr') || lower.includes('uci ped')) {
    unidad = 'Pediatría'
  } else if (
    lower.includes('maternidad') ||
    lower.includes('neonat') ||
    lower.includes('uci neo') ||
    lower.includes('atención inmediata')
  ) {
    unidad = 'Materno Neonatal'
  } else if (
    lower === 'uci' ||
    lower === 'upc' ||
    lower.startsWith('uci ') ||
    lower.startsWith('upc ') ||
    lower.startsWith('utim') ||
    lower.startsWith('intermedio')
  ) {
    unidad = 'UPC / Intermedio'
  } else if (lower.includes('urgencia') || lower.includes('emergencia')) {
    unidad = 'Urgencia'
  } else if (lower.includes('salud mental')) {
    unidad = 'Salud Mental'
  } else if (lower.includes('pabellón') || lower.includes('pabellones') || lower.startsWith('pab ')) {
    unidad = 'Pabellón'
  } else if (
    lower.includes('farmacia') ||
    lower.includes('insumos') ||
    lower.includes('esterilización') ||
    lower.includes('almacén') ||
    lower.includes('gestión de camas') ||
    lower.includes('seguridad') ||
    lower.includes('servicios generales') ||
    lower.includes('desinfección')
  ) {
    unidad = 'Apoyo Clínico y Logística'
  }

  // 2. Traducir siglas presentes en el nombre
  const partesDetalle: string[] = []

  if (/^MQ\s+/i.test(n)) {
    const resto = n.replace(/^MQ\s+/i, '')
    partesDetalle.push(`Médico Quirúrgico (${resto})`)
  }
  if (/\bUTIM\b/i.test(n)) {
    partesDetalle.push('Unidad de Tratamiento Intermedio Médico')
  }
  if (/\bUPC\b/i.test(n)) {
    partesDetalle.push('Unidad de Paciente Crítico')
  }
  if (/\bUCI\b/i.test(n)) {
    partesDetalle.push('Unidad de Cuidados Intensivos')
  }
  if (/\bPED\b/i.test(n)) {
    partesDetalle.push('Pediátrica')
  }
  if (/\bNEO\b/i.test(n)) {
    partesDetalle.push('Neonatología')
  }
  if (/\bINCOR\b/i.test(n)) {
    partesDetalle.push('Intermedio Coronario')
  }
  if (/\bUCO\b/i.test(n)) {
    partesDetalle.push('Unidad Coronaria')
  }
  if (/\bCUC\b/i.test(n)) {
    partesDetalle.push('Clínico UC')
  }
  if (/^PAB\s+/i.test(n)) {
    partesDetalle.push('Pabellón de Maternidad')
  }
  if (/\bTMT\b/i.test(n)) {
    partesDetalle.push('TMT: Traumatología')
  }
  if (/\bPNI\b/i.test(n)) {
    partesDetalle.push('Programa Nacional de Inmunizaciones')
  }
  if (n === 'UTM') {
    partesDetalle.push('Unidad de Tratamiento Médico')
  }
  if (/\bQX\b/i.test(n)) {
    partesDetalle.push('QX: Quirúrgico')
  }
  if (/\bPROC\b/i.test(n)) {
    partesDetalle.push('Procedimientos')
  }
  if (/\bDIST\b/i.test(n)) {
    partesDetalle.push('Distribución')
  }

  return {
    unidad,
    detalle: partesDetalle.length > 0 ? partesDetalle.join(' · ') : undefined,
  }
}

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