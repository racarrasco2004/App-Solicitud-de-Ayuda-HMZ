import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, ImageOff, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { CarruselAnuncios } from '@/components/CarruselAnuncios'
import { Button } from '@/components/ui/Button'
import { CampoTexto, CampoTextoLargo } from '@/components/ui/Campos'
import { EstadoVacio } from '@/components/ui/EstadoVacio'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAnuncios } from '@/context/AnunciosContext'
import type { Anuncio } from '@/types'
import { reducirImagen } from '@/utils/imagen'

const vacio = { titulo: '', texto: '', imagen: '' }

export function Anuncios() {
  const { anuncios, agregar, actualizar, alternar, eliminar, mover, srcDe } = useAnuncios()
  const [editando, setEditando] = useState<Anuncio | 'nuevo' | null>(null)
  const [borrando, setBorrando] = useState<Anuncio | null>(null)
  const [datos, setDatos] = useState(vacio)
  const [intentado, setIntentado] = useState(false)
  const [errorImagen, setErrorImagen] = useState('')
  const [cargando, setCargando] = useState(false)
  const archivo = useRef<HTMLInputElement>(null)

  const abrir = (a: Anuncio | 'nuevo') => {
    setDatos(a === 'nuevo' ? vacio : { titulo: a.titulo, texto: a.texto, imagen: a.imagen })
    setIntentado(false)
    setErrorImagen('')
    setEditando(a)
  }

  const elegirFoto = async (f: File | undefined) => {
    if (!f) return
    setErrorImagen('')
    setCargando(true)
    try {
      setDatos((d) => ({ ...d, imagen: '' }))
      const img = await reducirImagen(f)
      setDatos((d) => ({ ...d, imagen: img }))
    } catch (e) {
      setErrorImagen(e instanceof Error ? e.message : 'No pudimos cargar la imagen.')
    } finally {
      setCargando(false)
      if (archivo.current) archivo.current.value = ''
    }
  }

  const guardar = () => {
    setIntentado(true)
    if (!datos.titulo.trim() || !datos.imagen) return
    const limpio = { ...datos, titulo: datos.titulo.trim(), texto: datos.texto.trim() }
    if (editando === 'nuevo') agregar(limpio)
    else if (editando) actualizar(editando.id, limpio)
    setEditando(null)
  }

  return (
    <>
      <PageHeader
        titulo="Anuncios"
        subtitulo="Estas tarjetas se ven en el Inicio y en Programas. Crea una, cámbiale la foto o el texto, y listo."
        acciones={
          <Button relieve icono={Plus} onClick={() => abrir('nuevo')}>
            Nuevo anuncio
          </Button>
        }
      />

      <section className="mb-6 rounded-2xl border border-linea bg-superficie shadow-sm">
        {anuncios.length === 0 ? (
          <EstadoVacio icono={ImageOff} titulo="Aún no hay anuncios" texto="Crea el primero con el botón «Nuevo anuncio»." />
        ) : (
          <ul className="divide-y divide-linea">
            {anuncios.map((a, i) => {
              const src = srcDe(a.imagen)
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-3 p-3">
                  <span className="h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-superficie-3">
                    {src && <img src={src} alt="" className="size-full object-cover" />}
                  </span>
                  <div className="min-w-48 flex-1">
                    <p className="text-sm font-bold text-tinta">{a.titulo}</p>
                    <p className="line-clamp-2 text-xs text-tinta-3">{a.texto}</p>
                    <p className={`mt-1 text-xs font-bold ${a.activo ? 'text-uc-green-texto' : 'text-tinta-3'}`}>
                      {a.activo ? 'Visible' : 'Oculto'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button variante="ghost" tamano="sm" icono={ArrowUp} disabled={i === 0} onClick={() => mover(a.id, -1)} aria-label="Subir" />
                    <Button variante="ghost" tamano="sm" icono={ArrowDown} disabled={i === anuncios.length - 1} onClick={() => mover(a.id, 1)} aria-label="Bajar" />
                    <Button variante="outline" tamano="sm" icono={a.activo ? EyeOff : Eye} onClick={() => alternar(a.id)}>
                      {a.activo ? 'Ocultar' : 'Mostrar'}
                    </Button>
                    <Button variante="outline" tamano="sm" icono={Pencil} onClick={() => abrir(a)}>
                      Editar
                    </Button>
                    <Button variante="red" tamano="sm" icono={Trash2} onClick={() => setBorrando(a)}>
                      Eliminar
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <p className="mb-2 text-xs font-bold tracking-wide text-tinta-3 uppercase">Así lo ve el solicitante</p>
      <CarruselAnuncios titulo="Vista previa" />

      <Modal
        abierto={editando !== null}
        onCerrar={() => setEditando(null)}
        titulo={editando === 'nuevo' ? 'Nuevo anuncio' : 'Editar anuncio'}
        icono={ImagePlus}
        soloCerrarConX
        pie={
          <>
            <Button variante="outline" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button relieve onClick={guardar} disabled={cargando}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-bold tracking-wide text-uc-purple-texto uppercase">Foto <span className="text-uc-red-texto">*</span></p>
            <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-dashed border-linea-fuerte bg-superficie-2">
              {datos.imagen ? (
                <img src={srcDe(datos.imagen)} alt="Vista previa de la foto" className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center text-sm text-tinta-3">
                  {cargando ? (
                    <span className="flex items-center gap-2"><LoaderCircle size={20} className="animate-spin text-uc-purple" aria-hidden /> Cargando foto…</span>
                  ) : (
                    'Aún no hay foto'
                  )}
                </span>
              )}
            </div>
            <input ref={archivo} type="file" accept="image/*" className="sr-only" id="foto-anuncio" onChange={(e) => elegirFoto(e.target.files?.[0])} />
            <div className="mt-2 flex gap-2">
              <Button variante="outline" tamano="sm" icono={ImagePlus} onClick={() => archivo.current?.click()}>
                {datos.imagen ? 'Cambiar foto' : 'Subir foto'}
              </Button>
            </div>
            {(errorImagen || (intentado && !datos.imagen)) && (
              <p role="alert" className="mt-1 text-xs text-uc-red-texto">{errorImagen || 'Sube una foto para el anuncio.'}</p>
            )}
          </div>
          <CampoTexto etiqueta="Título" obligatorio value={datos.titulo} maxLength={60} error={intentado && !datos.titulo.trim() ? 'Escribe un título.' : ''} onChange={(e) => setDatos({ ...datos, titulo: e.target.value })} />
          <CampoTextoLargo etiqueta="Texto" value={datos.texto} maxLength={180} ayuda="Corto y claro: se lee mejor en el celular." onChange={(e) => setDatos({ ...datos, texto: e.target.value })} />
        </div>
      </Modal>

      <Modal
        abierto={borrando !== null}
        onCerrar={() => setBorrando(null)}
        titulo="¿Eliminar anuncio?"
        tono="red"
        icono={Trash2}
        pie={
          <>
            <Button variante="outline" onClick={() => setBorrando(null)}>Cancelar</Button>
            <Button variante="red" relieve onClick={() => { if (borrando) eliminar(borrando.id); setBorrando(null) }}>Eliminar</Button>
          </>
        }
      >
        <p className="text-sm text-tinta-2">
          «{borrando?.titulo}» dejará de verse. Si solo quieres sacarlo por un tiempo, usa <strong>Ocultar</strong>.
        </p>
      </Modal>
    </>
  )
}
