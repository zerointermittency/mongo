'use strict';

const Schema = require('./Schema');

module.exports = (mongo, {name, attrs, indexes, methods, post, pre, connection}) => {
    connection = mongo.connections[connection];
    if (connection.models[name]) return connection.models[name];
    return connection.model(name, new Schema({name, attrs, indexes, methods, post, pre, mongo}));
};