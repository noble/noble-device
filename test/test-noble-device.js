var should = require('should');
var NobleDevice = require('../index');

describe('noble-device', function() {

  this.timeout(20000); // Need plenty of time before timeout

  var TestDevice = function (peripheral) {
    NobleDevice.call(this, peripheral);
  };

  NobleDevice.Util.inherits(TestDevice, NobleDevice);

  it('should not add a peripheral disconnect listener before connect', function (done) {
    TestDevice.discover(function (testDevice) {
      (testDevice._peripheral.listenerCount('disconnect')).should.be.exactly(0);
      done();
    });
  });

  it('should set a peripheral disconnect listener after connect', function (done) {
    TestDevice.discover(function (testDevice) {
      testDevice.connectAndSetup(function(error) {
        (!!error).should.be.false;  // device used in test must accept connection
        (testDevice._peripheral.listenerCount('disconnect')).should.be.exactly(1);
        testDevice.disconnect();
        done();
      });
    });
  });

  it('should not add a peripheral disconnect listener if connect fails', function (done) {
    TestDevice.discover(function (testDevice) {
      testDevice.connectAndSetup(function(error) {
        (!!error).should.be.false;  // device used in test must accept connection
        testDevice.connectAndSetup(function(error) {
          (!!error).should.be.true;   // Already connected. Must return error.
          (testDevice._peripheral.listenerCount('disconnect')).should.be.exactly(1);
          testDevice.disconnect();
          done();
        });
      });
    });
  });

  it('should emit disconnect event on disconnection', function (done) {
    TestDevice.discover(function (testDevice) {
      testDevice.connectAndSetup(function(error) {
        (!!error).should.be.false;  // device used in test must accept connection
        testDevice.once('disconnect', function() {
          done();
        });
        testDevice.disconnect();
      });
    });
  });

  it('should not throw an error if no callback is passed to connect', function(done) {
    TestDevice.discover(function (testDevice) {
      testDevice.connect();
      // We do the following since we can't pass in a callback.
      var intervalId = setInterval(wait, 500);
      function wait() {
        console.log(testDevice._peripheral.advertisement.localName + ' is ' + testDevice._peripheral.state );
        if (testDevice._peripheral.state === "connected") {
          clearInterval(intervalId);
          done();
        }
      }
    });
  });
});
