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
import {signTypedData_v4} from "../services/web3Signer";

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
            web3Signer: this.web3Signer,
            clientInfo,
            channelDef,
            jwt,
        }).start();

        // Start the transaction manager
        const transactionWSManagerPromise = await new TransactionWSManager({
            web3Signer: this.web3Signer,
            clientInfo,
            channelDef,
            jwt,
        }).start();

        // TODO manage disconnect, reconnects, auth changes for both WS managers
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
        const authTypedSignature = signTypedData_v4(this.web3Signer, authTypedParams);

        // FIXME store jwt and expiry
        const authResponse = await completeAuthChallenge(authChallenge, authTypedSignature);
        console.log("authResponse", authResponse);

        return authResponse;
    }

    async getChannelDefinition(jwt): Promise<ChannelDefinition> {
        const channelDef = await createChannelDefinition(jwt);

        // Sign definition and add as a signature
        const createChannelTypedParams = getChannelDefinitionTypedMessage(channelDef)
        const createChannelTypedSignature = signTypedData_v4(this.web3Signer, createChannelTypedParams);

        // Append signature
        channelDef.signature_list = [createChannelTypedSignature];

        // Complete channel ready for subscriptions
        const updateAndComplete = await updateAndCompleteChannelDefinition(jwt, channelDef)
        console.log("updateAndComplete", updateAndComplete);

        return updateAndComplete;
    }

}
