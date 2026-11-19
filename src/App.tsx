import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RutaProtegida } from '@/components/RutaProtegida'
import { AnunciosProvider } from '@/context/AnunciosContext'
import { AjustesProvider } from '@/context/AjustesContext'
import { CatalogosProvider } from '@/context/CatalogosContext'
import { AuthProvider } from '@/context/AuthContext'
import { SolicitudesProvider } from '@/context/SolicitudesContext'
import { Anuncios } from '@/pages/Anuncios'
import { Administracion } from '@/pages/Administracion'
import { DetalleSolicitud } from '@/pages/DetalleSolicitud'
import { Estadisticas } from '@/pages/Estadisticas'
import { Solicitudes } from '@/pages/Solicitudes'
import { Inicio } from '@/pages/Inicio'
import { Login } from '@/pages/Login'
import { MisSolicitudes } from '@/pages/MisSolicitudes'
import { NoEncontrada } from '@/pages/NoEncontrada'
import { NuevaSolicitud } from '@/pages/NuevaSolicitud'

export default function App() {
  return (
    <AjustesProvider>
      <CatalogosProvider>
      <AuthProvider>
        <SolicitudesProvider>
          <AnunciosProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<RutaProtegida />}>
                <Route element={<AppLayout />}>
                  <Route index element={<Inicio />} />
                  <Route path="programas" element={<Navigate to="/#programas" replace />} />
                  <Route path="nueva-solicitud" element={<NuevaSolicitud />} />
                  <Route path="mis-solicitudes" element={<MisSolicitudes />} />
                  <Route path="solicitudes" element={<Solicitudes />} />
                  <Route path="solicitudes/:id" element={<DetalleSolicitud />} />
                  <Route path="estadisticas" element={<Estadisticas />} />
                  <Route path="anuncios" element={<Anuncios />} />
                  <Route path="administracion" element={<Administracion />} />
                  <Route path="*" element={<NoEncontrada />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
          </AnunciosProvider>
        </SolicitudesProvider>
      </AuthProvider>
      </CatalogosProvider>
    </AjustesProvider>
  )
}
