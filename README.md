# Shively Bros México - Preview Bootstrap

Proyecto segmentado para preview en VS Code.

## Archivos principales
- `index.html`: estructura HTML principal.
- `css/styles.css`: estilos globales y secciones.
- `js/main.js`: animaciones, scroll y botón volver arriba.

## Cómo previsualizar
Abre `index.html` con Live Server en VS Code.

## Formulario de contacto

Los formularios envían sus datos a `/api/contacto`, que valida la información y la reenvía a Power Automate.

En Vercel configura la variable de entorno `POWER_AUTOMATE_URL` con la URL del webhook. El archivo `.env.example`
documenta la variable esperada para desarrollo local; no agregues la URL real al repositorio.
