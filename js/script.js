$(function() {

var
	BoxShadowModel = Backbone.Model.extend({
		defaults: function() {
			return {
				horizontalOffset: '0px', 
				verticalOffset: '0px',
				blurRadius: '0px',
				spreadDistance: '0px',
				color: 'rgba(0,0,0,0.5)'
			};
		},
		getCSSText: function() {
			var v = this.attributes.horizontalOffset + ' ' +
				this.attributes.verticalOffset + ' ' +
				this.attributes.blurRadius + ' ' +
				this.attributes.spreadDistance + ' ' +
				this.attributes.color + ';\n';
			return '-moz-box-shadow: ' + v + '-webkit-box-shadow: ' + v + 'box-shadow: ' + v;
		},
		validate: function(attributes) {
			if (parseFloat(attributes.blurRadius) < 0) {
				return 'Blur radius cannot be negative';
			}
		}
	}),
	SampleView = Backbone.View.extend({
		el: $('#sample-box').get(0),
		initialize: function() {
			this.update();
			this.model.bind('change', this.update, this);
		},
		update: function() {
			this.el.style.cssText = this.model.getCSSText();
			//return this;
		}
	}),
	OutputView = Backbone.View.extend({
		el: $('#css-output'),
		initialize: function() {
			this.update();
			this.model.bind('change', this.update, this);
		},
		update: function() {
			this.el.html(this.model.getCSSText());
			//return this;
		}
	}),
	ControlView = Backbone.View.extend({
		el: $('#controls'),
		events: { // The order is fundamental!
			'change #color': 'setColor',
			'change': 'onChange'
		},
		onChange: function(e) {
			var
				prop = {},
				div = e.target.parentNode,
				propName = div.id,
				input = $(div).find('input'),
				select = input.next()
			;
			prop[propName] = input.val() + select.val();
			this.model.set(prop);
		},
		setColor: function(e) {
					this.model.set({color: this.$('#color input').val()});
			e.stopImmediatePropagation();
		},
		initialize: function() {
			this.render();
			this.fillFieldsFromModel();
		},
		render: function() {
			this.el
				.append($('#length-property').tmpl([
					{name: 'horizontalOffset', label: 'hOff', title: 'horizontal offset'},
					{name: 'verticalOffset', label: 'vOff', title: 'vertical offset'},
					{name: 'blurRadius', label: 'blur', title: 'blur radius'},
					{name: 'spreadDistance', label: 'distance', title: 'spread distance'},
					{name: 'color', label: 'color', title: 'color'}
				]));
			
			this.$('#blurRadius').append('<div class="error">Blur radius cannot be negative</div>');
			
			var self = this;
			this.model.bind('error', function(model, err) {
				self.$('#blurRadius').addClass('error');
				setTimeout(function() {
					self.$('#blurRadius').removeClass('error')
				}, 5000);
			});
		},
		fillFieldsFromModel: function() {
			var
				parse = function(x) {
					var v = parseFloat(x);
					return [v, x.replace(v, '')];
				},
				m = {px:0, em:1, cm:2, mm:3, in:4},
				self = this
			;
			
			_.each(['horizontalOffset', 'verticalOffset', 'blurRadius', 'spreadDistance'], function(attr) {
				var a = parse(self.model.get(attr));
				self.$('#' + attr).find('input')
					.val(a[0])
					.next()
						.children()
							.find(':selected')
								.attr('selected', '')
								.end()
							.get(m[a[1]])
								.selected = 'selected'
				;
			});
			
			this.$('#color').find('input').val(this.model.get('color'));
		}
	}),
	AppView = Backbone.View.extend({
		el: $('#box-shadow'),
		initialize: function() {
			var boxShadow = new BoxShadowModel({
				horizontalOffset: '5px',
				verticalOffset: '5px',
				blurRadius: '5px',
				spreadDistance: '3px'
			});
			
			new SampleView({model: boxShadow});
			new OutputView({model: boxShadow});
			new ControlView({model: boxShadow});
		 }
	})
;

new AppView;

});
