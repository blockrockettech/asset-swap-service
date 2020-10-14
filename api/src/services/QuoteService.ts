import {Quote} from '../models';
import FeeService from './FeeService';
import {v4 as uuidv4} from 'uuid';
import {QuoteRequest} from "../types/internal";

export default new class QuoteService {

    async generateQuote({channel_uuid, input, output}: QuoteRequest) {
        console.log(`Generating quote for [${channel_uuid}]`);

        const quote_id = uuidv4();

        // calculate exchange fee  -> assumed fixed fee for now e.g. 1%
        const fee = await FeeService.getDAISwapFee(output.value);

        // calculate asset exchange -> 1:1 for now

        // store generated quote
        await Quote.addQuote(quote_id, channel_uuid, input, output, fee);

        // return quote ID and generated fee
        return {quote_id, fee};
    }
};
