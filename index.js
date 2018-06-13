'use strict';

const logger = require('wraplog')('sessions-store');

class sessionStore {
    constructor (opts, session) {
	try {
	    opts = opts || { driver: 'sqlite' };
	    let sessionStore = false;
	    let storeOptions = false;
	    if (opts.remoteArray === undefined) {
		if (opts.host !== undefined) { opts.remoteArray = [ opts.host ]; }
		else { opts.remoteArray = [ '127.0.0.1' ]; }
	    }
	    if (opts.driver === undefined || opts.driver === 'sqlite') {
		sessionStore = require('connect-sqlite3')(session);
		storeOptions = {
			db: opts.database || 'test.sqlite',
			dir: opts.path || './',
			table: opts.table || 'sessions'
		    };
	    } else if (opts.driver === 'cassandra') {
		sessionStore = require('cassandra-session-store');
		storeOptions = {
			clientOptions: {
				contactPoints: opts.remoteArray,
				keyspace: opts.database || 'sessions',
				queryOptions: { prepare: true }
			    },
			table: opts.table || 'sessions'
		    };
	    } else if (opts.driver === 'memcached') {
		sessionStore = require('connect-memcached')(session);
		storeOptions = {
			hosts: opts.remoteArray || [ '127.0.0.1' ],
			prefix: opts.prefix || 'sessions:',
			ttl: opts.expiration || 86400
		    };
		if (opts.secret !== undefined) { storeOptions.secret = opts.secret; }
	    } else if (opts.driver === 'mongodb') {
		sessionStore = require('connect-mongodb-session')(session);
		opts.host = opts.host || '127.0.0.1';
		opts.port = opts.port || 27000;
		opts.database = opts.database || 'sessions';
		storeOptions = {
			collection: opts.table || 'sessions',
			expires: opts.expiration || 86400,
			ttl: opts.expiration || 86400,
			uri: `mongodb://${opts.host}:${opts.port}/${opts.database}`
		   };
	    } else if (opts.driver === 'mysql') {
		sessionStore = require('express-mysql-session')(session);
		storeOptions = {
			connectionLimit: opts.connectionLimit || 5,
			createDatabaseTable: opts.createTable || true,
			database: opts.database || 'sessions',
			expiration: opts.expiration || 86400,
			host: opts.host || 'localhost',
			port: opts.port || 3306,
			schema: { tableName: opts.table || 'sessions' }
		};
		if (opts.username !== undefined) { storeOptions.user = opts.username; }
		if (opts.password !== undefined) { storeOptions.password = opts.password; }
	    } else if (opts.driver === 'postgres') {
		sessionStore = require('connect-pg-simple')(session);
		opts.host = opts.host || '127.0.0.1';
		opts.port = opts.port || 5432;
		opts.database = opts.database || 'sessions';
		if (opts.authstr === undefined) {
		    if (opts.password !== undefined && opts.username !== undefined) {
			opts.authstr = `${opts.username}:${opts.password}@`;
		    } else if (opts.username !== undefined) {
			opts.authstr = `${opts.username}:@`;
		    } else { opts.authstr = ''; }
		}
		storeOptions = {
			conString: `postgresql://${opts.authstr}${opts.host}:${opts.port}/${opts.database}`,
			tableName: opts.table || 'sessions', //!!singular
			ttl: opts.expiration || 86400,
		    };
	    } else if (opts.driver === 'redis') {
		sessionStore = require('connect-redis')(session);
		storeOptions = {
			db: opts.database || 0,
			host: opts.host || '127.0.0.1',
			port: opts.port || 6379,
			prefix: opts.prefix || 'sessions:',
			ttl: opts.expiration || 86400,
			logErrors: logger.error
		    };
		if (opts.password !== undefined) { storeOptions.auth_pass = opts.password; }
	    } else if (opts.driver === 'aerospike') {
		sessionStore = require('aerospike-session-store')(session);
		opts.host = opts.remoteArray.join(',');
		storeOptions = {
			namespace: opts.database || 'sessions',
			set: opts.table || 'sessions',
			ttl: opts.expiration || 86400,
			hosts: opts.host || '127.0.0.1:3000'
		    };
	    } else { throw new Error('unhandled opts', opts); }
	    this._sessionStore = new sessionStore(storeOptions);
	    this._sessionStore.on('error', (e) => {
		    logger.error('caught:', JSON.stringify(e || 'undefined error'));
		});
	    logger.info(`${opts.driver} connector instantiated`);
	} catch(e) {
	    logger.error('failed initializing session store with:');
	    logger.error(e || 'undefined error');
	    process.exit(1);
	}
    }

    get sessionStoreInstance() {
	return this._sessionStore;
    }
}

module.exports = (opts, session) => new sessionStore(opts, session).sessionStoreInstance;
