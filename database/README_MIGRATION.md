# Migración: Agregar campo cover_image

Para agregar el campo `cover_image` a la tabla `articles`, ejecuta el siguiente comando SQL:

```sql
ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500);
```

O ejecuta el archivo de migración:

```bash
psql -U tu_usuario -d tu_base_de_datos -f migration_add_cover_image.sql
```
