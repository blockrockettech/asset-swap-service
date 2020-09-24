import express from 'express';

const quote = express.Router({mergeParams: true});

import Quote from "../../../models/Quote";
import kChannelService from "../../../services/kChannelService";

quote.post('/', async (req, res, next) => {
    const { chainId } = req.params;
    const { channelId, input, output, amount } = req.body;

    const { id, fee, outputAfterFee } = await kChannelService.getQuote(
        5777,
        channelId,
        input,
        output,
        amount
    );

    // Persist the quote with associated request details
    await Quote.addQuote(
        id,
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
                id,
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

