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

	interval: 60,
	intervalId: null,

	keys: null,

	_keydown: function(ev)
	{
		this.keys[ev.keyCode] = ev;
	},

	init: function(listener)
	{
		this.keys = {};

		j5g3.in.Module.apply(this, [ listener]);

		if (this.keymap===null)
			j5g3.extend(this.keymap = {}, MAP);
	},

	_keyup: function(ev)
	{
		this.keys[ev.keyCode] = false;
	},

	_update: function()
	{
	var
		fn, ev, key
	;
		for (key in this.keymap)
			if ((ev =this.keys[key]) && (fn = this.keymap[key]))
			{
				this.listener.fire(fn, ev);

				if (key > 32)
				{
					ev.direction = fn;
					this.listener.fire('move', ev);
				}
			}
	},

	_enable: function()
	{
		this.keys = {};
		this.handler.keydown = this._keydown.bind(this);
		this.handler.keyup = this._keyup.bind(this);
		this.handler.update = this._update.bind(this);

		document.addEventListener('keydown', this.handler.keydown);
		document.addEventListener('keyup', this.handler.keyup);
		this.intervalId = window.setInterval(this.handler.update, this.interval);
	},

	_disable: function()
	{
		this.keys = {};
		// Keyboard Events
		document.removeEventListener('keydown', this.handler.keydown);
		document.removeEventListener('keyup', this.handler.keyup);
		window.clearInterval(this.intervalId);
	}

});

})(this.j5g3, this);