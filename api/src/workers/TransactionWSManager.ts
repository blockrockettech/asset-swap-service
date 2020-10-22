import {WebSocketSetup} from "../types/internal";
import {AssetSwapChannelState, Quote} from "../models";
import {Transaction, TransactionInfo, TransactionValue} from "../types/kchannel";
import {
    completeTransaction,
    createNewTransaction,
    getTransactionDefinitionTypedMessage,
    processTransaction
} from "../services/KChannelsService";
import {Account} from "web3-core";
import {ethers} from "ethers";
import {signTypedData_v4} from "../services/web3Signer";

const _ = require('lodash');

const WebSocket = require('ws');
const {BigNumber} = ethers;

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

            const senderParty = message.transaction.sender_party.channel_definition.owner_address;

            // Check that we are not simply seeing a complete transaction from ourselves, if so we skip doing anything
            const isAssetSwap = ethers.utils.getAddress(senderParty) === ethers.utils.getAddress(this.web3Signer.address);

            // We only care about completed transaction
            if (message.transaction_status === "Completed" && !isAssetSwap) {

                const transaction: Transaction = message.transaction;
                const reference_data = transaction.reference_data;

                // Check quote reference is defined
                if (!reference_data) {
                    console.info("ERROR - Reference data not found, returning funds to sender");
                    return this.sendBackToSender(transaction);
                }

                const quote = await Quote.getQuote(reference_data);

                // Check quote valid and not already fulfilled
                if (!quote || quote.filfilled) {
                    console.info("ERROR - Quote not found or already fulfilled, returning funds to sender");
                    return this.sendBackToSender(transaction, reference_data);
                }

                const quotedAmount = quote.amount;
                const totalPayable = BigNumber.from(quotedAmount).add(BigNumber.from(quote.fee));
                console.log(`Attempting to fulfill quote - from [${quote.input}] to [${quote.output}] amount [${quotedAmount}] fee [${quote.fee}] total payable [${totalPayable}]`);

                const inboundTransaction = transaction.value_list[0];
                console.log(`Inbound transaction`, inboundTransaction);

                const contractsMatch = quote.input === inboundTransaction.smart_contract;
                const valuesMatch = totalPayable.eq(inboundTransaction.value);

                // Check contracts valid
                if (!contractsMatch) {
                    console.info("ERROR - Quote invalid - contracts dont match, returning funds to sender");
                    return this.sendBackToSender(transaction, reference_data);
                }

                // Check amount is valid
                if (!valuesMatch) {
                    console.info("ERROR - Quote invalid - quote value not satisfied, returning funds to sender");
                    return this.sendBackToSender(transaction, reference_data);
                }

                // Check current channel balance is enough to satisfy the quote
                const currentBalance = await AssetSwapChannelState.getChannelBalance(quote.output);
                if (BigNumber.from(currentBalance).lt(totalPayable)) {
                    console.info("ERROR - Unable to fulfill quote due to low balance, returning funds to sender");
                    return this.sendBackToSender(transaction, reference_data);
                }

                // Send the monies to the incoming transaction
                return this.facilitateAssetSwap(quote, senderParty);
            } else {
                console.log(`Skipping message - isAssetSwap [${isAssetSwap}]`, [message.transaction_status, message.transaction.request_uuid]);
            }
        });

        wss.on('error', (error) => {
            console.log('error - something bad happened', error);
        });

        return this;
    }

    async facilitateAssetSwap(quote, recipient) {

        // Generate transaction to fulfill the swap
        const transactionValue: TransactionValue = {
            chain_id: quote.output_chain_id,
            kind: "Value",
            smart_contract: ethers.utils.getAddress(quote.output),
            value: quote.amount
        }
        console.log(`Fulfilling asset swap`, transactionValue);

        const result = await this.sendTransaction(transactionValue, recipient, quote.reference_data);

        // Mark quote as fulfilled
        const quoteFulfilled = await Quote.fulfillQuote(quote.quote_id);
        console.info(`Quote [${quote.quote_id}] fulfilled`, quoteFulfilled);

        return result;
    }

    async sendBackToSender(incomingTransaction: Transaction, reference_data: string = null) {
        const senderParty = incomingTransaction.sender_party.channel_definition.owner_address;
        const transactionValue = incomingTransaction.value_list[0];

        console.log(`Sending money back to sender - account [${senderParty}]`, transactionValue);

        return this.sendTransaction(transactionValue, senderParty, reference_data);
    }

    async sendTransaction(transactionToSend: TransactionValue, recipient: string, reference_data: string = null) {

        const sender = this.web3Signer.address;
        const channelUuid = this.channelDef.channel_uuid;
        const definitionVersion = this.channelDef.definition_version;
        const baseZoneClientEndpoint = this.clientInfo.zone_location.zone_client_endpoint;

        ///////////////////////////////////////////////////////////////////////////////////////////
        // 1. This requests the backend to create a new transaction based on several parameters. //
        // This the first of 3 APIs that are required to transact.                               //
        ///////////////////////////////////////////////////////////////////////////////////////////

        const createTransactionResponse = await createNewTransaction(
            this.jwt,                   // my auth token
            baseZoneClientEndpoint,     // my current zone
            sender,                     // my account
            channelUuid,                // my channel UUID
            definitionVersion,          // my channel version
            recipient,                  // where to send the funds
            transactionToSend           // the transaction to send
        );
        console.log("createTransactionResponse", JSON.stringify(createTransactionResponse.result));

        // Check valid
        if (createTransactionResponse.error || !createTransactionResponse.result) {
            console.error("Unable to create new transaction", createTransactionResponse);
            return Promise.reject(createTransactionResponse);
        }

        // TODO Validate the response ... how?

        //////////////////////////////////////////////////////////////
        // 2. Submit a signed transaction to the backend.           //
        // This the second of 3 APIs that are required to transact. //
        //////////////////////////////////////////////////////////////

        const createTransaction = createTransactionResponse.result;

        // Copy reference_data back onto every field
        createTransaction.reference_data = reference_data;

        // Build message definition
        const transactionMessage = await getTransactionDefinitionTypedMessage(createTransaction, "Transaction");

        // Sign it
        const createNewTransactionTypedSignature = signTypedData_v4(this.web3Signer, transactionMessage);

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
        const transactionSummaryTypedSignature = signTypedData_v4(this.web3Signer, transactionSummaryMessage);
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

        return completeTransactionResult;
    }
}
