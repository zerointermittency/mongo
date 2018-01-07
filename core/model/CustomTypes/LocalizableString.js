'use strict';

const mongoose = require('mongoose'),
    validate = require('mongoose-validator'),
    LocalizableStringValidator = [
        validate({
            validator: (str) => typeof str === 'object' && str.original != null,
            message: '{PATH} is not valid LocalizableString',
        }),
    ];

function LocalizableString(key, options) {
    options.validate = LocalizableStringValidator;
    mongoose.SchemaType.call(this, key, options, 'LocalizableString');
}
LocalizableString.prototype = Object.create(mongoose.SchemaType.prototype);
LocalizableString.prototype.cast = (str) => str;

module.exports = LocalizableString;