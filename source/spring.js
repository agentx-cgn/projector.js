/*
    ///////////////////////////////////////////////////////////////////////////////////////////////////
	Author Matthaeus Krenn
	http://thingsfromthefuture.com
	May 2011
	///////////////////////////////////////////////////////////////////////////////////////////////////
*/

function mSpring(options) {
	var spring = this;
	this.options = options;
	
	//triggers one calculation cycle to change the spring.
	this.stepTrigger = false;
	
	//initiates the spring Class
	spring.init();
	
	//assings the function that is called each time the spring starts from rest state.
	spring.onSpringStart = options.onSpringStart;
	
	//assings the function that is called each time the spring changes.
	spring.onSpringChange = options.onSpringChange;
	
	//assigns the funtion that is called when the spring goes to a rest state.
	spring.onSpringRest = options.onSpringRest;
}



mSpring.prototype.init = function () {
	var spring = this;
	
	spring.anchor = 0;
	spring.interval = 0;
    spring.end = 0;
    spring.acceleration = 0;
	spring.distance = 0;
	spring.speed = 0;
	spring.springForce = 0;
	spring.dampingForce = 0;
	spring.totalForce = 0;
	spring.anchorPos = 0;
	spring.massPos = 0;
	
	//sets the constant spring parameters to a useful standard, 120, 10, 3
	spring.setSpringParameters(120, 10, 3);
}









//this gives the spring an impulse
//impulses can also be given while spring is in motion in order to alter its state
mSpring.prototype.start = function (acceleration, massPos, speed, anchorPos) {
	var spring = this;
	
	spring.onSpringStart();
	
	spring.massPos = (typeof massPos != 'undefined') ? massPos : spring.massPos;
	
	spring.speed = (typeof speed != 'undefined') ? speed : spring.speed;
	
	spring.speed += acceleration*10 || 0;
	
	spring.anchorPos = (typeof anchorPos != 'undefined') ? anchorPos : spring.anchorPos;

	spring.step();
}



//one step is one recalculation of all spring variables when in motion
mSpring.prototype.step = function () {
	var spring = this;
	
	spring.distance = spring.massPos - spring.anchorPos;
	
    spring.dampingForce = -spring.friction * spring.speed;
    
	spring.springForce = -spring.stiffness * spring.distance;

    spring.totalForce = spring.springForce + spring.dampingForce;

    spring.acceleration = spring.totalForce / spring.mass;

    spring.speed += spring.acceleration;

    spring.massPos += spring.speed/100;

	if (Math.round(spring.massPos) == spring.anchorPos && Math.abs(spring.speed) < 0.2) {
		spring.removeStepTrigger();
	} else {		
		spring.onSpringChange(Math.round(spring.massPos), {	distance: spring.distance,
															acceleration: spring.acceleration,
															speed: spring.speed });
		spring.setStepTrigger();
	}
}



//use this to change the spring parameters
mSpring.prototype.setSpringParameters = function (stiffness, mass, friction) {
	var spring = this;
	
	spring.stiffness = stiffness;
    spring.mass = mass;
    spring.friction = friction;
}



//use this to get the spring parameters
mSpring.prototype.getSpringParameters = function () {
	var spring = this;
	
	return {
		stiffness: spring.stiffness,
		mass: spring.mass,
		friction: spring.friction
	};
}



//this sets the timer for the next step
mSpring.prototype.setStepTrigger = function () {
	var spring = this;
	clearTimeout(spring.stepTrigger);
	spring.stepTrigger = setTimeout(() => {spring.step()}, spring.interval);
}



//this stops the spring from performing the next step
mSpring.prototype.removeStepTrigger = function () {
	var spring = this;
	spring.stepTrigger = false; //removeTimeout(spring.step(), 10);
	spring.onSpringRest();
}



//this assigns a new function to be called when the spring starts to move
mSpring.prototype.setOnSpringStart = function (onSpringStart) {
	var spring = this;
	spring.onSpringStart = onSpringStart;
}


//this assigns a new function to be called at each spring calculation cycle
mSpring.prototype.setOnSpringChange = function (onSpringChange) {
	var spring = this;
	spring.onSpringChange = onSpringChange;
}


//this assigns a new function to be called when the spring stops moving
mSpring.prototype.setOnSpringRest = function (onSpringRest) {
	var spring = this;
	spring.onSpringChange = onSpringRest;
}





