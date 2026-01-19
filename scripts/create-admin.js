// Script para crear un usuario administrador
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import pg from 'pg';

// Cargar variables de entorno del backend
dotenv.config({ path: './backend/.env' });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'noticias_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function createAdmin() {
  // Valores por defecto (puedes cambiar estos)
  const email = process.argv[2] || 'admin@noticias.com';
  const password = process.argv[3] || 'admin123';
  const role = 'admin';

  try {
    console.log('=== Creando Usuario Administrador ===\n');
    console.log(`Email: ${email}`);
    console.log(`Contraseña: ${password}`);
    console.log(`Rol: ${role}\n`);

    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  El usuario ya existe en la base de datos.');
      console.log('   Si quieres cambiar la contraseña, elimina el usuario primero o usa un email diferente.\n');
      
      const updatePassword = process.argv[4] === '--update-password';
      if (updatePassword) {
        console.log('Actualizando contraseña...');
        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query(
          'UPDATE users SET password_hash = $1 WHERE email = $2',
          [passwordHash, email]
        );
        console.log('✓ Contraseña actualizada correctamente\n');
      } else {
        console.log('Para actualizar la contraseña, ejecuta:');
        console.log(`  node scripts/create-admin.js ${email} ${password} --update-password\n`);
      }
      await pool.end();
      return;
    }

    // Hashear contraseña
    console.log('Hasheando contraseña...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario
    console.log('Insertando usuario en la base de datos...');
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [email, passwordHash, role]
    );

    const user = result.rows[0];
    
    console.log('\n✓ Usuario administrador creado exitosamente!\n');
    console.log('Detalles:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Rol: ${user.role}`);
    console.log(`  Creado: ${user.created_at}\n`);
    console.log('Ahora puedes iniciar sesión en: http://localhost:3000/admin/login\n');

  } catch (error) {
    console.error('✗ Error al crear usuario:', error.message);
    if (error.code === '23505') {
      console.error('  → El email ya está en uso');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('  → No se pudo conectar a PostgreSQL');
      console.error('  → Verifica que PostgreSQL esté corriendo');
    } else if (error.code === '3D000') {
      console.error('  → La base de datos no existe');
      console.error('  → Crea la base de datos: CREATE DATABASE noticias_db;');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();
