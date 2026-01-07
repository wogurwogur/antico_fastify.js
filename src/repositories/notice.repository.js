import db from "../db/mysql.js"

export async function getNoticeAll() {
  const [rows] = await db.query("select * from notice");
  return rows;
}

export async function noticeInsert(title, content){
    const [noticeResult] = await query("INSERT INTO(TITLE, CONTENT, IS_DELETED, CREATED_AT, UPDATED_AT)"
        + " VALUES(?, ? )",
        [title, content]);
        
}