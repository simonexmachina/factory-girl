'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _slicedToArray = _interopDefault(require('babel-runtime/helpers/slicedToArray'));
var _getIterator = _interopDefault(require('babel-runtime/core-js/get-iterator'));
var _extends = _interopDefault(require('babel-runtime/helpers/extends'));
var _Promise = _interopDefault(require('babel-runtime/core-js/promise'));
var _regeneratorRuntime = _interopDefault(require('babel-runtime/regenerator'));
var _asyncToGenerator = _interopDefault(require('babel-runtime/helpers/asyncToGenerator'));
var _Set = _interopDefault(require('babel-runtime/core-js/set'));
var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));
var _Object$keys = _interopDefault(require('babel-runtime/core-js/object/keys'));
var _typeof = _interopDefault(require('babel-runtime/helpers/typeof'));
var _Object$getPrototypeOf = _interopDefault(require('babel-runtime/core-js/object/get-prototype-of'));
var _possibleConstructorReturn = _interopDefault(require('babel-runtime/helpers/possibleConstructorReturn'));
var _inherits = _interopDefault(require('babel-runtime/helpers/inherits'));
var Chance = _interopDefault(require('chance'));
var _Object$assign = _interopDefault(require('babel-runtime/core-js/object/assign'));

/* eslint-disable no-underscore-dangle */
function asyncPopulate(target, source) {
  if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') {
    return _Promise.reject(new Error('Invalid target passed'));
  }
  if ((typeof source === 'undefined' ? 'undefined' : _typeof(source)) !== 'object') {
    return _Promise.reject(new Error('Invalid source passed'));
  }

  var promises = _Object$keys(source).map(function (attr) {
    var promise = void 0;
    if (Array.isArray(source[attr])) {
      target[attr] = [];
      promise = asyncPopulate(target[attr], source[attr]);
    } else if (source[attr] === null) {
      target[attr] = null;
    } else if (_typeof(source[attr]) === 'object' && !source[attr]._bsontype) {
      target[attr] = target[attr] || {};
      promise = asyncPopulate(target[attr], source[attr]);
    } else if (typeof source[attr] === 'function') {
      promise = _Promise.resolve(source[attr]()).then(function (v) {
        target[attr] = v;
      });
    } else {
      promise = _Promise.resolve(source[attr]).then(function (v) {
        target[attr] = v;
      });
    }
    return promise;
  });
  return _Promise.all(promises);
}
/* eslint-enable no-underscore-dangle */

