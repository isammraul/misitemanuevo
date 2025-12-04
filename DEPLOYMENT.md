# 🚀 Guía de Deployment - Backend Automático

## Paso 1: Crear cuenta en Vercel (si no tienes)

1. Ve a https://vercel.com/signup
2. Haz clic en "Continue with GitHub"
3. Autoriza a Vercel

## Paso 2: Importar el proyecto

1. En Vercel, haz clic en "Add New" → "Project"
2. Busca el repositorio `aulas` y haz clic en "Import"
3. En la configuración:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## Paso 3: Configurar Variables de Entorno

Antes de hacer deploy, haz clic en "Environment Variables" y agrega:

| Name | Value |
|------|-------|
| `GITHUB_TOKEN` | Tu token de GitHub (el que te di antes) |
| `GIST_ID` | `4eef79d272bdff63e7018c1c9803eb39` |
| `ADMIN_KEY` | `mi_clave_secreta_123` (puedes cambiarlo) |

**Importante**: Marca las tres como "Production", "Preview" y "Development"

## Paso 4: Deploy

1. Haz clic en "Deploy"
2. Espera 1-2 minutos
3. Una vez completado, copia la URL que te da (ejemplo: `https://aulas-xyz123.vercel.app`)

## Paso 5: Actualizar la URL del Backend

1. Abre `src/components/AulasAnalyzer.jsx`
2. Busca la línea:
   ```javascript
   const BACKEND_URL = 'https://tu-proyecto.vercel.app';
   ```
3. Reemplázala con tu URL real:
   ```javascript
   const BACKEND_URL = 'https://aulas-xyz123.vercel.app';
   ```

## Paso 6: Rebuild y Deploy GitHub Pages

1. En tu terminal ejecuta:
   ```bash
   npm run build
   npx gh-pages -d dist
   ```

## ✅ ¡Listo!

Ahora cuando subas un archivo como admin en https://isammraul.github.io/aulas/?admin=true:
- Los datos se actualizarán automáticamente en el Gist
- Todos los usuarios verán la información actualizada
- No necesitas hacer nada manual

---

## Troubleshooting

### Si el deploy falla:
- Verifica que las variables de entorno estén bien escritas
- Asegúrate de que el token de GitHub sea válido

### Si no actualiza los datos:
- Verifica que la `BACKEND_URL` sea correcta
- Revisa la consola del navegador para ver errores
- Verifica que `ADMIN_KEY` coincida en ambos lugares
