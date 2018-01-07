'use strict';

const mongoose = require('mongoose'),
    validate = require('mongoose-validator'),
    AvailableValidator = [
        validate({
            validator: (available) => typeof available === 'object',
            message: '{PATH} must be a "object"',
        }),
        validate({
            validator: (available) => {
                let flag = true;
                flag &= !isNaN(available.from.getTime());
                flag &= available.from instanceof Date;
                return flag;
            },
            message: '{PATH}.from required valid "Date"',
        }),
        validate({
            validator: (available) => {
                let flag = true;
                if (!available.until) return flag;
                flag &= !isNaN(available.until.getTime());
                flag &= available.until instanceof Date;
                return flag;
            },
            message: '{PATH}.until required valid "Date"',
        }),
    ];

function Available(key, options) {
    options.default = () => {
        return {from: new Date()};
    };
    options.validate = AvailableValidator;
    mongoose.SchemaType.call(this, key, options, 'Available');
}
Available.prototype = Object.create(mongoose.SchemaType.prototype);

// `cast()` takes a parameter that can be anything. You need to
// validate the provided `val` and throw a `CastError` if you
// can't convert it.
Available.prototype.cast = (available) => {
    if (typeof available !== 'object') return available;
    if (!available.from)
        available.from = new Date();
    else
        available.from = new Date(available.from);
    if (available.until)
        available.until = new Date(available.until);
    return available;
};

module.exports = Available;