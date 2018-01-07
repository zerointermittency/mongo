'use strict';

const Benchmark = require('benchmark'),
    utils = require('@zerointermittency/utils'),
    _ = {
        get: require('lodash/get'),
        intersectionBy: require('lodash/intersectionBy'),
        differenceBy: require('lodash/differenceBy'),
        intersectionWith: require('lodash/intersectionWith'),
        differenceWith: require('lodash/differenceWith'),
    },
    mergeDocs = [
        {_externalId: '1', order: {number: '1'}},
        {_externalId: '2', order: {number: '2'}},
        {_externalId: '3', order: {number: '3'}},
        {_externalId: '4', order: {number: '4'}},
    ],
    docs = [
        {_externalId: '5', order: {number: '5'}},
        {_externalId: '6', order: {number: '6'}},
        {_externalId: '7', order: {number: '7'}},
        {_externalId: '4', order: {number: '4'}},
        {_externalId: '8', order: {number: '8'}},
    ];

// let resultdifference = _.differenceWith(mergeDocs, docs, (md, d) => {
//     console.log('#md', require('util').inspect(md, false, 5, true));
//     console.log('#d', require('util').inspect(d, false, 5, true));
//     return md._externalId == d._externalId;
// });
// console.log('#resultdifference', require('util').inspect(resultdifference, false, 5, true));



// let resultintersection = _.intersectionWith(mergeDocs, docs, (md, d) => {
//     console.log('#md', require('util').inspect(md, false, 5, true));
//     console.log('#d', require('util').inspect(d, false, 5, true));
//     return md._externalId == d._externalId;
// });
// console.log('#resultintersection', require('util').inspect(resultintersection, false, 5, true));
// process.exit();

const _check = (md, d, compare) => {
    let difference,
        intersection;
    if (typeof compare === 'string') {
        difference = _.differenceBy;
        intersection = _.intersectionBy;
    }
    if (Array.isArray(compare)) {
        let props = compare.slice(0, compare.length);
        compare = (md, d) => {
            let i = 0,
                flag = _.get(md, props[i]) == _.get(d, props[i]);
            // console.log(props[i]);
            // console.log(md);
            // console.log(d);
            // console.log(flag);
            if (!flag) return flag;
            i = 1;
            for (; i < props.length; i++) {
                flag = _.get(md, props[i]) == _.get(d, props[i]);
                if (!flag) break;
            }
            return flag;
        };
        difference = _.differenceWith;
        intersection = _.intersectionWith;
    }
    // if (typeof compare === 'function') {
    //     difference = _.differenceWith;
    //     intersection = _.intersectionWith;
    // }
    let result = {
        insert: difference(md, d, compare),
        remove: difference(d, md, compare),
        update: intersection(md, d, compare),
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
    if (typeof compare === 'string') {
        let prop = compare;
        compare = (vmd, vd) => utils.object.get(vmd, prop) === utils.object.get(vd, prop);
    }
    if (Array.isArray(compare)) {
        let props = compare.slice(0, compare.length);
        compare = (md, d) => {
            let i = 0,
                flag = utils.object.get(md, props[i]) == utils.object.get(d, props[i]);
            // console.log(props[i]);
            // console.log(md);
            // console.log(d);
            // console.log(flag);
            if (!flag) return flag;
            i = 1;
            for (; i < props.length; i++) {
                flag = utils.object.get(md, props[i]) == utils.object.get(d, props[i]);
                if (!flag) break;
            }
            return flag;
        };
    }

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
            if (compare(vmd, vd)) {
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
console.log(_check(mergeDocs, docs, ['_externalId', 'order.number']));
// console.log(_check(mergeDocs, docs, (md, d) => md._externalId == d._externalId));
// console.log(forCheck(mergeDocs, docs, '_externalId'));
console.log(forCheck2(mergeDocs, docs, '_externalId'));
console.log(forCheck2(mergeDocs, docs, ['_externalId', 'order.number']));

// process.exit();

(new Benchmark.Suite)
    .add('_check', () => {
        // _check(mergeDocs, docs, '_externalId');
        _check(mergeDocs, docs, ['_externalId', 'order.number']);
    })
    // .add('forCheck', () => {
    //     forCheck(mergeDocs, docs, '_externalId');
    // })
    .add('forCheck2', () => {
        // forCheck2(mergeDocs, docs, '_externalId');
        forCheck2(mergeDocs, docs, ['_externalId', 'order.number']);
    })
    .on('cycle', (event) => console.log(String(event.target)))
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
        // process.exit();
    })
    .run({async: false});
