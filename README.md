# Página de Noticias - Ground.news Style

Web de noticias autogestionable similar a Ground.news donde editores pueden agregar noticias, coberturas de medios externos, clasificarlas por sesgo político y agregar redacción editorial propia.

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Autenticación**: JWT
- **Base de Datos**: PostgreSQL

## Estructura del Proyecto

```
/
├── frontend/          # Next.js app
│   ├── app/          # App Router (páginas públicas y admin)
│   ├── components/   # Componentes reutilizables
│   └── lib/          # Utilidades y clientes API
├── backend/          # Express API
│   ├── routes/       # Rutas de API
│   ├── models/       # Modelos de base de datos
│   ├── middleware/   # Auth, validación, etc.
│   └── controllers/  # Lógica de negocio
├── database/         # Migraciones y seeds
└── shared/           # Tipos TypeScript compartidos
```

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm run install:all
```

### 2. Configurar Base de Datos

1. Crear una base de datos PostgreSQL llamada `noticias_db`
2. Ejecutar el script de esquema:
   ```bash
   psql -U postgres -d noticias_db -f database/schema.sql
   ```

### 3. Configurar Variables de Entorno

**Backend** (`backend/.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=noticias_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Ejecutar el Proyecto

**Desarrollo (ambos servidores)**:
```bash
npm run dev
```

**Solo Backend**:
```bash
npm run dev:backend
```

**Solo Frontend**:
```bash
npm run dev:frontend
```

## Funcionalidades

### Para Editores/Admins

- Autenticación con JWT
- Panel de administración en `/admin`
- Crear/editar/eliminar noticias
- Agregar coberturas de medios externos
- Clasificar noticias por sesgo político (izquierda/centro/derecha)
- Agregar redacción editorial propia
- Publicar/despublicar noticias

### Para Usuarios Públicos

- Ver lista de noticias publicadas
- Ver detalle de noticia con:
  - Contenido principal
  - Redacción editorial
  - Coberturas de medios externos agrupadas por sesgo
  - Gráfico de distribución de sesgos
- Filtros básicos (por sesgo, fecha)

## Crear Usuario Administrador

Para crear un usuario administrador, ejecuta:

```bash
# Usuario por defecto (admin@noticias.com / admin123)
npm run create-admin

# Usuario personalizado
node scripts/create-admin.js tu-email@ejemplo.com tu-contraseña
```

**Nota:** La contraseña se hashea automáticamente usando bcrypt. Si el usuario ya existe, puedes actualizar la contraseña con:

```bash
node scripts/create-admin.js tu-email@ejemplo.com nueva-contraseña --update-password
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obtener usuario actual

### Artículos
- `GET /api/articles` - Listar artículos
- `GET /api/articles/:id` - Obtener artículo por ID
- `GET /api/articles/slug/:slug` - Obtener artículo por slug
- `POST /api/articles` - Crear artículo (requiere auth)
- `PUT /api/articles/:id` - Actualizar artículo (requiere auth)
- `DELETE /api/articles/:id` - Eliminar artículo (requiere auth)

### Medios
- `GET /api/media-sources` - Listar medios
- `POST /api/media-sources` - Crear medio (requiere auth)

### Coberturas
- `GET /api/coverages/article/:articleId` - Obtener coberturas de un artículo
- `POST /api/coverages` - Crear cobertura (requiere auth)
- `DELETE /api/coverages/:id` - Eliminar cobertura (requiere auth)

### Clasificaciones
- `GET /api/classifications/article/:articleId` - Obtener clasificación de un artículo
- `POST /api/classifications` - Crear/actualizar clasificación (requiere auth)

## Desarrollo

El proyecto está configurado para desarrollo con hot-reload tanto en frontend como backend.

## Deployment

Para desplegar la aplicación online y hacerla accesible para pruebas, consulta la [Guía de Deployment](./DEPLOYMENT.md).

### Resumen Rápido

1. **Frontend**: Despliega en [Vercel](https://vercel.com) (gratis y optimizado para Next.js)
2. **Backend**: Despliega en [Render](https://render.com) o [Railway](https://railway.app) (planes gratuitos disponibles)
3. **Base de Datos**: Usa PostgreSQL de Render/Railway o una base de datos externa

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas paso a paso.