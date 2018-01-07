'use strict';

module.exports = () => {
    describe('Static methods', () => {
        require('./_create.js')();
        require('./_read.js')();
        require('./_update.js')();
        require('./_delete.js')();
        require('./_list.js')();
        require('./_restore.js')();
        require('./_merge.js')();
    });
};