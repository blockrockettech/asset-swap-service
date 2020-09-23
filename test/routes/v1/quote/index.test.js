import { expect, server, quote_url } from '../../../setup';

describe('Quote route tests', () => {
    it('gets all quotes', done => {
        server
            .get(`${quote_url('4')}/allQuotes`)
            .expect(200)
            .end((err, res) => {
                expect(res.status).to.equal(200);

                console.log(res.body);

                done();
            });
    });

    describe('Creating quotes', () => {
       it.skip('is able to get a quote', done => {
           server
               .post(quote_url('4'))
               .send({
                   channelId: "1c5558b2-e822-4ad1-9a5e-dce6c51e8bb4",
                   input: "DAI",
                   output: "xDAI",
                   amount: "657"
               })
               .expect(200)
               .end((err, res) => {
                   expect(res.status).to.equal(200);

                   console.log(res.body);

                   done();
               });
       });
    });
});
