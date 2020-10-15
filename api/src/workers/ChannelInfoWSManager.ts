import {ChannelAsset, ChannelInfo} from "../types/kchannel";
import {AssetSwapChannelState} from '../models';
import {WebSocketSetup} from "../types/internal";

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

                    // find any xDAi state updates
                    const xDaiState: ChannelAsset | null = _.find(message.channel_state.channel_asset_list, {
                        "smart_contract": "0xD62fB951A937e1f6afEEECf1a778c4A5ddeD791d",
                        "chain_id": "100"
                    });
                    console.log("xDaiState found", xDaiState);
                    if (xDaiState) {
                        await AssetSwapChannelState.storeCurrentChannelState(channelUuid, message.channel_state.nonce, message.channel_state_hash, xDaiState)
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
