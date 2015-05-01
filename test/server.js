var koa = require('koa');
var hawk = require('../index.js');

var app = koa();

app.use(hawk());
app.use(function* (next){
	if (this.hawk.authorized === true) this.response.body = "Welcome!";

});

app.listen(3000);
