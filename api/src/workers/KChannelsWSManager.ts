import {
    getAuthChallenge,
    getAuthenticationTypedMessage,
    getClientInfo,
    completeAuthChallenge,
    createChannelDefinition,
    getChannelDefinitionTypedMessage,
    updateAndCompleteChannelDefinition
} from "../services/KChannelsService";

import {Account} from "web3-core";
import {ChannelInfoWSManager} from "./ChannelInfoWSManager";
import {AuthenticationSuccess, ChannelDefinition, ClientInfo} from "../types/kchannel";
import {TransactionWSManager} from "./TransactionWSManager";

const sigUtil = require('eth-sig-util');

/*
    --------------
    -- stage 1. --
    --------------

    -- AUTH
    1. request auth challenge
    2. fulfill challenge
    3. store success / JWT token (24 hr timeout)

    -- Load channel info
    4. request and store channel info

    -- Setup quote fulfillment
    5. store websocket subscribe to channel updates
    6. quotes can now be fulfilled

    --------------
    -- stage 2. --
    --------------

    QUOTES CAN NOW BE ISSUED

    --------------
    -- stage 3. --
    --------------

    7. websocket watching transaction
    8. transaction_status = COMPLETED (will include tx from myself) - recipient_party = me
    9. Transaction.reference_data - quote field
        - if no reference_data specified send the funds back
 */

export class KChannelsWSManager {

    private readonly web3Signer: Account;
    private readonly signerAddress: string;
    private web3: any;

    constructor(props) {
        const {web3Signer, web3} = props;
        this.web3 = web3;
        this.web3Signer = web3Signer;
        this.signerAddress = web3Signer.address;
    }

    async start() {
        // Check connected
        console.log("Signer address", this.signerAddress);
        console.log("Latest block no.", await this.web3.eth.getBlockNumber());
        console.log("Is connected to the network", this.web3.currentProvider.connected);
        console.log("Current signer onchain balance", await this.web3.eth.getBalance(this.signerAddress));

        const {jwt} = await this.authenticateToKChannels();
        console.log("jwt", jwt);

        const channelDef: ChannelDefinition = await this.getChannelDefinition(jwt);
        console.log("channelDef", channelDef);

        const clientInfo: ClientInfo = await getClientInfo(jwt);
        console.log("clientInfo", clientInfo);

        // Start the Channel info websocket
        const channelInfoWebsocket = await new ChannelInfoWSManager({
            clientInfo,
            channelDef,
            jwt,
        }).start();

        // Start the transaction manager
        const transactionWSManagerPromise = await new TransactionWSManager({
            clientInfo,
            channelDef,
            jwt,
        }).start();

    }

    async authenticateToKChannels(): Promise<AuthenticationSuccess> {

        // FIXME check stored JWT and if expired
        //   if not expired, use it
        //   if expired, generate and store new one

        // Get auth challenge
        const authChallenge = await getAuthChallenge(this.signerAddress);
        console.log("authChallenge", authChallenge);

        // Convert to typed 712 message
        const authTypedParams = getAuthenticationTypedMessage(authChallenge);

        // Sign payload
        const authTypedSignature = sigUtil.signTypedData_v4(
            Buffer.from(this.web3Signer.privateKey.substr(2), 'hex'),
            {data: authTypedParams}
        );

        // FIXME store jwt and expiry
        const authResponse = await completeAuthChallenge(authChallenge, authTypedSignature);
        console.log("authResponse", authResponse);

        return authResponse;
    }

    async getChannelDefinition(jwt): Promise<ChannelDefinition> {
        const channelDef = await createChannelDefinition(jwt);

        // Sign definition and add as a signature
        const createChannelTypedParams = getChannelDefinitionTypedMessage(channelDef)
        const createChannelTypedSignature = sigUtil.signTypedData_v4(
            Buffer.from(this.web3Signer.privateKey.substr(2), 'hex'),
            {data: createChannelTypedParams}
        );

        // Append signature
        channelDef.signature_list = [createChannelTypedSignature];

        // Complete channel ready for subscriptions
        const updateAndComplete = await updateAndCompleteChannelDefinition(jwt, channelDef)
        console.log("updateAndComplete", updateAndComplete);

        return updateAndComplete;
    }

}
