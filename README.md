Animax
===============================
Animax is a simple to use Javascript animation handler. Another one? Yes. 

Its easy to use, and efficiently uses requestAnimationFrame when it can. Animations can be stacked up and run all at once if needed, allowing simultaneous animations under one timer. 

It works by first creating an animation object, and then giving that animation object (or multiple objects) to animax to run.

```javascript
var elem = document.getElementById('dropdown');

var slideUp = animax.create('slideUp', elem);
animax.run( slideUp );
```

Creating an Animation Object
---------------------
To create an animation you must call the `animax.create` method. With this method, you can create your own custom animation, or a preset one, and you'll be returned the "animation object". The animation object is just an object literal containing all the data needed for animax to perform the animation.

The "animation object" is the bit you need as it allows you to perform the animation, by giving it to animax.

Here's an example, creating an animation object for moving an element from the left hand side of the page to 500px from the left.
```javascript
var animation = animax.create({
	onStart : function() {
		alert('Here we go!'); //function runs at start of animation
	},
	callback : function(value) { 
		//passed the tweek value to increase.
		document.getElementById('example').style.left = value + 'px';
	},
	onFinish : function() {
		alert('Animation is finished.');
	},
	start : 0,
	end : 500,
	style : 'smooth' //Style of the animation. See styles later on.
});
```

Alternatively, you can create a preset animation by passing a string as the argument:
```javascript
var animation = animax.create('fadeIn', DOMElement);
```
The second argument should be the DOMElement in which the animation is to be performed on. This is optional for some. See more about the presets later on.

#### Possible Values for the object
The object that you pass into the `create` method is the starting basis for the animation object. Any values that you do not include will be added the default values.

```javascript
duration: null, //duration of the animation (only available when running independantly)
onStart: function(){}, //function to run just before the animation is started.
onFinish: function(){}, //function to run when the animation is finished.
callback: function(){}, //required. Function which performs the change, receives the value as the parameter and the element if there is one.
values: [], //the values inbetween the start and the end point. Calculated internally if not specified.
style: 'smooth' //the style of the animation. See styles section later on.
```

#### animationObj.reset()
The same animation object can be used more than once, you don't have to create a new one everytime. In order to use it again however, it must be "reset", simply call the animation objects `reset` method. `animationObj.reset()` and its ready to use again. __Its important to know that the reset method will NOT undo the animation, it will only reset the object ready to be used by Animax again.__

#### animationObject.data(name [,value])
There's also an internal data storage inside an animation object, so you can store data which is accessible inside the onStart, onFinish and callback functions. To store or retreive data call the `data` method of the animation object. 
```javascript
var myAnimation = animax.create({
	start : window.scrollY,
	end : 0,
	onStart : function() {
		this.data('xPos', window.scrollX); //store the starting x position
	},
	callback : function(value) {
		//we need the x value for the scrollBy method, retreive it with data
		window.scrollBy( this.data('x'), value);
	}
});

animax.run(myAnimation); // run the animation
myAnimation.reset(); // reset it ready for use again.
```

Running Animation/s
---------------------------
Now you know how to create an Animation object, you need to know how to run it. There are two ways of doing this; if your going to be running more than one object, then the best thing to do is to add them all to the animax stack and run them all simulataneously, else running an animation independantly will be fine.

#### animax.runAll([callback])  
Using the `animax.runAll()` method, which will run all the stored animations in the most efficient way possible. 

Here's an example, fading out three different elements:
```javascript
var animation1 = animax.create('fadeOut', document.getElementById('one'));
var animation2 = animax.create('fadeOut', document.getElementById('two'));
var animation3 = animax.create('fadeOut', document.getElementById('three'));

animax.add(animation1, animation2, animation3); //add all of the animation objects
animax.runAll(); //run them all simultaneously.
```
The runAll method also takes 1 parameter, a callback function for when all animations are completed. `animax.runAll(function(){ alert('All Done!'); });`

