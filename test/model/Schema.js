'use strict';

module.exports = () => {
    const mongo = new _ZIMongo({
            connections: {
                Test: {uri: 'mongodb://127.0.0.1/Test'},
            },
            debug: false,
        }),
        Schema = mongo.model({
            name: 'Schema',
            attrs: {
                name: {type: 'String'},
            },
            methods: {
                hi: () => 'world',
            },
            post: {
                init: function() {
                    this._foo = 'bar';
                },
            },
            pre: {
                init: function(next) {
                    this._bar = 'foo';
                    next();
                },
            },
            connection: 'Test',
        }),
        SchemaIndexes = mongo.model({
            name: 'SchemaIndexes',
            attrs: {
                attr1: {type: 'String', index: true},
                attr2: {type: 'String'},
            },
            indexes: [{attr1: 1, attr2: 1}],
            connection: 'Test',
        });

    it('Schema check instance', function(done) {
        Schema._create({name: 'Schema'})
            .then((doc) => {
                _expect(doc.mongo()).to.be.an.instanceof(_ZIMongo);
                done();
            })
            .catch(done);
    });
    it('Schema custom method', function(done) {
        Schema._create({name: 'Schema 2'})
            .then((doc) => {
                _expect(doc.hi()).to.be.equal('world');
                done();
            })
            .catch(done);
    });
    it('Schema init hooks', function(done) {
        Schema._create({name: 'Schema 3'})
            .then((doc) => Schema._read(doc._id, {lean: false}))
            .then((doc) => {
                _expect(doc._foo).to.be.equal('bar');
                _expect(doc._bar).to.be.equal('foo');
                done();
            })
            .catch(done);
    });
    it('Schema pre save hook: default', function(done) {
        Schema._create({name: 'Schema 4'})
            .then((doc) => doc.save())
            .then((doc) => {
                _expect(doc._updateDate).to.be.an.instanceof(Date);
                _expect(doc._updateDate).to.not.be.equal(doc._createDate);
                done();
            })
            .catch(done);
    });
    it('Schema instance without attrs', function(done) {
        mongo.model({name: 'SchemaWithoutAttrs', connection: 'Test'});
        done();
    });
    it('Schema with one index', function(done) {
        this.timeout(1200);
        setTimeout(() => {
            SchemaIndexes.collection.indexes()
                .then((indexes) => {
                    _expect(indexes).to.be.an.instanceof(Array);
                    _expect(indexes).to.include({
                        v: 2,
                        key: { attr1: 1 },
                        name: 'attr1_1',
                        ns: 'Test.SchemaIndexes',
                        background: true,
                    });
                    done();
                })
                .catch(done);
        }, 1000);
    });
    it('Schema with compound index', function(done) {
        this.timeout(1200);
        setTimeout(() => {
            SchemaIndexes.collection.indexes()
                .then((indexes) => {
                    _expect(indexes).to.be.an.instanceof(Array);
                    _expect(indexes).to.include({
                        v: 2,
                        key: { attr1: 1, attr2: 1 },
                        name: 'attr1_1_attr2_1',
                        ns: 'Test.SchemaIndexes',
                        background: true,
                    });
                    done();
                })
                .catch(done);
        }, 1000);
    });
    after((done) => {
        SchemaIndexes.collection.drop(() => {
            done();
        });
    });
};