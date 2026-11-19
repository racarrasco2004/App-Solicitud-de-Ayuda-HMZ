import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { menu } from '@/config/navegacion'
import { useAuth } from '@/context/AuthContext'

/** Pide sesión y revisa que el rol pueda ver la sección (incluye sus subrutas, ej. /solicitudes/SOL-1). */
export function RutaProtegida() {
  const { usuario, cargando } = useAuth()
  const { pathname } = useLocation()

  if (cargando) return <p className="p-8 text-center text-sm text-tinta-3" role="status">Verificando tu sesión…</p>
  if (!usuario) return <Navigate to="/login" replace />

  const item = menu.find((m) =>
    m.ruta === '/' ? pathname === '/' : pathname === m.ruta || pathname.startsWith(`${m.ruta}/`),
  )
  if (item && !item.roles.includes(usuario.rol)) return <Navigate to="/" replace />

  return <Outlet />
}
