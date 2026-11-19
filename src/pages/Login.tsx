import { ArrowRight, Info } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import edificio from '@/assets/edificio-uc-christus.jpg'
import { LogosAreas } from '@/components/LogosAreas'
import { Button } from '@/components/ui/Button'
import { CampoTexto } from '@/components/ui/Campos'
import { MICROSOFT_ACTIVO } from '@/config/microsoft'
import { nombreDeRol } from '@/config/navegacion'
import { useAuth } from '@/context/AuthContext'
import { useCatalogos } from '@/context/CatalogosContext'

export function Login() {
  const { usuario, cargando, errorMicrosoft, entrarConMicrosoft, entrar, entrarComo } = useAuth()
  const { usuarios } = useCatalogos()
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')

  if (usuario) return <Navigate to="/" replace />
  if (cargando) return <p className="p-8 text-center text-sm text-tinta-3" role="status">Verificando tu sesión…</p>

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const resultado = entrar(texto)
    if (!resultado.ok) setError(resultado.error)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Lado de marca */}
      <aside className="gradiente-marca relative flex min-h-56 flex-col justify-end overflow-hidden p-8 text-white lg:min-h-0 lg:p-14">
        <span className="hero-tech absolute inset-0 opacity-90" aria-hidden />
        <span className="rejilla absolute inset-0" aria-hidden />
        <img src={edificio} alt="" aria-hidden className="absolute inset-0 size-full object-cover opacity-25 mix-blend-luminosity" />
        <div className="relative max-w-md">
          <p className="fuente-cercana text-4xl leading-tight font-bold lg:text-5xl">Aquí estamos para acompañarte</p>
          <p className="mt-3 text-sm text-white/90">
            Portal de Apoyo Espiritual y Psicológico de la Red de Salud UC CHRISTUS, de Humanización y Misión y RSE.
          </p>
        </div>
      </aside>

      {/* Formulario */}
      <main className="fondo-puntos flex items-center justify-center bg-fondo p-6">
        <div className="cristal w-full max-w-md rounded-3xl p-7">
          <div className="mb-6 flex justify-center"><LogosAreas alto="h-14" className="p-2 shadow-sm ring-1 ring-linea" /></div>
          {MICROSOFT_ACTIVO ? (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-extrabold text-tinta">Iniciar sesión</h1>
                <p className="text-sm text-tinta-2">Entra con tu cuenta de UC CHRISTUS.</p>
              </div>
              <button
                type="button"
                onClick={entrarConMicrosoft}
                className="relieve flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-linea-fuerte bg-superficie px-5 py-3 text-sm font-semibold text-tinta hover:bg-superficie-2"
              >
                <svg width="20" height="20" viewBox="0 0 21 21" aria-hidden>
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                Iniciar sesión con Microsoft
              </button>
              {errorMicrosoft && (
                <p role="alert" className="rounded-lg border border-uc-red-borde bg-uc-red-light p-3 text-sm text-uc-red-texto">{errorMicrosoft}</p>
              )}
            </div>
          ) : (
          <form onSubmit={enviar} className="space-y-4" noValidate>
            <div>
              <h1 className="text-xl font-extrabold text-tinta">Iniciar sesión</h1>
              <p className="text-sm text-tinta-2">Entra con tu cuenta de UC CHRISTUS.</p>
            </div>
            <CampoTexto
              etiqueta="Correo UC CHRISTUS"
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value)
                setError('')
              }}
              error={error}
              ayuda="Puedes escribir tu correo completo o solo tu usuario."
              autoComplete="username"
              placeholder="nombre@ucchristus.cl"
            />
            <Button type="submit" relieve anchoCompleto tamano="lg" icono={ArrowRight}>
              Continuar
            </Button>

            <div className="rounded-2xl border border-uc-amber-borde bg-uc-amber-light p-3 text-xs text-uc-amber-texto">
              <p className="mb-1.5 flex items-center gap-1.5 font-bold">
                <Info size={14} aria-hidden /> Modo demostración
              </p>
              <p className="mb-2">Aún no hay contraseña ni conexión con Microsoft. Entra con un perfil de prueba:</p>
              <div className="flex flex-wrap gap-1.5">
                {usuarios.slice(0, 3).map((u) => (
                  <Button key={u.correo} tamano="sm" variante="outline" relieve onClick={() => entrarComo(u)}>
                    {nombreDeRol[u.rol]}
                  </Button>
                ))}
              </div>
            </div>
          </form>
          )}
          <p className="mt-6 text-center text-xs text-tinta-3">Plataforma de uso interno de la Red de Salud UC CHRISTUS.</p>
        </div>
      </main>
    </div>
  )
}
