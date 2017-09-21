'use strict';

const config = require('../../config');
const homeService = require('../../services/home');
const renders=require('./renders');

module.exports = function* show(next) {
	var homeConfig=false;
	/*
	if('preview' in this.query){
		homeConfig=homeService.get().next().value;
	}else{
		homeConfig=homeService.getCache().next().value;
	}
	*/
	
	if('preview' in this.query){
		homeConfig=yield homeService.get();
	}else{
		homeConfig=yield homeService.getCache();
	}

	var layoutsMap={}, map={};
	homeConfig.layouts.forEach(function(v){
		layoutsMap[v.id]=[];
		map[v.id]=v;
	});
	
	for( var i=0; i<homeConfig.modules.length; i++){
		var v=homeConfig.modules[i];
		if(renders[v.type]&&layoutsMap[v.layout]){
			var m=yield renders[v.type](v,map[v.layout]);
			layoutsMap[v.layout].push('<div class="module-item'+(v.hideTitle?' module-notitle':'')+'" data-module="'+v.type+'">'+m+'</div>');
		}
	}
	
	return yield this.render('home', {
		title: config.title,
		config: homeConfig,
		layouts: layoutsMap,
		type: 'home'
	});
};
