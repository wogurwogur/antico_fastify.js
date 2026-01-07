import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Dream80196!',
  database: 'antico_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
});

export default db;
