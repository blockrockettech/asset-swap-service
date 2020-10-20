import {WebSocketSetup} from "../types/internal";
import {AssetSwapChannelState, Quote} from "../models";
import {Transaction, TransactionInfo} from "../types/kchannel";
import {
    completeTransaction,
    createNewTransaction,
    getTransactionDefinitionTypedMessage,
    processTransaction
} from "../services/KChannelsService";
import {Account} from "web3-core";

const sigUtil = require('eth-sig-util');

const _ = require('lodash');

const WebSocket = require('ws');

export class TransactionWSManager {

    private readonly web3Signer: Account;
    private readonly jwt: any;
    private readonly clientInfo: any;
    private readonly channelDef: any;

    constructor({web3Signer, channelDef, clientInfo, jwt}: WebSocketSetup) {
        this.web3Signer = web3Signer;
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
            // console.log(rawData);

            const message: TransactionInfo = JSON.parse(rawData);
            console.log("Message received", [message.transaction_status, message.transaction.request_uuid]);

            // We only care about completed transaction
            if (message.transaction_status === "Completed") {

                const transaction: Transaction = message.transaction;
                const reference_data = transaction.reference_data;

                // Check quote reference is defined
                if (!reference_data) {
                    console.info("Reference data not found, returning funds to sender");
                    return this.sendMoneyBackToRecipient(transaction);
                }

                const quote = await Quote.getQuote(reference_data);

                // Check quote valid and not already fulfilled
                if (!quote || quote.filfilled) {
                    console.info("Quote not found or already fulfilled, returning funds to sender");
                    return this.sendMoneyBackToRecipient(transaction);
                }

                const quotedAmount = quote.amount;
                const totalPayable = quotedAmount + quote.fee;
                const contractsMatch = quote.input === transaction.value_list[0].smart_contract;
                const valuesMatch = totalPayable === transaction.value_list[0].value;

                // Check from and amount marry up the quote issued
                if (!valuesMatch || !contractsMatch) {
                    console.info("Quote invalid, returning funds to sender");
                    return this.sendMoneyBackToRecipient(transaction);
                }

                // Check current channel balance is enough to satisfy the quote
                const currentBalance = await AssetSwapChannelState.getChannelBalance(quote.output);
                if (currentBalance < totalPayable) {
                    console.info("Unable to fulfill quote due to low balance, returning funds to sender");
                    return this.sendMoneyBackToRecipient(transaction);
                }

                // send the monies
                const sender = transaction.sender_party.channel_definition;
                return this.facilitateSwap(quote, sender);
            }
        });

        wss.on('error', (error) => {
            console.log('error - something bad happened', error);
        });

        return this;
    }

    async facilitateSwap(quote, sender) {
        const channelUuid = this.channelDef.channel_uuid;
        const definitionVersion = this.channelDef.definition_version;
        const baseZoneClientEndpoint = this.clientInfo.zone_location.zone_client_endpoint;

        const quotedAmount = quote.amount;
        const outputCurrency = quote.output;

        const createTransactionResponse = await createNewTransaction(
            this.jwt,                   // my auth token
            baseZoneClientEndpoint,     // my current zone
            this.web3Signer.address,    // my account
            channelUuid,                // my channel UUID
            definitionVersion,          // my channel version
            sender,                     // the sender
            quotedAmount                // the quoted amount
        );

        // Check valid
        if (createTransactionResponse.error || !createTransactionResponse.result) {
            console.error("Unable to create new transaction", createTransactionResponse);
            return Promise.reject(createTransactionResponse);
        }

        // Copy reference_data back onto every field
        // createTransaction.reference_data =

        // TODO send transaction from yourself to the recipient for quotedAmount

        // Mark quote as fulfilled
        const quoteFulfilled = await Quote.fulfillQuote(quote.id, sender);
        console.info(`Quote [${quote.id}] fulfilled`, quoteFulfilled);
    }

    async sendMoneyBackToRecipient(incomingTransaction: Transaction) {

        const channelUuid = this.channelDef.channel_uuid;
        const definitionVersion = this.channelDef.definition_version;
        const baseZoneClientEndpoint = this.clientInfo.zone_location.zone_client_endpoint;

        // FIXME is this the correct sender party?
        const senderParty = incomingTransaction.sender_party.channel_definition.owner_address;
        const transactionValue = incomingTransaction.value_list[0];

        console.log(`Sending money back to sender - account [${senderParty}]`, transactionValue);

        ///////////////////////////////////////////////////////////////////////////////////////////
        // 1. This requests the backend to create a new transaction based on several parameters. //
        // This the first of 3 APIs that are required to transact.                               //
        ///////////////////////////////////////////////////////////////////////////////////////////

        const createTransactionResponse = await createNewTransaction(
            this.jwt,                   // my auth token
            baseZoneClientEndpoint,     // my current zone
            this.web3Signer.address,    // my account
            channelUuid,                // my channel UUID
            definitionVersion,          // my channel version
            senderParty,                // the senders address - derived from incomingTransaction.sender_party.channel_definition.owner_address
            transactionValue            // the incoming transaction - derived from incomingTransaction.value_list[0]
        );
        console.log("createTransactionResponse", JSON.stringify(createTransactionResponse.result));

        // Check valid
        if (createTransactionResponse.error || !createTransactionResponse.result) {
            console.error("Unable to create new transaction", createTransactionResponse);
            return Promise.reject(createTransactionResponse);
        }

        // TODO Validate the response ... how?

        // TODO do I still need to set the quote reference onto the transaction even though this is the failure path?
        // Copy reference_data back onto every field
        // createTransaction.reference_data =

        //////////////////////////////////////////////////////////////
        // 2. Submit a signed transaction to the backend.           //
        // This the second of 3 APIs that are required to transact. //
        //////////////////////////////////////////////////////////////

        const createTransaction = createTransactionResponse.result;

        // Build message definition
        const transactionMessage = await getTransactionDefinitionTypedMessage(createTransaction, "Transaction");

        // Sign it
        const createNewTransactionTypedSignature = sigUtil.signTypedData_v4(
            Buffer.from(this.web3Signer.privateKey.substr(2), 'hex'),
            {data: transactionMessage}
        );

        // Add signature to the signature list
        createTransaction.signature_list = [createNewTransactionTypedSignature];

        const processTransactionResponse = await processTransaction(
            this.jwt,
            baseZoneClientEndpoint,
            channelUuid,
            definitionVersion,
            createTransaction
        );

        // Check valid
        if (processTransactionResponse.error || !processTransactionResponse.result) {
            console.error("Unable to process transaction", processTransactionResponse);
            return Promise.reject(processTransactionResponse);
        }

        // TODO Validate the response ... how?

        //////////////////////////////////////////////////////////////////////
        // 3. Submit a signed transaction summary to the backend.           //
        // This the third and last of 3 APIs that are required to transact. //
        //////////////////////////////////////////////////////////////////////

        const [transaction, transactionSummary] = processTransactionResponse.result;

        // Build summary message
        const transactionSummaryMessage = await getTransactionDefinitionTypedMessage(transactionSummary, "TransactionSummary");

        // Sign it
        const transactionSummaryTypedSignature = sigUtil.signTypedData_v4(
            Buffer.from(this.web3Signer.privateKey.substr(2), 'hex'),
            {data: transactionSummaryMessage}
        );
        transactionSummary.signature_list = [transactionSummaryTypedSignature];

        const completeTransactionResponse = await completeTransaction(this.jwt, baseZoneClientEndpoint, channelUuid, definitionVersion, transactionSummary);

        // Check valid
        if (completeTransactionResponse.error || !completeTransactionResponse.result) {
            console.error("Unable to complete transaction", completeTransactionResponse);

            // TODO handled failed transaction ... ?

            return Promise.reject(completeTransactionResponse);
        }

        // TODO Validate the response ... how?

        const completeTransactionResult = completeTransactionResponse.result;
        console.log("Transaction completed", completeTransactionResult);

        return Promise.resolve(completeTransactionResult);
    }

}
