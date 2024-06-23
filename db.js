const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  }); // creating new pool connection variable

const dbConnect = async () => {
    const dbClient = await pool.connect();
    return dbClient
} // try to connect the pool

// exporting db connect function
module.exports = {
    dbConnect
}