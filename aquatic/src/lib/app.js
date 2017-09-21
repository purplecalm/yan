define(['./date.js'],function(){	
	var app={
		init: function(){
			this.dom=$('#menu');
		},
		pages: {},
		reg: function(name,module){
			this.pages[name]={
				dom: $('[data-page="'+name+'"]'),
				module: module
			}
		},
		
		active: function(page){
			$.each(this.pages,function(key){
				
				if(key==page){
					this.dom.show();
					this.module.load&&this.module.load();
				}else{
					this.dom.hide();
					this.module.unload&&this.module.unload();
				}
				
			});
		},
		
		load: function(params,page){
			this.params=params;
	
			$.each(this.pages,function(){
				this.module&&this.module.init&&this.module.init(params);
			});
		}
	};
	
	return {
		load: function(params){
			app.load(params||{});
		},
		reg: function(name,module){
			app.reg(name,module);
		},
		active: function(page){
			app.active(page);
		},
		isActive: function(page){
			return app.pages[page]&&app.pages[page].dom.is(':visible');
		}
	};
});