'use strict';

var config = require('../config');

var Model=require('../model');
var Article=Model.Article;

exports.get = function* (cfg, limit, offset) {
	var searchconfig={
		where: cfg,
		order: 'id desc'
	};
	
	if(limit){
		searchconfig.limit=limit;
	}
	
	if(offset){
		searchconfig.offset=offset;
	}
	
	var rows = yield Article.findAll(searchconfig);
	
	return rows;
};

exports.create = function* (cfg){
	
	return yield Article.create(cfg);
};

exports.findAndCount = function* (cfg,page){
	if(!page){
		page=1;
	}
	
	var searchconfig={
		where: cfg,
		order: 'id desc',
		limit: config.pageCount,
		offset: (page-1)*config.pageCount
	};
	
	return yield Article.findAndCountAll(searchconfig);
};

exports.update = function* (id, cfg){
	return yield Article.update(cfg,{
		where: {
			id: parseInt(id,10)
		}
	});
}

exports.remove = function* (id){
	return yield Article.destroy({
		where: {
			id: parseInt(id,10)
		}
	});
};