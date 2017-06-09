import FactoryGirl from './FactoryGirl';

export ObjectAdapter from './adapters/ObjectAdapter';
export BookshelfAdapter from './adapters/BookshelfAdapter';
export DefaultAdapter from './adapters/DefaultAdapter';
export MongooseAdapter from './adapters/MongooseAdapter';
export SequelizeAdapter from './adapters/SequelizeAdapter';
export ReduxORMAdapter from './adapters/ReduxORMAdapter';
export ObjectionAdapter from './adapters/ObjectionAdapter';

const factory = new FactoryGirl();
factory.FactoryGirl = FactoryGirl;

export { factory };

export default factory;
