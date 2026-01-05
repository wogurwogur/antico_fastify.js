import noticeRoutes from './notice/notice.routes.js';

export default async function (fastify) {
  fastify.register(noticeRoutes);
}
