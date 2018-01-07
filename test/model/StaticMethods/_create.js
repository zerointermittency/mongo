'use strict';

module.exports = () => {
    const mongo = new _ZIMongo({
            connections: {
                Test: {uri: '127.0.0.1/Test'},
            },
            debug: false,
        }),
        Test = mongo.model({
            name: 'TestCreate',
            attrs: {
                name: {type: 'String'},
            },
            connection: 'Test',
        });
    describe('_create', () => {
        it('catch: param must a be "object"', () => {
            let create = () => Test._create();
            _expect(create).to.throw('zi-mongo: Param must be a "object"');
        });
        it('success', (done) => {
            Test._create({name: 'J'})
                .then((doc) => {
                    _expect(doc._id).to.exist;
                    _expect(doc.name).to.be.equal('J');
                    _expect(doc._createDate).to.be.an.instanceof(Date);
                    doc.remove(done);
                });
        });
        it('validate errors', (done) => {
            Test._create({name: {foo: 'bar'}})
                .catch((err) => {
                    _expect(err.name).to.be.equal('validate');
                    _expect(err.code).to.be.equal(101);
                    let throwErr = () => {throw err;};
                    _expect(throwErr).to.throw('zi-mongo: Validate error');
                    _expect(err.extra.name).to.be
                        .equal('Cast to String failed for value "{ foo: \'bar\' }" at path "name"');
                    done();
                });
        });
    });
};