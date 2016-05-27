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

var gauges = {
	'thermometer': {'ctx': null,
					'background': null,
					'imageName': 'images/thermometer.png',
					'needle': null,
					'degrees': 0},
						
	'hygrometer': { 'ctx': null,
					'background': null,
					'imageName': 'images/hygrometer.png',
					'needle': null,
					'degrees': 0},

	'barometer': {	'ctx': null,
					'background': null,
					'imageName': 'images/barometer.png',
					'needle': null,
					'degrees': 0},
};					

function initialize()
{
	console.log("Initialize function is called");
	iotsensor = evothings.iotsensor.createInstance(evothings.iotsensor.SFL);
	iotsensor.errorCallback(displayConnectionState);
	initSensors();
	initDraw();
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
			document.getElementById("connect_button").style.display = "none";
			for(key in gauges)
			{
				document.getElementById(key).style.display = "block";
			}
			sensorsOn();
		},
		function(error)
		{
			displayConnectionState("Disconnected");
			console.log("Disconnect error " + error);
			document.getElementById("connection_state").style.display = "block";
			document.getElementById("connect_button").style.display = "block";
			for(key in gauges)
			{
				document.getElementById(key).style.display = "none";
			}
		}
	);
}

function displayConnectionState(message)
{
	if(message == "IOTSENSOR_NOT_FOUND"){
		message = "IoT Sensor not found";
	}
	document.getElementById("connection_state").innerHTML = message;
}

function sensorsOn()
{
	iotsensor.temperatureOn();
	iotsensor.humidityOn();
	iotsensor.barometerOn();
}

function initSensors()
{
	iotsensor.temperatureCallback(handleThermometerData);
	iotsensor.humidityCallback(handleHygrometerData);
	iotsensor.barometerCallback(handleBarometerData);
}

function handleThermometerData(data)
{
	gauges.thermometer.value = data + " °C";
	gauges.thermometer.degrees = (parseInt(data) + 10) * 5.4 - 135;
}

function handleHygrometerData(data)
{
	gauges.hygrometer.value = data + "%";
	gauges.hygrometer.degrees = parseInt(data) * 2.7 - 135;
}

function handleBarometerData(data)
{
	gauges.barometer.value = data + " hPa";
	gauges.barometer.degrees = (parseInt(data) - 930) * 2 - 135;
}

function showWeatherText(key)
{
	var weatherText = "no data";
	var value = parseInt(gauges[key].value);
	switch(key)
	{
		case 'thermometer':
			if(value <= 0)
			{
				weatherText = 'Freezing';
			} else if (value > 0 && value <= 10)
			{
				weatherText = 'Cold';
			} else if (value > 10 && value <= 18)
			{
				weatherText = 'Chilly';
			} else if (value > 18 && value <= 25)
			{
				weatherText = 'Warm';
			} else 
			{
				weatherText = 'Hot';
			}
		break;
		
		case 'barometer':
			if(value <= 965)
			{
				weatherText = 'Stormy';
			} else if (value > 965 && value <= 985)
			{
				weatherText = 'Rain';
			} else if (value > 985 && value <= 1015)
			{
				weatherText = 'Change';
			} else if (value > 1015 && value <= 1035)
			{
				weatherText = 'Fair';
			} else 
			{
				weatherText = 'Very dry';
			}
		break;
		
		case 'hygrometer':
		if(value <= 30)
			{
				weatherText = 'Dry';
			} else if (value > 30 && value <= 70)
			{
				weatherText = 'Comfortable';
			} else 
			{
				weatherText = 'Wet';
			}
		break;
		
		default:
	}
	
	return weatherText
}

var headingSize = 35;

function initDraw()
{
	// Grab the thermometer element
	for(key in gauges)
	{
		var canvas = document.getElementById(key);
		if(document.body.clientWidth > 550)
		{
			canvas.width = document.body.clientWidth/3;
		} else {
			canvas.width = document.body.clientWidth;
		}		
		
		canvas.height = canvas.width + headingSize;

		
		gauges[key].ctx = canvas.getContext('2d');
			
		// Load the needleTherm image
		gauges[key].needle = new Image();
		gauges[key].needle.src = 'images/needle.png';
			
		gauges[key].background = new Image();
			
		gauges[key].background.src = gauges[key].imageName;
		setInterval(draw, 1000);
	}
}

function clearCanvas(key)
{
	 // clear canvas
	gauges[key].ctx.clearRect(
		0, 
		0, 
		document.getElementById(key).width, 
		document.getElementById(key).height
	);
}

function draw() 
{
	for(key in gauges)
	{
		var width  = document.getElementById(key).width;
		var height = document.getElementById(key).height - headingSize;
		clearCanvas(key);
		
		var ctx = gauges[key].ctx;
		
		// Draw the thermometer onto the canvas
		ctx.drawImage(gauges[key].background, 0, headingSize, width,height);
		
		ctx.font = headingSize/2 + "px Arial";
		//ctx.font = width/300 +"em Arial";
		ctx.textAlign = "center";
		ctx.fillText(gauges[key].value, width/2, height - height/12 + headingSize);
		ctx.fillText(showWeatherText(key), width/2, height - height/6 + headingSize);
		
		
		ctx.fillText(key,width/2,headingSize/2);
		
		
		// Save the current drawing state
		ctx.save();

		// Now move across and down half the 
		ctx.translate(width/2, height/2 + headingSize);
	 
		// Rotate around this point
		ctx.rotate(gauges[key].degrees * (Math.PI / 180));
	 
		// Draw the image back and up
		ctx.drawImage(gauges[key].needle, -(width/2), -(height/2), width, height);

		// Restore the previous drawing state
		ctx.restore();
	}
}