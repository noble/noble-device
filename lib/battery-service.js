var BATTERY_UUID                    = '180f';
var BATTERY_LEVEL_UUID              = '2a19';

function BatteryService() {
}

BatteryService.prototype.readBatteryLevel = function(callback) {
  this.readUInt8Characteristic(BATTERY_UUID, BATTERY_LEVEL_UUID, callback);
};

module.exports = BatteryService;
