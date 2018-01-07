'use strict';

const Benchmark = require('benchmark'),
    values = [];

for (let i = 0; i < 1000; i++) {
    values.push(`value${i}`);
}

// process.exit();
(new Benchmark.Suite)
    .add('concat', () => {
        [].concat(values);
    })
    .add('slice', () => {
        values.slice(0, values.length);
    })
    .on('cycle', (event) => console.log(String(event.target)))
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({async: false});
