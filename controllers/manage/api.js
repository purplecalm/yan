'use strict';

const path=require('path');
const fs=require('fs');
const config = require('../../config');
const CategoryService = require('../../services/category');
const ArticleService = require('../../services/article');
const HomeService = require('../../services/home');
const CacheService = require('../../services/cache');

const HomePath=path.join(path.dirname(__dirname),'..','static');
const uploadDir= path.join(path.dirname(__dirname),'..','static','upload');

var Map={
	'category': function *(rq){
		var categories=yield CategoryService.getTopCategories();
		return categories;
	},
	
	'category/sync': function*(rq){
		CacheService.writeLayout();
		return true;
	},
	
	'category/tree': function *(rq){
		return yield CategoryService.getAll();
	},
	
	//post
	'category/new': function *(rq){
		var body=rq.request.body;
		if(body&&body.name){
			var inserted= yield CategoryService.create(body);
			
			return inserted;
		}else{
			return {};
		}
	},
	'category/sub': function *(rq){
		if(rq.query&&rq.query.id){
			return yield CategoryService.getSubCategories(rq.query.id);
		}else{
			return [];
		}
	},
	
	'category/remove': function *(rq){
		if(rq.query&&rq.query.id){
			return yield CategoryService.remove(rq.query.id);
		}else{
			return [];
		}
	},
	
	//post
	'category/update': function *(rq){
		if(rq.request.body&&rq.request.body.id){
			var sets={};
			for( var key in rq.request.body){
				if(key!='id'){
					sets[key]=rq.request.body[key];
				}
			}
			return yield CategoryService.update(rq.request.body.id,sets);
		}else{
			return [];
		}
	},
	
	'articles': function *(rq){
		if(rq.query&&rq.query.id){
			var rs= yield ArticleService.get({
				category: parseInt(rq.query.id,10)
			});
			
			var ret=[];
			for( var i=0; i<rs.length; i++){
				ret.push({
					id: rs[i].id,
					title: rs[i].title
				});
			}
			return ret;
		}else{
			return [];
		}
	},
	
	'article': function *(rq){
		
		if(rq.query&&rq.query.id){
			var rs= yield ArticleService.get({
				id: parseInt(rq.query.id,10)
			});
			
			if(!rs.length){
				return false;
			}
			
			return rs[0];
		}else{
			return false;
		}
	},
	
	'article/new': function *(rq){
		var body=rq.request.body;
		if(body&&body.title&&body.content&&body.category){
			return yield ArticleService.create(body);
		}else{
			return {};
		}
	},
	
	'article/update': function *(rq){
		var body=rq.request.body;
		if(body&&body.id&&body.title&&body.content&&body.category){
		
			var sets={};
			for( var key in body){
				if(key!='id'){
					sets[key]=body[key];
				}
			}
			var results= yield ArticleService.update(body.id,sets);
			if(!results.length||!results[0]){
				return {};
			}
			
			var arts= yield ArticleService.get({
				id: parseInt(body.id,10)
			});
			return arts[0];
		}else{
			return {};
		}
	},
	
	'article/remove': function *(rq){
		if(rq.query&&rq.query.id){
			return yield ArticleService.remove(rq.query.id);
		}else{
			return [];
		}
	},
	
	'home/config': function *(rq){
		return yield HomeService.get();
	},
	
	'home/config/sync': function *(rq){
		return yield HomeService.refreshCache();
	},
	
	'home/config/grid/new': function *(rq){
		return yield HomeService.newCol();
	},
	
	'home/config/grid/remove': function *(rq){
		return yield HomeService.removeCol(rq.query);
	},
	
	'home/config/grid/width': function *(rq){
		return yield HomeService.setColWidth(rq.query);
	},
	
	'home/config/module/new': function *(rq){
		var body=rq.request.body;
		if(body&&body.module){
			try{
				var sets=JSON.parse(body.module);
				
				return yield HomeService.addModule(sets);
			}catch(e){
				return false;
			}
		}else{
			return false;
		}
	},
	
	'home/config/module/remove': function *(rq){
		var body=rq.query;
		if(body&&body.id){
			try{
				return yield HomeService.removeModule(body.id);
			}catch(e){
				return false;
			}
		}else{
			return false;
		}
	},
	
	'home/config/module/update': function *(rq){
		var body=rq.request.body;
		if(body&&body.module&&body.id){
			try{
				var sets=JSON.parse(body.module);
				
				return yield HomeService.updateModule(body.id,sets);
			}catch(e){
				return false;
			}
		}else{
			return false;
		}
	},
	
	'home/sliders/update': function *(rq){
		var body=rq.request.body;
		if(body&&body.sliders){
			try{
				var sets=JSON.parse(body.sliders);
				
				return yield HomeService.updateSliders(sets);
			}catch(e){
				return false;
			}
		}else{
			return false;
		}
	},
	
	'home/sliders/interval': function *(rq){
		var body=rq.request.query;
		if(body&&body.interval&&parseInt(body.interval,10)>0){
			return yield HomeService.setSliderInterval(parseInt(body.interval,10));
		}else{
			return false;
		}
	},
	
	'image/upload': function *(rq){
		var form = new require('formidable').IncomingForm();
		form.encoding = 'utf-8';
		form.uploadDir = uploadDir;
		form.keepExtensions = true;
		form.maxFieldsSize = 20 * 1024 * 1024;
		
		var result=yield new Promise((resolve, reject) =>{
			form.parse(rq.req,function(err, fields, _files){
				if(err){
					reject(err);
				}else{
					var files={};
					
					for( var key in _files){
						var file=_files[key];
						files[key]={
							name: file.name,
							path: file.path.replace(uploadDir,'').replace(/[\\\/]/g,''),
							size: file.size,
							type: file.type,
							url: file.path.replace(HomePath,'').replace(/\\/g,'/')
						};
					}
					
					resolve(files);
				}
			});
		});
		
		return result;
	}
};

module.exports = function* show(next) {
	var params = this.params;
	/*[apiname]*/
	
	var key=params[0], results={};
	
	if(Map[key]){
		results= yield Map[key](this);
	}else{
		this.status=404;
		this.body={status: 0, error: '404'};
		return;
	}

	this.status=200;
	
	
	
	if(results.error){
		this.body={
			status: 0,
			error: results.error
		};
	}else{
		this.body={
			status: 1,
			data: results
		};
	}
	
	return;

};