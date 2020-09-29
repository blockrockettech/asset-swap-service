import {SwapContractService} from '../../../services/SwapContractService';
import Quote from "../../../models/Quote";

export function swap(args, callback) {
    const { chainId, channelId, quoteId, message, signature } = args;

    //TODO: load the quote data from the DB
    Quote.getQuote(channelId, quoteId, chainId).then(dbData => {
        // if (!dbData || dbData.length === 0) {
        //     return res.status(500).json({
        //         msg: `No quote found for channel ID [${channelId}], quote ID [${quoteId}], chain ID [${chainId}]`
        //     });
        // }
        //TODO: check the signature supplied is valid

        //TODO: check the user approval still persists and there is still enough liquidity

        //TODO: perform the swap
        const swapContract = new SwapContractService(chainId);

        // swapContract.swap(
        //   dbData.input,
        //   dbData.amount,
        //   dbData.fee,
        //   dbData.channelId,
        // ).then(() => {
        //     callback(null, `Processing swap for quote ID [${quoteId}]`);
        // })
    });
}


