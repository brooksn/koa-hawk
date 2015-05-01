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

promises.authenticate = function*(req, credentialsFunc, options){
	return new Promise(function(resolve, reject){
		Hawk.server.authenticate(req, credentialsFunc, options, function (err, credentials, artifacts) {
			if(err){
				reject(err);
			} else {
				resolve({
					credentials:credentials,
					artifacts:artifacts
				});
			}
		});
	});
};

module.exports = function(credentialsFunc){
	if (credentialsFunc) getCredentials = credentialsFunc;
	promises.getCredentials = thunkify(getCredentials);
	return hawkAuth;
};

var hawkAuth = function *(next){
	this.hawk = {};
	if (!this.request.get('authorization') && !this.request.get('Authorization')) {
		this.hawk.authorized = false;
	} else {
		try{
			var auth = yield promises.authenticate(this.req, getCredentials, {});
			this.hawk.authorized = true;
			this.hawk.credentials = auth.credentials;
			this.hawk.key = auth.credentials.key;
			this.hawk.id = auth.artifacts.id;
			this.hawk.artifacts = auth.artifacts
		}
		catch(e){
			this.hawk.authorized = false;
			throw e;
		}
	}
	yield next;
	if (!this.hawk.id) return;
	if (!this.hawk.key) {
		var credentials = yield promises.getCredentials(this.hawk.id);
		this.hawk.key = credentials.key;
	}
	var header = Hawk.server.header(this.hawk.credentials, this.hawk.artifacts, { payload: this.response.body, contentType: this.response.type });
	this.response.set('Server-Authorization', header);
	return;
};
