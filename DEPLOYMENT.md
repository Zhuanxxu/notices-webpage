# Guía de Deployment - Página de Noticias

Esta guía te ayudará a desplegar tu aplicación para que esté accesible online para pruebas.

## Opciones de Deployment

### Opción 1: Vercel (Frontend) + Render/Railway (Backend) - Recomendado

Esta es la opción más fácil y gratuita para empezar.

#### Frontend en Vercel

1. **Preparar el repositorio**
   - Asegúrate de que tu código esté en GitHub, GitLab o Bitbucket

2. **Desplegar en Vercel**
   - Ve a [vercel.com](https://vercel.com) y crea una cuenta
   - Haz clic en "New Project"
   - Importa tu repositorio
   - Configura el proyecto:
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend` (configúralo desde el panel, NO en vercel.json)
     - **Build Command**: `npm run build` (o deja el predeterminado)
     - **Output Directory**: `.next`
   
   **Nota importante**: El `rootDirectory` se configura desde el panel de configuración del proyecto en Vercel, no en el archivo `vercel.json`. El archivo `vercel.json` solo contiene configuraciones adicionales si son necesarias.
   
3. **Variables de Entorno en Vercel**
   - Ve a Settings > Environment Variables
   - Agrega:
     ```
     NEXT_PUBLIC_API_URL=https://tu-backend-url.com
     ```
   - Reemplaza `tu-backend-url.com` con la URL de tu backend (la obtendrás después de desplegar el backend)

4. **Desplegar**
   - Haz clic en "Deploy"
   - Espera a que termine el build
   - Tu frontend estará disponible en una URL como `tu-proyecto.vercel.app`

#### Backend en Render

1. **Crear cuenta en Render**
   - Ve a [render.com](https://render.com) y crea una cuenta gratuita

2. **Crear Base de Datos PostgreSQL**
   - En el dashboard, haz clic en "New +" > "PostgreSQL"
   - Configura:
     - **Name**: `pagina-noticias-db`
     - **Database**: `noticias_db`
     - **User**: `noticias_user`
     - **Region**: Elige la más cercana
   - Haz clic en "Create Database"
   - **IMPORTANTE**: Guarda las credenciales de conexión que te muestra

3. **Ejecutar migraciones en la base de datos**
   - Conecta a la base de datos usando las credenciales de Render
   - Ejecuta los scripts SQL en `database/schema.sql` y las migraciones

4. **Desplegar el Backend**
   - En el dashboard, haz clic en "New +" > "Web Service"
   - Conecta tu repositorio
   - Configura:
     - **Name**: `pagina-noticias-backend`
     - **Environment**: `Node`
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Plan**: Free

5. **Variables de Entorno en Render**
   - En la sección "Environment Variables", agrega:
     ```
     NODE_ENV=production
     PORT=3001
     DB_HOST=<host de tu base de datos de Render>
     DB_PORT=5432
     DB_NAME=noticias_db
     DB_USER=<usuario de tu base de datos>
     DB_PASSWORD=<contraseña de tu base de datos>
     FRONTEND_URL=https://tu-frontend.vercel.app
     JWT_SECRET=<genera uno seguro con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
     JWT_EXPIRES_IN=7d
     ```

6. **Desplegar**
   - Haz clic en "Create Web Service"
   - Espera a que termine el deployment
   - Tu backend estará disponible en una URL como `pagina-noticias-backend.onrender.com`

7. **Actualizar Frontend**
   - Vuelve a Vercel y actualiza la variable `NEXT_PUBLIC_API_URL` con la URL de tu backend
   - Haz un nuevo deployment

#### Backend en Railway (Alternativa)

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app) y crea una cuenta

2. **Crear Base de Datos PostgreSQL**
   - Haz clic en "New Project"
   - Selecciona "Add PostgreSQL"
   - Railway creará automáticamente la base de datos

3. **Desplegar el Backend**
   - Haz clic en "New" > "GitHub Repo"
   - Selecciona tu repositorio
   - Railway detectará automáticamente que es un proyecto Node.js
   - Configura:
     - **Root Directory**: `backend`
     - **Start Command**: `npm start`

4. **Variables de Entorno en Railway**
   - Ve a la pestaña "Variables"
   - Agrega todas las variables de entorno necesarias (igual que en Render)
   - Railway automáticamente expone las variables de la base de datos como `$PGHOST`, `$PGPORT`, etc.
   - Puedes usar estas variables o crear las tuyas propias

5. **Ejecutar migraciones**
   - Conecta a la base de datos usando las credenciales de Railway
   - Ejecuta los scripts SQL

### Opción 2: Render (Full Stack)

Puedes desplegar todo en Render usando el archivo `render.yaml`:

1. **Crear cuenta en Render**
2. **Crear un nuevo "Blueprint"**
3. **Conecta tu repositorio**
4. **Render detectará automáticamente el archivo `render.yaml`**
5. **Configura las variables de entorno**
6. **Despliega**

### Opción 3: Docker + Cualquier Plataforma

Si prefieres usar Docker:

1. **Construir la imagen**
   ```bash
   docker build -t pagina-noticias-backend .
   ```

2. **Ejecutar el contenedor**
   ```bash
   docker run -p 3001:3001 --env-file backend/.env pagina-noticias-backend
   ```

3. **Desplegar en plataformas que soporten Docker** (Railway, Render, Fly.io, etc.)

## Pasos Post-Deployment

### 1. Crear un usuario administrador

Una vez desplegado, necesitas crear un usuario administrador. Puedes hacerlo de dos formas:

**Opción A: Usando el script local**
```bash
# Configura las variables de entorno para apuntar a tu base de datos de producción
# Luego ejecuta:
npm run create-admin
```

**Opción B: Directamente en la base de datos**
```sql
-- Conecta a tu base de datos de producción
INSERT INTO users (username, email, password_hash, role, created_at)
VALUES (
  'admin',
  'admin@example.com',
  '$2b$10$...', -- Hash de bcrypt de tu contraseña
  'admin',
  NOW()
);
```

### 2. Verificar que todo funciona

1. Visita la URL de tu frontend
2. Intenta acceder a `/admin/login`
3. Inicia sesión con el usuario administrador
4. Verifica que puedes crear y editar artículos

### 3. Configurar CORS

Asegúrate de que el `FRONTEND_URL` en el backend coincida exactamente con la URL de tu frontend desplegado.

## Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que las credenciales de la base de datos sean correctas
- Asegúrate de que la base de datos esté accesible desde el servicio donde está tu backend
- En Render, verifica que el "Internal Database URL" esté configurado correctamente

### Error: "CORS policy"
- Verifica que `FRONTEND_URL` en el backend sea exactamente la URL de tu frontend (con https://)
- No incluyas la barra final `/` en la URL

### Error: "JWT_SECRET is required"
- Asegúrate de haber configurado `JWT_SECRET` en las variables de entorno
- Genera uno nuevo si es necesario

### Las imágenes no se cargan
- Verifica que el directorio `uploads` esté siendo servido correctamente
- En producción, considera usar un servicio de almacenamiento como AWS S3, Cloudinary, o similar

## Notas Importantes

1. **Base de Datos**: Los planes gratuitos de Render/Railway tienen limitaciones. Para producción real, considera un plan de pago.

2. **Almacenamiento de Archivos**: El directorio `uploads` en el backend puede no persistir en algunos servicios. Considera usar un servicio de almacenamiento en la nube.

3. **Variables de Entorno**: Nunca subas archivos `.env` al repositorio. Usa las variables de entorno de la plataforma de deployment.

4. **HTTPS**: Todas las plataformas mencionadas proporcionan HTTPS automáticamente.

5. **Dominio Personalizado**: Puedes configurar un dominio personalizado en Vercel y Render/Railway.

## Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Render](https://render.com/docs)
- [Documentación de Railway](https://docs.railway.app)
