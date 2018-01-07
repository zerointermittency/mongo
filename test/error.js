'use strict';

describe('errors', () => {
    const errors = require('../core/errors.js');
    it('internal', () => {
        const e = errors.internal({msg: 'foo:bar'});
        _expect(e.code).to.be.equal(100);
        _expect(e.name).to.be.equal('internal');
        _expect(e.extra.msg).to.be.equal('foo:bar');
    });
    it('validate', () => {
        const e = errors.validate({msg: 'foo:bar'});
        _expect(e.code).to.be.equal(101);
        _expect(e.name).to.be.equal('validate');
        _expect(e.extra.msg).to.be.equal('foo:bar');
    });
});