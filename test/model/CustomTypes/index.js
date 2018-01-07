'use strict';

module.exports = () => {
    describe('Custom types', () => {
        require('./Available.js')();
        require('./LocalizableString.js')();
        require('./LocalizableCountry.js')();
    });
};