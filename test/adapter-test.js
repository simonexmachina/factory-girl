var Adapter = require('../lib/adapter');
var tests = require('../lib/adapter-tests');
var should = require('should');
var context = describe;

var TestModel = function(props) {
  this.props = props;
};

var TestAdapter = function() {
  this.db = [];
};
TestAdapter.prototype = new Adapter();
TestAdapter.prototype.save = function(doc, Model, cb) {
  this.db.push(doc);
  process.nextTick(function() {
    cb(null, doc);
  });
};
TestAdapter.prototype.destroy = function(doc, Model, cb) {
  var db = this.db;
  var i = db.indexOf(doc);
  if (i != -1) this.db = db.slice(0, i).concat(db.slice(i + 1));
  process.nextTick(cb);
};

describe('test adapter', function() {
  var adapter = new TestAdapter();
  tests(adapter, TestModel, countModels);
  function countModels(cb) {
    process.nextTick(function() {
      cb(null, adapter.db.length);
    });
  }
});
