const Promise = require('bluebird');
const store = require('../index.js');
const axios = require('axios');

describe('redis sessions store', () => {
	if (process.env.TEST_REDIS) {
	    it('tests redis driver', (done) => {
		    let express = require('./commons/express-app.js');
		    let bind = require('./commons/express-bind.js');
		    let opts = {
			    database: process.env.REDIS_DB || 0,
			    driver: 'redis',
			    host: '127.0.0.1',
			    port: process.env.REDIS_PORT || 6379
			};
		    if (process.env.REDIS_PASS !== undefined) { opts.password = process.env.REDIS_PASS; }
		    let storage = store(opts, express.session);
		    express.app.use(express.session({
			    cookie: { secure: process.env.NODE_ENV === 'production' },
			    store: storage, secret: 'secr3t',
			    resave: false, saveUninitialized: false,
			    cookie: { maxAge: 86400 }
			}));
		    let cookie = false;
		    console.log('ready');
		    bind(express.app, 8080)
			.then((ret) => {
				httpHandler = ret;
				return axios.get('http://localhost:8080/');
			    })
			.then((data) => {
				if (data.data !== 'unauthenticated') {
				    console.log(data.data || 'data empty');
				    throw new Error(`unexpected payload querying service with no session yet`);
				}
				return axios.post('http://localhost:8080/login', { userId: 'totopouet' }, { maxRedirects: 0 })
				    .then((e) => done(e || 'unexpected error'))
				    .catch((resp) => {
					    if (resp.response === undefined || resp.response.headers === undefined || resp.response.headers['set-cookie'] === undefined) {
						console.log(resp.response || 'response empty');
						throw new Error(`login did not return with session cookie`);
					    }
					    cookie = { headers: { 'Cookie': resp.response.headers['set-cookie'], withCredentials: true } };
					    console.log('get cookie ' + cookie.headers['Cookie']);
					    return axios.get('http://localhost:8080/', cookie);
					})
				    .then((resp) => {
					    if (resp.data !== 'totopouet') {
						console.log(resp.data);
						throw new Error(`unexpected payload querying service having logged in`);
					    }
					    return axios.post('http://localhost:8080/logout', cookie, { maxRedirects: 0 })
						.then((e) => done(e || 'unexpected error'))
						.catch((conf) => {
							httpHandler.close();
							if (conf.response === undefined || conf.response.headers === undefined) {
							    done(`headers missing serving logout`);
							} else if (conf.response.headers['set-cookie'] !== undefined) {
							    done(`session still shows after logout`);
							} else { done(); }
						    });
					})
				    .catch((e) => done(e || `undefined error confirming login succeeded`));
			    })
			.catch((e) => done(e || `undefined error fetching app index`));
		});
	}
    });
