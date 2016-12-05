var EventEmitter = require('events').EventEmitter;
var util = require('./util');
var noble = require('noble');

var GENERIC_ACCESS_UUID                     = '1800';
var DEVICE_NAME_UUID                        = '2a00';

function NobleDevice(peripheral) {
  this._peripheral = peripheral;
  this._services = {};
  this._characteristics = {};

  this.id = peripheral.id;
  this.uuid = peripheral.uuid; // for legacy
  this.address = peripheral.address;
  this.addressType = peripheral.addressType;
  this.connectedAndSetUp = false;
}

util.inherits(NobleDevice, EventEmitter);

NobleDevice.SCAN_UUIDS = [];
NobleDevice.SCAN_DUPLICATES = false;

NobleDevice.is = function(peripheral) {
  return true;
};

NobleDevice.emitter = new EventEmitter();

NobleDevice.onDiscover = function(peripheral) {
  if (this.is(peripheral)) {
    var device = new this(peripheral);

    this.emitter.emit('discover', device);
  }
};

NobleDevice.onStateChange = function(state) {
  if (state === 'poweredOn' && this.emitter.listeners('discover').length > 0) {
    this.startScanning();
  }
};

NobleDevice.startScanning = function() {
  noble.startScanning(this.SCAN_UUIDS, this.SCAN_DUPLICATES);
};

NobleDevice.stopScanning = function() {
  noble.stopScanning();
};

NobleDevice.discoverAll = function(callback) {
  this.emitter.addListener('discover', callback);

  if (this.emitter.listeners('discover').length === 1) {
    noble.on('discover', this.onDiscover);
    noble.on('stateChange', this.onStateChange);

    if (noble.state === 'poweredOn') {
      this.startScanning();
    }
  }
};

NobleDevice.stopDiscoverAll = function(discoverCallback) {
  this.emitter.removeListener('discover', discoverCallback);

  if (this.emitter.listeners('discover').length === 0) {
    noble.removeListener('discover', this.onDiscover);
    noble.removeListener('stateChange', this.onStateChange);

    this.stopScanning();
  }
};

NobleDevice.discover = function(callback) {
  var onDiscover = function(device) {
    this.stopDiscoverAll(onDiscover);

    callback(device);
  };

  callback._nobleDeviceOnDiscover = onDiscover;

  this.discoverAll(onDiscover);
};

NobleDevice.stopDiscover = function(callback) {
  var onDiscover = callback._nobleDeviceOnDiscover;

  if (onDiscover) {
    this.stopDiscoverAll(onDiscover);
  }
};

NobleDevice.discoverWithFilter = function(filter, callback) {
  var onDiscoverWithFilter = function(device) {
    if (filter(device)) {
      this.stopDiscoverAll(onDiscoverWithFilter);

      callback(device);
    }
  };

  this.discoverAll(onDiscoverWithFilter);
};

NobleDevice.discoverById = function(id, callback) {
  this.discoverWithFilter(function(device) {
    return (device.id === id);
  }, callback);
};

// deprecated
NobleDevice.discoverByUuid = function(uuid, callback) {
  this.discoverWithFilter(function(device) {
    return (device.uuid === uuid);
  }, callback);
};

NobleDevice.discoverByAddress = function(address, callback) {
  this.discoverWithFilter(function(device) {
    return (device.address === address);
  }, callback);
};

NobleDevice.prototype.onDisconnect = function() {
  this.connectedAndSetUp = false;
  this.emit('disconnect');
};

NobleDevice.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid
  });
};

NobleDevice.prototype.connect = function(callback) {

  this._peripheral.connect(function(error) {
    if (!error) {
      this._peripheral.once('disconnect', this.onDisconnect.bind(this));
    }
    if (typeof(callback) === 'function') {
      callback(error);
    }
  }.bind(this));

};

NobleDevice.prototype.disconnect = function(callback) {
  this._peripheral.disconnect(callback);
};

