'use strict';

const Benchmark = require('benchmark'),
    _ = {
        each: require('lodash/each'),
    },
    docs = [
        {_externalId: '5', order: {number: '5'}},
        {_externalId: '6', order: {number: '6'}},
        {_externalId: '7', order: {number: '7'}},
        {_externalId: '4', order: {number: '4'}},
        {_externalId: '8', order: {number: '8'}},
    ];

// process.exit();
(new Benchmark.Suite)
    .add('_.each', () => {
        _.each(docs, (doc) => doc);
    })
    .add('forEach', () => {
        docs.forEach((doc) => doc);
    })
    .add('for of', () => {
        for (let doc of docs) doc;
    })
    .add('for in', () => {
        for (let i in docs) docs[i];
    })
    .add('for --', () => {
        for (let i = docs.length - 1; i >= 0; i--) docs[i];
    })
    .add('for ++', () => {
        for (let i = 0; i < docs.length; i++) docs[i];
    })
    .on('cycle', (event) => console.log(String(event.target)))
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({async: false});
