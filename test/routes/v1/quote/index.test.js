import { sinon, expect, server, quote_url } from '../../../setup';
import Quote from "../../../../src/models/Quote";
import FeeService from "../../../../src/services/FeeService";

describe('Quote route tests', () => {
    afterEach(function () {
        sinon.restore();
    });

    it('gets all quotes', done => {
        const quotes = [
            {
                quote_id: '1c5558b2-e822-4ad1-9a5e-dce6c51e8bb4',
                channel_id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
                input: 'DAI',
                output: 'xDAI',
                amount: 40,
                fee: 0.04,
                used: false,
                chain_id: 4
            }
        ];

        sinon.stub(Quote, 'getAll').returns(Promise.resolve(quotes));

        server
            .get(`${quote_url('4')}/allQuotes`)
            .expect(200)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.be.deep.equal({
                    quotes
                });
                done();
            });
    });

    describe('Creating quotes', () => {
       it('is able to get a quote', done => {
           // the method doesn't currently return anything
           sinon.stub(Quote, 'addQuote').returns(Promise.resolve(null));

           const channelId = "1c5558b2-e822-4ad1-9a5e-dce6c51e8bb4";
           const input = "DAI";
           const output = "xDAI";
           const amount = "657";

           server
               .post(quote_url('4'))
               .send({
                   channelId,
                   input,
                   output,
                   amount
               })
               .expect(200)
               .end((err, res) => {
                   expect(res.status).to.equal(200);

                   const {requestDetails, quote} = res.body;
                   expect(requestDetails).to.be.deep.equal({
                       channelId, input, output, amount
                   });

                   const {id, ...quoteDetails} = quote;
                   const uuidV4RegEx = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
                   expect(uuidV4RegEx.test(id)).to.be.true; // ID is a valid v4 UUID

                   const fee = FeeService.getDAISwapFee(amount);
                   const outputAfterFee = parseFloat(amount) - fee;
                   expect(quoteDetails).to.be.deep.equal({
                       fee,
                       outputAfterFee
                   });

                   done();
               });
       });
    });
});
