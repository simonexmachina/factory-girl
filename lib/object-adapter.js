(function() {

  var root = this;

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

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = ObjectAdapter;
    }
    exports.ObjectAdapter = ObjectAdapter;
  }
  else {
    root.ObjectAdapter = ObjectAdapter;
  }


  if (typeof define === 'function' && define.amd) {
    define('factory-girl-object-adapter', function() {
      return ObjectAdapter;
    });
  };

}());
