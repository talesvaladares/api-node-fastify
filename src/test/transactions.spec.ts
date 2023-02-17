import { 
  beforeAll, 
  afterAll, 
  describe, 
  it, 
  expect, 
  beforeEach,
} from 'vitest';
import { execSync } from 'node:child_process';
import request from 'supertest';
import { app } from '../app';

describe("Transactions routes", () => {
  
  //antes dos testes quero esperar minha aplicação ficar pronta
  beforeAll(async () => {
    await app.ready();
  });

  //antes dos testes tirar a aplicação da memória
  afterAll(async () => {
    await app.close();
  });

  //antes de cada teste
  //reseto o banco
  //depois recrio todo o banco
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  });

  it('should be able to create a new transactions', async () => {

    await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 5000,
        type: 'credit'
      })
      .expect(201) 
  });

  it('should be able to list all transactions', async () => {

    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: 'new transaction',
      amount: 5000,
      type: 'credit'
    });


    const cookies = createTransactionResponse.get('Set-Cookie');

    const transactions = await request(app.server).get('/transactions').set('Cookie', cookies);

    expect(transactions.statusCode).toEqual(200);
    expect(transactions.body.transactions).toEqual([
      expect.objectContaining({
        title: 'new transaction',
        amount: 5000
      })
    ]);
   
  });

  it('should be able to get specific transaction', async () => {

    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: 'new transaction',
      amount: 5000,
      type: 'credit'
    });

    const cookies = createTransactionResponse.get('Set-Cookie');

    const transactionsList = await request(app.server).get('/transactions').set('Cookie', cookies);

    const transactionId = transactionsList.body.transactions[0].id

    const transaction = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies);

    expect(transaction.body.transaction).toEqual(
      expect.objectContaining({
        id: transactionId
      })
    )
  });

  it('should be able to get the summary', async () => {

    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: 'new transaction',
      amount: 5000,
      type: 'credit'
    });

    const cookies = createTransactionResponse.get('Set-Cookie');

    await request(app.server)
    .post('/transactions')
    .set('Cookie', cookies)
    .send({
      title: 'new transaction',
      amount: 5000,
      type: 'credit'
    });

    const summaryResponse = await request(app.server).get('/transactions/summary').set('Cookie', cookies);

    expect(summaryResponse.body.summary).toEqual({amount: 10000});
   
  });
});
