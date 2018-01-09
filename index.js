'use strict';

const logger = require('wraplog')('sessions-store');

class sessionStore {
    constructor (driver, session) {
	try {
	    driver = driver || { name: 'sqlite' };
	    let sessionStore = storeOptions = false;
	    if (driver.name === undefined || driver.name === 'sqlite') {
		sessionStore = require('connect-sqlite3')(session);
		storeOptions = {
			db: driver.database || 'default.sqlite',
			dir: driver.path || './',
			table: driver.table || 'sessions'
		    };
	    } else if (driver.name === 'cassandra') {
		sessionStore = require('cassandra-store')(session);
		storeOptions = {
			client: null,
			clientOptions: {
				contactPoints: driver.remoteArray,
				keyspace: driver.keyspace || 'test',
				queryOptions: { prepare: true }
			    },
			table: driver.table || 'sessions'
		    };
	    } else if (driver.name === 'memcached') {
		sessionStore = require('connect-memcached')(session);
		storeOptions = {
			hosts: driver.remoteArray || [ '127.0.0.1' ],
			prefix: driver.prefix || 'sessions:',
			ttl: driver.expiration || 86400
		    };
		if (driver.secret !== undefined) { storeOptions.secret = driver.secret; }
	    } else if (driver.name === 'mongodb') {
		sessionStore = require('connect-mongodb-session')(session);
		driver.remote = driver.remote || '127.0.0.1';
		driver.port = driver.port || 27000;
		driver.database = driver.database || 'session';
		storeOptions = {
			collection: driver.table || 'sessions',
			expires: driver.expiration || 86400,
			ttl: driver.expiration || 86400,
			uri: `mongodb://${driver.remote}:${driver.port}/${driver.database}`
		   };
	    } else if (driver.name === 'mysql') {
		sessionStore = require('express-mysql-session')(session);
		storeOptions = {
			connectionLimit: driver.connectionLimit || 5,
			createDatabaseTable: driver.createTable || true,
			database: driver.database || 'sessions',
			expiration: driver.expiration || 86400,
			host: driver.remote || 'localhost',
			port: driver.port || 3306,
			schema: { tableName: driver.table || 'sessione' }
		};
		if (driver.username !== undefined) { storeOptions.user = driver.username; }
		if (driver.password !== undefined) { storeOptions.password = driver.password; }
	    } else if (driver.name === 'postgres') {
		sessionStore = require('connect-pg-simple')(session);
		driver.remote = driver.remote || '127.0.0.1';
		driver.port = driver.port || 5432;
		driver.database = driver.database || 'session';
		if (driver.authstr === undefined) {
		    if (driver.password !== undefined && driver.username !== undefined) {
			driver.authstr = `${driver.username}:${driver.password}@`;
		    } else if (driver.username !== undefined) {
			driver.authstr = `${driver.username}:@`;
		    }
		}
		storeOptions = {
			connString: `postgresql://${driver.authstr}${driver.host}:${driver.port}/${driver.database}`,
			tableName: driver.table || 'sessions',
			ttl: driver.expiration || 86400,
		    };
	    } else if (driver.name === 'redis') {
		sessionStore = require('connect-redis')(session);
		storeOptions = {
			db: driver.database || 0,
			host: driver.host || '127.0.0.1',
			port: driver.port || 6379,
			prefix: driver.prefix || 'sessions:',
			ttl: driver.expiration || 86400,
			logErrors: logger.error
		    };
		if (driver.password !== undefined) { storeOptions.auth_pass = driver.password; }
	    } else if (driver.name === 'aerospike') {
		sessionStore = require('aerospike-session-store')(session);
		if (driver.remoteArray !== undefined) {
		    driver.remote = driver.remoteArray.join(',');
		}
		storeOptions = {
			namespace: driver.database || 'sessions',
			set: driver.table || 'sessions',
			ttl: driver.expiration || 86400,
			hosts: driver.remote || '127.0.0.1:3000'
		    };
	    } else { throw new Error('unhandled driver', driver); }
	    this._sessionStore = new sessionStore(storeOptions);
	    this._sessionStore.on('error', (e) => {
		    logger.error('caught:', JSON.stringify(e || 'undefined error'));
		});
	} catch(e) {
	    logger.error('failed initializing session store with' + JSON.stringify(e || 'undefined error'));
	}
    }

    get sessionStoreInstance() {
	return new this._db;
    }
}

module.exports = (driver, session) => new sessionStore(driver, session).sessionStoreInstance;
