import {TransactionValue} from "./kchannel";

export interface QuoteRequest {
    channel_uuid: string;
    input: TransactionValue;
    output: TransactionValue;
}
