'use strict';

/**
 * Module dependencies.
 */

/*
create table if not exists `category` (
	`id` int not null auto_increment primary key,
	`name` varchar(100) not null unique,
	`level` int default 1,
	`parent` int,
	`single` int default 0,
	`disabled` int default 0,
	`image` varchar(100)
) default charset=utf8;
*/

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Category', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: true
		},
		level: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1
		},
		parent: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		single: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 0
		},
		disabled: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 0
		},
		image: {
			type: DataTypes.STRING(100),
			allowNull: true
		}
	}, {
		tableName: 'category',
		timestamps: false
	});
};
