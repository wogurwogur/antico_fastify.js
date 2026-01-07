import * as Notice from '../../services/notice.service.js';

export async function getNoticeList(fastify) {
  fastify.get('/notice/list', async () => {
    return Notice.getNoticeAll();
  });
}

export async function noticeInsert(fastify) {
  fastify.post('/notice/insert', async (req) => {

    const {title, content} = req.body;

    return Notice.noticeInsert(title, content);
  });
}
