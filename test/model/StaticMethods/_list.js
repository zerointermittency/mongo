'use strict';

module.exports = () => {
    const mongo = new _ZIMongo({
            connections: {
                Test: {uri: '127.0.0.1/Test'},
            },
            debug: false,
        }),
        Test = mongo.model({
            name: 'TestList',
            attrs: {
                name: {type: 'String'},
            },
            connection: 'Test',
        });
    describe('_list', () => {
        before((done) => {
            Test.insertMany(
                [
                    {name: 't1', order: 16},
                    {name: 't2', order: 15},
                    {name: 't3', order: 14},
                    {name: 't4', order: 13},
                    {name: 't5', order: 12},
                    {name: 't6', order: 11},
                    {name: 't7', order: 10},
                    {name: 't8', order: 9},
                    {name: 't9', order: 8},
                    {name: 't10', order: 7},
                    {name: 't11', order: 6},
                    {name: 't12', order: 5},
                    {name: 't13', order: 4},
                    {name: 't14', order: 3},
                    {name: 't15', order: 2},
                    {name: 't16', order: 1},
                    {name: 't17', order: 100, _deleted: true},
                    {name: 't18', order: 101, _deleted: true},
                    {name: 't19', order: 102, _deleted: true},
                    {name: 't20', order: 103, _deleted: true},
                    {name: 't21', order: 104, _deleted: true},
                ],
                (err, docs) => {
                    // console.log('#err', require('util').inspect(err, false, 5, true));
                    // console.log('#docs', require('util').inspect(docs, false, 5, true));
                    _expect(docs.length).to.be.equal(21);
                    _expect(docs[0].order).to.be.equal(16);
                    Test._update({_id: docs[0]._id, other: docs[1]._id})
                        .then(() => done());
                }
            );
        });
        it('default', (done) => {
            Test._list({})
                .then(({docs, paginate}) => {
                    // console.log('#paginate', require('util').inspect(paginate, false, 5, true));
                    // console.log('#docs', require('util').inspect(docs, false, 5, true));
                    _expect(docs.length).to.be.equal(10);
                    _expect(paginate.page).to.be.equal(1);
                    _expect(paginate.pages).to.be.equal(2);
                    _expect(paginate.itemsPerPage).to.be.equal(10);
                    _expect(paginate.offset).to.be.equal(0);
                    _expect(paginate.total).to.be.equal(16);
                    done();
                });
        });
        it('lean = false', (done) => {
            Test._list({lean: false})
                .then(({docs, paginate}) => {
                    _expect(docs[0]._model).to.be.undefined;
                    _expect(docs[0].toJSON).to.be.a('function');
                    _expect(docs[0]._createDate).to.be.an.instanceof(Date);
                    _expect(docs.length).to.be.equal(10);
                    _expect(paginate.page).to.be.equal(1);
                    _expect(paginate.pages).to.be.equal(2);
                    _expect(paginate.itemsPerPage).to.be.equal(10);
                    _expect(paginate.offset).to.be.equal(0);
                    _expect(paginate.total).to.be.equal(16);
                    done();
                });
        });
        it('json', (done) => {
            Test._list({json: true})
                .then(({docs, paginate}) => {
                    _expect(docs[0].toJSON).to.be.undefined;
                    _expect(docs[0]._model).to.exist;
                    _expect(docs[0]._createDate).to.be.string;
                    _expect(docs.length).to.be.equal(10);
                    _expect(paginate.page).to.be.equal(1);
                    _expect(paginate.pages).to.be.equal(2);
                    _expect(paginate.itemsPerPage).to.be.equal(10);
                    _expect(paginate.offset).to.be.equal(0);
                    _expect(paginate.total).to.be.equal(16);
                    done();
                });
        });
        it('paginate', (done) => {
            Test._list({paginate: {page: 2, itemsPerPage: 3}})
                .then(({docs, paginate}) => {
                    _expect(docs.length).to.be.equal(3);
                    _expect(paginate.page).to.be.equal(2);
                    _expect(paginate.pages).to.be.equal(6);
                    _expect(paginate.itemsPerPage).to.be.equal(3);
                    _expect(paginate.offset).to.be.equal(3);
                    _expect(paginate.total).to.be.equal(16);
                    done();
                });
        });
        it('sort', (done) => {
            Test._list({sort: {order: -1}})
                .then(({docs, paginate}) => {
                    _expect(docs[0].order).to.be.equal(16);
                    _expect(paginate.page).to.be.equal(1);
                    _expect(paginate.pages).to.be.equal(2);
                    _expect(paginate.itemsPerPage).to.be.equal(10);
                    _expect(paginate.offset).to.be.equal(0);
                    _expect(paginate.total).to.be.equal(16);
                    done();
                });
        });
        it('select', (done) => {
            Test._list({sort: {order: -1}, select: {order: 0}})
                .then(({docs, paginate}) => {
                    _expect(docs[0].order).to.be.undefined;
                    _expect(paginate.page).to.be.equal(1);
                    _expect(paginate.pages).to.be.equal(2);
                    _expect(paginate.itemsPerPage).to.be.equal(10);
                    _expect(paginate.offset).to.be.equal(0);
                    _expect(paginate.total).to.be.equal(16);
                    return Promise.resolve();
                })
                .then(() => Test._list({
                    sort: {order: -1}, select: ['-order'],
                    paginate: {page: -2},
                }))
                .then(({docs, paginate}) => {
                    _expect(docs[0].order).to.be.undefined;
                    _expect(paginate.page).to.be.equal(1);
                    _expect(paginate.pages).to.be.equal(2);
                    _expect(paginate.itemsPerPage).to.be.equal(10);
                    _expect(paginate.offset).to.be.equal(0);
                    _expect(paginate.total).to.be.equal(16);
                    return Promise.resolve();
                })
                .then(() => Test._list({paginate: false}))
                .then(({docs, paginate}) => {
                    _expect(docs).to.be.a.array;
                    _expect(paginate).to.be.null;
                    return Promise.resolve();
                })
                .then(done)
                .catch(done);
        });
        it('trash', (done) => {
            Test._list({sort: {order: -1}, trash: true})
                .then(({docs, paginate}) => {
                    // console.log('#docs', require('util').inspect(docs, false, 5, true));
                    // console.log('#paginate', require('util').inspect(paginate, false, 5, true));
                    _expect(docs[0].order).to.be.equal(104);
                    _expect(paginate.page).to.be.equal(1);
                    _expect(paginate.pages).to.be.equal(1);
                    _expect(paginate.itemsPerPage).to.be.equal(10);
                    _expect(paginate.offset).to.be.equal(0);
                    _expect(paginate.total).to.be.equal(5);
                    done();
                });
        });
        it('populate', (done) => {
            Test._list({sort: {order: -1}, populate: [{path: 'other', model: Test}]})
                .then(({docs, paginate}) => {
                    // console.log('#docs', require('util').inspect(docs, false, 5, true));
                    // console.log('#paginate', require('util').inspect(paginate, false, 5, true));
                    _expect(docs[0].order).to.be.equal(16);
                    _expect(docs[0].other).to.be.object;
                    _expect(docs[0].other._id.toString()).to.be.equal(docs[1]._id.toString());
                    _expect(paginate.page).to.be.equal(1);
                    _expect(paginate.pages).to.be.equal(2);
                    _expect(paginate.itemsPerPage).to.be.equal(10);
                    _expect(paginate.offset).to.be.equal(0);
                    _expect(paginate.total).to.be.equal(16);
                    done();
                });
        });
        after((done) => {
            Test.remove({}, done);
        });
    });
};