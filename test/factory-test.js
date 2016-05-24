/* global describe, beforeEach, afterEach */
var factory = require('..');
var should = require('should');
var context = describe;
var sinon = require('sinon');
var expect = require('chai').expect;

describe('factory', function() {
  var Model, Person, Job, Post;

  before(function() {
    Model = function() {};

    Model.prototype.save = function(callback) {
      this.saveCalled = true;
      callback();
    };
    Model.prototype.destroy = function(callback) {
      this.destroyCalled = true;
      callback();
    };

    Person = function() {};
    Person.prototype = new Model();

    Job = function() {};
    Job.prototype = new Model();

    Company = function() {};
    Company.prototype = new Model();

    Post = function() {};
    Post.prototype = new Model();
  });

  beforeEach(function() {
    var nameCounter = 1, emailCounter = 1;
    factory.define('person', Person, {
      name: function(cb) {
        process.nextTick(function() { // Zalgo begone!!
          cb(null, "Person " + nameCounter++);
        });
      },
      email: function() {
        return "email" + (emailCounter++) + "@noemail.com";
      },
      age: 25,
      job: factory.assoc('job', null, { company: 'Bazqux Co.' }),
      title: factory.assoc('job', 'title')
    });
    factory.define('interestingPerson', Person,
      { interests: ['running', 'chess']},
      { extend: 'person' }
    );

    factory.define('job', Job, {
      title: 'Engineer',
      company: 'Foobar Inc.',
      duties: {
        cleaning: false,
        writing: true,
        computing: true
      }
    });

    factory.define('company', Company, {
      name: 'Fruit Company',
      employees: factory.assocMany('person', 3),
      managers: factory.assocMany('person', 'name', 2)
    });

    factory.define('post', Post, {
      num: factory.sequence(),
      email: factory.sequence(function(n) {
        return 'email' + n + '@test.com';
      }),
      name: factory.seq(function(n, cb) {
        process.nextTick(function() {
          cb(null, 'Post' + n);
        });
      })
    });
  });

  describe('#attrs', function() {
      it('correctly generates attrs', function(done) {
          factory.attrs('job', function(err, jobAttrs) {
            jobAttrs.should.eql({
              title: 'Engineer',
              company: 'Foobar Inc.',
              duties: {
                cleaning: false,
                writing: true,
                computing: true
              }
            });
            done();
          });
      });

      it('correctly overrides attrs', function(done) {
          var overrides = { title: 'Developer' };

          factory.attrs('job', overrides, function(err, jobAttrs) {
            jobAttrs.title.should.eql(overrides.title);
            jobAttrs.company.should.eql('Foobar Inc.');
            done();
          });
      });

      it('correctly handles nested attributes', function(done) {
          factory.attrs('company', function(err, companyAttrs) {
            companyAttrs.employees.should.be.instanceof(Array);
            companyAttrs.employees.length.should.eql(3);

            companyAttrs.managers.should.be.instanceof(Array);
            companyAttrs.managers.length.should.eql(2);

            done();
          });
      });
  });

  describe('#build', function() {
    it('builds, but does not save the object', function(done) {
      factory.build('job', function(err, job) {
        (job instanceof Job).should.be.true;
        job.title.should.eql('Engineer');
        job.company.should.eql('Foobar Inc.');
        job.should.not.have.property('saveCalled');
        done();
      });

      context('passing attributes as second argument', function() {
        it('sets them', function(done) {
          factory.build('job', { title: "Artist", company: "Bazqux Co.", duties: { cleaning: true, writing: false } }, function(err, job) {
            (job instanceof Job).should.be.true;
            job.title.should.eql('Artist');
            job.company.should.eql('Bazqux Co.');
            job.should.not.have.property('saveCalled');
            job.duties.cleaning.should.be.true;
            job.duties.writing.should.be.false;
            job.duties.computing.should.be.true;
            done();
          });
        });
      });

      context('defined with an afterBuild handler', function() {
        var spy;

        beforeEach(function() {
          spy = sinon.spy();
          factory.define('job with after build', Job, {
            title: 'Engineer',
            company: 'Foobar Inc.'
          }, {
            afterBuild: function(doc, options, done) {
              spy.apply(null, arguments);
              doc.title = 'Astronaut';
              done(null, doc);
            }
          });
        });

        it('calls afterBuild', function() {
          factory.build('job with after build', function(err, job) {
            spy.called.should.be.true;
          });
        });

        it('allows afterBuild to mutate the model', function() {
          factory.build('job with after build', function(err, job) {
            job.title.should.eql('Astronaut');
          });
        });

        it('calls afterBuild with buildMany', function() {
          var num = 10;
          factory.buildMany('job with after build', num, function(err) {
            spy.callCount.should.equal(num);
          });
        });
      });

      context('factory containing an association', function() {
        it('is able to handle that', function(done) {
          factory.build('person', { age: 30 }, function(err, person) {
            (person instanceof Person).should.be.true;
            person.should.not.have.property('saveCalled');
            person.name.should.eql('Person 1');
            person.age.should.eql(30);
            (person.job instanceof Job).should.be.true;
            person.job.title.should.eql('Engineer');
            person.job.company.should.eql('Bazqux Co.');
            person.job.saveCalled.should.be.true;
            person.title.should.eql('Engineer');
            done();
          });
        });
      });

      context('factory containing a multi association', function() {
        it('is able to handle that', function(done){
          factory.build('company', function(err, company) {
            (company instanceof Company).should.be.true;
            company.should.not.have.property('saveCalled');
            company.name.should.eql('Fruit Company');
            company.should.have.property('employees');
            (company.employees instanceof Array).should.be.true;
            company.employees.length.should.eql(3);
            (company.employees[0] instanceof Person).should.be.true;
            company.employees[0].name.should.eql('Person 2');
            (company.employees[1] instanceof Person).should.be.true;
            company.employees[1].name.should.eql('Person 3');
            (company.employees[2] instanceof Person).should.be.true;
            company.employees[2].name.should.eql('Person 4');
            (company.managers instanceof Array).should.be.true;
            company.managers.length.should.eql(2);
            (company.managers[0] instanceof Person).should.be.false;
            company.managers[0].should.eql('Person 5');
            (company.managers[1] instanceof Person).should.be.false;
            company.managers[1].should.eql('Person 6');
            done();
          });
        });
      });

      context('factory containing a sequence', function() {
        it('is able to handle that', function(done) {
          factory.build('post', function(err, post) {
            (post instanceof Post).should.be.true;
            post.num.should.eql(1);
            post.email.should.equal('email1@test.com');
            post.name.should.equal('Post1');
            done();
          })
        });
      });
    });
  });

  describe('#create', function() {
    it('builds and saves the object', function(done) {
      factory.create('job', function(err, job) {
        (job instanceof Job).should.be.true;
        job.title.should.eql('Engineer');
        job.company.should.eql('Foobar Inc.');
        job.saveCalled.should.be.true;
        done();
      });
    });

    context('yields errors', function() {

      before(function() {
        var Faulty = function() {};
        Faulty.prototype.save = function(callback) {
          callback(new Error('Save failed'));
        };
        factory.define('faulty', Faulty, {});
      });
      afterEach(function() {
        factory.setAdapter(null, 'faulty');
      });

      it('from the adapter', function(done) {
        var FaultyAdapter = function() {};
        FaultyAdapter.prototype = new factory.Adapter();
        FaultyAdapter.prototype.save = function(doc, Model, cb) {
          cb(new Error('Save failed'));
        };
        factory.setAdapter(new FaultyAdapter(), 'faulty');
        factory.create('faulty', function(err, faulty) {
          (err instanceof Error).should.be.true;
          err.message.should.eql('Save failed');
          done();
        });
      });

      it('from the model', function(done) {
        factory.create('faulty', function(err, faulty) {
          (err instanceof Error).should.be.true;
          err.message.should.eql('Save failed');
          done();
        });
      });
    });

    context('passing attributes as second argument', function() {
      it('sets them', function(done) {
        factory.create('job', { title: "Artist", company: "Bazqux Co." }, function(err, job) {
          (job instanceof Job).should.be.true;
          job.title.should.eql('Artist');
          job.company.should.eql('Bazqux Co.');
          job.saveCalled.should.be.true;
          done();
        });
      });
    });

    context('defined with an afterCreate handler', function() {
      var spy;

      beforeEach(function() {
        spy = sinon.spy();
        factory.define('job with after create', Job, {
          title: 'Engineer',
          company: 'Foobar Inc.'
        }, {
          afterCreate: function(doc, options, done) {
            spy.apply(null, arguments);
            doc.title = 'Astronaut';
            done(null, doc);
          }
        });
      });

      it('calls afterCreate', function() {
        factory.create('job with after create', function(err, job) {
          spy.called.should.be.true;
        });
      });

      it('allows afterCreate to mutate the model', function() {
        factory.create('job with after create', function(err, job) {
          job.title.should.eql('Astronaut');
        });
      });

      it('calls afterCreate with createMany', function() {
        var num = 10;
        factory.createMany('job with after create', num, function(err) {
          spy.callCount.should.equal(num);
        });
      });

    });

  });

  describe('#buildMany', function() {
    it('builds a given set of objects', function (done) {
      var attrsArray = [{title: 'Scientist'}, {}];
      factory.buildMany('job', attrsArray, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(2);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        job.title.should.eql('Scientist');
        job.should.not.have.property('saveCalled');
        jobs[1].title.should.eql('Engineer');
        done();
      });
    });
    it('builds more than the given set of objects', function (done) {
      var attrsArray = [{title: 'Scientist'}, {}];
      factory.buildMany('job', attrsArray, 10, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(10);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        job.title.should.eql('Scientist');
        jobs[9].title.should.eql('Engineer');
        done();
      });
    });
    it('builds a number of objects', function (done) {
      factory.buildMany('job', 10, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(10);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        jobs[9].title.should.eql('Engineer');
        done();
      });
    });
    it('builds a number of objects with the same attrs', function (done) {
      factory.buildMany('job', {title: 'Scientist'}, 10, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(10);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        job.title.should.eql('Scientist');
        jobs[9].title.should.eql('Scientist');
        done();
      });
    });
    it('operates correctly with sequences', function(done) {
      factory.buildMany('post', 3, function(err, posts) {
        (posts[2].num - posts[1].num).should.eql(1);
        (posts[1].num - posts[0].num).should.eql(1);
        done();
      });
    });
  });

  describe('#createMany', function() {
    it('creates a given set of objects', function (done) {
      var attrsArray = [{title: 'Scientist'}, {}];
      factory.createMany('job', attrsArray, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(2);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        job.title.should.eql('Scientist');
        job.saveCalled.should.be.true;
        jobs[1].title.should.eql('Engineer');
        jobs[1].saveCalled.should.be.true;
        done();
      });
    });
    it('creates more than the given set of objects', function (done) {
      var attrsArray = [{title: 'Scientist'}];
      factory.createMany('job', attrsArray, 10, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(10);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        job.saveCalled.should.be.true;
        job.title.should.eql('Scientist');
        jobs[9].title.should.eql('Engineer');
        done();
      });
    });
    it('creates a number of objects', function (done) {
      factory.createMany('job', 10, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(10);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        job.saveCalled.should.be.true;
        job.title.should.eql('Engineer');
        jobs[9].title.should.eql('Engineer');
        done();
      });
    });

    it("allows the creation of many objects", function(done) {
      factory.createMany('job', 1000, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(1000);
        done();
      });
    });
  });

  describe('#cleanup', function() {
    it('removes created models', function(done) {
      factory.create('person', function(err, person) {
        factory.create('job', function(err, job) {
          factory.cleanup(function(err) {
            person.destroyCalled.should.be.true;
            person.job.destroyCalled.should.be.true;
            job.destroyCalled.should.be.true;
            done(err);
          });
        });
      });
    });
  });

  describe('Factory class', function() {
    it('can be used to create new Factories', function() {
      var another = new factory.Factory();
      another.should.not.eql(factory);
      another.define('anotherModel', Job, {
        title: 'Scientist',
        company: 'Foobar Inc.'
      });
      another.build('anotherModel', function(err, job) {
        job.title.should.eql('Scientist');
      });
      factory.build('anotherModel', function(err) {
        should.exist(err);
      });
    });
  });

  describe('ObjectAdapter', function() {
    it('can be used to return raw objects', function() {
      var another = new factory.Factory();
      another.setAdapter(new factory.ObjectAdapter(), 'anotherModel');
      another.define('anotherModel', Job, {
        title: 'Scientist',
        company: 'Foobar Inc.'
      });
      another.build('anotherModel', function(err, job) {
        job.constructor.should.eql(Object);
      });
    });
  });

  describe('#buildSync', function() {
    var Post;
    beforeEach(function() {
      Post = function() {};
      Post.prototype = new Model();
      factory.define('post', Post, {
        heading: 'The Importance of Being Ernest',
        title: function() {
          return this.heading;
        }
      });
    });

    it('builds, but does not save the object', function() {
      var post = factory.buildSync('post');
      (post instanceof Post).should.be.true;
      post.heading.should.eql('The Importance of Being Ernest');
      post.should.not.have.property('saveCalled');
    });

    context('passing attributes as second argument', function() {
      it('sets them', function() {
        var post = factory.buildSync('post', { title: "Bazqux Co." });
        (post instanceof Post).should.be.true;
        post.heading.should.eql('The Importance of Being Ernest');
        post.title.should.eql('Bazqux Co.');
        post.should.not.have.property('saveCalled');
      });
    });

    it('allows synchronous function properties', function() {
      var post = factory.buildSync('post');
      (post instanceof Post).should.be.true;
      post.title.should.eql('The Importance of Being Ernest');
    });

    it('throws if the factory has async properties', function() {
      (function() {
        factory.buildSync('person');
      }).should.throw();
    });

  });

  describe('#withOptions', function() {
    it('chains to expose the builder functions', function() {
      var builder = factory.withOptions({ key: 'value' });

      builder.should.have.property('build');
      builder.should.have.property('buildSync');
      builder.should.have.property('buildMany');
      builder.should.have.property('create');
      builder.should.have.property('createMany');

      var job = builder.buildSync('job', { title: 'Mechanic' });
      (job instanceof Job).should.be.true;
      job.company.should.eql('Foobar Inc.');
      job.title.should.eql('Mechanic');
    });

    it('passes options through to defined afterCreate handler', function() {
      factory.define('job with after create', Job, {
        title: 'Engineer',
        company: 'Foobar Inc.'
      }, {
        afterCreate: function(doc, options, done) {
          options.key.should.eql('value');
          done(null, doc);
        }
      });

      var builder = factory.withOptions({ key: 'value' });
      builder.create('job with after create', function() {});
    });

    it('allows for chaining to merge options', function() {
      factory.define('job with after create', Job, {
        title: 'Engineer',
        company: 'Foobar Inc.'
      }, {
        afterCreate: function(doc, options, done) {
          options.key.should.eql('value 2');
          options.anotherKey.should.eql('value');
          done(null, doc);
        }
      });

      var builder = factory.withOptions({ key: 'value 2', anotherKey: 'value' });
      builder.create('job with after create', function() {});
    });
  });

  describe('#promisify', function() {
    var promisifiedFactory;

    before(function() {
      var Promise = require('bluebird');
      promisifiedFactory = factory.promisify(Promise);
    });

    it('promisifies #build', function(done) {
      promisifiedFactory.build('job').then(function(job) {
        (job instanceof Job).should.be.true;
        job.title.should.eql('Engineer');
        job.company.should.eql('Foobar Inc.');
        done();
      });
    });

    it('works with chained builders too', function(done) {
      promisifiedFactory.withOptions({}).build('job').then(function(job) {
        (job instanceof Job).should.be.true;
        job.title.should.eql('Engineer');
        job.company.should.eql('Foobar Inc.');
        done();
      });
    });
  });

  describe('extend option', function() {
    it('inherits properties of parent, and also has its own', function(done){
      factory.build('interestingPerson', function(err, somePerson){
        (somePerson instanceof Person).should.be.true;
        somePerson.age.should.eql(25);
        expect(somePerson.interests).to.contain('running', 'chess');
        done();
      });
    });
    it('uses the same sequence as its parent', function(done){
      factory.build('person', function(err, parent) {
        factory.build('interestingPerson', function(err, child) {
          factory.build('person', function(err, secondParent ) {
          expect(parent.name).to.equal('Person 1');
          expect(child.name).to.equal('Person 2');
          expect(secondParent.name).to.equal('Person 3');
          done();
          })
        });
      })
    });
  });

});
