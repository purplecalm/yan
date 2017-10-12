//css('index.css');
define(['index.mustache'],function(tpl){

	var List=function(cfg){
		this.config=$.extend({
			parent: false
		},cfg);
		
		this.init();
	};
	
	var buildTree=function(rows){
		var parents=[], children=[], map={};
		
		for( var i=0; i<rows.length; i++){
		
			if(rows[i].disabled){
				continue;
			}
		
			if(rows[i].level===1){
				parents.push(rows[i]);
				map[rows[i].id]=rows[i];
			}
			
			if(rows[i].level===2&&rows[i].parent){
				children.push(rows[i]);
			}
		}
		
		for( i=0; i<children.length; i++){
			if(map[children[i].parent]){
				map[children[i].parent].children=map[children[i].parent].children||[];
				
				map[children[i].parent].children.push(children[i]);
			}
		}
		
		return parents;
	};
	
	
	$.extend(List.prototype,{
		init: function(){
			this.dom=$('<div class="set-item"><label>选择一级导航</label></div><div class="set-item"><label>显示行数</label><input type="text" value="10" /><p>*如果会两列显示会自动把条数X2保证行数</p></div>').appendTo(this.config.parent);
			this.numberInput=this.dom.find('input');
			this.current=false;
			
			$.ajax({
				url: '/api/category/tree',
				success: $.proxy(function(data){
					if(data.status&&data.data){
						var tree=buildTree(data.data);
						this.render(tree);
					}
				},this)
			});
		},
		
		render: function(tree){
			this.dom.eq(0).append(tpl.render({list:tree}));
			this.initEvents();
		},
		
		remove: function(){
			this.dom.remove();
		},
		
		val: function(v){
			if(arguments.length&&arguments[0]){
				this.current=v.id||false;
				this.numberInput.val(v.rows||10);
				this.subs=v.subs||[];
			}
			
			return {
				rows: parseInt(this.numberInput.val(),10)||10,
				id: this.current,
				subs: this.subs
			};
		},
		
		checkSub: function(){
			var ids=[];
			this.dom.find('[data-sub].checked').each(function(){
				ids.push($(this).data('sub'));
			});
			this.subs=ids;
		},
		
		initEvents: function(){
			var items=this.dom.find('[data-id]'), subs=this.dom.find('[data-sub]'), uls=this.dom.find('ul'), self=this;
			
			items.bind('click',function(){
			
				if($(this).hasClass('checked')){
					return;
				}
			
				items.removeClass('checked');
				uls.hide().find('.checked').removeClass('checked');
				$(this).addClass('checked').next('ul').show().find('[data-sub]').addClass('checked');
				self.current=$(this).data('id');
				self.checkSub();
			});
			
			subs.bind('click', function(){
				if($(this).hasClass('checked')){
					$(this).removeClass('checked');
				}else{
					$(this).addClass('checked');
				}
				self.checkSub();
			});
			
			if(this.current){
				items.filter('[data-id="'+this.current+'"]').addClass('checked').next('ul').show();
			}
			
			if(this.subs){
				$.each(this.subs,function(i,id){
					subs.filter('[data-sub="'+id+'"]').addClass('checked');
				});
			}
		}
	});

	return {
		name: '一级列表',
		key: 'list',
		module: List
	};
});