'use strict';

describe('model', () => {
    require('./schema.js')();
    require('./toJSON.js')();
    require('./relations.js')();
    require('./CustomTypes')();
    require('./StaticMethods')();
});