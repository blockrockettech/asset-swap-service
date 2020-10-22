import {ChannelAsset, ChannelInfo} from "../types/kchannel";
import {AssetSwapChannelState} from '../models';
import {WebSocketSetup} from "../types/internal";
import {DAI, XDAI} from "../types/coins";

const _ = require('lodash');
const WebSocket = require('ws');

export class ChannelInfoWSManager {

    private readonly jwt: any;
    private readonly clientInfo: any;
    private readonly channelDef: any;

    constructor({channelDef, clientInfo, jwt}: WebSocketSetup) {
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

        const webSocketSubscription = `${zoneClientEndpoint}/ws/channel/${channelUuid}/${definitionVersion}/?access_token=${this.jwt}`;
        const wss = new WebSocket(webSocketSubscription);

        wss.on('open', () => {
            console.log('connected');
        });

        wss.on('close', () => {
            console.log('disconnected');
        });

        wss.on('message', async (rawData: string) => {
            console.log(rawData);

            // Unpack into object
            const message: ChannelInfo = JSON.parse(rawData);

            // handle provision only at first for channel balances
            switch (message.channel_status) {
                case 'Provisioned': {

                    console.log("Handle Provisioned channel state", rawData);

                    // find any xDAI state updates
                    const xDaiState: ChannelAsset | null = _.find(message.channel_state.channel_asset_list, {
                        "smart_contract": XDAI.smart_contract,
                        "chain_id": XDAI.chain_id
                    });
                    if (xDaiState) {
                        console.log("XDAI state found", xDaiState);
                        await AssetSwapChannelState.storeCurrentChannelState(channelUuid, message.channel_state.nonce, message.channel_state_hash, xDaiState)
                    }


                    // find any DAI state updates
                    const daiState: ChannelAsset | null = _.find(message.channel_state.channel_asset_list, {
                        "smart_contract": DAI.smart_contract,
                        "chain_id": DAI.chain_id
                    });
                    if (daiState) {
                        console.log("DAI state found", daiState);
                        await AssetSwapChannelState.storeCurrentChannelState(channelUuid, message.channel_state.nonce, message.channel_state_hash, daiState)
                    }
                }

                // ignore all others for now
            }
        });

        wss.on('error', (error) => {
            console.log('error - something bad happened', error);
        });

        return this;
    }


}
