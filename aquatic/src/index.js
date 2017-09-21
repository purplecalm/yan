//css('common.css','animation.css','index.css');
define([
	'jquery',
	'lib/menu',
	'article',
	'lib/pic',
	'preview',
	'module'
],function(jq,Menu,Article,Pic,Preview,Module){

	var panel=$('#panel');
	var WebMenu=function(level){
	
		var self=this;
		this.level=level;
		this.dom=$('<div class="win-item" data-level="'+level+'"></div>');
		
		this.dom.bind('click',function(e){
			var cls=$(e.target).attr('class');
			
			if(cls=='m-menu'||cls=='win-item'){
				for( var i=level; i<settings.current.length; i++){
					if(settings.current[i]&&settings.current[i].unactive){
						settings.current[i].unactive();
						settings.current[i]=false;
					}
				}
				WebMenu.clean(level+1);
			}
		});
		
		WebMenu.clean(level,function(){
			self.show();
		});
	};
	
	WebMenu.clean=function(level, callback){
		
		var pre=$([]), counter=0;
		$('.win-item').each(function(){
			if($(this).data('level')>=level){
				pre.push(this);
				//$(this).removeClass('flyin').addClass('flyout');
			}
			
			counter++;
		});
		
		if(pre.length){
			panel.attr('class','win l'+counter+'to'+(counter-pre.length));
			setTimeout(function(){
				pre.remove();
				panel.attr('class','win');
				callback&&callback();
			},350);
		}else{
			callback&&callback();
		}
	};
	
	$.extend(WebMenu.prototype,{
		show: function(){
			var length=$('.win-item').length;
			
			panel.attr('class','win l'+length+'to'+(length+1));
			this.dom.appendTo(panel);
		},
		
		remove: function(){
			WebMenu.clean(this.level);
		}
	});
	
	var settings={
		init: function(params){
			
			this.checkMobile();
			
			if(this.mobile){
				this.dom=$('<div class="win-item"></div>').appendTo(panel);
			}else{
				var mdom=new WebMenu(0);
				this.dom=mdom.dom;
			}
			var self=this;
			
			var newItem=function(d){
				var _item={
					name: d.name,
					deep: true,
					onclick: function(){
						self.showCategory(d,this);
					},
					oninput: function(text){
						this.loading();
						var __self=this;
						var err=true;
						$.ajax({
							url: '/api/category/update',
							data: {
								name: text,
								id: d.id
							},
							type: 'post',
							success: function(data){
								if(data.status){
									err=false;
									d.name=text;
									__self.reset();
									__self.text(text);
									__self.loaded();
								}
							},
							complete: $.proxy(function(){
								if(err){
									alert('重命名失败');
								}
								__self.reset();
							},this)
						});
					},
					scrollMenu: [{
						name: '重命名',
						cls: 'rename',
						click: function(){
							this.input();
						}
					},{
						name: '删除',
						cls: 'remove',
						click: function(){
							if(confirm('删除该导航会删除导航下的所有内容')){
								var err=true;
								
								var __self=this;
								__self.loading();
								
								$.ajax({
									url: '/api/category/remove',
									data: {
										id: d.id
									},
									success: function(data){
										if(data.status){
											err=false;
											__self.remove();
										}
									},
									complete: function(){
										if(err){
											alert('删除失败');
											__self.loaded();
										}
									}
								});
							}
						}
					}]
				};
				
				if(d.key){
					_item.key=d.key;
				}
				
				return _item;
			};
			
			var menu=new Menu({
				dialog: false,
				menu: {
					api: '/api/category',
					render: function(data){
						var menus=[];
						
						if(!self.mobile){
							menus.push({
								key: 'home',
								name: '首页管理',
								deep: true,
								onclick: function(){
									self.showHome(this);
								}
							});
						}
						
						menus.push({description:true,text:'Category'});
						
						$.each(data||[],function(){
							if(this.disabled){
								return;
							}
							
							menus.push(newItem(this));
						});
						
						menus.push({
							key: 'add',
							name: '+ 增加一级导航',
							icon: 'add',
							input: true,
							oninput: function(text){
								this.loading();
								var __self=this;
								var err=true;
								$.ajax({
									url: '/api/category/new',
									data: {
										name: text
									},
									type: 'post',
									success: function(data){
										if(data.status){
											
											err=false;
											
											var d=data.data;
											var key='c.'+(new Date().valueOf());
											
											menu.insertBefore(newItem({
												key: key,
												name: d.name,
												id: d.id
											}),__self);
										
											__self.reset();
											
											menu.item(key).click();
										}else if(data.error){
											err=data.error;
										}
									},
									complete: $.proxy(function(){
										if(err){
											alert(typeof err=='string'?err:'增加一级导航失败');
											__self.reset();
										}
									},this)
								});
							},
							onclick: function(){
								this.input();
							}
						});
						
						
						menus.push({description: true, text: '修改后若不手动同步, 服务器重启后会自动同步'});
						menus.push({
							name: '同步导航到生产环境',
							onclick: function(){
								var item=this;
								item.loading();
								$.ajax({
									url: '/api/category/sync',
									success: function(data){
										if(data.status){
											alert('同步完成, 界面的更新会在几分钟内完成, 请耐心');
										}
									},
									complete: function(){
										item.loaded();
									}
								});
							}
						});
						
						return menus;
					}
				},
				parent: this.dom
			});
			
			this.menu=menu;
		},
		
		checkMobile: function(){
			
			
			if(/(iPhone|iPod|Android|ios|iPad)/i.test(window.navigator.userAgent)){
				$(document.body).addClass('mobile');
				this.mobile=true;
			}else{
				$(document.body).addClass('web');
			
				$(window).bind('resize',function(){
					var headerHeight=$('.header').height();
					$('.content').height($(window).height()-headerHeight);
				}).trigger('resize');
			}
		},
		
		showHome: function(item){
			if(this.current[0]){
				this.current[0].unactive();
			}
			
			this.current[0]=item;
			this.current[0].active();
		
			var dialog=false, parent=false;
			if(this.mobile){
				dialog={
					title: d.name,
					back: '设置'
				};
			}else{
				parent=new WebMenu(1);
			}
			
			
			var preview=new Preview({
				parent: parent.dom
			});
			parent.dom.append('<div class="preview-link"><a href="http://www.syhgf.com/?preview" target="_blank">效果预览</a></div>');
			
			var self=this;
			
			var layouts=[];
			
			var menu=new Menu({
				dialog: dialog,
				parent: parent.dom,
				menu: {
					api: '/api/home/config',
					render: function(data){
						var menus=[];
						
						menus.push({description: true, text: 'Sliders'});
						menus.push({
							name: '首页轮播图设置 ( 1400 X 560 )',
							sliders: data.sliders,
							onclick: function(){
								self.updateSlider(this);
							}
						});
						
						menus.push({description: true, text: 'Layouts'});
						$.each(data.layouts||[],function(){
							layouts.push(this);
							menus.push(self.newLayout(this,menu,preview));
						});
						
						menus.push({
							name: '添加一列',
							onclick: function(){
							
								var item=this;
								
								item.loading();
								var err=true;
								
								$.ajax({
									url: '/api/home/config/grid/new',
									success: function(data){
										if(data.status&&data.data){
											err=false;
											layouts.push(data.data);
											var cfg=self.newLayout(data.data,menu,preview);
											
											menu.insertBefore(cfg,item);
											
											menu.item(cfg.key).click();
										}
									},
									complete: function(){
										if(err){
											alert('添加列失败');
										}
										
										item.loaded();
									}
								});
							}
						});
						
						menus.push({description: true, text: 'Modules'});
						$.each(data.modules||[],function(){
							var module=this;
							menus.push({
								name: this.title,
								deep: true,
								deepText: '列'+self.getLayout(module.layout).key,
								onclick: function(){
									self.showModule(module,this);
								}
							});
						});
						menus.push({
							name: '添加模块',
							onclick: function(){
								self.addModule(this,menu);
							}
						});
						
						menus.push({description: true, text: '修改后若不手动同步, 服务器重启后会自动同步'});
						menus.push({
							name: '现在同步到首页',
							cls: 'save',
							onclick: function(){
								var item=this;
								item.loading();
								$.ajax({
									url: '/api/home/config/sync',
									success: function(data){
										if(data.status){
											alert('同步完成');
										}
									},
									complete: function(){
										item.loaded();
									}
								});
							}
						});
						
						return menus;
					}
				},
				parent: parent.dom
			});
			
			this.layouts=layouts;
		},
		
		getLayout: function(id){
			for( var i=0; i<this.layouts.length; i++){
				if(String(this.layouts[i].id)===String(id)){
					return this.layouts[i];
				}
			}
			
			return {key:'未知'};
		},
		
		addModule: function(item,menu){
			var self=this;
			new Module({
				layouts: this.layouts,
				onsave: function(data){
					menu.insertBefore({
						name: data.title,
						deep: true,
						deepText: '列'+self.getLayout(data.layout).key,
						onclick: function(){
							self.showModule(data,this);
						}
					},item);
				}
			}).show();
		},
		
		showModule: function(module,item){
			new Module({
				layouts: this.layouts,
				module: module,
				onsave: function(data){
					$.extend(module,data);
					item.text(data.title);
				},
				onremove: function(){
					item.remove();
				}
			}).show();
		},
		
		newLayout: function(data,menu,preview){
		
			var col=preview.addColumn(data), self=this;
			var key='col.'+data.id;
			
			var cfg={
				key: key,
				name: '列'+data.key,
				deep: true,
				deepText: data.width?'宽度:'+data.width+'格':'选择宽度',
				onclick: function(){
					var item=this;
					self.chooseWidth(this,col.width(),function(w){
						item.loading();
						
						var err=true;
						
						
						if(w==='remove'){
							$.ajax({
								url: '/api/home/config/grid/remove',
								data: {
									id: data.id
								},
								success: function(d){
									if(d.status&&d.data){
										err=false;
										col.remove();
										item.remove();
										
										for( var i=0; i<self.layouts.length; i++){
											if(self.layouts[i]===data){
												self.layouts.splice(i,1);
												return;
											}
										}
									}
								},
								complete: function(){
									if(err){
										alert('删除失败');
									
										item.loaded();
									}
								}
							});
						}else{
							$.ajax({
								url: '/api/home/config/grid/width',
								data: {
									width: w,
									id: data.id
								},
								success: function(d){
									if(d.status&&d.data){
										err=false;
										data.width=w;
										item.deepText('宽度:'+w+'格');
										col.width(w);
									}
								},
								complete: function(){
									if(err){
										alert('设置失败');
									}
									
									item.loaded();
								}
							});
						}
					});
				}
			};
			
			return cfg;
		},
		
		chooseWidth: function(item,current,callback){
		
		
			if(this.current[1]){
				this.current[1].unactive();
			}
			
			this.current[1]=item;
			this.current[1].active();
		
			var dialog=false, parent=false;
			if(this.mobile){
				dialog={
					back: '首页设置',
					title: '设置列宽'
				};
			}else{
				parent=new WebMenu(2);
			}
		
			var menus=[], self=this;
			for( var i=4; i<21; i++){
				menus.push({
					name: i,
					checked: current==i,
					onclick: function(){
						callback(this.data.name);
						
						item.unactive();
						
						if(self.mobile){
							history.back();
						}else{
							WebMenu.clean(2);
						}
					}
				});
			}
			
			menus.push(false);
			menus.push({
				name: '删除此列',
				cls: 'remove',
				onclick: function(){
					if(window.confirm('点击确定将删除此布局列')){
						callback('remove');
							
						if(self.mobile){
							history.back();
						}else{
							WebMenu.clean(2);
						}
					}
				}
			});
			
			new Menu({
				dialog: dialog,
				menu: menus,
				parent: parent.dom
			});
		},
		
		updateSlider: function(item){
			var __self=this;
			
			new Pic({
				title: '首页轮播图设置',
				width: '240px',
				height: '150px',
				multi: true,
				getter: function(callback){
					callback(item.data.sliders);
				},
				setter: function(results,success,fail){
					var err=true;
					$.ajax({
						url: '/api/home/sliders/update',
						data: {
							sliders: JSON.stringify(results)
						},
						type: 'post',
						success: function(data){
							if(data.status){
								err=false;
							}else if(data.error){
								err=data.error;
							}
						},
						complete: function(){
							if(!err){
								item.data.sliders=results;
								success();
							}else{
								fail(err);
							}
						}
					});
				}
			});
		},
		
		current: [],
		
		showCategory: function(d,item){
			
			if(this.current[0]){
				this.current[0].unactive();
			}
			
			this.current[0]=item;
			this.current[0].active();
		
			var parentid=d.id, self=this, parentData=d;
			
			var dialog=false, parent=false;
			if(this.mobile){
				dialog={
					title: d.name,
					back: '设置'
				};
			}else{
				parent=new WebMenu(1);
			}
			
			
			var newItem=function(d){
				var _item={
					name: d.name,
					deep: true,
					onclick: function(){
						self.showSub(d,this,parentData);
					},
					oninput: function(text){
						this.loading();
						var __self=this;
						var err=true;
						$.ajax({
							url: '/api/category/update',
							data: {
								name: text,
								id: d.id
							},
							type: 'post',
							success: function(data){
								if(data.status){
									err=false;
									d.name=text;
									__self.reset();
									__self.text(text);
									__self.loaded();
								}
							},
							complete: $.proxy(function(){
								if(err){
									alert('重命名失败');
								}
								__self.reset();
							},this)
						});
					},
					scrollMenu: [{
						name: '重命名',
						cls: 'rename',
						click: function(){
							this.input();
						}
					},{
						name: '删除',
						cls: 'remove',
						click: function(){
							if(confirm('删除该导航会删除导航下的所有内容')){
								var err=true;
								
								var __self=this;
								__self.loading();
								
								$.ajax({
									url: '/api/category/remove',
									data: {
										id: d.id
									},
									success: function(data){
										if(data.status){
											err=false;
											__self.remove();
										}
									},
									complete: function(){
										if(err){
											alert('删除失败');
											__self.loaded();
										}
									}
								});
							}
						}
					}]
				};
				
				if(d.key){
					_item.key=d.key;
				}
				
				return _item;
			};
			
			var menu=new Menu({
				dialog: dialog,
				parent: parent.dom,
				menu: {
					api: '/api/category/sub',
					data: {
						id: parentid
					},
					render: function(data){
						var menus=[];
						
						
						$.each(data||[],function(){
							if(this.disabled){
								return;
							}
							
							var d=this;
							menus.push(newItem(this));
						});
						
						menus.push({
							key: 'add',
							name: '+ 增加二级导航',
							icon: 'add',
							input: true,
							oninput: function(text){
								this.loading();
								var __self=this;
								var err=true;
								$.ajax({
									url: '/api/category/new',
									data: {
										name: text,
										parent: parentid
									},
									type: 'post',
									success: function(data){
										if(data.status){
											
											err=false;
											
											var d=data.data;
											var key='c.'+(new Date().valueOf());
											
											menu.insertBefore(newItem({
												key: key,
												name: d.name,
												id: d.id
											}),__self);
										
											__self.reset();
											
											menu.item(key).click();
										}else if(data.error){
											err=data.error;
										}
									},
									complete: $.proxy(function(){
										if(err){
											alert(typeof err=='string'?err:'增加二级导航失败');
											__self.reset();
										}
									},this)
								});
							},
							onclick: function(){
								this.input();
							}
						});
						
						menus.push({description:true,text:'Thumbnail'});
						menus.push({
							name: '查看/设置标志图',
							deep: true,
							deepText: parentData.image?'已设置':'未设置',
							onclick: function(){
								var __self=this;
								new Pic({
									title: '一级导航 / '+parentData.name+' / 标志图',
									width: '240px',
									height: '150px',
									getter: function(callback){
										callback(parentData.image);
									},
									setter: function(url,success,fail){
										var err=true;
										$.ajax({
											url: '/api/category/update',
											data: {
												id: parentData.id,
												image: url
											},
											type: 'post',
											success: function(data){
												if(data.status){
													err=false;
												}else if(data.error){
													err=data.error;
												}
											},
											complete: function(){
												if(!err){
													__self.deepText('已设置');
													parentData.image=url;
													success();
												}else{
													fail(err);
												}
											}
										});
									}
								});
							}
						});
						
						if(!self.mobile){
							menus.push({description:true,text:'Rename'});
							menus.push({
								key: 'rename',
								name: '点击这里重命名',
								input: true,
								oninput: function(text){
									this.loading();
									var __self=this;
									var err=true;
									$.ajax({
										url: '/api/category/update',
										data: {
											name: text,
											id: parentid
										},
										type: 'post',
										success: function(data){
											if(data.status){
												
												err=false;
												d.name=text;
												item.text(text);
												
												menu.title&&menu.title(text);
											}
										},
										complete: $.proxy(function(){
											if(err){
												alert('重命名失败');
											}
											__self.reset();
										},this)
									});
								},
								onclick: function(){
									this.input();
								}
							});
							
							menus.push(false);
							
							menus.push({
								key: 'remove',
								name: '删除该一级导航',
								cls: 'remove',
								onclick: function(){
									if(confirm('删除该导航会删除导航下的所有内容')){
										var err=true;
										
										if(self.mobile){
											menu.hide();
										}else{
											parent.remove();
										}
										item.loading();
										
										$.ajax({
											url: '/api/category/remove',
											data: {
												id: parentid
											},
											success: function(data){
												if(data.status){
													err=false;
													item.remove();
												}
											},
											complete: function(){
												if(err){
													alert('删除失败');
													item.loaded();
												}
											}
										});
									}
								}
							});
						}
						
						return menus;
					}
				}
			});
			
			if(this.mobile){
				menu.show();
			}
		
		},
		
		showSub: function(d,item, parentData){
			var parentid=d.id, self=this, subData=d;
			
			if(this.current[1]){
				this.current[1].unactive();
			}
			
			this.current[1]=item;
			this.current[1].active();
			
			var dialog=false, parent=false;
			if(this.mobile){
				dialog={
					title: d.name,
					back: parentData.name
				};
			}else{
				parent=new WebMenu(2);
			}
			
			var menu=new Menu({
				dialog: dialog,
				parent: parent.dom,
				menu: {
					api: '/api/articles',
					data: {
						id: parentid
					},
					render: function(data){
						var menus=[];
						menus.push({description:true,text:'启用后, 当前导航默认展示的内容为最后创建的文章'});
						menus.push({
							key: 'single',
							name: '单文章模式',
							switcher: {
								on: d.single
							},
							onswitch: function(on){
								var err=true;
								$.ajax({
									url: '/api/category/update',
									data: {
										single:on?1:0,
										id: d.id
									},
									type: 'post',
									success: function(data){
										if(data.status&&data.data&&data.data.length&&data.data[0]){
											err=false;
										}
									},
									complete: function(){
										if(err){
											alert('设置单文章模式失败');
										}
									}
								});
							}
						});
						
						menus.push({description:true,text:'Thumbnail'});
						menus.push({
							name: '查看/设置标志图',
							deep: true,
							deepText: subData.image?'已设置':'未设置',
							onclick: function(){
								var __self=this;
								new Pic({
									title: '一级导航 / '+subData.name+' / 标志图',
									width: '240px',
									height: '150px',
									getter: function(callback){
										callback(subData.image);
									},
									setter: function(url,success,fail){
										var err=true;
										$.ajax({
											url: '/api/category/update',
											data: {
												id: subData.id,
												image: url
											},
											type: 'post',
											success: function(data){
												if(data.status){
													err=false;
												}else if(data.error){
													err=data.error;
												}
											},
											complete: function(){
												if(!err){
													__self.deepText('已设置');
													subData.image=url;
													success();
												}else{
													fail(err);
												}
											}
										});
									}
								});
							}
						});
						
						if(!self.mobile){
							menus.push({
								key: 'rename',
								name: '点击这里重命名',
								input: true,
								oninput: function(text){
									this.loading();
									var __self=this;
									var err=true;
									$.ajax({
										url: '/api/category/update',
										data: {
											name: text,
											id: parentid
										},
										type: 'post',
										success: function(data){
											if(data.status){
												
												err=false;
												d.name=text;
												item.text(text);
												
												menu.title&&menu.title(text);
											}
										},
										complete: $.proxy(function(){
											if(err){
												alert('重命名失败');
											}
											__self.reset();
										},this)
									});
								},
								onclick: function(){
									this.input();
								}
							});
							
							menus.push({
								key: 'remove',
								name: '删除该二级导航',
								cls: 'remove',
								onclick: function(){
									if(confirm('删除该导航会删除导航下的所有内容')){
										var err=true;
										
										if(self.mobile){
											menu.hide();
										}else{
											parent.remove();
										}
										item.loading();
										
										$.ajax({
											url: '/api/category/remove',
											data: {
												id: parentid
											},
											success: function(data){
												if(data.status){
													err=false;
													item.remove();
												}
											},
											complete: function(){
												if(err){
													alert('删除失败');
													item.loaded();
												}
											}
										});
									}
								}
							});
						}
						
						menus.push({description:true,text:'Articles'});
						menus.push({
							name: '+ 增加文章',
							onclick: function(){
								self.showArticle(false,this,parentid,menu);
							}
						});
						
						$.each(data||[],function(){
							var d=this;
							menus.push(self.newArticle(d,parentid,menu));
						});
						
						return menus;
					}
				}
			});
			
			if(this.mobile){
				menu.show();
			}
		},
		
		newArticle: function(d,parentid,menu){
			var self=this;
			return {
				name: d.title,
				onclick: function(){
					self.showArticle(d,this,parentid,menu);
				},
				scrollMenu: [{
					name: '删除',
					cls: 'remove',
					remove: function(){
						if(window.confirm('点击确认将会删除这篇文章')){
							var __self=this;
							__self.loading();
							
							var err=true;
							
							$.ajax({
								url: '/api/article/remove',
								data: {
									id: d.id
								},
								success: $.proxy(function(data){
									if(data.status){
										err=false;
										__self.remove();
									}
								},this),
								complete: $.proxy(function(){
									if(err){
										alert('删除失败');
										__self.loaded();
									}
								},this)
							});
						}
					}
				}]
			};
		},
		
		showArticle: function(data,item,parentid,menu){
			var self=this;
			new Article({
				trigger: item,
				category: parentid,
				data: data,
				onsave: function(newdata){
					if(data&&data.id){
						$.extend(data,newdata);
						item.text(data.title);
					}else{
						menu.insertAfter(self.newArticle(newdata,parentid,menu),item);
					}
				},
				onremove: function(){
					item.remove();
				}
			});
		}
	};
	
	return settings.init();
});