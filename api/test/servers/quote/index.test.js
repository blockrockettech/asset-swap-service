import {sinon, server, QUOTE_URL, expect} from '../../setup';
import {AssetSwapChannelState} from '../../../src/models';
import quoteService from '../../../src/services/QuoteService';
import {v4 as uuidv4} from 'uuid';

describe('Quote server tests', () => {

  afterEach(function () {
    sinon.restore();
  });

  function generateQuote(payload) {
    return server
      .post(QUOTE_URL)
      .send({
        id: '1',
        jsonrpc: '2.0',
        method: 'generate_quote',
        params: payload
      });
  }

  describe.only('validation', async () => {

    describe('pair validation', async () => {
      it('fails when pair is not valid', (done) => {
        generateQuote({
          'channel_uuid': 'a0244043-649a-4c7f-9975-b68849bca434',
          'input': {
            'smart_contract': '0xD62fB951A937e1f6afEEECf1a778c4A5ddeD791d',
            'kind': 'Value',
            'value': '100000000000000000'
          },
          'output': {
            'smart_contract': '0xD62fB951A937e1f6afEEECf1a778c4A5ddeD791d',
            'kind': 'Value',
            'value': '100000000000000000'
          }
        })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.error).to.be.deep.equal({
              code: -32602,
              message: 'Invalid pair'
            });
            done();
          });
      });
      it('fails when pair is partial', (done) => {
        generateQuote({
          'channel_uuid': 'a0244043-649a-4c7f-9975-b68849bca434',
          'input': {
            'smart_contract': '0xD62fB951A937e1f6afEEECf1a778c4A5ddeD791d',
            'kind': 'Value',
            'value': '100000000000000000'
          },
          'output': {
            'smart_contract': '',
            'kind': 'Value',
            'value': '100000000000000000'
          }
        })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.error).to.be.deep.equal({
              code: -32602,
              message: 'Invalid pair'
            });
            done();
          });
      });
    });

    describe('channel balances', async () => {
      it('fails when cannot satisfy swap', (done) => {

        // ensure zero balance
        sinon.stub(AssetSwapChannelState, 'getChannelBalance').returns(Promise.resolve(0));

        generateQuote({
          'channel_uuid': 'a0244043-649a-4c7f-9975-b68849bca434',
          'input': {
            'smart_contract': '0xD62fB951A937e1f6afEEECf1a778c4A5ddeD791d',
            'kind': 'Value',
            'value': '100000000000000000'
          },
          'output': {
            'smart_contract': '0x6b175474e89094c44da98b954eedeac495271d0f',
            'kind': 'Value',
            'value': '100000000000000000'
          }
        })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.error).to.be.deep.equal({
              code: -32000,
              message: `Unable to satisfy swap, balance to low`
            });
            done();
          });
      });
    });

    describe('creating a quote', () => {

      it('is successful', (done) => {
        // ensure enough balance
        sinon.stub(AssetSwapChannelState, 'getChannelBalance').returns(Promise.resolve('100000000000000001'));

        const expectedQuote = {
          quote_id: uuidv4(),
          fee: '100000'
        };
        sinon.stub(quoteService, 'generateQuote').returns(Promise.resolve(expectedQuote));

        generateQuote({
          'channel_uuid': 'a0244043-649a-4c7f-9975-b68849bca434',
          'input': {
            'smart_contract': '0xD62fB951A937e1f6afEEECf1a778c4A5ddeD791d',
            'kind': 'Value',
            'value': '100000000000000000'
          },
          'output': {
            'smart_contract': '0x6b175474e89094c44da98b954eedeac495271d0f',
            'kind': 'Value',
            'value': '100000000000000000'
          }
        })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.result).to.be.deep.equal({
              'fee': expectedQuote.fee,
              'from': {
                'kind': 'Value',
                'smart_contract': '0xD62fB951A937e1f6afEEECf1a778c4A5ddeD791d',
                'value': '100000000000000000'
              },
              'quote_id': expectedQuote.quote_id,
              'success': true,
              'to': {
                'kind': 'Value',
                'smart_contract': '0x6b175474e89094c44da98b954eedeac495271d0f',
                'value': '100000000000000000'
              },
              'totalPayable': '100000000000100000'
            });
            done();
          });
      });
    });
  });

});
