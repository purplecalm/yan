//css('menu.css','lib/toolbar.css');
define(['./menu.mustache','items.mustache','item.mustache','jquery','lib/history.js'],function(tpl,itemsTpl,itemTpl){

	var config={
		animate: 400
	};

	var Item=function(dom,data){
		this.dom=dom;
		this.data=data;
		
		if(data.key){
			this.key=data.key;
		}
		
		if(data.select){
			this.select=$('<select>'+data.select.map(function(d){ return '<option value="'+d.value+'"'+(d.checked?'selected="selected"':'')+'>'+d.name+'</option>'; }).join('')+'</select>');
			this.dom.append(this.select);
		}
		
		if(this.data.checked){
			this.check();
		}
		
		if(this.data.hide){
			this.hide();
		}
		
		this.init();
	}
	
	$.extend(Item.prototype,{
		loading: function(){
			this.inLoading=true;
			
			if(!this.loadingDom){
				this.loadingDom=$('<div class="mask"></div>');
			}
			
			this.dom.append(this.loadingDom);
		},
		
		text: function(text){
			this.dom.find('.box>.text').text(text);
		},
		
		deepText: function(text){
			this.dom.find('.deep-text').text(text);
		},
		
		loaded: function(){
			this.loadingDom&&this.loadingDom.remove();
			this.inLoading=false;
		},
		
		init: function(){
			var self=this;
			if(this.data.switcher){
				var switcher=this.dom.find('.switcher');
				switcher.bind('click',$.proxy(function(){
					if(switcher.hasClass('on')){
						switcher.removeClass('on').addClass('off moveoff');
					}else{
						switcher.removeClass('off').addClass('on moveon');
					}
					
					setTimeout(function(){
						switcher.removeClass('moveon').removeClass('moveoff');
					},100);
					
					this.data.onswitch&&this.data.onswitch.call(this,switcher.hasClass('on'));
					
				},this));
			}else if(this.data.select){
				this.select.bind('change',$.proxy(function(){
					this.data.onchange&&this.data.onchange.call(this,this.select.val());
				},this));
			}else{
				var _click=$.proxy(function(e){
					if(this.inLoading){
						return;
					}
					
					if(e&&e.target){
						if(this.scrolling){
							if(!$(e.target).parents('.scroll-menu').length){
								this.dom.find('.box').animate({
									'margin-left': '0px'
								},200);
								this.scrolling=false;
							}
							
							return;
						}
					
						if(e.target.tagName=='INPUT'||e.target.tagName=='FORM'){
							return;
						}
					}
					
					this.data.onclick&&this.data.onclick.call(this);
				},this);
				
				this.click=_click;
				this.dom.bind('click',_click);
				
				if(this.data.scrollMenu){
				
					this.scrolling=false;
			
					var menuWidth=this.dom.find('.scroll-menu .item').width();
			
					var start=false, startPoint=false, moving=false, maxoffset=-this.data.scrollMenu.length*menuWidth, offset=0;
					var box=this.dom.find('.box');
					
					this.dom.bind('touchstart',function(eve){
						start=box;
						
						offset=parseInt(start.css('margin-left'),10)||0;
						
						var e=eve.originalEvent;
						var point = e.touches ? e.touches[0] : e;
						
						startPoint={
							x: point.pageX,
							y: point.pageY
						};
					});
					
					
					$(document).bind('touchmove',function(eve){
						if(!start){
							return;
						}
						
						var e=eve.originalEvent;
						var point = e.touches ? e.touches[0] : e;
						
						if(!moving){
							if(Math.abs(startPoint.x-point.pageX)>Math.abs(startPoint.y-point.pageY)){
								moving=true;
								
								startPoint.x-=parseInt(start.css('margin-left'),10)||0;
							}else{
								start=false;
								startPoint=false;
								moving=false;
								return;
							}
						}
						
						eve.preventDefault();
						
						var xoff=point.pageX-startPoint.x;
						if(xoff>0){
							xoff=0;
						}else if(xoff<maxoffset){
							xoff=maxoffset;
						}
						
						offset=xoff;
						start.css('margin-left',xoff+'px');
						
						self.scrolling=true;
					});
					
					$(document).bind('touchend',function(e){
						if(start){
							var g=parseInt(offset/menuWidth-0.5)*menuWidth;
							start.animate({
								'margin-left': g+'px'
							},200);
							
							if(!g){
								self.scrolling=false;
							}
						}
						
						start=false;
						startPoint=false;
						moving=false;
						offset=0;
					});
					
					this.dom.delegate('.scroll-menu .item','click',function(){
						var index=$(this).index()||0;
						var menu=self.data.scrollMenu[index];
						if(menu){
							menu.click.call(self,self.data);
						}
					});
				}
			}
		},
		
		initInput: function(){
			this.form=$('<form style="display: none"><input type="text" /></form>');
			this.dom.append(this.form);
			
			var input=this.form.find('input');
			
			var commit=$.proxy(function(e){
				if($.trim(input.val())){
					this.data.oninput&&this.data.oninput.call(this,input.val());
				}else{
					this.reset();
				}
			},this);
			
			input.bind('blur',commit);
			this.form.bind('submit',function(e){
				e.preventDefault();
				input.blur();
			});
		},
		
		input: function(){
			if(!this.form){
				this.initInput();
			}
			
			if(this.scrolling){
				this.dom.find('.box').css('margin-left','0px');
				setTimeout($.proxy(function(){
					this.scrolling=false;
				},this),10);
			}
			
			this.dom.addClass('inputing');
			this.form.show();
			
			this.form.find('input').focus();
		},
		
		reset: function(){
			this.loaded();
			this.unactive();
			
			this.dom.removeClass('inputing');
			this.form.hide();
			this.form.find('input').val('');
			this.dom.find('.box').css('margin-left','0');
		},
		
		active: function(){
			this.dom.addClass('active');
		},
		
		unactive: function(){
			this.dom.removeClass('active');
		},
		
		remove: function(){
			this.dom.remove();
		},
		
		check: function(){
			this.dom.addClass('checked');
		},
		
		uncheck: function(){
			this.dom.removeClass('checked');
		},
		
		checked: function(){
			return this.dom.hasClass('checked');
		},
		
		show: function(){
			this.dom&&this.dom.show();
			
			this.dom.parent().show();
		},
		
		hide: function(){
			this.dom&&this.dom.hide();
			
			var parent=this.dom.parent();
			if(!parent.children(':visible').length){
				parent.hide();
			}
		}
	});

	
	var Menu=function(cfg){
		this.config=$.extend({
			dialog: {
				back: '返回',
				title: 'test'
			},
			menu: [
				{
					name: 'Has Deep',
					deep: true,
					onclick: function(){
						
					}
				},
				
				{
					name: 'No deep',
					onclick: function(){
					}
				},
				
				{
					key: 'add',
					name: '增加检测酒店',
					onclick: function(){
					}
				}
			],
			parent: false
		},cfg);
		
		if(this.config.dialog){
			this.config.parent=document.body;
			
			this.title=function(text){
				this.dom.find('.toolbar .title').text(text);
			};
		}
		
		this.status={
			loading: false
		};
		
		this.init();
	};
	
	$.extend(Menu.prototype,{
	
	
		init: function(){
		
			this.dom=$(tpl.render(this.config));
			
			var f=this.dom.find('.menus:eq(0)');
			if(!f.children().length){
				f.remove();
			}
			
			if(this.config.dialog){
				this.dom.hide();
				this.dom.find('.toolbar .back').bind('click',function(){
					history.back();
				});
				
				if(this.config.dialog.search){
					this.initSearch();
				}else if(this.config.dialog.ok){
					
					this.dom.find('.toolbar .ok').bind('click',$.proxy(function(){
						if(this.config.dialog.ok.onclick&&(this.config.dialog.ok.onclick.call(this)===false)){
							return;
						}
						history.back();
					},this));
				}
			}
			
			this.dom.appendTo(this.config.parent);
		
			if(this.config.menu instanceof Array){
				this.initItems(this.config.menu);
			}else if(this.config.menu.api&&(!this.config.dialog||!this.config.dialog.search)){
				this.getData(this.config.menu);
			}
		},
		
		initSearch: function(){
			var commit=$.proxy(function(e){
				this.search();
			},this);
			var input=this.dom.find('.toolbar input');
			input.bind('blur',commit);
			input.parent().bind('submit',function(e){
				e.preventDefault();
				input.blur();
			});
			
			this.search();
		},
		
		search: function(){
			var str=$.trim(this.dom.find('.toolbar input').val());
			
			if(!str){
				return;
			}
			
			var param={
				api: this.config.menu.api,
				render: this.config.menu.render,
				data: $.extend({},this.config.menu.data),
				type: this.config.menu.type||'get'
			};
			
			param.data[this.config.dialog.search.key||'search']=str;
			
			this.getData(param);
		},
		
		getData: function(args){
			this.loading();
			
			$.ajax({
				url: args.api,
				data: args.data,
				type: args.type||'get',
				success: $.proxy(function(data){
					if(data.status){
						this.menu(args.render(data.data));
					}
				},this)
			});
		},
		
		loading: function(){
			this.dom.find('.menus').remove();
			this.dom.append('<ul class="menus"><li class="loading"><div class="text">Loading...</div></li></ul>');
		},
	
		menu: function(datas){
			this.dom.find('.menus').remove();
			this.dom.append(itemsTpl.render({menu: datas}));
			
			var f=this.dom.find('.menus:eq(0)');
			if(!f.children().length){
				f.remove();
			}
			
			this.initItems(datas);
		},
		
		insertBefore: function(cfg,item){
			if(!item){
				return this.append(cfg);
			}
			
			var newitem=this.newItem(cfg);
			
			newitem.dom.insertBefore(item.dom);
			
			this.items=this.items||[];
			
			for( var i=0; i<this.items.length; i++){
				if(this.items[i]==item){
					break;
				}
			}
			
			this.items.splice(i,0,newitem);
		},
		
		insertAfter: function(cfg,item){
			if(!item){
				return this.append(cfg);
			}
			
			var newitem=this.newItem(cfg);
			
			newitem.dom.insertAfter(item.dom);
			
			this.items=this.items||[];
			
			for( var i=0; i<this.items.length; i++){
				if(this.items[i]==item){
					break;
				}
			}
			
			this.items.splice(i+1,0,newitem);
		},
		
		append: function(cfg){
			var item=this.newItem(cfg);
			this.items=this.items||[];
			
			this.items.push(item);
			
			this.dom.find('.menus:last-child').append(item.dom);
		},
		
		newItem: function(cfg){
			var dom=$(itemTpl.render(cfg));
			return new Item(dom,cfg);
		},
		
		initItems: function(_menus){
		
			var menus=(_menus||[]).filter(function(d){
				if(!d||d.description===true){
					return false;
				}
				return true;
			});
		
			var items=[];
			this.dom.find('.menus li').each(function(index){
				if($(this).hasClass('loading')){
					return;
				}
				
				items.push(new Item($(this),menus[index]));
			});
			
			this.items=items;
		},
		
		item: function(key){
			if(!key||!this.items){
				return;
			}
			
			for( var i=0; i<this.items.length; i++){
				if(this.items[i].key===key){
					return this.items[i];
				}
			}
		},
		
		remove: function(){
			this.dom.remove();
		},
		
		hide: function(){
			this.dom.removeClass('flyin').addClass('flyout');
			
			setTimeout($.proxy(function(){
				this.dom.remove();
			},this),config.animate);
		},
		
		show: function(){
			this.dom.show().addClass('flyin');
			
			setTimeout($.proxy(function(){
				this.dom.removeClass('flyin');
			},this),config.animate);
			
			history.push($.proxy(this.hide,this));
		}
	});
	
	return Menu;
});