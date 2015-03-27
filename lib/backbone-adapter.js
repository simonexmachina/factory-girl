(function() {

  var BackboneAdapter = function() {};

  BackboneAdapter.prototype.build = function(Model, props) {
    return new Model(props);
  };

  BackboneAdapter.prototype.get = function(doc, attr, Model) {
    return doc.get(attr);
  };

  BackboneAdapter.prototype.set = function(props, doc, Model) {
    doc.set(props);
  };

  BackboneAdapter.prototype.save = function(doc, Model, cb) {
    doc.save(cb);
  };
  /**
   *    *     Be aware that the model may have already been destroyed
   *       *        */
  BackboneAdapter.prototype.destroy = function(doc, Model, cb) {
    doc.destroy(cb);
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = BackboneAdapter;
    }
    exports.BackboneAdapter = BackboneAdapter;
  }
  else {
    root.BackboneAdapter = BackboneAdapter;
  }


  if (typeof define === 'function' && define.amd) {
    define('factory-girl-backbone-adapter', function() {
      return BackboneAdapter;
    });
  };

}());
