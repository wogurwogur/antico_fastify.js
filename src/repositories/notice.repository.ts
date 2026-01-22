import db from "../db/mysql.js";

async function getAllNoticeInfo(): Promise<NoticeInfo[]> {
  const [rows] = await db.query("SELECT * FROM notice WHERE is_deleted = 0");
  return rows as NoticeInfo[];
}

async function noticeInsert(title: string, content: string) {
  const sql = `
    INSERT INTO notice (title, content, view_count, is_deleted, created_at, updated_at)
    VALUES (?, ?, 0, 0, NOW(), NOW())
  `;
  const [result] = await db.query(sql, [title, content]);
  return result;
}

async function noticeUpdate(id: number, title: string, content: string) {
  const sql = `
    UPDATE notice SET title = ?, content = ?, updated_at = NOW()
    WHERE notice_id = ? AND is_deleted = 0
  `;
  const [result] = await db.query(sql, [title, content, id]);
  return result;
}

async function noticeDelete(id: number) {
  const sql = `
    UPDATE notice SET is_deleted = 1, updated_at = NOW()
    WHERE notice_id = ?
  `;
  const [result] = await db.query(sql, [id]);
  return result;
}

async function getNoticeInfo(id: number): Promise<NoticeInfo> {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    console.log('Starting transaction for id:', id);
    // view_count 증가
    const updateResult = await connection.query('UPDATE notice SET view_count = view_count + 1 WHERE notice_id = ? AND is_deleted = 0', [id]);
    console.log('Update result:', updateResult);
    // notice 가져오기
    const [rows] = await connection.query('SELECT * FROM notice WHERE notice_id = ? AND is_deleted = 0', [id]);
    console.log('Select result:', rows);
    await connection.commit();
    console.log('Transaction committed');
    return rows[0] as NoticeInfo;
  } catch (error) {
    console.log('Error in transaction:', error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

interface NoticeInfo {
  notice_id: number;
  title: string;
  content: string;
  view_count: number;
  is_deleted: number;
  created_at: Date;
  updated_at: Date;
}

export default {
  getAllNoticeInfo,
  noticeInsert,
  noticeUpdate,
  noticeDelete,
  getNoticeInfo,
};
