'use strict';

const mongoose = require('mongoose'),
    validate = require('mongoose-validator'),
    isLocalizable = require('./country/isLocalizable.js'),
    toLocalizable = require('./country/toLocalizable.js'),
    LocalizableCountryValidator = [
        validate({
            validator: isLocalizable,
            message: '"{VALUE}" is not valid LocalizableCountry',
        }),
    ];

function LocalizableCountry(key, options) {
    options.validate = LocalizableCountryValidator;
    mongoose.SchemaType.call(this, key, options, 'LocalizableCountry');
}
LocalizableCountry.prototype = Object.create(mongoose.SchemaType.prototype);
LocalizableCountry.prototype.cast = (country) => {
    if (typeof country === 'object') return country;
    let localizable = toLocalizable(country);
    if (localizable !== null) return localizable;
    return country;
};

module.exports = LocalizableCountry;