NobleDevice.prototype.discoverServicesAndCharacteristics = function(callback) {
  this._peripheral.discoverAllServicesAndCharacteristics(function(error, services/*, characteristics*/) {
    if (error) {
      return callback(error);
    }

    for (var i in services) {
      var service = services[i];
      var characteristics = service.characteristics;

      var serviceUuid = service.uuid;

      this._services[serviceUuid] = service;
      this._characteristics[serviceUuid] = {};

      for (var j in characteristics) {
        var characteristic = characteristics[j];

        this._characteristics[serviceUuid][characteristic.uuid] = characteristic;
      }
    }

    callback();
  }.bind(this));
};

NobleDevice.prototype.connectAndSetUp = NobleDevice.prototype.connectAndSetup = function(callback) {
  this.connect(function(error) {
    if (error) {
      return callback(error);
    }

    this.discoverServicesAndCharacteristics(function() {
      this.connectedAndSetUp = true;
      callback();
    }.bind(this));
  }.bind(this));
};

NobleDevice.prototype.hasService = function(serviceUuid) {
  return (!!this._characteristics[serviceUuid]);
};

NobleDevice.prototype.hasCharacteristic = function(serviceUuid, characteristicUuid) {
  return this.hasService(serviceUuid) && (!!this._characteristics[serviceUuid][characteristicUuid]);
};

NobleDevice.prototype.readDataCharacteristic = function(serviceUuid, characteristicUuid, callback) {
  if (!this.hasService(serviceUuid)) {
    return callback(new Error('service uuid ' + serviceUuid + ' not found!'));
  } else if (!this.hasCharacteristic(serviceUuid, characteristicUuid)) {
    return callback(new Error('characteristic uuid ' + characteristicUuid + ' not found in service uuid ' + serviceUuid + '!'));
  }

  this._characteristics[serviceUuid][characteristicUuid].read(callback);
};

NobleDevice.prototype.writeDataCharacteristic = function(serviceUuid, characteristicUuid, data, callback) {
  if (!this.hasService(serviceUuid)) {
    return callback(new Error('service uuid ' + serviceUuid + ' not found!'));
  } else if (!this.hasCharacteristic(serviceUuid, characteristicUuid)) {
    return callback(new Error('characteristic uuid ' + characteristicUuid + ' not found in service uuid ' + serviceUuid + '!'));
  }

  var characteristic = this._characteristics[serviceUuid][characteristicUuid];

  var withoutResponse = (characteristic.properties.indexOf('writeWithoutResponse') !== -1) &&
                          (characteristic.properties.indexOf('write') === -1);

  characteristic.write(data, withoutResponse, function(error) {
    if (typeof callback === 'function') {
      callback(error);
    }
  });
};

NobleDevice.prototype.notifyCharacteristic = function(serviceUuid, characteristicUuid, notify, listener, callback) {
  if (!this.hasService(serviceUuid)) {
    return callback(new Error('service uuid ' + serviceUuid + ' not found!'));
  } else if (!this.hasCharacteristic(serviceUuid, characteristicUuid)) {
    return callback(new Error('characteristic uuid ' + characteristicUuid + ' not found in service uuid ' + serviceUuid + '!'));
  }

  var characteristic = this._characteristics[serviceUuid][characteristicUuid];

  characteristic.notify(notify, function(error) {
    if (notify) {
      characteristic.addListener('data', listener);
    } else {
      characteristic.removeListener('data', listener);
    }

    if (typeof callback === 'function') {
      callback(error);
    }
  });
};

NobleDevice.prototype.subscribeCharacteristic = function(serviceUuid, characteristicUuid, listener, callback) {
  this.notifyCharacteristic(serviceUuid, characteristicUuid, true, listener, callback);
};

