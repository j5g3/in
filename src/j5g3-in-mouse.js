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
j5g3.in.Modules.Mouse = j5g3.in.Module.extend({

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

		return false;
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
