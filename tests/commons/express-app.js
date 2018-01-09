'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

module.exports = {
	app: app,
	session: session
    };
