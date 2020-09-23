import express from 'express';
const v1 = express.Router({mergeParams: true});

import quoteRouter from './quote';
import swapRouter from './swap';

v1.use('/quote', quoteRouter);
v1.use('/swap', swapRouter);

export default v1;
