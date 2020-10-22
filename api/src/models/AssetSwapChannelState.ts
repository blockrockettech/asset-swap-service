import {ChannelAsset} from "../types/kchannel";
import {utils} from "ethers";

const {getAddress} = utils;

// TODO replace this whole class with an ORM to save ones sanity!
class AssetSwapChannelState {

    private client: any;

    constructor(client) {
        this.client = client;
        this.client.on('error', (err, client) => `Error, ${err}, on idle client${client}`);
    }

    async storeCurrentChannelState(channelUuid: string, nonce: string, channel_state_hash: string, channelInfo: ChannelAsset) {
        return this.client.query(`
            INSERT INTO asset_swap_channel_state(channel_uuid, nonce, channel_state_hash, smart_contract, chain_id, value)
            VALUES('${channelUuid}', '${parseInt(nonce)}', '${channel_state_hash}', '${getAddress(channelInfo.smart_contract)}', ${channelInfo.chain_id}, ${channelInfo.value});
        `);
    }

    async getChannelBalance(smart_contract: string): Promise<string> {
        // TODO this wont scale ... how to properly key, index state data

        const queryResult = await this.client.query(
            `SELECT value FROM asset_swap_channel_state WHERE smart_contract = '${getAddress(smart_contract)}' ORDER BY nonce DESC LIMIT 1`
        );
        if (queryResult.rows && queryResult.rows.length === 1) {
            return queryResult.rows[0].value;
        }
        return null;
    }
}

export default AssetSwapChannelState;
