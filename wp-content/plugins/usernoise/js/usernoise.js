usernoise = {};
jQuery(function($){
	var browser = {};
	if (navigator && navigator.appVersion){
		browser.msie6 = navigator.appVersion.indexOf('MSIE 6.0') != -1;
		browser.msie7 = navigator.appVersion.indexOf('MSIE 7.0') != -1;
		browser.msie8 = navigator.appVersion.indexOf('MSIE 8.0') != -1;
	}
	if (browser.msie6 || browser.msie7)
		return;
	
  function UsernoiseButton(){
		var self = this;
		self.show = function(){
			var $button = $('<a href="#" id="un-button" />').appendTo($('body'));
			var property;
			$button.html(usernoiseButton.text);
			$button.addClass(usernoiseButton['class']);
			$button.attr('style', usernoiseButton.style);
			$button.click(function(event){
				self.showWindow();
				event.preventDefault();
				return false;
			});
			if (browser.msie7){
				if ($button.is('.un-left') || $button.is('.un-right'))
					$button.css('margin-top', '-' + $button.width() / 2  + "px");
				$button.addClass('ie7');
			} else if (browser.msie8){
				if ($button.is('.un-right')){
					$button.css('right', "-" + $button.outerWidth() + "px");
				}
				if ($button.is('.un-left') || $button.is('.un-right'))
					$button.css('margin-top', '-' + $button.width() / 2 + "px");
				$button.addClass('ie8');
			} else {
				$button.addClass('css3');
			}

			if ($button.is('.un-bottom') || $button.is('.un-top'))
				$button.css('margin-left', "-" + ($('#un-button').width() / 2) + "px");
			if ($button.is('.un-left'))
				property = 'left';
			else if ($button.is('.un-right'))
				property = 'right';
			else if ($button.is('.un-bottom'))
				property = 'bottom';
			else
				property = 'top';

			if ($button.is('.un-left.css3'))
				$button.css('margin-top', ($button.width() / 2) + "px");
			if ($button.is('.un-right.css3')){
				$button.css('margin-top', "-" + ($button.width() / 2) + "px");
			}
			var propOnStart = {};
			var propOnIn = {opacity: 1};
			var propOnOut = {opacity: 0.96};
			propOnStart[property] = '+=40px';
			propOnIn[property] = '+=3px';
			propOnOut[property] = '-=3px';
			$button.animate(propOnStart).hover(
				function(){$button.animate(propOnIn, 100)},
				function(){$button.animate(propOnOut, 100)});
		}
			
		self.showWindow = function(){
		  var $overlay = $('<div id="un-overlay" />').appendTo($('body'));
		  $overlay.fadeIn('fast');
		  var $loading = $('<div id="un-loading" />').appendTo($('body'));
			var $iframe = $('<iframe id="un-iframe" marginheight="0" marginwidth="0" frameborder="0" allowtransparency="true" />').appendTo($('body'));
			$iframe.css('opacity', 0);
			$iframe.load(function(){
				$loading.fadeOut('fast', function(){
					$loading.remove();
				});
				$iframe.css('opacity', 0);
				$iframe.animate({'opacity': 1}, 'fast');
			});
			$iframe.attr('src', usernoiseButton.windowUrl);
		}
		self.hideWindow = function(){
		  $('#un-overlay').fadeOut(function(){
				$('#un-overlay').remove();
			});
			$('#un-loading').remove();
			$('#un-iframe').fadeOut('fast', function(){
				$('#un-iframe').remove();
			});
		};
	};
	
	usernoise.UsernoiseButton = UsernoiseButton;
	
	function FeedbackForm($form){
		var self = this;
		self.form = $form;
		$form.find('.text').unAutoPlaceholder();
		$form.find('.un-types-wrapper a').click(selectTypeHandler);
		$form.find('.un-types-wrapper a:first-child').click();
		$form.submit(submitHandler);
		
		function selectTypeHandler(){
			var $selector = $(this).parent();
			$selector.find('a').removeClass('selected');
			$(this).addClass('selected');
			var type = $(this).attr('data-type');
			$selector.find('input[type=hidden]').val(type);
			$(document).trigger('typeselected#feedbackform#window.un', type);
			return false;
		}
		
		function submitHandler(){
			var data  = $form.unSerializeObject();
			if (window.parent.document)
				data.referer = window.parent.document.location.href;
			$(document).trigger('submitting#feedbackform#window.un', data);
			self.lock();
			$form.find('.loader').show();
			self.errors.hide();
			$.post($form.attr('action'), data , function(response){
				$form.find('.loader').hide();
				self.unlock();
				response = usernoise.helpers.parseJSON(response);
				if (response.success){
					$('#un-thankyou').height($('#un-feedback-wrapper').height() + "px")
					$form.find('textarea').val('').trigger('blur');
				  $(document).trigger('sent#feedbackform#window.un');
				} else {
					self.errors.show(response.errors);
				}
			});
			return false;
		}
		
		$.extend(self, {
			unlock: function(){
				$(document).trigger('unlocking#feedbackform#window.un');
				$form.find('input, select, textarea').removeAttr('disabled');
				$form.find('.un-types-wrapper a').click(selectTypeHandler);
			}, 
			lock: function(){
				$form.find('*').unbind('click');
				$(document).trigger('locking#feedbackform#window.un');
				$form.find('input, select, textarea').attr('disabled', 'disabled');
			},
			errors: new Errors($form.find('.un-feedback-errors-wrapper')),
			selectedType: function(){
				var type = $('#types-wrapper a.selected').attr('id');
				return type ? type.replace('un-type-', '') : null;
			}
		});
		$(document).trigger('created#feedbackform#window.un', self);
	}
	
	usernoise.FeedbackForm = FeedbackForm;
	
	function Errors($errorsWrapper){
		var self = this;
		var $errors = $errorsWrapper.find('.un-errors');
		$.extend(self, {
			show: function(errors){
				$('#window').addClass('transitionEnabled');
				$(errors).each(function(index, error){
					$errors.append($("<p />").text(error));
				});
				$errorsWrapper.fadeIn('fast');
			}, 
			hide: function(errors){
				$errors.html(''); 
				$errorsWrapper.fadeOut('fast', function(){
					$errorsWrapper.hide();
				});
			}
		});
	}
	usernoise.Errors = Errors;
	
	function ThankYouScreen(){
		var self = this;
		var $screen = $screen;
		$.extend(self, {
			show: function(){
					$('#un-thankyou').show();
					$('#un-feedback-close').click(function(){
						usernoise.window.hide();
						return false;
					});
			}
		});
	}
	usernoise.ThankYouScreen = ThankYouScreen;
	
	function UsernoiseWindow(windowSelector){
		var self = this;
		var $window = $('#window');
		
		function detectBrowser(){
			if (!$('#wrapper').hasClass('un')) return;
			$('#wrapper').addClass('un');
			if ($.browser.msie && $.browser.version == '7.0')
				$('#wrapper').addClass('un-ie7');
			if ($.browser.msie && $.browser.version == '8.0')
				$('#wrapper').addClass('un-ie8');
		}
		
		function showThankYouHandler(event, html){
			self.thankYouScreen = new ThankYouScreen($window.find('.thank-you-screen'));
			self.thankYouScreen.show(html);
		}
		detectBrowser();
		$.extend(self, {
			hide: function(){
				window.parent.usernoiseButton.button.hideWindow();
			},
			adjustSize: function(){
				$window.css({
									'margin-top': '-' + $window.height() / 2 + "px",
									'margin-left': '-'  + $window.width() / 2 + "px"});
			}
		});
		self.adjustSize();
	}
	
	$.fn.unAutoPlaceholder = function(){
		$(this).each(function(){
			$(this).attr('data-default', $(this).val());
			$(this).focus(function(){
				if ($(this).val() == $(this).attr('data-default')){
					$(this).val('');
					$(this).addClass('text-normal');
					$(this).removeClass('text-empty');
				}
			});
			$(this).blur(function(){
				if ($(this).val() == ''){
					$(this).val($(this).attr('data-default'));
					$(this).removeClass('text-normal');
					$(this).addClass('text-empty');
					
				}
			});
		});
	};
	
	$.fn.unSerializeObject = function(){
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
			if (o[this.name]) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};
	
	usernoise.helpers = {
		parseJSON: function(json){
			return $.parseJSON ? $.parseJSON(json) : eval("(" + json + ")");
		}
	};
	
	usernoise.Window = UsernoiseWindow;
});