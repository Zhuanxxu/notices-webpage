# Inicio Rápido - Página de Noticias

## ✅ Estado Actual

- ✓ Base de datos configurada y conectada
- ✓ Backend funcionando en puerto 3001
- ✓ Frontend compilando correctamente
- ✓ Todas las dependencias instaladas

## 🚀 Ejecutar el Proyecto

### Opción 1: Ambos servidores (Recomendado)
```bash
npm run dev
```

Esto iniciará:
- Backend en http://localhost:3001
- Frontend en http://localhost:3000

### Opción 2: Por separado

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🔍 Verificar que Todo Funciona

1. **Backend Health Check:**
   - Abre: http://localhost:3001/api/health
   - Debería mostrar: `{"status":"ok","message":"API is running"}`

2. **Frontend:**
   - Abre: http://localhost:3000
   - Debería mostrar la página principal

3. **Panel Admin:**
   - Abre: http://localhost:3000/admin/login
   - Debería mostrar el formulario de login

## 📝 Primeros Pasos

1. **Crear un usuario administrador:**
   ```bash
   # Usuario por defecto (admin@noticias.com / admin123)
   npm run create-admin
   
   # O personalizado
   node scripts/create-admin.js tu-email@ejemplo.com tu-contraseña
   ```

2. **Iniciar sesión:**
   - Ve a http://localhost:3000/admin/login
   - Usa las credenciales que creaste
   - Email: `admin@noticias.com`
   - Contraseña: `admin123` (si usaste los valores por defecto)

3. **Crear tu primera noticia:**
   - En el panel admin, haz clic en "Nueva Noticia"
   - Completa el formulario y guarda

## ⚠️ Si Algo No Funciona

### Error: "EADDRINUSE: address already in use :::3001"
**El puerto 3001 está ocupado por otro proceso.**

**Solución rápida:**
```powershell
.\kill-port.ps1
```

O manualmente:
```powershell
# Ver qué proceso usa el puerto 3001
Get-NetTCPConnection -LocalPort 3001

# Terminar todos los procesos Node.js
Get-Process -Name node | Stop-Process -Force
```

### Backend no inicia
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `backend/.env`
- Verifica que la base de datos `noticias_db` exista
- Si el puerto está en uso, ejecuta `.\kill-port.ps1`

### Frontend no inicia
- Verifica que el backend esté corriendo
- Verifica `frontend/.env.local` tiene `NEXT_PUBLIC_API_URL=http://localhost:3001`
- Limpia la caché: `cd frontend && rm -rf .next && npm run dev`

### Error de conexión (ECONNREFUSED, ECONNRESET)
- **Primero:** Asegúrate de que el backend esté corriendo correctamente
- Verifica que ambos servidores estén corriendo
- Verifica CORS en `backend/.env` (FRONTEND_URL)
- Si el backend falla al iniciar por puerto ocupado, ejecuta `.\kill-port.ps1`

### Error: "npm error code ENOWORKSPACES"
Este es un warning de npm, no es crítico. El frontend debería funcionar de todas formas. Si persiste:
```bash
cd frontend
npm run dev
```

## 📚 Documentación Adicional

- `CHECKLIST.md` - Lista de verificación completa
- `ENV_SETUP.md` - Configuración de variables de entorno
- `README.md` - Documentación completa del proyecto
