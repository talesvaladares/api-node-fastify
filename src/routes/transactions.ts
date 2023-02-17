import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import crypto from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

export async function transactionsRoutes(app: FastifyInstance) {

  app.post('/', async (request, response) => {

    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit'])
    });

    const body = createTransactionBodySchema.parse(request.body);

    const { amount, title, type} = body;

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      response.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 //7 days
      });
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId
    });
    
    return response.status(201).send();

  });

  //preHandler é como se fosse um middleware
  //vai executar antes do request e response
  app.get('/', {preHandler: [checkSessionIdExists]} , async (request, response) => {

    const { sessionId } = request.cookies;
  
    const transactions = await knex('transactions').where('session_id', sessionId).select();

    return {transactions};
  });

  app.get('/:id', {preHandler: [checkSessionIdExists]}, async (request) => {

    const { sessionId } = request.cookies;

    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);
   
    const transaction = await knex('transactions').where({
      id,
      session_id: sessionId
    }).first();

    return {transaction};
  });

  app.get('/summary', {preHandler: [checkSessionIdExists]},  async (request) => {

    const { sessionId } = request.cookies;

    //somo todos os campos amount da tabela e renomeio como amount
    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', {as: 'amount'})
      .first();

    return { summary };
    
  });
}