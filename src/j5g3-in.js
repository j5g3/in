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

		/// Scale of X position
		sx: 1,

		// Scale of y position
		sy: 1,

		/// All included modules
		module: null,

		/// Element to atach events to.
		element: null,

		/// Interval between events in microseconds.
		interval: 60,
		intervalId: null,

		init: function(p)
		{
		var
			me = this
		;
			if (typeof(p)==='string' || (typeof(p)==='object' && p.tagName))
				p = { element: p };

			j5g3.Class.apply(this, [ p ]);

			if (this.element === null)
				this.element = window.document;
			else if (typeof(this.element) === 'string')
				this.element = j5g3.id(this.element);

			me.module = {};

			me.poll = function() { me._poll(); };
			me.calculate_bound = function(ev) { me._calculate_bound(ev); };

			window.addEventListener('resize', this.calculate_bound);
			window.addEventListener('scroll', this.calculate_bound);
			this.intervalId = window.setInterval(this.poll, this.interval);

			this.calculate_bound();

			for (var i in j5g3.in.Modules)
				me.module[i] = new j5g3.in.Modules[i](me);
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

		_calculate_bound: function()
		{
		var
			el = this.element,
			rect
		;
			// Some browsers, including cooconJS do not support getBoundingClientRect
			if (el.getBoundingClientRect)
			{
				rect = el.getBoundingClientRect();
				this.bx = window.scrollX + rect.left;
				this.by = window.scrollY + rect.top;
			} else
			{
				this.bx = el.clientLeft;
				this.by = el.clientTop;
			}
		},

		_poll: function()
		{
			if (this.disabled===false)
				for (var i in this.module)
					this.module[i].update();
		},

		/**
		 * Calculates position relative to element.
		 * x and y are in page coordinates.
		 */
		set_pos: function(x, y)
		{
			x = (x * this.sx) - this.bx;
			y = (y * this.sy) - this.by;

			this.dx = x - this.x;
			this.dy = y - this.y;

			this.x = x;
			this.y = y;
		},

		destroy: function()
		{
			this.disable();
			window.removeEventListener('scroll', this.calculate_bound);
			window.removeEventListener('resize', this.calculate_bound);
			window.clearInterval(this.poll);
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


		/**
		 * function used to fire events
		 */
		update: function()
		{

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
		},

		destroy: function()
		{
			this.disable();
			for (var i in this.listener.module)
				if (this.listener.module[i]===this)
				{
					delete this.listener.module[i];
					break;
				}
		}

	})

});


})(this.j5g3, this);