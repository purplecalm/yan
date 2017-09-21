'use strict';

var path = require('path');
var config = require('../config');
var Sequelize=require('sequelize');

var database=config.database;

var sequelize = new Sequelize(database.db, database.username, database.password, database);

function load(name) {
  return sequelize.import(path.join(__dirname, name));
}

module.exports = {
	sequelize: sequelize,
	Category: load('category'),
	Article: load('article'),
	Manager: load('manager'),
	query: function* (sql, args) {
		var options = { replacements: args };
		var data = yield this.sequelize.query(sql, options);
		if (/select /i.test(sql)) {
			return data[0];
		}
		return data[1];
	},
	queryOne: function* (sql, args) {
		var rows = yield this.query(sql, args);
		return rows && rows[0];
	}
};
