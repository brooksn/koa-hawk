var thunkify = require('thunkify-wrap');
var Hawk = require('hawk');
var promises = {};

var getCredentials = function (id, callback) {
  var credentials = {
    key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
    algorithm: 'sha256',
    user: 'Steve'
  };
  return callback(null, credentials);
};

var serverAuthenticate = function(req, credentialsFunc, options){
  return new Promise(function(resolve, reject){
    Hawk.server.authenticate(req, credentialsFunc, options, function (err, creds, attrs) {
      if(err) reject(err);
      else resolve({ credentials: creds, artifacts: attrs });
    });
  });
};

var uriAuthenticate = function(req, credentialsFunc, options){
  return new Promise(function(resolve, reject){
    Hawk.uri.authenticate(req, credentialsFunc, options, function(err, creds, attrs){
      if (err) reject(err);
      else resolve({credentials: creds, artifacts: attrs});
    });
  });
}; 

module.exports = function(credentialsFunc){
  if (credentialsFunc) getCredentials = credentialsFunc;
  promises.getCredentials = thunkify(getCredentials);
  return hawkAuth;
};

var hawkAuth = function *(next){
  'use strict';
  this.hawk = {};
  var auth;
  if (!this.request.get('authorization') && !this.query.bewit) {
    this.hawk.authorized = false;
  } else if (this.request.get('authorization')) {
    try{
      auth = yield serverAuthenticate(this.req, getCredentials, {});
      this.hawk.authtype = 'header';
      this.hawk.authorized = true;
    }
    catch(e){
      this.hawk.authorized = false;
      throw e;
    }
  } else if (this.query.bewit) {
    try{
      auth = yield uriAuthenticate(this.req, getCredentials, {});
      this.hawk.authtype = 'uri';
      this.hawk.authorized = true;
    }
    catch(e){
      this.hawk.authorized = false;
      throw e;
    }
  }
  if (auth && this.hawk.authorized === true) {
    this.hawk.credentials = auth.credentials;
    this.hawk.user = auth.credentials.user;
    this.hawk.algorithm = auth.credentials.algorithm || 'sha256';
    this.hawk.key = auth.credentials.key;
    this.hawk.id = auth.artifacts.id;
    this.hawk.artifacts = auth.artifacts;
  }
  yield next;
  if (!this.hawk.id) return;
  if (!this.hawk.key) {
    var credentials = yield promises.getCredentials(this.hawk.id);
    this.hawk.key = credentials.key;
  }
  var header;
  if (this.hawk.authtype === 'header')
  header = Hawk.server.header(this.hawk.credentials, this.hawk.artifacts, { payload: this.response.body, contentType: this.response.type });
  if (header) this.response.set('Server-Authorization', header);
  return;
};
