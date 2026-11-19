import type { CambiosSolicitud, DatosNuevaSolicitud, Solicitud } from '@/types'

/**
 * Contrato de acceso a las solicitudes.
 * Las pantallas SOLO conocen esta interfaz. Hoy la implementa `mockSolicitudesRepository`
 * (datos de ejemplo). Más adelante se escribe otra implementación (SharePoint con Microsoft
 * Graph, o la API de Ingeniería de Software) y se cambia en `services/index.ts`,
 * sin tocar ninguna pantalla.
 */
export interface SolicitudesRepository {
  listar(): Promise<Solicitud[]>
  crear(datos: DatosNuevaSolicitud, creadaPor: string): Promise<Solicitud>
  actualizar(id: string, cambios: CambiosSolicitud): Promise<Solicitud>
}
