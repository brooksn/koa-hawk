var test = require('tape');
var Hawk = require('hawk');
var coTape = require('co-tape');
var server = require('./server.js');
var request = require('request-promise').defaults({resolveWithFullResponse: true, simple: false});
var url = 'http://localhost:3000';
var credentials = {
    id: 'dh37fgj492je',
    key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
    algorithm: 'sha256'
};

test('validate request', coTape(function*(a){
  a.plan(4);
  yield server.start(3000);
  var unauthorized = yield request(url);
  a.equal(unauthorized.statusCode, 401);
  
  var header = Hawk.client.header(url, 'GET', { credentials: credentials, ext: 'some-app-data' });
  var opts = { uri: url, method: 'GET', headers: {} };
  opts.headers.Authorization = header.field;
  
  var authorized = yield request(opts);
  var validresponse = Hawk.client.authenticate(authorized, credentials, header.artifacts, { payload: authorized.body });
  a.equal(authorized.statusCode, 200);
  a.ok(validresponse, 'server response is authenticated');
  
  credentials.key += 'x';
  var badheader = Hawk.client.header(url, 'GET', { credentials: credentials, ext: 'some-app-data' });
  var badopts = { uri: url, method: 'GET', headers: {} };
  badopts.headers.Authorization = badheader.field;
  var misauthorized = yield request(badopts);
  a.equal(misauthorized.statusCode, 500);
  yield server.stop();
}));
