import {ethers} from 'ethers';
import {SwapContractService, swapContractAddress} from '../../../services/SwapContractService';
import Quote from "../../../models/Quote";
import Web3Service from "../../../services/Web3Service";
import kChannelService from "../../../services/kChannelService";

export function swap(args, callback) {
    const { chainId, channelId, quoteId, message, signature } = args;

    if (!chainId || !channelId || !quoteId || !message || !signature) {
        callback(null, {
           msg: 'One or more of the args supplied is invalid'
        });
        return;
    }

    // load the quote data from the DB
    Quote.getQuote(channelId, quoteId, chainId).then(dbData => {
        if (!dbData || dbData.length === 0 || dbData.length > 1) {
            callback(null, {
                msg: `Error trying to find a quote for channel ID [${channelId}], quote ID [${quoteId}], chain ID [${chainId}]`
            });
            return;
        }

        const quote = dbData[0];
        const {input, amount, fee, channel_id} = quote;

        // check the signature supplied is valid
        const isSignatureValid = Web3Service.validateSignature(channel_id, message, signature);
        if (!isSignatureValid) {
            callback(null, {
               msg: `Invalid signature - recovered address does not match quote`
            });
            return;
        }

        // check the user approval still persists and there is still enough liquidity
        kChannelService.getUserBalanceAndApprovalAmounts(
            parseInt(chainId),
            input,
            channel_id,
            swapContractAddress(parseInt(chainId))
        ).then(({balance, allowance}) => {
            const amountBN = ethers.BigNumber.from(amount);
            if (balance.lt(amountBN)) {
                const msg = `The user's balance is less than the amount they wish to swap`;
                console.error(msg);
                callback(null, {
                    success: false,
                    error: {
                        msg
                    }
                });
                return;
            }

            if (allowance.lt(amountBN)) {
                const msg = `The allowance from the user is less than the amount they wish to swap`;
                console.error(msg);
                callback(null, {
                    success: false,
                    error: {
                        msg
                    }
                });
                return;
            }

            // perform the swap
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
    });
}


