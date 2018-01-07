'use strict';

module.exports = () => {
    const mongo = new _ZIMongo({
            connections: {
                Test: {uri: '127.0.0.1/Test'},
            },
            debug: false,
        }),
        Test = mongo.model({
            name: 'TestMerge',
            attrs: {
                name: {type: 'String'},
            },
            connection: 'Test',
        });
    describe('_merge', () => {
        before((done) => {
            Test.insertMany(
                [
                    {name: 't1', _externalId: '1'},
                    {name: 't2', _externalId: '2'},
                    {name: 't3', _externalId: '3'},
                    {name: 't4', _externalId: '4'},
                    {name: 't5', _externalId: '5'},
                    {name: 't01', _externalId: '101', _deleted: true},
                    {name: 't02', _externalId: '102', _deleted: true},
                    {name: 't03', _externalId: '103', _deleted: true},
                    {name: 't04', _externalId: '104', _deleted: true},
                    {name: 't05', _externalId: '105', _deleted: true},
                ],
                (err) => {
                    if (err) return done(err);
                    done();
                }
            );
        });
        it('catch: docs must be "Array"', () => {
            const throwDocs = () => Test._merge({docs: 'notArray'});
            _expect(throwDocs).to.throw('zi-mongo: docs must be "Array"');
        });
        it('only insert', (done) => {
            let elements = [
                    {name: 't21', _externalId: '101', _externalProvider: 't1'},
                    {name: 't22', _externalId: '102', _externalProvider: 't1'},
                    {name: 't23', _externalId: '103', _externalProvider: 't1'},
                    {name: 't24', _externalId: '104', _externalProvider: 't1'},
                    {name: 't25', _externalId: '105', _externalProvider: 't1'},
                ],
                opts = {
                    docs: elements,
                    compare: ['_externalId', '_externalProvider'],
                    find: {
                        _externalProvider: 't1',
                    },
                };

            Test._merge(opts)
                .then((result) => {
                    _expect(Object.keys(result.insert).length).to.be.equal(5);
                    _expect(Object.keys(result.update).length).to.be.equal(0);
                    _expect(Object.keys(result.remove).length).to.be.equal(0);
                    done();
                })
                .catch(done);
        });
        it('only update', (done) => {
            let elements = [
                    {name: 't21', _externalId: '101', _externalProvider: 't1'},
                    {name: 't22', _externalId: '102', _externalProvider: 't1'},
                    {name: 't23', _externalId: '103', _externalProvider: 't1'},
                    {name: 't24', _externalId: '104', _externalProvider: 't1'},
                    {name: 't25', _externalId: '105', _externalProvider: 't1'},
                ],
                opts = {
                    docs: elements,
                    compare: ['_externalId', '_externalProvider'],
                    find: {
                        _externalProvider: 't1',
                    },
                };

            Test._merge(opts)
                .then((result) => {
                    // console.log(result);
                    _expect(Object.keys(result.insert).length).to.be.equal(0);
                    _expect(Object.keys(result.update).length).to.be.equal(5);
                    _expect(Object.keys(result.remove).length).to.be.equal(0);
                    done();
                })
                .catch(done);
        });
        it('only remove', (done) => {
            let opts = {
                docs: [],
                compare: ['_externalId', '_externalProvider'],
                find: {
                    _externalProvider: 't1',
                },
                remove: {
                    type: 'physical',
                },
            };

            Test._merge(opts)
                .then((result) => {
                    _expect(Object.keys(result.insert).length).to.be.equal(0);
                    _expect(Object.keys(result.update).length).to.be.equal(0);
                    _expect(Object.keys(result.remove).length).to.be.equal(5);
                    done();
                })
                .catch(done);
        });
        it('insert, update and remove', (done) => {
            let elements = [
                    {name: 't6', _externalId: '6'},
                    {name: 't7', _externalId: '7'},
                    {name: 't01', _externalId: '101', foo: 'bar'},
                    {name: 't02', _externalId: '102', foo: 'bar'},
                    {name: 't03', _externalId: '103', foo: 'bar'},
                    {name: 't04', _externalId: '104', foo: 'bar'},
                    {name: 't05', _externalId: '105', foo: 'bar'},
                ],
                opts = {
                    docs: elements,
                    compare: ['_externalId', 'name', 'bar'],
                    find: {},
                };
            Test._merge(opts)
                .then((result) => {
                    _expect(Object.keys(result.insert).length).to.be.equal(2);
                    _expect(Object.keys(result.update).length).to.be.equal(5);
                    _expect(Object.keys(result.remove).length).to.be.equal(5);
                    done();
                })
                .catch(done);
        });
        it('compare string', (done) => {
            let elements = [
                    {name: 't1', _externalId: '1'},
                    {name: 't2', _externalId: '2'},
                    {name: 't3', _externalId: '3'},
                    {name: 't4', _externalId: '4'},
                    {name: 't5', _externalId: '5'},
                    {name: 't8', _externalId: '8'},
                    {name: 't01', _externalId: '101', foo: 'bar'},
                    {name: 't02', _externalId: '102', foo: 'bar'},
                    {name: 't03', _externalId: '103', foo: 'bar'},
                    {name: 't04', _externalId: '104', foo: 'bar'},
                    {name: 't05', _externalId: '105', foo: 'bar'},
                ],
                opts = {
                    docs: elements,
                    compare: '_externalId',
                    find: {},
                };
            Test._merge(opts)
                .then((result) => {
                    _expect(Object.keys(result.insert).length).to.be.equal(1);
                    _expect(Object.keys(result.update).length).to.be.equal(10);
                    _expect(Object.keys(result.remove).length).to.be.equal(2);
                    done();
                })
                .catch(done);
        });
        it('insert with deactivate update and remove', (done) => {
            let elements = [
                    {name: 't9', _externalId: '9'},
                    {name: 't10', _externalId: '10'},
                    {name: 't01', _externalId: '101'},
                    {name: 't02', _externalId: '102'},
                    {name: 't03', _externalId: '103'},
                    {name: 't04', _externalId: '104'},
                    {name: 't05', _externalId: '105'},
                ],
                opts = {
                    docs: elements,
                    compare: ['_externalId', 'name'],
                    find: {},
                    update: false,
                    remove: false,
                    insert: {
                        iterate: (doc) => doc,
                    },
                };
            Test._merge(opts)
                .then((result) => {
                    _expect(Object.keys(result.insert).length).to.be.equal(2);
                    _expect(result.update).to.be.undefined;
                    _expect(result.remove).to.be.undefined;
                    done();
                })
                .catch(done);
        });
        it('update: patch', (done) => {
            let elements = [
                    {name: 't01', _externalId: '101'},
                    {name: 't02', _externalId: '102'},
                    {name: 't03', _externalId: '103'},
                    {name: 't04', _externalId: '104'},
                    {name: 't05', _externalId: '105'},
                    {name: 't06', _externalId: '106'},
                    {name: 't07', _externalId: '107'},
                ],
                opts = {
                    docs: elements,
                    compare: ['_externalId', 'name'],
                    find: {},
                    insert: false,
                    remove: false,
                };
            Test._merge(opts)
                .then((result) => {
                    _expect(result.insert).to.be.undefined;
                    _expect(result.remove).to.be.undefined;
                    _expect(Object.keys(result.update).length).to.be.equal(5);
                    done();
                })
                .catch(done);
        });
        it('update: put', (done) => {
            let elements = [
                    {name: 't01', _externalId: '101'},
                    {name: 't02', _externalId: '102'},
                    {name: 't03', _externalId: '103'},
                    {name: 't04', _externalId: '104'},
                    {name: 't05', _externalId: '105'},
                    {name: 't06', _externalId: '106'},
                    {name: 't07', _externalId: '107'},
                ],
                opts = {
                    docs: elements,
                    compare: ['_externalId', 'name'],
                    find: {},
                    update: {
                        iterate: (doc) => doc,
                        type: 'put',
                    },
                    insert: false,
                    remove: false,
                };
            Test._merge(opts)
                .then((result) => {
                    _expect(result.insert).to.be.undefined;
                    _expect(result.remove).to.be.undefined;
                    _expect(Object.keys(result.update).length).to.be.equal(5);
                    done();
                })
                .catch(done);
        });
        it('remove: logical', (done) => {
            let opts = {
                docs: [],
                compare: ['_externalId', 'name'],
                find: {},
                insert: false,
                update: false,
            };
            Test._merge(opts)
                .then((result) => {
                    _expect(result.inser).to.be.undefined;
                    _expect(result.update).to.be.undefined;
                    _expect(Object.keys(result.remove).length).to.be.equal(15);
                    done();
                })
                .catch(done);
        });
        it('remove: physical', (done) => {
            let opts = {
                docs: [],
                compare: ['_externalId', 'name'],
                find: {},
                insert: false,
                update: false,
                remove: {type: 'physical'},
            };
            Test._merge(opts)
                .then((result) => {
                    _expect(result.inser).to.be.undefined;
                    _expect(result.update).to.be.undefined;
                    _expect(Object.keys(result.remove).length).to.be.equal(15);
                    done();
                })
                .catch(done);
        });
        after((done) => {
            Test.remove({}, done);
        });
    });
};