document.addEventListener(
	'deviceready',	
	function() 
	{ 
		evothings.scriptsLoaded(initialize) 
	},					
	false		
);

// global variables
var iotsensor;
var movingAverage = {'x': [], 'y': []};
var ctx = null;
var needle = null;
var compass = null;

function initialize()
{
	console.log("Initialize function is called");
	iotsensor = evothings.iotsensor.createInstance(evothings.iotsensor.SFL);
	iotsensor.magnetometerCallback(handleMagnetometerData);
	iotsensor.errorCallback(displayConnectionState);
	drawCompass();
	connect();
}

function connect()
{
	displayConnectionState("Scanning...");
	iotsensor.connectToClosestSensor(
		5000,
		function()
		{
			console.log("Connected to IoT Sensor");
			document.getElementById("connection_state").style.display = "none";
			document.getElementById("compass").style.display = "block";
			magnetometerOn();
		},
		function(error)
		{
			displayConnectionState("Disconnected");
			console.log("Disconnect error " + error);
			document.getElementById("connection_state").style.display = "block";
			document.getElementById("compass").style.display = "none";
		}
	);
}

function magnetometerOn()
{
	iotsensor.magnetometerOn();
}

function handleMagnetometerData(data)
{
	var samples = 5;
	var x = data.x;
	var y = data.y;

	// Add x to the beginning of the array
	movingAverage.x.unshift(x);
	movingAverage.y.unshift(y);
	
	x = calculateMovingAverage('x', samples);
	y = calculateMovingAverage('y', samples);

	if (y == 0 )
	{
		// If y is 0 value is 0 because you can't divide by 0
		value = 0;
	} else if(y > 0)
	{
		// For the left half of the compass
		value = 90 - (Math.atan(x/y) * 180/Math.PI);
	} else {
		// For the right half of the compass
		value = 270 - (Math.atan(x/y) * 180/Math.PI);
	}
	
	draw(360 - value); // Reverse needle rotation
}

function displayConnectionState(message)
{
	if(message == "IOTSENSOR_NOT_FOUND"){
		message = "IoT Sensor not found";
	}
	document.getElementById("connection_state").innerHTML = message;
}

function calculateMovingAverage(key, samples)
{
	// Reset the total to 0
	var total = 0;
	
	// Remove the last element of the array if the array is to big
	if(movingAverage[key].length >= samples)
	{
		movingAverage[key].pop();
	}
	
	// Calculate the total
	movingAverage[key].forEach(
		function(item, index)
		{
			total += item;
		}
	);
	
	// Calculate the average
	var average = total/movingAverage[key].length;
	
	return average;
}

function drawCompass()
{
	// Grab the compass element
	var canvas = document.getElementById('compass');
	
	// -14 to compensate for the padding 2*7
	canvas.width = document.getElementById("connect_button").clientWidth - 14;
	canvas.height = canvas.width;
	// Canvas supported?
	if(canvas.getContext('2d'))
	{
		ctx = canvas.getContext('2d');
		
		// Load the needle image
		needle = new Image();
  		needle.src = 'images/needle.png';

  		// Load the compass image
		compass = new Image();
		compass.src = 'images/compass.png';
	}
  	else
  	{
  		alert("Canvas not supported!");
  	}
}

function clearCanvas()
{
	 // clear canvas
	ctx.clearRect(
		0, 
		0, 
		document.getElementById("compass").width, 
		document.getElementById("compass").height);
}

function draw(degrees) 
{
	var width  = document.getElementById("compass").width;
	var height = document.getElementById("compass").height;
	clearCanvas();
	
	// Draw the compass onto the canvas
	ctx.drawImage(compass, 0, 0, width,height);
	
	// Save the current drawing state
	ctx.save();

	// Now move across and down half the 
	ctx.translate(width/2, height/2);
 
	// Rotate around this point
	ctx.rotate(degrees * (Math.PI / 180));
 
	// Draw the image back and up
	ctx.drawImage(needle, -(width/2), -(height/2), width, height);
	
	// Restore the previous drawing state
	ctx.restore();
}