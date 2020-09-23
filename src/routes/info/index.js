import {
    postgresEndpoint
} from '../../settings';

const packageInfo = require('../../../package.json');

import express from 'express';
const info = express.Router({mergeParams: true});

info.get('/', async (req, res, next) => {
    return res
        .status(200)
        .json({
            name: packageInfo.name,
            version: packageInfo.version,
            postgresEndpoint
        });
});

export default info;

