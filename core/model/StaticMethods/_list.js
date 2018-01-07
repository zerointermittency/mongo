'use strict';

const core = {
    errors: require('../../errors.js'),
};

module.exports = function({
    find = {}, select, sort, populate, paginate = {},
    lean = true, json = false, trash = false,
}) {
    const Model = this;
    return new Promise((res, rej) => {
        let query,
            defaultPaginate = {page: 1, itemsPerPage: 10};

        find['_deleted'] = trash;
        query = Model.find(find);
        if (select) {
            if (Array.isArray(select)) select = select.join(' ');
            query = query.select(select);
        }
        if (sort) query = query.sort(sort);
        if (populate) query = query.populate(populate);
        if (paginate) {
            paginate = Object.assign(defaultPaginate, paginate);
            if (paginate.page <= 0) paginate.page = 1;
            let skip = (paginate.page * paginate.itemsPerPage) - paginate.itemsPerPage;
            paginate.offset = skip;
            query = query.skip(skip).limit(paginate.itemsPerPage);
        }
        if (!json) if (lean) query = query.lean();
        query.exec((err, docs) => {
            /* istanbul ignore if */
            if (err) return rej(core.errors.internal(err));
            if (json)
                for (let i = docs.length - 1; i >= 0; i--)
                    docs[i] = docs[i].toJSON();
            if (!paginate) return res({docs, paginate: null});
            else
                Model.count(find).exec((err, count) => {
                    /* istanbul ignore if */
                    if (err) return rej(core.errors.internal(err));
                    paginate.pages = Math.ceil(count / paginate.itemsPerPage);
                    paginate.total = count;
                    res({docs, paginate});
                });
        });
    });
};