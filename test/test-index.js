var should = require('should');

describe('index', function(){
  it('should export module Util.inherits', function(){
    var index = require('../index');
    (index.Util.inherits).should.be.ok;
  });
});
