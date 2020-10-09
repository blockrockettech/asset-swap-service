import dotenv from 'dotenv';

const res = dotenv.config();
console.log("res", res);

import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';

import {Quote, Swap} from "./servers/jsonrpc";

const jayson = require('jayson');

const app = express();

if (process.env.NODE_ENV !== 'test') {
    app.use(compression());
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// JSON-RPC endpoints
app.post('/quote', jayson.server(Quote).middleware());
app.post('/swap', jayson.server(Swap).middleware());

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

