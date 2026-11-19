import { ChevronDown, LogOut, Menu, Moon, SlidersHorizontal, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LogosAreas } from '@/components/LogosAreas'
import { Avatar } from '@/components/ui/Avatar'
import { menu, nombreDeRol } from '@/config/navegacion'
import { useAjustes } from '@/context/AjustesContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'
import { primerNombre } from '@/utils/formato'

/** Cabecera clara con navegación horizontal. Reemplaza al menú lateral. */
export function Cabecera({ onAjustes }: { onAjustes: () => void }) {
  const { usuario, salir } = useAuth()
  const { temaEfectivo, cambiar } = useAjustes()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [usuarioAbierto, setUsuarioAbierto] = useState(false)
  const refUsuario = useRef<HTMLDivElement>(null)

  // Cierra el menú del usuario al hacer clic fuera o presionar Esc
  useEffect(() => {
    if (!usuarioAbierto) return
    const fuera = (e: MouseEvent) => {
      if (!refUsuario.current?.contains(e.target as Node)) setUsuarioAbierto(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setUsuarioAbierto(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [usuarioAbierto])

  if (!usuario) return null
  const items = menu.filter((m) => m.roles.includes(usuario.rol))

  const enlace = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors',
      isActive
        ? 'gradiente-marca text-white shadow-[0_6px_16px_-6px_rgb(var(--uc-purple)/0.7)]'
        : 'text-tinta-2 hover:bg-uc-purple-light',
    )

  return (
    <header className="sticky top-0 z-30 border-b border-linea/70 bg-superficie/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="gradiente-marca h-1" aria-hidden />
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <Link to="/" aria-label="Ir al inicio" className="shrink-0">
          <LogosAreas alto="h-9" />
        </Link>

        <nav aria-label="Principal" className="ml-3 hidden items-center gap-0.5 xl:flex">
          {items.map(({ ruta, etiqueta, icono: Icono }) => (
            <NavLink key={ruta} to={ruta} end={ruta === '/'} className={enlace}>
              <Icono size={16} aria-hidden className="hidden 2xl:block" />
              {etiqueta}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => cambiar({ tema: temaEfectivo === 'oscuro' ? 'claro' : 'oscuro' })}
            aria-label={temaEfectivo === 'oscuro' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            className="cursor-pointer rounded-full p-2 text-tinta-2 hover:bg-superficie-3"
          >
            {temaEfectivo === 'oscuro' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
          </button>

          <div ref={refUsuario} className="relative">
            <button
              type="button"
              onClick={() => setUsuarioAbierto((v) => !v)}
              aria-expanded={usuarioAbierto}
              aria-haspopup="menu"
              className="flex cursor-pointer items-center gap-2 rounded-full border border-linea py-1 pr-2.5 pl-1 hover:bg-superficie-3"
            >
              <Avatar nombre={usuario.nombre} className="size-7" />
              <span className="hidden text-sm font-semibold text-tinta sm:block">{primerNombre(usuario.nombre)}</span>
              <ChevronDown size={14} className="text-tinta-3" aria-hidden />
            </button>
            {usuarioAbierto && (
              <div role="menu" className="animar-aparecer absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-linea bg-superficie shadow-xl">
                <div className="border-b border-linea px-4 py-3">
                  <p className="text-sm font-bold text-tinta">{usuario.nombre}</p>
                  <p className="text-xs text-tinta-3">{nombreDeRol[usuario.rol]}</p>
                </div>
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setUsuarioAbierto(false)
                    onAjustes()
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-tinta hover:bg-superficie-3"
                >
                  <SlidersHorizontal size={16} aria-hidden /> Ajustes de lectura
                </button>
                <button
                  role="menuitem"
                  type="button"
                  onClick={salir}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-tinta hover:bg-superficie-3"
                >
                  <LogOut size={16} aria-hidden /> Cerrar sesión
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            className="cursor-pointer rounded-full p-2 text-tinta-2 hover:bg-superficie-3 xl:hidden"
          >
            {menuAbierto ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {menuAbierto && (
        <nav aria-label="Principal (móvil)" className="animar-aparecer flex flex-col gap-1 border-t border-linea px-4 py-3 xl:hidden">
          {items.map(({ ruta, etiqueta, icono: Icono }) => (
            <NavLink key={ruta} to={ruta} end={ruta === '/'} className={enlace} onClick={() => setMenuAbierto(false)}>
              <Icono size={16} aria-hidden />
              {etiqueta}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
