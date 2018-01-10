# Express.js Sessions Store Abstraction Library

 * Last tests against master on CircleCI: [![CircleCI](https://circleci.com/gh/faust64/somesession.svg?style=svg)](https://circleci.com/gh/faust64/somesession)

 * Install with: `npm install somesession`

 * Beware `somesession` would only pull all its depdencies if installed with its `devDependencies`.

Considering production deployments, you would have to pick from these `devDependencies`, those you would actually rely on.
Include them from whatever parent project or other piece of code you'ld be loading `somesession` from.

 * Write backend-agnostic code:

```
// cassandra
const storeOptions = { driver: 'cassandra', database: 'sessions', username: 'casuser', password: 'caspass', host: '3.4.5.6', table: 'sessions' };
// mysql
const storeOptions = ({ driver: 'mysql', database: 'sessions', username: 'myuser', password: 'mypass', host: '2.3.4.5', table: 'sessions' };
// postgres
const storeOptions = ({ driver: 'postgres', database: 'sessions', username: 'pguser', password: 'pgpass', host: '1.2.3.4', table: 'sessions' };
// redis
const storeOptions = ({ driver: 'redis', database: 0, password: 'redisauthpass', host: '4.5.6.7' };
// defaults to sqlite
const storeOptions = ({ database: 'sessions.sqlite', path: './', table: 'sessions' };

const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const session = require('express-session');
const store = require('somesession');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = store(storeOptions, session);
app.use(session({
	cookie: { secure: process.env.NODE_ENV === 'production' },
	store: storage, secret: 'secr3t',
	resave: false, saveUninitialized: false,
	cookie: { maxAge: 86400 }
    });

const httpServer = http.createServer(app);

app.get('/', (req, res) => {
	if (req.session !== undefined && req.session.userid !== undefined && req.session.userid !== false) {
	    res.send(req.session.userid);
	} else { res.send('unauthenticated'); }
    });

app.post('/login', (req, res) => {
	let userId = req.body.userId || false;
	if (userId !== false) { req.session.userid = userId; }
	res.redirect('/');
    });

app.post('/logout', (req, res) => {
	if (req.session !== undefined && req.session.userid !== undefined && req.session.userid !== false) {
	    req.session.userid = false;
	    req.session.destroy();
	    delete req.session;
	}
	res.redirect('/');
    });

port = port || 8080;
httpServer.listen(port, '127.0.0.1', (err, res) => {
	if (err) { reject(err); }
	console.log(`mock server listening on 127.0.0.1:${port}`);
	resolve(httpServer);
    });
```
