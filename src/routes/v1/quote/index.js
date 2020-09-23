import express from 'express';
const quote = express.Router({mergeParams: true});

import Quote from "../../../models/Quote";

quote.get('/', async (req, res, next) => {
    const queryResult = await Quote.select('*');
    return res
        .status(200)
        .json({
            quotes: queryResult.rows
        });
});

export default quote;

