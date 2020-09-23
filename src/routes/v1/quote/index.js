import express from 'express';

const quote = express.Router({mergeParams: true});

import {v4 as uuidv4} from 'uuid';

import Quote from "../../../models/Quote";

quote.post('/', async (req, res, next) => {
    const {channelId, input, output, amount} = req.body;

    // Generate a quote
    const quoteId = uuidv4();
    const fee = 0.01 * (amount / 10); // TODO: this is not a real calculation - to be replaced
    const outputAfterFee = parseFloat(amount) - fee;

    // Persist the quote with associated request details
    await Quote.addQuote(
        quoteId,
        channelId,
        input,
        output,
        amount,
        fee
    );

    return res.status(200)
        .json({
            requestDetails: {
                channelId, input, output, amount
            },
            quote: {
                id: quoteId,
                fee,
                outputAfterFee
            }
        });
});

quote.get('/allQuotes', async (req, res, next) => {
    return res
        .status(200)
        .json({
            quotes: await Quote.getAll()
        });
});

export default quote;

