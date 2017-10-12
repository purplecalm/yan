'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
var middlewares = require('koa-middlewares');
var config = require('../config');

var staticDir = path.join(path.dirname(__dirname), 'static');

module.exports = middlewares.staticCache(staticDir, {
	dynamic: true,
	buffer: config.debug ? false : true,
	maxAge: config.debug ? 0 : 60 * 60 * 24 * 7,
	alias: {
		'/favicon.ico': '/favicon.png'
	},
	gzip: config.enableCompress
});
