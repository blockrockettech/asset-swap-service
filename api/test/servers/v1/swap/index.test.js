import {sinon, ethers, server, SWAP_URL, expect} from "../../../setup";
import Quote from "../../../../src/models/Quote";
import Web3Service from "../../../../src/services/Web3Service";
import kChannelService from "../../../../src/services/kChannelService";

describe('Swap server tests', () => {
    afterEach(function () {
        sinon.restore();
    });

    describe('Given a quote', () => {
        it.only('Facilitates a swap', done => {
            const getQuoteResponse = [
                {
                    input: 'DAI',
                    amount: 400.00,
                    fee: 0.50,
                    channel_id: 'uuid'
                }
            ];

            sinon.stub(Quote, 'getQuote').returns(Promise.resolve(getQuoteResponse));
            sinon.stub(Web3Service, 'validateSignature').returns(Promise.resolve(true));
            sinon.stub(kChannelService, 'getUserBalanceAndApprovalAmounts').returns(Promise.resolve({
                balance: ethers.BigNumber.from('5'),
                allowance: ethers.BigNumber.from('5')
            }))

            server
                .post(SWAP_URL)
                .send({
                    id: "1",
                    jsonrpc: "2.0",
                    method: "swap",
                    params: {
                        chainId: '',
                        channelId: '',
                        quoteId: '',
                        message: '',
                        signature: ''
                    }
                })
                .expect(200)
                .end((err, res) => {
                    expect(res.status).to.equal(200);

                    const {result} = res.body;
                    console.log('rpc result', result);
                    // const {requestDetails, quote} = result;
                    // expect(requestDetails).to.be.deep.equal({
                    //     channelId, input, output, amount
                    // });
                    //
                    // const {id, ...quoteDetails} = quote;
                    // const uuidV4RegEx = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
                    // expect(uuidV4RegEx.test(id)).to.be.true; // ID is a valid v4 UUID
                    //
                    // expect(quoteDetails).to.be.deep.equal({
                    //     fee: returnedFee,
                    //     outputAfterFee: returnedOutputAfterFee
                    // });

                    done();
                });
        });
    });
})
