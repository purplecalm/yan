/*
$(function(){
	var url=[];
	url.push('<html><title>Hello, world.</title><body><h1>Hello, world.</h1></body></html>');
	
	var iframe=$('<iframe src="javascript:\''+url.join('')+'\'"></iframe>');
	
	iframe.bind('load',function(){
		$('<div>Loaded</div>').appendTo(document.body);
	});
	
	iframe.appendTo(document.body);
});*/

/**
 *	Q HtmlElement Editor
 *
 *	@comment:	1.下面使用的不少的延迟触发事件, 是为了防止UI thread的阻塞
 *				2.Editor中有大量的range操作, range的操作IE和其他浏览器是不同的
 *				3.Editor中默认的execCommand的命令产生的效果mozilla和其他浏览器是不同的
 *
 **/
define(['/js/common/jquery-2.0.0.min.js','/js/common/editor/browser.js'],function(){
	var config={
		element: false,
		aclist: "ul,ol,li,dl,dd,dt,a,span,font,p,div,br,img",
		discard: "style,script,meta",
		toolbar: "font-size,color,bold,italic,underline,|,orderlist,unorderlist,link,|,justify-left,justify-center,justify-right",
		maxHistory: 100
	};
	
	
	//历史管理器
	var Steps=function(cfg){
		this.config=$.extend({
			max: 100
		},cfg);
	}
	
	$.extend(Steps.prototype,{
		undo: function(){
			if(this.flag<1){
				return false;
			}
			
			var snapshot=this.snapshot();
			
			//console.log(this.steps.length,this.flag,this.steps[this.flag-1].content+'\n'+snapshot.content);
			if(this.fixiecontent(this.steps[this.flag-1].content)==this.fixiecontent(snapshot.content)){
				this.steps[this.flag-1].range=snapshot.range;
			}else{
				this.save();
			}
			
			if(this.flag==1){
				return false;
			}
			
			this.flag--;
			return this.steps[this.flag-1];
		},
		
		fixiecontent: function(str){
			return $.browser.msie?str.replace(/[ \n\r]/g,''):str;
		},
		
		redo: function(){
		
			var snapshot=this.snapshot();
			/*
			console.log(this.steps.length,this.flag);
			console.log(this.steps[this.flag-1].content.length,this.steps[this.flag-1].content.replace(/[\n\r]/g,''));
			console.log(snapshot.content.length,snapshot.content.replace(/[\n\r]/g,''));
			
			var ss=[];
			for( var i=0; i<this.steps[this.flag-1].content.length; i++){
				ss.push(this.steps[this.flag-1].content.charAt(i));
			}
			console.log(ss.length,':',ss);
			
			ss=[];
			for( var i=0; i<snapshot.content.length; i++){
				ss.push(snapshot.content.charAt(i));
			}
			console.log(ss.length,':',ss);
			
			console.log(this.steps[this.flag-1].content==snapshot.content,$.trim(this.steps[this.flag-1].content.replace(/[\n\r]/g,''))==$.trim(snapshot.content.replace(/[\n\r]/g,'')));
			*/
			
			if(this.steps.length>this.flag&&(this.fixiecontent(this.steps[this.flag-1].content)==this.fixiecontent(snapshot.content))){
				this.flag++;
				return this.steps[this.flag-1];
			}
			
			return false;
		},
		
		save: function(){
			if(this.steps.length>this.flag){
				this.steps=this.steps.slice(0,this.flag);
			}
			this.flag=this.steps.push(this.snapshot());
			
			while(this.flag>this.config.max){
				this.steps.shift();
				this.flag=this.steps.length;
			}
			
			if(this.config.onsave){
				this.config.onsave();
			}
		},
		
		autosave: function(){
			var snapshot=this.snapshot();
			if(this.fixiecontent(this.steps[this.flag-1].content)==this.fixiecontent(snapshot.content)){
				this.steps[this.flag-1].range=snapshot.range;
				return;
			}
			
			if(this.autosavehandler){
				clearTimeout(this.autosavehandler);
			}
			
			this.autosavehandler=setTimeout($.proxy(this._autosave,this),600);
		},
		
		_autosave: function(){
			var snapshot=this.snapshot();
			if(this.fixiecontent(this.steps[this.flag-1].content)==this.fixiecontent(snapshot.content)){
				this.steps[this.flag-1].range=snapshot.range;
				return;
			}
			this.save();
			this.autosavehandler=false;
		},
		
		autosavehandler: false,
		
		steps: [],
		
		flag: 0,
		
		clean: function(){
			this.steps=[];
			this.flag=0;
		},
		
		snapshot: function(){
		}
	});
	
	
	/**
	 *
	 *
	 *
	 *
	 *
	 **/
	
	var counter=0;
	var qeditor=function(dom,cfg){
		this.config=$.extend({
			shortcuts: {
				
			}
		},config,cfg);
		
		this.key=$(dom);
		this.id=counter++;
		
		this.init();
	};
	
	qeditor.cache={};
	
	qeditor.trigger=function(arg,eve){
		$(arg).trigger(eve);
	}
	
	$.extend(qeditor.prototype,{
		init: function(){
		
			this.build();
		
			this.initShortcuts();
			
			this.initEvents();
			
			this.initSteps();
			
			this.initToolbar();

			if(this.config.element){
				this.load(this.config.element);
			}
		},
		
		geturl: function(str){
		
			var url=[];
			url.push('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">');
			url.push('<html>','<head>');
			url.push('<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />');
			url.push('<title>QEditor</title>');
			url.push('<style type="text/css"> * { margin: 0; padding: 0; } html,body{height: 100%;}</style>');
			url.push('<link rel="stylesheet" type="text/css" href="/css/iframe-editor-1.0.css" />');
			url.push('</head>','<body class="editormode"');
			
			if($.browser.msie&&$.browser.version<9){
				url.push(' onpaste="parent.$.Editor.trigger(document,\'paste\');return true;"');
				url.push(' oncut="parent.$.Editor.trigger(document,\'cut\');return true;"');
			}
			
			url.push('>'+str+'</body>','</html>');
			
			return url.join('');
		},
		
		build: function(){
			var str=this.key.val();
			
			qeditor.cache[this.id]=this.geturl(str);
			
			var iframe=$('<iframe frameBorder="0" src="javascript:parent.$.Editor.cache['+this.id+']"></iframe>');
			
			var webkitfirstload=$.browser.webkit;
			//webkit内核下会load两次
			
			var isLoad=false;
			
			iframe.bind("load",$.proxy(function(){
				if(webkitfirstload){
					webkitfirstload=false;
					return;
				}
				
				this.win=iframe[0].contentWindow;
				this.doc=this.win.document;
				this.dom=$(this.doc.body);
				
				this.body=this.doc.body;
				this.body.designMode="on";
				this.body.contentEditable="true";
				
				setTimeout($.proxy(function(){
					this.initIframeEvents();
					this.initTools();
					
					if(isLoad){
						return;
					}
					
					isLoad=true;
					this.trigger("editor-load");
				},this),15);
			},this));
			
			this.frame=iframe;	
			
			this.autowidth=(this.key.outerWidth()-10)||'auto';
			this.autoheight=(this.key.outerHeight()-10)||'auto';
			this.frame.height((this.autoheight-46)||'auto');
			this.panel=$('<div class="qeditor"></div>').width(this.autowidth).height(this.autoheight);;
			this.frame.appendTo(this.panel);

			this.panel.insertBefore(this.key);

			this.key.hide();
		},
		
		initShortcuts: function(){
			var newScs={
				"Z": function(){
					this.actions.undo();
				},
				
				"Y": function(){
					this.actions.redo();
				},
				"B": function(){
					this.actions.bold();
				},
				
				"M": function(){
					this.actions.center();
				},
				
				"L": function(){
					this.actions.left();
				},
				
				"R": function(){
					this.actions.right();
				}
			};
			for( var method in this.config.shortcuts){
				if(method.length==1&&method.toUpperCase()!=method){
					newScs[method.toUpperCase()]=this.config.shortcuts[method];
				}
			}
			
			this.config.shortcuts=$.extend(newScs,this.config.shortcuts);
		},
		
		initTools: function(){
			if(!this._div){
				this._div=$(this.doc.createElement("div"));
			}
			
			this.range.win=this.win;
			this.range.doc=this.doc;
			this.range.body=this.body;
			this.range.dom=this.dom;
		},
		
		initToolbar: function(){
			this.toolbar=new toolbar({items:this.config.toolbar,callback: $.proxy(function(handler){
				handler(this);
			},this)});
			
			this.toolbar.insertBefore(this.frame);
			
			this.toolbar.load();
			//console.log(this.toolbar);
		},
		
		sync: function(){
			this.key.val(this.val());
		},
		
		initSteps: function(){
			this.steps=new Steps({max:this.config.maxHistory,onsave:$.proxy(this.sync,this)});
			
			this.bind("editor-load",$.proxy(function(){
				this.focus();
				this.steps.clean();
				this.steps.save();
			},this));
			
			if($.browser.msie){
				this.steps.snapshot=$.proxy(function(){
				
					var r=this.doc.selection.createRange();
					
					if(r.item&&!r.getBookmark){
						var el=r.item();
						/*
						var flag=$('<em style="display:none"></em>');
						flag.insertAfter(el);
						*/
						
						var range=this.doc.body.createTextRange();
						range.moveToElementText(el.parentNode);

						range.moveStart('character',$(el.parentNode).text().length);
						range.moveEnd('character',0);

						r=range;
					}
					
					return {
						content: this.dom.html(),
						range: r.getBookmark()
					};
				},this);
				
				this.steps.use=$.proxy(function(s){
					this.dom.html(s.content);
					var r=this.doc.selection.createRange();
					r.moveToBookmark(s.range);
					r.select();
					
					this.sync();					
				},this);
				
			}else{
			
				var getPath=function(dom,el){
					var p=[];
					var pel=$(el)[0], top=$(dom)[0];
					
					while(pel!=top&&pel){
						var ns=pel.parentNode.childNodes;
						for( var i=0; i<ns.length; i++){
							if(ns[i]==pel){
								p.unshift(i);
								break;
							}
						}
						pel=pel.parentNode;
					}
					return p;
				}
				
				var getDom=function(dom,path){
					var pel=$(dom)[0];
					
					for( var i=0; i<path.length&&pel.childNodes; i++){
						pel=pel.childNodes[path[i]];
					}
					
					return pel;
				}
			
				this.steps.snapshot=$.proxy(function(){
					var sc=this.win.getSelection();
					
					if(sc.anchorNode){
						var r=this.win.getSelection().getRangeAt(0);
						try{
							var pr={endOffset: r.endOffset, endContainer: getPath(this.dom,r.endContainer)};
						}catch(e){
							var pr={endOffset: 0,endContainer:this.dom[0]};
						}
					
						var p=r.startContainer;
						while(p!=this.dom[0]&&(p=p.parentNode));
						
						if(!p){
							this.win.getSelection().removeAllRanges();
							pr.startOffset=pr.endOffset;
							pr.startContainer=pr.endContainer;
						}else{
							pr.startOffset=r.startOffset;
							pr.startContainer=getPath(this.dom,r.startContainer);
						}
					}else{
						var pr={
							endOffset: 0,
							startOffset: 0,
							endContainer: this.dom[0],
							startContainer: this.dom[0]
						};
					}
					
					return {
						content: this.dom.html(),
						range: pr
					};
				},this);
				
				this.steps.use=$.proxy(function(s){
					this.dom.html(s.content);
					
					this.dom.focus();
					
					var r=s.range, range=this.doc.createRange();
					range.setStart(getDom(this.dom,r.startContainer),r.startOffset);
					range.setEnd(getDom(this.dom,r.endContainer),r.endOffset);
					
					this.win.getSelection().removeAllRanges();
					this.win.getSelection().addRange(range);
					
					this.sync();
				},this);
			}
			
			this.bind("editor-keydown",$.proxy(function(_e,eve){
				
				//Ctrl,windows,Alt,Shift,Caps Lock,F1-F12
				var ignore=[17,91,18,16,20,112,113,114,115,116,117,118,119,120,121,122,123,45];
				
				for( var i=0; i<ignore.length; i++ ){
					if(ignore[i]==eve.keyCode){
						return;
					}
				}
				
				//	[ paste | cut | undo | redo ]
				if((eve.keyCode==86||eve.keyCode==88||eve.keyCode==89||eve.keyCode==90)&&eve.ctrlKey){
					return;
				}
				this.steps.autosave();
			},this));
			
			this.bind("editor-mousedown",$.proxy(function(_e,eve){
				this.steps.autosave();
			},this));
			
			this.bind("editor-mouseup",$.proxy(function(_e,eve){
				this.steps.autosave();
			},this));
		},
		
		val: function(arg){
			if(typeof arg=="undefined"){
				return this.dom.html();
			}else{
				this.dom.html(arg);
				this.steps.autosave();
				this.sync();
				return this;
			}
		},
		
		fullscreen: function(){
			var isFullscreen=false;
			var self=this;
			var currentSt=0;
				
			var placehoder=$('<div style="display: none"></div>');
			
			var listenResize=function(){
				if(!isFullscreen){
					isFullscreen=false;
					$(window).unbind('resize',listenResize);
					return;
				}
				
				var width=$(window).width();
				var height=$(window).height();
				
				self.panel.css('position','absolute');
				self.panel.height(height-10);
				self.frame.height(height-55);
				self.panel.width(width);
				self.panel.css('left',0);
				self.panel.css('top',0);
				
				$(document.body).css('overflow','hidden');
			}
			
			this.fullscreen=function(){
				qeditor.cache[this.id]=this.geturl(this.val());
				if(isFullscreen){
					isFullscreen=false;
					
					this.panel.insertBefore(placehoder);
					
					placehoder.remove();
					
					$(window).unbind('resize',listenResize);
					
					this.panel.css('position','static');
					this.panel.height('auto');
					this.frame.height('auto');
					this.panel.width(this.autowidth);
					
					$(document.body).css('overflow','auto');
					$(window).scrollTop(currentSt);
				}else{
				
					currentSt=$(window).scrollTop();
				
					placehoder.insertBefore(this.panel);
					
					this.panel.appendTo(document.body);
					
					$(window).bind('resize',listenResize);
					
					isFullscreen=true;
					
					$(window).scrollTop(0);
					
					listenResize();
				}
			}
			
			this.fullscreen();
		},
		
		initEvents: function(){
			var eve=$("<div></div>");
			
			this.bind=function(evename,func){
				eve.bind(evename,func);
				return this;
			}
			
			this.unbind=function(evename,func){
				eve.unbind(evename,func);
				return this;
			}
			
			this.trigger=function(evename,args){
				eve.trigger(evename,args);
				return this;
			}
			
			this.shortcut=$.proxy(function(eve){
			
				if(eve.ctrlKey){
					var key=String.fromCharCode(eve.keyCode);
					
					if(this.config.shortcuts[key]){
					
						try{
							this.config.shortcuts[key].call(this);
						}catch(e){}
					
						eve.preventDefault();
					}
				}
			},this);
			
			this.actions={
				keyup: $.proxy(function(e){
					//tools.fixContent(this.dom,this.config.aclist,this.config.discard);
					
					if(e.ctrlKey&&e.keyCode==86){
						//$(this.doc).trigger('paste');
						return;
					}
					
					if(e.ctrlKey&&e.keyCode==88){
						//$(this.doc).trigger('cut');
						return;
					}
					
					setTimeout($.proxy(function(){
						this.trigger("editor-keyup",[eve]);
					},this),15);
				},this),
				
				keydown: $.proxy(function(eve){
					if(eve.keyCode==9){
						eve.preventDefault();
						eve.stopPropagation();
						
						var t=this.getCurrentNode();
						
						try{
							while(t!=this.dom[0]&&t.tagName!="BODY"&&t.tagName!="LI"&&t.tagName!="UL"&&t.tagName!="OL"){
								t=t.parentNode;
							};
							if(t&&t.tagName=="UL"||t.tagName=="OL"||t.tagName=="LI"){
								this.exec("indent");
							}else{
								this.insertHTML("<span>&nbsp;&nbsp; &nbsp;</span>");
							}
						}catch(e){
						}
					}
					
					this.shortcut(eve);
					
					setTimeout($.proxy(function(){
						this.trigger("editor-keydown",[eve]);
					},this),15);
				},this),
				
				mousedown: $.proxy(function(eve){
					setTimeout($.proxy(function(){
						this.trigger("editor-mousedown",[eve]);
					},this),15);
				},this),
				
				mouseup: $.proxy(function(eve){
					
					setTimeout($.proxy(function(){
						this.trigger("editor-mouseup",[eve]);
					},this),15);
				},this),
				
				focus: $.proxy(function(eve){
					this.editing=true;
					
					setTimeout($.proxy(function(){
						this.trigger("editor-focus",[eve]);
					},this),15);
				},this),
				
				blur: $.proxy(function(eve){
					this.editing=false;
					
					setTimeout($.proxy(function(){
						this.trigger("editor-blur",[eve]);
					},this),15);
				},this),
				
				paste: $.proxy(function(){
					//做延迟为了防止UI thread被阻塞
					setTimeout($.proxy(function(){
						tools.fixContent(this.dom,this.config.aclist,this.config.discard);
						
						this.steps.save();
					},this),15);
				},this),
				
				cut: $.proxy(function(){
					setTimeout($.proxy(function(){
						this.steps.save();
					},this),15);
				},this),
				
				undo: $.proxy(function(){
					var s=this.steps.undo();
					if(s===false){
						return;
					}
					
					setTimeout($.proxy(function(){
						this.steps.use(s);
					},this),15);
				},this),
				
				redo: $.proxy(function(){
					var s=this.steps.redo();
					if(s===false){
						return;
					}
					
					setTimeout($.proxy(function(){
						this.steps.use(s);
					},this),15);
				},this),
				
				italic: $.proxy(function(){
					if(!this.editing||!this.getSelectionText()){
						return;
					}
					
					var els=this.range2dom();
					
					var isItalic=/^(oblique|italic)$/i,allitalic=true;
					
					for( var i=0; i<els.length; i++){
						var item=$(els[i]);
						
						if(!isItalic.test(item.css("font-style"))){
							allitalic=false;
							break;
						}
					}
					
					if(allitalic){
						this.setStyle({'font-style':'normal'},els);
					}else{
						this.setStyle({'font-style':'italic'},els);
					}
					
					this.steps.autosave();
				},this),
				
				underline: $.proxy(function(){
					if(!this.editing||!this.getSelectionText()){
						return;
					}
					
					var els=this.range2dom();
					var allunderline=true;
					
					for( var i=0; i<els.length; i++){
						var item=$(els[i]);
						
						if(item.css("text-decoration")!="underline"){
							allunderline=false;
							break;
						}
					}
					
					if(allunderline){
						this.setStyle({'text-decoration':'none'},els);
					}else{
						this.setStyle({'text-decoration':'underline'},els);
					}
					
					this.steps.autosave();
				},this),
				
				bold: $.proxy(function(){
					if(!this.editing||!this.getSelectionText()){
						return;
					}
					
					var els=this.range2dom();
					var isBold=/^(700|800|900|bold|bolder)$/i,allbold=true;
					
					for( var i=0; i<els.length; i++){
						var item=$(els[i]);
						
						if(!isBold.test(item.css("font-weight"))){
							allbold=false;
							break;
						}
					}
					
					if(allbold){
						this.setStyle({"font-weight":"normal"},els);
					}else{
						this.setStyle({"font-weight":"bold"},els);
					}
					
					this.steps.autosave();
					
				
					// 被废弃的方法 ( 尝试使用range内的text来判断是否全部都是bold  faild )
					/*
					this._div.html("");
					
					if($.browser.msie){
						this._div.append($(this.doc.selection.createRange().htmlText));
					}else{
						this._div.append(this.win.getSelection().getRangeAt(0).cloneContents());
					}
					
					var els=this._div.find("*");
					if(!els.length){
						if($.browser.msie){
							els=[this.doc.selection.createRange().parentElement()];
						}else{
							els=[this.win.getSelection().getRangeAt(0).commonAncestorContainer.parentElement];
						}
					}
					
					var isBold=/^(700|800|900|bold|bolder)$/i, allbold=true;
					console.log(this._div.html());
					for( var i=0; i<els.length; i++){
						
						$(els[i]).contents().each(function(){
							if(this.nodeType==3&&$(this).text()===""){
								$(this).remove();
							}
						});
					
						if(els[i].childNodes.length==1&&els[i].firstChild.nodeType==1){
							continue;
						}
					
						if(!isBold.test($(els[i]).css("font-weight"))){
							console.log(els[i].tagName);
							console.log(this._div.html());
							allbold=false;
							break;
						}
					}
					
					if(allbold){
						console.log("normal");
						this.setStyle({"font-weight":"normal"});
					}else{
						console.log("bold");
						this.setStyle({"font-weight":"bold"});
					}
					*/
					
					//会生成b or strong element (方法被废弃)
					/*
					this.exec("Bold");
					if(!$.browser.mozilla){
						setTimeout($.proxy(function(){
							var els=this.dom.find("b,strong").each(function(){
								var nel=$('<span style="font-weight: bold;"></span>');
								while(this.firstChild){
									nel.append(this.firstChild);
								}
								$(this).replaceWith(nel);
							});
						},this),15);
					}*/
				},this),
				
				color: $.proxy(function(color){
					this.exec("foreColor",color);
					this.steps.autosave();
				},this),
				
				orderlist: $.proxy(function(){
					this.exec("InsertOrderedList");
					this.steps.autosave();
				},this),
				
				unorderlist: $.proxy(function(){
					this.exec("InsertUnorderedList");
					this.steps.autosave();
				},this),
				
				link: $.proxy(function(url,target){
					if(!this.editing){
						return;
					}
					
					var els;
					
					if($.trim(this.getSelectionText())||this.getSelectionImagesLength()){
						var temp=(new Date()).valueOf().toString();
						this.exec("CreateLink",temp);
						
						els=this.dom.find('[href="'+temp+'"]').attr("href",url);
						
						for( var i=els.length-1; i>=0; i--){
							if(i){
								if(els[i].previousSibling==els[i-1]){
									$(els[i-1]).html($(els[i-1]).html()+$(els[i]).html());
									$(els[i]).remove();
									els.splice(i,1);
								}
							}
						}
						
					}else{
						this._div.html("");
						this._div.append(this.doc.createTextNode(url));
						this.insertHTML('<a href="'+encodeURI(url)+'" -tempadded-="a">'+this._div.html()+'</a>');
						this._div.html("");
						
						els=this.dom.find('[-tempadded-="a"]').removeAttr("-tempadded-");
					}
					
					if(target){
						els.attr("target",target);
					}
					
					els.each(function(){
						if(this.parentNode.firstChild==this.parentNode.lastChild&&this.parentNode.tagName=="SPAN"){
							var p=$(this.parentNode);
							p.replaceWith(this);
							$(this).attr("style",p.attr("style"));
							p.remove();
						}
						
						if(this.childNodes.length==1&&this.firstChild.nodeType==1){
							while(this.firstChild.firstChild){
								this.appendChild(this.firstChild.firstChild);
							}
							
							$(this).attr("style",$(this.firstChild).remove().attr("style"));
						}
					});
					
					this.selectNodes(els);
					this.steps.autosave();
				},this),
				
				unlink: $.proxy(function(){
					this.exec("UnLink");
					this.steps.autosave();
				},this),
				
				center: $.proxy(function(){
					this.exec("JustifyCenter");
					
					this.dom.find('[align="center"]').css('text-align','center').removeAttr('align');
					
					this.steps.autosave();
				},this),
				
				left: $.proxy(function(){
					this.exec("JustifyLeft");
					this.dom.find('[align="left"]').css('text-align','left').removeAttr('align');
					this.steps.autosave();
				},this),
				
				right: $.proxy(function(){
					this.exec("JustifyRight");
					this.dom.find('[align="right"]').css('text-align','right').removeAttr('align');
					this.steps.autosave();
				},this)
			}
		},
		
		initIframeEvents: function(){
			this.editing=true;
			var p=$(this.doc);

			p.bind("keyup",this.actions.keyup);
			p.bind("keydown",this.actions.keydown);
			p.bind("mousedown",this.actions.mousedown);
			p.bind("mouseup",this.actions.mouseup);
			p.bind("paste",this.actions.paste);
			p.bind("cut",this.actions.cut);
			
			p.bind("focus",this.actions.focus);
			p.bind("blur",this.actions.blur);
		},
		
		isLoad: function(){
			return !!this.dom;
		},
		
		buzy: function(){
			return this.isLoad();
		},
		
		load: function(el){
		
			if(this.dom){
			
				if(this.dom[0]==$(el)[0]){
					return;
				}
			
				this.unload();
				setTimeout($.proxy(function(){
					this.load(el);
				},this),15);
				return;
			}
			
			if(!$(el).length){
				return false;
			}
		
			this.key=$(el);
			
			this.build();
			
			//p.attr("contenteditable","true");
			
			//p.find("p:eq(1)").attr("contenteditable","false");

			//this.toolbar.load();
			//this.toolbar.xy(this.dom.offset());
			
			setTimeout($.proxy(function(){
				this.trigger("editor-load");
			},this),15);
		},
		
		unload: function(el){
		
			if(!this.dom){
				return;
			}
			
			//this.toolbar.unload();
		
			setTimeout($.proxy(function(){
				this.trigger("editor-unload");
			},this),15);
			
			var p=this.dom;
			
			p.attr("contenteditable","false");
			p.blur();
			
			p.unbind("keyup",this.actions.keyup);
			p.unbind("keydown",this.actions.keydown);
			p.unbind("mousedown",this.actions.mousedown);
			p.unbind("mouseup",this.actions.mouseup);
			p.unbind("paste",this.actions.paste);
			p.unbind("cut",this.actions.cut);
			
			p.unbind("focus",this.actions.focus);
			p.unbind("blur",this.actions.blur);
			
			this.dom=false;
			
			this.steps.clean();
		},
		
		save: function(){
		},
		
		focus: function(){
			this.frame.focus();
			this.actions.focus();
		},
		
		insertHTML: function(htmlText){
			this.focus();
			
			if($.browser.msie){
				var selection=this.getSelection();
				
				var doc=false;
				if(selection.type=="Control"){
					doc=selection.createRange().item(0).ownerDocument;
				}else{
					doc=selection.createRange().parentElement().ownerDocument;
				}
				
				if(doc!=this.doc){
					var range=this.doc.body.createTextRange();
					range.moveToElementText(this.doc.body);

					range.moveStart('character',$(this.doc.body).html().length+1);
					range.moveEnd('character',0);
					range.select();
				}
				
				this.getSelection().createRange().pasteHTML(htmlText);
			}else{
				this.doc.execCommand("InsertHTML",false,htmlText);
			}
			
			this.steps.autosave();
		},
		
		getCurrentNode: function(){
			var node=false;
			try{
				if(this.doc.createRange){
					node=this.win.getSelection().focusNode;
					if(node&&node.nodeType==3){
						node=node.parentNode;
					}
				}else if(this.doc.body.createTextRange){
					node=this.doc.selection.type=="Control"?this.doc.selection.createRange().item(0):this.doc.selection.createRange().parentElement();
				}
			}catch(e){
				node=this.body;
			}
				
			return node;
		},
		
		getSelection: function(){
			if(this.doc.selection){
				return this.doc.selection;
			}else{
				return this.win.getSelection();
			}
		},
		
		getSelectionText: function(){	
			if(this.doc.createRange){
				return this.win.getSelection().toString();
			}else if(this.doc.body.createTextRange){
				return this.doc.selection.createRange().text;
			}
		},
		
		getSelectionImagesLength: function(){
			this._div.html("");
			
			if($.browser.msie){
				if(this.doc.selection.type=="Control"){
					var items=this.doc.selection.createRange();
					var l=0;
					for( var i=0; i<items.length; i++){
						if(items.item(i).tagName=="IMG"){
							l++;
						}
					}
					return l;
				}else{
					this._div.html(this.doc.selection.createRange().htmlText);
				}
			}else{
				this._div.append(this.win.getSelection().rangeCount?this.win.getSelection().getRangeAt(0).cloneContents():'');
			}
			
			//alert(this._div.html());
			
			return this._div.find('img').length;
			
		},
		
		selectNodes: function(els){
			if($.browser.msie){
				var range=this.doc.body.createTextRange();
				range.moveToElementText($(els[0])[0]);
				
				if(els.length>1){
					var nr=this.doc.body.createTextRange();
					nr.moveToElementText($(els[els.length-1])[0]);
					range.setEndPoint("EndToEnd",nr);
				}
				range.select();
			}else{
				this.win.getSelection().removeAllRanges();
				
				if(els.length>1){
					var temp=this.doc.createRange();
					temp.setStartBefore($(els[0])[0]);
					temp.setEndAfter($(els[els.length-1])[0]);
					this.win.getSelection().addRange(temp);
				}else{
					var temp=this.doc.createRange();
					temp.selectNode($(els[0])[0]);
					this.win.getSelection().addRange(temp);
				}
			}
		},
		
		range: function(){
			var _range=false;
			
			var getRange=function(){
				if($.browser.msie){
					return this.doc.selection;
				}else{
					return this.win.getSelection();
				}
			}
			
			return {
				cache: function(){
					var r=getRange.call(this);
					if($.browser.msie){
						_range=r.createRange();
					}else{
						/*
						var _s=window.getSelection();
						
						_range={snode:_s.anchorNode,soffset:_s.anchorOffset,enode:_s.focusNode,eoffset:_s.focusOffset};
						*/
						
						if(!r||!r.rangeCount){
							_range=this.doc.createRange();
							_range.setStart(this.dom[0],0);
							_range.setEnd(this.dom[0],0);
						}else{
							_range=r.getRangeAt(0);
						}
					}
				},
				
				use: function(){
					if(_range){
						if($.browser.msie){
							_range.select();
						}else{
							var r=getRange.call(this);
							r.removeAllRanges();
							r.addRange(_range);
						}
					}
				}
			}
		}(),
		
		range2dom: function(){
			if($.browser.msie){
				if(!this.doc.selection.createRange().htmlText){
					return [];
				}
			}else{
				if(!this.win.getSelection().toString()){
					return [];
				}
			}
			
			/*
			if($.browser.mozilla){
				this.exec("strikeThrough");
			}else{
				this.exec("FontName","purple");
			}
			*/
			this.exec("FontName","purple");

			var doms=false, els=[], doc=this.doc;
			
			if((doms=this.dom.find('font[face="purple"]')).length){
				
				doms.each(function(){
					var el=$(this);
					
					if(this.parentNode.childNodes.length==1){
					
						if(this.parentNode.tagName=="BODY"&&(this.childNodes.length>1||this.firstChild.nodeType==3)){
							var nel=$(doc.createElement('span'));
							while(this.firstChild){
								nel.append(this.firstChild);
							}
							
							el.replaceWith(nel);
							el.remove();
							el=nel;
						}else{
							var nel=el.parent();
							var tpels=el.children();
							while(this.firstChild){
								nel.append(this.firstChild);
							}
							el.remove();
							el=nel;
							
							if(nel[0].tagName=="BODY"){
								el=tpels;
							}
						}
					}else{
					
						if(this.childNodes.length==1&&this.firstChild.nodeType==1){
							var nel=$(this.firstChild);
							nel.insertBefore(el);
							el.remove();
							el=nel;
						}else{
						
							var nel=$(doc.createElement('span'));
							nel.insertBefore(el);
							
							while(this.firstChild){
								nel.append(this.firstChild);
							}
							
							el.remove();
							el=nel;
						}
					}
					els.push(el[0]);
				});
				return els;
				
			}else{
				doms=this.dom.find("[style]");
				doms.push(this.dom[0]);
				doms.each(function(){
					var el=$(this);
					
					var ss=el.attr("style");
					
					if(/font-family:[\s]*purple/i.test(ss)){
						
						if(/^font-family:[\s]*purple[;]{0,1}$/i.test(ss)){
							el.removeAttr("style");
						}else{
							ss=ss.split(/font-family:[\s]*purple[;]{0,1}/i).join("");
							el.attr("style",ss);
						}
						
						els.push(el);
						//el.css("font-family","inherit");
					}
				});
				
				return els;
			}
			
			return [];
		},
		
		setStyle: function(arg,els){
	
			if(!this.dom){
				return;
			}
			
			if(!els){
				els=this.range2dom();
			}
			
			if(!els.length){
				return;
			}
			
			//els=$.extend(els,$.fn);
		
			//this.exec("RemoveFormat");

			setTimeout($.proxy(function(){
				for( var i=0; i<els.length; i++){
					var el=$(els[i]);
					el.css(arg);							
					el.find("[style]").each(function(){
						var sel=$(this);
						var elss=sel.attr("style");
						
						for( var method in arg ){
							elss=elss.split(new RegExp(method+':[ ]*[#0-9a-zA-Z-]*[;]{0,1}',"i")).join("");
						}
						sel.attr("style",elss);
					});
					
					el.find("span").each(function(){
						if(!this.childNodes.length){
							$(this).remove();
						}
						
						if(!$(this).attr("style")){
							while(this.firstChild){
								this.parentNode.insertBefore(this.firstChild,this);
							}
							
							$(this).remove();
						}
					});
				}
				
				if(els.length==1&&els[0].tagName=="BODY"){
					this.exec("selectAll");
				}else{
					this.selectNodes(els);
				}
			},this),15);
			//this.exec("CreateLink","js-special-url");
			/*
			this.dom.find('[href="js-special-url"]').each(function(){
				var el=$(this);
				
				console.log(el);
				
				var self=$('<span class="specify1"></span>');
				
				while(this.firstChild){
					self.append(this.firstChild);
				}
				
				el.replaceWith(self);
			});*/
		},
		
		exec: function(command,args){
			try{
				this.focus();
				
				if(args){
					this.doc.execCommand(command,false,args);
				}else{
					if($.browser.msie){
						this.doc.execCommand(command);
					}else{
						this.doc.execCommand(command,false,false);
					}
				}
				this.focus();
			}catch(e){
				alert(e.message);
			}
		}
	});
	
	var toolbar=function(cfg){
		this.config=$.extend({
			items: "undo,redo,|,font-size,color,bold,orderlist,unorderlist,|,table,|,pieces",
			callback: function(handler){
				console.log(handler);
			}
		},cfg);
		
		this.init();
	}
	
	$.extend(toolbar.prototype,{
		actions: {
			undo: {
				render: function(){
				},
				
				init: function(){
				},
				
				update: function(dom){
				}
			},
			
			redo: {
				render: function(){
				},
				
				init: function(editor){
				},
				
				update: function(dom){
				}
			},
			
			"font-size": {
				render: function(){
					var html=['<div -qeditor-toolbar-item-="font-size">'];
					html.push('<span>Size</span>');
					html.push('<ul -qeditor-toolbar-menu-="font-size">');
					
					var sizes=[12,14,16,18,20];
					for( var i=0; i<sizes.length; i++){
						html.push('<li -qeditor-menu-item-="'+sizes[i]+'px">'+sizes[i]+'px</li>');
					}
					
					html.push('</ul></div>');
					
					return $(html.join(""));
				},
				
				init: function(editor,el){
					var menu=el.find("[-qeditor-toolbar-menu-]"), items=menu.children();
					var shown=false;
					
					this.regMenu(menu,editor);
										
					var use=function(size){
						menu.hide();
						editor.setStyle({"font-size":size});
					}
					
					el.bind("mousedown",function(e){
										
						if(e.which!=1){
							return;
						}
					
						if(e.target==el[0]||(e.target.tagName=="IMG"&&e.target.parentNode==el[0])||e.target==el.children("span")[0]){
							menu.show();
						}
						
						var size=$(e.target).attr("-qeditor-menu-item-")||$(e.target).parent().attr("-qeditor-menu-item-");
						if(!size){
							return;
						}
						
						use(size);
						
						return false;
					});
					
				},
				
				update: function(el){
					var size=this.dom.find('[-qeditor-toolbar-item-="font-size"] span');
					
					if(el){
						size.html(el.css("font-size"));
					}else{
						size.html("Size");
					}
				}
			},
			
			color: {
				render: function(){
				
					var colors=[
						["000000","444444","666666","999999","CCCCCC","EEEEEE","F3F3F3","FFFFFF"],
						["FF0000","FF9900","FFFF00","00FF00","00FFFF","0000FF","9900FF","FF00FF"],
						[
							["F4CCCC","FCE5CD","FFF2CC","D9EAD3","D0E0E3","CFE2F3","D9D2E9","EAD1DC"],
							["EA9999","F9CB9C","FFE599","B6D7A8","A2C4C9","9FC5E8","B4A7D6","D5A6BD"],
							["E06666","F6B26B","FFD966","93C47D","76A5AF","6FA8DC","8E7CC3","C27BA0"],
							["CC0000","E69138","F1C232","6AA84F","45818E","3D85C6","674EA7","A64D79"],
							["990000","B45F06","BF9000","38761D","134F5C","0B5394","351C75","741B47"],
							["660000","783F04","7F6000","274E13","0C343D","073763","20124D","4C1130"]
						]
					];
				
					var html=['<div -qeditor-toolbar-item-="color">'];
					
					html.push('<div -qeditor-toolbar-menu-="color" style="display: none">');
					for( var i=0; i<colors.length; i++){
						html.push("<ul>");
						
						var cs=colors[i];
						for( var j=0; j<cs.length; j++){
							if(typeof cs[j]=="string"){
								html.push('<li -qeditor-menu-item-="'+cs[j]+'" style="background-color: #'+cs[j]+'"></li>');
							}else{						
								var scs=cs[j];
								for( var k=0; k<scs.length; k++){
									html.push('<li -qeditor-menu-item-="'+scs[k]+'" style="background-color: #'+scs[k]+'"></li>');
								}
							
							}
						}
						
						html.push("</ul>");
					}
					html.push("</div>");
					
					html.push('</div>');
					
					return html.join("");
				},
				
				init: function(editor,el){
					var menu=el.find("[-qeditor-toolbar-menu-]"), items=menu.find("[-qeditor-menu-item-]");
					var shown=false;
					
					this.regMenu(menu,editor);
					
					el.bind("mousedown",function(e){
						
						if(e.target==el[0]||(e.target.tagName=="IMG"&&e.target.parentNode==el[0])){
							menu.show();
						}
						
						if($(e.target).attr("-qeditor-menu-item-")||(e.target.tagName=="IMG"&&$(e.target.parentNode).attr("-qeditor-menu-item-"))){
							e.preventDefault();
							var color="#"+($(e.target).attr("-qeditor-menu-item-")||$(e.target.parentNode).attr("-qeditor-menu-item-"));
							editor.setStyle({"color":color});
							menu.hide();
							/*
							setTimeout(function(){
								//editor.actions.color(color);
								editor.setStyle({"color":color});
							},30);*/
						}
					});
				}
			},
			
			bold: {
				render: function(){
					return $('<div -qeditor-toolbar-item-="bold"></div>');
				},
				
				init: function(editor,el){
					el.bind("click",editor.actions.bold);
					/*
					this.dom.find('[-qeditor-toolbar-item-="bold"]').bind("mousedown",$.proxy(function(e){
						editor.setStyle({"font-weight":"bold"});
					},this));*/
				},
				
				update: function(el){
					if(el&&/^(700|800|900|bold|bolder)$/i.test(el.css("font-weight"))){
						this.dom.find('[-qeditor-toolbar-item-="bold"]').addClass("toolbar-item-active");
					}else{
						this.dom.find('[-qeditor-toolbar-item-="bold"]').removeClass("toolbar-item-active");
					}
				}
			},
			
			underline: {
				render: function(){
					return $('<div -qeditor-toolbar-item-="underline"></div>');
				},
				
				init: function(editor,el){
					el.bind("click",editor.actions.underline);
				}
			},
			
			italic: {
				render: function(){
					return $('<div -qeditor-toolbar-item-="italic"></div>');
				},
				
				init: function(editor,el){
					el.bind("click",editor.actions.italic);
				}
			},
			
			orderlist: {
				render: function(){
					return $('<div -qeditor-toolbar-item-="orderlist"></div>');
				},
				
				init: function(editor,el){
					el.bind("click",editor.actions.orderlist);
				}
			},
			
			unorderlist: {
				render: function(){
					return $('<div -qeditor-toolbar-item-="unorderlist"></div>');
				},
				
				init: function(editor,el){
					el.bind("click",editor.actions.unorderlist);
				}
			},
			
			"justify-left": {
				render: function(){
					return $('<div -qeditor-toolbar-item-="justify-left"></div>');
				},
				
				init: function(editor,el){
					el.bind("click",editor.actions.left);
				}
			},
			
			"justify-center": {
				render: function(){
					return $('<div -qeditor-toolbar-item-="justify-center"></div>');
				},
				
				init: function(editor,el){
					el.bind("click",editor.actions.center);
				}
			},
			
			"justify-right": {
				render: function(){
					return $('<div -qeditor-toolbar-item-="justify-right"></div>');
				},
				
				init: function(editor,el){
					el.bind("click",editor.actions.right);
				}
			},
			
			link: {
				render: function(){
					var html=['<div -qeditor-toolbar-item-="link">']
					
					html.push('<div -qeditor-toolbar-menu-="link" style="display: none">');
					html.push('<input type="text" class="link-text" -qeditor-toolbar-input-="link" -usedefault-="1" />');
					html.push('<label><input type="checkbox" -usedefault-="1"  -qeditor-toolbar-checkbox-="link" />新窗口打开</label>');
					html.push('<button -qeditor-toolbar-button-="link" -usedefault-="1" type="button">Ok</button>');
					html.push('</div>');
					
					html.push('</div>');
					
					return $(html.join(''));
				},
				
				init: function(editor,el){
				
					var menu=el.find('[-qeditor-toolbar-menu-]'), input=menu.find('[-qeditor-toolbar-input-]'), checked=menu.find('[-qeditor-toolbar-checkbox-]'), button=menu.find("button");
					
					var snap;
					this.regMenu(menu,editor,{
						show: function(){
							editor.focus();
							editor.range.cache();
						},
						hide: function(){
							editor.range.use();
							editor.focus();
						}
					});
					
					
					var isLink=function(){
						var range=editor.getSelection();
						var children, p;
						
						if(document.selection){
							if(range.type=="Control"){
								range=range.createRange();
								children=[];
								p=range.item(0);
								for( var i=0; i<range.length; i++){
									children.push(range.item(i));
								}
							}else{
								range=range.createRange();
								children=$("<div>"+range.htmlText+"</div>").contents();
								
								p=range.parentElement();
							}
						}else{
							try{
								range=range.getRangeAt(0);
								children=$(range.cloneContents()).contents();
								p=range.commonAncestorContainer;
							}catch(e){
								return false;
							}
						}
						
						var result=children.length;
						for( var i=0; i<children.length; i++){
							if(children[i].nodeType!=1||children[i].tagName!="A"){
								result=false;
								break;
							}
						}
						
						if(result){
							return true;
						}
						
						if(p.tagName=="A"||$(p).parents("a").length){
							return true;
						}
						
						return false;
					}
					
					el.bind("mousedown",function(e){
					
						if(isLink()){
							editor.actions.unlink();
							return;
						}
						
						if(e.target==el[0]||(e.target.tagName=="IMG"&&e.target.parentNode==el[0])){
							menu.show();
						}
					});
					
					var makelink=function(){
						var str=input.val(), _check=checked[0].checked;
						if($.trim(str)==""){
							return;
						}
						
						menu.hide();
						input.val("");
						checked.attr("checked",false);
						
						setTimeout(function(){
							editor.focus();
							editor.actions.link(str,_check?"_blank":false);//insertHTML('<a href="http://www.baidu.com">www.baidu.com</a>');
						},30);
					};
					
					button.bind("click",makelink);
					input.bind("keydown",function(e){
						if(e.keyCode==13){
							setTimeout(makelink,30);
						}
					});
				
				}
			},
			
			'|': {
				render: function(){
					return $('<div -qeditor-toolbar-item-="split" class="toolbar-split"></div>');
				},
				init: function(){}
			}
		},
		
		regMenu: function(el,editor,callback){
		
			var self=this;
			callback=callback||{};
			el.shown=false;
			el._show=el.show;
			el.show=function(){
				if(el.shown&&editor.editing){
					return;
				}
				
				el._show();
				el.shown=true;
				/*
				if(!self._menushown){
					editor.range.cache();
				}
				*/
				self._menushown=el;
				setTimeout(function(){
					$(document).bind('mousedown',el.hide);
				},15);
				
				if(callback.show){
					callback.show();
				}
			}
			
			el._hide=el.hide;
			el.hide=function(e){
			
				if(!el.shown){
					return;
				}
							
				el._hide();
				el.shown=false;
				
				setTimeout(function(){
					if(el==self._menushown){
						self._menushown=false;
					}
					
					if($.browser.mozilla){
						editor.focus();
					}
					//editor.range.use();
					$(document).unbind('mousedown',el.hide);
				},15);
				
				if(callback.hide){
					callback.hide();
				}
			}
			
			el.bind("mouseenter",function(){
				$(document).unbind('mousedown',el.hide);
			});
			
			el.bind("mouseleave",function(){
				if(el.shown){
					$(document).bind('mousedown',el.hide);
				}
			});
			
			editor.bind('editor-mousedown',el.hide);
		},
		
		render: function(){
			this.dom=$('<div class="qeditor-toolbar" -qeditor-toolbar-="default"></div>');
		},
		
		insertBefore: function(el){
			this.dom.insertBefore(el);
			return this;
		},
		
		add: function(item,key){	
			this.items.push(item);
			
			//$(this.actions[its[i]].render());
			var itemdom=$(item.render()).addClass(key?('toolbar-item-'+key):'').addClass('toolbar-item');
			this.dom.append(itemdom);
			
			itemdom.find('[-qeditor-toolbar-menu-]').each(function(){
				$(this).addClass('toolbar-menu-'+$(this).attr('-qeditor-toolbar-menu-')).addClass('toolbar-menu');
			});
			
			itemdom.find('[-qeditor-menu-item-]').addClass('toolbar-menu-item');
			
			$(item).data('dom',itemdom);
			
			if($.browser.msie){
				itemdom.append($('<img src="http://source.qunar.com/package/icon/iefix.gif" class="iefix" />'));
				
				itemdom.find('[-qeditor-menu-item-]').append($('<img src="http://source.qunar.com/package/icon/iefix.gif" class="iefix" />'));
			}
			
			if(this.loaded){
				this.config.callback($.proxy(function(editor){
					item.init.call(this,editor,itemdom);
				},this));
			}
		},
		
		init: function(){
		
			this.render();
			this.items=[];
			var its=this.config.items.split(",");
			for( var i=0; i<its.length; i++){
				if(this.actions[its[i]]){
					this.add(this.actions[its[i]],its[i]);
				}
			}
			
			var delayUpdate=$.proxy(this.update,this);
			
			this.update=function(){
				//console.log("update");
				setTimeout(delayUpdate,50);
			};
		},
		
		update: function(){
		
			if(!this.focused){
				return;
			}
			var el;
			this.config.callback(function(e){
				el=e.getCurrentNode();
			});
			//console.log(el);
			if(!el){
				return;
			}
			
			for( var i=0; i<this.items.length; i++){
				if(this.items[i].update){
					this.items[i].update.call(this,$(el));
				}
			}
		},
		
		xy: function(pos){
			this.dom.css({left:parseInt(pos.left,10)+"px",top:parseInt(pos.top-50)+"px"});
		},
		
		load: function(){
			//this.dom.appendTo(document.body);
			var editor;
			this.config.callback(function(e){
				editor=e;
			});
			
			for( var i=0; i<this.items.length; i++){
				try{
					this.items[i].init.call(this,editor,$(this.items[i]).data('dom'));
				}catch(e){
				}
			}
			
			this.dom.bind("mousedown",$.proxy(function(e){
				if(!$(e.target).attr("-usedefault-")){
					e.preventDefault();
				}
				
				this.update();
				
			},this));
			
			this.focused=true;
			
			editor.bind("editor-mouseup",this.update);
			editor.bind("editor-keyup",this.update);
			editor.bind("editor-paste",this.update);
			editor.bind("editor-cut",this.update);
			editor.bind("editor-blur",$.proxy(function(){
				this.focused=false;
			},this));
			
			editor.bind("editor-focus",$.proxy(function(){
				this.focused=true;
			},this));
			
			this.loaded=true;
			
			/*
			var self=this;
			this.dom.find("[-qeditor-toolbar-item-]").bind("mousedown",function(e){
				e.preventDefault();
				
				var action=$(this).attr("-qeditor-toolbar-item-");
				
				self.config.callback(self.actions[action].init);
			});
			*/
		},
		
		unload: function(){
			this.dom.remove();
			
			var editor;
			this.config.callback(function(e){
				editor=e;
			});
			
			editor.unbind("editor-mouseup",this.update);
			editor.unbind("editor-keyup",this.update);
			editor.unbind("editor-paste",this.update);
			editor.unbind("editor-cut",this.update);
			
			this.loaded=false;
		}
	});
	
	toolbar.add=function(name,arg){
	
		if(name=="|"){
			config.toolbar+=",|";
			return;
		}
	
		if(typeof name!="string"){
			throw new Error("The tool's name must be string");
		}
		
		if( name.indexOf(',')>-1){
			throw new Error("The tool's name can't has charactor ','");
		}
		
		if( typeof toolbar.prototype.actions[name]=="object" && typeof arg == "undefined"){
			arg=toolbar.prototype.actions[name];
		}
		
		if(typeof arg!="object"||typeof arg.render !="function"||typeof arg.init!="function"){
			throw new Error("The tool's config must be an object, and has 'render' & 'init' method");
		}
		
		toolbar.prototype.actions[name]=arg;
		
		var ts=config.toolbar.split(',');
		ts.push(name);
		
		for( var i=0; i<ts.length-1; i++){
			if(ts[i]==name){
				ts.pop();
				break;
			}
		}
		
		config.toolbar=ts.join(',');
		
	}
	
	qeditor.toolbar=toolbar;
	
	
	var tools={
		fixContent: function(el,aclist,discard){
		
			el.find(discard).remove();
		
			var isMatch;
			if(typeof aclist=="undefined"||aclist===""||aclist===true||aclist=="*"){
				isMatch=/.*/;
			}else{
				isMatch=new RegExp("(^"+aclist.split(",").join("$|^")+"$)","i");
			}
			
			el.find("*").each(function(){
				if(!isMatch.test(this.tagName)){
					if($(this).text()){
						$(this).replaceWith(document.createTextNode($(this).text()));
					}else{
						$(this).remove();
					}
				}else{
					var attrs=[];
					for( var i=0; i<this.attributes.length; i++){
						attrs.push(this.attributes[i].name||this.attributes[i].nodeName);
					}
					
					for( var i=0; i<attrs.length; i++){
						var name=attrs[i];
						if(/(^on+$)|(^clas+$)|(^lang$)|(^id$)/ig.test(name)){
							$(this).removeAttr(name);
						}
					}
					$(this).contents(':not(*)').filter(function(){ return this.nodeType==8; }).remove();
				}
				
			});
			
			el.contents(':not(*)').filter(function(){ return this.nodeType==8; }).remove();
			//el.find("table").attr("contenteditable","false").find("td").attr("contenteditable","true");
		}
	};
	
	$.fn.edit=function(args){
		try{
			var e=new qeditor(this,args);
		}catch(err){
			console.log(err);
		}
		return e;
	}
	
	$.Editor=qeditor;
});