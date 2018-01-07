'use strict';

const core = {
        errors: require('../../errors.js'),
    },
    mongoose = require('mongoose');

module.exports = function(_id) {
    if (!_id)
        throw Error('zi-mongo: _id is required to _restore document');
    if (!mongoose.Types.ObjectId.isValid(_id))
        throw Error('zi-mongo: _id must be "ObjectId"');
    const Model = this;
    return new Promise((res, rej) => {
        Model.findOne({_id: _id}).exec((err, doc) => {
            /* istanbul ignore if */
            if (err) return rej(core.errors.internal(err));
            if (!doc) return res(null);
            doc.set('_deleteDate', undefined);
            doc.markModified('_deleteDate');
            doc.set('_deleted', false);
            doc.markModified('_deleted');
            doc.save((err, doc) => {
                /* istanbul ignore if */
                if (err) return rej(core.errors.internal(err));
                res(doc);
            });
        });
    });
};
