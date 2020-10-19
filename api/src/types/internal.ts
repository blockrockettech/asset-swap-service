import {ChannelDefinition, ClientInfo, TransactionValue} from "./kchannel";
import {Account} from "web3-core";

export interface QuoteRequest {
    channel_uuid: string;
    input: TransactionValue;
    output: TransactionValue;
}

export interface WebSocketSetup {
    web3Signer: Account;
    clientInfo: ClientInfo;
    channelDef: ChannelDefinition;
    jwt: string;
}
