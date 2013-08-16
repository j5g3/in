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
			if (typeof(p)==='string' || (typeof(p)==='object' && p.tagName))
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
			if (this.disabled)
				return;

			event.j5g3in = this;
			event.name = event_name;

			if (this.on_fire && this.on_fire(event)===false)
				return;

			if (this[event_name])
			{
				event.preventDefault();
				return this[event_name](event);
			}

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
			this.disable();
		},

		enable: function()
		{
			this.disabled = false;
			for (var i in this.module)
				this.module[i].enable();
		},

		disable: function()
		{
			this.disabled = true;
			for (var i in this.module)
				this.module[i].disable();
		}

	}),

	Module: j5g3.Class.extend({

		/// Handlers
		handler: null,

		/// DOM Element to attach events to.
		el: null,

		/// True if module is enabled. Read Only.
		enabled: false,

		/// Override this function
		_enable: null,

		/// Override this function
		_disable: null,

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
		},

		enable: function()
		{
			if (!this.enabled)
			{
				this._enable();
				this.enabled = true;
			}
			return this;
		},

		disable: function()
		{
			if (this.enabled)
			{
				this._disable();
				this.enabled = false;
			}

			return this;
		}

	})

});


})(this.j5g3, this);