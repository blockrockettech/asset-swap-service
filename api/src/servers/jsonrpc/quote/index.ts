import validationService from '../../../services/ValidationService';
import quoteService from '../../../services/QuoteService';
import {QuoteRequest} from '../../../types/internal';
import {AssetSwapChannelState} from '../../../models';
import {ethers} from "ethers";

const {BigNumber} = ethers;

export async function generate_quote(quoteRequest: QuoteRequest, callback) {
    console.log("generate_quote", quoteRequest);

    const {input, output} = quoteRequest;

    // Validate pair
    const isValidPair = await validationService.validatePair(input, output);
    if (!isValidPair) {
        console.log(`Rejecting quote - Invalid pair found`);
        return callback(null, {
            msg: `Invalid pair`,
            success: false
        });
    }

    // Ensure we have enough in the out going channel to fulfill the swap
    const outgoingChannelBalance = await AssetSwapChannelState.getChannelBalance(output.smart_contract)

    const requestOutput = BigNumber.from(input.value);

    if (!outgoingChannelBalance || requestOutput.lt(BigNumber.from(outgoingChannelBalance))) {
        console.log(`Rejecting quote - asset swap balance to low`);
        return callback(null, {
            msg: `Unable to satisfy swap, balance to low`,
            success: false
        });
    }

    // Generate a new, sorted quote
    const {quote_id, fee} = await quoteService.generateQuote(quoteRequest);

    return callback(null, {
        success: true,
        quote_id,
        from: input,
        to: output,
        fee: BigNumber.from(fee).toString(),
        totalPayable: requestOutput.add(fee).toString()
    });
}
