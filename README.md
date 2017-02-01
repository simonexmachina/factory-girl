# factory-girl

[![Build Status](https://travis-ci.org/aexmachina/factory-girl.png)](https://travis-ci.org/aexmachina/factory-girl)

`factory-girl` is a factory library for [Node.js](http://nodejs.org/) and the browser that is inspired by [Factory\_girl](http://github.com/thoughtbot/factory_girl). It works asynchronously and supports associations and the use of functions for generating attributes.

## Installation

Node.js:

```bash
npm install factory-girl
```

To use `factory-girl` in the browser or other JavaScript environments, just include `index.js` and access `window.Factory`.

## Usage

```javascript
var factory = require('factory-girl');
var User    = require('../models/user');

factory.define('user', User, {
  username: 'Bob',
  score: 50,
});

factory.build('user', function(err, user) {
  console.log(user.attributes);
  // => {username: 'Bob', score: 50}
});
```

## Defining Factories

```javascript
var factory = require('factory-girl');
var User    = require('../models/user');

factory.define('user', User, {
  email: factory.sequence(function(n) {
    return 'user' + n + '@demo.com';
  }),
  // async functions can be used by accepting a callback as an argument
  async: function(callback) {
    somethingAsync(callback);
  },
  // you can refer to other attributes using `this`
  username: function() {
    return this.email;
  }
});
factory.build('user', function(err, user) {
  console.log(user.attributes);
  // => {state: 'active', email: 'user1@demo.com', async: 'foo', username: 'user1@demo.com'}
});
```

### Initializer function
You can provide a function instead of an object to initialize models.
You can pass the `buildOptions` object to the `factory.attrs`, `factory.build`, `factory.create` and the same object will be passed on to the initializer function.

```javascript
var factory = require('factory-girl');
var User    = require('../models/user');

factory.define('user', User, function (buildOptions) {
  var attrs = {
    email: factory.sequence(function(n) {
      return 'user' + n + '@demo.com';
    }),
    // async functions can be used by accepting a callback as an argument
    async: function(callback) {
      somethingAsync(callback);
    },
    // you can refer to other attributes using `this`
    username: function() {
      return this.email;
    },
    confirmed: false,
    confirmedAt: null
  };
  
  if (buildOptions.confirmedUser) {
    attrs.confirmed = true;
    attrs.confirmedAt = new Date();
  }

  return attrs;
});
factory.build('user', function(err, user) {
  console.log(user.attributes);
  // => {state: 'active', email: 'user1@demo.com', async: 'foo', username: 'user1@demo.com'}
});
```

### Options

Options can be provided when you define a model:

```javascript
factory.define('user', User, { foo: 'bar' }, options);
```

Alternatively you can create a new factory that specifies options for all of its models:

```javascript
var builder = factory.withOptions(options);
```

Currently the supported options are:

#### `afterBuild: function(instance, attrs, callback)`

Provides a function that is called after the model is built.

#### `afterCreate: function(instance, attrs, callback)`

Provides a function that is called after a new model instance is saved.

```javascript
factory.define('user', User, {
  foo: 'bar'
}, {
  afterCreate: function(instance, attrs, callback) {
    generateBazBasedOnID(instance.id, function(error, generatedBaz) {
      if(error) {
        callback(error, null);
      } else {
        instance.baz = generatedBaz;
        callback(null, instance);
      }
    });
  }
});
```

Other builder options can be accessed, inside hooks, using `this.options`.

## Defining Associations

```javascript
factory.define('post', Post, {
  // create associations using factory.assoc(model, key) or factory.assoc('user') to return the user object itself.
  user_id: factory.assoc('user', 'id', { kind: 'author' }),
  // create array of associations using factory.assocMany(model, key, num)
  comments: factory.assocMany('comment', 'text', 2)
});
factory.create('post', function(err, post) {
  console.log(post.attributes);
  // => { id: 1, user_id: 1, comments: [{ text: 'hello' }, { text: 'hello' }] }
});
```

Be aware that `assoc()` will always create associated records, even when `factory.build()` is called.
You can use `assocBuild()`, which will always build associated records.

## Defining Sequences

```javascript
factory.define('post', Post, {
  // Creates a new sequence that returns the next number in the sequence for
  // each created instance, starting with 1.
  num: factory.sequence(),
  // factory.sequence can be abbreviated as factory.seq
  email: factory.seq(function(n) {
    return 'email' + n + '@test.com';
  }),
  // Can also be async
  asyncProp: factory.seq(function(n, callback) {
    somethingAsync(n, callback);
  })
});
```

## Using Factories

### Factory#attrs

Generates and returns attrs.

```javascript
factory.attrs('post', function(err, postAttrs) {
  // postAttrs is a post attributes
  console.log(postAttrs);
  // => {title: 'Hello', authorEmail: 'user1@demo.com'}
});

factory.attrs('post', {title: 'Foo', content: 'Bar'}, function(err, postAttrs) {
  // build post attrs and override title and content
});
```

In case you have defined your factory with an [initializer function](#initializer-function), you can pass on `buildOptions` to be passed to the initializer function.

```javascript
factory.attrs('user', {}, { confirmedUser: true }, function (err, userAttrs) {
  // userAttrs is a user attributes
  console.log(userAttrs);
}
```
Note that in case you want to pass buildOptions, you have to pass attributes parameter as well. Otherwise, the buildOptions will be treated as attribute parameters.

### Factory#build

Creates a new (unsaved) instance.

```javascript
factory.build('post', function(err, post) {
  // post is a Post instance that is not saved
});
factory.build('post', {title: 'Foo', content: 'Bar'}, function(err, post) {
  // build a post and override title and content
});
```

In case you have defined your factory with an [initializer function](#initializer-function), you can pass on `buildOptions` to be passed to the initializer function.

```javascript
factory.build('user', {}, { confirmedUser: true }, function (err, userAttrs) {
  // userAttrs is a user attributes
  console.log(userAttrs);
}
```
Note that in case you want to pass buildOptions, you have to pass attributes parameter as well. Otherwise, the buildOptions will be treated as attribute parameters.

### Factory#create

Builds and saves a new instance.

```
factory.create('post', function(err, post) {
  // post is a saved Post instance
});
```

In case you have defined your factory with an [initializer function](#initializer-function), you can pass on `buildOptions` to be passed to the initializer function.

```javascript
factory.create('user', {}, { confirmedUser: true }, function (err, userAttrs) {
  // userAttrs is a user attributes
  console.log(userAttrs);
}
```
Note that in case you want to pass buildOptions, you have to pass attributes parameter as well. Otherwise, the buildOptions will be treated as attribute parameters.


### Factory#assoc(model, key = null, attrs = null, buildOptions = null)

Defines an attribute of a model that creates an associated instance of another model.

Use the `key` argument to return an attribute of the associated instance.

You can optionally provide attributes to the associated factory by passing an object as third
argument.

Be aware that `assoc()` will always _create_ associated records, even when `factory.build()` is
called. You can use `assocBuild()`, which will always build associated records.

### Factory#assocBuild(model, key = null, attrs = null, buildOptions = null)

Same as `#assoc`, but builds the associated models rather than creating them.

### Factory#assocMany(model, key, num, attrs = null, buildOptions = null)

Creates multiple entries.

### Factory#assocBuildMany

Same as `#assocMany`, but builds the associated models rather than creating them.

### Factory#buildMany

Allow you to create a number of models at once.

```javascript
factory.buildMany('post', 10, function(err, posts) {
  // build 10 posts
});

factory.buildMany('post', 10, [{withImage: true}, {veryLong: true}], function(err, posts) {
  // build 10 posts, using build options for first two
});

factory.buildMany('post', 10, {withImage: true}, function(err, posts) {
  // build 10 posts, using same build options for all of them
});

factory.buildMany('post', [{title: 'Foo'}, {title: 'Bar'}], function(err, posts) {
  // build 2 posts using the specified attributes
});

factory.buildMany('post', [{title: 'Foo'}, {title: 'Bar'}], [{withImage: true}], function(err, posts) {
  // build 2 posts using the specified attributes
  // build first post using the build option
});

factory.buildMany('post', [{title: 'Foo'}, {title: 'Bar'}], {withImage: true}, function(err, posts) {
  // build first 2 posts using the specified attributes using same build options for all of them
});


factory.buildMany('post', [{title: 'Foo'}, {title: 'Bar'}], 10, function(err, posts) {
  // build 10 posts using the specified attributes for the first and second
});

factory.buildMany('post', [{title: 'Foo'}, {title: 'Bar'}], 10, [{withImage: true}, {veryLong: true}], function(err, posts) {
  // build 10 posts using the specified attributes and build options for the first and second
});

factory.buildMany('post', [{title: 'Foo'}, {title: 'Bar'}], 10, {withImage: true}, function(err, posts) {
  // build 10 posts using the specified attributes for the first and second
  // uses same build options for all of them
});


factory.buildMany('post', {title: 'Foo'}, 10, function(err, posts) {
  // build 10 posts using the specified attributes for all of them
});

factory.buildMany('post', {title: 'Foo'}, 10, [{withImage: true}, {veryLong: true}], function(err, posts) {
  // build 10 posts using the specified attributes for all of them but using build options only for first two
});

factory.buildMany('post', {title: 'Foo'}, 10, {withImage: true}, function(err, posts) {
  // build 10 posts using the specified attributes and build options for all of them
});

```

### Factory#createMany

`factory.createMany` takes the same arguments as `buildMany`, but returns saved models.

### Factory#buildSync

When you have factories that don't use async property functions, you can use `buildSync()`.
Be aware that `assoc()` is an async function, so it can't be used with `buildSync()`.

```javascript
var doc = factory.buildSync('post', {title: 'Foo'});

// or with buildOptions
var doc = factory.buildSync('post', { title: 'Foo' }, { veryLong: true });
```

### Factory#cleanup

Destroys all of the created models. This is done using the adapter's `destroy` method.

## Adapters

Adapters provide [support for different databases and ORMs](https://www.npmjs.org/browse/keyword/factory-girl).
Adapters can be registered for specific models, or as the 'default adapter', which is used for any models for which an adapter has not been specified.
See the adapter docs for usage, but typical usage is:

```javascript
// use the bookshelf adapter as the default adapter
require('factory-girl-bookshelf')();
```

### `ObjectAdapter`

You can use the included ObjectAdapter to work without model classes. This adapter simply returns
the provided attribute objects.

```
factory.setAdapter(new factory.ObjectAdapter());
```

### Using Different Adapters Per-model

```
// use an ObjectAdapter for the `post` model only
factory.setAdapter(new factory.ObjectAdapter(), 'post');
```

## Creating new Factories

You can create multiple factories which have different settings:

```javascript
var anotherFactory = new factory.Factory();
var BookshelfAdapter = require('factory-girl-bookshelf').BookshelfAdapter;
anotherFactory.setAdapter(new BookshelfAdapter()); // use the Bookshelf adapter
```

## Like Promises?

Me too! Bluebird and q are both supported:

```javascript
var bluebird = require('bluebird');
var factory = require('factory-girl').promisify(bluebird);
```

## History

It started out as a fork of [factory-lady](https://github.com/petejkim/factory-lady), but the fork deviated quite a bit. This module uses an adapter to talk to your models so it can support different ORMs such as [Bookshelf](https://github.com/aexmachina/factory-girl-bookshelf),  [Sequelize](https://github.com/aexmachina/factory-girl-sequelize), [JugglingDB](https://github.com/rehanift/factory-girl-jugglingdb), and [Mongoose](https://github.com/jesseclark/factory-girl-mongoose) (and doesn't use `throw` for errors that might occur during save).

## License

Copyright (c) 2014 Simon Wade. This software is licensed under the [MIT License](http://github.com/petejkim/factory-lady/raw/master/LICENSE).
Copyright (c) 2011 Peter Jihoon Kim. This software is licensed under the [MIT License](http://github.com/petejkim/factory-lady/raw/master/LICENSE).
