'use strict';

module.exports = () => {
    describe('LocalizableString', () => {
        const mongo = new _ZIMongo({
                connections: {
                    Test: {uri: '127.0.0.1/Test'},
                },
                debug: false,
            }),
            Test = mongo.model({
                name: 'TestLocalizableString',
                attrs: {
                    string: {type: 'LocalizableString'},
                },
                connection: 'Test',
            });
        it('validate: {PATH} is not valid LocalizableString', () => {
            let test = new Test({
                    string: 'notString',
                }),
                error = test.validateSync();
            _expect(error.errors.string.message).to.be.equal('string is not valid LocalizableString');
            test = new Test({
                string: {es: 'notString'},
            });
            error = test.validateSync();
            _expect(error.errors.string.message).to.be.equal('string is not valid LocalizableString');
        });
        it('success instance', () => {
            let test = new Test({
                    string: {original: 'string'},
                }),
                error = test.validateSync();
            _expect(error).to.be.undefined;
        });
    });
};