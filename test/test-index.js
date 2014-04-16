var should = require('should');

describe('index', function(){
  it('should export module setup', function(){
    var index = require('../index');
    (index.setup).should.be.ok;
  });
});
