'use strict';

module.exports = () => {
    describe('relations', () => {
        const mongo = new _ZIMongo({
                connections: {
                    Test: {uri: '127.0.0.1/Test'},
                },
                debug: false,
            }),
            A = mongo.model({
                name: 'A',
                attrs: {
                    name: {type: 'String'},
                    b: {
                        type: 'ObjectId',
                        relation: {name: 'B', connection: 'Test', attr: 'a'},
                    },
                    __belong: {
                        b: {
                            type: 'ObjectId',
                            relation: {name: 'B', connection: 'Test', attr: '__childre.a'},
                        },
                        c: {
                            type: 'ObjectId',
                            relation: {name: 'C', connection: 'Test', attr: '__children.a'},
                        },
                    },
                    c: {
                        type: 'ObjectId',
                        relation: {name: 'C', connection: 'Test', attr: 'a'},
                    },
                },
                connection: 'Test',
            }),
            B = mongo.model({
                name: 'B',
                attrs: {
                    name: {type: 'String'},
                    a: {
                        type: 'ObjectId',
                        relation: {name: 'A', connection: 'Test', attr: 'b'},
                    },
                    __children: {
                        a: {
                            type: 'ObjectId',
                            relation: {name: 'A', connection: 'Test', attr: '__belong.b'},
                        },
                    },
                    c: {
                        type: ['ObjectId'],
                        relation: {name: 'C', connection: 'Test', attr: 'b'},
                    },
                },
                connection: 'Test',
            }),
            C = mongo.model({
                name: 'C',
                attrs: {
                    name: {type: 'String'},
                    b: {
                        type: ['ObjectId'],
                        relation: {name: 'B', connection: 'Test', attr: 'c'},
                    },
                    a: {
                        type: ['ObjectId'],
                        relation: {name: 'A', connection: 'Test', attr: 'c'},
                    },
                    __children: {
                        a: {type: ['ObjectId']},
                    },
                },
                connection: 'Test',
            });
        it('one to one', function(done) {
            this.timeout(60000);
            let a1 = {_id: '5a21d49b7e7fee0cb46fff73', name: 'a1'},
                a2 = {_id: '5a21d49b7e7fee0cb46fff74', name: 'a2'},
                b1 = {_id: '5a21d49b7e7fee0cb46fff75', name: 'b1'},
                b2 = {_id: '5a21d49b7e7fee0cb46fff76', name: 'b2'};
            Promise.resolve()
                .then(() => A.remove({}))
                .then(() => B.remove({}))
                .then(() => A._create(a1))
                .then(() => A._create(a2))
                .then(() => B._create(Object.assign(
                    b1,
                    {
                        a: a1._id,
                        __children: {a: a1._id},
                    }
                )))
                .then(() => B._create(b2))
                .then(() => new Promise((res, rej) => {
                    A.findOne({_id: a1._id}).exec((err, a) => {
                        if (err) return rej(err);
                        _expect(a.b.toString()).to.be.equal(b1._id);
                        _expect(a.__belong.b.toString()).to.be.equal(b1._id);
                        a.set('b', b2._id);
                        a.save((err) => {
                            if (err) return rej(err);
                            res();
                        });
                    });
                }))
                .then(() => new Promise((res, rej) => {
                    A.findOne({_id: a1._id}).exec((err, a) => {
                        if (err) return rej(err);
                        _expect(a.b.toString()).to.be.equal(b2._id);
                        res();
                    });
                }))
                .then(() => new Promise((res, rej) => {
                    B.findOne({_id: b1._id}).exec((err, b) => {
                        if (err) return rej(err);
                        _expect(b.a).to.be.undefined;
                        res();
                    });
                }))
                .then(() => new Promise((res, rej) => {
                    B.findOne({_id: b2._id}).exec((err, b) => {
                        if (err) return rej(err);
                        _expect(b.a.toString()).to.be.equal(a1._id);
                        b.set('a', undefined);
                        b.save((err) => {
                            if (err) return rej(err);
                            res();
                        });
                    });
                }))
                .then(() => new Promise((res, rej) => {
                    A.findOne({_id: a1._id}).exec((err, a) => {
                        if (err) return rej(err);
                        _expect(a.b).to.be.undefined;
                        res();
                    });
                }))
                .then(() => new Promise((res, rej) => {
                    B.findOne({_id: b2._id}).exec((err, b) => {
                        if (err) return rej(err);
                        _expect(b.a).to.be.undefined;
                        res();
                    });
                }))
                .then(() => done())
                .catch(done);
        });
        it('one to many', function(done) {
            this.timeout(60000);
            let a1 = {_id: '5a21d49b7e7fee0cb46fff77', name: 'a1'},
                a2 = {_id: '5a21d49b7e7fee0cb46fff78', name: 'a2'},
                c1 = {_id: '5a21d49b7e7fee0cb46fff79', name: 'c1'},
                c2 = {_id: '5a21d49b7e7fee0cb46fff7a', name: 'c2'};
            Promise.resolve()
                .then(() => A.remove({}))
                .then(() => C.remove({}))
                .then(() => A._create(a1))
                .then(() => A._create(a2))
                .then(() => C._create(Object.assign(
                    c1,
                    {
                        a: a1._id,
                        __children: {a: [a2._id]},
                    }
                )))
                .then(() => C._create(c2))
                .then(() => new Promise((res, rej) => {
                    A.findOne({_id: a1._id}).exec((err, a) => {
                        if (err) return rej(err);
                        _expect(a.c.toString()).to.be.equal(c1._id);
                        res();
                    });
                }))
                .then(() => new Promise((res, rej) => {
                    A.findOne({_id: a2._id}).exec((err, a) => {
                        if (err) return rej(err);
                        _expect(a.c).to.be.undefined;
                        a.c = c1._id;
                        a.save((err) => {
                            if (err) return rej(err);
                            res();
                        });
                    });
                }))
                .then(() => new Promise((res, rej) => {
                    C.findOne({_id: c1._id}).exec((err, c) => {
                        if (err) return rej(err);
                        _expect(c.__children.a.map((a) => a.toString()))
                            .to.include.members([a2._id]);
                        _expect(c.a.map((a) => a.toString()))
                            .to.include.members([a1._id, a2._id]);
                        res();
                    });
                }))
                .then(() => new Promise((res, rej) => {
                    A.findOne({_id: a1._id}).exec((err, a) => {
                        if (err) return rej(err);
                        _expect(a.c.toString()).to.be.equal(c1._id);
                        a.c = undefined;
                        a.save((err) => {
                            if (err) return rej(err);
                            res();
                        });
                    });
                }))
                .then(() => new Promise((res, rej) => {
                    C.findOne({_id: c1._id}).exec((err, c) => {
                        if (err) return rej(err);
                        _expect(c.__children.a.map((a) => a.toString()))
                            .to.include.members([a2._id]);
                        _expect(c.a.map((a) => a.toString()))
                            .to.include.members([a2._id]);
                        res();
                    });
                }))
                .then(() => done())
                .catch(done);
        });
        it('many to many', function(done) {
            this.timeout(60000);
            let b1 = {_id: '5a21d49b7e7fee0cb46fff7b', name: 'b1'},
                b2 = {_id: '5a21d49b7e7fee0cb46fff7c', name: 'b2'},
                c1 = {_id: '5a21d49b7e7fee0cb46fff7d', name: 'c1'},
                c2 = {_id: '5a21d49b7e7fee0cb46fff7e', name: 'c2'};
            Promise.resolve()
                .then(() => B.remove({}))
                .then(() => C.remove({}))
                .then(() => B._create(b1))
                .then(() => B._create(b2))
                .then(() => C._create(c1))
                .then(() => C._create(c2))
                .then(() => new Promise((res, rej) => {
                    C.findOne({_id: c1._id}).exec((err, c) => {
                        if (err) return rej(err);
                        _expect(c.b).to.be.empty;
                        c.set('b', []);
                        c.save((err) => {
                            if (err) return rej(err);
                            res();
                        });
                    });
                }))
                .then(() => new Promise((res, rej) => {
                    C.findOne({_id: c1._id}).exec((err, c) => {
                        if (err) return rej(err);
                        _expect(c.b).to.be.empty;
                        c.set('b', b1._id);
                        c.save((err) => {
                            if (err) return rej(err);
                            res();
                        });
                    });
                }))
                .then(() => new Promise((res, rej) => {
                    C.findOne({_id: c1._id}).exec((err, c) => {
                        if (err) return rej(err);
                        // console.log('#c', require('util').inspect(c, 0, 10, 1));
                        _expect(c.b.map((a) => a.toString()))
                            .to.include.members([b1._id]);
                        res();
                    });
                }))
                .then(done)
                .catch(done);
        });
    });
};