noble-device
============

A Node.js lib to abstract BLE (Bluetooth Low Energy) peripherals, using [noble](https://github.com/sandeepmistry/noble)

## Install
```
npm install noble-device
```

## Usage

Take a look at the [Tethercell](https://github.com/sandeepmistry/node-tethercell/) and [unofficial LightBlue Bean](https://github.com/jacobrosenthal/ble-bean) devices for examples, but this is how you make a basic device:

```javascript
var NobleDevice = require('noble-device');

var YOUR_THING_SERVICE_UUID = 'xxxxxxxxxxxxxxxxxxxxxxxx';
var YOUR_THING_NOTIFY_CHAR  = 'xxxxxxxxxxxxxxxxxxxxxxxx';
var YOUR_THING_READ_CHAR    = 'xxxxxxxxxxxxxxxxxxxxxxxx';
var YOUR_THING_WRITE_CHAR   = 'xxxxxxxxxxxxxxxxxxxxxxxx';

// then create your thing with the object pattern
var YourThing = function(peripheral) {
  // call nobles super constructor
  NobleDevice.call(this, peripheral);

  // setup or do anything else your module needs here
};

// tell Noble about the service uuid(s) your peripheral advertises (optional)
YourThing.SCAN_UUIDS = [YOUR_THING_SERVICE_UUID];

// and/or specify method to check peripheral (optional)
YourThing.is = function(peripheral) {
  return (peripheral.advertisement.localName === 'My Thing\'s Name');
};

// inherit noble device
NobleDevice.Util.inherits(YourThing, NobleDevice);

// you can mixin other existing service classes here too,
// noble device provides battery and device information,
// add the ones your device provides
NobleDevice.Util.mixin(YourThing, NobleDevice.BatteryService);
NobleDevice.Util.mixin(YourThing, NobleDevice.DeviceInformationService);

// export your device
module.exports = YourThing;
```

Now to use YourThing:

```javascript
var YourThing = require('YourThing');

YourThing.discover(function(yourThing) {

  // you can be notified of disconnects
  yourThing.on('disconnect', function() {
    console.log('we got disconnected! :( ');
  });

  // you'll need to call connect and set up
  yourThing.connectAndSetUp(function(error) {
    console.log('were connected!');
  });

});
```

It doesn't do much yet, let's go back and add to our Device definition (right before ``module.exports``)

```javascript
// you could send some data
YourThing.prototype.send = function(data, done) {
  this.writeDataCharacteristic(YOUR_THING_SERVICE_UUID, YOUR_THING_WRITE_CHAR, data, done);
};

// read some data
YourThing.prototype.receive = function(callback) {
  this.readDataCharacteristic(YOUR_THING_SERVICE_UUID, YOUR_THING_READ_CHAR, callback);
};
```


Now in our connect and setup we can:

```javascript
    yourThing.send(new Buffer([0x00, 0x01]), function() {
      console.log('data sent');
    });

    yourThing.receive(function(error, data) {
      console.log('got data: ' + data);
    });
```

Optionally, if you need to do some device setup or close something down before disconnect, you can override those functions:

```javascript
YourThing.prototype.connectAndSetup = function(callback) {
  NobleDevice.prototype.connectAndSetup.call(this, function(error) {
    // maybe notify on a characteristic ?
    this.notifyCharacteristic(YOUR_THING_SERVICE_UUID, YOUR_THING_NOTIFY_CHAR, true, this._onRead.bind(this), function(err) {
      callback(err);
    });
  }.bind(this);
};

YourThing.prototype.onDisconnect = function() {
  // clean up ...

  // call super's onDisconnect
  NobleDevice.prototype.onDisconnect.call(this);
};
```


### Discovery API

__Discover All__

``` javascript
function onDiscover(yourThing) {
  // called for all devices discovered
}

YourThing.discoverAll(onDiscover);
```

__Stopping a Discover All__

```javascript

YourThing.stopDiscoverAll(onDiscover);
```

__Discover a single device__

``` javascript
YourThing.discover(function(yourThing) {
  // called for only one device discovered
});
```

__Stopping a Discover__

```javascript

YourThing.stopDiscover(onDiscoverCallback);
```

__Discover with Filter__

``` javascript
YourThing.discoverWithFilter(function(device), {
  // filter callback for device,
  //   return true to stop discovering and choose device
  //   return false to continue discovery

  return true; // or false
}, function(yourThing) {
  // called for only one device discovered that matches filter
});
```

__Discover by ID__

``` javascript
var id = " ... "; // id of device we want to discover

YourThing.discoverById(id, function(yourThing) {
  // called for only one device discovered
});
```

