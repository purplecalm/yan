'use strict';

/**
 * Module dependencies.
 */

/*
create table if not exists `article` (
	`id` int not null auto_increment primary key,
	`title` tinytext,
	`content` text,
	`category` int,
	foreign key(`category`) references category(`id`) on update cascade
) default charset=utf8;
*/

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Article', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		title: {
			type: DataTypes.TEXT('tiny'),
			allowNull: true
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		summary: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		image: {
			type: DataTypes.STRING(100),
			allowNull: true
		},
		category: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		date: {
			type: DataTypes.VIRTUAL,
			allowNull: true,
			get: function(){
				var d=new Date(this.getDataValue('createdAt'));
				return String(101+d.getMonth()).substr(1)+'/'+String(100+d.getDate()).substr(1);
			}
		}
	}, {
		tableName: 'article'
	});
};
