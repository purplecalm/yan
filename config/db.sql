create database if not exists `aquatic`;
use `aquatic`;

create table if not exists `category` (
	`id` int not null auto_increment primary key,
	`name` varchar(100) not null unique,
	`level` int default 1,
	`parent` int,
	`single` int default 0,
	`disabled` int default 0,
	`image` varchar(100)
) default charset=utf8;

create table if not exists `article` (
	`id` int not null auto_increment primary key,
	`title` tinytext,
	`content` text,
	`summary` text,
	`category` int,
	`image` varchar(100),
	`createdAt` TIMESTAMP default CURRENT_TIMESTAMP,
	`updatedAt` TIMESTAMP default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	foreign key(`category`) references category(`id`) on update cascade
) default charset=utf8;

create table if not exists `manager` (
	`id` int not null auto_increment primary key,
	`username` varchar(30) not null unique,
	`password` varchar(60) not null
) default charset=utf8;