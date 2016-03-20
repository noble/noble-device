var BATTERY_UUID                    = '180f';
var BATTERY_LEVEL_UUID              = '2a19';

function BatteryService() {
}

BatteryService.prototype.readBatteryLevel = function(callback) {
  this.readUInt8Characteristic(BATTERY_UUID, BATTERY_LEVEL_UUID, callback);
};

BatteryService.prototype.onBatteryLevelChange = function (data) {
  this.emit('batteryLevelChange', data.readUInt8(0));
};

BatteryService.prototype.notifyBatteryLevel = function (callback) {
  this.onBatteryLevelChangeBinded       = this.onBatteryLevelChange.bind(this);
  this.notifyCharacteristic(BATTERY_UUID, BATTERY_LEVEL_UUID, true, this.onBatteryLevelChangeBinded, callback);
};

BatteryService.prototype.unnotifyBatteryLevel = function (callback) {
  this.notifyCharacteristic(BATTERY_UUID, BATTERY_LEVEL_UUID, false, this.onBatteryLevelChangeBinded, callback);
};

module.exports = BatteryService;
