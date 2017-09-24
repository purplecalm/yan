'use strict';

const config = require('../../config');
const CacheService = require('../../services/cache');
const ArticleService = require('../../services/article');

module.exports = function* show(next) {
	var params = this.params;
	// normal: {id: $id, page: $page, article: $article}
	// scope: [$id,$page,$article]
	
	var content=false,sub=false,category=false,article=false,page=parseInt(params.page,10)||1;
	
	if(params.article){
		article=yield ArticleService.getById(params.article);
		if(!article){
			return this.status=404;
		}
		
		category=CacheService.getCategory(article.category);
	}else{
		category=CacheService.getCategory(params.id);
	}
	
	var name=category.name;
	if(category.level==2){
		sub=category;
		category= CacheService.getCategory(sub.parent);
		name+=' :: '+category.name;
	}else{
		if(category.children&&category.children.length){
			sub=category.children[0];
		}
	}
	
	
	if(article){
		name=article.title+' :: '+name;
	}else if(sub){
		if(sub.single){
			content=yield ArticleService.get({category:sub.id},1);
			if(content.length){
				content=content[0];
			}else{
				content=false;
			}
		}else{
			content=yield ArticleService.findAndCount({category:sub.id},page);
			if(content.count){
				var totalPage=parseInt((content.count-1)/config.pageCount)+1;
				
				if(page>totalPage){
					page=totalPage;
				}
				
				if(page>1){
					content.prev=page-1;
				}
				
				if(page<totalPage){
					content.next=page+1;
				}
				
				content.page=page;
				content.total=totalPage;
				
			}else{
				content=false;
			}
		}
	}

	return yield this.render('category', {
		title: name+' :: '+config.title,
		config: config,
		category: category,
		sub: sub,
		content: content,
		article: article,
		type: 'category'
	});
};
