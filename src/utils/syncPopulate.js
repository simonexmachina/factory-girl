/* eslint-disable no-underscore-dangle */
export default function syncPopulate(target, source) {
  if (typeof target !== 'object') {
    throw new Error('Invalid target passed');
  }
  if (typeof source !== 'object') {
    throw new Error('Invalid source passed');
  }

  return Object.keys(source).map(attr => {
    let promise;
    if (Array.isArray(source[attr])) {
      target[attr] = [];
      return syncPopulate(target[attr], source[attr]);
    } else if (source[attr] === null) {
      target[attr] = null;
    } else if (isPlainObject(source[attr])) {
      target[attr] = target[attr] || {};
      return syncPopulate(target[attr], source[attr]);
    } else if (typeof source[attr] === 'function') {
      target[attr] = source[attr]();
    } else {
      target[attr] = source[attr];
    }
    return promise;
  });
}
/* eslint-enable no-underscore-dangle */

const objectProto = Object.getPrototypeOf({});
function isPlainObject(o) {
  return Object.getPrototypeOf(o) === objectProto;
}
