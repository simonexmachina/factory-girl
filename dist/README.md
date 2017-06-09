# factory-girl

[![Build Status](https://travis-ci.org/aexmachina/factory-girl.png)](https://travis-ci.org/aexmachina/factory-girl)

`factory-girl` is a factory library for [Node.js](http://nodejs.org/) and the browser that is inspired by [Factory\_girl](http://github.com/thoughtbot/factory_girl). It works asynchronously and supports associations and the use of functions for generating attributes.

## Installation

Node.js:

```bash
npm install factory-girl
```

To use `factory-girl` in the browser or other JavaScript environments, there are
builds for numerous module systems in the `dist/` directory.

## Usage

Refer to [the tutorial](docs/tutorial.md) for a gentle introduction of building a simple
user factory.

Here's the crash course:

```javascript
const factory = require('factory-girl').factory;
const User    = require('../models/user');

factory.define('user', User, {
  username: 'Bob',
  score: 50,
});

factory.build('user').then(user => {
  console.log(user); // => User {username: 'Bob', score: 50}
});
```

## Defining Factories

Define factories using the `factory.define()` method.

For example:

```javascript
// Using objects as initializer
factory.define('product', Product, {
  // use sequences to generate values sequentially
  id: factory.sequence('Product.id', (n) => `product_${n}`),
  // use functions to compute some complex value
  launchDate: () => new Date(),
  // return a promise to populate data asynchronously
  asyncData: () => fetch('some/resource'),
});
factory.define('user', User, {
  // seq is an alias for sequence
  email: factory.seq('User.email', (n) => `user${n}@ymail.com`),

  // use the chance(http://chancejs.com/) library to generate real-life like data
  about: factory.chance('sentence'),

  // use assoc to associate with other models
  profileImage: factory.assoc('profile_image', '_id'),

  // or assocMany to associate multiple models
  addresses: factory.assocMany('address', 2, '_id'),

  // use assocAttrs to embed models that are not persisted
  creditCardNumber: factory.assocAttrs('credit_card', 'number', {type: 'masterCard'}),

  // use assocAttrs or assocAttrsMany to embed plain json objects
  twitterDetails: factory.assocAttrs('twitter_details'),
});
```

```javascript
// Using functions as initializer
factory.define('account', Account, buildOptions => {
  let attrs = {
    confirmed: false,
    confirmedAt: null
  };

  // use build options to modify the returned object
  if (buildOptions.confirmedUser) {
    attrs.confirmed = true;
    attrs.confirmedAt = new Date();
  }
  return attrs;
});

// buildOptions can be passed while requesting an object
factory.build('account', {}, {confirmed: true});
```

### Options

Options can be provided when you define a factory:

```javascript
factory.define('user', User, { foo: 'bar' }, options);
```

Alternatively you can set options for the factory that will get applied for all model-factories:

```javascript
factory.withOptions(options);
```

Currently the supported options are:

#### `afterBuild: function(model, attrs, buildOptions)`

Provides a function that is called after the model is built.
The function should return the instance or a Promise for the instance.

#### `afterCreate: function(model, attrs, buildOptions)`

Provides a function that is called after a new model instance is saved. The function
should return the instance or throw an error. For asynchronous functions, it should return
a promise that resolves with the instance or rejects with the error.

```javascript
factory.define('user', User, {foo: 'bar'}, {
  afterBuild: (model, attrs, buildOptions) => {
    return doSomethingAsync(model).then(() => {
      doWhateverElse(model);
      return model;
    });
  },
  afterCreate: (model, attrs, buildOptions) => {
    modify(model);
    if ('something' === 'wrong') {
      throw new Error;
    }
    maybeLog('something');
    return model;
  }
});
```

## Using Factories

### Factory#attrs

Generates and returns model attributes as an object hash instead of the model instance.
This may be useful where you need a JSON representation of the model e.g. mocking an API
response.

```javascript
factory.attrs('post').then(postAttrs => {
  // postAttrs is a json representation of the Post model
});

factory.attrs('post', {title: 'Foo', content: 'Bar'}).then(postAttrs => {
  // builds post json object and overrides title and content
});

factory.attrs('post', {title: 'Foo'}, {hasComments: true}).then(postAttrs => {
  // builds post json object
  // overrides title
  // invokes the initializer function with buildOptions of {hasComments: true}
});
```

You can use `Factory#attrsMany` to generate a set of model attributes

```javascript
factory.attrsMany('post', 5, [{title: 'foo1'}, {title: 'foo2'}]).then(postAttrsArray => {
  // postAttrsArray is an array of 5 post json objects
  debug(postAttrsArray);
});
```

### Factory#build

Builds a new model instance that is not persisted.

```javascript
factory.build('post').then(post => {
  // post is a Post instance that is not persisted
});
```

The `buildMany` version builds an array of model instances.

```javascript
factory.buildMany('post', 5).then(postsArray => {
  // postsArray is an array of 5 Post instances
});
```

Similar to `Factory#attrs`, you can pass attributes to override or buildOptions.

### Factory#create(name, attrs, buildOptions)

Builds a new model instance that is persisted.

```js
factory.create('post').then(post => {
  // post is a saved Post instance
});
```

The createMany version creates an array of model instances.

```javascript
factory.createMany('post', 5).then(postsArray => {
  // postsArray is an array of 5 Post saved instances
});
```

Similar to `Factory#attrs` and `Factory#build`, you can pass `attrs` to override and
`buildOptions`.

### Factory#cleanUp

Destroys all of the created models. This is done using the adapter's `destroy` method.
It might be useful to clear all created models before each test or testSuite.

## Adapters

Adapters provide support for different databases and ORMs. Adapters can be registered for
specific models, or as the 'default adapter', which is used for any models for which an
adapter has not been specified. See the adapter docs for usage, but typical usage is:

```javascript
const factory = require('factory-girl').factory;
const adapter = new factoryGirl.MongooseAdapter();

// use the mongoose adapter as the default adapter
factory.setAdapter(adapter);

// Or use it only for one model-factory
factory.setAdapter(adapter, 'factory-name');
```

### ObjectAdapter

`ObjectAdapter` is a simple adapter that uses `const model = new MyModel()`,
`model.save()` and `model.destroy()`.

```js
factory.setAdapter(new factory.ObjectAdapter());
class MyModel {
  save() {
    // save the model
  },
  destroy() {
    // destroy the model
  }
}
factory.define('model', MyModel);
```

## Creating new Factories

You can create multiple factories which have different settings:

```javascript
let anotherFactory = new factory.FactoryGirl();
anotherFactory.setAdapter(new MongooseAdapter()); // use the Mongoose adapter
```

## History

This module started out as a fork of
[factory-lady](https://github.com/petejkim/factory-lady), but the fork deviated quite a
bit. This module uses an adapter to talk to your models so it can support different ORMs
such as [Bookshelf](https://github.com/aexmachina/factory-girl-bookshelf),
[Sequelize](https://github.com/aexmachina/factory-girl-sequelize),
[JugglingDB](https://github.com/rehanift/factory-girl-jugglingdb), and
[Mongoose](https://github.com/jesseclark/factory-girl-mongoose) (and doesn't use `throw`
for errors that might occur during save).

Version 4.0 is a complete rewrite with thanks to @chetanism.

## License

Copyright (c) 2016 Chetan Verma.  
Copyright (c) 2014 Simon Wade.
Copyright (c) 2011 Peter Jihoon Kim.  

This software is licensed under the [MIT
License](http://github.com/aexmachina/factory-girl/raw/master/LICENSE.txt).
