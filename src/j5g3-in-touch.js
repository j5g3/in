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

	_calculate_pos: function(ev)
	{
	var
		touch = ev.changedTouches[0]
	;
		this.listener.set_pos(touch.pageX, touch.pageY);
	},

	_touchmove: function(ev)
	{
		this._calculate_pos(ev);

		var
			x = this.listener.x, y = this.listener.y,
			tdx = x - this._mx,
			tdy = y - this._my,
			event_name
		;
		if (tdx < -this.x_threshold)
		{
			this._mx = x;
			event_name = 'left';
		}
		else if (tdx > this.x_threshold)
		{
			this._mx = x;
			event_name = 'right';
		}

		if (tdy < -this.y_threshold)
		{
			this._my = y;
			event_name = 'up' + (event_name ? '_' + event_name : '');

		} else if (tdy > this.y_threshold)
		{
			this._my = y;
			event_name = 'down' + (event_name ? '_' + event_name : '');
		}

		if (event_name)
		{
			this.listener.fire(event_name, ev);

			ev.direction = event_name;
			this.listener.fire('move', ev);
		}
	},

	_flick_action: function(ev)
	{
		var
			x = this.listener.x, y = this.listener.y,
			tdx = x - this._tx,
			tdy = y - this._ty,
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
		this._touchstart_t = Date.now();

		this._tx = this._mx = ev.touches[0].pageX;
		this._ty = this._my = ev.touches[0].pageY;
	},

	_touchend: function(ev)
	{
	var
		dt = Date.now() - this._touchstart_t
	;
		this._calculate_pos(ev);
		if (dt < this.tap_delay)
			this.listener.fire('buttonY', ev);
		else if (dt < this.flick_delay)
			this._flick_action(ev);
	},

	_enable: function()
	{
		this._on('touchmove', this._touchmove);
		this._on('touchstart', this._touchstart);
		this._on('touchend', this._touchend);
	},

	_disable: function()
	{
		this._un('touchmove');
		this._un('touchstart');
		this._un('touchend');
	}

});

})(this.j5g3, this);