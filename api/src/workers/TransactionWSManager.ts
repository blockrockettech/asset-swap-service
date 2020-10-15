import {WebSocketSetup} from "../types/internal";
import assetSwapService from "../services/AssetSwapService";
import {AssetSwapChannelState, Quote} from "../models";
import {ChannelAsset, ChannelInfo, Transaction, TransactionInfo} from "../types/kchannel";

const _ = require('lodash');

const WebSocket = require('ws');

export class TransactionWSManager {

    private readonly jwt: any;
    private readonly clientInfo: any;
    private readonly channelDef: any;

    constructor({channelDef, clientInfo, jwt}: WebSocketSetup) {
        this.jwt = jwt;
        this.clientInfo = clientInfo;
        this.channelDef = channelDef;
    }

    // 1. lookup reference number (validation stage)
    // const quote = await Quote.getQuote(quoteId);

    // 2. kchannels: compose transaction (assets required, quote reference)
    //    - call kchannels - Method: create_new_transaction()
    //                       returns -> transaction obj
    // const transaction = await assetSwapService.composeTransaction(input, output, amount, fee, channel_id, quote);

    // TODO checks transaction still valid by:
    // 3. validate transaction                  -> how to validate this? Do we check the signatures match the payload?
    // 4. validate recipient                    -> how? Do we check the receipt has an open channel with the other zone?
    // 5. validate own channel state and nonce  -> Is this simply checking that we haven't incremented our own nonce in the meantime?
    // 6. sign transaction                      -> EIP-712 signature - add to the signature_list on the original transaction above .2 ?

    // 7. kchannels: Send tx to kchannels       -> Method: process_transaction()
    //  returns -> transaction and summary
    // const transactionSummary = await kChannelsService.sendTransaction(transaction);

    // TODO are these processes full async or would we expect them to serially fulfilled?
    // 8. validate transaction is fully executed -> Is this simply assuming a non failed response from .7 above?
    // 9. validate transaction summary           -> confirm TransactionSummary is correct and populated with enough signatures?
    // 10. sign transaction summary              -> EIP-712 signature - add to the signature_list on the original transaction above .2 ?
    // 10. a.                                    -> I assume we also need to store this final pre-flight stage in our DB?

    // 11. kchannels: Send tx - Method: complete_transaction()
    //       returns -> store receipt transaction summary against quote

    // ASSET SWAP COMPLETE

    async start() {
        const channelUuid = this.channelDef.channel_uuid;
        const definitionVersion = this.channelDef.definition_version;
        const baseZoneClientEndpoint = this.clientInfo.zone_location.zone_client_endpoint;

        const zoneClientEndpoint = baseZoneClientEndpoint
            .replace('https://', 'wss://') // flip http for wss
            .replace(/\/$/, ''); // remove any trailing slashes

        const webSocketSubscription = `${zoneClientEndpoint}/ws/transaction/${channelUuid}/${definitionVersion}/?access_token=${this.jwt}`;
        const wss = new WebSocket(webSocketSubscription);

        wss.on('open', () => {
            console.log('connected');
        });

        wss.on('close', () => {
            console.log('disconnected');
        });

        wss.on('message', async (rawData: string) => {
            console.log(rawData);

            const message: TransactionInfo = JSON.parse(rawData);
            console.log("message", message);

            // We only care about completed transaction
            if (message.transaction_status === "Completed") {

                const transaction: Transaction = message.transaction;
                const reference_data = transaction.reference_data;
                // Check quote reference defined
                if (!reference_data) {
                    // TODO send total amount back to the sender
                }

                const quote = await Quote.getQuote(reference_data);

                // Check quote valid and not already fulfilled
                if (!quote || quote.filfilled) {
                    // TODO send total amount back to the sender
                }

                const quotedAmount = quote.amount;
                const totalPayable = quotedAmount + quote.fee;
                const contractsMatch = quote.input === transaction.value_list[0].smart_contract;
                const valuesMatch = totalPayable === transaction.value_list[0].value;

                // Check from and amount marry up the quote issued
                if (!valuesMatch || !contractsMatch) {
                    // TODO send total amount back to the sender
                }

                // Check current channel balance is enough to satisfy the quote
                const currentBalance = await AssetSwapChannelState.getChannelBalance(quote.output);
                if (currentBalance < totalPayable) {
                    // TODO send total amount back to the sender
                }

                const sender = transaction.sender_party.channel_definition;

                // TODO send transaction from yourself to the recipient for quotedAmount

            }
        });

        wss.on('error', (error) => {
            console.log('error - something bad happened', error);
        });

        return this;
    }


}
