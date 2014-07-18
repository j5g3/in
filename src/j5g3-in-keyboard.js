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