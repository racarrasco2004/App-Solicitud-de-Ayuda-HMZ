# Diseño de la conexión con SharePoint y Power Automate

Documento de trabajo. Lo marcado con **(pendiente)** necesita una decisión del área o de TI.

## 1. Idea general

```
 Portal React  ──(Graph API o API propia)──►  Listas de SharePoint  ──►  Power Automate ──► Correos / Teams
 (solicitante y administrativo)               (fuente única de datos)     (avisos y escalamiento)
```

- **SharePoint** guarda los datos (una lista principal y tres de catálogo).
- **El portal** muestra y edita esos datos. Solo cambia `src/services/index.ts`.
- **Power Automate** avisa y escala; el portal no envía correos.

## 2. Listas

### 2.1 `Solicitudes` (principal)

| Columna (nombre interno) | Tipo | Notas |
|---|---|---|
| `Title` | Texto, único, indexado | Código `SOL-2026-0001` (lo genera el portal o un flujo) |
| `FechaSolicitud` | Fecha y hora | También existe `Created`; se usa esta por claridad |
| `Estado` | Elección | Pendiente · En proceso · Cerrada (por defecto Pendiente) |
| `Programa` | Elección, opcional | PAEC · PARES. Vacío en pacientes y familiares |
| `TipoSolicitante` | Elección | Paciente · Familiar · Colaborador · Equipo |
| `TipoCentro` | Elección | Hospitales y clínicas · Centros médicos · Centros de especialidad · Red Áncora |
| `Centro` | Texto (o búsqueda a `Centros`) | Ej. Hospital Clínico UC CHRISTUS |
| `Servicio` | Texto | Ej. UCI u «Otro servicio / no lo sé» |
| `PersonaApoyo` | Texto, opcional | Paciente o familiar a quien se acompañará (solo si el apoyo es para ellos). **Dato personal** |
| `NombreContacto` | Texto | Colaborador que hace la solicitud. **Dato personal** |
| `Telefono` | Texto | Teléfono o anexo de quien solicita. **Dato personal** |
| `Religion` | Elección, opcional | **Dato sensible** |
| `Comentario` | Varias líneas, texto sin formato | **Dato sensible**; máx. 500 caracteres |
| `Responsable` | Búsqueda a `Responsables` | Vacío = por asignar |
| `FechaAsignacion` | Fecha y hora | La completa el portal al asignar |
| `FechaCierre` | Fecha y hora | La completa el portal al cerrar |
| `Escalada` | Sí/No | La marca el flujo F4 |
| `FechaEscalamiento` | Fecha y hora | La marca el flujo F4 |
| `CreadaPor` | Persona (o `Author`) | Quién la creó; sirve para «Mis solicitudes» |

### 2.2 Catálogos

- **`Responsables`**: `Title` (nombre), `Correo`, `Activo` (Sí/No). Hoy son 5 personas.
- **`Centros`**: `TipoCentro`, `Title` (centro), `Activo`.
- **`Servicios`**: `Centro` (búsqueda), `Title` (servicio), `Activo`.
- **Roles de usuario**: no van en lista; van en **grupos de seguridad de Entra ID** (ver 4).

### 2.3 Correspondencia con el código

| TypeScript (`Solicitud`) | Columna |
|---|---|
| `id` | `Title` |
| `fecha` | `FechaSolicitud` |
| `estado` | `Estado` |
| `programa` | `Programa` |
| `centro` | `TipoCentro` |
| `subcentro` | `Centro` |
| `servicio` | `Servicio` |
| `tipoSolicitante` | `TipoSolicitante` |
| `personaApoyo` | `PersonaApoyo` |
| `solicitante` | `NombreContacto` |
| `telefono` | `Telefono` |
| `religion` | `Religion` |
| `comentario` | `Comentario` |
| `responsable` | `Responsable` (nombre) |
| `creadaPor` | `CreadaPor` (correo) |

## 3. Cómo lee y escribe el portal

El portal ya usa una interfaz con tres operaciones. Cada una se traduce a una llamada de Microsoft Graph:

| Operación | Llamada |
|---|---|
| `listar()` | `GET /sites/{sitio}/lists/Solicitudes/items?expand=fields` |
| `crear(datos, creadaPor)` | `POST /sites/{sitio}/lists/Solicitudes/items` |
| `actualizar(id, cambios)` | `PATCH /sites/{sitio}/lists/Solicitudes/items/{itemId}/fields` |

