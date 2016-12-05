function Util() {
}

Util.inherits = function inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, enumerable: false, writable: true, configurable: true }
  });
  if (superClass) Object.setPrototypeOf(subClass, superClass);
};

Util.mixin = function(constructor, mixin, includedMethods, excludedMethods) {
  excludedMethods = excludedMethods || [];

  for (var i in mixin.prototype) {
    var include = (!includedMethods) || (includedMethods.indexOf(i) !== -1);
    var exclude = (excludedMethods.indexOf(i) !== -1);

    if (include && !exclude) {
      constructor.prototype[i] = mixin.prototype[i];
    }
  }
};

module.exports = Util;
