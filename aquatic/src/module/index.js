//css('module.css');
define([
	'panel.mustache',
	'notice',
	'list',
	'sublist'
],function(panelTpl,notice,list,sublist){
	var M=function(cfg){
		this.config=$.extend({
			module: false,
			layouts: false
		},cfg);
		
		this.init();
	};
	
	
	M.modules=[];
	/**
	 *
	 *	val =>	(v)	:return v
	 *	remove	=>	()
	 *
	 **/
	M.add=function(m){
		this.map[m.key]=m.module;
		this.modules.push(m);
	};
	
	M.map={};
		
	M.add(notice);
	M.add(list);
	M.add(sublist);
	
	$.extend(M.prototype,{
		init: function(){
		
			this.dom=$(panelTpl.render($.extend({modules: M.modules},this.config)));
			
			this.titleInput=this.dom.find('input.name');
			this.subTitleInput=this.dom.find('input.sub-name');
			this.hideTitle=this.dom.find('input.hide-name');
			
			this.typeSelect=this.dom.find('select.type');
			this.layoutSelect=this.dom.find('select.layouts');
			
			this.panel=this.dom.find('.panel');
			
			this.get(this.config.module);
		},
		
		show: function(){
			this.dom.appendTo(document.body);
			this.initEvents();
		},
		
		get: function(m){
			if(!m){
				this.typeSelect[0].typeSelectedIndex=0;
				this.dom.find('.remove').hide();
			}else{
				var index=0;
				this.typeSelect.find('option').each(function(i){
					if($(this).attr('value')===String(m.type)){
						index=i;
					}
				});
				
				this.typeSelect[0].selectedIndex=index;
				
				if(index){
					this.typeSelect.attr('disabled',true);
				}
				
				var layoutIndex=0;
				this.layoutSelect.find('option').each(function(i){
					if($(this).attr('value')===String(m.layout)){
						layoutIndex=i;
					}
				});
				this.layoutSelect[0].selectedIndex=layoutIndex;
			}
		
			return this;
		},
		
		getData: function(){
			var data={
				title: $.trim(this.titleInput.val()),
				type: this.typeSelect.val(),
				layout: this.layoutSelect.val(),
				subTitle: $.trim(this.subTitleInput.val()),
				hideTitle: this.hideTitle[0].checked
			};
			
			if(!data.title){
				return {error: '请填写title'};
			}
			
			if(!data.type){
				return {error: '请选择模块类型'};
			}
			
			if(!data.layout){
				return {error: '请选择模块位置'};
			}
			
			var value=this.current.val();
			
			if(value.error){
				return value;
			}
			
			data.data=value;
			
			return data;
		},
		
		initEvents: function(){
			this.typeSelect.bind('change',$.proxy(function(){
				var type=this.typeSelect.val();
				
				if(this.current){
					this.current.remove();
					this.current=false;
				}
				
				if(type){
					this.current=new M.map[type]({
						parent: this.panel
					});
					
					if(this.config.module){
						this.current.val(this.config.module.data);
					}
				}
				
			},this)).trigger('change');
			
			this.dom.find('.save').bind('click',$.proxy(function(){
			
				var data=this.getData();
				
				if(data.error){
					return alert(data.error);
				}
			
				var err=true;
				var result=false;
				
				if(this.config.module){
					$.ajax({
						url: '/api/home/config/module/update',
						data: {
							id: this.config.module.id,
							module: JSON.stringify(data)
						},
						type: 'post',
						success: function(data){
							if(data.status&&data.data){
								err=false;
								result=data.data;
							}
						},
						complete: $.proxy(function(){
							if(err){
								alert('保存失败');
							}else{
								this.dom.remove();
								this.config.onsave&&this.config.onsave(result);
							}
						},this)
					});
				}else{
					$.ajax({
						url: '/api/home/config/module/new',
						data: {
							module: JSON.stringify(data)
						},
						type: 'post',
						success: function(data){
							if(data.status&&data.data){
								err=false;
								result=data.data;
							}
						},
						complete: $.proxy(function(){
							if(err){
								alert('创建失败');
							}else{
								this.dom.remove();
								this.config.onsave&&this.config.onsave(result);
							}
						},this)
					});
				}
			},this));
			
			this.dom.find('.close,.cancel').bind('click',$.proxy(function(){
				this.dom.remove();
			},this));
			
			this.dom.find('.remove').bind('click',$.proxy(function(){
				if(window.confirm('点击确定将删除此模块')){
					var err=true;
					$.ajax({
						url: '/api/home/config/module/remove',
						data: {
							id: this.config.module.id
						},
						success: function(data){
							if(data.status&&data.data){
								err=false;
							}
						},
						complete: $.proxy(function(){
							if(err){
								alert('删除失败');
							}else{
								this.dom.remove();
								this.config.onremove&&this.config.onremove();
							}
						},this)
					});
				}
			},this));
			
		}
	});
	
	return M;
});