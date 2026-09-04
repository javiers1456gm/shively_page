## Formulario de Contacto → Power Automate → Correo

Este sitio envía los datos del formulario de contacto mediante una arquitectura sin backend tradicional (sin PHP, sin credenciales SMTP en el código), aprovechando Vercel Serverless Functions y Power Automate.

### Arquitectura

```
Formulario HTML (shivelybros.mx)
        ↓  fetch POST
API Vercel (/api/contacto)
        ↓  fetch POST (server-side)
Power Automate — "When an HTTP request is received"
        ↓
Send an email (V2) → ventasmx@shivelybros.com
```

La URL real del flujo de Power Automate **nunca se expone al navegador del cliente**; solo vive en el servidor (Vercel) como variable de entorno.

### Archivos relevantes

| Archivo | Función |
|---|---|
| `api/contacto.ts` | Serverless Function (formato nativo Vercel, `@vercel/node`). Valida los campos, revisa el honeypot y reenvía el payload a Power Automate. |
| `js/contact-form.js` | Cliente JS compartido por todos los formularios del sitio. Hace `fetch('/api/contacto')` con los datos capturados, incluyendo el campo `origen` según la página. |
| `.env.example` | Documenta la variable de entorno requerida (`POWER_AUTOMATE_URL`), sin exponer el valor real. |
| `package.json` | Incluye `@vercel/node` como `devDependency` para que Vercel resuelva los tipos de `VercelRequest`/`VercelResponse`. |

### Variable de entorno requerida

En **Vercel → Settings → Environment Variables**:

| Key | Tipo | Environments | Descripción |
|---|---|---|---|
| `POWER_AUTOMATE_URL` | `Secret` | Production (y Preview si aplica) | URL completa del trigger HTTP del flujo de Power Automate. Incluye una firma (`sig=...`) que actúa como credencial — **tratarla como contraseña**. |

⚠️ Cambiar esta variable **no afecta deployments ya existentes**. Después de crearla o actualizarla es necesario hacer **Redeploy** desde la pestaña *Deployments* para que el nuevo valor se inyecte en el build.

### Payload esperado por la API

```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@empresa.com",
  "telefono": "8441234567",
  "empresa": "ABC Manufacturing",
  "mensaje": "Necesito una cotización",
  "origen": "Herramientas de Corte",
  "website": ""
}
```

- `nombre`, `correo`, `telefono`, `empresa`, `mensaje`, `origen` son **obligatorios**.
- `website` es un campo **honeypot** oculto vía CSS: si llega con contenido, la API rechaza la solicitud (`400`) sin reenviarla a Power Automate. Sirve como filtro anti-spam sin necesidad de reCAPTCHA.
- `origen` identifica desde qué landing page llegó el prospecto (ej. `Abrasivos`, `Filtración`, `Herramientas de Corte`), para que el equipo de ventas sepa qué producto interesó al cliente.

### El flujo de Power Automate

- **Nombre:** `Formulario Contacto - Shively Bros MX`
- **Dueño / owner:** `jmorales@shivelybros.com` (requiere licencia Power Automate Premium, ya que el trigger HTTP es un conector premium)
- **Trigger:** `When an HTTP request is received` — configurado con `Who can trigger the flow: Anyone` (la seguridad recae en la firma `sig` de la URL, ya que la llamada la hace un servidor, no un usuario final)
- **Acción:** `Send an email (V2)` → `ventasmx@shivelybros.com` (lista de distribución), usando el contenido dinámico de cada campo del payload en el asunto y cuerpo del correo.

**Para regenerar la URL** (por ejemplo, si se sospecha que se filtró): abrir el flujo en [make.powerautomate.com](https://make.powerautomate.com) → editar el trigger HTTP → guardar de nuevo genera una nueva firma. Actualizar inmediatamente `POWER_AUTOMATE_URL` en Vercel y hacer Redeploy.

### Cómo probar

**1. Prueba end-to-end (recomendada):**
Llenar el formulario real en el sitio y confirmar:
- Redirección a `gracias.html`.
- Llegada del correo a `ventasmx@shivelybros.com` con asunto `Nuevo contacto desde shivelybros.mx - [origen]`.

**2. Prueba directa a la API** (requiere red sin restricciones de firewall/proxy corporativo tipo Fortinet, que puede bloquear `curl`/`Invoke-RestMethod` aunque el navegador funcione normal):

```powershell
$body = @{
    nombre   = "Prueba"
    correo   = "prueba@correo.com"
    telefono = "8441234567"
    empresa  = "Shively Bros"
    mensaje  = "Mensaje de prueba"
    origen   = "Prueba manual"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://www.shivelybros.mx/api/contacto" -Method POST -ContentType "application/json" -Body $body
```

Respuesta esperada: `{"success": true}`.

**3. Prueba del honeypot** (debe rechazarse sin llegar a Power Automate):

```powershell
$body = @{
    nombre   = "Bot"
    correo   = "bot@correo.com"
    telefono = "0000000000"
    empresa  = "X"
    mensaje  = "spam"
    origen   = "Prueba"
    website  = "http://spam.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://www.shivelybros.mx/api/contacto" -Method POST -ContentType "application/json" -Body $body
```

Respuesta esperada: `{"success": false, "message": "Solicitud no válida."}`.

### Pendientes / mejoras futuras

- [ ] Guardar cada contacto también en una lista de SharePoint (respaldo histórico, independiente de la lista de distribución de correo).
- [ ] Confirmar el valor de `origen` en todas las landing pages (abrasivos, filtración, herramientas de corte, etc.).
- [ ] Evaluar agregar notificación a Teams como paso adicional en el flujo.
