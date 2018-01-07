'use strict';

module.exports = () => {
    const mongo = new _ZIMongo({
            connections: {
                Test: {uri: '127.0.0.1/Test'},
            },
            debug: false,
        }),
        Test = mongo.model({
            name: 'TestDetail',
            attrs: {
                name: {type: 'String'},
            },
            connection: 'Test',
        });
    describe('_read', () => {
        it('catch: _id is required', () => {
            const detail = () => Test._read();
            _expect(detail).to.throw('zi-mongo: _id is required');
        });
        it('catch: _id must be "ObjectId"', () => {
            const detail = () => Test._read('asdf');
            _expect(detail).to.throw('zi-mongo: _id must be "ObjectId"');
        });
        it('default', (done) => {
            Test._create({name: 'J'})
                .then((doc) => Test._read(doc._id))
                .then((doc) => {
                    _expect(doc.name).to.be.equal('J');
                    _expect(doc._model).to.be.undefined;
                    _expect(doc._createDate).to.be.an.instanceof(Date);
                    return Test._delete(doc._id, 'physical');
                })
                .then(() => done())
                .catch(done);
        });
        it('null doc', (done) => {
            Test._read('5a21d49b7e7fee0cb46fff77')
                .then((doc) => {
                    _expect(doc).to.be.null;
                    done();
                })
                .catch(done);
        });
        it('lean = false', (done) => {
            Test._create({name: 'J'})
                .then((doc) => Test._read(doc._id, {lean: false}))
                .then((doc) => {
                    _expect(doc.name).to.be.equal('J');
                    _expect(doc._model).to.be.undefined;
                    _expect(doc.toJSON).to.be.a('function');
                    _expect(doc._createDate).to.be.an.instanceof(Date);
                    return doc.remove();
                })
                .then(() => done())
                .catch(done);
        });
        it('json', (done) => {
            Test._create({name: 'J'})
                .then((doc) => Test._read(doc._id, {json: true}))
                .then((doc) => {
                    _expect(doc.name).to.be.equal('J');
                    _expect(doc.toJSON).to.be.undefined;
                    _expect(doc._model).to.exist;
                    _expect(doc._createDate).to.be.string;
                    return Test._delete(doc._id, 'physical');
                })
                .then(() => done())
                .catch(done);
        });
        it('select', (done) => {
            let td1;
            Test._create({name: 'J'})
                .then((doc) => Test._read(doc._id, {select: '-name'}))
                .then((doc) => {
                    td1 = doc;
                    _expect(doc.name).to.be.undefined;
                    _expect(doc._model).to.be.undefined;
                    _expect(doc._createDate).to.be.string;
                    return Promise.resolve();
                })
                .then(() => Test._read(td1._id, {select: ['-name']}))
                .then((doc) => {
                    _expect(doc.name).to.be.undefined;
                    _expect(doc._model).to.be.undefined;
                    _expect(doc._createDate).to.be.string;
                    return Test._delete(doc._id, 'physical');
                })
                .then(() => done())
                .catch(done);

        });
        it('populate', (done) => {
            Test._create({name: 'J'})
                .then((doc) => Test._create({name: 'J2', j: doc._id}))
                .then((doc) => Test._read(doc._id, {populate: [{path: 'j', model: Test}]}))
                .then((doc) => {
                    // console.log('#doc', require('util').inspect(doc, false, 5, true));
                    _expect(doc.name).to.be.equal('J2');
                    _expect(doc.j).to.be.object;
                    _expect(doc.j.name).to.be.equal('J');
                    return Test._delete(doc._id, 'physical')
                        .then(() => Test._delete(doc.j._id, 'physical'));
                })
                .then(() => done())
                .catch(done);
        });
    });
};