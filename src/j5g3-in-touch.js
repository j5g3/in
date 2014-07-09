/**
 *
 *
 */
(function(j5g3, window, undefined) {
"use strict";

// Detect touch support
//if (!('ontouchstart' in window.document))
//	return;

j5g3.in.Modules.Touch = j5g3.in.Module.extend({

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