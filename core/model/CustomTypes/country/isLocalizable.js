'use strict';

const name = require('@zerointermittency/utils/country/name.js');

module.exports = (country) => {
    if (typeof country === 'object') {
        if (!country['code']) return false;
        country = country['code'];
    }
    if (country.length != 2) return false;
    // ISO 3166-1 Alpha-2 -> countries 2 caracteres
    return typeof name(country, 'en') === 'string';
};
