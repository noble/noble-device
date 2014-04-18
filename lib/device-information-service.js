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

DeviceInformationService.prototype.readDeviceInformationStringCharacteristic = function(uuid, callback) {
	this.readStringCharacteristic(DEVICE_INFORMATION_UUID, uuid, callback);
};

DeviceInformationService.prototype.readModelNumber = function(callback) {
  this.readDeviceInformationStringCharacteristic(MODEL_NUMBER_UUID, callback);
};

DeviceInformationService.prototype.readSerialNumber = function(callback) {
  this.readDeviceInformationStringCharacteristic(SERIAL_NUMBER_UUID, callback);
};

DeviceInformationService.prototype.readFirmwareRevision = function(callback) {
  this.readDeviceInformationStringCharacteristic(FIRMWARE_REVISION_UUID, callback);
};

DeviceInformationService.prototype.readHardwareRevision = function(callback) {
  this.readDeviceInformationStringCharacteristic(HARDWARE_REVISION_UUID, callback);
};

DeviceInformationService.prototype.readSoftwareRevision = function(callback) {
  this.readDeviceInformationStringCharacteristic(SOFTWARE_REVISION_UUID, callback);
};

DeviceInformationService.prototype.readManufacturerName = function(callback) {
  this.readDeviceInformationStringCharacteristic(MANUFACTURER_NAME_UUID, callback);
};

module.exports = DeviceInformationService;
