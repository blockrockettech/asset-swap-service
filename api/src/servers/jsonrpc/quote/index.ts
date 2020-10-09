import validationService from '../../../services/ValidationService';
import quoteService from '../../../services/QuoteService';
import assetSwapService from '../../../services/AssetSwapService';
import {QuoteRequest} from '../../../types/internal';

export async function generate_quote(quoteRequest: QuoteRequest, callback) {

    console.log("generate_quote", quoteRequest);

    const {input, output} = quoteRequest;

    // Validate pair
    const isValidPair = await validationService.validatePair(input, output);
    if (!isValidPair) {
        // TODO
    }

    // ensure current availability
    const canFulfillSwap = await assetSwapService.canCurrentlyFulfillSwap(input, output);
    if (!canFulfillSwap) {
        // TODO
    }

    // generate a new, sorted quote
    const {quote_id, fee} = await quoteService.generateQuote(quoteRequest);

    return callback(null, {
        quote_id,
        from: input,
        to: output,
        fee: fee
    });
}
