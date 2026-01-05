import { getNoticeAll } from '../../services/notice.service.js';

export default async function (fastify) {
  fastify.get('/notice/list', async () => {
    return getNoticeAll();
  });
}
