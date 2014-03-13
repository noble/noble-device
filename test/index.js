var should = require('should');

describe('index', function(){
  it('should export module', function(){
    var index = require('../index');

    Object.keys(index).length.should.be.above(0);
  });
});
