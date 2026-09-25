const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'directfarm';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT, 10) || 5432;
const dbLogging = process.env.DB_LOGGING === 'true' ? console.log : false;

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: dbLogging,
    pool: {
      max: 15,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: dbLogging,
    pool: {
      max: 15,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL database successfully via Sequelize');
    console.log(`📦 Database: ${dbName} at ${dbHost}:${dbPort}`);
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL database:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  dbConfig: {
    name: dbName,
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort
  }
};
