import { crearMockRepository } from './mockSolicitudesRepository'
import type { SolicitudesRepository } from './solicitudesRepository'

/**
 * Punto único donde se elige el origen de los datos.
 * Para pasar a SharePoint o a una API: crear `graphSolicitudesRepository.ts`
 * (que cumpla `SolicitudesRepository`) y devolverlo aquí en lugar del mock.
 */
export const solicitudesRepository: SolicitudesRepository = crearMockRepository()
