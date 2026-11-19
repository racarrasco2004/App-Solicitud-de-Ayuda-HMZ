# Portal de Apoyo Espiritual y Psicológico — UC CHRISTUS

Portal interno del área de **Humanización** para pedir y gestionar apoyo espiritual y psicológico
(programas **PAEC** y **PARES**, y acompañamiento espiritual para pacientes y familias).

Tiene dos perspectivas:

| Perspectiva | Quién | Qué hace |
|---|---|---|
| Solicitante | Colaborador de la red | Conoce los programas y pide apoyo paso a paso, para un paciente, un familiar, para sí mismo o para su equipo; ve sus solicitudes |
| Administrativa | Coordinador y administrador | Revisa solicitudes, asigna responsable, cambia estado, ve estadísticas y administra catálogos y usuarios |

> **Estado: demostración.** El inicio de sesión es simulado y los datos son de ejemplo (se guardan en el navegador).
> No usar con datos reales de pacientes hasta conectar Microsoft Entra ID y SharePoint.
> Ver `docs/DISENO_SHAREPOINT.md`.

## Cómo ejecutarlo

Requiere [Node.js](https://nodejs.org) (versión LTS).

```bash
npm install     # solo la primera vez
npm run dev     # abre http://localhost:5173
npm run build   # revisa que todo compile
```

En la pantalla de entrada, los botones de «Modo demostración» permiten entrar como Solicitante, Coordinador o Administrador.

## Reglas del negocio

- **Quien solicita siempre es un colaborador.** Los pacientes y familiares no entran al portal: el colaborador pide el apoyo por ellos.
- **PAEC y PARES** aplican solo cuando el apoyo es para un colaborador o un equipo. Para pacientes y familiares no hay programa.
- **Religión o creencia:** obligatoria cuando el apoyo es para un paciente o familiar; opcional para colaboradores.
- **PAEC de un colaborador** redirige a la agenda online (no se guarda solicitud).
- **UIC** solo informa (contactar al prevencionista de riesgos); no guarda ni deriva.
- **Escalamiento:** una solicitud pendiente por más de N horas se marca «Sin atender» y escala a la jefatura de Humanización.
  El plazo es **24 h** (definido por la jefatura) en `src/config/escalamiento.ts`.

## Estructura

```
src/
  assets/marca/      Logos oficiales (Humanización, Misión y RSE, PAEC, PARES, Asistencia Espiritual)
  components/        ui/ (botones, campos, modal...), layout/ (cabecera, ajustes), RutaProtegida
  config/            navegación y roles, programas, enlaces, escalamiento
  context/           Auth (sesión), Solicitudes, Catalogos (responsables y usuarios), Ajustes (lectura)
  data/              catálogos de centros y servicios, datos de ejemplo
  pages/             Inicio, Programas, NuevaSolicitud, MisSolicitudes, Solicitudes, Detalle, Estadísticas, Administración, Login
  services/          Acceso a datos (ver abajo)
  types/             Tipos de TypeScript
docs/                Diseño de la conexión con SharePoint
```

## Dónde cambiar cada cosa

- **Enlace de la agenda de PAEC:** `src/config/enlaces.ts`
- **Plazo de escalamiento:** `src/config/escalamiento.ts`
- **Textos de programas:** `src/config/programas.ts`
- **Centros y servicios:** se agregan o quitan desde **Administración → Centros y servicios**, sin tocar el código. `src/data/catalogos.ts` solo trae los datos iniciales (hoy solo los servicios del Hospital Clínico son reales)
- **Menú y qué rol ve qué:** `src/config/navegacion.ts`
- **Colores y tipografía:** `src/index.css`

## Conectar datos reales

Las pantallas no saben de dónde vienen los datos. Leen y escriben a través de
`src/services/solicitudesRepository.ts` (una «interfaz»). Hoy la implementa
`mockSolicitudesRepository.ts` (navegador). Para SharePoint se crea otra implementación y se cambia
una línea en `src/services/index.ts`. El plan está en `docs/DISENO_SHAREPOINT.md`.

## Tecnologías

React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · Recharts · lucide-react


## Novedades (noviembre)

- **Línea de tiempo de 4 pasos:** pides apoyo, le llega a un equipo, se asigna a tu contraparte, te contactamos.
- **Humanización y Misión y RSE** se nombran y se muestran siempre juntas (`src/config/marca.ts`, `LogosAreas`).
- **Escalamiento a 24 h** (`src/config/escalamiento.ts`) y aviso de horario hábil, lunes a viernes (`src/config/marca.ts`).
- **Anuncios:** tarjetas deslizantes con foto y texto en Inicio y Programas. Coordinador y administrador las crean, editan, ocultan y ordenan en la pestaña *Anuncios* (las fotos se guardan en el navegador; en producción irán a una biblioteca de SharePoint).
- **Programas:** los talleres grupales (Espacio Libre de Estrés) van dentro de PAEC. Las fotos de cada programa se cambian en `src/config/fotos.ts`.
