# Quick Start - Deployment Rápido

Esta es una guía rápida para desplegar tu aplicación en menos de 30 minutos.

## Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté en GitHub
2. Haz commit y push de todos los cambios

## Paso 2: Desplegar Backend en Render (10 minutos)

1. Ve a [render.com](https://render.com) y crea cuenta (gratis)
2. Click en "New +" > "PostgreSQL"
   - Name: `pagina-noticias-db`
   - Database: `noticias_db`
   - User: `noticias_user`
   - Click "Create Database"
   - **GUARDA** las credenciales que te muestra

3. Click en "New +" > "Web Service"
   - Conecta tu repositorio de GitHub
   - Name: `pagina-noticias-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Free

4. En "Environment Variables", agrega:
   ```
   NODE_ENV=production
   PORT=3001
   DB_HOST=<del panel de tu base de datos>
   DB_PORT=5432
   DB_NAME=noticias_db
   DB_USER=<del panel de tu base de datos>
   DB_PASSWORD=<del panel de tu base de datos>
   FRONTEND_URL=https://tu-proyecto.vercel.app (lo actualizarás después)
   JWT_SECRET=<genera con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   JWT_EXPIRES_IN=7d
   ```

5. Click "Create Web Service"
6. Espera a que termine el deployment
7. **Copia la URL** de tu backend (ej: `pagina-noticias-backend.onrender.com`)

## Paso 3: Configurar Base de Datos (5 minutos)

1. En Render, ve a tu base de datos PostgreSQL
2. Click en "Connect" y copia el "Internal Database URL"
3. Conéctate usando psql o un cliente como pgAdmin
4. Ejecuta los scripts SQL:
   - `database/schema.sql`
   - `database/migration_add_article_excerpt.sql`
   - `database/migration_add_cover_image.sql`
   - `database/migration_add_media_logo.sql`
   - `database/migration_add_tags_and_location.sql`

## Paso 4: Desplegar Frontend en Vercel (10 minutos)

1. Ve a [vercel.com](https://vercel.com) y crea cuenta
2. Click "New Project"
3. Importa tu repositorio de GitHub
4. Configura:
   - Framework Preset: **Next.js**
   - Root Directory: **frontend**
   - Build Command: (déjalo por defecto)
   - Output Directory: (déjalo por defecto)

5. En "Environment Variables", agrega:
   ```
   NEXT_PUBLIC_API_URL=https://pagina-noticias-backend.onrender.com
   ```
   (Usa la URL de tu backend de Render)

6. Click "Deploy"
7. Espera a que termine
8. **Copia la URL** de tu frontend (ej: `pagina-noticias.vercel.app`)

## Paso 5: Actualizar Backend con URL del Frontend (2 minutos)

1. Vuelve a Render > tu backend
2. Ve a "Environment Variables"
3. Actualiza `FRONTEND_URL` con la URL de Vercel:
   ```
   FRONTEND_URL=https://pagina-noticias.vercel.app
   ```
4. Render reiniciará automáticamente el servicio

## Paso 6: Crear Usuario Administrador (3 minutos)

**Opción A: Desde tu máquina local**
```bash
# Configura temporalmente backend/.env con las credenciales de producción
# Luego ejecuta:
npm run create-admin
```

**Opción B: Directamente en la base de datos**
```sql
-- Conecta a tu base de datos de Render
-- Genera el hash de la contraseña (ejemplo para "admin123"):
-- Puedes usar: node -e "const bcrypt=require('bcrypt');bcrypt.hash('admin123',10).then(h=>console.log(h))"

INSERT INTO users (username, email, password_hash, role, created_at)
VALUES (
  'admin',
  'admin@example.com',
  '$2b$10$...', -- Hash de tu contraseña
  'admin',
  NOW()
);
```

## Paso 7: Verificar que Funciona

1. Visita la URL de tu frontend
2. Ve a `/admin/login`
3. Inicia sesión con tu usuario administrador
4. ¡Listo! Tu aplicación está online 🎉

## URLs Importantes

- **Frontend**: `https://tu-proyecto.vercel.app`
- **Backend API**: `https://pagina-noticias-backend.onrender.com`
- **Health Check**: `https://pagina-noticias-backend.onrender.com/api/health`

## Notas

- Los planes gratuitos pueden tener "cold starts" (el servicio se duerme después de inactividad)
- Render puede tardar 30-60 segundos en despertar el servicio
- Considera un plan de pago para producción real

## Solución de Problemas Rápida

**Error de CORS**: Verifica que `FRONTEND_URL` en el backend sea exactamente la URL de Vercel (con https://)

**Error de base de datos**: Verifica que las credenciales en Render sean correctas

**No puedo iniciar sesión**: Asegúrate de haber creado el usuario administrador en la base de datos
