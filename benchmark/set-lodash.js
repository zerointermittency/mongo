'use strict';

class OwnSet {
    constructor () {
        this.items = {};
    }
    has(value) {
        return this.items.hasOwnProperty(value);
    }
    add(value) {
        if (!this.has(value)) {
            this.items[value] = value;
            return true;
        }
        return false;
    }
    delete(value) {
        if (this.has(value)) {
            delete this.items[value];
            return true;
        }
        return false;
    }
    values () {
        const values = [];
        for (let key in this.items) {
            if (this.items.hasOwnProperty(key)) {
                values.push(this.items[key]);
            }
        }
        return values;
    }
}

const union = (set1, set2) => {
        const set3 = new OwnSet();
        for (let key in set1.items) {
            set3.add(set1.items[key]);
        }
        for (let key in set2.items) {
            set3.add(set2.items[key]);
        }
        return set3;
    },
    intersection = (set1, set2) => {
        const set3 = new OwnSet();
        for (let key in set2.items) {
            // Comprobamos si el valor del set2 existe en el set1.
            // Si existe, agregamos el valor que existe en ambos sets
            if (set1.has(set2.items[key])) {
                set3.add(set2.items[key]);
            }
        }
        return set3;
    },
    difference = (set1, set2) => {
        const set3 = new OwnSet();
        // agregamos los elementos de set1.
        for (let key in set1.items) {
            set3.add(set1.items[key]);
        }
        for (let key in set2.items) {
            // si set2 tiene un valor en set1, lo sacamos
            if (set1.has(set2.items[key])) {
                set3.delete(set1.items[key]);
            }
        }
        return set3;
    },
    Benchmark = require('benchmark'),
    _ = {
        union: require('lodash/union'),
        intersection: require('lodash/intersection'),
        difference: require('lodash/difference'),
    },
    set1 = new OwnSet(),
    set2 = new OwnSet();

set1.add(1);
set1.add(2);
set1.add(3);
set1.add(4);
set2.add(5);
set2.add(6);
set2.add(7);
set2.add(4);
set2.add(8);
const setCheck = (set1, set2) => {
    return {
        insert: difference(set1, set2).values(),
        remove: difference(set2, set1).values(),
        update: intersection(set1, set2).values(),
    };
};
const _check = (a, b) => {
    return {
        insert: _.difference(a, b),
        remove: _.difference(b, a),
        update: _.intersection(b, a),
    };
};
const forCheck = (a, b) => {
    let result = {
        insert: [],
        remove: b,
        update: [],
    };
    a.forEach((va) => {
        let flag = false;
        b.forEach((vb) => {
            if (flag) return;
            if (va == vb) {
                flag = true;
                result.update.push(va);
                let index = result.remove.indexOf(vb);
                if (index != -1) result.remove.splice(index, 1);
            }
        });
        if (!flag) result.insert.push(va);
    });
    return result;
};
const forCheckslice = (a, b) => {
    let result = {
        insert: [],
        remove: b.slice(0, b.length),
        update: [],
    };
    a.forEach((va) => {
        if (b.indexOf(va) === -1) {
            result.insert.push(va);
        } else {
            result.update.push(va);
            result.remove.splice(result.remove.indexOf(va), 1);
        }
    });
    return result;
};
/*eslint-disable no-console, no-unused-vars */
console.log(setCheck(set1, set2));
console.log(_check([1, 2, 3, 4], [5, 6, 7, 4, 8]));
console.log(forCheck([1, 2, 3, 4], [5, 6, 7, 4, 8]));
console.log(forCheckslice([1, 2, 3, 4], [5, 6, 7, 4, 8]));
(new Benchmark.Suite)
    .add('_check', () => {
        _check([1, 2, 3, 4], [5, 6, 7, 4, 8]);
    })
    .add('setCheck', () => {
        setCheck(set1, set2);
    })
    .add('forCheck', () => {
        forCheck([1, 2, 3, 4], [5, 6, 7, 4, 8]);
    })
    .add('forCheckslice', () => {
        forCheckslice([1, 2, 3, 4], [5, 6, 7, 4, 8]);
    })
    .on('cycle', (event) => console.log(String(event.target)))
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
        // process.exit();
    })
    .run({async: false});
