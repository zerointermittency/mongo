'use strict';

const mongoose = require('mongoose'),
    model = require('./core/model');

class ZIMongo {

    constructor({connections, debug = false}) {
        const self = this;
        this.mongoose = mongoose;
        this.mongoose.Promise = global.Promise;
        this.mongoose.set('debug', debug);
        this.connections = {};
        if (!connections || Object.keys(connections).length == 0)
            throw Error('zi-mongo: Required connections');
        for (let name in connections) {
            const opts = connections[name],
                uri = (opts.uri.startsWith('mongodb://')) ? opts.uri : `mongodb://${opts.uri}`,
                createConnection = () => self.mongoose.createConnection(uri, opts),
                connection = createConnection();
            connection.on('disconnected', createConnection);
            connection.on('close', createConnection);
            connection.on('error', createConnection);
            self.connections[name] = connection;
        }
    }

    model({name, attrs, indexes, methods, post, pre, connection}) {
        return model(this, {name, attrs, indexes, methods, post, pre, connection});
    }

}

module.exports = ZIMongo;