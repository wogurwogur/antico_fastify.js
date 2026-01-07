import * as noticeRepo from '../repositories/notice.repository.js';

export async function getNoticeAll() {
  return await noticeRepo.getNoticeAll();
}

export async function noticeInsert(title, content) {
  return await noticeRepo.noticeInsert(title, content);
}