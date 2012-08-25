/**
 * Animax.js
 * Extendable Javascript Animation Handler
 *
 * Copyright 2011-2012 AvacWeb (avacweb.com)
 * Released under the MIT and GPL Licenses.
*/ 
(function() {
	
	//identify best setTimeout method. Paul Irish - http://paulirish.com
	var set = window.requestAnimationFrame 
			|| window.mozRequestAnimationFrame
			|| window.webkitRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function( fn ) { return setTimeout( fn, 1000 / 60 ) };
	
	//global animax object
	var animax = {
		rAF : set,
		running : false, //are all the stored animations running?
		animations : [], //queued animation objects.
		defaultObj : {
			duration : null, //duration of animation
			onStart : function(){}, //function when the animation starts
			onFinish : function(){}, //function when the animation finished
			callback : function(){}, //function which performs the animation
			finished : false, 
			started : false,
			values : [], //values of each tweek
			style : 'smooth',
			curTweek : 0,
			length : 0,
			start : 0,
			end : 0,
			reset : function() { //resets an animation ready for use again.
				this.finished = false;
				this.started = false;
				this.store = {};
				this.curTweek = 0;
			},
			data : function(name, value) { //stored data in the animation object to be accessed by callback, onFinish, onStart
				if(arguments.length == 2) this.store[name] = value;
				return this.store[name];
			},
			store : {}
		},
		styles : { //percentage increases for each frame when creating to - from values. Must sum to 100 to complete 100%
			'smooth': [1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,3,2,1],
			'accell': [1,2,3,4,5,6,7,8,9,10,10,11,12,12],
			'zoom': [12,12,11,10,10,9,8,7,6,5,4,3,2,1],
			'linear': [10,10,10,10,10,10,10,10,10,10],
			'bounce': [10,10,10,10,10,10,10,10,-8,11,-6,10,-4,8,-3,6,-2,5,-1,4],
			'shake': [6,6,-6,-6,-6,-6,6,6,8,8,-8,-8,-8,-8,8,8,6,6,-6,-6,-6,-6,6,6,5,5,-5,-5,-4,-4,4,4,3,-3]
		},
		speeds : { //preset speeds. 
			'fast' : 400,
			'normal': 800,
			'slow' : 2000,
			'slug' : 3000
		},
		
		//creates the values inbetween start and end. 
		createValues : function(start, end, type) {
			var values = []
			, total = start //ensures maths is done rather than concatenation
			, diff = end - start //diff from end and start
			, increments = typeof type === 'string' ? this.styles[ type ] : type;
			if(!increments) return [];
			var frames = increments.length;
			
			for (var i = 0; i < frames; i++) {
				total += ( diff*increments[i] ) / 100;
				values[i] = (total+'').replace(/(\.\d)\d+/, '$1');
			}
			return values;
		},
		
		//store animation objects. 
		add : function() {
			for(var i = 0, l = arguments.length; i<l; i++) {
				if(typeof arguments[i] === 'object') this.animations.push( arguments[i] );
			}
		},
		
		// create an animation object
		create : function( obj, element, extraData ) {
			if(typeof obj === 'string') {
				obj = this.presets[obj];
			}
			if(typeof obj == 'object') {
				for(var i in this.defaultObj) 
					if( !(i in obj) ) obj[i] = this.defaultObj[i];
					
				if(typeof obj.style === 'string') {
					obj.values = this.createValues(obj.start, obj.end, obj.style);
				}
				obj.length = obj.values.length;
				obj.element = element;
				if(extraData) {
					for(var i in extraData) obj.data(i, extraData[i]);
				}
			}
			
			return obj;	
		},
		
		// run all stored animations. Called by requestAnimationFrame so must be global.
		runAll : function(callback) {
			var animationsLeft = false, us = animax;
			for( var i = 0, a, anims = us.animations; (a = anims[i]); ++i) {
				if(!a.started) {
					a.onStart();
					a.started = true;
				}
				
				if(!a.finished) {
					animationsLeft = true;
					a.callback( a.values[ a.curTweek++ ], a.element || null);
					if(a.curTweek >= a.length) {
						a.onFinish();
						a.finished = true;
					}
				}
			}
			if(!animationsLeft) {
				callback();
				for(; i; i--) { //reset all the anims so they can be run again.
					anims[ i - 1 ].reset();
				}
				return us.running = false;
			}
			
			us.rAF.call( window, us.runAll ); //must be called in window scope
			us.running = true;
		},

		//run a single animation object independantly. (this allows setting a duration for the animation to last)
		run : function(a, time) {
			if(!time) time = a.duration;		
			if(time && typeof time === 'string') time = this.speeds[time];
			time = time || this.speeds['normal'];
			
			var t = setInterval(function() {
				if(!a.started) {
					a.onStart();
					a.started = true;
				}
				
				if(!a.finished) {
					a.callback( a.values[ a.curTweek++ ], a.element || null );
					if(a.curTweek >= a.length) {
						a.onFinish();
						a.finished = true;
						clearInterval( t );
					}
				}
			}, time / a.length);
		},
		
		//delete all stored anims.
		clear : function() {
			this.animations = [];
		},
		
		//reset all anims so it can be used again
		resetAll : function() {
			for(var e = this.animations[0], i = 0; e; e = this.animations[ ++i ]) e.reset();
		},
		
		setPreset : function(name, obj) {
			this.presets[name] = obj;
		},
		
		config : function(option, value) {
			if(typeof option == 'string') {
				this.defaultObj[ option ] = value;
			}
			else {
				for(var i in option) this.defaultObj[ i ] = option[ i ];
			}
		},
		
		getCurrent : function(elem, prop) {
			if(elem.style && elem.style[prop]) return elem.style[prop];
			if(window.getComputedStyle) {
				return elem.ownerDocument.defaultView.getComputedStyle(elem, null).getPropertyValue(prop);
			}
			if(elem.computedStyle) {
				return elem.computedStyle[prop]
			}
			if(elem.currentStyle) {
				return elem.currentStyle[prop];
			}
			return null
		}
	};
	
	animax.presets = {};
	
	animax.presets.fadeIn = {
		end : 1,
		style : 'smooth',
		onStart : function() {
			if(this.element) this.element.style.display = '';
			else this.finished = true;
		},
		callback : function(value, elem) {
			elem.style.opacity = value;
			if(elem.filters) {
				elem.filters.item("DXImageTransform.Microsoft.Alpha").opacity = value * 100;
			}
		}
	};
	
	animax.presets.fadeOut = {
		end : 0,
		start : 1,
		style : 'smooth',
		onStart : function() {
			if(!this.element) this.finished = true;
		},
		callback : function(value, elem) {
			elem.style.opacity = value;
			if(elem.filters) {
				elem.filters.item("DXImageTransform.Microsoft.Alpha").opacity = value * 100;
			}
		},
		onFinish : function() {
			this.element.style.display = 'none';
			this.element.style.opacity = 1;
			if(this.element.filters) {
				this.element.filters.item("DXImageTransform.Microsoft.Alpha").opacity = 100;
			}
		}
	};
	
	animax.presets.slideDown = {
		end : 0,
		onStart : function() {
			if(!this.element) return this.finished = true;
			var e = this.element;
			e.style.display = ''; //show it to get the height
			this.values = animax.createValues(this.start, e.offsetHeight, this.style);
			//this.length = this.values.length;
		},
		callback : function(value, elem) {
			elem.style.maxHeight = value + 'px'; //edit max-height so we don't have to calculate paddingtop and bottom.
		},
		onFinish : function() {
			this.element.style.maxHeight = 'none'; //reset max height
		}
	};
	
	animax.presets.slideUp = {
		end : 0,
		onStart : function() {
			if(!this.element) return this.finished = true;
			var e = this.element;
			this.values = animax.createValues(e.offsetHeight, this.end, this.style);
			e.style.overflow = 'hidden';
			//this.length = this.values.length;
			//length doesn't need sorted as alreayd been calculated and 'style' has not changed.
		},
		callback : function(value, elem) {
			elem.style.maxHeight = value + 'px';
		},
		onFinish : function() {
			this.element.style.display = 'none';
			this.element.style.maxHeight = 'none';
		}
	};
	
	animax.presets.scrollUp = {
		end : 0,
		onStart : function() {
			this.values = animax.createValues(window.scrollY, this.end, this.style);
		},
		callback : function(value) {
			window.scrollTo(window.scrollX, value);
		}
	};
	
	animax.presets.scrollTo = { //the number to scroll to must be passed as the second parameter in .create() method
		onStart : function() {
			this.values = animax.createValues(window.scrollY, this.element || 0, this.style);
		},
		callback : function(value) {
			window.scrollTo(window.scrollX, value);
		}
	};
	
	animax.presets.implode = {
		onStart : function() {
			if(!this.element) return this.finished = true;
			this.element.style.overflow = 'hidden';
			this.values = animax.createValues(this.element.offsetWidth, 0, this.style);
			this.data('height', animax.createValues(this.element.offsetHeight, 0, this.style));
		},
		callback : function(value, elem) {
			this.element.style.maxWidth = value + 'px';
			this.element.style.maxHeight = this.data('height')[ this.curTweek ] + 'px';
		},
		onFinish : function() {
			this.element.style.display = 'none';
		}
	};
	
	window.animax = animax;
})();
