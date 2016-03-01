var HEART_RATE_MEASUREMENT_SERVICE_UUID = '180d';
var MEASUREMENT_UUID                    = '2a37';
var BODY_SENSOR_LOCATION_UUID           = '2a38';
var CONTROL_POINT_UUID                  = '2a39';

function HeartRateMeasumentService() {
}

HeartRateMeasumentService.prototype.readBodySensorLocation = function(callback) {
  this.readUInt8Characteristic(HEART_RATE_MEASUREMENT_SERVICE_UUID, BODY_SENSOR_LOCATION_UUID, callback);
};

HeartRateMeasumentService.prototype.writeControlPoint = function(data, callback) {
  this.writeUInt8Characteristic(HEART_RATE_MEASUREMENT_SERVICE_UUID, CONTROL_POINT_UUID, data, callback);
};

HeartRateMeasumentService.prototype.notifyMeasument = function(callback) {
  this.onMeasumentChangeBinded = this.onMeasumentChange.bind(this);
  this.notifyCharacteristic(HEART_RATE_MEASUREMENT_SERVICE_UUID, MEASUREMENT_UUID, true, this.onMeasumentChangeBinded, callback);
};

HeartRateMeasumentService.prototype.unnotifyMeasument = function(callback) {
  this.notifyCharacteristic(HEART_RATE_MEASUREMENT_SERVICE_UUID, MEASUREMENT_UUID, false, this.onMeasumentChangeBinded, callback);
};

HeartRateMeasumentService.prototype.onMeasumentChange = function(data) {
  this.convertMeasument(data, function(counter) {
    this.emit('measumentChange', counter);
  }.bind(this));
};

HeartRateMeasumentService.prototype.readMeasument = function(callback) {
  this.readDataCharacteristic(HEART_RATE_MEASUREMENT_SERVICE_UUID, MEASUREMENT_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    this.convertMeasument(data, function(counter) {
      callback(null, counter);
    });
  }.bind(this));
};

HeartRateMeasumentService.prototype.convertMeasument = function(data, callback) {
  var flags = data.readUInt8(0);

  if (flags & 0x01) {
    // uint16
    callback(data.readUInt16LE(1));
  } else {
    // uint8
    callback(data.readUInt8(1));
  }
};

module.exports = HeartRateMeasumentService;
