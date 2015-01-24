var events = require('events');
var util   = require('util');

var noble  = require('noble');

var EventEmitter = events.EventEmitter;

var NobleDevice = require('./noble-device');

function Util() {
}

Util.inherits = function(constructor, superConstructor) {
  util.inherits(constructor, superConstructor);

  if (superConstructor === NobleDevice) {
    constructor.SCAN_UUIDS = constructor.SCAN_UUIDS || [];
    constructor.SCAN_DUPLICATES = constructor.SCAN_DUPLICATES || false;

    constructor.is = constructor.is || function(peripheral) {
      return true;
    };

    constructor.emitter = new EventEmitter();

    constructor.onDiscover = function(peripheral) {
      if (constructor.is(peripheral)) {
        var device = new constructor(peripheral);

        constructor.emitter.emit('discover', device);
      }
    };

    constructor.discoverAll = function(callback) {
      constructor.emitter.addListener('discover', callback);

      if (EventEmitter.listenerCount(constructor.emitter, 'discover') == 1) {
        var startScanningOnPowerOn = function() {
          if (noble.state === 'poweredOn') {
            noble.on('discover', constructor.onDiscover);

            noble.startScanning(constructor.SCAN_UUIDS, constructor.SCAN_DUPLICATES);
          } else {
            noble.once('stateChange', startScanningOnPowerOn);
          }
        };

        startScanningOnPowerOn();
      }
    };

    constructor.stopDiscoverAll = function(discoverCallback) {
      constructor.emitter.removeListener('discover', discoverCallback);

      if (EventEmitter.listenerCount(constructor.emitter, 'discover') == 0) {
        noble.removeListener('discover', constructor.onDiscover);

        noble.stopScanning();
      }
    };

    constructor.discover = function(callback) {
      var onDiscover = function(device) {
        constructor.stopDiscoverAll(onDiscover);

        callback(device);
      };

      constructor.discoverAll(onDiscover);
    };

    constructor.discoverWithFilter = function(filter, callback) {
      var onDiscoverWithFilter = function(device) {
        if (filter(device)) {
          constructor.stopDiscoverAll(onDiscoverWithFilter);

          callback(device);
        }
      };

      constructor.discoverAll(onDiscoverWithFilter);
    };

    constructor.discoverByUuid = function(uuid, callback) {
      constructor.discoverWithFilter(function(device) {
        return (device.uuid === uuid);
      }, callback);
    };
  }
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
