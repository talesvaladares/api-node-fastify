import fastify from 'fastify'
import { env } from './env';
import cookie from '@fastify/cookie';
import { transactionsRoutes } from './routes/transactions';
import { checkSessionIdExists } from './middlewares/check-session-id-exists';

const app = fastify()

app.register(cookie);

//chamara o preHandler em todas as rotas da aplicação
app.addHook('preHandler', checkSessionIdExists)
app.register(transactionsRoutes, {
  prefix: 'transactions'
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!🔥');
  });
