'use strict';

/**
 * Module dependencies.
 */

/*
create table if not exists `manager` (
	`id` int not null auto_increment primary key,
	`username` varchar(30) not null unique,
	`password` varchar(60) not null
) default charset=utf8;
*/

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Manager', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		username: {
			type: DataTypes.STRING(30),
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING(60),
			allowNull: false
		}
	}, {
		tableName: 'manager'
	});
};
