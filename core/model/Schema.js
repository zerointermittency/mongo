'use strict';

const object = {
        paths: require('@zerointermittency/utils/object/paths.js'),
        get: require('@zerointermittency/utils/object/get.js'),
        set: require('@zerointermittency/utils/object/set.js'),
    },
    NuncheeDate = require('@zerointermittency/date'),
    MongooseSchema = require('mongoose').Schema,
    MongooseUniqueValidator = require('mongoose-unique-validator'),
    relations = require('./relations.js'),
    StaticMethods = {
        _create: require('./StaticMethods/_create.js'),
        _list: require('./StaticMethods/_list.js'),
        _read: require('./StaticMethods/_read.js'),
        _update: require('./StaticMethods/_update.js'),
        _delete: require('./StaticMethods/_delete.js'),
        _restore: require('./StaticMethods/_restore.js'),
        _merge: require('./StaticMethods/_merge.js'),
    };

MongooseSchema.Types.Available = require('./CustomTypes/Available.js');
MongooseSchema.Types.LocalizableString = require('./CustomTypes/LocalizableString.js');
MongooseSchema.Types.LocalizableCountry = require('./CustomTypes/LocalizableCountry.js');

class Schema extends MongooseSchema {

    constructor({name, attrs = {}, indexes, methods, post, pre, mongo}) {
        attrs = Object.assign(attrs, {
            // para registrar creacion y actualizacion de items
            _createDate: {type: 'Date', index: true, default: () => new Date()},
            _updateDate: {type: 'Date', index: true, default: () => new Date()},
            // para registar el eliminado logico
            _deleteDate: {type: 'Date', index: true},
            _deleted: {type: 'Boolean', index: true, default: false},
            _seed: {type: 'Boolean', index: true, default: false},
            // para el manejo de contenidos externos
            _externalId: {type: 'String', index: true, default: null},
            _externalProvider: {type: 'String', index: true, default: null},
            status: Object.assign({type: 'Number', index: true}, attrs.status || {}),
        });
        const fnAvailable = (attr) => attr['type'] === 'Available',
            fnDate = (attr) => attr['type'] === 'Date',
            fnLocalizableCountry = (attr) => attr['type'] === 'LocalizableCountry',
            fnRelations = (attr) => attr['relation'],
            propsAvailable = object.paths(attrs, fnAvailable),
            propsDate = object.paths(attrs, fnDate),
            propsLocalizableCountry = object.paths(attrs, fnLocalizableCountry),
            propsRelations = object.paths(attrs, fnRelations);
        for (let i = propsRelations.length - 1; i >= 0; i--)
            propsRelations[i] = {
                relation: object.get(attrs, `${propsRelations[i]}.relation`),
                prop: propsRelations[i],
            };
        super(attrs, {
            collection: name, strict: false,
            toJSON: {
                transform: function(doc, ret) {
                    ret._model = name;
                    delete ret.__v;
                    for (let i = propsDate.length - 1; i >= 0; i--) {
                        const prop = propsDate[i];
                        let attr = object.get(ret, prop);
                        if (attr) {
                            attr = NuncheeDate.toISOString(attr);
                            object.set(ret, prop, attr);
                        }
                    }
                    for (let i = propsAvailable.length - 1; i >= 0; i--) {
                        const prop = propsAvailable[i];
                        let attr = object.get(ret, prop);
                        attr.from = NuncheeDate.toISOString(attr.from);
                        if (attr.until)
                            attr.until = NuncheeDate.toISOString(attr.until);
                        object.set(ret, prop, attr);
                    }
                    return ret;
                },
            },
        });
        const self = this;
        self.index({_externalId: 1, _externalProvider: 1});
        self.index({_externalId: 1, _externalProvider: 1, '__belong.Client': 1});
        for (let i = propsAvailable.length - 1; i >= 0; i--) {
            const prop = propsAvailable[i];
            self.index({[`${prop}.from`]: 1});
            self.index({[`${prop}.until`]: 1});
            self.index({[`${prop}.from`]: -1});
            self.index({[`${prop}.until`]: -1});
            self.index({[`${prop}.from`]: 1, [`${prop}.until`]: 1});
            self.index({[`${prop}.from`]: -1, [`${prop}.until`]: -1});
        }
        for (let i = propsLocalizableCountry.length - 1; i >= 0; i--) {
            const prop = propsLocalizableCountry[i];
            self.index({[`${prop}.code`]: 1});
            self.index({[`${prop}.code`]: -1});
        }
        if (Array.isArray(indexes))
            for (let i = indexes.length - 1; i >= 0; i--)
                self.index(indexes[i]);

        self.plugin(MongooseUniqueValidator);
        for (let key in methods) self.methods[key] = methods[key];
        self.methods['mongo'] = () => mongo;
        for (let key in post) self.post(key, post[key]);
        self.post('init', function() {
            this._original = this.toObject();
        });
        for (let key in pre) self.pre(key, pre[key]);
        self.pre('save', function(next) {
            const doc = this;
            doc.wasNew = doc.isNew;
            if (!doc.isNew) doc._updateDate = new Date();
            next();
        });
        self.pre('save', relations(mongo, propsRelations));
        self.static('_create', StaticMethods._create);
        self.static('_list', StaticMethods._list);
        self.static('_read', StaticMethods._read);
        self.static('_update', StaticMethods._update);
        self.static('_delete', StaticMethods._delete);
        self.static('_restore', StaticMethods._restore);
        self.static('_merge', StaticMethods._merge);
        self.static('_name', name);
    }

}

module.exports = Schema;