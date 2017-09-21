'use strict';

var mkdirp = require('mkdirp');
var copy = require('copy-to');
var path = require('path');
var fs = require('fs');
var os = require('os');

var version = require('../package.json').version;

var root = path.dirname(__dirname);
var imgDir = path.join(process.env.HOME || root, '/static/images');

var config = {
	title: '宿鸭湖股份',
	
	version: version,
	imgDir: imgDir,

	numCPUs: os.cpus().length,

	managePort: 8092,
	webPort: 8090,
	
	database: {
		db: 'aquatic',
		username: 'aquatic',
		password: 'yanyan.1987',

		// the sql dialect of the database
		// - currently supported: 'mysql', 'postgres', 'mariadb'
		dialect: 'mysql',

		// custom host; default: 127.0.0.1
		host: '127.0.0.1',

		// custom port; default: 3306
		port: 3306,

		// use pooling in order to reduce db connection overload and to increase speed
		pool: {
		  maxConnections: 10,
		  minConnections: 0,
		  maxIdleTime: 30000
		}
	},
	
	logoURL: '/images/logo.png',
	
	sessionSecret: 'Be the best of yourself',
	
	//just for debug
	debug: process.env.NODE_ENV === 'development',
	
	enableCompress: true,
	
	pageCount: 20
};

mkdirp.sync(config.imgDir);
module.exports = config;

config.loadConfig = function (customConfig) {
  if (!customConfig) {
    return;
  }
  copy(customConfig).override(config);
};
