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

j5g3.in.Modules.Keyboard = j5g3.in.Module.extend({

	keymap: null,

	_keydown: function(ev)
	{
	var
		kc = ev.keyCode,
		fn = this.keymap[kc]
	;
		if (fn)
		{
			this.listener.fire(fn, ev);

			if (kc>32)
			{
				ev.direction = fn;
				this.listener.fire('move', ev);
			}
		}
	},

	init: function(listener)
	{
		j5g3.in.Module.apply(this, [ listener]);

		if (this.keymap===null)
			j5g3.extend(this.keymap = {}, MAP);
	},

	_keyup: function()
	{

	},

	enable: function()
	{
		this.handler.keydown = this._keydown.bind(this);
		this.handler.keyup = this._keyup.bind(this);
		document.addEventListener('keydown', this.handler.keydown);
		document.addEventListener('keyup', this.handler.keyup);
	},

	disable: function()
	{
		// Keyboard Events
		document.removeEventListener('keydown', this.handler.keydown);
		document.removeEventListener('keyup', this.handler.keyup);
	}

});

})(this.j5g3, this);