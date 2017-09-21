const fs=require('fs');
const path=require('path');
const config=require('../config');

const Category=require('../model').Category;


var buildTree=function(rows){
	var parents=[], children=[], map={};
	
	for( var i=0; i<rows.length; i++){
	
		if(this.disabled){
			continue;
		}
	
		if(rows[i].level===1){
			parents.push(rows[i]);
			map[rows[i].id]=rows[i];
		}
		
		if(rows[i].level===2&&rows[i].parent){
			children.push(rows[i]);
		}
	}
	
	for( i=0; i<children.length; i++){
		if(map[children[i].parent]){
			map[children[i].parent].children=map[children[i].parent].children||[];
			
			map[children[i].parent].children.push(children[i]);
		}
	}
	
	return parents;
};

var viewDir=path.join(path.dirname(__dirname),'view','web');
var writeFile=function(){
	var html=[];
	
	html.push('<li class="nav-item home"><div class="box"><a href="/">首页</a></div></li>');
	tree.forEach(function(v){
		html.push('<li class="nav-item"><div class="box"><a href="/category/'+v.id+'">'+v.name+'</a></div>');
		
		if(v.children){
			html.push('<ul class="sub">');
			
			v.children.forEach(function(sub){
				html.push('<li class="sub-item"><a href="/category/'+sub.id+'">'+sub.name+'</a></li>');
			});
			
			html.push('</ul>');
		}
		
		html.push('</li>');
	});
	
	var layoutFile = path.join(viewDir, '_layout.html');
	var footer = fs.readFileSync(path.join(viewDir, 'footer.html'), 'utf8').replace('{{navigator}}',html.join('\n'));
	var layout = fs.readFileSync(path.join(viewDir, 'layout.html'), 'utf8').replace('{{footer}}', footer).replace('{{logoURL}}', config.logoURL).replace('{{navigator}}',html.join('\n'));

	fs.writeFileSync(layoutFile, layout);
};

var tree=false, categoryMap={};
var cacheTree=function(callback){
	Category.findAll({
		where: {
			disabled: 0
		}
	}).then(function(rs){
		var ret=[];
		for( var i=0; i<rs.length; i++){
			var item={
				id: rs[i].id,
				name: rs[i].name,
				image: rs[i].image,
				level: rs[i].level,
				parent: rs[i].parent,
				single: rs[i].single||false
			};
			
			categoryMap[item.id]=item;
			ret.push(item);
		}
		tree=buildTree(ret);
		callback&&callback();
	}).error(function(err){
		reject(err);
	});
};

exports.writeLayout= () => {
	cacheTree(function(){
		writeFile();
		callback&&callback();
	});
	
	var callback=false;
	
	return {
		then: function(func){
			callback=func;
		}
	};
};

exports.getCategory=function(id){
	return categoryMap[id]||false;
};