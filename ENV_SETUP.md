# Configuración de Variables de Entorno

Este proyecto requiere archivos `.env` para funcionar correctamente. Sigue las instrucciones a continuación.

## Backend (.env)

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=noticias_db
DB_USER=agust
DB_PASSWORD=112358

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=tu_secreto_jwt_muy_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=7d
```

### Variables del Backend:

- **DB_HOST**: Host de PostgreSQL (por defecto: localhost)
- **DB_PORT**: Puerto de PostgreSQL (por defecto: 5432)
- **DB_NAME**: Nombre de la base de datos (por defecto: noticias_db)
- **DB_USER**: Usuario de PostgreSQL. Para encontrarlo:
  - Opción 1: Intenta con `postgres` (usuario por defecto más común)
  - Opción 2: Usa tu nombre de usuario de Windows (en tu caso: `agust`)
  - Opción 3: Ejecuta `psql -U postgres -c "\du"` para ver los usuarios disponibles
  - Opción 4: Si instalaste PostgreSQL con instalador gráfico, revisa la configuración de instalación
- **DB_PASSWORD**: Contraseña de PostgreSQL que configuraste durante la instalación
- **PORT**: Puerto donde correrá el servidor backend (por defecto: 3001)
- **FRONTEND_URL**: URL del frontend para CORS (por defecto: http://localhost:3000)
- **JWT_SECRET**: Secreto para firmar los tokens JWT (¡IMPORTANTE: cambiar en producción!)
- **JWT_EXPIRES_IN**: Tiempo de expiración de los tokens (por defecto: 7d)

## Frontend (.env.local)

Crea un archivo `.env.local` en la carpeta `frontend/` con el siguiente contenido:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Variables del Frontend:

- **NEXT_PUBLIC_API_URL**: URL del backend API (por defecto: http://localhost:3001)

## Notas Importantes

1. **JWT_SECRET**: En producción, usa un secreto fuerte y aleatorio. Puedes generarlo con:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Base de Datos**: Asegúrate de que PostgreSQL esté corriendo y que la base de datos `noticias_db` exista. Puedes crearla con:
   ```sql
   CREATE DATABASE noticias_db;
   ```
   
   Para conectarte a PostgreSQL y crear la base de datos, prueba:
   ```bash
   # Opción 1: Con usuario postgres
   psql -U postgres
   
   # Opción 2: Con tu usuario de Windows
   psql -U agust
   
   # Opción 3: Sin especificar usuario (usa el usuario actual)
   psql
   ```
   
   Una vez conectado, ejecuta:
   ```sql
   CREATE DATABASE noticias_db;
   \q
   ```

3. **Seguridad**: Nunca subas los archivos `.env` al repositorio. Ya deberían estar en `.gitignore`.
