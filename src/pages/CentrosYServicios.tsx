import { Plus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { CampoLista, CampoTexto } from '@/components/ui/Campos'
import { useCatalogos } from '@/context/CatalogosContext'

const TODOS = 'Todos los centros de este tipo'

/** Agregar o quitar servicios (y centros) sin tocar el código. Lo principal va primero. */
export function CentrosYServicios() {
  const { centros, tiposDeCentro, subcentrosDe, agregarSubcentro, agregarServicio, quitarServicio } = useCatalogos()
  const [tipo, setTipo] = useState(tiposDeCentro()[0] ?? '')
  const [centro, setCentro] = useState('') // '' = todos los centros del tipo
  const [servicio, setServicio] = useState('')
  const [errServicio, setErrServicio] = useState('')
  const [mostrarCentro, setMostrarCentro] = useState(false)
  const [nuevoCentro, setNuevoCentro] = useState('')
  const [errCentro, setErrCentro] = useState('')

  const t = centros.find((c) => c.nombre === tipo)
  const lista = centro ? (t?.subcentros.find((s) => s.nombre === centro)?.servicios ?? []) : (t?.serviciosComunes ?? [])

  const enviarServicio = (e: FormEvent) => {
    e.preventDefault()
    const msg = agregarServicio(tipo, centro, servicio)
    setErrServicio(msg)
    if (!msg) setServicio('')
  }
  const enviarCentro = (e: FormEvent) => {
    e.preventDefault()
    const msg = agregarSubcentro(tipo, nuevoCentro)
    setErrCentro(msg)
    if (!msg) {
      setCentro(nuevoCentro.trim())
      setNuevoCentro('')
      setMostrarCentro(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. Dónde */}
      <div className="grid gap-3 sm:grid-cols-2">
        <CampoLista etiqueta="1. Tipo de centro" textoVacio="Elige un tipo" opciones={tiposDeCentro()} value={tipo} onChange={(e) => { setTipo(e.target.value); setCentro('') }} />
        <CampoLista etiqueta="2. Centro" textoVacio={TODOS} opciones={subcentrosDe(tipo)} value={centro} onChange={(e) => setCentro(e.target.value)} />
      </div>

      {/* 2. Qué servicio */}
      <form onSubmit={enviarServicio} className="flex items-start gap-2" noValidate>
        <CampoTexto className="flex-1" etiqueta="3. Servicio nuevo" placeholder="Escribe el nombre y presiona Agregar" value={servicio} error={errServicio} onChange={(e) => { setServicio(e.target.value); setErrServicio('') }} />
        <Button type="submit" relieve icono={Plus} className="mt-[1.6rem]">Agregar</Button>
      </form>

      {/* Servicios que ya hay */}
      <div>
        <p className="mb-1.5 text-xs font-bold tracking-wide text-tinta-3 uppercase">Ya existen ({lista.length})</p>
        {lista.length === 0 ? (
          <p className="text-sm text-tinta-3">Todavía no hay servicios aquí.</p>
        ) : (
          <ul className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
            {lista.map((s) => (
              <li key={s} className="flex items-center gap-1 rounded-full border border-uc-purple-borde bg-uc-purple-light py-1 pr-1 pl-3 text-xs font-semibold text-uc-purple-texto">
                {s}
                <button type="button" onClick={() => quitarServicio(tipo, centro, s)} aria-label={`Quitar ${s}`} className="grid size-5 cursor-pointer place-items-center rounded-full hover:bg-uc-purple/20">
                  <X size={12} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Centro nuevo, escondido hasta que se necesita */}
      {mostrarCentro ? (
        <form onSubmit={enviarCentro} className="flex items-start gap-2 border-t border-linea pt-3" noValidate>
          <CampoTexto className="flex-1" etiqueta={`Centro nuevo en «${tipo}»`} value={nuevoCentro} error={errCentro} onChange={(e) => { setNuevoCentro(e.target.value); setErrCentro('') }} />
          <Button type="submit" variante="blue" relieve icono={Plus} className="mt-[1.6rem]">Agregar</Button>
          <Button variante="ghost" className="mt-[1.6rem]" onClick={() => setMostrarCentro(false)}>Cancelar</Button>
        </form>
      ) : (
        <Button variante="link" tamano="sm" icono={Plus} onClick={() => setMostrarCentro(true)}>
          ¿Falta un centro? Agregar centro
        </Button>
      )}
    </div>
  )
}
