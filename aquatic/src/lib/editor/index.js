//css('editor.css');
define(['../uploader.js','./browser.js','editor'],function(uploader){
	$.Editor.toolbar.add('|');
	
	$.Editor.toolbar.add('image',{
		render: function(){
			var html=['<div class="qeditor-image" -qeditor-toolbar-item-="image">'];
			
			html.push('<div -qeditor-toolbar-menu-="image" style="display: none">');
			html.push('<ul class="qeditor-toolbar-tab">','<li class="current" item="tab">本地上传</li>','<li item="tab">远程文件</li>','</ul>');
			
			html.push('<div class="qeditor-tab-panel" item="panel">');
			/*
			html.push('<input type="file" -qeditor-toolbar-input-="image-file" -usedefault-="1" accept=".jpg,.jpeg,.png" />');
			html.push('<button -qeditor-toolbar-button-="upload" -usedefault-="1" type="button">确定</button>');
			*/
			html.push('<div class="qeditor-uploader">点击这里上传图片</div>');
			html.push('</div>');
			
			html.push('<div class="qeditor-tab-panel" item="panel" style="display: none">');
			html.push('<input type="text" -qeditor-toolbar-input-="image-url" -usedefault-="1" />');
			html.push('<button -qeditor-toolbar-button-="use-url" -usedefault-="1" type="button">确定</button>');
			html.push('</div>');
			
			html.push('</div>');
			
			html.push('</div>');
			
			return html.join('');
		},
		
		init: function(editor,el){
			var menu=el.find('[-qeditor-toolbar-menu-="image"]');
			
			var uploadbtn=el.find('.qeditor-uploader');
			var fileinput=el.find('[-qeditor-toolbar-input-="image-file"]');
			
			this.regMenu(menu,editor,{				
				show: function(){
					editor.focus();
					editor.range.cache();
					
					if($.browser.msie){
						fileinput.focus();
					}
				},
				hide: function(){
					editor.range.use();
					editor.focus();
				}
			});
			
			el.bind("mousedown",function(e){
						
				if(e.target==el[0]||(e.target.tagName=="IMG"&&e.target.parentNode==el[0])){
					menu.show();
				}
			});
			
			var tabs=el.find('[item="tab"]');
			var panels=el.find('[item="panel"]');
			
			tabs.each(function(index){
				var tab=$(this);
				tab.bind('click',function(){
				
					tabs.removeClass("current");
					tabs.eq(index).addClass("current");
				
					panels.hide();
					panels.eq(index).show();
				});
			});
			
			fileinput.bind('change',function(e){
				if(!(/\.(jpg|jpeg|png)$/.test(fileinput.val()))){
					fileinput.val('');
				}
			});
			
			uploadbtn.bind('click',function(){
				
				
				uploader.load({
					selector:uploadbtn,
					callback: function(data){
						menu.hide();
						setTimeout(function(){
							editor.insertHTML('<img src="'+data.url+'" />');
						},30);
					}
				});
				/*
				if(!fileinput.val()){
					return;
				}
			
				upload(fileinput,function(data){
					if(!data.error&&data.url){
						menu.hide();
						setTimeout(function(){
							fileinput.val('');
							editor.insertHTML('<img src="'+data.url+'" />');
						},30);
					}
				},editor.config.uploadURL);
				*/
			});
		}
	});
	
	
	
	$.Editor.toolbar.add('flash',{
		render: function(){
			var html=['<div class="qeditor-image" -qeditor-toolbar-item-="flash">'];
			
			html.push('<div -qeditor-toolbar-menu-="flash" style="display: none">');
			
			html.push('<div class="qeditor-flash-panel">');
			html.push('<input type="text" -qeditor-toolbar-input-="flash-code" -usedefault-="1" />');
			html.push('<button -qeditor-toolbar-button-="use" -usedefault-="1" type="button">确定</button>');
			html.push('</div>');
			
			html.push('</div>');
			
			html.push('</div>');
			
			return html.join('');
		},
		
		init: function(editor,el){
			var menu=el.find('[-qeditor-toolbar-menu-="flash"]');
			
			var input=el.find('input'), ok=el.find('button');
			
			this.regMenu(menu,editor,{			
				show: function(){
					editor.focus();
					editor.range.cache();
					
					if($.browser.msie){
						fileinput.focus();
					}
				},
				hide: function(){
					editor.range.use();
					editor.focus();
				}
			});
			
			el.bind("mousedown",function(e){
						
				if(e.target==el[0]||(e.target.tagName=="IMG"&&e.target.parentNode==el[0])){
					menu.show();
				}
			});
			
			ok.bind('click',function(){
				var url=$.trim(input.val());
				if(url){
					menu.hide();
					setTimeout(function(){
						input.val('');
						editor.insertHTML(url);
					},30);
				}
			});
		}
	});
});