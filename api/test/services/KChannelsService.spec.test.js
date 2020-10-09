import lodash from 'lodash';
import chai from 'chai';
const {expect} = chai;

const KChannelsService = require('../../src/services/KChannelsService');

describe.only('KChannelsService tests', async () => {

  describe('getAuthChallenge()', async () => {
    it('Gets auth challenge', async () => {
      const autChannel = await KChannelsService.getAuthChallenge('0x54BFB3a5E2e5999B9E2fd63def9750CA667Adc5B', 1);
      console.log(autChannel);
    });
  });

  describe('getAuthChallenge()', async () => {
    it('Gets auth challenge', async () => {
      const autChannel = await KChannelsService.getAuthChallenge('0x54BFB3a5E2e5999B9E2fd63def9750CA667Adc5B', 1);
      console.log(autChannel);
    });
  });

});
