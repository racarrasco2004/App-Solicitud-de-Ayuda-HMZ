import { Plus, Power, Trash2, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CampoLista, CampoTexto } from '@/components/ui/Campos'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { HORAS_ESCALAMIENTO } from '@/config/escalamiento'
import { nombreDeRol } from '@/config/navegacion'
import { programas } from '@/config/programas'
import { useAuth } from '@/context/AuthContext'
import { useCatalogos } from '@/context/CatalogosContext'
import { CentrosYServicios } from '@/pages/CentrosYServicios'
import type { Rol } from '@/types'

const roles: Rol[] = ['solicitante', 'coordinador', 'administrador']

function Tarjeta({ titulo, nota, children, ancha }: { titulo: string; nota?: string; children: ReactNode; ancha?: boolean }) {
  return (
    <section className={`rounded-2xl border border-linea bg-superficie p-4 shadow-sm ${ancha ? 'md:col-span-2' : ''}`}>
      <h2 className="text-sm font-bold text-tinta">{titulo}</h2>
      {nota && <p className="text-xs text-tinta-3">{nota}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Responsables() {
  const { responsables, agregarResponsable, alternarResponsable, eliminarResponsable } = useCatalogos()
  const [porEliminar, setPorEliminar] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const msg = agregarResponsable(nombre)
    setError(msg)
    if (!msg) setNombre('')
  }
  return (
    <Tarjeta titulo="Responsables" nota="Personas a quienes se asignan solicitudes. Desactivar no borra su historial.">
      <ul className="mb-3 divide-y divide-linea text-sm">
        {responsables.map((r) => (
          <li key={r.nombre} className="flex items-center justify-between gap-2 py-2">
            <span className={r.activo ? '' : 'text-tinta-3 line-through'}>{r.nombre}</span>
            <span className="flex gap-1.5">
              <Button tamano="sm" variante="outline" icono={Power} onClick={() => alternarResponsable(r.nombre)}>
                {r.activo ? 'Desactivar' : 'Activar'}
              </Button>
              <Button tamano="sm" variante="red" icono={Trash2} onClick={() => setPorEliminar(r.nombre)} aria-label={`Eliminar a ${r.nombre}`}>
                Eliminar
              </Button>
            </span>
          </li>
        ))}
      </ul>
      <form onSubmit={enviar} className="flex items-start gap-2" noValidate>
        <CampoTexto className="flex-1" etiqueta="Nuevo responsable" value={nombre} error={error} onChange={(e) => setNombre(e.target.value)} />
        <Button type="submit" relieve icono={Plus} className="mt-[1.6rem]">Agregar</Button>
      </form>
      <Modal
        abierto={porEliminar !== null}
        onCerrar={() => setPorEliminar(null)}
        titulo="¿Eliminar responsable?"
        icono={TriangleAlert}
        tono="red"
        pie={
          <>
            <Button variante="outline" relieve onClick={() => setPorEliminar(null)}>Cancelar</Button>
            <Button
              variante="red"
              relieve
              icono={Trash2}
              onClick={() => {
                if (porEliminar) eliminarResponsable(porEliminar)
                setPorEliminar(null)
              }}
            >
              Sí, eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-tinta-2">
          Vas a eliminar a <strong>{porEliminar}</strong> de la lista. Las solicitudes que ya tenía asignadas conservan su nombre.
          Si solo quieres que no aparezca al asignar, usa «Desactivar».
        </p>
      </Modal>
    </Tarjeta>
  )
}

function Usuarios() {
  const { usuarios, agregarUsuario, cambiarRol, quitarUsuario } = useCatalogos()
  const { usuario: yo } = useAuth()
  const [correo, setCorreo] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState<Rol>('coordinador')
  const [error, setError] = useState('')
  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const msg = agregarUsuario({ correo, nombre, rol })
    setError(msg)
    if (!msg) {
      setCorreo('')
      setNombre('')
    }
  }
  return (
    <Tarjeta ancha titulo="Usuarios y roles" nota="Quién puede entrar y qué ve. Quien no está en la lista entra como solicitante.">
      <div className="mb-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[0.6875rem] font-bold tracking-wide text-tinta-3 uppercase">
              <th className="py-1.5">Nombre</th><th>Correo</th><th>Rol</th><th />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const esYo = u.correo === yo?.correo
              return (
                <tr key={u.correo} className="border-t border-linea">
                  <td className="py-2 pr-2">{u.nombre} {esYo && <Badge tono="purple">Tú</Badge>}</td>
                  <td className="pr-2 text-tinta-2">{u.correo}</td>
                  <td className="pr-2">
                    <select
                      aria-label={`Rol de ${u.nombre}`}
                      value={u.rol}
                      disabled={esYo}
                      onChange={(e) => cambiarRol(u.correo, e.target.value as Rol)}
                      className="rounded-md border border-linea-fuerte/60 bg-superficie px-2 py-1 text-sm disabled:opacity-50"
                    >
                      {roles.map((r) => <option key={r} value={r}>{nombreDeRol[r]}</option>)}
                    </select>
                  </td>
                  <td className="text-right">
                    <Button tamano="sm" variante="red" icono={Trash2} disabled={esYo} onClick={() => quitarUsuario(u.correo)} aria-label={`Quitar acceso a ${u.nombre}`}>
                      Quitar
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <form onSubmit={enviar} className="grid items-start gap-2 sm:grid-cols-[1fr_1fr_160px_auto]" noValidate>
        <CampoTexto etiqueta="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <CampoTexto etiqueta="Correo" placeholder="nombre@ucchristus.cl" value={correo} error={error} onChange={(e) => setCorreo(e.target.value)} />
        <CampoLista etiqueta="Rol" textoVacio="Rol" opciones={roles.map((r) => nombreDeRol[r])} value={nombreDeRol[rol]} onChange={(e) => setRol(roles.find((r) => nombreDeRol[r] === e.target.value) ?? 'solicitante')} />
        <Button type="submit" relieve icono={Plus} className="sm:mt-[1.6rem]">Agregar</Button>
      </form>
    </Tarjeta>
  )
}

export function Administracion() {
  return (
    <>
      <PageHeader titulo="Administración" subtitulo="Responsables, usuarios y reglas del portal." />
      <div className="grid gap-4 md:grid-cols-2">
        <Responsables />
        <Tarjeta titulo="Programas">
          <ul className="space-y-2 text-sm">
            {programas.map((p) => (
              <li key={p.sigla}><Badge tono="purple">{p.sigla}</Badge> <span className="ml-1">{p.nombre}</span></li>
            ))}
          </ul>
          <h3 className="mt-4 text-sm font-bold">Escalamiento</h3>
          <p className="mt-1 text-sm text-tinta-2">Pendiente por más de <strong>{HORAS_ESCALAMIENTO} horas</strong> → «Sin atender» y aviso a la jefatura de Humanización y Misión y RSE.</p>
        </Tarjeta>
        <Usuarios />
        <Tarjeta ancha titulo="Centros y servicios" nota="Elige dónde y escribe el servicio nuevo.">
          <CentrosYServicios />
        </Tarjeta>
      </div>
    </>
  )
}
