# Checklist de Configuración

Usa esta lista para verificar que todo esté configurado correctamente antes de ejecutar el proyecto.

## ✅ Pre-requisitos

- [ ] PostgreSQL instalado y corriendo
- [ ] Node.js instalado (versión 16 o superior)
- [ ] npm instalado

## ✅ Base de Datos

- [ ] PostgreSQL está corriendo
- [ ] Base de datos `noticias_db` creada
- [ ] Schema ejecutado (`database/schema.sql`)
- [ ] Puedes conectarte a la base de datos con las credenciales configuradas

**Comandos para verificar:**
```bash
# Verificar que PostgreSQL está corriendo
psql -U agust -c "SELECT version();"

# Crear base de datos (si no existe)
psql -U agust -c "CREATE DATABASE noticias_db;"

# Ejecutar schema
psql -U agust -d noticias_db -f database\schema.sql

# Verificar tablas creadas
psql -U agust -d noticias_db -c "\dt"
```

## ✅ Archivos de Configuración

- [ ] `backend/.env` existe y tiene las credenciales correctas
- [ ] `frontend/.env.local` existe y tiene la URL del API

**Para crear los archivos .env:**
```powershell
# Ejecuta el script de configuración
.\setup.ps1
```

O crea manualmente:

**backend/.env:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=noticias_db
DB_USER=agust
DB_PASSWORD=112358
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=tu_secreto_jwt_muy_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=7d
```

**frontend/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## ✅ Dependencias

- [ ] Dependencias del proyecto raíz instaladas (`npm install`)
- [ ] Dependencias del backend instaladas (`cd backend && npm install`)
- [ ] Dependencias del frontend instaladas (`cd frontend && npm install`)

**Comando rápido:**
```bash
npm run install:all
```

## ✅ Verificación de Conexión

- [ ] Backend puede conectarse a PostgreSQL
- [ ] Frontend puede conectarse al backend

**Para probar:**
1. Inicia el backend: `npm run dev:backend`
2. Verifica que no haya errores de conexión a la base de datos
3. Visita `http://localhost:3001/api/health` - debería responder `{"status":"ok","message":"API is running"}`

## ✅ Ejecución

- [ ] Backend inicia sin errores en el puerto 3001
- [ ] Frontend inicia sin errores en el puerto 3000
- [ ] Puedes acceder a `http://localhost:3000`
- [ ] Puedes acceder a `http://localhost:3000/admin/login`

## 🔧 Solución de Problemas Comunes

### Error: "Cannot find module"
**Solución:** Instala las dependencias:
```bash
npm run install:all
```

### Error: "Connection refused" o "ECONNREFUSED"
**Solución:** 
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `backend/.env`
- Verifica que la base de datos `noticias_db` exista

### Error: "password authentication failed"
**Solución:**
- Verifica el usuario y contraseña en `backend/.env`
- Asegúrate de que el usuario PostgreSQL tenga permisos

### Error: "relation does not exist"
**Solución:**
- Ejecuta el schema: `psql -U agust -d noticias_db -f database\schema.sql`

### Frontend no se conecta al backend
**Solución:**
- Verifica que `frontend/.env.local` tenga `NEXT_PUBLIC_API_URL=http://localhost:3001`
- Verifica que el backend esté corriendo
- Verifica CORS en `backend/.env` (FRONTEND_URL)
