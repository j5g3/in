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

		/// Bounding rect offset X
		bx: 0,
		/// Bounding rect offset Y
		by: 0,

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
/**
 *
 *
 *
 */

(function(j5g3, window, undefined) {
"use strict";


/**
 * @class Mouse Module
 */
j5g3.in.Modules.Mouse = j5g3.in.Module.extend(/** @lends j5g3.in.Modules.Mouse# */{

	/// Mouse x sensitivity
	x_threshold: 1,
	/// Mouse y sensitivity
	y_threshold: 1,

	// Bound X
	bx: 0,
	// Bound Y
	by: 0,

	/// Captures Mouse move event. Set to false to improve performance.
	capture_move: true,

	_calculate_pos: function(ev)
	{
		this.listener.set_pos(ev.pageX, ev.pageY);
	},

	_click: function(ev)
	{
	var
		button = ({ 0: 'buttonY', 1: 'buttonX', 2: 'buttonA' })[ev.button]
	;
		this._calculate_pos(ev);
		this.listener.fire(button , ev);
		this.listener.fire('button', ev);

		return false;
	},

	_minimal: function()
	{
		this.capture_move = false;
	},

	_mousemove: function(ev)
	{
		if (!this.capture_move)
			return;

		this._calculate_pos(ev);

		if (Math.abs(this.listener.dx) > this.x_threshold ||
			Math.abs(this.listener.dy) > this.y_threshold)
		{
			this.listener.fire('move', ev);
		}
	},

	_enable: function()
	{
		this._on('mousemove', this._mousemove);
		this._on('click', this._click);
		this._on('contextmenu', this._click);
	},

	_disable: function()
	{
		this._un('mousemove');
		this._un('click');
		this._un('contextmenu');
	}

});

})(this.j5g3, this);

/**
 *
 *
 */
(function(j5g3, window, undefined) {
"use strict";

// Detect touch support
//if (!('ontouchstart' in window.document))
//	return;

/** @class */
j5g3.in.Modules.Touch = j5g3.in.Module.extend(/** @lends j5g3.in.Modules.Touch# */{

	/// Amount of movement required for left/right events
	x_threshold: 20,
	/// Amount of movement required for up/down events
	y_threshold: 20,
	/// Flick threshold
	flick_threshold: 70,

	flick_delay: 200,

	/// Set a fixed pivot x coordinate for radial movement.
	pivot_x: null,
	/// Set a fixed pivot y coordinate for radial movement.
	pivot_y: null,

	/// List of active touches
	touches: null,

	/// Type of touch movement, radial or linear
	_move_type: 'linear',

	set move_type(val)
	{
		this._move_type = val;
		this.__move = val==='linear' ? this.__touchmove : this.__touchradial;
	},

	get move_type()
	{
		return this._move_type;
	},

	/// If move_type is radial, the initial pivot radius
	radius: 25,
	/// Pivot angle
	angle: 0,

	/** Move detection algorithm */
	__move: null,

	init: function(p)
	{
		j5g3.in.Module.call(this, p);
		this.move_type = this._move_type;
	},

	_calculate_pos: function(touch)
	{
		this.listener.set_pos(touch.pageX, touch.pageY);
	},

	each_touch: function(ev, callback)
	{
	var
		touches = ev.changedTouches,
		i = touches.length,
		touch, id
	;
		while (i--)
		{
			id = touches[i].identifier;
			touch = this.touches[id] || (this.touches[id]={ id: id });
			touch.ev = ev;
			touch.touch = touches[i];

			this._calculate_pos(touch.touch);
			callback(touch, this);
		}
	},

	update: function()
	{
		if (this.minimal)
			return;
	var
		touches = this.touches, touch, i
	;
		for (i in touches)
		{
			touch = touches[i];

			if (!touch.moved)
			{
				this._calculate_pos(touch.touch);
				this.listener.fire('buttonY', touch.ev);
			}
		}
	},

	doMove: function(obj)
	{
		obj.moved = true;
		this.listener.fire(obj.direction, obj.ev);

		if (!this.minimal)
		{
			obj.ev.direction = obj.direction;
			this.listener.fire('move', obj.ev);
		}
	},

	__touchmove: function(obj, me)
	{
	var
		x = me.listener.x, y = me.listener.y,
		tdx = x - obj.mx,
		tdy = y - obj.my,
		event_name
	;
		if (tdx < -me.x_threshold)
		{
			obj.mx = x;
			event_name = 'left';
		}
		else if (tdx > me.x_threshold)
		{
			obj.mx = x;
			event_name = 'right';
		}

		if (tdy < -me.y_threshold)
		{
			obj.my = y;
			event_name = 'up' + (event_name ? '_' + event_name : '');

		} else if (tdy > me.y_threshold)
		{
			obj.my = y;
			event_name = 'down' + (event_name ? '_' + event_name : '');
		}

		obj.direction = event_name;

		if (event_name)
			me.doMove(obj);
	},

	__touchradial: function(obj, me)
	{
	var
		x = me.listener.x, y = me.listener.y,
		dx = obj.tx - x, dy = obj.ty - y,
		rx = x - obj.pivotx, ry = y - obj.pivoty
	;

		if ((dx > me.x_threshold || dx < -me.x_threshold) &&
			(dy > me.y_threshold || dy < -me.y_threshold))
		{
			me.angle = obj.ev.angle = Math.atan2(ry, rx);
			me.listener.fire('move', obj.ev);
		}
	},

	_touchmove: function(ev)
	{
		this.each_touch(ev, this.__move);
	},

	_flick_action: function(obj)
	{
		var
			x = this.listener.x, y = this.listener.y,
			tdx = x - obj.tx,
			tdy = y - obj.ty,
			event_name
		;

		if (tdx < -this.flick_threshold)
			event_name = 'buttonY';
		else if (tdx > this.flick_threshold)
			event_name = 'buttonA';

		if (tdy < -this.flick_threshold)
			event_name = 'buttonX';
		else if (tdy > this.flick_threshold)
			event_name = 'buttonB';

		if (event_name)
			this.listener.fire(event_name, obj.ev);
		else if (obj.direction)
			this.doMove(obj);
	},

	set_pivot: function(obj)
	{
		obj.pivotx = this.pivot_x || (obj.tx - Math.cos(this.angle) * this.radius);
		obj.pivoty = this.pivot_y || (obj.ty - Math.sin(this.angle) * this.radius);
	},

	__touchstart: function(obj, me)
	{
		obj.start = Date.now();

		// tx, ty = First touch position
		// mx, my = current touch position
		obj.tx = obj.mx = me.listener.x;
		obj.ty = obj.my = me.listener.y;

		if (me.move_type==='radial')
			me.set_pivot(obj);
	},

	__touchend: function(obj, me)
	{
		var dt = Date.now() - obj.start;

		if (dt < me.flick_delay)
			me._flick_action(obj);

		delete me.touches[obj.id];
	},

	_touchstart: function(ev)
	{
		this.each_touch(ev, this.__touchstart);
	},

	_touchend: function(ev)
	{
		this.each_touch(ev, this.__touchend);
	},

	_enable: function()
	{
		this._on('touchmove', this._touchmove);
		this._on('touchstart', this._touchstart);
		this._on('touchend', this._touchend);

		this.touches = {};
	},

	_disable: function()
	{
		this._un('touchmove');
		this._un('touchstart');
		this._un('touchend');
	}

});

})(this.j5g3, this);
/**
 *
 *
 */
