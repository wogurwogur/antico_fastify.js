import noticeRepo from '../repositories/notice.repository.js';


interface NoticeInfo {
  notice_id: number;
  title: string;
  content: string;
  view_count: number;
}

async function getAllNoticeInfo(): Promise<NoticeInfo[]> {
  return await noticeRepo.getAllNoticeInfo();
}

async function noticeInsert(title: string, content: string) {
  return await noticeRepo.noticeInsert(title, content);
}

async function noticeUpdate(id: number, title: string, content: string) {
  return await noticeRepo.noticeUpdate(id, title, content);
}

async function noticeDelete(id: number) {
  return await noticeRepo.noticeDelete(id);
}

async function getNoticeInfo(id: number): Promise<NoticeInfo> {
  return await noticeRepo.getNoticeInfo(id);
}

export default {
  getAllNoticeInfo,
  noticeInsert,
  noticeUpdate,
  noticeDelete,
  getNoticeInfo,
};
