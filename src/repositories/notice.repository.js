import db from "../db/mysql.js"

export async function getNoticeAll() {
  const [rows] = await db.query("select 1 as iii");
  return rows;
}