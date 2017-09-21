'use strict';

const config = require('../../config');
const CacheService = require('../../services/cache');
const AricleService = require('../../services/article');

module.exports = function* show(next) {
	var params = this.params;
	// normal: {id: $id, page: $page}
	// scope: [$id,$page]
	
	var page=parseInt(params.page,10)||1;
	var category = CacheService.getCategory(params.id);
	var sub=false, name=category.name;
	
	if(category.level==2){
		sub=category;
		category= CacheService.getCategory(sub.parent);
		
		name+=' :: '+category.name;
	}else{
		if(category.children&&category.children.length){
			sub=category.children[0];
		}
	}
	
	var content=false;
	if(sub){
		if(sub.single){
			content=yield AricleService.get({category:sub.id},1);
			if(content.length){
				content=content[0];
			}else{
				content=false;
			}
		}else{
			content=yield AricleService.findAndCount({category:sub.id},page);
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
		type: 'category'
	});
};
