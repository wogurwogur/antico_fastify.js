import Notice from '../services/notice.service.js';

export default function noticeRoutes(fastify, opts, done) {
  fastify.get('/getAllNoticeInfo', async (request, reply) => {
    try {
      const allNotices = await Notice.getAllNoticeInfo();
      reply.send(allNotices);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch all notices' });
    }
  });

  fastify.get('/getNoticeInfo/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const notice = await Notice.getNoticeInfo(Number(id));
      if (notice) {
        reply.send(notice);
      } else {
        reply.status(404).send({ error: 'Notice not found' });
      }
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch notice' });
    }
  });

  fastify.get('/list', async () => {
    try {
      return await Notice.getAllNoticeInfo();
    } catch (error) {
      fastify.log.error(error);
      return { error: 'Failed to fetch notices' };
    }
  });

  fastify.get('/:id', async (req) => {
    try {
      console.log('Fetching notice by id:', req.params.id);
      const { id } = req.params;
      const result = await Notice.getNoticeInfo(Number(id));
      console.log('Fetched notice:', result);
      return result;
    } catch (error) {
      fastify.log.error(error);
      return { error: 'Failed to fetch notice' };
    }
  });

  fastify.post('/insert', async (req) => {
    try {
      const { title, content } = req.body;
      return await Notice.noticeInsert(title, content);
    } catch (error) {
      fastify.log.error(error);
      return { error: 'Failed to insert notice' };
    }
  });

  fastify.put('/update', async (req) => {
    try {
      const { id, title, content } = req.body;
      return await Notice.noticeUpdate(id, title, content);
    } catch (error) {
      fastify.log.error(error);
      return { error: 'Failed to update notice' };
    }
  });

  fastify.delete('/delete/:id', async (req) => {
    try {
      const { id } = req.params;
      return await Notice.noticeDelete(id);
    } catch (error) {
      fastify.log.error(error);
      return { error: 'Failed to delete notice' };
    }
  });

  done();
}