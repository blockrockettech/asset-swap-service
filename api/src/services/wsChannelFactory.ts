import {getKChannelWssBase} from "./KChannelsService";

const WebSocket = require('ws');

export default function openWsChannelDefinition(chainId, channelUuid, channelDefVersion, jwtToken) {

    const wss = new WebSocket(`${getKChannelWssBase(chainId)}/${channelUuid}/${channelDefVersion}/?access_token=${jwtToken}`);

    wss.on('open', function open() {
        console.log('connected');
    });

    wss.on('close', function close() {
        console.log('disconnected');
    });

    wss.on('message', function incoming(data) {
        // TODO handle inbound message
        //  check type
        //  marry up to quote
        //  validate and consume ...
        //  perform asset swap and reply
    });

    wss.on('error', (error) => {
        console.log('error - something bad happened', error);
        throw error;
    });

    return wss;
}
