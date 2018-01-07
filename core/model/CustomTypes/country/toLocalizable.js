'use strict';

const name = require('@zerointermittency/utils/country/name.js');

module.exports = (code) => {
    if (name(code, 'en')) {
        let country = {
            code: code,
            name: {
                original: name(code, 'en'),
                es: name(code, 'es'),
                pt: name(code, 'pt'),
                zh: name(code, 'zh'),
                de: name(code, 'de'),
                fr: name(code, 'fr'),
                it: name(code, 'it'),
            },
        };
        return country;
    }
    return null;
};
