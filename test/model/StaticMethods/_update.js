'use strict';

module.exports = () => {
    const mongo = new _ZIMongo({
            connections: {
                Test: {uri: '127.0.0.1/Test'},
            },
            debug: false,
        }),
        Test = mongo.model({
            name: 'TestUpdate',
            attrs: {
                name: {type: 'String'},
                number: {type: 'Number'},
                other: {type: 'ObjectId'},
            },
            connection: 'Test',
        });
    describe('_update', () => {
        it('catch: Param must be a "object" to _update document', () => {
            const update = () => Test._update();
            _expect(update).to.throw('zi-mongo: Param must be a "object" to _update document');
        });
        it('catch: _id is required to _update document', () => {
            const update = () => Test._update({});
            _expect(update).to.throw('zi-mongo: _id is required to _update document');
        });
        it('catch: Invalid type "null" to _update document', () => {
            const update = () => Test._update({_id: 'asdf'}, null);
            _expect(update).to.throw('zi-mongo: Invalid type "null" to _update document');
        });
        it('patch', (done) => {
            let _id,
                t2;
            Test._create({name: 't2', foo: 'foo'})
                .then((doc) => {
                    t2 = doc;
                    return Test._create({name: 't1', foo: 'foo', other: doc._id});
                })
                .then((doc) => {
                    _id = doc._id;
                    // console.log(Object.keys(doc));
                    _expect(doc.name).to.be.equal('t1');
                    _expect(doc.foo).to.be.equal('foo');
                    // console.log('#doc', require('util').inspect(doc, false, 5, true));
                    return Promise.resolve(doc);
                })
                .then((doc) => Test._update({_id: doc._id, foo: 'bar', a: {b: 'c'}, other: t2._id}, 'patch'))
                .then((doc) => {
                    // console.log(Object.keys(doc));
                    // console.log('#doc', require('util').inspect(doc, false, 5, true));
                    // console.log(doc.constructor.name)
                    // console.log(typeof doc.name)
                    // console.log(typeof doc.foo)
                    _expect(doc.name).to.be.equal('t1');
                    _expect(doc.get('foo')).to.be.equal('bar');
                    _expect(doc.get('a').b).to.be.equal('c');
                    _expect(doc._updateDate).to.be.an.instanceof(Date);
                    return doc.remove();
                })
                .then(() => Test._update({_id: _id}, 'patch'))
                .then((doc) => {
                    _expect(doc).to.be.null;
                    return Promise.resolve();
                })
                .then(() => done())
                // .catch(done);
                .catch((err) => {
                    console.log('#err', require('util').inspect(err, 0, 10, 1));
                    done();
                });
        });
        it('patch: with errors', (done) => {
            Test._create({name: 't1', foo: 'foo'})
                .then((doc) => {
                    _expect(doc.name).to.be.equal('t1');
                    _expect(doc.foo).to.be.equal('foo');
                    return Promise.resolve(doc);
                })
                .then((doc) => Test._update({_id: doc._id, number: 'foo:bar'}, 'patch'))
                .catch((err) => {
                    _expect(err.level).to.be.equal('error');
                    _expect(err.code).to.be.equal(101);
                    _expect(err.extra.number)
                        .to.be.equal('Cast to Number failed for value "foo:bar" at path "number"');
                    // console.log('#err', require('util').inspect(err, 0, 10, 1));
                    done();
                });
        });
        it('patch $unset', (done) => {
            Test._create({name: 't1', foo: 'foo', a: {b: '1', c: '2'}, number: 1})
                .then((doc) => {
                    // console.log(Object.keys(doc));
                    _expect(doc.name).to.be.equal('t1');
                    _expect(doc.foo).to.be.equal('foo');
                    // console.log('#doc', require('util').inspect(doc, false, 5, true));
                    return Promise.resolve(doc);
                })
                // .then((doc) => Test._update({_id: doc._id, foo: 'bar', a: {b: 'c'}}, 'patch'))
                .then((doc) => Test._update({
                    _id: doc._id, $unset: ['foo', '_updateDate'], number: 2, a: {b: 'c'},
                }))
                .then((doc) => {
                    // console.log(Object.keys(doc));
                    // console.log('#doc', require('util').inspect(doc, false, 5, true));
                    // console.log(doc.constructor.name)
                    // console.log(typeof doc.name)
                    // console.log(typeof doc.foo)
                    _expect(doc.name).to.be.equal('t1');
                    _expect(doc.get('foo')).to.be.undefined;
                    _expect(doc.get('number')).to.be.equal(2);
                    _expect(doc.get('a').b).to.be.equal('c');
                    _expect(doc.get('a').c).to.be.equal('2');
                    doc.remove(done);
                })
                .catch(done);
        });
        it('put', (done) => {
            Test._create({name: 't1', foo: 'foo', number: 1})
                .then((doc) => {
                    // console.log(Object.keys(doc));
                    _expect(doc.name).to.be.equal('t1');
                    _expect(doc.foo).to.be.equal('foo');
                    // console.log('#doc', require('util').inspect(doc, false, 5, true));
                    return Promise.resolve(doc);
                })
                .then((doc) => Test._update({_id: doc._id, a: {b: 'c'}, number: 2}, 'put'))
                .then((doc) => {
                    // console.log(Object.keys(doc));
                    // console.log('#doc', require('util').inspect(doc, false, 5, true));
                    // console.log(doc.constructor.name)
                    // console.log(typeof doc.name)
                    // console.log(typeof doc.foo)
                    _expect(doc.name).to.be.undefined;
                    _expect(doc.get('number')).to.be.equal(2);
                    _expect(doc.get('foo')).to.be.undefined;
                    _expect(doc.get('a').b).to.be.equal('c');
                    doc.remove(done);
                })
                .catch(done);
        });
    });
};