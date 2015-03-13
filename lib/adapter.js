(function() {

  var root = this;

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
   *     Be aware that the model may have already been destroyed
   *        */
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
		define('factory-girl-adapter', function() {
			return Adapter;
		});
	};

}());
