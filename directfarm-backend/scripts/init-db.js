const { Client } = require('pg');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'directfarm';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT, 10) || 5432;

async function initDatabase() {
  console.log('🔄 Initializing PostgreSQL Database...');
  console.log(`📡 Connecting to PostgreSQL at ${dbHost}:${dbPort} as ${dbUser}...`);

  // Step 1: Connect to default 'postgres' database to verify/create target DB
  const defaultClient = new Client({
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    database: 'postgres'
  });

  try {
    await defaultClient.connect();
    console.log('✅ Connected to PostgreSQL server.');

    // Check if database exists
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1;`;
    const res = await defaultClient.query(checkDbQuery, [dbName]);

    if (res.rowCount === 0) {
      console.log(`🌱 Database "${dbName}" does not exist. Creating...`);
      await defaultClient.query(`CREATE DATABASE "${dbName}";`);
      console.log(`🎉 Database "${dbName}" created successfully!`);
    } else {
      console.log(`📦 Database "${dbName}" exists.`);
    }
  } catch (err) {
    console.error('⚠️ PostgreSQL connection/creation warning:', err.message);
  } finally {
    await defaultClient.end();
  }

  // Step 2: Sync Sequelize models to create all tables cleanly
  try {
    console.log(`🔄 Synchronizing Sequelize models with "${dbName}"...`);
    const { sequelize } = require('../models');

    await sequelize.authenticate();
    console.log('✅ Sequelize authenticated with target database.');

    // Clean schema to avoid conflicts with legacy/stale columns
    try {
      await sequelize.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      await sequelize.query(`GRANT ALL ON SCHEMA public TO "${dbUser}";`);
      await sequelize.query('GRANT ALL ON SCHEMA public TO public;');
      console.log('🧹 Cleaned public schema for fresh table generation.');
    } catch (dropErr) {
      console.log('Notice on schema reset:', dropErr.message);
    }

    await sequelize.sync({ force: true });
    console.log('✅ All SQL tables created and synchronized successfully:');
    console.log('   - users');
    console.log('   - farmers');
    console.log('   - buyers');
    console.log('   - products');
    console.log('   - orders');
    console.log('   - order_items');
    console.log('   - chat_rooms');
    console.log('   - messages');
    console.log('   - negotiations');
    console.log('   - notifications');
    console.log('   - ratings');
    console.log('   - activity_logs');
    console.log('   - login_logs');
    console.log('   - complaints');
    console.log('   - feedbacks');
    console.log('   - locations');
    console.log('   - pending_registrations');
    console.log('   - success_stories');
    console.log('   - transactions');
    console.log('\n🌟 Database is ready to use and view inside pgAdmin 4!');
  } catch (syncError) {
    console.error('❌ Error synchronizing Sequelize models:', syncError);
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = initDatabase;
