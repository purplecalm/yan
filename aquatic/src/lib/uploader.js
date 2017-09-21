define(function(){
	var uploader=function(){
		var dom=$('<div class="uploader" style="width:0;height:0;overflow: hidden; display: inline-block"><input type="file" accept="" /></div>');
		var input=dom.find('input');
		
		return {
			load: function(cfg){
				var config=$.extend({
					selector: false,
					api: '/api/image/upload',
					accept: '.jpg,.jpeg,.png,.gif',
					key: 'image'
				},cfg);
				
				input.attr('accept',config.accept);
				
				var trigger=$(config.selector);
				dom.insertBefore(trigger);
				input.trigger('click');
				
				input.unbind('change').bind('change',function(){
					var file=input[0].files[0];
					
					if(!file){
						return;
					}
					
					var message=$('<div class="uploader-message"></div>').insertBefore(trigger);
					trigger.hide();
					
					var key=config.key;
					var fd = new FormData();
					fd.append(key, file);
					
					var _progress=function(eve){
						message.text('上传中... '+parseInt(100*eve.loaded/eve.total)+'%');
					};
					
					var _load=function(eve){
						var data=JSON.parse(eve.target.responseText);
						message.hide();
						
						if(data.status&&data.data[key]){
							trigger.show();
							dom.remove();
							config.callback&&config.callback(data.data[key]);
						}else{
							_error();
						}
					};
					
					var _error=function(){
						message.text('上传失败');
						
						setTimeout(function(){
							message.hide();
							trigger.show();
						},1000);
					};
					
					var xhr = new XMLHttpRequest();
					xhr.upload.addEventListener("progress", _progress, false);
					xhr.addEventListener("load", _load, false);
					xhr.addEventListener("error", _error, false);
					xhr.addEventListener("abort", _error, false);
					xhr.open("POST", config.api);
					xhr.send(fd);
				});
			}
		};
	}();
	
	return uploader;

});