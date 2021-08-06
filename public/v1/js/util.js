/* eslint-env browser */
window.promisify = callbackFunc => {
  if (typeof callbackFunc !== 'function') throw new TypeError();
  return (...args) => new Promise((resolve, reject) => {
    const callback = (e, ...values) => {
      if (e) {
        reject(e);
        return;
      }
      resolve(...values);
    };
    callbackFunc(...args, callback);
  });
};
