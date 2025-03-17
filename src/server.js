import express from 'express';
import cors from 'cors';
import pino from 'pino-http';

import router from './routes/index.js';
import { getEnvVar } from './utils/getEnvVar.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';

const PORT = Number(getEnvVar('PORT', '3000'));

export function setupServer() {
  const app = express();
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