(function(j5g3, window, undefined) {
"use strict";

var
	document = window.document,

	MAP = {
		32: 'buttonB', // space
		13: 'buttonY', // enter
		16: 'buttonX', // shift
		17: 'buttonA', // ctrl

		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down',
		105: 'up_right',
		103: 'up_left',
		99: 'down_right',
		97: 'down_left'
	}
;

/** @class */
j5g3.in.Modules.Keyboard = j5g3.in.Module.extend(/** @lends j5g3.in.Modules.Keyboard# */{

	keymap: null,

	keys: null,

	_keydown: function(ev)
	{
		this.keys[ev.keyCode] = ev;

		if (this.keymap[ev.keyCode])
			ev.preventDefault();
	},

	init: function(listener)
	{
		this.keys = {};

		j5g3.in.Module.call(this, listener);

		if (this.keymap===null)
			j5g3.extend(this.keymap = {}, MAP);
	},

	_keyup: function(ev)
	{
		this.keys[ev.keyCode] = false;
	},

	update: function()
	{
	var
		fn, ev, key
	;
		for (key in this.keymap)
		{
			ev = this.keys[key];
			if (ev)
			{
				fn = this.keymap[key];
				this.listener.fire(fn, ev);

				if (key > 32)
				{
					ev.direction = fn;
					this.listener.fire('move', ev);
				}

				this.listener.fire('button', ev);
			}
		}
	},

	_enable: function()
	{
		this.keys = {};
		this.handler.keydown = this._keydown.bind(this);
		this.handler.keyup = this._keyup.bind(this);

		document.addEventListener('keydown', this.handler.keydown);
		document.addEventListener('keyup', this.handler.keyup);
	},

	_disable: function()
	{
		this.keys = {};
		// Keyboard Events
		document.removeEventListener('keydown', this.handler.keydown);
		document.removeEventListener('keyup', this.handler.keyup);
	}

});

})(this.j5g3, this);
/**
 *
 *
 */
(function(j5g3, window, undefined) {
"use strict";

if (!window.navigator.webkitGetGamepads)
	return;

/**
 * @class
 * Not Implemented.
*/
j5g3.in.Modules.Joystick= j5g3.in.Module.extend(/** @lends j5g3.in.Modules.Joystick# */{

	_enable: function()
	{
	},

	_disable: function()
	{

	}

});


})(this.j5g3, this);