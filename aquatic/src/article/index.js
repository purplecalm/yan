//css('article.css');
define(['article.mustache','loading.mustache','../lib/uploader.js','../lib/editor'],function(tpl,loadingTpl,uploader){
	var Article=function(cfg){
		this.config=$.extend({
			data: false,
			category: false,
			trigger: false
		},cfg);
		
		
		this.dom=$(loadingTpl.render()).appendTo(document.body);
		
		this.getData($.proxy(function(data){
			this.dom.remove();
			
			this.config.data=data;
			
			this.dom=$(tpl.render(this.config.data));
			this.dom.appendTo(document.body);
			
			this.init();
			this.initEvents();
		},this));
	};
	
	$.extend(Article.prototype,{
		init: function(){
			this.editor=this.dom.find('textarea').height(this.dom.height()-300).edit({aclist: "ul,ol,li,dl,dd,dt,a,span,font,p,div,br,img,embed"});
		
			this.loading=false;
		},
		
		getData: function(callback){
			var err=true, d=false;
			$.ajax({
				url: '/api/article',
				data: {
					id: this.config.data.id
				},
				success: function(data){
					if(data.status){
						d=data.data;
						err=false;
					}
				},
				complete: $.proxy(function(){
					if(err){
						d=this.config.data;
					}
					
					callback(d);
				},this)
			});
		},
		
		save: function(){
			if(this.loading){
				return;
			}
			
			this.blur();
			
			var title=this.dom.find('.title input');
			var image=this.dom.find('.thumb-panel input');
			var body=this.dom.find('.body textarea');
			
			if(!$.trim(title.val())){
				return alert('请填写文章标题');
			}
			
			if(!$.trim(body.val())){
				return alert('请填写文章内容');
			}
			
			this.saveDom.addClass('loading');
			this.loading=true;
			
			this.cancelDom.hide();
			
			var data={
				title: $.trim(title.val()),
				content: $.trim(body.val()),
				summary: $.trim(this.editor.text()),
				category: this.config.category,
				image: image.val()
			};
			
			var api='/api/article/new';
			if(this.config.data){
				data.id=this.config.data.id;
				api='/api/article/update';
			}
			
			var err=true;
			
			$.ajax({
				url: api,
				data: data,
				type: 'post',
				success: $.proxy(function(data){
					if(data.status&&data.data){
						err=false;
						this.dom.remove();
						this.config.onsave&&this.config.onsave(data.data);
					}
				},this),
				complete: $.proxy(function(){
					if(err){
						this.loading=false;
						this.cancelDom.show();
						this.saveDom.removeClass('loading');
						
						alert('保存失败');
					}
				},this)
			});
		},
		
		remove: function(){
			if(this.loading||!this.config.data){
				return;
			}
			
			this.blur();
			
			if(window.confirm('点击确认将会删除这篇文章')){
				this.loading=true;
				var err=true;
			
				this.cancelDom.hide();
				
				$.ajax({
					url: '/api/article/remove',
					data: {
						id: this.config.data.id
					},
					success: $.proxy(function(data){
						if(data.status){
							err=false;
							this.dom.remove();
							this.config.onremove&&this.config.onremove();
						}
					},this),
					complete: $.proxy(function(){
						if(err){
							this.loading=false;
							this.cancelDom.show();
							
							alert('删除失败');
						}
					},this)
				});
			}
		},
		
		blur: function(){
			this.dom.find('input,textarea').blur();
			
			this.editor.actions.blur();
		},
		
		cancel: function(){
			this.blur();
			this.dom.remove();
		},
		
		initEvents: function(){
		
			var stage=this.dom.find('.stage');
		
			this.saveDom=this.dom.find('.save').bind('click',$.proxy(this.save,this));
			this.cancelDom=this.dom.find('.cancel,.close').bind('click',$.proxy(this.cancel,this));
			this.removeDom=this.dom.find('.remove').bind('click',$.proxy(this.remove,this));
			
			var imageInput=this.dom.find('.thumb-panel input');
			
			this.updateDom=this.dom.find('.trigger').bind('click',$.proxy(function(){
				uploader.load({
					trigger: this.updateDom,
					callback: function(data){
						imageInput.val(data.url);
						stage.find('img').attr('src',data.url);
						stage.show();
					}
				});
			},this));
			
			stage.find('span').bind('click',function(){
				imageInput.val('');
				stage.hide();
			});
		}
	});
	
	return Article;
});