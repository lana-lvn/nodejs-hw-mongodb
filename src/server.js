import path from 'node:path';
import * as fs from 'node:fs';

import express from 'express';
import cors from 'cors';
import pino from 'pino-http';

import router from './routes/index.js';
import { getEnvVar } from './utils/getEnvVar.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';
import swaggerUIExpress from 'swagger-ui-express';

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.resolve('docs', 'swagger.json'), 'utf-8'),
);

const PORT = Number(getEnvVar('PORT', '3000'));

export function setupServer() {
  const app = express();
  app.use(
    '/api-docs',
    swaggerUIExpress.serve,
    swaggerUIExpress.setup(swaggerDocument),
  );
  app.use('/uploads', express.static(path.resolve('src', 'uploads')));
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );
  app.use(router);

  app.use('*', notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
  });
}
