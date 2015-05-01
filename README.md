# koa-hawk
Koa hawk authentication middleware

## Installation

```js
$ npm install koa-hawk
```

## Usage

```js
var koa = require('koa');
var hawk = require('koa-hawk');

var app = koa();

var getCredentials = function (id, callback) {
    var credentials = {
        key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
        algorithm: 'sha256',
        user: 'Steve'
    };
    return callback(null, credentials);
};

app.use(hawk(getCredentials));
app.use(function* (next){
	if (this.hawk.authorized === true) this.response.body = "Welcome!";
});

app.listen(3000);
