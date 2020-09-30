import Quote from "../../../models/Quote";
import kChannelService from "../../../services/kChannelService";

export function getQuote(args, callback) {
    const { chainId, channelId, input, output, amount } = args;

    kChannelService.getQuote(
        parseInt(chainId),
        channelId,
        input,
        output,
        amount
    ).then(({ success, ...quoteDetailsOrError }) => {
        if (!success) {
            callback(null, {
                ...quoteDetailsOrError
            });
            return;
        }

        const { id, fee, outputAfterFee } = quoteDetailsOrError;

        // Persist the quote with associated request details
        Quote.addQuote(
            id,
            channelId,
            parseInt(chainId),
            input,
            output,
            amount,
            fee
        ).then(() => {
            callback(null, {
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
    });
}

export function allQuotes(args, callback) {
    const { chainId } = args;

    Quote.getAll(chainId).then(quotes => {
        callback(null, {
            quotes
        });
    });
}

