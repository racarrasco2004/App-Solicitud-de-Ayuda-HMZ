# Inicio de sesión con Microsoft

El portal usa **Microsoft Entra ID** (la cuenta de UC CHRISTUS). Sin esta configuración funciona en modo demostración.

## Lo que debe hacer TI (10 minutos)

1. Entra al portal de Azure → **Microsoft Entra ID → Registros de aplicaciones → Nuevo registro**.
2. Nombre: `Portal de Apoyo Espiritual y Psicológico`. Tipo de cuenta: **solo este directorio** (un solo inquilino).
3. En **URI de redirección** elige la plataforma **Aplicación de página única (SPA)** y agrega:
   - `http://localhost:5173` (para desarrollo)
   - la dirección donde se publicará el portal (cuando exista)
4. En **Permisos de API** deja `Microsoft Graph → User.Read` (delegado). No requiere consentimiento de administrador.
5. Entrega estos dos datos a quien desarrolla: **Id. de aplicación (cliente)** e **Id. de directorio (inquilino)**.

## Lo que haces tú

1. Copia `.env.example` como `.env.local` y completa:
   - `VITE_ENTRA_CLIENT_ID`
   - `VITE_ENTRA_TENANT_ID`
   - `VITE_ADMINISTRADORES` con tu correo, para entrar como administrador.
2. Reinicia `npm run dev`. La pantalla de inicio mostrará **Iniciar sesión con Microsoft**.
3. En el hosting (Netlify, Vercel u otro) crea esas mismas variables y vuelve a publicar.

## Cómo se asignan los roles

- Cualquier persona de UC CHRISTUS que entre queda como **solicitante**.
- Quien esté en **Administración → Usuarios y roles** toma el rol que tenga asignado.
- Los correos de `VITE_ADMINISTRADORES` siempre son administradores.
- Hoy la lista de usuarios se guarda en el navegador. Con SharePoint pasará a ser una lista compartida y los roles valdrán para todos.
