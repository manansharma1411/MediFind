const path = require('path');
let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  bcrypt = require('../backend/node_modules/bcryptjs');
}

const { initDatabase, execute, query } = require('../backend/src/config/db');

async function runSeeder() {
  console.log('--- Initializing MediFind Database Seeder ---');
  await initDatabase();

  const passwordHash = await bcrypt.hash('admin123', 10);
  console.log('Generated admin password hash.');

  // Update or Insert admin account
  const existingUser = await query('SELECT * FROM users WHERE email = ?', ['admin@medifind.com']);
  if (existingUser && existingUser.length > 0) {
    await execute('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, 'admin@medifind.com']);
    console.log('Updated existing admin user password hash.');
  } else {
    await execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES ('System Administrator', 'admin@medifind.com', ?, 'admin')",
      [passwordHash]
    );
    console.log('Inserted fresh admin user into database.');
  }

  console.log('--- Database Seeding Successfully Completed! ---');
}

if (require.main === module) {
  runSeeder().catch(err => {
    console.error('Seeder Error:', err);
    process.exit(1);
  });
}

module.exports = { runSeeder };
