
var async = require('async');
var NobleDevice = require('../index');

var idOrName = process.argv[2];

if (!idOrName) {
  console.log("node hrm-device.js [ID or localname]")
  process.exit(1);
}

var HRMDevice = function(device) {
  NobleDevice.call(this, device);
  NobleDevice.HeartRateMeasumentService.call(this);
};

HRMDevice.is = function(device) {
  var localName = device.advertisement.localName;
  return (device.id === idOrName || localName === idOrName);
};

NobleDevice.Util.inherits(HRMDevice, NobleDevice);
NobleDevice.Util.mixin(HRMDevice, NobleDevice.DeviceInformationService);
NobleDevice.Util.mixin(HRMDevice, NobleDevice.HeartRateMeasumentService);

HRMDevice.discover(function(device) {
  console.log('discovered: ' + device);

  device.on('disconnect', function() {
    console.log('disconnected!');
    process.exit(0);
  });

  device.on('measumentChange', function(data) {
    console.log("update measument: " + data);
  });

  device.connectAndSetUp(function(callback) {
    console.log('connectAndSetUp');
    device.notifyMeasument(function(counter) {
      console.log('notifyMeasument');
    });
  });
});

