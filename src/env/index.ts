import { config } from 'dotenv';
import { z } from 'zod';

//antes de instanciar as variaveis de ambiente verifico se estou no ambiente de testes
//quando rodo testes, automaticamente dentro de NODE_ENV encontro o valor de test
if (process.env.NODE_ENV === 'test') {
  config({path: '.env.test'});
}
else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables!', _env.error.format());

  throw new Error('Invalid environment variables!')
}

export const env = _env.data;