import lodash from 'lodash';
import chai from 'chai';

const {expect} = chai;

const {ChannelInfoWSManager} = require('../../src/workers/ChannelInfoWebSocketManager');

describe.only('ChannelInfoWebSocketManager tests', async () => {

  describe('setup()', async () => {
    it('auth me ', async () => {
      const channelInfoWebSocketManager = new ChannelInfoWSManager();
      const result = await channelInfoWebSocketManager.start();
      console.log(result);
    });
  });
});
