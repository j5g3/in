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

	_calculate_bound: function()
	{
	var
		el = this.el,
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

	_calculate_pos: function(ev)
	{
	var
		x = ev.pageX - this.bx,
		y = ev.pageY - this.by
	;
		this.listener.set_pos(x, y);
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

		this.handler.scroll = this.handler.resize = this._calculate_bound.bind(this);
		window.addEventListener('resize', this.handler.resize);
		window.addEventListener('scroll', this.handler.scroll);

		this._calculate_bound();
	},

	_disable: function()
	{
		this._un('mousemove');
		this._un('click');
		this._un('contextmenu');

		window.removeEventListener('scroll', this.handler.scroll);
		window.removeEventListener('resize', this.handler.resize);
	}

});

})(this.j5g3, this);
