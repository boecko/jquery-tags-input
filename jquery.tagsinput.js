/*

	jQuery Tags Input Plugin 1.2
	
	Copyright (c) 2010 XOXCO, Inc
	
	Documentation for this plugin lives here:
	http://xoxco.com/clickable/jquery-tags-input
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php

	ben@xoxco.com

*/

(function($) {

	var delimiter = new Array();
	
	jQuery.fn.addTag = function(value,options,remove) {
		    var remove = remove || false;
			var settings = $(this).data('settings');
			var options = jQuery.extend({focus:false},options);
			if(!remove && !settings.beforeAddTag(value)) return false;
			this.each(function() { 
				id = $(this).attr('id');
	
				var tagslist = $(this).val().split(delimiter[id]);
				if (tagslist[0] == '') { 
					tagslist = new Array();
				}
				value = jQuery.trim(value);
				if (value !='') { 
					var self = this;

					var tag = $('<span class="tag">'+value + '&nbsp;&nbsp;</span>').insertBefore('#'+id+'_addTag');
					var tooltip = settings.tooltipGenerator(value) || options.tooltip;
					if(tooltip) {
						tag.attr('title', tooltip).tooltip({'predelay':4,'opacity': 0.7});
					}
					var link = $('<a href="javascript:void(0)" title="Remove tag">x</a>').appendTo(tag);
					link.click(function() {
						$(self).removeTag(value);
					});
					tagslist.push(value);
				
					$('#'+id+'_tag').val('');
					if (options.focus) {
						$('#'+id+'_tag').focus();
					} else {		
						$('#'+id+'_tag').blur();
					}
				}
				jQuery.fn.tagsInput.updateTagsField(this,tagslist);
		
			});		
			if(!remove) settings.afterAddTag(value);
			return false;
		};
		
	jQuery.fn.removeTag = function(value) { 
			var settings = $(this).data('settings');
			this.each(function() { 
				id = $(this).attr('id');
	
				var old = $(this).val().split(delimiter[id]);
	
				
				$('#'+id+'_tagsinput .tag').each(function() {
					if($(this).data('tooltip')) {
							$(this).data('tooltip').hide();
					}
				});
				$('#'+id+'_tagsinput .tag').remove();
				str = '';
				for (i=0; i< old.length; i++) { 
					if (escape(old[i])!=value) { 
						str = str + delimiter[id] +old[i];
					}
				}
				jQuery.fn.tagsInput.importTags(this,str);
			});
			settings.afterRemoveTag(value);
			return false;
	
		};
	
	
	jQuery.fn.tagsInput = function(options) { 
	
		var settings = jQuery.extend({defaultText:'add a tag',width:'300px',height:'100px','hide':true,'delimiter':',',
									  onlyAutocomplete : false, 
									  tooltipGenerator : function(v) { return null }, 
									  beforeAddTag : function(v){ return true },
									  afterAddTag : function(v){ return null },
									  afterRemoveTag : function(v){ return null },
									  autocomplete:{selectFirst:false}},
									 options);
		$(this).data('settings',settings);
		this.each(function() { 
			if (settings.hide) { 
				$(this).hide();				
			}
				
			id = $(this).attr('id')
			
			data = jQuery.extend({
				pid:id,
				real_input: '#'+id,
				holder: '#'+id+'_tagsinput',
				input_wrapper: '#'+id+'_addTag',
				fake_input: '#'+id+'_tag'
			},settings);
	
	
			delimiter[id] = data.delimiter;
	
			$('<div id="'+id+'_tagsinput" class="tagsinput"><div id="'+id+'_addTag"><input id="'+id+'_tag" value="" default="'+settings.defaultText+'" /></div><div class="tags_clear"></div></div>').insertAfter(this);
	
			$(data.holder).css('width',settings.width);
			$(data.holder).css('height',settings.height);
	
		
			if ($(data.real_input).val()!='') { 
				jQuery.fn.tagsInput.importTags($(data.real_input),$(data.real_input).val(), settings);
			} else {
				$(data.fake_input).val($(data.fake_input).attr('default'));
				$(data.fake_input).css('color','#666666');				
			}
		
	
			$(data.holder).bind('click',data,function(event) {
				$(event.data.fake_input).focus();
			});
		
			if(!settings.onlyAutocomplete) {
				// if user types a comma, create a new tag
				$(data.fake_input).bind('keypress',data,function(event) { 
					if (event.which==event.data.delimiter.charCodeAt(0) || event.which==13) { 
						
						$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true});
						return false;
					}
				});
			}
					
			
			$(data.fake_input).bind('focus',data,function(event) {
				if ($(event.data.fake_input).val()==$(event.data.fake_input).attr('default')) { 
					$(event.data.fake_input).val('');
				}
				$(event.data.fake_input).css('color','#000000');		
			});
					
			if (settings.autocomplete_url != undefined) { 
				var acOpts = { 
					source: settings.autocomplete_url
				};
				$.extend(acOpts, settings.autocomplete_opts || {});
				$(data.fake_input).autocomplete(acOpts).bind('autocompleteselect',data,
					   function(event,ui) { 
						   var data = ui.item;
						   if (data) {
							   d = data.value + "";	
							   $(event.data.real_input).addTag(d,{focus:true, tooltip:data.label});
						   }
						   return false;
					   });;
				
				return false;
				$(data.fake_input).bind('blur',data,function(event) { 
					if ($(event.data.fake_input).val() != $(event.data.fake_input).attr('default')) {
						$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:false});						
					}

					$(event.data.fake_input).val($(event.data.fake_input).attr('default'));
					$(event.data.fake_input).css('color','#666666');
					return false;
				});
	
		
			} else  {
					// if a user tabs out of the field, create a new tag
					// this is only available if autocomplete is not used.
					$(data.fake_input).bind('blur',data,function(event) { 
						var d = $(this).attr('default');
						if ($(event.data.fake_input).val()!='' && $(event.data.fake_input).val()!=d) { 
							event.preventDefault();
							$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true});
						} else {
							$(event.data.fake_input).val($(event.data.fake_input).attr('default'));
							$(event.data.fake_input).css('color','#666666');
						}
						return false;
					});
			
			}
			
			$(data.fake_input).blur();
		});
			
		return this;
	
	};
	
	
	jQuery.fn.tagsInput.updateTagsField = function(obj,tagslist) { 
		id = $(obj).attr('id');
		var text = tagslist.join(delimiter[id]);
		$(obj).val(text);
	};
	
	jQuery.fn.tagsInput.importTags = function(obj,val) {
			$(obj).val('');
			id = $(obj).attr('id');
			var tags = val.split(delimiter[id]);
			for (i=0; i<tags.length; i++) { 
				$(obj).addTag(tags[i],{focus:false},true);
			}
		};
			
})(jQuery);
