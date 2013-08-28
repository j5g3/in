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

	_calculate_pos: function(touch)
	{
		this.listener.set_pos(touch.pageX, touch.pageY);
	},

	each_touch: function(ev, callback)
	{
	var
		touches = ev.changedTouches,
		i = touches.length
	;
		while (i--)
		{
			this._calculate_pos(touches[i]);
			callback(ev, touches[i], this.touches[touches[i].identifier], this);
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

	_touchmove: function(ev)
	{
		this.each_touch(ev, this.__touchmove);
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

	_touchstart: function(ev)
	{
		this.each_touch(ev, function(ev, t, obj, me)
		{
			obj.touchstart_t = Date.now();

			obj.tx = obj.mx = me.listener.x;
			obj.ty = obj.my = me.listener.y;
		});
	},

	__touchend: function(ev, t, obj, me)
	{
	var
		dt = Date.now() - obj.touchstart_t
	;
		obj.touchstart_t = 0;

		if (dt < me.tap_delay)
			return 'buttonY';
		else if (dt < me.flick_delay)
			me._flick_action(ev, obj);
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

		this.touches = new Array(10);

		for (var i=0; i<this.touches.length; i++)
			this.touches[i] = {};
	},

	_disable: function()
	{
		this._un('touchmove');
		this._un('touchstart');
		this._un('touchend');
	}

});

})(this.j5g3, this);