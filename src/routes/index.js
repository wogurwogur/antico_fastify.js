import * as noticeRoutes from './notice/notice.routes.js';

export async function noticeRoutes(fastify) {
  fastify.register(noticeRoutes);
}
