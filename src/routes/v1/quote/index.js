import express from 'express';

const quote = express.Router({mergeParams: true});

import {v4 as uuidv4} from 'uuid';

import Quote from "../../../models/Quote";
import FeeService from "../../../services/FeeService";

quote.post('/', async (req, res, next) => {
    const { chainId } = req.params;
    const {channelId, input, output, amount} = req.body;

    // Generate a quote
    const quoteId = uuidv4();
    const fee = FeeService.getDAISwapFee(amount); // TODO: this is not a real calculation - to be replaced
    const outputAfterFee = parseFloat(amount) - fee;

    // Persist the quote with associated request details
    await Quote.addQuote(
        quoteId,
        channelId,
        chainId,
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
    const { chainId } = req.params;
    return res
        .status(200)
        .json({
            quotes: await Quote.getAll(chainId)
        });
});

export default quote;

