'use strict';

module.exports = () => {
    describe('LocalizableCountry', () => {
        const mongo = new _ZIMongo({
                connections: {
                    Test: {uri: '127.0.0.1/Test'},
                },
                debug: false,
            }),
            Test = mongo.model({
                name: 'TestLocalizableCountry',
                attrs: {
                    country: {type: 'LocalizableCountry'},
                },
                connection: 'Test',
            });
        it('validate: {PATH} is not valid LocalizableCountry', () => {
            let test = new Test({
                    country: 'notCountry',
                }),
                error = test.validateSync();
            _expect(error.errors.country.message).to.be.equal('"notCountry" is not valid LocalizableCountry');
        });
        it('success instance', () => {
            let test = new Test({
                    country: 'US',
                }),
                error = test.validateSync();
            _expect(error).to.be.undefined;
            _expect(test.country).to.have.keys(['code', 'name']);
            _expect(test.country.code).to.be.equal('US');
            _expect(test.country.name).to.have.any.keys(['original', 'es', 'pt']);
            _expect(test.country.name.original).to.be.equal('United States of America');
            _expect(test.country.name.es).to.be.equal('Estados Unidos');
            _expect(test.country.name.pt).to.be.equal('Estados Unidos');
        });
        it('success instance with country object', () => {
            let test = new Test({
                    country: {
                        code: 'US',
                        name: {
                            original: 'United States of America',
                            es: 'Estados Unidos',
                            pt: 'Estados Unidos',
                        },
                    },
                }),
                error = test.validateSync();
            _expect(error).to.be.undefined;
            _expect(test.country).to.have.keys(['code', 'name']);
            _expect(test.country.code).to.be.equal('US');
            _expect(test.country.name).to.have.any.keys(['original', 'es', 'pt']);
            _expect(test.country.name.original).to.be.equal('United States of America');
            _expect(test.country.name.es).to.be.equal('Estados Unidos');
            _expect(test.country.name.pt).to.be.equal('Estados Unidos');
        });
        it('isLocalizable', () => {
            const isLocalizable = _path.require(
                '/core/model/CustomTypes/country/isLocalizable.js'
            );
            _expect(isLocalizable('CL')).to.be.true;
            _expect(isLocalizable({code: 'CL', name: {original: 'United States of America'}})).to.be.true;
            _expect(isLocalizable('ASDF')).to.be.false;
            _expect(isLocalizable({name: 'ASDF'})).to.be.false;
        });
        it('toLocalizable', () => {
            const toLocalizable = _path.require(
                '/core/model/CustomTypes/country/toLocalizable.js'
            );
            const localizable = toLocalizable('US');
            _expect(localizable).to.have.keys(['code', 'name']);
            _expect(localizable.code).to.be.equal('US');
            _expect(localizable.name).to.have.any.keys(['original', 'es', 'pt']);
            _expect(localizable.name.original).to.be.equal('United States of America');
            _expect(localizable.name.es).to.be.equal('Estados Unidos');
            _expect(localizable.name.pt).to.be.equal('Estados Unidos');
            _expect(toLocalizable('ASDF')).to.be.null;
        });
    });
};