# Guía de Operación, Administración y Mantención
**Portal de Apoyo Emocional y Espiritual — Humanización y Misión y RSE (Red de Salud UC CHRISTUS)**

Este documento está dividido en dos partes:
1. **Manual de Administración (Sin código):** Dirigido a coordinadores y administradores de Humanización y Misión y RSE para gestionar centros, servicios, responsables, anuncios, textos y estadísticas.
2. **Manual Técnico de Continuidad:** Dirigido al área de TI o futuros practicantes que mantengan o desplieguen el código fuente.

---

## Parte I: Manual de Administración (Equipo Humanización y Misión y RSE)

### 1. Roles del Portal
* **Solicitante:** Cualquier colaborador con correo institucional `@ucchristus.cl` que no esté en la lista de privilegios. Puede ingresar solicitudes y revisar el estado de las propias en *Mis solicitudes*.
* **Coordinador:** Puede revisar todas las solicitudes, cambiar estados (*Pendiente*, *En proceso*, *Cerrada*), asignar responsables, publicar anuncios y consultar estadísticas.
* **Administrador:** Tiene acceso completo, incluyendo la pestaña **Administración** para editar catálogos, textos y permisos.

---

### 2. Cómo gestionar Centros y Servicios Clínicos
1. Ingresa a **Administración → Centros y servicios**.
2. **Paso 1:** Haz clic en el área correspondiente (*Hospitales y clínicas*, *Centros médicos*, *Centros de especialidad* o *Red Áncora*).
3. **Paso 2:** Selecciona el hospital o centro en la columna izquierda (o usa **Servicios comunes del área** si el servicio aplica a todos los centros de esa categoría).
4. **Paso 3:** En la columna derecha puedes:
   * Agregar un servicio individual o usar **Agregar varios a la vez** pegando una lista (uno por línea; el sistema evita duplicados automáticamente).
   * Consultar el **Glosario de siglas** (`MQ`, `UTIM`, `UPC`, `INCOR`, `UCO`, `TMT`, `PNI`, etc.) o filtrar escribiendo el nombre o sigla.
   * Eliminar servicios obsoletos con el ícono de papelera.

---

### 3. Cómo gestionar Responsables y Permisos
1. Ingresa a **Administración → Equipo y permisos**.
2. **Responsables de acompañamiento:**
   * Agrega nuevos integrantes escribiendo su nombre completo y su usuario o correo `@ucchristus.cl`.
   * Marca la casilla *"Darle también acceso como Coordinador"* para habilitar su ingreso al portal en un solo paso.
   * Si un integrante sale temporalmente, usa **Desactivar** en lugar de **Eliminar** para conservar su historial en las solicitudes antiguas.
3. **Usuarios y roles del portal:** Cambia el rol entre *Solicitante*, *Coordinador* y *Administrador* directamente desde la tabla.

---

### 4. Cómo editar Programas, Talleres, Horarios y Enlaces (Sin código)
1. Ingresa a **Administración → Programas y textos**:
   * **PAEC y PARES:** Selecciona el programa que deseas editar y actualiza su nombre, descripción o puntos clave (uno por línea).
   * **Talleres grupales y Religiones:** Edita las listas desplegables (un ítem por línea).
   * **Pasos de Inicio:** Actualiza los 4 pasos de la tarjeta *"Cómo avanzará tu solicitud"*.
2. Ingresa a **Administración → Reglas y respaldo**:
   * **Horas límite para escalamiento:** Define cuántas horas puede permanecer una solicitud en estado *Pendiente* antes de marcarse como *Sin atender* (por defecto: `24` horas).
   * **Enlace agenda online PAEC:** Actualiza la URL externa de Medilink si cambia en el futuro.
   * **Aviso de horario y Mensaje UIC:** Edita los avisos informativos que ven los usuarios.

---

### 5. Publicación de Anuncios y Estadísticas
* **Anuncios:** Desde la pestaña **Anuncios**, crea tarjetas con imagen y descripción, reordénalas con las flechas o desactívalas temporalmente sin borrarlas.
* **Estadísticas:** Filtra por período, área o programa, alterna el gráfico #6 entre *Por servicio* y *Por responsable*, revisa el **Mapa de calor** y descarga el reporte en formato **CSV (Excel)** con el botón superior derecho.

---

### 6. Respaldos y Migración de Configuración
En **Administración → Reglas y respaldo**, utiliza **Descargar respaldo completo (.json)** periódicamente y guarda el archivo en la carpeta compartida de OneDrive/SharePoint del equipo. Si cambias de computador o navegador, usa **Cargar respaldo desde archivo** para restaurar toda la configuración en segundos.

---

## Parte II: Manual Técnico y de Continuidad (TI / Futuros Practicantes)

### 1. Arquitectura del Proyecto
* **Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Recharts + MSAL (`@azure/msal-browser`).
* **Estructura principal en `src/`:**
  * `config/`: Valores por defecto y configuración de Entra ID (`microsoft.ts`), menú (`navegacion.ts`), programas (`programas.ts`) y escalamiento (`escalamiento.ts`).
  * `context/`: Estado global de la aplicación:
    * `AuthContext.tsx`: Autenticación Microsoft Entra ID (o modo demostración si faltan variables).
    * `SolicitudesContext.tsx`: Gestión CRUD de solicitudes vía `solicitudesRepository`.
    * `CatalogosContext.tsx`: Centros, servicios, responsables y usuarios.
    * `ConfiguracionPortalContext.tsx`: Textos, programas, talleres y reglas editables.
    * `AnunciosContext.tsx`: Carrusel de anuncios.
  * `services/`: Capa de persistencia (`solicitudesRepository`). Diseñada para desacoplar la interfaz del backend (SharePoint Online / Power Automate).

### 2. Ejecución en Desarrollo y Compilación
```bash
# 1. Instalar dependencias
npm install

# 2. Levantar servidor local de desarrollo
npm run dev

# 3. Verificar tipos y generar compilación de producción (carpeta dist/)
npm run build