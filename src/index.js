import FactoryGirl from './FactoryGirl';
import SyncFactoryGirl from './SyncFactoryGirl';

export ObjectAdapter from './adapters/ObjectAdapter';
export BookshelfAdapter from './adapters/BookshelfAdapter';
export DefaultAdapter from './adapters/DefaultAdapter';
export MongooseAdapter from './adapters/MongooseAdapter';
export SequelizeAdapter from './adapters/SequelizeAdapter';
export ReduxORMAdapter from './adapters/ReduxORMAdapter';

const factory = new FactoryGirl();
factory.FactoryGirl = FactoryGirl;

export { factory };

const syncFactory = new SyncFactoryGirl();
syncFactory.FactoryGirl = SyncFactoryGirl;

export { syncFactory };

export default factory;
