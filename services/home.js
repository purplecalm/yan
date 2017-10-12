'use strict';

var config = require('../config');
var fs=require('fs');

var path=require('path');
var configPath = path.join(path.dirname(__dirname), 'config','web.config');

var getConfig=function(){
	
	try{
		var file = fs.readFileSync(configPath,'utf8');
		return JSON.parse(file);
	}catch(e){
		return {
			sliders: [],
			layouts: [],
			modules: []
		};
	}
};

var homeConfig=false;

var cache=getConfig();

var sync=function(){
	fs.writeFile(configPath,JSON.stringify(homeConfig),{encoding:'utf-8'});
};

var checkConfig=function(){
	//if(!homeConfig){
		homeConfig=getConfig();
	//}
	
	if(typeof homeConfig!='object'){
		homeConfig={};
	}
	
	if(!homeConfig.layouts){
		homeConfig.layouts=[];
	}
	
	if(!homeConfig.sliders){
		homeConfig.sliders=[];
	}
	
	if(!homeConfig.modules){
		homeConfig.modules=[];
	}
	
	if(!homeConfig.sliderInterval){
		homeConfig.sliderInterval=6;
	}
};

exports.get = function* (cfg) {
	checkConfig();
	
	return homeConfig;
};

exports.updateSliders=function*(sets){
	checkConfig();
	
	homeConfig.sliders=sets;
	sync();
	
	return true;
};

exports.addModule=function*(m){
	checkConfig();
	
	var id=0;
	if(homeConfig.modules.length){
		id=homeConfig.modules[homeConfig.modules.length-1].id+1;
	}
	
	m.id=id;
	
	homeConfig.modules.push(m);
	
	sync();
	return m;
};

exports.updateModule=function*(id, m){
	checkConfig();
	
	m.id=Number(id);
	for( var i=0; i<homeConfig.modules.length; i++){
		if(homeConfig.modules[i].id===m.id){
			homeConfig.modules[i]=m;
	
			sync();
			return m;
		}
	}
	return false;
};

exports.removeModule=function*(id){
	checkConfig();
	
	for( var i=0; i<homeConfig.modules.length; i++){
		if(homeConfig.modules[i].id===Number(id)){
			homeConfig.modules.splice(i,1);
			sync();
			return true;
		}
	}
	
	return false;
	
};

exports.getCache=function* (){
	return cache;
}

exports.refreshCache=function* (){
	cache=getConfig();
	return true;
};

exports.removeCol = function* (cfg){
	checkConfig();
	
	for( var i=0; i<homeConfig.layouts.length; i++){
		if(homeConfig.layouts[i].id===Number(cfg.id)){
			homeConfig.layouts.splice(i,1);
			sync();
			return true;
		}
	}
	
	return false;

}

exports.newCol = function* (cfg){
	checkConfig();
	
	var id=0;
	if(homeConfig.layouts.length){
		id=homeConfig.layouts[homeConfig.layouts.length-1].id+1;
	}
	
	var newItem={
		id: id,
		key: String.fromCharCode(65+id),
		width: 0
	};
	
	homeConfig.layouts.push(newItem);
	
	sync();
	
	return newItem;
}

exports.setSliderInterval = function* (sec){
	checkConfig();
	homeConfig.sliderInterval=sec;
	
	sync();
	return true;
};

exports.setColWidth = function* (cfg){
	checkConfig();
	
	for( var i=0; i<homeConfig.layouts.length; i++){
		if(homeConfig.layouts[i].id===Number(cfg.id)){
			homeConfig.layouts[i].width=Number(cfg.width);
			sync();
			return true;
		}
	}
	
	return false;
}

exports.remove = function* (id){

};