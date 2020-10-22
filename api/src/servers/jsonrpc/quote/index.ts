import validationService from '../../../services/ValidationService';
import quoteService from '../../../services/QuoteService';
import {QuoteRequest} from '../../../types/internal';
import {AssetSwapChannelState} from '../../../models';
import {ethers} from "ethers";

const {BigNumber} = ethers;

/*
Sample payload - output value and chain ids are needed on both
{
    "channel_uuid": "a0244043-649a-4c7f-9975-b68849bca434",
    "input": {
        "smart_contract": "0x6b175474e89094c44da98b954eedeac495271d0f",
        "chain_id": "1"
    },
    "output": {
        "smart_contract": "0xD62fB951A937e1f6afEEECf1a778c4A5ddeD791d",
        "chain_id": "100",
        "value": "10000"
   }
}
 */

export async function generate_quote(quoteRequest: QuoteRequest, callback) {
    console.log("generate_quote", quoteRequest);

    const {input, output} = quoteRequest;

    // Validate pair
    const isValidPair = await validationService.validatePair(input, output);
    if (!isValidPair) {
        console.log(`Rejecting quote - Invalid pair found`);
        return callback({
            code: -32602,
            message: `Invalid pair`
        });
    }

    // Ensure we have enough in the out going channel to fulfill the swap
    const outgoingChannelBalance = await AssetSwapChannelState.getChannelBalance(output.smart_contract);
    console.log(`Found outbound channel balance of [${outgoingChannelBalance}] for [${output.smart_contract}]`);

    const requestOutput = BigNumber.from(output.value);

    if (!outgoingChannelBalance || BigNumber.from(outgoingChannelBalance).lt(requestOutput)) {
        console.log(`Rejecting quote - asset swap balance to low`);
        return callback({
            code: -32000,
            message: `Unable to satisfy swap, balance to low`
        });
    }

    // Generate a new, sorted quote
    const {quote_id, fee} = await quoteService.generateQuote(quoteRequest);

    return callback(null, {
        success: true,
        quote_id,
        input: input,
        output: output,
        fee: BigNumber.from(fee).toString(),
        totalPayable: requestOutput.add(fee).toString()
    });
}
