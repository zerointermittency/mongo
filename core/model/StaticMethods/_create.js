'use strict';

const core = {
    errors: require('../../errors.js'),
};

module.exports = function(doc) {
    if (typeof doc !== 'object')
        throw Error('zi-mongo: Param must be a "object" to _create document');
    const Model = this;
    delete doc.__v;
    delete doc._model;
    delete doc._createDate;
    delete doc._updateDate;
    delete doc._deleteDate;
    delete doc._deleted;
    return new Promise((res, rej) => {
        doc = new Model(doc);
        doc.validate((errors) => {
            if (errors) {
                errors = Object.keys(errors.errors).reduce(function(result, key) {
                    result[key] = errors.errors[key].message;
                    return result;
                }, {});
                return rej(core.errors.validate(errors));
            }
            doc.save((err, doc) => {
                /* istanbul ignore if */
                if (err) return rej(core.errors.internal(err));
                res(doc);
            });
        });
    });
};