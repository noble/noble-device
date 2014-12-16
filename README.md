noble-device
============

[![Analytics](https://ga-beacon.appspot.com/UA-56089547-1/sandeepmistry/noble-device?pixel)](https://github.com/igrigorik/ga-beacon)

A node.js lib to abstract BLE (Bluetooth Low Energy) peripherals, uses [noble](https://github.com/sandeepmistry/noble)

##Install
```
npm install noble-device
```

##Use
Take a look at the [Tethercell](https://github.com/sandeepmistry/node-tethercell/) and [unofficial LightBlue Bean](https://github.com/jacobrosenthal/ble-bean) devices for examples, but this is how you make a basic device:
```
var NobleDevice = require('noble-device');

var YOUR_THING_UUID = 'xxxxxxxxxxxxxxxxxxxxxxxx';
var YOUR_THING_NOTIFY_CHAR = 'xxxxxxxxxxxxxxxxxxxxxxxx';
var YOUR_THING_READ_CHAR = 'xxxxxxxxxxxxxxxxxxxxxxxx';
var YOUR_THING_WRITE_CHAR = 'xxxxxxxxxxxxxxxxxxxxxxxx';

//then create your thing with the object pattern
var YourThing = function(peripheral) {

	//call nobles super constructor
  NobleDevice.call(this, peripheral);
	
	//setup or do anything else your module needs here
  
};

//tell Noble about the service uuid(s) you're looking for
YourThing.SCAN_UUIDS = [YOUR_THING_UUID];

//??? match that this is indeed your device
YourThing.is = function(peripheral) {
  return (peripheral.advertisement.localName === "My Thing"); //you HAVE to specify correctly?
};

//inherit noble
NobleDevice.Util.inherits(YourThing, NobleDevice);

//and you can attach other existing service classes here too. noble provides battery and device information if your device has those
NobleDevice.Util.mixin(YourThing, NobleDevice.BatteryService);
NobleDevice.Util.mixin(YourThing, NobleDevice.DeviceInformationService);

//export your device
module.exports = YourThing;
```

Now to use Your Thing
```
var YourThing = require('YourThing');

YourThing.discover(function(yourThing){

//you can be notified of disconnects
  yourThing.on("disconnect", function(){
    console.log("we got disconnected! :(   ")
  });

//youll need to call connect and setup to get noble, and your setup code, to run
  yourThing.connectAndSetup(function(){

	console.log('were connected!');

  });

});
```

But it doesnt do much yet. Lets go back and add to our Device definition right before we module.exports

```
//you could send some data
YourThing.prototype.send = function(data,done){

  this.writeDataCharacteristic(YOUR_THING_UUID, YOUR_THING_WRITE_CHAR, data, done);

};

//read some data
YourThing.prototype.receive = function(callback) {
  this.readDataCharacteristic(YOUR_THING_UUID, YOUR_THING_READ_CHAR, callback);
};
```


Now in our connect and setup we can do
```
yourThing.send(new Buffer([]), function(){
	console.log('data sent');
});

yourThing.receive(function(data){
	console.log('got data: ' + data);
});
```

Optionally if you need to do some device setup or close something down before disconnect you could override those functions
```
YourThing.prototype.connectAndSetup = function(callback) {

  var self = this;

  NobleDevice.prototype.connectAndSetup.call(self, function(){

		//maybe notify on a characteristic?
    self.notifyCharacteristic(YOUR_THING_UUID, YOUR_THING_NOTIFY_CHAR, true, self._onRead.bind(self), function(err){
      callback(err);
    });

  });

};

YourThing.prototype._onRead = function(data){

	//you could emit this back out to your user or have them set a callback on creation and call that, well just print it
	console.log("got data: " + data);

};
```
