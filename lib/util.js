var util = require('util');

var noble = require('noble');

var NobleDevice = require('./noble-device');

function Util() {
}

Util.inherits = function(constructor, superConstructor, methods) {
  util.inherits(constructor, superConstructor);

  if (superConstructor === NobleDevice) {
    constructor.SCAN_UUIDS = constructor.SCAN_UUIDS || [];
    constructor.SCAN_DUPLICATES = constructor.SCAN_DUPLICATES || false;

    constructor.is = constructor.is || function(peripheral) {
      return true;
    };

    constructor.discover = function(callback) {
      var startScanningOnPowerOn = function() {
        if (noble.state === 'poweredOn') {
          var onDiscover = function(peripheral) {
            if (constructor.is(peripheral)) {
              noble.removeListener('discover', onDiscover);
              noble.stopScanning();

              var device = new constructor(peripheral);
              callback(device);
            }
          };

          noble.on('discover', onDiscover);

          noble.startScanning(constructor.SCAN_UUIDS, constructor.SCAN_DUPLICATES);
        } else {
          noble.once('stateChange', startScanningOnPowerOn);
        }
      };

      startScanningOnPowerOn();
    };
  }
};

Util.mixin = function(constructor, mixin, methods) {
  var allMethods = (methods === undefined);

  for (var i in mixin.prototype) {
    if (allMethods || methods.indexOf(i) !== -1) {
      constructor.prototype[i] = mixin.prototype[i];
    }
  }
};

module.exports = Util;
