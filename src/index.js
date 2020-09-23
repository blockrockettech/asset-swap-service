import {
  postgresEndpoint
} from './settings';

import express from 'express';
const app = express();

import infoRouter from './routes/info';
import v1Router from './routes/v1';

import bodyParser from 'body-parser';
import compression from 'compression';

import { Pool } from "pg";

if (process.env.NODE_ENV !== 'test') {
  app.use(compression());
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', infoRouter);
app.use('/v1', v1Router);

// Default error handler for all routes
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.statusCode || 500)
    .json({
      error: {
        name: err.name,
        message: err.message,
        data: err.data,
      },
    });
});

const port = 3000 || process.env.PORT;
app.listen(port, () => console.log(`\nAPI started, listening on port [${port}]\n`));

export default app;

