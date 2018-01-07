'use strict';

module.exports = () => {
    const mongo = new _ZIMongo({
            connections: {
                Test: {uri: '127.0.0.1/Test'},
            },
            debug: false,
        }),
        toJSON = mongo.model({
            name: 'toJSON',
            attrs: {
                available: {type: 'Available'},
                country: {type: 'LocalizableCountry'},
                string: {type: 'LocalizableString'},
            },
            connection: 'Test',
        });
    it('toJSON', function(done) {
        toJSON._create({country: 'US', string: {original: 'toJSON'}})
            .then((doc) => {
                _expect(doc.available.from).to.be.an.instanceof(Date);
                _expect(doc._createDate).to.be.an.instanceof(Date);
                // console.log('#doc', require('util').inspect(doc, false, 5, true));
                doc = doc.toJSON();
                // console.log('#doc', require('util').inspect(doc, false, 5, true));
                _expect(doc.available.from).to.be.string;
                _expect(doc.available.until).to.be.undefined;
                _expect(doc._createDate).to.be.string;
                toJSON.remove({}, () => Promise.resolve());
            })
            .then(() => toJSON._create({available: {until: (new _ZIDate()).add(10800)}}))
            .then((doc) => {
                _expect(doc.available.from).to.be.an.instanceof(Date);
                _expect(doc._createDate).to.be.an.instanceof(Date);
                // console.log('#doc', require('util').inspect(doc, false, 5, true));
                doc = doc.toJSON();
                // console.log('#doc', require('util').inspect(doc, false, 5, true));
                _expect(doc.available.from).to.be.string;
                _expect(doc.available.until).to.be.string;
                _expect(doc._createDate).to.be.string;
                return Promise.resolve();
            })
            .then(() => new Promise((res, rej) => {
                toJSON.collection.insert(
                    {_id: mongo.mongoose.Types.ObjectId('5063114bd386d8fadbd6b004'), country: 'US'},
                    (err, doc) => {
                        if (err) return rej(err);
                        res(doc.insertedIds[0]);
                    }
                );
            }))
            .then((_id) => toJSON._read(_id, {lean: false}))
            .then((doc) => new Promise((res, rej) => {
                _expect(doc.available.from).to.be.an.instanceof(Date);
                _expect(doc._createDate).to.be.an.instanceof(Date);
                doc = doc.toJSON();
                _expect(doc.country.code).to.be.equal('US');
                _expect(doc.country.name.es).to.be.equal('Estados Unidos');
                toJSON.remove({}, (err) => {
                    if (err) return rej(err);
                    res();
                });
            }))
            .then(done)
            .catch(done);
    });
};