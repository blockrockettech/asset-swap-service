import {ChannelDefinition, ClientInfo, TransactionValue} from "./kchannel";

export interface QuoteRequest {
    channel_uuid: string;
    input: TransactionValue;
    output: TransactionValue;
}

export interface WebSocketSetup {
    clientInfo: ClientInfo;
    channelDef: ChannelDefinition;
    jwt: string;
}
