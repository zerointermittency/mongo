'use strict';

const object = {
        get: require('@zerointermittency/utils/object/get.js'),
    },
    waterfall = require('@zerointermittency/utils/flow/waterfall.js');

module.exports = (mongo, propsRelations) => function(next) {
    if (propsRelations.length === 0) return next();
    if (this._relation) {
        this._relation = undefined;
        return next();
    }
    const doc = this,
        functions = [];

    for (let i = propsRelations.length - 1; i >= 0; i--) {
        const {relation, prop} = propsRelations[i],
            Model = mongo.model({name: relation.name, connection: relation.connection}),
            destine = relation.attr,
            set = {update: [], remove: []};
        let value = object.get(doc, prop),
            oldValue = (doc._original) ? object.get(doc._original, prop) : undefined,
            flag = value == undefined && oldValue == undefined;
        flag |= (Array.isArray(value) && value.length === 0)
            && (Array.isArray(oldValue) && oldValue.length === 0);
        if (flag) continue;
        if (oldValue == undefined || (Array.isArray(oldValue) && oldValue.length === 0)) {
            if (value && !Array.isArray(value)) value = [value];
            for (let i = value.length - 1; i >= 0; i--)
                set.update.push(value[i].toString());
        } else {
            /* istanbul ignore else */
            if (value && !Array.isArray(value)) value = [value];
            /* istanbul ignore else */
            if (oldValue && !Array.isArray(oldValue)) oldValue = [oldValue];
            /* istanbul ignore else */
            if (oldValue)
                for (let i = oldValue.length - 1; i >= 0; i--)
                    set.remove.push(oldValue[i].toString());
            /* istanbul ignore else */
            if (value) {
                for (let i = value.length - 1; i >= 0; i--)
                    value[i] = value[i].toString();
                for (let i = value.length - 1; i >= 0; i--) {
                    set.update.push(value[i]);
                    const index = set.remove.indexOf(value[i]);
                    if (index !== -1) set.remove.splice(index, 1);
                }
            }
        }

        functions.push((done) => {
            const query = Model.find({_id: {$in: set.update.concat(set.remove)}});
            query.exec((err, references) => {
                /* istanbul ignore if */
                if (err) return next(err);
                const referenceFunctions = [];
                for (let i = references.length - 1; i >= 0; i--) {
                    const reference = references[i];
                    let referenceValue = object.get(reference, destine);
                    referenceFunctions.push((cb) => {
                        if (set.update.indexOf(reference._id.toString()) !== -1) {
                            if (referenceValue && Array.isArray(referenceValue)) {
                                for (let i = referenceValue.length - 1; i >= 0; i--)
                                    referenceValue[i] = referenceValue[i].toString();
                                /* istanbul ignore else */
                                if (referenceValue.indexOf(doc._id.toString()) === -1)
                                    referenceValue.push(doc._id);
                            } else
                                referenceValue = doc._id;
                            reference.set(destine, referenceValue);
                            reference.markModified(destine);
                            reference._relation = true;
                            reference.save((err) => {
                                /* istanbul ignore if */
                                if (err) return cb(err);
                                cb(null);
                            });
                        } else {
                            /* istanbul ignore else */
                            if (set.remove.indexOf(reference._id.toString()) !== -1) {
                                if (referenceValue && Array.isArray(referenceValue)) {
                                    for (let i = referenceValue.length - 1; i >= 0; i--)
                                        referenceValue[i] = referenceValue[i].toString();
                                    referenceValue.splice(
                                        referenceValue.indexOf(doc._id.toString()), 1
                                    );
                                    reference.set(destine, referenceValue);
                                } else
                                    reference.set(destine, undefined);
                                reference.markModified(destine);
                                reference._relation = true;
                                reference.save((err) => {
                                    /* istanbul ignore if */
                                    if (err) return cb(err);
                                    cb(null);
                                });
                            }
                        }
                    });
                }
                if (referenceFunctions.length > 0) return waterfall(referenceFunctions, done);
                done(null);
            });
        });

    }
    if (functions.length > 0) return waterfall(functions, next);
    next();
};