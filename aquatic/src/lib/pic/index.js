//css('pic.css');

define(['pic.mustache','picItem.mustache','../uploader.js'],function(tpl,itemTpl,uploader){
	var Pic=function(cfg){
		this.config=$.extend({
			width: 'auto',
			height: 'auto',
			title: 'Pic',
			getter: false,
			setter: false,
			multi: false
		},cfg);
		
		this.init();
	};
	
	$.extend(Pic.prototype,{
		init: function(){
			var self=this;
			this.dom=$(tpl.render(this.config)).appendTo(document.body);
			
			var newItem=this.dom.find('.new');
			var newTip=newItem.find('.tip');
			
			newItem.bind('click',function(eve){
				if(eve.target&&eve.target.tagName=='INPUT'){
					return;
				}
				
				uploader.load({
					selector: newTip,
					callback: function(data){
						self.newImage(data);
					}
				});
			});
			
			var current=this.dom.find('.current');
			
			if(this.config.getter){
				this.config.getter(function(data){
				
					if(!data){
						return current.remove();
					}
					
					if(self.config.multi){
						$.each(data,function(){
							var clone=current.clone();
							clone.find('.img').append('<img src="'+this.img+'" />');
							clone.find('input').val(this.url||'');
							clone.insertBefore(current);
						});
						
						current.remove();
					}else{
						current.find('.img').append('<img src="'+data+'" />');
						current.show();
					}
				});
			}else{
				current.remove();
			}
			
			
			if(this.config.multi){
				var before=this.dom.find('.before');
				var choosen=this.dom.find('.choosen');

				choosen.delegate('.img','click',function(){
					$(this).parent().insertBefore(newItem);
				});
				
				before.delegate('.img','click',function(){
					if($(this).parent().hasClass('new')){
						return;
					}
					
					$(this).parent().appendTo(choosen);
				});
				
				var save=this.dom.find('.save');
				save.bind('click',$.proxy(function(){
					if(save.hasClass('loading')){
						return;
					}
					
					this.setMulti(function(){
						save.removeClass('loading');
					});
				},this));
				
			}else{
				this.dom.delegate('.item button','click',function(){
					var button=$(this);
					if(self.loading){
						return;
					}
					
					var item=button.parents('.item:eq(0)');
					var url=item.find('img').attr('src');
					
					self.loading=true;
					button.attr('disabled',true);
					self.set(url,item,function(){
						self.loading=false;
						button.attr('disabled',false);
					});
				});
			}
			
			this.dom.find('.cancel,.close').bind('click',function(){
				self.dom.remove();
			});
			
		},
		
		setMulti: function(callback){
			if(this.config.setter){
			
				var results=[];
				$.each(this.dom.find('.choosen .item'),function(){
					var item=$(this);
					results.push({
						img: item.find('img').attr('src'),
						url: item.find('input').val()||''
					});
				});
			
				this.config.setter(results,$.proxy(function(){
					//success
					this.dom.remove();
				},this),$.proxy(function(){
					alert('设置失败');
					callback&&callback();
				},this));
			}else{
				callback&&callback();
			}
		},
		
		set: function(url,item,callback){
		
			if(this.config.multi){
				return;
			}
		
			if(this.config.setter){
			
				this.config.setter(url,$.proxy(function(){
					//success
					this.dom.find('.item').removeClass('current');
					item.addClass('current');
					callback&&callback();
				},this),$.proxy(function(){
					callback&&callback();
				},this));
			}else{
				callback&&callback();
			}
		
		},
		
		newImage: function(data){
			$(itemTpl.render($.extend({image:data},this.config))).insertBefore(this.dom.find('.new'));
		}
	});
	
	return Pic;
});