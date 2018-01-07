'use strict';

module.exports = () => {
    const mongo = new _ZIMongo({
            connections: {
                Test: {uri: '127.0.0.1/Test'},
            },
            debug: false,
        }),
        Test = mongo.model({
            name: 'TestRestore',
            attrs: {
                name: {type: 'String'},
            },
            connection: 'Test',
        });
    describe('restore', () => {
        it('catch: _id is required', () => {
            const restore = () => Test._restore();
            _expect(restore).to.throw('zi-mongo: _id is required');
        });
        it('catch: _id must be "ObjectId"', () => {
            const restore = () => Test._restore({_id: 'asdf'});
            _expect(restore).to.throw('zi-mongo: _id must be "ObjectId"');
        });
        it('success', (done) => {
            Test._create({name: 't1'})
                .then((t1) => Test._delete(t1._id))
                .then((t1) => {
                    _expect(t1.name).to.be.equal('t1');
                    _expect(t1._deleted).to.be.true;
                    return Promise.resolve(t1);
                })
                .then((t1) => Test._restore(t1._id))
                .then((t1) => {
                    _expect(t1.name).to.be.equal('t1');
                    _expect(t1._deleted).to.be.false;
                    done();
                });
        });
        it('null doc', (done) => {
            Test._restore('5a21d49b7e7fee0cb46fff77')
                .then((doc) => {
                    _expect(doc).to.be.null;
                    return Promise.resolve();
                })
                .then(done)
                .catch(done);
        });
    });
};