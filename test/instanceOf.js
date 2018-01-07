'use strict';

describe('instance of Mongo', function () {
    it('success', (done) => {
        const mongo = new _ZIMongo({
            connections: {
                Core: {uri: '127.0.0.1/Core'},
            },
            // debug: true, // default false
        });
        _expect(mongo.connections).to.have.key('Core');
        done();
    });
    it('catch', (done) => {
        const mongo = () => new _ZIMongo({
            connections: {},
        });
        _expect(mongo).to.throw('Required connections');
        done();
    });
});