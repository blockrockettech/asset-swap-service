import { expect, server, INFO_URL } from '../../setup';

import packageInfo from '../../../package.json';

describe('Info route tests', () => {
    it('gets info', done => {
        server
            .get(`${INFO_URL}`)
            .expect(200)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.name).to.equal(packageInfo.name);
                expect(res.body.version).to.equal(packageInfo.version);
                done();
            });
    });
});