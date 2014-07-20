/**
 *
 *
 *
 */

(function(j5g3, window, undefined) {
"use strict";

var isCocoonJS = window.navigator.isCocoonJS;

/**
 * @namespace j5g3 Input module
 */
j5g3.in = function(p) {

	return new j5g3.in.Listener(p);

};

j5g3.in.Modules = {};

	/** @class */
j5g3.in.Listener = j5g3.Class.extend(/** @lends j5g3.in.Listener# */{

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

		/// Where event handlers are stored
		handlers: null,

		/// Enable auto scale, true by default
		auto_scale: true,

		/**
		 * Tells modules to load the minimal number of features to run. This will
		 * disable move events for mouse.
		 */
		minimal: false,

		disabled: false,

		init: function(p)
		{
		var
			me = this
		;
			if (typeof(p)==='string' || (typeof(p)==='object' && p.tagName))
				p = { element: p };

			j5g3.Class.call(this, p);

			if (this.element === null)
				this.element = window.document;
			else if (typeof(this.element) === 'string')
				this.element = j5g3.id(this.element);

			me.module = {};
			me.handlers = {};

			me.poll = function() { me._poll(); };
			me.calculate_bound = function(ev) { me._calculate_bound(ev); };

			if (!isCocoonJS)
			{
				window.addEventListener('resize', this.calculate_bound);
				window.addEventListener('scroll', this.calculate_bound);
				this.calculate_bound();
			}

			this.intervalId = window.setInterval(this.poll, this.interval);

			for (var i in j5g3.in.Modules)
				me.module[i] = new j5g3.in.Modules[i](me);
		},

		/**
		 * Suspends events for the period of time specified by delay.
		 */
		suspend: function(delay)
		{
			var me = this;

			me.disabled = true;
			window.setTimeout(function() {
				me.disabled = false;
			}, delay);
		},

		/**
		 * Register an event handler.
		 * @param {string|object} event_name Name of the event or object with
		 *                        event mappings.
		 */
		on: function(event_name, callback)
		{
			if (typeof event_name==='object')
			{
				for (var i in event_name)
					this.on(i, event_name[i]);
			} else
			{
				if (!callback)
					throw new Error("callback parameter is required.");

				var handler = this.handlers[event_name];

				this.handlers[event_name] = handler ?
					function(ev) { handler(ev); callback(ev); } :
					callback;
			}

			return this;
		},

		fire: function(event_name, event)
		{
			if (this.disabled)
				return;

			event.j5g3in = this;
			event.name = event_name;

			if (this.on_fire && this.on_fire(event)===false)
				return;

			if (this.handlers && this.handlers[event_name])
			{
				event.preventDefault();
				return this.handlers[event_name](event);
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
				this.bx = window.scrollX + (rect.left|0) || 0;
				this.by = window.scrollY + (rect.top|0) || 0;
			} else
			{
				this.bx = el.clientLeft || 0;
				this.by = el.clientTop || 0;
			}

			// Do scaling if element contains width and height attributes (ie Canvas).
			if (this.auto_scale && el.width && el.height)
			{
				this.sx = el.width / el.clientWidth;
				this.sy = el.height / el.clientHeight;
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
			x = (x-this.bx) * this.sx;
			y = (y-this.by) * this.sy;

			this.dx = x - this.x;
			this.dy = y - this.y;

			this.x = x;
			this.y = y;
		},

		destroy: function()
		{
			this.disable();
			this.handlers = null;
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

	});

/** @class */
j5g3.in.Module = j5g3.Class.extend(/** @lends j5g3.in.Module# */{

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
			if (listener.minimal)
				this._minimal();
		},

		_minimal: function()
		{
			this.minimal = true;
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

	});

})(/** @type {object} */ this.j5g3, this);