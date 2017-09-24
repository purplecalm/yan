'use strict';

const CacheService=require('../../../services/cache');
const ArticleService=require('../../../services/article');
const Tools=require('../../../tools');
var renders={};

renders.sublist=function* (cfg, layout){

	var category=CacheService.getCategory(cfg.data.id);
	var limit=Number(cfg.data.rows)||10;

	var html=[];
	if(layout.width<10){
		html.push('<div class="m-sublist">');
	}else{
		html.push('<div class="m-sublist m-sublist-dbcol">');
		limit*=2;
	}
	
	var articles= yield ArticleService.get({category: category.id},limit);
	
	html.push('<div class="module-title">','<h2>',cfg.title,'</h2>');
	
	if(cfg.subTitle){
		html.push('<span class="module-sub-title">',cfg.subTitle,'</span>');
	}
	html.push('<div class="more"><a href="/category/',category.id,'" target="_blank">更多</a></div>','</div>');
	
	html.push('<div class="module-content m-sublist-content"><ul>');
	
	articles.forEach(function(d){
		html.push('<li><a href="/article/'+d.id+'">'+d.title+'</a><div class="summary">'+Tools.subByte(d.summary||'',80)+'</div><span class="time">'+d.date+'</span></li>');
	});
	
	html.push('</ul></div>');
	
	html.push('</div>');
	return html.join('');
};


renders.list=function* (cfg, layout){

	var category=CacheService.getCategory(cfg.data.id);
	
	var parent=category, children=(category.children||[]).filter(function(d){ return !d.single; }), panels=[];
	
	var limit=Number(cfg.data.rows)||10;

	var html=[];
	if(layout.width<10){
		html.push('<div class="m-list">');
	}else{
		html.push('<div class="m-list m-list-dbcol">');
		limit*=2;
	}
	
	
	for( var i=0; i<children.length; i++){
		panels.push(yield ArticleService.get({category: children[i].id},limit));
	}
	
	html.push('<div class="module-title">','<h2>',cfg.title,'</h2>');
	if(cfg.subTitle){
		html.push('<span class="module-sub-title">',cfg.subTitle,'</span>');
	}
	//html.push('<div class="more"><a href="/category/',category.id,'" target="_blank">更多</a></div>');
	
	html.push('<ul class="sub-tab">');
	children.forEach(function(v){
		html.push('<li>',v.name,'</li>');
	});
	html.push('</ul>');
	
	html.push('</div>');
	
	panels.forEach(function(articles, index){
		html.push('<div class="module-content m-list-content" style="display: none"><ul>');
		articles.forEach(function(d){
			html.push('<li><a href="/article/'+d.id+'">'+d.title+'</a><div class="summary">'+Tools.subByte(d.summary||'',80)+'</div><span class="time">'+d.date+'</span></li>');
		});
		html.push('</ul><div class="more"><a href="/category/',children[index].id,'" target="_blank">更多</a></div></div>');
	});
	
	html.push('</div>');
	return html.join('');
};


renders.notice=function* (cfg){
	var html=['<div class="m-notice"><div class="module-title"><h2>',cfg.title,'</h2>'];
	if(cfg.subTitle){
		html.push('<span class="module-sub-title">',cfg.subTitle,'</span>');
	}
	html.push('</div><div class="module-content m-notice-content">'+cfg.data+'</div></div>');
	
	return html.join('');
};

module.exports=renders;