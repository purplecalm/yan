define(['index.mustache','editor'],function(tpl){

	var Notice=function(cfg){
		this.config=$.extend({
			parent: false
		},cfg);
		
		this.init();
	};
	
	$.extend(Notice.prototype,{
		init: function(){
			this.dom=$(tpl.render()).appendTo(this.config.parent);
			
			this.text=this.dom.find('textarea');
			setTimeout($.proxy(function(){
				this.editor=this.text.edit();
			},this),10);
		},
		
		remove: function(){
			this.dom.remove();
		},
		
		val: function(v){
			if(arguments.length&&arguments[0]){
				this.text.val(v);
				
				this.editor&&this.editor.dom&&this.editor.val(v);
			}
			
			this.editor&&this.editor.dom&&this.editor.sync();
			
			return $.trim(this.text.val());
		}
	});

	return {
		name: '公告',
		key: 'notice',
		module: Notice
	};
});