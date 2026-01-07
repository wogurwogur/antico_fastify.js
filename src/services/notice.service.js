import * as noticeRepo from '../repositories/notice.repository.js';

export async function getNoticeAll() {
  return await noticeRepo.getNoticeAll();
}