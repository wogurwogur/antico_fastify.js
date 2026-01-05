import Fastify from 'fastify';
import routes from './routes/index.js';

const app = Fastify({ logger: true });

app.register(routes, { prefix: '/api' });

export default app;
