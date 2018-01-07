'use strict';

const core = {
        errors: require('../../errors.js'),
    },
    types = {
        physical: (doc, cb) => doc.remove((err) => {
            /* istanbul ignore if */
            if (err) return cb(core.errors.internal(err));
            cb(null, doc);
        }),
        logical: (doc, cb) => {
            if (doc._deleted) return cb(null, doc);
            doc._deleteDate = new Date();
            doc._deleted = true;
            doc.save((err) => {
                /* istanbul ignore if */
                if (err) return cb(core.errors.internal(err));
                cb(null, doc);
            });
        },
    };

module.exports = function(_id, type = 'logical') {
    if (!_id)
        throw Error('zi-mongo: _id is required to _delete document');
    if (!types[type])
        throw Error(`zi-mongo: Invalid type "${type}" to _delete document`);
    const Model = this;
    return new Promise((res, rej) => {
        Model.findOne({_id: _id}).exec((err, doc) => {
            /* istanbul ignore if */
            if (err) return rej(core.errors.internal(err));
            if (!doc) return res(null);
            types[type](doc, (err, doc) => {
                /* istanbul ignore if */
                if (err) return rej(err);
                res(doc);
            });
        });
    });
};
