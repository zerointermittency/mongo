'use strict';

const object = {
        get: require('@zerointermittency/utils/object/get.js'),
        paths: require('@zerointermittency/utils/object/paths.js'),
    },
    core = {
        errors: require('../../errors.js'),
    },
    ObjectId = {
        isValid: require('mongoose').Types.ObjectId.isValid,
    },
    privateAttrs = [
        '__v', '_model', '_createDate', '_updateDate',
        '_deleteDate', '_deleted',
    ],
    types = {
        patch: (doc, updateDoc) => {
            const fn = (attr, prop) => {
                    let flag = true;
                    flag &= !prop.startsWith('$unset');
                    flag &= !prop.startsWith('_id');
                    flag &= typeof attr !== 'object';
                    flag &= !Array.isArray(attr);
                    if (ObjectId.isValid(attr)) return true;
                    return flag;
                },
                props = object.paths(updateDoc, fn);
            for (let i = props.length - 1; i >= 0; i--) {
                const prop = props[i];
                doc.set(prop, object.get(updateDoc, prop));
                doc.markModified(prop);
            }
            if (Array.isArray(updateDoc['$unset']))
                for (let i = updateDoc['$unset'].length - 1; i >= 0; i--) {
                    const prop = updateDoc['$unset'][i];
                    if (privateAttrs.indexOf(prop) !== -1) continue;
                    doc.set(prop, undefined);
                    doc.markModified(prop);
                }
            return doc;
        },
        put: (doc, updateDoc) => {
            const keys = Object.keys(updateDoc),
                docKeys = Object.keys(doc.toObject());
            for (let i = keys.length - 1; i >= 0; i--) {
                const key = keys[i],
                    index = docKeys.indexOf(key);
                if (key.startsWith('_id')) continue;
                doc.set(key, updateDoc[key]);
                doc.markModified(key);
                if (index !== -1) docKeys.splice(index, 1);
            }
            for (let i = docKeys.length - 1; i >= 0; i--) {
                const key = docKeys[i];
                if (privateAttrs.indexOf(key) !== -1) continue;
                doc.set(key, undefined);
                doc.markModified(key);
            }
            return doc;
        },
    };

module.exports = function(updateDoc, type = 'patch') {
    if (typeof updateDoc !== 'object')
        throw Error('zi-mongo: Param must be a "object" to _update document');
    if (!updateDoc._id)
        throw Error('zi-mongo: _id is required to _update document');
    if (!types[type])
        throw Error(`zi-mongo: Invalid type "${type}" to _update document`);
    const Model = this;
    delete updateDoc.__v;
    delete updateDoc._model;
    delete updateDoc._createDate;
    delete updateDoc._updateDate;
    delete updateDoc._deleteDate;
    delete updateDoc._deleted;
    return new Promise((res, rej) => {
        Model.findOne({_id: updateDoc._id}).exec((err, doc) => {
            /* istanbul ignore if */
            if (err) return rej(core.errors.internal(err));
            if (!doc) return res(null);
            doc = types[type](doc, updateDoc);
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
    });
};
