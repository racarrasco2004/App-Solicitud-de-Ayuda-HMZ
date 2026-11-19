import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import logoUc from '@/assets/marca/uc-christus.png'
import logoHumanizacion from '@/assets/marca/humanizacion.png'
import logoMision from '@/assets/marca/mision-rse.png'
import { AjustesLecturaModal } from './AjustesLecturaModal'
import { Cabecera } from './Cabecera'

export function AppLayout() {
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false)
  const { pathname, hash } = useLocation()

  // Al cambiar de página, sube al inicio
  useEffect(() => {
    // Si el enlace trae #seccion, baja hasta ella; si no, sube al inicio
    const destino = hash ? document.getElementById(hash.slice(1)) : null
    if (destino) destino.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-superficie focus:p-2">
        Saltar al contenido
      </a>
      <Cabecera onAjustes={() => setAjustesAbiertos(true)} />
      <main id="contenido" className="fondo-puntos flex-1 px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <div key={pathname} className="animar-aparecer">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="border-t border-linea bg-superficie px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-tinta-3">
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-1.5">
            <img src={logoHumanizacion} alt="Humanización UC CHRISTUS" className="h-9 w-auto" />
            <span className="h-6 w-px bg-gray-300" aria-hidden />
            <img src={logoMision} alt="Misión y RSE" className="h-7 w-auto" />
            <span className="h-6 w-px bg-gray-300" aria-hidden />
            <img src={logoUc} alt="UC CHRISTUS" className="h-5 w-auto" />
          </div>
          <span>Humanización · Misión y RSE · Plataforma de uso interno de la Red de Salud UC CHRISTUS</span>
        </div>
      </footer>
      <AjustesLecturaModal abierto={ajustesAbiertos} onCerrar={() => setAjustesAbiertos(false)} />
    </div>
  )
}
