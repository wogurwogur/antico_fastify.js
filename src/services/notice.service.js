import pool from '../db/mysql.js';

export const getNoticeAll = async () => {
  const [rows] = await pool.query('SELECT 1 AS ok');
  return rows;
};
