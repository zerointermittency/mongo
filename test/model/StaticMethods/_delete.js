'use strict';

module.exports = () => {
    const mongo = new _ZIMongo({
            connections: {
                Test: {uri: '127.0.0.1/Test'},
            },
            debug: false,
        }),
        Test = mongo.model({
            name: 'TestDelete',
            attrs: {
                name: {type: 'String'},
            },
            connection: 'Test',
        });
    describe('_delete', () => {
        it('logical', (done) => {
            let td1;
            Test._create({name: 'J'})
                .then((doc) => {
                    td1 = doc;
                    return Test._delete(doc._id, 'logical');
                })
                .then(() => Test._delete(td1._id, 'logical'))
                // .then((doc) => Test._delete(doc._id)) => defualt type delete 'logical'
                .then((doc) => {
                    _expect(doc._deleted).to.be.true;
                    _expect(doc._deleteDate).to.be.an.instanceof(Date);
                    // console.log('#doc', require('util').inspect(doc, false, 5, true));
                    return doc.remove();
                })
                .then(() => Test._delete(td1._id, 'logical'))
                .then((doc) => {
                    _expect(doc).to.be.equal(null);
                    return Promise.resolve();
                })
                .then(() => {
                    const throwId = () => Test._delete(null, 'logical');
                    const throwType = () => Test._delete(td1._id, null);
                    _expect(throwId).to.throw('zi-mongo: _id is required to _delete document');
                    _expect(throwType).to.throw('zi-mongo: Invalid type "null" to _delete document');
                    return Promise.resolve();
                })
                .then(done)
                .catch(done);
        });
        it('physical', (done) => {
            Test._create({name: 'J'})
                .then((doc) => Test._delete(doc._id, 'physical'))
                .then((doc) => {
                    // console.log('#doc', require('util').inspect(doc, false, 5, true));
                    Test.findOne(doc._id).exec((err, doc) => {
                        _expect(err).to.be.null;
                        _expect(doc).to.be.null;
                        done();
                    });
                });
        });
    });
};