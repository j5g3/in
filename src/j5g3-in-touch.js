/**
 *
 *
 */
(function(j5g3, window, undefined) {
"use strict";

// Detect touch support
if (!('ontouchstart' in window.document))
	return;

j5g3.in.Modules.Touch = j5g3.in.Module.extend({

	/// Amount of movement required for left/right events
	x_threshold: 20,
	/// Amount of movement required for up/down events
	y_threshold: 20,
	/// Flick threshold
	flick_threshold: 120,

	flick_delay: 300,

	/// Delay of tap
	tap_delay: 200,

	/// List of active touches
	touches: null,

	/// Type of touch movement, radial or linear
	move_type: 'linear',

	/// If move_type is radial, the initial pivot radius
	radius: 50,
	/// Pivot angle
	angle: 0,

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
			id = this.touches[touches[i].identifier];
			touch = this.touches[id] || (this.touches[id]={});

			this._calculate_pos(touches[i]);
			callback(ev, touches[i], touch, this);
		}
	},

	update: function()
	{
	var
		touches = this.touches,
		i
	;
		for (i in touches)
			if (touches[i].touchstart_t)
			{
				this.listener.fire('buttonY', touches[i].ev);
			}
	},

	__touchmove: function(ev, t, obj, me)
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

		if (event_name)
		{
			me.listener.fire(event_name, ev);

			me.direction = event_name;
			me.listener.fire('move', ev);
		}
	},

	__touchradial: function(ev, t, obj, me)
	{
	var
		x = me.listener.x, y = me.listener.y,
		dx = obj.tx - x, dy = obj.ty - y,
		rx = x - obj.pivotx, ry = y - obj.pivoty
	;

		if ((dx > me.x_threshold || dx < -me.x_threshold) &&
			(dy > me.y_threshold || dy < -me.y_threshold))
		{
			ev.angle = Math.atan2(ry, rx);
			me.listener.fire('move', ev);
		}
	},

	_touchmove: function(ev)
	{
		this.each_touch(ev, this.move_type==='linear' ?
			this.__touchmove
		:
			this.__touchradial
		);
	},

	_flick_action: function(ev, obj)
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
			this.listener.fire(event_name, ev);
	},

	__touchstart: function(ev, t, obj, me)
	{
		obj.touchstart_t = Date.now();
		obj.ev = ev;

		obj.tx = obj.mx = me.listener.x;
		obj.ty = obj.my = me.listener.y;

		if (me.move_type==='radial')
		{
			obj.pivotx = obj.tx - Math.cos(me.angle) * me.radius;
			obj.pivoty = obj.ty - Math.sin(me.angle) * me.radius;
		}
	},

	_touchstart: function(ev)
	{
		this.each_touch(ev, this.__touchstart);
	},

	__touchend: function(e, t, obj, me)
	{
	var
		dt = Date.now() - obj.touchstart_t
	;
		obj.touchstart_t = 0;

		if (dt < me.tap_delay)
			return 'buttonY';
		else if (dt < me.flick_delay)
			me._flick_action(e, obj);
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