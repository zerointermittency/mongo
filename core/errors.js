'use strict';

const ZIError = require('@zerointermittency/error');

class MongoError extends ZIError {

    constructor(opts) {
        opts.prefix = 'zi-mongo';
        super(opts);
    }

}

module.exports = {
    internal: (extra) => new MongoError({
        code: 100,
        name: 'internal',
        message: 'Internal error',
        level: ZIError.level.fatal,
        extra: extra,
    }),
    validate: (extra) => new MongoError({
        code: 101,
        name: 'validate',
        message: 'Validate error',
        level: ZIError.level.error,
        extra: extra,
    }),
};