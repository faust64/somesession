'use strict';

const Promise = require('bluebird');

module.exports = (app, port) => {
	return new Promise((resolve, reject) => {
		const http = require('http');
		const httpServer = http.createServer(app);

		app.get('/', (req, res) => {
			if (req.session !== undefined && req.session.userid !== undefined && req.session.userid !== false) {
			    res.send(req.session.userid);
			} else { res.send('unauthenticated'); }
		    });

		app.post('/login', (req, res) => {
			let userId = req.body.userId || false;
			if (userId !== false) {
			    req.session.userid = userId;
			}
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
	    });
    };
