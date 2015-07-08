var http = require('http');
var server;
var start = function(opts){
	opts = opts || {};
	if (typeof opts === 'number') opts = {port: opts};
	var port = opts.port || process.env.PORT|| process.env.port || process.env.npm_package_config_port || 3000;
	return new Promise(function(resolve, reject){
		var koa = require('koa');
		var hawk = require('../index.js');

		var app = koa();

		app.use(hawk());
		app.use(function*(next){
			if (this.hawk.authorized === true) this.response.body = "Welcome!";
			else this.response.status = 401;
		});

		server = http.createServer(app.callback()).listen(port);
		resolve('Server started on port ' + port);
	});
};

var stop = function(){
  return new Promise(function(resolve, reject){
    server.setTimeout(0);
		server.close(function(){
			resolve('server stopped')
		});
  });
};

module.exports.start = start;
module.exports.stop = stop;
