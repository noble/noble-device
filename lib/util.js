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

    constructor.onStateChange = function(state) {
      if (state === 'poweredOn' && constructor.emitter.listeners('discover').length > 0) {
        constructor.startScanning();
      }
    };

    constructor.startScanning = function() {
      noble.startScanning(constructor.SCAN_UUIDS, constructor.SCAN_DUPLICATES);
    };

    constructor.stopScanning = function() {
      noble.stopScanning();
    };

    constructor.discoverAll = function(callback) {
      constructor.emitter.addListener('discover', callback);

      if (constructor.emitter.listeners('discover').length === 1) {
        noble.on('discover', constructor.onDiscover);
        noble.on('stateChange', constructor.onStateChange);

        if (noble.state === 'poweredOn') {
          constructor.startScanning();
        }
      }
    };

    constructor.stopDiscoverAll = function(discoverCallback) {
      constructor.emitter.removeListener('discover', discoverCallback);

      if (constructor.emitter.listeners('discover').length === 0) {
        noble.removeListener('discover', constructor.onDiscover);
        noble.removeListener('stateChange', constructor.onStateChange);

        constructor.stopScanning();
      }
    };

    constructor.discover = function(callback) {
      var onDiscover = function(device) {
        constructor.stopDiscoverAll(onDiscover);

        callback(device);
      };

      callback._nobleDeviceOnDiscover = onDiscover;

      constructor.discoverAll(onDiscover);
    };

    constructor.stopDiscover = function(callback) {
      var onDiscover = callback._nobleDeviceOnDiscover;

      if (onDiscover) {
        constructor.stopDiscoverAll(onDiscover);
      }
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

    constructor.discoverById = function(id, callback) {
      constructor.discoverWithFilter(function(device) {
        return (device.id === id);
      }, callback);
    };

    // deprecated
    constructor.discoverByUuid = function(uuid, callback) {
      constructor.discoverWithFilter(function(device) {
        return (device.uuid === uuid);
      }, callback);
    };

    constructor.discoverByAddress = function(address, callback) {
      constructor.discoverWithFilter(function(device) {
        return (device.address === address);
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
