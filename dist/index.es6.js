import _slicedToArray from 'babel-runtime/helpers/slicedToArray';
import _getIterator from 'babel-runtime/core-js/get-iterator';
import _extends from 'babel-runtime/helpers/extends';
import _Promise from 'babel-runtime/core-js/promise';
import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _Object$assign from 'babel-runtime/core-js/object/assign';
import _Set from 'babel-runtime/core-js/set';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _Object$keys from 'babel-runtime/core-js/object/keys';
import _typeof from 'babel-runtime/helpers/typeof';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import Chance from 'chance';

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
    } else if (isPlainObject(source[attr])) {
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

var objectProto = _Object$getPrototypeOf({});
function isPlainObject(o) {
  return _Object$getPrototypeOf(o) === objectProto;
}

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
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
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
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(adapter) {
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
      var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(adapter) {
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
      var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(adapter, num) {
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
      var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(adapter, num) {
        var _this3 = this;

        var attrsArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var buildOptionsArray = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
        var models, savedModels;
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (Array.isArray(num)) {
                  buildOptionsArray = attrsArray;
                  attrsArray = num;
                  num = attrsArray.length;
                }
                _context5.next = 3;
                return this.buildMany(adapter, num, attrsArray, buildOptionsArray);

              case 3:
                models = _context5.sent;
                savedModels = models.map(function (model) {
                  return adapter.save(model, _this3.Model);
                });
                return _context5.abrupt('return', _Promise.all(savedModels).then(function (createdModels) {
                  return _this3.options.afterCreate ? _Promise.all(createdModels.map(function (createdModel) {
                    return _this3.options.afterCreate(createdModel, attrsArray, buildOptionsArray);
                  })) : createdModels;
                }));

              case 6:
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
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(name) {
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
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(name) {
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
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(name, num) {
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
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(name, num) {
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
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(possibleValues) {
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
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(model, Model) {
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
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(model, Model) {
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
    value: function define(name, Model, initializer) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      if (this.getFactory(name, false)) {
        throw new Error('Factory ' + name + ' already defined');
      }
      var factory = this.factories[name] = new Factory(Model, initializer, options);
      return factory;
    }
  }, {
    key: 'extend',
    value: function extend(parent, name, childInitializer) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      if (this.getFactory(name, false)) {
        throw new Error('Factory ' + name + ' already defined');
      }
      var parentFactory = this.getFactory(parent, true);
      var Model = options.model || parentFactory.Model;
      var jointInitializer = void 0;

      function resolveInitializer(initializer, buildOptions) {
        return typeof initializer === 'function' ? initializer(buildOptions) : initializer;
      }

      if (typeof parentFactory.initializer === 'function' || typeof childInitializer === 'function') {
        jointInitializer = function initializer() {
          var buildOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          return _Object$assign({}, resolveInitializer(parentFactory.initializer, buildOptions), resolveInitializer(childInitializer, buildOptions));
        };
      } else {
        jointInitializer = _Object$assign({}, parentFactory.initializer, childInitializer);
      }

      var factory = this.factories[name] = new Factory(Model, jointInitializer, options);
      return factory;
    }
  }, {
    key: 'attrs',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(name, _attrs) {
        var buildOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
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

      function attrs(_x5, _x6) {
        return _ref.apply(this, arguments);
      }

      return attrs;
    }()
  }, {
    key: 'build',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(name) {
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

      function build(_x8) {
        return _ref2.apply(this, arguments);
      }

      return build;
    }()
  }, {
    key: 'create',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(name, attrs) {
        var _this3 = this;

        var buildOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
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

      function create(_x11, _x12) {
        return _ref3.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'attrsMany',
    value: function attrsMany(name, num, attrs) {
      var buildOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      return this.getFactory(name).attrsMany(num, attrs, buildOptions);
    }
  }, {
    key: 'buildMany',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(name, num, attrs) {
        var _this4 = this;

        var buildOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
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

      function buildMany(_x15, _x16, _x17) {
        return _ref4.apply(this, arguments);
      }

      return buildMany;
    }()
  }, {
    key: 'createMany',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(name, num, attrs) {
        var _this5 = this;

        var buildOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
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

      function createMany(_x19, _x20, _x21) {
        return _ref5.apply(this, arguments);
      }

      return createMany;
    }()
  }, {
    key: 'getFactory',
    value: function getFactory(name) {
      var throwError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (!this.factories[name] && throwError) {
        throw new Error('Invalid factory \'' + name + '\' requested');
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

/* eslint-disable no-underscore-dangle */
function syncPopulate(target, source) {
  if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') {
    throw new Error('Invalid target passed');
  }
  if ((typeof source === 'undefined' ? 'undefined' : _typeof(source)) !== 'object') {
    throw new Error('Invalid source passed');
  }

  return _Object$keys(source).map(function (attr) {
    var promise = void 0;
    if (Array.isArray(source[attr])) {
      target[attr] = [];
      return syncPopulate(target[attr], source[attr]);
    } else if (source[attr] === null) {
      target[attr] = null;
    } else if (isPlainObject$1(source[attr])) {
      target[attr] = target[attr] || {};
      return syncPopulate(target[attr], source[attr]);
    } else if (typeof source[attr] === 'function') {
      target[attr] = source[attr]();
    } else {
      target[attr] = source[attr];
    }
    return promise;
  });
}
/* eslint-enable no-underscore-dangle */

var objectProto$1 = _Object$getPrototypeOf({});
function isPlainObject$1(o) {
  return _Object$getPrototypeOf(o) === objectProto$1;
}

var Factory$1 = function () {
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
      throw new Error('Inalid initializer passed to the factory');
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
      return attrs;
    }
  }, {
    key: 'attrs',
    value: function attrs() {
      var extraAttrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var buildOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var factoryAttrs = this.getFactoryAttrs(buildOptions);
      var modelAttrs = {};

      var filteredAttrs = _Object$keys(factoryAttrs).reduce(function (attrs, name) {
        if (!extraAttrs.hasOwnProperty(name)) attrs[name] = factoryAttrs[name];
        return attrs;
      }, {});

      syncPopulate(modelAttrs, filteredAttrs);
      syncPopulate(modelAttrs, extraAttrs);

      return modelAttrs;
    }
  }, {
    key: 'build',
    value: function build(adapter) {
      var extraAttrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var buildOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var modelAttrs = this.attrs(extraAttrs, buildOptions);
      var model = adapter.build(this.Model, modelAttrs);
      return this.options.afterBuild ? this.options.afterBuild(model, extraAttrs, buildOptions) : model;
    }
  }, {
    key: 'create',
    value: function create(adapter) {
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var buildOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var model = this.build(adapter, attrs, buildOptions);
      var savedModel = adapter.save(model, this.Model);
      return this.options.afterCreate ? this.options.afterCreate(savedModel, attrs, buildOptions) : savedModel;
    }
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
        new Error('Invalid number of objects requested');
      }
      if (!Array.isArray(attrsArray)) {
        new Error('Invalid attrsArray passed');
      }
      if (!Array.isArray(buildOptionsArray)) {
        new Error('Invalid buildOptionsArray passed');
      }
      attrsArray.length = buildOptionsArray.length = num;
      var models = [];
      for (var i = 0; i < num; i++) {
        models[i] = this.attrs(attrObject || attrsArray[i] || {}, buildOptionsObject || buildOptionsArray[i] || {});
      }
      return models;
    }
  }, {
    key: 'buildMany',
    value: function buildMany(adapter, num) {
      var attrsArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

      var _this = this;

      var buildOptionsArray = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
      var buildCallbacks = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

      var attrs = this.attrsMany(num, attrsArray, buildOptionsArray);
      var builtModels = attrs.map(function (attr) {
        return adapter.build(_this.Model, attr);
      });
      return this.options.afterBuild && buildCallbacks ? builtModels.map(function (builtModel) {
        return _this.options.afterBuild(builtModel, attrsArray, buildOptionsArray);
      }) : builtModels;
    }
  }, {
    key: 'createMany',
    value: function createMany(adapter, num) {
      var _this2 = this;

      var attrsArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var buildOptionsArray = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

      if (Array.isArray(num)) {
        buildOptionsArray = attrsArray;
        attrsArray = num;
        num = attrsArray.length;
      }
      var models = this.buildMany(adapter, num, attrsArray, buildOptionsArray);
      var createdModels = models.map(function (model) {
        return adapter.save(model, _this2.Model);
      });
      return this.options.afterCreate ? createdModels.map(function (createdModel) {
        return _this2.options.afterCreate(createdModel, attrsArray, buildOptionsArray);
      }) : createdModels;
    }
  }]);

  return Factory;
}();

var Generator$1 = function () {
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

var Sequence$1 = function (_Generator) {
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
      id = id || this.id || (this.id = generateId$1());
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
}(Generator$1);

Sequence$1.sequences = {};
function generateId$1() {
  var id = void 0;
  var i = 0;
  do {
    id = '_' + i++;
  } while (id in Sequence$1.sequences);
  return id;
}

var Assoc$1 = function (_Generator) {
  _inherits(Assoc, _Generator);

  function Assoc() {
    _classCallCheck(this, Assoc);

    return _possibleConstructorReturn(this, (Assoc.__proto__ || _Object$getPrototypeOf(Assoc)).apply(this, arguments));
  }

  _createClass(Assoc, [{
    key: 'generate',
    value: function generate(name) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var buildOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      var model = this.factoryGirl.create(name, attrs, buildOptions);
      return key ? this.getAttribute(name, model, key) : model;
    }
  }]);

  return Assoc;
}(Generator$1);

var AssocAttrs$1 = function (_Generator) {
  _inherits(AssocAttrs, _Generator);

  function AssocAttrs() {
    _classCallCheck(this, AssocAttrs);

    return _possibleConstructorReturn(this, (AssocAttrs.__proto__ || _Object$getPrototypeOf(AssocAttrs)).apply(this, arguments));
  }

  _createClass(AssocAttrs, [{
    key: 'generate',
    value: function generate(name) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var buildOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      var model = this.factoryGirl.attrs(name, attrs, buildOptions);
      return key ? this.getAttribute(name, model, key) : model;
    }
  }]);

  return AssocAttrs;
}(Generator$1);

var AssocMany$1 = function (_Generator) {
  _inherits(AssocMany, _Generator);

  function AssocMany() {
    _classCallCheck(this, AssocMany);

    return _possibleConstructorReturn(this, (AssocMany.__proto__ || _Object$getPrototypeOf(AssocMany)).apply(this, arguments));
  }

  _createClass(AssocMany, [{
    key: 'generate',
    value: function generate(name, num) {
      var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var _this2 = this;

      var attrs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var buildOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      var models = this.factoryGirl.createMany(name, num, attrs, buildOptions);
      return key ? models.map(function (model) {
        return _this2.getAttribute(name, model, key);
      }) : models;
    }
  }]);

  return AssocMany;
}(Generator$1);

var AssocAttrsMany$1 = function (_Generator) {
  _inherits(AssocAttrsMany, _Generator);

  function AssocAttrsMany() {
    _classCallCheck(this, AssocAttrsMany);

    return _possibleConstructorReturn(this, (AssocAttrsMany.__proto__ || _Object$getPrototypeOf(AssocAttrsMany)).apply(this, arguments));
  }

  _createClass(AssocAttrsMany, [{
    key: 'generate',
    value: function generate(name, num) {
      var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var _this2 = this;

      var attrs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var buildOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      if (typeof num !== 'number' || num < 1) {
        throw new Error('Invalid number of items requested');
      }
      var models = this.factoryGirl.attrsMany(name, num, attrs, buildOptions);
      return key ? models.map(function (model) {
        return _this2.getAttribute(name, model, key);
      }) : models;
    }
  }]);

  return AssocAttrsMany;
}(Generator$1);

var chance$1 = new Chance();

var ChanceGenerator$1 = function (_Generator) {
  _inherits(ChanceGenerator, _Generator);

  function ChanceGenerator() {
    _classCallCheck(this, ChanceGenerator);

    return _possibleConstructorReturn(this, (ChanceGenerator.__proto__ || _Object$getPrototypeOf(ChanceGenerator)).apply(this, arguments));
  }

  _createClass(ChanceGenerator, [{
    key: 'generate',
    value: function generate(chanceMethod) {
      if (typeof chance$1[chanceMethod] !== 'function') {
        throw new Error('Invalid chance method requested');
      }

      for (var _len = arguments.length, options = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        options[_key - 1] = arguments[_key];
      }

      return chance$1[chanceMethod].apply(chance$1, options);
    }
  }]);

  return ChanceGenerator;
}(Generator$1);

var OneOf$1 = function (_Generator) {
  _inherits(OneOf, _Generator);

  function OneOf() {
    _classCallCheck(this, OneOf);

    return _possibleConstructorReturn(this, (OneOf.__proto__ || _Object$getPrototypeOf(OneOf)).apply(this, arguments));
  }

  _createClass(OneOf, [{
    key: 'generate',
    value: function generate(possibleValues) {
      if (!Array.isArray(possibleValues)) {
        throw new Error('Expected an array of possible values');
      }

      if (possibleValues.length < 1) {
        throw new Error('Empty array passed for possible values');
      }

      var size = possibleValues.length;
      var randomIndex = Math.floor(Math.random() * size);
      var value = possibleValues[randomIndex];
      return typeof value === 'function' ? value() : value;
    }
  }]);

  return OneOf;
}(Generator$1);

/* eslint-disable no-unused-vars */
var DefaultAdapter$1 = function () {
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
    value: function save(model, Model) {
      model.save();
      return model;
    }
  }, {
    key: "destroy",
    value: function destroy(model, Model) {
      model.destroy();
      return model;
    }
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

var SyncFactoryGirl = function () {
  function SyncFactoryGirl() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SyncFactoryGirl);

    this.factories = {};
    this.options = {};
    this.adapters = {};
    this.created = new _Set();

    this.assoc = generatorThunk$1(this, Assoc$1);
    this.assocMany = generatorThunk$1(this, AssocMany$1);
    this.assocBuild = deprecate$1('assocBuild', 'assocAttrs');
    this.assocBuildMany = deprecate$1('assocBuildMany', 'assocAttrsMany');
    this.assocAttrs = generatorThunk$1(this, AssocAttrs$1);
    this.assocAttrsMany = generatorThunk$1(this, AssocAttrsMany$1);
    this.seq = this.sequence = function () {
      return generatorThunk$1(_this, Sequence$1).apply(undefined, arguments);
    };
    this.resetSeq = this.resetSequence = function (id) {
      Sequence$1.reset(id);
    };
    this.chance = generatorThunk$1(this, ChanceGenerator$1);
    this.oneOf = generatorThunk$1(this, OneOf$1);

    this.defaultAdapter = new DefaultAdapter$1();
    this.options = options;
  }

  _createClass(SyncFactoryGirl, [{
    key: 'define',
    value: function define(name, Model, initializer) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      if (this.getFactory(name, false)) {
        throw new Error('Factory ' + name + ' already defined');
      }
      var factory = this.factories[name] = new Factory$1(Model, initializer, options);
      return factory;
    }
  }, {
    key: 'extend',
    value: function extend(parent, name, childInitializer) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      if (this.getFactory(name, false)) {
        throw new Error('Factory ' + name + ' already defined');
      }
      var parentFactory = this.getFactory(parent, true);
      var Model = options.model || parentFactory.Model;
      var jointInitializer = void 0;

      function resolveInitializer(initializer, buildOptions) {
        return typeof initializer === 'function' ? initializer(buildOptions) : initializer;
      }

      if (typeof parentFactory.initializer === 'function' || typeof childInitializer === 'function') {
        jointInitializer = function initializer() {
          var buildOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          return _Object$assign({}, resolveInitializer(parentFactory.initializer, buildOptions), resolveInitializer(childInitializer, buildOptions));
        };
      } else {
        jointInitializer = _Object$assign({}, parentFactory.initializer, childInitializer);
      }

      var factory = this.factories[name] = new Factory$1(Model, jointInitializer, options);
      return factory;
    }
  }, {
    key: 'attrs',
    value: function attrs(name, _attrs) {
      var buildOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      return this.getFactory(name).attrs(_attrs, buildOptions);
    }
  }, {
    key: 'build',
    value: function build(name) {
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var buildOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var adapter = this.getAdapter(name);
      var model = this.getFactory(name).build(adapter, attrs, buildOptions);
      return this.options.afterBuild ? this.options.afterBuild(model, attrs, buildOptions) : model;
    }
  }, {
    key: 'create',
    value: function create(name, attrs) {
      var buildOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var adapter = this.getAdapter(name);
      var createdModel = this.getFactory(name).create(adapter, attrs, buildOptions);
      var model = this.addToCreatedList(adapter, createdModel);
      return this.options.afterCreate ? this.options.afterCreate(model, attrs, buildOptions) : model;
    }
  }, {
    key: 'attrsMany',
    value: function attrsMany(name, num, attrs) {
      var buildOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      return this.getFactory(name).attrsMany(num, attrs, buildOptions);
    }
  }, {
    key: 'buildMany',
    value: function buildMany(name, num, attrs) {
      var _this2 = this;

      var buildOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      var adapter = this.getAdapter(name);
      var models = this.getFactory(name).buildMany(adapter, num, attrs, buildOptions);
      return this.options.afterBuild ? models.map(function (model) {
        return _this2.options.afterBuild(model, attrs, buildOptions);
      }) : models;
    }
  }, {
    key: 'createMany',
    value: function createMany(name, num, attrs) {
      var _this3 = this;

      var buildOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      var adapter = this.getAdapter(name);
      var createdModels = this.getFactory(name).createMany(adapter, num, attrs, buildOptions);
      var models = this.addToCreatedList(adapter, createdModels);
      return this.options.afterCreate ? models.map(function (model) {
        return _this3.options.afterCreate(model, attrs, buildOptions);
      }) : models;
    }
  }, {
    key: 'getFactory',
    value: function getFactory(name) {
      var throwError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (!this.factories[name] && throwError) {
        throw new Error('Invalid factory \'' + name + '\' requested');
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

      createdArray.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            adapter = _ref2[0],
            model = _ref2[1];

        return adapter.destroy(model, model.constructor);
      });
      this.created.clear();
      this.resetSeq();
    }
  }, {
    key: 'setAdapter',
    value: function setAdapter(adapter) {
      var _this4 = this;

      var factoryNames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (!factoryNames) {
        this.defaultAdapter = adapter;
      } else {
        factoryNames = Array.isArray(factoryNames) ? factoryNames : [factoryNames];
        factoryNames.forEach(function (name) {
          _this4.adapters[name] = adapter;
        });
      }
      return adapter;
    }
  }]);

  return SyncFactoryGirl;
}();

function generatorThunk$1(factoryGirl, SomeGenerator) {
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

function deprecate$1(method, see) {
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
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(model, Model) {
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
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(model, Model) {
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
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(model, Model) {
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
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(model, Model) {
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
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(model, Model) {
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

var factory = new FactoryGirl();
factory.FactoryGirl = FactoryGirl;

var syncFactory = new SyncFactoryGirl();
syncFactory.FactoryGirl = SyncFactoryGirl;

export { ObjectAdapter, BookshelfAdapter, DefaultAdapter, MongooseAdapter, SequelizeAdapter, ReduxORMAdapter, factory, syncFactory };export default factory;
//# sourceMappingURL=index.es6.js.map