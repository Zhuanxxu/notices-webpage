// Script para ejecutar migraciones
import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './backend/.env' });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'noticias_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigration() {
  const migrationFile = process.argv[2] || 'migration_add_cover_image.sql';
  const migrationPath = path.join(__dirname, '..', 'database', migrationFile);

  try {
    console.log('=== Ejecutando Migración ===\n');
    console.log(`Archivo: ${migrationFile}\n`);

    if (!fs.existsSync(migrationPath)) {
      console.error(`✗ El archivo de migración no existe: ${migrationPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('SQL a ejecutar:');
    console.log(sql);
    console.log('');

    await pool.query(sql);

    console.log('✓ Migración ejecutada exitosamente!\n');

    // Verificar que la columna existe
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'cover_image'
    `);

    if (result.rows.length > 0) {
      console.log('✓ Columna cover_image verificada:');
      console.log(`  Tipo: ${result.rows[0].data_type}\n`);
    }

  } catch (error) {
    console.error('✗ Error al ejecutar migración:', error.message);
    if (error.code === '42703') {
      console.error('  → La columna ya existe o hay un error en el SQL');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('  → No se pudo conectar a PostgreSQL');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
