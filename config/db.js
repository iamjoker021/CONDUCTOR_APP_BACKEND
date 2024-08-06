require('dotenv').config();
const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.CONN_STR });

module.exports = pool;