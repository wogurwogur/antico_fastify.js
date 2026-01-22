import noticeController from '../controllers/notice.controller.js';

export default async function routes(fastify) {
  console.log('Registering notice routes');
  fastify.register(noticeController, { prefix: '/notice' });
}
