(function(adapter) {

  if (typeof exports !== 'undefined') {
    var ObjectAdapter = adapter();
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = ObjectAdapter;
    }
    exports.ObjectAdapter = ObjectAdapter;
  }
  else if (typeof define === 'function' && define.amd) {
    define('factory-girl-object-adapter', function() {
      return adapter();
    });
  }
  else {
    adapter();
  }
}(function() {

  var ObjectAdapter = function() {};
  ObjectAdapter.prototype.build = function(Model, props) {
    return props;
  };
  ObjectAdapter.prototype.save = function(doc, Model, cb) {
    process.nextTick(function() {
      cb(null, doc);
    });
  };
  ObjectAdapter.prototype.destroy = function(doc, Model, cb) {};

  var root = this;
  root.ObjectAdapter = ObjectAdapter;

  return ObjectAdapter;
}));
