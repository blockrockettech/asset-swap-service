import {ethers} from 'ethers';
import {SwapContractService} from '../../../services/SwapContractService';
import Quote from "../../../models/Quote";
import Web3Service from "../../../services/Web3Service";

export function swap(args, callback) {
    const { chainId, channelId, quoteId, message, signature } = args;

    //TODO: load the quote data from the DB
    Quote.getQuote(channelId, quoteId, chainId).then(dbData => {
        if (!dbData || dbData.length === 0 || dbData.length > 1) {
            callback(null, {
                msg: `Error trying to find a quote for channel ID [${channelId}], quote ID [${quoteId}], chain ID [${chainId}]`
            });
            return;
        }

        const quote = dbData[0];
        const {input, amount, fee, channel_id} = quote;

        //TODO: check the signature supplied is valid
        //Web3Service.validateSignature(channel_id, message, signature);

        //TODO: check the user approval still persists and there is still enough liquidity

        //TODO: perform the swap
        const swapContract = new SwapContractService(parseInt(chainId));

        swapContract.swap(
          input,
          ethers.utils.parseEther(amount.toString()),
          ethers.utils.parseEther(fee.toString()),
          channel_id,
        ).then(tx => {
            callback(null, {
                msg: `Processing swap for quote ID [${quoteId}]`,
                tx
            });
        })
    });
}


