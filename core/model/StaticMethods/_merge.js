'use strict';

const core = {
        errors: require('../../errors.js'),
    },
    get = require('@zerointermittency/utils/object/get.js'),
    types = {
        update: {
            patch: (bulk, doc, source) => {
                doc._updateDate = new Date();
                let unset = {_deleteDate: undefined};
                source._deleted = false;
                delete source._deleteDate;
                bulk.find({_id: source._id}).updateOne({$set: doc, $unset: unset});
                return Object.assign(source, doc);
            },
            put: (bulk, doc, source) => {
                doc._id = source._id;
                doc._createDate = source._createDate;
                bulk.find({_id: doc._id}).updateOne(doc);
                return doc;
            },
        },
        remove: {
            logical: (bulk, doc) => {
                doc._deleted = true;
                doc._deleteDate = new Date();
                bulk.find({_id: doc._id}).updateOne({
                    $set: {
                        _deleted: true,
                        _deleteDate: new Date(),
                    },
                });
                return doc;
            },
            physical: (bulk, doc) => {
                bulk.find({_id: doc._id}).removeOne();
                return doc;
            },
        },
    };

module.exports = function({
    docs, compare, find,
    insert = {},
    update = {type: 'patch'},
    remove = {type: 'logical'},
}) {
    if (!Array.isArray(docs))
        throw Error('zi-mongo: docs must be "Array"');
    const Model = this,
        bulk = Model.collection.initializeOrderedBulkOp();
    return new Promise((res, rej) => {
        Model.find(find).select('-__v').lean().exec((err, sources) => {
            /* istanbul ignore if */
            if (err) return rej(core.errors.internal(err));
            if (typeof compare === 'string') {
                const prop = compare;
                compare = (vmd, vd) => get(vmd, prop) === get(vd, prop);
            }
            if (Array.isArray(compare)) {
                const props = compare.slice(0, compare.length);
                compare = (md, d) => {
                    let flag;
                    for (let i = 0; i < props.length; i++) {
                        const prop = props[i];
                        flag = get(md, prop) == get(d, prop);
                        if (!flag) break;
                    }
                    return flag;
                };
            }
            const result = {};
            let toRemove = [],
                index = 0;
            if (insert) result.insert = {};
            if (update) result.update = {};
            if (remove) {
                result.remove = {};
                toRemove = sources.slice(0, sources.length);
            }
            for (let i = docs.length - 1; i >= 0; i--) {
                let doc = docs[i],
                    flag = true;
                for (let j = sources.length - 1; j >= 0; j--) {
                    let source = sources[j];
                    if (compare(doc, source)) {
                        flag = false;
                        if (update) {
                            if (update.iterate) doc = update.iterate(doc, source, update);
                            result.update[index] = types.update[update.type](bulk, doc, source);
                            index++;
                        }
                        if (remove) toRemove.splice(i, 1);
                        sources.splice(j, 1);
                        break;
                    }
                }
                if (flag && insert) {
                    doc._createDate = new Date();
                    if (insert.iterate) doc = insert.iterate(doc, insert);
                    bulk.insert(doc);
                    result.insert[index] = doc;
                    index++;
                }
            }
            for (let i = toRemove.length - 1; i >= 0; i--) {
                result.remove[index] = types.remove[remove.type](bulk, toRemove[i]);
                index++;
            }

            bulk.execute((err, bulkresult) => {
                /* istanbul ignore if */
                if (err) return rej(core.errors.internal(err));
                if (insert) {
                    const insertedIds = bulkresult.getInsertedIds();
                    for (let i = insertedIds.length - 1; i >= 0; i--)
                        result.insert[insertedIds[i].index]._id = insertedIds[i]._id;
                }
                res(result);
            });
        });
    });
};