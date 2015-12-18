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
var Post    = require('../models/post');

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

#### `afterCreate: function(instance, options, callback)`

Provides a function that is called after a new model instance is saved.

## Defining Associations

```javascript
factory.define('post', Post, {
  // create associations using factory.assoc(model, key) or factory.assoc('user') to return the user object itself.
  user_id: factory.assoc('user', 'id'),
  // create array of associations using factory.assocMany(model, key, num)
  comments: factory.assocMany('comment', 'text', 2)
});
factory.build('post', function(err, post) {
  console.log(post.attributes);
  // => { user_id: 1, comments: [{ text: 'hello' }, { text: 'hello' }] }
});
```

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

### Factory#create

Builds and saves a new instance.

```
factory.create('post', function(err, post) {
  // post is a saved Post instance
});
```

### Factory#assoc

You can optionally provide attributes to the associated factory by passing an object as third argument.

### Factory#buildMany

Allow you to create a number of models at once.

```javascript
factory.buildMany('post', 10, function(err, posts) {
  // build 10 posts
});
factory.buildMany('post', [{title: 'Foo'}, {title: 'Bar'}], function(err, posts) {
  // build 2 posts using the specified attributes
});
factory.buildMany('post', [{title: 'Foo'}, {title: 'Bar'}], 10, function(err, posts) {
  // build 10 posts using the specified attributes for the first and second
});
factory.buildMany('post', {title: 'Foo'}, 10, function(err, posts) {
  // build 10 posts using the specified attributes for all of them
});
```

### Factory#createMany

`factory.createMany` takes the same arguments as `buildMany`, but returns saved models.

### Factory#buildSync

When you have factories that don't use async property functions, you can use `buildSync()`.
Be aware that `assoc()` is an async function, so it can't be used with `buildSync()`.

```javascript
var doc = factory.buildSync('post', {title: 'Foo'});
```

## Adapters

Adapters provide [support for different databases and ORMs](https://www.npmjs.org/browse/keyword/factory-girl).
Adapters can be registered for specific models, or as the 'default adapter', which is used for any models for which an adapter has not been specified.
See the adapter docs for usage, but typical usage is:

```javascript
// use the bookshelf adapter as the default adapter
require('factory-girl-bookshelf')();
// use the ObjectAdapter (that simply returns raw objects) for the `post` model
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
