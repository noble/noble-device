var DEVICE_INFORMATION_UUID         = '180a';
var SYSTEM_ID_UUID                  = '2a23';
var MODEL_NUMBER_UUID               = '2a24';
var SERIAL_NUMBER_UUID              = '2a25';
var FIRMWARE_REVISION_UUID          = '2a26';
var HARDWARE_REVISION_UUID          = '2a27';
var SOFTWARE_REVISION_UUID          = '2a28';
var MANUFACTURER_NAME_UUID          = '2a29';

function DeviceInformationService() {
}

DeviceInformationService.prototype.readSystemId = function(callback) {
  this.readDataCharacteristic(DEVICE_INFORMATION_UUID, SYSTEM_ID_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    var systemId = data.toString('hex').match(/.{1,2}/g).reverse().join(':');

    callback(null, systemId);
  });
};

DeviceInformationService.prototype.readModelNumber = function(callback) {
  this.readStringCharacteristic(DEVICE_INFORMATION_UUID, MODEL_NUMBER_UUID, callback);
};

DeviceInformationService.prototype.readSerialNumber = function(callback) {
  this.readStringCharacteristic(DEVICE_INFORMATION_UUID, SERIAL_NUMBER_UUID, callback);
};

DeviceInformationService.prototype.readFirmwareRevision = function(callback) {
  this.readStringCharacteristic(DEVICE_INFORMATION_UUID, FIRMWARE_REVISION_UUID, callback);
};

DeviceInformationService.prototype.readHardwareRevision = function(callback) {
  this.readStringCharacteristic(DEVICE_INFORMATION_UUID, HARDWARE_REVISION_UUID, callback);
};

DeviceInformationService.prototype.readSoftwareRevision = function(callback) {
  this.readStringCharacteristic(DEVICE_INFORMATION_UUID, SOFTWARE_REVISION_UUID, callback);
};

DeviceInformationService.prototype.readManufacturerName = function(callback) {
  this.readStringCharacteristic(DEVICE_INFORMATION_UUID, MANUFACTURER_NAME_UUID, callback);
};

module.exports = DeviceInformationService;
