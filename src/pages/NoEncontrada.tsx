import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { EstadoVacio } from '@/components/ui/EstadoVacio'

export function NoEncontrada() {
  return (
    <div className="rounded-2xl border border-linea bg-superficie shadow-sm">
      <EstadoVacio
        icono={SearchX}
        titulo="No encontramos esa página"
        texto="Revisa la dirección o vuelve al inicio."
        accion={
          <Link to="/">
            <Button relieve>Ir al inicio</Button>
          </Link>
        }
      />
    </div>
  )
}