NobleDevice.prototype.unsubscribeCharacteristic = function(serviceUuid, characteristicUuid, listener, callback) {
  this.notifyCharacteristic(serviceUuid, characteristicUuid, false, listener, callback);
};

NobleDevice.prototype.readStringCharacteristic = function(serviceUuid, characteristicUuid, callback) {
  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
    if (error) {
      return callback(error);
    }

    callback(null, data.toString());
  });
};

NobleDevice.prototype.readUInt8Characteristic = function(serviceUuid, characteristicUuid, callback) {
  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
    if (error) {
      return callback(error);
    }

    callback(null, data.readUInt8(0));
  });
};

NobleDevice.prototype.readInt8Characteristic = function(serviceUuid, characteristicUuid, callback) {
  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
    if (error) {
      return callback(error);
    }

    callback(null, data.readInt8(0));
  });
};

NobleDevice.prototype.readUInt16LECharacteristic = function(serviceUuid, characteristicUuid, callback) {
  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
    if (error) {
      return callback(error);
    }

    callback(null, data.readUInt16LE(0));
  });
};

NobleDevice.prototype.readInt16LECharacteristic = function(serviceUuid, characteristicUuid, callback) {
  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
    if (error) {
      return callback(error);
    }

    callback(null, data.readInt16LE(0));
  });
};

NobleDevice.prototype.readUInt32LECharacteristic = function(serviceUuid, characteristicUuid, callback) {
  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
    if (error) {
      return callback(error);
    }

    callback(null, data.readUInt32LE(0));
  });
};

NobleDevice.prototype.readInt32LECharacteristic = function(serviceUuid, characteristicUuid, callback) {
  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
    if (error) {
      return callback(error);
    }

    callback(null, data.readInt32LE(0));
  });
};

NobleDevice.prototype.readFloatLECharacteristic = function(serviceUuid, characteristicUuid, callback) {
  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
    if (error) {
      return callback(error);
    }

    callback(null, data.readFloatLE(0));
  });
};

NobleDevice.prototype.writeStringCharacteristic = function(serviceUuid, characteristicUuid, string, callback) {
  this.writeDataCharacteristic(serviceUuid, characteristicUuid, new Buffer(string), callback);
};

NobleDevice.prototype.writeUInt8Characteristic = function(serviceUuid, characteristicUuid, value, callback) {
  var buffer = new Buffer(1);
  buffer.writeUInt8(value, 0);

  this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
};

NobleDevice.prototype.writeInt8Characteristic = function(serviceUuid, characteristicUuid, value, callback) {
  var buffer = new Buffer(1);
  buffer.writeInt8(value, 0);

  this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
};

NobleDevice.prototype.writeUInt16LECharacteristic = function(serviceUuid, characteristicUuid, value, callback) {
  var buffer = new Buffer(2);
  buffer.writeUInt16LE(value, 0);

  this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
};

NobleDevice.prototype.writeInt16LECharacteristic = function(serviceUuid, characteristicUuid, value, callback) {
  var buffer = new Buffer(2);
  buffer.writeInt16LE(value, 0);

  this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
};

NobleDevice.prototype.writeUInt32LECharacteristic = function(serviceUuid, characteristicUuid, value, callback) {
  var buffer = new Buffer(4);
  buffer.writeUInt32LE(value, 0);

  this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
};

NobleDevice.prototype.writeInt32LECharacteristic = function(serviceUuid, characteristicUuid, value, callback) {
  var buffer = new Buffer(4);
  buffer.writeInt32LE(value, 0);

  this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
};

NobleDevice.prototype.writeFloatLECharacteristic = function(serviceUuid, characteristicUuid, value, callback) {
  var buffer = new Buffer(4);
  buffer.writeFloatLE(value, 0);

  this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
};

NobleDevice.prototype.readDeviceName = function(callback) {
  this.readStringCharacteristic(GENERIC_ACCESS_UUID, DEVICE_NAME_UUID, callback);
};

module.exports = NobleDevice;
