(function() {

  var Adapter = function() {};

  Adapter.prototype.build = function(Model, props) {
    return new Model(props);
  };

  Adapter.prototype.get = function(doc, attr, Model) {
    return doc.get(attr);
  };

  Adapter.prototype.set = function(props, doc, Model) {
    doc.set(props);
  };

  Adapter.prototype.save = function(doc, Model, cb) {
    doc.save(cb);
  };
  /**
   *    *     Be aware that the model may have already been destroyed
   *       *        */
  Adapter.prototype.destroy = function(doc, Model, cb) {
    doc.destroy(cb);
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Adapter;
    }
    exports.Adapter = Adapter;
  }
  else {
    root.Adapter = Adapter;
  }


  if (typeof define === 'function' && define.amd) {
    define('factory-girl-backbone-adapter', function() {
      return Adapter;
    });
  };

}());
