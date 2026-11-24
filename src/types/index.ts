/**
 * Tipos del dominio del Portal de Apoyo.
 * Los nombres de los campos de `Solicitud` coinciden con las columnas que
 * tendrá la lista de SharePoint, para que el cambio de origen de datos sea simple.
 */

export type Rol = 'solicitante' | 'coordinador' | 'administrador'

export type Programa = 'PAEC' | 'PARES'

export type Estado = 'Pendiente' | 'En proceso' | 'Cerrada'

export type TipoSolicitante = 'Paciente' | 'Familiar' | 'Colaborador' | 'Equipo'

export interface Usuario {
  correo: string
  nombre: string
  rol: Rol
}

export interface Responsable {
  nombre: string
  correo: string
  activo: boolean
}

export interface Solicitud {
  /** Código visible, por ejemplo SOL-2026-0001 */
  id: string
  /** Fecha y hora de creación en formato ISO */
  fecha: string
  /** Solo aplica a colaboradores y equipos. Pacientes y familiares: null */
  programa: Programa | null
  estado: Estado
  /** Tipo de centro: "Hospitales y clínicas", "Centros médicos"... */
  centro: string
  /** Centro específico: "Hospital Clínico UC CHRISTUS", "Centro Médico Lira"... */
  subcentro: string
  servicio: string
  tipoSolicitante: TipoSolicitante
  /** Nombre de la persona de contacto */
  solicitante: string
  telefono: string
  /** Nombre del paciente o familiar a quien se acompañará. Solo cuando el apoyo es para ellos */
  personaApoyo?: string
  /** Tipo de apoyo espiritual solicitado (ej. Oración o bendición, Escucha espiritual) */
  apoyoEspiritual?: string
  /** Religión o creencia. Obligatoria si el apoyo es para un paciente o familiar */
  religion?: string
  comentario: string
  /** Persona del equipo de Humanización a cargo. null = sin asignar */
  responsable: string | null
  /** Correo de quien registró la solicitud */
  creadaPor: string
}

/** Lo que completa quien crea una solicitud desde el formulario */
export type DatosNuevaSolicitud = Pick<
  Solicitud,
  | 'programa'
  | 'centro'
  | 'subcentro'
  | 'servicio'
  | 'tipoSolicitante'
  | 'solicitante'
  | 'telefono'
  | 'personaApoyo'
  | 'apoyoEspiritual'
  | 'religion'
  | 'comentario'
>

/** Lo que puede cambiar un coordinador sobre una solicitud existente */
export type CambiosSolicitud = Partial<Pick<Solicitud, 'estado' | 'responsable'>>

export interface Subcentro {
  nombre: string
  servicios: string[]
}

export interface Centro {
  nombre: string
  /** Servicios que aplican a todos los subcentros de este tipo */
  serviciosComunes: string[]
  subcentros: Subcentro[]
}

/** Tarjeta de anuncio o campaña que se ve en el Inicio */
export interface Anuncio {
  id: string
  titulo: string
  texto: string
  /** Foto: una imagen guardada (data:...) o «ejemplo:<clave>» para las fotos de muestra */
  imagen: string
  activo: boolean
}