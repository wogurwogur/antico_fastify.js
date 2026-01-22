import app from '../app';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

interface NoticeInfo {
  notice_id: number;
  title: string;
  content: string;
  view_count: number;
  is_deleted: number;
  created_at: Date;
  updated_at: Date;
}

let connection: mysql.Connection;
let testNoticeId: number;

describe('Notice Endpoints', () => {
  beforeAll(async () => {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notice (
        notice_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        view_count INT DEFAULT 0,
        is_deleted TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const [result] = await connection.execute(
      `INSERT INTO notice (title, content) VALUES ('Test Notice 1', 'This is the content of test notice 1')`
    ) as mysql.ResultSetHeader[];
    testNoticeId = result.insertId;
  });

  afterAll(async () => {
    await connection.execute(`DROP TABLE IF EXISTS notice`);
    await connection.end();
    await app.close();
  });

  test('GET /api/notice/getAllNoticeInfo should return all notices', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/notice/getAllNoticeInfo',
    });
    expect(response.statusCode).toBe(200);
    const notices: NoticeInfo[] = JSON.parse(response.payload);
    expect(notices).toBeInstanceOf(Array);
    expect(notices.length).toBeGreaterThan(0);
    expect(notices[0]).toHaveProperty('notice_id');
    expect(notices[0]).toHaveProperty('title');
    expect(notices[0]).toHaveProperty('content');
  });

  test('GET /api/notice/getNoticeInfo/:id should return a single notice', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/notice/getNoticeInfo/${testNoticeId}`,
    });
    expect(response.statusCode).toBe(200);
    const notice: NoticeInfo = JSON.parse(response.payload);
    expect(notice).toHaveProperty('notice_id', testNoticeId);
    expect(notice).toHaveProperty('title', 'Test Notice 1');
    expect(notice).toHaveProperty('content', 'This is the content of test notice 1');
  });

  test('GET /api/notice/getNoticeInfo/:id should return 404 for non-existent notice', async () => {
    const nonExistentId = 99999;
    const response = await app.inject({
      method: 'GET',
      url: `/api/notice/getNoticeInfo/${nonExistentId}`,
    });
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.payload)).toEqual({ error: 'Notice not found' });
  });
});
