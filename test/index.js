var Browser = require('zombie'),
    expect = require('chai').expect;

Browser.localhost('example.com', 8080);
 
describe('Test index page', function() {
 
  var browser = new Browser();
 
  before(function(done) {
    browser.visit('/', done);
  });
 
  describe('submits form', function() {
 
    it('should be successful', function() {
      browser.assert.success();
    });
 
    it('should see correct title', function() {
      browser.assert.text('title', 'Title | Boilerplate');
    });
  });
});