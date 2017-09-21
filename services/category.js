'use strict';

var config = require('../config');

var Model=require('../model');
var Category=Model.Category;

exports.getCategoryAndSub = function* (id) {
	var rows = yield Category.findAll({
		where: {
			$or: [
				{id: id, level: 1},
				{parent: id, level: 2}
			]
		}
	});
	
	return rows;
};


exports.create = function* (cfg){
	var item={
		name: cfg.name,
		level: 1,
		single: 0
	};
	
	if(cfg.parent){
		item.parent=cfg.parent;
		item.level=2;
		item.single=!!cfg.single;
	}
	
	var duplicate=yield Category.findAll({
		where: {
			name: item.name
		}
	});
	
	if(duplicate&&duplicate.length){
		return {
			error: '已有相同的导航名称'
		};
	}
	
	return yield Category.create(item);
};

exports.getTopCategories = function* () {
	var rows = yield Category.findAll({
		where: {
			level: 1
		}
	});
	
	return rows;
};

exports.getSubCategories = function* (id) {
	return yield Category.findAll({
		where: {
			level: 2,
			parent: parseInt(id,10)
		}
	});
};

exports.remove = function* (id){
	return yield Model.query('UPDATE `category` SET `name`=concat(`name`,\'.\',`id`,\'.disabled\'), `disabled`=1 WHERE `id` = '+parseInt(id,10));
};

exports.update = function* (id, cfg){
	return yield Category.update(cfg,{
		where: {
			id: parseInt(id,10)
		}
	});
}

exports.getById = function* (id) {
	var row = yield Category.findById(Number(id));
	return row;
};

exports.getAll = function* (){
	var rows=yield Category.findAll();
	
	return rows;
};