var Factory = function () {
  function Factory(Model, initializer) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, Factory);

    this.name = null;
    this.Model = null;
    this.initializer = null;
    this.options = {};

    if (!Model) {
      throw new Error('Invalid Model constructor passed to the factory');
    }
    if ((typeof initializer === 'undefined' ? 'undefined' : _typeof(initializer)) !== 'object' && typeof initializer !== 'function' || !initializer) {
      throw new Error('Invalid initializer passed to the factory');
    }

    this.Model = Model;
    this.initializer = initializer;
    this.options = _extends({}, this.options, options);
  }

  _createClass(Factory, [{
    key: 'getFactoryAttrs',
    value: function getFactoryAttrs() {
      var buildOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var attrs = void 0;
      if (typeof this.initializer === 'function') {
        attrs = this.initializer(buildOptions);
      } else {
        attrs = _extends({}, this.initializer);
      }
      return _Promise.resolve(attrs);
    }
  }, {
    key: 'attrs',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        var extraAttrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var buildOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var factoryAttrs, modelAttrs, filteredAttrs;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.getFactoryAttrs(buildOptions);

              case 2:
                factoryAttrs = _context.sent;
                modelAttrs = {};
                filteredAttrs = _Object$keys(factoryAttrs).reduce(function (attrs, name) {
                  if (!extraAttrs.hasOwnProperty(name)) attrs[name] = factoryAttrs[name];
                  return attrs;
                }, {});
                _context.next = 7;
                return asyncPopulate(modelAttrs, filteredAttrs);

              case 7:
                _context.next = 9;
                return asyncPopulate(modelAttrs, extraAttrs);

              case 9:
                return _context.abrupt('return', modelAttrs);

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function attrs() {
        return _ref.apply(this, arguments);
      }

      return attrs;
    }()
  }, {
    key: 'build',
    value: function () {
      var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(adapter) {
        var extraAttrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var buildOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var modelAttrs, model;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.attrs(extraAttrs, buildOptions);

              case 2:
                modelAttrs = _context2.sent;
                model = adapter.build(this.Model, modelAttrs);
                return _context2.abrupt('return', this.options.afterBuild ? this.options.afterBuild(model, extraAttrs, buildOptions) : model);

              case 5:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function build(_x5) {
        return _ref2.apply(this, arguments);
      }

      return build;
    }()
  }, {
    key: 'create',
    value: function () {
      var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(adapter) {
        var _this = this;

        var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var buildOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var model;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.build(adapter, attrs, buildOptions);

              case 2:
                model = _context3.sent;
                return _context3.abrupt('return', adapter.save(model, this.Model).then(function (savedModel) {
                  return _this.options.afterCreate ? _this.options.afterCreate(savedModel, attrs, buildOptions) : savedModel;
                }));

              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function create(_x8) {
        return _ref3.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'attrsMany',
    value: function attrsMany(num) {
      var attrsArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var buildOptionsArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

      var attrObject = null;
      var buildOptionsObject = null;

      if ((typeof attrsArray === 'undefined' ? 'undefined' : _typeof(attrsArray)) === 'object' && !Array.isArray(attrsArray)) {
        attrObject = attrsArray;
        attrsArray = [];
      }
      if ((typeof buildOptionsArray === 'undefined' ? 'undefined' : _typeof(buildOptionsArray)) === 'object' && !Array.isArray(buildOptionsArray)) {
        buildOptionsObject = buildOptionsArray;
        buildOptionsArray = [];
      }
      if (typeof num !== 'number' || num < 1) {
        return _Promise.reject(new Error('Invalid number of objects requested'));
      }
      if (!Array.isArray(attrsArray)) {
        return _Promise.reject(new Error('Invalid attrsArray passed'));
      }
      if (!Array.isArray(buildOptionsArray)) {
        return _Promise.reject(new Error('Invalid buildOptionsArray passed'));
      }
      attrsArray.length = buildOptionsArray.length = num;
      var models = [];
      for (var i = 0; i < num; i++) {
        models[i] = this.attrs(attrObject || attrsArray[i] || {}, buildOptionsObject || buildOptionsArray[i] || {});
      }
      return _Promise.all(models);
    }
  }, {
    key: 'buildMany',
    value: function () {
      var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(adapter, num) {
        var attrsArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

        var _this2 = this;

        var buildOptionsArray = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
        var buildCallbacks = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
        var attrs, models;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.attrsMany(num, attrsArray, buildOptionsArray);

              case 2:
                attrs = _context4.sent;
                models = attrs.map(function (attr) {
                  return adapter.build(_this2.Model, attr);
                });
                return _context4.abrupt('return', _Promise.all(models).then(function (builtModels) {
                  return _this2.options.afterBuild && buildCallbacks ? _Promise.all(builtModels.map(function (builtModel) {
                    return _this2.options.afterBuild(builtModel, attrsArray, buildOptionsArray);
                  })) : builtModels;
                }));

              case 5:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function buildMany(_x13, _x14) {
        return _ref4.apply(this, arguments);
      }

      return buildMany;
    }()
  }, {
    key: 'createMany',
    value: function () {
      var _ref5 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5(adapter, num) {
        var _this3 = this;

        var attrsArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var buildOptionsArray = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
        var models, savedModels;
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.buildMany(adapter, num, attrsArray, buildOptionsArray);

              case 2:
                models = _context5.sent;
                savedModels = models.map(function (model) {
                  return adapter.save(model, _this3.Model);
                });
                return _context5.abrupt('return', _Promise.all(savedModels).then(function (createdModels) {
                  return _this3.options.afterCreate ? _Promise.all(createdModels.map(function (createdModel) {
                    return _this3.options.afterCreate(createdModel, attrsArray, buildOptionsArray);
                  })) : createdModels;
                }));

              case 5:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function createMany(_x18, _x19) {
        return _ref5.apply(this, arguments);
      }

      return createMany;
    }()
  }]);

  return Factory;
}();

var Generator = function () {
  function Generator(factoryGirl) {
    _classCallCheck(this, Generator);

    if (!factoryGirl) {
      throw new Error('No FactoryGirl instance provided');
    }
    this.factoryGirl = factoryGirl;
  }

  _createClass(Generator, [{
    key: 'generate',
    value: function generate() {
      throw new Error('Override this method to generate a value');
    }
  }, {
    key: 'getAttribute',
    value: function getAttribute(name, model, key) {
      return this.factoryGirl.getAdapter(name).get(model, key);
    }
  }]);

  return Generator;
}();

var Sequence = function (_Generator) {
  _inherits(Sequence, _Generator);

  function Sequence() {
    _classCallCheck(this, Sequence);

    return _possibleConstructorReturn(this, (Sequence.__proto__ || _Object$getPrototypeOf(Sequence)).apply(this, arguments));
  }

  _createClass(Sequence, [{
    key: 'generate',
    value: function generate() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (typeof id === 'function') {
        callback = id;
        id = null;
      }
      id = id || this.id || (this.id = generateId());
      Sequence.sequences[id] = Sequence.sequences[id] || 1;
      var next = Sequence.sequences[id]++;
      return callback ? callback(next) : next;
    }
  }], [{
    key: 'reset',
    value: function reset() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (!id) {
        Sequence.sequences = {};
      } else {
        Sequence.sequences[id] = undefined;
      }
    }
  }]);

  return Sequence;
}(Generator);

Sequence.sequences = {};
function generateId() {
  var id = void 0;
  var i = 0;
  do {
    id = '_' + i++;
  } while (id in Sequence.sequences);
  return id;
}

var Assoc = function (_Generator) {
  _inherits(Assoc, _Generator);

  function Assoc() {
    _classCallCheck(this, Assoc);

    return _possibleConstructorReturn(this, (Assoc.__proto__ || _Object$getPrototypeOf(Assoc)).apply(this, arguments));
  }

  _createClass(Assoc, [{
    key: 'generate',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(name) {
        var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var buildOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        var model;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.factoryGirl.create(name, attrs, buildOptions);

              case 2:
                model = _context.sent;
                return _context.abrupt('return', key ? this.getAttribute(name, model, key) : model);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function generate(_x) {
        return _ref.apply(this, arguments);
      }

      return generate;
    }()
  }]);

  return Assoc;
}(Generator);

var AssocAttrs = function (_Generator) {
  _inherits(AssocAttrs, _Generator);

  function AssocAttrs() {
    _classCallCheck(this, AssocAttrs);

    return _possibleConstructorReturn(this, (AssocAttrs.__proto__ || _Object$getPrototypeOf(AssocAttrs)).apply(this, arguments));
  }

  _createClass(AssocAttrs, [{
    key: 'generate',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(name) {
        var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var buildOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        var model;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.factoryGirl.attrs(name, attrs, buildOptions);

              case 2:
                model = _context.sent;
                return _context.abrupt('return', key ? this.getAttribute(name, model, key) : model);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function generate(_x) {
        return _ref.apply(this, arguments);
      }

      return generate;
    }()
  }]);

  return AssocAttrs;
}(Generator);

var AssocMany = function (_Generator) {
  _inherits(AssocMany, _Generator);

  function AssocMany() {
    _classCallCheck(this, AssocMany);

    return _possibleConstructorReturn(this, (AssocMany.__proto__ || _Object$getPrototypeOf(AssocMany)).apply(this, arguments));
  }

  _createClass(AssocMany, [{
    key: 'generate',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(name, num) {
        var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        var _this2 = this;

        var attrs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        var buildOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
        var models;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.factoryGirl.createMany(name, num, attrs, buildOptions);

              case 2:
                models = _context.sent;
                return _context.abrupt('return', key ? models.map(function (model) {
                  return _this2.getAttribute(name, model, key);
                }) : models);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function generate(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return generate;
    }()
  }]);

  return AssocMany;
}(Generator);

var AssocAttrsMany = function (_Generator) {
  _inherits(AssocAttrsMany, _Generator);

  function AssocAttrsMany() {
    _classCallCheck(this, AssocAttrsMany);

    return _possibleConstructorReturn(this, (AssocAttrsMany.__proto__ || _Object$getPrototypeOf(AssocAttrsMany)).apply(this, arguments));
  }

  _createClass(AssocAttrsMany, [{
    key: 'generate',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(name, num) {
        var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        var _this2 = this;

        var attrs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        var buildOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
        var models;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(typeof num !== 'number' || num < 1)) {
                  _context.next = 2;
                  break;
                }

                throw new Error('Invalid number of items requested');

              case 2:
                _context.next = 4;
                return this.factoryGirl.attrsMany(name, num, attrs, buildOptions);

              case 4:
                models = _context.sent;
                return _context.abrupt('return', key ? models.map(function (model) {
                  return _this2.getAttribute(name, model, key);
                }) : models);

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function generate(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return generate;
    }()
  }]);

  return AssocAttrsMany;
}(Generator);

var chance = new Chance();

var ChanceGenerator = function (_Generator) {
  _inherits(ChanceGenerator, _Generator);

  function ChanceGenerator() {
    _classCallCheck(this, ChanceGenerator);

    return _possibleConstructorReturn(this, (ChanceGenerator.__proto__ || _Object$getPrototypeOf(ChanceGenerator)).apply(this, arguments));
  }

  _createClass(ChanceGenerator, [{
    key: 'generate',
    value: function generate(chanceMethod) {
      if (typeof chance[chanceMethod] !== 'function') {
        throw new Error('Invalid chance method requested');
      }

      for (var _len = arguments.length, options = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        options[_key - 1] = arguments[_key];
      }

      return chance[chanceMethod].apply(chance, options);
    }
  }]);

  return ChanceGenerator;
}(Generator);

var OneOf = function (_Generator) {
  _inherits(OneOf, _Generator);

  function OneOf() {
    _classCallCheck(this, OneOf);

    return _possibleConstructorReturn(this, (OneOf.__proto__ || _Object$getPrototypeOf(OneOf)).apply(this, arguments));
  }

  _createClass(OneOf, [{
    key: 'generate',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(possibleValues) {
        var size, randomIndex, value;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (Array.isArray(possibleValues)) {
                  _context.next = 2;
                  break;
                }

                throw new Error('Expected an array of possible values');

              case 2:
                if (!(possibleValues.length < 1)) {
                  _context.next = 4;
                  break;
                }

                throw new Error('Empty array passed for possible values');

              case 4:
                size = possibleValues.length;
                randomIndex = Math.floor(Math.random() * size);
                value = possibleValues[randomIndex];
                return _context.abrupt('return', typeof value === 'function' ? value() : value);

              case 8:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function generate(_x) {
        return _ref.apply(this, arguments);
      }

      return generate;
    }()
  }]);

  return OneOf;
}(Generator);

/* eslint-disable no-unused-vars */
var DefaultAdapter = function () {
  function DefaultAdapter() {
    _classCallCheck(this, DefaultAdapter);
  }

  _createClass(DefaultAdapter, [{
    key: "build",
    value: function build(Model, props) {
      return new Model(props);
    }
  }, {
    key: "save",
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(model, Model) {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", _Promise.resolve(model.save()).then(function () {
                  return model;
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function save(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return save;
    }()
  }, {
    key: "destroy",
    value: function () {
      var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(model, Model) {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", _Promise.resolve(model.destroy()).then(function () {
                  return model;
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function destroy(_x3, _x4) {
        return _ref2.apply(this, arguments);
      }

      return destroy;
    }()
  }, {
    key: "get",
    value: function get(model, attr, Model) {
      return model.get(attr);
    }
  }, {
    key: "set",
    value: function set(props, model, Model) {
      return model.set(props);
    }
  }]);

  return DefaultAdapter;
}();

var FactoryGirl = function () {
  function FactoryGirl() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, FactoryGirl);

    this.factories = {};
    this.options = {};
    this.adapters = {};
    this.created = new _Set();

    this.assoc = generatorThunk(this, Assoc);
    this.assocMany = generatorThunk(this, AssocMany);
    this.assocBuild = deprecate('assocBuild', 'assocAttrs');
    this.assocBuildMany = deprecate('assocBuildMany', 'assocAttrsMany');
    this.assocAttrs = generatorThunk(this, AssocAttrs);
    this.assocAttrsMany = generatorThunk(this, AssocAttrsMany);
    this.seq = this.sequence = function () {
      return generatorThunk(_this, Sequence).apply(undefined, arguments);
    };
    this.resetSeq = this.resetSequence = function (id) {
      Sequence.reset(id);
    };
    this.chance = generatorThunk(this, ChanceGenerator);
    this.oneOf = generatorThunk(this, OneOf);

    this.defaultAdapter = new DefaultAdapter();
    this.options = options;
  }

  _createClass(FactoryGirl, [{
    key: 'define',
    value: function define(name, Model, initializer, options) {
      if (this.getFactory(name, false)) {
        throw new Error('Factory ' + name + ' already defined');
      }
      this.factories[name] = new Factory(Model, initializer, options);
    }
  }, {
    key: 'attrs',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(name, _attrs, buildOptions) {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', this.getFactory(name).attrs(_attrs, buildOptions));

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function attrs(_x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      }

      return attrs;
    }()
  }, {
    key: 'build',
    value: function () {
      var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(name) {
        var _this2 = this;

        var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var buildOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var adapter;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                adapter = this.getAdapter(name);
                return _context2.abrupt('return', this.getFactory(name).build(adapter, attrs, buildOptions).then(function (model) {
                  return _this2.options.afterBuild ? _this2.options.afterBuild(model, attrs, buildOptions) : model;
                }));

              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function build(_x5) {
        return _ref2.apply(this, arguments);
      }

      return build;
    }()
  }, {
    key: 'create',
    value: function () {
      var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(name, attrs, buildOptions) {
        var _this3 = this;

        var adapter;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                adapter = this.getAdapter(name);
                return _context3.abrupt('return', this.getFactory(name).create(adapter, attrs, buildOptions).then(function (createdModel) {
                  return _this3.addToCreatedList(adapter, createdModel);
                }).then(function (model) {
                  return _this3.options.afterCreate ? _this3.options.afterCreate(model, attrs, buildOptions) : model;
                }));

              case 2:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function create(_x8, _x9, _x10) {
        return _ref3.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'attrsMany',
    value: function attrsMany(name, num, attrs, buildOptions) {
      return this.getFactory(name).attrsMany(num, attrs, buildOptions);
    }
  }, {
    key: 'buildMany',
    value: function () {
      var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(name, num, attrs, buildOptions) {
        var _this4 = this;

        var adapter;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                adapter = this.getAdapter(name);
                return _context4.abrupt('return', this.getFactory(name).buildMany(adapter, num, attrs, buildOptions).then(function (models) {
                  return _this4.options.afterBuild ? _Promise.all(models.map(function (model) {
                    return _this4.options.afterBuild(model, attrs, buildOptions);
                  })) : models;
                }));

              case 2:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function buildMany(_x11, _x12, _x13, _x14) {
        return _ref4.apply(this, arguments);
      }

      return buildMany;
    }()
  }, {
    key: 'createMany',
    value: function () {
      var _ref5 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5(name, num, attrs, buildOptions) {
        var _this5 = this;

        var adapter;
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                adapter = this.getAdapter(name);
                return _context5.abrupt('return', this.getFactory(name).createMany(adapter, num, attrs, buildOptions).then(function (models) {
                  return _this5.addToCreatedList(adapter, models);
                }).then(function (models) {
                  return _this5.options.afterCreate ? _Promise.all(models.map(function (model) {
                    return _this5.options.afterCreate(model, attrs, buildOptions);
                  })) : models;
                }));

              case 2:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function createMany(_x15, _x16, _x17, _x18) {
        return _ref5.apply(this, arguments);
      }

      return createMany;
    }()
  }, {
    key: 'getFactory',
    value: function getFactory(name) {
      var throwError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (!this.factories[name] && throwError) {
        throw new Error('Invalid factory \'' + name + ' requested');
      }
      return this.factories[name];
    }
  }, {
    key: 'withOptions',
    value: function withOptions(options) {
      var merge = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      this.options = merge ? _extends({}, this.options, options) : options;
    }
  }, {
    key: 'getAdapter',
    value: function getAdapter(factory) {
      return factory ? this.adapters[factory] || this.defaultAdapter : this.defaultAdapter;
    }
  }, {
    key: 'addToCreatedList',
    value: function addToCreatedList(adapter, models) {
      if (!Array.isArray(models)) {
        this.created.add([adapter, models]);
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _getIterator(models), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var model = _step.value;

            this.created.add([adapter, model]);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      return models;
    }
  }, {
    key: 'cleanUp',
    value: function cleanUp() {
      var createdArray = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = _getIterator(this.created), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var c = _step2.value;

          createdArray.push(c);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var promise = createdArray.reduce(function (prev, _ref6) {
        var _ref7 = _slicedToArray(_ref6, 2),
            adapter = _ref7[0],
            model = _ref7[1];

        return prev.then(function () {
          return adapter.destroy(model, model.constructor);
        });
      }, _Promise.resolve());
      this.created.clear();
      this.resetSeq();
      return promise;
    }
  }, {
    key: 'setAdapter',
    value: function setAdapter(adapter) {
      var _this6 = this;

      var factoryNames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (!factoryNames) {
        this.defaultAdapter = adapter;
      } else {
        factoryNames = Array.isArray(factoryNames) ? factoryNames : [factoryNames];
        factoryNames.forEach(function (name) {
          _this6.adapters[name] = adapter;
        });
      }
      return adapter;
    }
  }]);

  return FactoryGirl;
}();

function generatorThunk(factoryGirl, SomeGenerator) {
  var generator = new SomeGenerator(factoryGirl);
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return function () {
      return generator.generate.apply(generator, args);
    };
  };
}

function deprecate(method, see) {
  return function () {
    throw new Error('The ' + method + ' method has been deprecated, use ' + see + ' instead');
  };
}

/* eslint-disable no-unused-vars */

var ObjectAdapter = function (_DefaultAdapter) {
  _inherits(ObjectAdapter, _DefaultAdapter);

  function ObjectAdapter() {
    _classCallCheck(this, ObjectAdapter);

    return _possibleConstructorReturn(this, (ObjectAdapter.__proto__ || _Object$getPrototypeOf(ObjectAdapter)).apply(this, arguments));
  }

  _createClass(ObjectAdapter, [{
    key: 'build',
    value: function build(Model, props) {
      var model = new Model();
      this.set(props, model, Model);
      return model;
    }
  }, {
    key: 'save',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(model, Model) {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', model);

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function save(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return save;
    }()
  }, {
    key: 'destroy',
    value: function () {
      var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(model, Model) {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt('return', model);

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function destroy(_x3, _x4) {
        return _ref2.apply(this, arguments);
      }

      return destroy;
    }()
  }, {
    key: 'get',
    value: function get(model, attr, Model) {
      return model[attr];
    }
  }, {
    key: 'set',
    value: function set(props, model, Model) {
      return _Object$assign(model, props);
    }
  }]);

  return ObjectAdapter;
}(DefaultAdapter);

/* eslint-disable no-unused-vars */

var BookshelfAdapter = function (_DefaultAdapter) {
  _inherits(BookshelfAdapter, _DefaultAdapter);

  function BookshelfAdapter() {
    _classCallCheck(this, BookshelfAdapter);

    return _possibleConstructorReturn(this, (BookshelfAdapter.__proto__ || _Object$getPrototypeOf(BookshelfAdapter)).apply(this, arguments));
  }

  _createClass(BookshelfAdapter, [{
    key: 'save',
    value: function save(doc, Model) {
      return doc.save(null, { method: 'insert' });
    }
  }]);

  return BookshelfAdapter;
}(DefaultAdapter);

/* eslint-disable no-unused-vars */

var MongooseAdapter = function (_DefaultAdapter) {
  _inherits(MongooseAdapter, _DefaultAdapter);

  function MongooseAdapter() {
    _classCallCheck(this, MongooseAdapter);

    return _possibleConstructorReturn(this, (MongooseAdapter.__proto__ || _Object$getPrototypeOf(MongooseAdapter)).apply(this, arguments));
  }

  _createClass(MongooseAdapter, [{
    key: 'destroy',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(model, Model) {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', model.remove());

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function destroy(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return destroy;
    }()
  }]);

  return MongooseAdapter;
}(DefaultAdapter);

/* eslint-disable no-unused-vars */

var SequelizeAdapter = function (_DefaultAdapter) {
  _inherits(SequelizeAdapter, _DefaultAdapter);

  function SequelizeAdapter() {
    _classCallCheck(this, SequelizeAdapter);

    return _possibleConstructorReturn(this, (SequelizeAdapter.__proto__ || _Object$getPrototypeOf(SequelizeAdapter)).apply(this, arguments));
  }

  _createClass(SequelizeAdapter, [{
    key: 'build',
    value: function build(Model, props) {
      return Model.build(props);
    }
  }]);

  return SequelizeAdapter;
}(DefaultAdapter);

/* eslint-disable no-unused-vars */

var ReduxORMAdapter = function (_DefaultAdapter) {
  _inherits(ReduxORMAdapter, _DefaultAdapter);

  function ReduxORMAdapter(session) {
    _classCallCheck(this, ReduxORMAdapter);

    var _this = _possibleConstructorReturn(this, (ReduxORMAdapter.__proto__ || _Object$getPrototypeOf(ReduxORMAdapter)).call(this));

    _this.session = session;
    return _this;
  }

  _createClass(ReduxORMAdapter, [{
    key: 'build',
    value: function build(modelName, props) {
      return this.session[modelName].create(props);
    }
  }, {
    key: 'get',
    value: function get(model, attr) {
      return model[attr];
    }
  }, {
    key: 'save',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(model, Model) {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', model);

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function save(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return save;
    }()
  }, {
    key: 'destroy',
    value: function () {
      var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(model, Model) {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt('return', _Promise.resolve(model.delete()).then(function () {
                  return true;
                }));

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function destroy(_x3, _x4) {
        return _ref2.apply(this, arguments);
      }

      return destroy;
    }()
  }]);

  return ReduxORMAdapter;
}(DefaultAdapter);

/* eslint-disable no-unused-vars */

var ObjectionAdapter = function (_DefaultAdapter) {
  _inherits(ObjectionAdapter, _DefaultAdapter);

  function ObjectionAdapter() {
    _classCallCheck(this, ObjectionAdapter);

    return _possibleConstructorReturn(this, (ObjectionAdapter.__proto__ || _Object$getPrototypeOf(ObjectionAdapter)).apply(this, arguments));
  }

  _createClass(ObjectionAdapter, [{
    key: 'build',
    value: function build(Model, props) {
      var model = new Model();
      model.$set(props);
      return model;
    }
  }, {
    key: 'save',
    value: function save(doc, Model) {
      return Model.query().insert(doc);
    }
  }, {
    key: 'destroy',
    value: function destroy(model, Model) {
      return Model.query().deleteById(model.id);
    }
  }]);

  return ObjectionAdapter;
}(DefaultAdapter);

var factory = new FactoryGirl();
factory.FactoryGirl = FactoryGirl;

exports.ObjectAdapter = ObjectAdapter;
exports.BookshelfAdapter = BookshelfAdapter;
exports.DefaultAdapter = DefaultAdapter;
exports.MongooseAdapter = MongooseAdapter;
exports.SequelizeAdapter = SequelizeAdapter;
exports.ReduxORMAdapter = ReduxORMAdapter;
exports.ObjectionAdapter = ObjectionAdapter;
exports.factory = factory;
exports['default'] = factory;
//# sourceMappingURL=index.js.map