'use strict';

module.exports = () => {
    describe('Available', () => {
        const mongo = new _ZIMongo({
                connections: {
                    Test: {uri: '127.0.0.1/Test'},
                },
                debug: false,
            }),
            Test = mongo.model({
                name: 'TestAvailable',
                attrs: {
                    available: {type: 'Available'},
                },
                connection: 'Test',
            });
        it('validate: must be a "object"', () => {
            let test = new Test({
                    available: 'notObject',
                }),
                error = test.validateSync();
            _expect(error.errors.available.message).to.be.equal('available must be a "object"');
        });
        it('validate: from required valid "Date"', () => {
            let test = new Test({
                    available: {from: 'notObject'},
                }),
                error = test.validateSync();
            _expect(error.errors.available.message).to.be.equal('available.from required valid "Date"');
        });
        it('validate: until required valid "Date"', () => {
            let test = new Test({
                    available: {until: 'notObject'},
                }),
                error = test.validateSync();
            _expect(error.errors.available.message).to.be.equal('available.until required valid "Date"');
        });
        it('success: instance', () => {
            let test = new Test({
                    // available: {from: new Date()},
                }),
                error = test.validateSync();
            _expect(error).to.be.undefined;
        });
        it('success: save', (done) => {
            let test = new Test({
                // available: {from: new Date()},
            });
            test.save((err, t) => {
                _expect(err).to.be.null;
                _expect(t.available.from instanceof Date).to.be.true;
                t.remove(done);
            });
        });
    });
};