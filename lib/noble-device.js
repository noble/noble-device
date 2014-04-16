var events = require('events');
var util = require('util');

var noble = require('noble');

var GENERIC_ACCESS_UUID                     = '1800';
var DEVICE_NAME_UUID                        = '2a00';

function NobleDevice(peripheral) {
  this._peripheral = peripheral;
  this._services = {};
  this._characteristics = {};

  this.uuid = peripheral.uuid;

  this._peripheral.on('disconnect', this.onDisconnect.bind(this));
}

util.inherits(NobleDevice, events.EventEmitter);

NobleDevice.BatteryService = require('./battery-service');

NobleDevice.setup = function(type) {
  util.inherits(type, NobleDevice);

  type.SCAN_UUIDS = type.SCAN_UUIDS || [];
  type.SCAN_DUPLICATES = type.SCAN_DUPLICATES || false;

  type.is = type.is || function(peripheral) {
    return true;
  };

  type.discover = function(callback) {
    var startScanningOnPowerOn = function() {
      if (noble.state === 'poweredOn') {
        var onDiscover = function(peripheral) {
          if (type.is(peripheral)) {
            noble.removeListener('discover', onDiscover);
            noble.stopScanning();

            var device = new type(peripheral);
            callback(device);
          }
        };

        noble.on('discover', onDiscover);

        noble.startScanning(type.SCAN_UUIDS, type.SCAN_DUPLICATES);
      } else {
        noble.once('stateChange', startScanningOnPowerOn);
      }
    };

    startScanningOnPowerOn();
  };
}

NobleDevice.prototype.onDisconnect = function() {
  this.emit('disconnect');
};

NobleDevice.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid
  });
};

NobleDevice.prototype.connect = function(callback) {
  this._peripheral.connect(callback);
};

NobleDevice.prototype.disconnect = function(callback) {
  this._peripheral.disconnect(callback);
};

NobleDevice.prototype.discoverServicesAndCharacteristics = function(callback) {
  this._peripheral.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
    if (error === null) {
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
    }

    callback();
  }.bind(this));
};

NobleDevice.prototype.readDataCharacteristic = function(serviceUuid, characteristicUuid, callback) {
  this._characteristics[serviceUuid][characteristicUuid].read(function(error, data) {
    callback(data);
  });
};

NobleDevice.prototype.writeDataCharacteristic = function(serviceUuid, characteristicUuid, data, callback) {
  this._characteristics[serviceUuid][characteristicUuid].write(data, function(error) {
    callback();
  });
};

NobleDevice.prototype.readStringCharacteristic = function(serviceUuid, characteristicUuid, callback) {
  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(data) {
    callback(data.toString());
  });
};

NobleDevice.prototype.readUInt8Characteristic = function(serviceUuid, characteristicUuid, callback) {
  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(data) {
    callback(data.readUInt8(0));
  });
};

NobleDevice.prototype.writeStringCharacteristic = function(serviceUuid, characteristicUuid, string, callback) {
  this.writeDataCharacteristic(serviceUuid, characteristicUuid, new Buffer(string), callback);
};

NobleDevice.prototype.readDeviceName = function(callback) {
  this.readStringCharacteristic(GENERIC_ACCESS_UUID, DEVICE_NAME_UUID, callback);
};

module.exports = NobleDevice;
