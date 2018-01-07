'use strict';

const Benchmark = require('benchmark'),
    _ = {
        intersectionBy: require('lodash/intersectionBy'),
        differenceBy: require('lodash/differenceBy'),
    },
    mergeDocs = [{
        _externalId: '1',
    }, {
        _externalId: '2',
    }, {
        _externalId: '3',
    }, {
        _externalId: '4',
    }],
    docs = [{
        _externalId: '5',
    }, {
        _externalId: '6',
    }, {
        _externalId: '7',
    }, {
        _externalId: '4',
    }, {
        _externalId: '8',
    }];


const _check = (md, d, compare) => {
    let result = {
        insert: _.differenceBy(md, d, compare),
        remove: _.differenceBy(d, md, compare),
        update: _.intersectionBy(md, d, compare),
    };
    return result;
};

const forCheck = (md, d, compare) => {
    let result = {
        insert: [],
        remove: d.slice(0, d.length),
        update: [],
    };
    md.forEach((vmd) => {
        let flag = false;
        d.forEach((vd, index) => {
            if (flag) return;
            if (vmd[compare] === vd[compare]) {
                flag = true;
                result.update.push(vd);
                result.remove.splice(index, 1);
            }
        });
        if (!flag) result.insert.push(vmd);
    });
    return result;
};

const forCheck2 = (md, d, compare) => {
    let result = {
        insert: [],
        remove: d.slice(0, d.length),
        update: [],
    };
    for (let i = 0; i < md.length; i++) {
        let vmd = md[i];
        let flag = false;
        for (let index = 0; index < d.length; index++) {
            let vd = d[index];
            if (vmd[compare] === vd[compare]) {
                flag = true;
                result.update.push(vd);
                result.remove.splice(index, 1);
                break;
            }
        }
        if (!flag) result.insert.push(vmd);
    }
    return result;
};

/*eslint-disable no-console, no-unused-vars */
console.log(_check(mergeDocs, docs, '_externalId'));
console.log(forCheck(mergeDocs, docs, '_externalId'));
console.log(forCheck2(mergeDocs, docs, '_externalId'));
(new Benchmark.Suite)
    .add('_check', () => {
        _check(mergeDocs, docs, '_externalId');
    })
    .add('forCheck', () => {
        forCheck(mergeDocs, docs, '_externalId');
    })
    .add('forCheck2', () => {
        forCheck2(mergeDocs, docs, '_externalId');
    })
    .on('cycle', (event) => console.log(String(event.target)))
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
        // process.exit();
    })
    .run({async: false});
