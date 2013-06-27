/**
 *
 *
 *
 */

(function(j5g3, window, undefined) {
"use strict";

/**
 * @namespace j5g3 Input module
 */
j5g3.in = function(p) {

	return new j5g3.in.Listener(p);

};

j5g3.extend(j5g3.in, {

	Modules: {},

	Listener: j5g3.Class.extend({

		/// Cursor X position relative to element
		x: 0,
		/// Cursor Y position relative to element
		y: 0,
		/// Change of X from previous event
		dx: 0,
		/// Change of Y from previous event
		dy: 0,

		/// All included modules
		module: null,

		/// Element to atach events to.
		element: null,

		init: function(p)
		{
			if (typeof(p)==='string')
				p = { element: p };

			j5g3.Class.apply(this, [ p ]);

			if (this.element === null)
				this.element = window.document;
			else if (typeof(this.element) === 'string')
				this.element = j5g3.id(this.element);

			this.module = {};

			for (var i in j5g3.in.Modules)
				this.module[i] = new j5g3.in.Modules[i](this);
		},

		fire: function(event_name, event)
		{
			event.j5g3in = this;
			event.name = event_name;

			if (this.on_fire)
				this.on_fire(event);

			if (this[event_name])
				return this[event_name](event);
		},

		set_pos: function(x, y)
		{
			this.dx = x - this.x;
			this.dy = y - this.y;

			this.x = x;
			this.y = y;
		},

		destroy: function()
		{
			for (var i in this.module)
				this.module[i].disable();
		}

	}),

	Module: j5g3.Class.extend({

		/// Handlers
		handler: null,

		/// DOM Element to attach events to.
		el: null,

		/// Override this function
		enable: function()
		{

		},

		/// Override this function
		disable: function()
		{

		},

		init: function(listener)
		{
			this.handler = {};
			this.listener = listener;
			this.el = listener.element;

			this.enable();
		},

		_on: function(name, fn)
		{
		var
			scopedFn = fn.bind(this)
		;
			this.handler[name] = scopedFn;
			this.el.addEventListener(name, scopedFn);
		},

		_un: function(name)
		{
			this.el.removeEventListener(name, this.handler[name]);
		}

	})

});


})(this.j5g3, this);