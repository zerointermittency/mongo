'use strict';

const core = {
        errors: require('../../errors.js'),
    },
    mongoose = require('mongoose');

module.exports = function(_id, {select, lean = true, json = false, populate} = {}) {
    const Model = this;
    if (_id == undefined) throw Error('zi-mongo: _id is required to _detail document');
    if (!mongoose.Types.ObjectId.isValid(_id))
        throw Error('zi-mongo: _id must be "ObjectId"');
    return new Promise((res, rej) => {
        let query = Model.findOne({_id: _id});
        if (select) {
            if (Array.isArray(select)) select = select.join(' ');
            query = query.select(select);
        }
        if (populate) query = query.populate(populate);
        if (!json) if (lean) query = query.lean();
        query.exec((err, doc) => {
            /* istanbul ignore if */
            if (err) return rej(core.errors.internal(err));
            if (!doc) return res(null);
            if (json) return res(doc.toJSON());
            res(doc);
        });
    });
};