Se crea `sharePointSolicitudesRepository.ts` con esa misma interfaz. Las pantallas no cambian.

## 4. Seguridad (lo más importante)

La lista guarda **teléfono, religión y comentarios**: datos personales y sensibles. No debe quedar abierta.

**Problema:** si el portal llama a SharePoint con el permiso del usuario, un solicitante necesitaría acceso a la lista, y desde el navegador podría ver filas de otros. Filtrar «Mis solicitudes» en la pantalla **no es seguridad**.

Dos caminos:

| | A. Permisos por elemento | B. API intermedia (recomendado) |
|---|---|---|
| Cómo | Un flujo quita la herencia de cada solicitud nueva y deja acceso solo al creador y al grupo Humanización | Una API pequeña (Azure Function) valida el rol y habla con SharePoint con permiso de aplicación |
| Seguridad | Buena | La mejor: el navegador nunca toca la lista |
| Esfuerzo | Medio, solo Power Automate | Mayor, requiere a Ingeniería de Software |
| Permiso Graph | Delegado | `Sites.Selected` (solo ese sitio) |

**Roles** con grupos de Entra ID **(pendiente: nombres y quién los administra)**:
`Humanizacion-Coordinadores` y `Humanizacion-Administradores`. Quien no está en ninguno es solicitante.

**Inicio de sesión:** Microsoft Entra ID con MSAL (`@azure/msal-react`). Requiere un **registro de aplicación** hecho por TI **(pendiente)**.

## 5. Flujos de Power Automate

Regla: los correos llevan **solo el código y un enlace** al portal. Nunca religión, teléfono ni comentario.

| Flujo | Cuándo | Qué hace |
|---|---|---|
| **F1 Nueva solicitud** | Se crea un elemento | Avisa al buzón de Humanización (código, tipo y centro) |
| **F2 Asignación** | Cambia `Responsable` | Avisa **solo a la persona asignada** (y a la jefatura en copia) |
| **F3 Cierre** | `Estado` pasa a Cerrada | Registra `FechaCierre`; aviso opcional a quien asignó |
| **F4 Escalamiento** | Cada hora | Busca `Estado = Pendiente` con más de **N horas**; marca `Escalada` y avisa a la jefatura de Humanización |

- **N horas: 24 h** (definido por la jefatura). El portal lo usa en `src/config/escalamiento.ts`; el flujo debe usar el mismo valor.
- **Jefatura destinataria: (pendiente)**, quién y qué correo.
- **Buzón emisor:** buzón compartido en Exchange Online (el buzón personal del práctico no admite la API REST).

## 6. Orden de trabajo sugerido

1. TI crea el sitio y las listas de la sección 2 (o lo hacemos juntos en un sitio de prueba).
2. Cargar catálogos reales: responsables, centros y servicios.
3. Definir la seguridad (sección 4) con TI e Ingeniería de Software.
4. Implementar el repositorio de SharePoint y probar en un entorno de prueba.
5. Crear flujos F1 y F2; después F3 y F4.
6. Inicio de sesión real con Entra ID.
7. Prueba piloto con datos ficticios y luego con el equipo.

## 7. Preguntas abiertas

1. ¿Qué sitio de SharePoint se usa y quién lo administra?
2. ¿Permisos por elemento (A) o API intermedia (B)?
3. ¿Qué grupos de Entra ID existirán para coordinadores y administradores?
4. ¿Plazo de escalamiento y jefatura que recibe el aviso?
5. ¿Dónde se publica el portal (servidor interno, Azure Static Web Apps, etc.)?
6. ¿Cuánto tiempo se conservan las solicitudes? Son datos personales y sensibles; conviene revisarlo con TI y el área legal.
7. ¿Existe un buzón compartido para enviar los correos?


## Anexo: Anuncios

Lista de SharePoint **Anuncios** (Título, Texto, Activo, Orden) y biblioteca de imágenes **ImagenesAnuncios**. El portal lee solo los activos, ordenados. Edición: roles coordinador y administrador. Hoy el portal los guarda en el navegador (`AnunciosContext`); se reemplaza igual que el repositorio de solicitudes.