#### animax.run( animationObject [, duration])
Alternatively, if you need to just run one animation object, then your better off using the simple `animax.run( animationObj )` method. Using this method allows you to specfify a duration for the animation to last. (this isn't available with `runAll` as the `requestAnimationFrame` is used which doesn't allow specifying delay. 

```javascript
var animation1 = animax.create('fadeOut', document.getElementById('one'));

animax.run( animation1, 'fast' ); //preset duration of 'fast' 

animation1.reset();

animax.run( animation1, 1000 ); //animation will last 1 second.
```

__That's all the basics you need to know, keep reading to get maximum use out of Animax__


Animation Styles
--------------------------
####What are animation styles?
The "style" dictates how the inbetween values from your start and end points will be calculated, this effects how the animation runs in many ways. 

The best way to think about it, is by considering an animation of an element moving from 0 to 100 (left property). There are many ways of going about this animation; 20 increments of 5px, 10 increments of 10px, even 100 increments 1px. These options are all linear animations, as they all make the same increment each time. This would make a very plain and basic animation. The speed would stay the same throughout, it would suddenly start and suddenly end. 

The styles allow you to make the animations look smooth, accellerate and slow down. Thinking back to our example above, if we were to perform 5 increments of 10, 5 increments of 6 and then 5 increments of 4. It would appear as if the element is slowing down near the end of the animation. 

####How do I create the increments?
The increments that dictate a style is in an array, and each figure in the array represents a percentage increase. 

10 increments of 10: `[10, 10, 10, 10, 10, 10, 10, 10, 10, 10]`
Each increment is 10%, meaning in our 0 to 100 example, 10% will be added on each time, which is of course 10. So it goes 0px, 10px, 20px, 30px, and so on...

If our increment array was like this:
`[1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,3,2,1]`
This would be a much smoother animation, it starts off slow, speeds up in the middle and slows down again. The element would go from 0px, 1px, 3px, 6px, 10px and so on...

__The values must add up to 100 to complete 100% of animation__    
If your values don't add up to 100, then the end value will not be reached. For example, if you have only 5 increments of 10, then only 50% will be completed. 

This is actually handy, as it means you can move an animation backwards from the end value, maybe finishing in the middle or making it go back to the start. 
Consider this example: `[20, 20, 20, 20, 20, -20, -20, -20, -20, -20]`
If this was the increments for our example above, the element would go: 0px 20px 40px 60px 80px 100px 80px 60px 40px 20px 0px. Therefore ending back where it started but in one animation rather than two seperate ones. 

You can create your own styles, by making the style property of your animation object and array of increments. Alternatively, you can add to the Animax styles with `animax.styles['mystyle'] = [10,-10,10,-10,10];` 

####What styles can I choose from?
There aren't many pre-made styles to choose from, but I'll be adding more in the future. Here are the styles to choose from, and there increment arrays:
* 'smooth': `[1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,3,2,1]` - (Default)
* 'accell': `[1,2,3,4,5,6,7,8,9,10,10,11,12,12]` - Gets faster near end.
* 'zoom': `[12,12,11,10,10,9,8,7,6,5,4,3,2,1]` - Starts fast and slows down.
* 'linear': `[10,10,10,10,10,10,10,10,10,10]` - Straight forward plain.
* 'bounce': `[10,10,10,10,10,10,10,10,-8,11,-6,10,-4,8,-3,6,-2,5,-1,4]` - Bounces near the end.
* 'shake': `[6,6,-6,-6,-6,-6,6,6,8,8,-8,-8,-8,-8,8,8,6,6,-6,-6,-6,-6,6,6,5,5,-5,-5,-4,-4,4,4,3,-3]` - Shakes and ends up where it started.

Preset Speeds
----------------------
When your running an animation independantly with `animax.run` you can set a duration for your animation to last. The duration should be in milliseconds, (1000 = 1s).

You can specify your own duration as a number, or choose from 'fast', 'normal', 'slow' or 'slug'. Fast = 400, normal = 800, slow = 2000, slug = 3000.

You can send the duration as the second parameter of the `animax.run` method, or as a duration property of the animation object.
```javascript
var animation = animax.create({
	style : [20, 20, 20, 20, 20, -20, -20, -20, -20],
	duration : 1500,
	start : 0,
	end : 100,
	callback : function(v, e) {
		e.style.left = v + 'px';
	}
}, element);

animax.run( animationObj, 'fast'); // OR set the duration as second paramter. 
```

Preset Animations
---------------------
There are a number of preset animation objects stored in Animax. You can get these objects by passing a string as the first parameter in the create method. Most of these animations often require you to pass a DOMElement as the second parameter too.

For example: `animax.create('fadeOut', document.getElementById('example'));`
Which will return an animation object to make the element fade out. It is used in the same way as other animation objects. 

####Available Presets.
More will be added over time.

__fadeOut__ - make an element fade out. Second argument must be DOM element to fade out.    
__fadeIn__ - Same as fadeOut but fading in obviously.     
__slideUp__ - Make an element slide up and be hidden. Second argument must an element.    
__slideDown__ - same as slideUp but down. To show an element.    
__scrollUp__ - Scroll to top of the page smoothly. (no element needed)    
__scrollTo__ - Scroll the window to a value. (y axis). Second argument must be the value to scroll to.  	 
__implode__ - Implode an element. Decreases width and height at the same time.  
 

Full list of Animax Methods
-----------------------------

#### createValues(start, end, style)
Create an array of values between the start and end point based on the style.

#### add(animationObj [, animationObj2] [, animationObj3] ... )
Add a number of animation objects into animax ready to be run simultaneously.

#### create( string|object [, element|needed value])
Create an animation object either from scratch or one stored inside Animax.

#### runAll([function callback])
Run all the stored animationObjects (added by .add() ) simultaneously. Optional callback is called when all animations are finished.

#### run(animationObj [, string|int duration])
Run an animationObject independantly. 

#### clear() 
Clear animax of all stored animations. After doing this runAll will do nothing, until more animations have been added.

#### resetAll() 
Reset all the stored animation objects ready to be run again.

#### setPreset( string name, object object)
Set an animation object as a preset so it can be used easier in the future.
```javascript
animax.setPreset('grow', {
	start : 0, 
	end : 100,
	callback : function(v, e) {
		e.style.padding = v + 'px';
	}
});

animax.create('grow', document.getElementById('foo'));
```
#### config(string|object option [, mixed value]);
Set a config value, so when a property is not specified in an animation object the default is set.
```javascript
animax.config('duration', 'fast'); //now all objects created which do not specify a duration will be given a duration of 'fast'
```