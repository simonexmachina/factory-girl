(function(factory) {


  if (typeof exports !== 'undefined') {
    module.exports = factory();
    module.exports.ObjectAdapter = require('./lib/object-adapter');
  }
  else if (typeof define === 'function' && define.amd) {
    define(['factory-girl-object-adapter'], function(ObjectAdapter) {
      var _factory = factory();
      _factory.ObjectAdapter = ObjectAdapter;
      return _factory;
    });
  }
  else {
    window.Factory = factory();
  }
}(function() {
  var Factory = function() {
    var factory = this,
        factories = {},
        defaultAdapter = new Adapter(),
        adapters = {},
        created = [];

    factory.define = function(name, model, attributes, options) {
      options = options || {};

      factories[name] = {
        model: model,
        attributes: attributes,
        options: options
      };
    };

    var builderProxy = function(fnName) {
      return function() {
        var builder = new Builder();
        return builder[fnName].apply(builder, arguments);
      };
    };

    factory.withOptions = builderProxy('withOptions');
    factory.build = builderProxy('build');
    factory.buildSync = builderProxy('buildSync');
    factory.buildMany = builderProxy('buildMany');
    factory.create = builderProxy('create');
    factory.createMany = builderProxy('createMany');

    factory.assoc = function(name, key, attrs) {
      attrs = attrs || {};
      return function(callback) {
        factory.create(name, attrs, function(err, doc) {
          if (err) return callback(err);
          callback(null, key ? doc[key] : doc);
        });
      };
    };

    factory.assocBuild = function(name, key, attrs) {
      attrs = attrs || {};
      return function(callback) {
        factory.build(name, attrs, function(err, doc) {
          if (err) return callback(err);
          callback(null, key ? doc[key] : doc);
        });
      };
    };

    factory.assocMany = function(name, key, num, attrsArray) {
      if (arguments.length < 4) {
        if (typeof key === 'number') {
          attrsArray = num;
          num = key;
          key = null;
        }
      }
      return function(callback) {
        factory.createMany(name, attrsArray, num, function(err, docs) {
          if (err) return callback(err);
          if (key) {
            for (var i = 0; i < docs.length; ++i) {
              docs[i] = docs[i][key];
            }
          }
          callback(null, docs);
        });
      };
    };

    factory.assocManyBuild = function(name, key, num, attrsArray) {
      if (arguments.length < 4) {
        if (typeof key === 'number') {
          attrsArray = num;
          num = key;
          key = null;
        }
      }
      return function(callback) {
        factory.buildMany(name, attrsArray, num, function(err, docs) {
          if (err) return callback(err);
          if (key) {
            for (var i = 0; i < docs.length; ++i) {
              docs[i] = docs[i][key];
            }
          }
          callback(null, docs);
        });
      };
    };

    factory.adapterFor = function(name) {
      return adapters[name] || defaultAdapter;
    };

    factory.setAdapter = function(adapter, name) {
      if (name) {
        adapters[name] = adapter;
      }
      else {
        defaultAdapter = adapter;
      }
    };

    factory.promisify = function(promiseLibrary) {
      var promisify = promiseLibrary.promisify || promiseLibrary.denodeify;
      if (!promisify) throw new Error("No 'promisify' or 'denodeify' method found in supplied promise library");
      var promisified = {};
      for (var i in factory) {
        if (factory.hasOwnProperty(i)) {
          promisified[i] = factory[i];
        }
      }

      var promisifiedBuilderProxy = function(fnName) {
        return function() {
          var builder = new Builder();
          builder.promisify(promisify)
          return builder[fnName].apply(builder, arguments);
        };
      };

      promisified.withOptions = promisifiedBuilderProxy('withOptions');
      promisified.build = promisifiedBuilderProxy('build');
      promisified.buildMany = promisifiedBuilderProxy('buildMany');
      promisified.create = promisifiedBuilderProxy('create');
      promisified.createMany = promisifiedBuilderProxy('createMany');

      promisified.cleanup = promisify(factory.cleanup);

      return promisified;
    };

    factory.cleanup = function(callback) {
      asyncForEach(created.reverse(), function(tuple, cb) {
        var name = tuple[0],
            doc = tuple[1],
            adapter = factory.adapterFor(name),
            model = factories[name].model;
        adapter.destroy(doc, model, cb);
      }, callback);
      created = [];
    };

    var Builder = function() {
      var builder = this;
      builder.options = {};

      builder.promisify = function(promisify) {
        builder.build = promisify(builder.build);
        builder.create = promisify(builder.create);
        builder.buildMany = promisify(builder.buildMany);
        builder.createMany = promisify(builder.createMany);
      }

      builder.withOptions = function(options) {
        merge(builder.options, options);
        return builder;
      };

      builder.create = function(name, attrs, callback) {
        if (typeof attrs === 'function') {
          callback = attrs;
          attrs = {};
        }
        if (!factories[name]) {
          return callback(new Error("No factory defined for model '" + name + "'"));
        }

        builder.build(name, attrs, function(err, doc) {
          if (err) return callback(err);

          save(name, doc, function(saveErr, saveDoc) {
            if(saveErr) return callback(saveErr);

            if (factories[name].options.afterCreate) {
              factories[name].options.afterCreate.call(this, saveDoc, builder.options, callback);
            } else {
              callback(saveErr, saveDoc);
            }
          });
        });
      };

      builder.build = function(name, attrs, callback) {
        if (typeof attrs === 'function') {
          callback = attrs;
          attrs = {};
        }

        if (!factories[name]) {
          return callback(new Error("No factory defined for model '" + name + "'"));
        }
        var model = factories[name].model;
        attrs = merge(copy(factories[name].attributes), attrs);

        asyncForEach(keys(attrs), function(key, cb) {
          var fn = attrs[key];
          if (typeof fn === 'function') {
            if (!fn.length) {
              attrs[key] = fn.call(attrs);
              cb();
            }
            else {
              fn.call(attrs, function(err, value) {
                if (err) return cb(err);
                attrs[key] = value;
                cb();
              });
            }
          }
          else {
            cb();
          }
        }, function(err) {
          if (err) return callback(err);
          var adapter = factory.adapterFor(name),
              doc = adapter.build(model, attrs);
          callback(null, doc);
        });
      };

      builder.buildSync = function(name, attrs) {
        if (!factories[name]) {
          throw new Error("No factory defined for model '" + name + "'");
        }
        var model = factories[name].model;
        attrs = merge(copy(factories[name].attributes), attrs);
        var names = keys(attrs);
        for (var i = 0; i < names.length; i++) {
          var key = names[i], fn = attrs[key];
          if (typeof fn == 'function') {
            if (fn.length) {
              throw new Error("buildSync only supports synchronous property functions (with no arguments): the function for '" + name + "." + key + "' expects " + fn.length + " arguments");
            }
            attrs[key] = fn.call(attrs);
          }
        }
        var adapter = factory.adapterFor(name);
        return adapter.build(model, attrs);
      };

      builder.buildMany = function(name, attrsArray, num, callback) {
        var args = parseBuildManyArgs.apply(null, arguments);
        buildMany(args);
      };

      builder.createMany = function(name, attrsArray, num, callback) {
        var args = parseBuildManyArgs.apply(null, arguments),
            results = [];
        callback = args.callback;
        args.callback = function(err, docs) {
          if (err) return callback(err);
          asyncForEach(docs, function(doc, cb, index) {
            save(name, doc, function(err) {
              if (!err) results[index] = doc;
              cb(err);
            });
          }, function(err) {
            callback(err, results);
          });
        };
        buildMany(args);
      };

      function buildMany(args) {
        var results = [];
        asyncForEach(args.attrsArray, function(attrs, cb, index) {
          builder.build(args.name, attrs, function(err, doc) {
            if (!err) results[index] = doc;
            cb(err);
          });
        }, function(err) {
          args.callback(err, results);
        });
      }

      function parseBuildManyArgs(name, attrsArray, num, callback) {
        if (typeof num == 'function') { // name, Array, callback
          callback = num;
          num = attrsArray.length;
        }
        if (typeof attrsArray == 'number') { // name, num, callback
          num = attrsArray;
          attrsArray = null;
        }
        if (!(attrsArray instanceof Array)) { // name, Object, num, callback
          if (typeof num != 'number') throw new Error("num must be specified when attrsArray is not an array");
          var attrs = attrsArray;
          attrsArray = new Array(num);
          for (var i = 0; i < num; i++) {
            attrsArray[i] = attrs;
          }
        }
        if (!attrsArray) {
          attrsArray = new Array(num);
        }
        else if( attrsArray.length !== num ) {
          attrsArray.length = num;
        }
        return {
          name: name,
          attrsArray: attrsArray,
          num: num,
          callback: callback
        };
      }

      function save(name, doc, callback) {
        var model = factories[name].model;
        factory.adapterFor(name).save(doc, model, function (err) {
          if (!err) created.push([name, doc]);
          callback(err, doc);
        });
      }
    };
  };

  var Adapter = function() {};

  Adapter.prototype.build = function(Model, props) {
    var doc = new Model();
    this.set(props, doc, Model);
    return doc;
  };
  Adapter.prototype.get = function(doc, attr, Model) {
    return doc[attr];
  };
  Adapter.prototype.set = function(props, doc, Model) {
    var key;
    for (key in props) {
      if (props.hasOwnProperty(key)) {
        doc[key] = props[key];
      }
    }
  };
  Adapter.prototype.save = function(doc, Model, cb) {
    doc.save(cb);
  };
  /**
    Be aware that the model may have already been destroyed
   */
  Adapter.prototype.destroy = function(doc, Model, cb) {
    doc.destroy(cb);
  };

  var merge = require('lodash.merge');
  
  function copy(obj) {
    var newObj = {};
    if (obj) {
      merge(newObj, obj);
    }
    return newObj;
  }
  function keys(obj) {
    var rv = [], key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
       rv.push(key);
      }
    }
    return rv;
  }
  function asyncForEach(array, handler, callback) {
    var length = array.length,
        index = -1;
    function processNext(err) {
      if (err) return callback(err);
      index++;
      if (index < length) {
        handler(array[index], processNext, index);
      }
      else if (callback) {
        setImmediate ? setImmediate(callback) : setTimeout(callback, 0);
      }
    }
    processNext();
  }

  var factory = new Factory();
  factory.Adapter = Adapter;
  factory.Factory = Factory;

  return factory;

}));
