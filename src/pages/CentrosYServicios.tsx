import {
  Building2,
  CheckCircle2,
  FolderPlus,
  Layers,
  ListPlus,
  Plus,
  RotateCcw,
  Search,
  Stethoscope,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CampoTexto, CampoTextoLargo } from '@/components/ui/Campos'
import { Modal } from '@/components/ui/Modal'
import { useCatalogos } from '@/context/CatalogosContext'
import { cn } from '@/utils/cn'

export function CentrosYServicios() {
  const {
    centros,
    agregarSubcentro,
    agregarServicio,
    agregarVariosServicios,
    quitarServicio,
    restaurarCatalogoCentros,
  } = useCatalogos()

  const [areaActiva, setAreaActiva] = useState<string>(centros[0]?.nombre ?? '')
  const [subcentroActivo, setSubcentroActivo] = useState<string>('')
  const [modoComunes, setModoComunes] = useState(false)

  // Filtros de búsqueda
  const [filtroCentro, setFiltroCentro] = useState('')
  const [filtroServicio, setFiltroServicio] = useState('')

  // Agregar nuevo centro dentro del área
  const [mostrarFormCentro, setMostrarFormCentro] = useState(false)
  const [nuevoCentro, setNuevoCentro] = useState('')
  const [errorCentro, setErrorCentro] = useState('')

  // Agregar servicio (individual o en lote)
  const [modoLote, setModoLote] = useState(false)
  const [nuevoServicio, setNuevoServicio] = useState('')
  const [variosServicios, setVariosServicios] = useState('')
  const [errorServicio, setErrorServicio] = useState('')
  const [avisoExito, setAvisoExito] = useState('')

  // Confirmar restauración
  const [modalRestaurar, setModalRestaurar] = useState(false)

  const areaObj = useMemo(
    () => centros.find((c) => c.nombre === areaActiva) ?? centros[0],
    [centros, areaActiva],
  )

  // Sincroniza selección al cambiar de área
  useEffect(() => {
    if (!areaObj) return
    setFiltroCentro('')
    setFiltroServicio('')
    setErrorServicio('')
    setAvisoExito('')
    if (!modoComunes) {
      const existeActual = areaObj.subcentros.some((s) => s.nombre === subcentroActivo)
      if (!existeActual) {
        setSubcentroActivo(areaObj.subcentros[0]?.nombre ?? '')
      }
    }
  }, [areaObj, modoComunes, subcentroActivo])

  const subcentrosFiltrados = useMemo(() => {
    if (!areaObj) return []
    const q = filtroCentro.trim().toLowerCase()
    if (!q) return areaObj.subcentros
    return areaObj.subcentros.filter((s) => s.nombre.toLowerCase().includes(q))
  }, [areaObj, filtroCentro])

  const subcentroObj = useMemo(
    () => areaObj?.subcentros.find((s) => s.nombre === subcentroActivo),
    [areaObj, subcentroActivo],
  )

  // Lista combinada de servicios a mostrar en la columna derecha
  const listaServicios = useMemo(() => {
    if (!areaObj) return []
    const q = filtroServicio.trim().toLowerCase()

    if (modoComunes) {
      return areaObj.serviciosComunes
        .filter((nombre) => !q || nombre.toLowerCase().includes(q))
        .map((nombre) => ({ nombre, esComun: true }))
    }

    if (!subcentroObj) return []

    const comunes = areaObj.serviciosComunes.map((nombre) => ({ nombre, esComun: true }))
    const propios = subcentroObj.servicios
      .filter((nombre) => !areaObj.serviciosComunes.includes(nombre))
      .map((nombre) => ({ nombre, esComun: false }))

    return [...propios, ...comunes]
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
      .filter((item) => !q || item.nombre.toLowerCase().includes(q))
  }, [areaObj, subcentroObj, modoComunes, filtroServicio])

  const totalServiciosSistema = useMemo(
    () =>
      centros.reduce(
        (acc, c) =>
          acc + c.serviciosComunes.length + c.subcentros.reduce((sAcc, s) => sAcc + s.servicios.length, 0),
        0,
      ),
    [centros],
  )

  const handleCrearCentro = (e: FormEvent) => {
    e.preventDefault()
    if (!areaObj) return
    const err = agregarSubcentro(areaObj.nombre, nuevoCentro)
    setErrorCentro(err)
    if (!err) {
      const creado = nuevoCentro.trim()
      setNuevoCentro('')
      setMostrarFormCentro(false)
      setModoComunes(false)
      setSubcentroActivo(creado)
      setAvisoExito(`Centro «${creado}» agregado a ${areaObj.nombre}.`)
    }
  }

  const handleCrearServicio = (e: FormEvent) => {
    e.preventDefault()
    if (!areaObj) return
    setAvisoExito('')
    const destinoSubcentro = modoComunes ? '' : subcentroActivo
    if (!modoComunes && !destinoSubcentro) {
      setErrorServicio('Primero selecciona o crea un centro en la columna izquierda.')
      return
    }

    if (modoLote) {
      const lineas = variosServicios.split(/\r?\n/)
      const { agregados, duplicados } = agregarVariosServicios(areaObj.nombre, destinoSubcentro, lineas)
      if (agregados === 0 && duplicados.length === 0) {
        setErrorServicio('Escribe al menos un servicio (uno por línea).')
        return
      }
      setErrorServicio('')
      setVariosServicios('')
      const notaDup = duplicados.length > 0 ? ` (${duplicados.length} omitidos por estar repetidos)` : ''
      setAvisoExito(`Se agregaron ${agregados} servicio(s) correctamente${notaDup}.`)
    } else {
      const err = agregarServicio(areaObj.nombre, destinoSubcentro, nuevoServicio)
      setErrorServicio(err)
      if (!err) {
        const agregado = nuevoServicio.trim()
        setNuevoServicio('')
        setAvisoExito(`Servicio «${agregado}» agregado.`)
      }
    }
  }

  if (!areaObj) return null

  return (
    <div className="space-y-4">
      {/* PASO 1: Selector visual de Área */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold tracking-wide text-uc-purple-texto uppercase">
            1. Elige el área
          </span>
          <span className="text-xs text-tinta-3">
            Total en portal: <strong>{totalServiciosSistema}</strong> servicios
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {centros.map((area) => {
            const seleccionada = area.nombre === areaObj.nombre
            const totalArea =
              area.serviciosComunes.length +
              area.subcentros.reduce((acc, s) => acc + s.servicios.length, 0)
            return (
              <button
                key={area.nombre}
                type="button"
                onClick={() => {
                  setAreaActiva(area.nombre)
                  setModoComunes(false)
                }}
                className={cn(
                  'flex cursor-pointer flex-col items-start rounded-xl border p-3 text-left transition-all',
                  seleccionada
                    ? 'border-uc-purple bg-uc-purple/8 ring-2 ring-uc-purple/25'
                    : 'border-linea bg-superficie hover:border-linea-fuerte hover:bg-fondo',
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-bold text-tinta">{area.nombre}</span>
                  <Badge tono={seleccionada ? 'purple' : undefined}>{area.subcentros.length}</Badge>
                </div>
                <span className="mt-1 text-xs text-tinta-3">
                  {area.subcentros.length === 1 ? '1 centro' : `${area.subcentros.length} centros`} ·{' '}
                  {totalArea} servicios
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* PASO 2 y 3: Explorador Maestro-Detalle */}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* COLUMNA IZQUIERDA: Centros del área */}
        <div className="flex flex-col rounded-xl border border-linea bg-fondo/60 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-uc-purple-texto uppercase">
              <Building2 size={14} aria-hidden />
              2. Centros ({areaObj.subcentros.length})
            </span>
            <button
              type="button"
              onClick={() => {
                setMostrarFormCentro((v) => !v)
                setErrorCentro('')
              }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-uc-purple-texto hover:bg-uc-purple/10"
            >
              {mostrarFormCentro ? <X size={13} /> : <FolderPlus size={13} />}
              {mostrarFormCentro ? 'Cancelar' : 'Nuevo centro'}
            </button>
          </div>

          {/* Formulario desplegable para crear un centro */}
          {mostrarFormCentro && (
            <form
              onSubmit={handleCrearCentro}
              className="mb-3 rounded-lg border border-uc-purple/30 bg-superficie p-2.5 shadow-sm"
              noValidate
            >
              <CampoTexto
                etiqueta={`Nuevo centro en ${areaObj.nombre}`}
                placeholder="Ej. Centro Médico Ñuñoa"
                value={nuevoCentro}
                error={errorCentro}
                onChange={(e) => setNuevoCentro(e.target.value)}
              />
              <Button type="submit" tamano="sm" relieve icono={Plus} className="mt-2 w-full justify-center">
                Guardar centro
              </Button>
            </form>
          )}

          {/* Buscador de centros */}
          {areaObj.subcentros.length > 5 && (
            <div className="relative mb-2">
              <Search
                size={14}
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-tinta-3"
              />
              <input
                type="text"
                value={filtroCentro}
                onChange={(e) => setFiltroCentro(e.target.value)}
                placeholder="Filtrar centros..."
                className="h-8 w-full rounded-md border border-linea-fuerte/60 bg-superficie pr-3 pl-8 text-xs text-tinta placeholder:text-apagado focus:border-uc-blue focus:outline-none"
              />
            </div>
          )}

          {/* Opción especial: Servicios transversales del área */}
          <button
            type="button"
            onClick={() => {
              setModoComunes(true)
              setFiltroServicio('')
              setErrorServicio('')
              setAvisoExito('')
            }}
            className={cn(
              'mb-2 flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition-colors',
              modoComunes
                ? 'border-uc-blue bg-uc-blue/10 font-semibold text-tinta'
                : 'border-dashed border-linea-fuerte bg-superficie/80 text-tinta-2 hover:bg-superficie',
            )}
          >
            <span className="flex items-center gap-1.5">
              <Layers size={14} className="shrink-0 text-uc-blue" />
              Servicios comunes del área
            </span>
            <Badge tono={modoComunes ? 'blue' : undefined}>{areaObj.serviciosComunes.length}</Badge>
          </button>

          {/* Listado de centros */}
          <div className="max-h-[340px] space-y-1 overflow-y-auto pr-0.5">
            {subcentrosFiltrados.map((s) => {
              const activo = !modoComunes && s.nombre === subcentroActivo
              const total = new Set([...areaObj.serviciosComunes, ...s.servicios]).size
              return (
                <button
                  key={s.nombre}
                  type="button"
                  onClick={() => {
                    setModoComunes(false)
                    setSubcentroActivo(s.nombre)
                    setFiltroServicio('')
                    setErrorServicio('')
                    setAvisoExito('')
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
                    activo
                      ? 'bg-uc-purple font-semibold text-white shadow-xs'
                      : 'text-tinta hover:bg-superficie',
                  )}
                >
                  <span className="truncate">{s.nombre}</span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-1.5 py-0.5 text-[0.6875rem]',
                      activo ? 'bg-white/20 text-white' : 'bg-linea text-tinta-3',
                    )}
                  >
                    {total}
                  </span>
                </button>
              )
            })}

            {subcentrosFiltrados.length === 0 && (
              <p className="py-4 text-center text-xs text-tinta-3">
                No hay centros que coincidan con «{filtroCentro}».
              </p>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Servicios del centro seleccionado */}
        <div className="flex flex-col rounded-xl border border-linea bg-superficie p-3.5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-linea pb-3">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-uc-purple-texto uppercase">
                <Stethoscope size={14} aria-hidden />
                3. {modoComunes ? `Servicios transversales · ${areaObj.nombre}` : subcentroObj?.nombre ?? 'Selecciona un centro'}
              </span>
              <p className="mt-0.5 text-xs text-tinta-3">
                {modoComunes
                  ? 'Estos servicios aparecen automáticamente en todos los centros de esta área.'
                  : `${listaServicios.length} servicio(s) disponibles para seleccionar en nuevas solicitudes.`}
              </p>
            </div>

            <div className="relative w-full sm:w-56">
              <Search
                size={14}
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-tinta-3"
              />
              <input
                type="text"
                value={filtroServicio}
                onChange={(e) => setFiltroServicio(e.target.value)}
                placeholder="Buscar servicio..."
                className="h-8 w-full rounded-md border border-linea-fuerte/60 bg-fondo pr-3 pl-8 text-xs text-tinta placeholder:text-apagado focus:border-uc-blue focus:bg-superficie focus:outline-none"
              />
            </div>
          </div>

          {/* Formulario para agregar servicio(s) */}
          <form onSubmit={handleCrearServicio} className="mb-3 rounded-lg bg-fondo/80 p-3" noValidate>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-tinta">
                {modoComunes
                  ? `Agregar servicio común a toda el área «${areaObj.nombre}»`
                  : `Agregar servicio a «${subcentroObj?.nombre ?? ''}»`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setModoLote((v) => !v)
                  setErrorServicio('')
                  setAvisoExito('')
                }}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-uc-blue hover:underline"
              >
                <ListPlus size={14} />
                {modoLote ? 'Agregar de a uno' : 'Agregar varios a la vez'}
              </button>
            </div>

            {modoLote ? (
              <div className="space-y-2">
                <CampoTextoLargo
                  etiqueta="Lista de servicios (uno por línea)"
                  placeholder={'Kinesiología\nFonoaudiología\nTerapia Ocupacional'}
                  value={variosServicios}
                  error={errorServicio}
                  onChange={(e) => setVariosServicios(e.target.value)}
                  className="[&_textarea]:min-h-20"
                />
                <div className="flex justify-end">
                  <Button type="submit" tamano="sm" relieve icono={Plus}>
                    Agregar lista
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <CampoTexto
                  className="flex-1"
                  etiqueta="Nombre del servicio"
                  placeholder="Ej. Oncología Ambulatoria"
                  value={nuevoServicio}
                  error={errorServicio}
                  onChange={(e) => {
                    setNuevoServicio(e.target.value)
                    if (errorServicio) setErrorServicio('')
                  }}
                />
                <Button type="submit" relieve icono={Plus} className="mt-[1.6rem]">
                  Agregar
                </Button>
              </div>
            )}

            {avisoExito && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-uc-green-texto">
                <CheckCircle2 size={14} className="shrink-0" />
                {avisoExito}
              </p>
            )}
          </form>

          {/* Listado de servicios */}
          <div className="max-h-[290px] divide-y divide-linea overflow-y-auto rounded-lg border border-linea">
            {listaServicios.map(({ nombre, esComun }) => (
              <div
                key={`${nombre}-${esComun ? 'c' : 'p'}`}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-fondo/60"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-tinta">{nombre}</span>
                  {esComun && !modoComunes && (
                    <Badge tono="blue">Común del área</Badge>
                  )}
                </div>

                {(!esComun || modoComunes) && (
                  <button
                    type="button"
                    onClick={() =>
                      quitarServicio(areaObj.nombre, modoComunes ? '' : subcentroActivo, nombre)
                    }
                    title={`Quitar ${nombre}`}
                    aria-label={`Quitar ${nombre}`}
                    className="cursor-pointer rounded-md p-1 text-tinta-3 transition-colors hover:bg-uc-red/10 hover:text-uc-red-texto"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}

            {listaServicios.length === 0 && (
              <p className="py-8 text-center text-xs text-tinta-3">
                {filtroServicio
                  ? `No se encontraron servicios con «${filtroServicio}».`
                  : 'Aún no hay servicios registrados en este centro.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pie de utilidad para restaurar catálogo oficial */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-linea pt-3 text-xs text-tinta-3">
        <span>Los cambios se guardan automáticamente en este navegador.</span>
        <Button
          tamano="sm"
          variante="outline"
          icono={RotateCcw}
          onClick={() => setModalRestaurar(true)}
        >
          Restaurar catálogo oficial (93 servicios)
        </Button>
      </div>

      <Modal
        abierto={modalRestaurar}
        onCerrar={() => setModalRestaurar(false)}
        titulo="¿Restaurar catálogo oficial?"
        icono={TriangleAlert}
        tono="amber"
        pie={
          <>
            <Button variante="outline" relieve onClick={() => setModalRestaurar(false)}>
              Cancelar
            </Button>
            <Button
              relieve
              icono={RotateCcw}
              onClick={() => {
                restaurarCatalogoCentros()
                setModalRestaurar(false)
                setAvisoExito('Catálogo oficial restaurado con los 93 servicios.')
              }}
            >
              Sí, restaurar
            </Button>
          </>
        }
      >
        <p className="text-sm text-tinta-2">
          Se volverá a cargar la lista oficial de centros y los 93 servicios base del portal.
          Cualquier centro o servicio agregado manualmente en este navegador será reemplazado.
        </p>
      </Modal>
    </div>
  )
}