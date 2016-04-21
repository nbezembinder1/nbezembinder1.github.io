document.addEventListener(
	'deviceready',
	function() { evothings.scriptsLoaded(initialize) },
	false
);

var counter = 1; 	//counter counts till 10 and then returns to 1
					//10 counter points for 10x 100 bytes package

// Application object
var app = {};

// connected device
var device = null;

// Discovered devices
var devices = {};

// Timer that updates the device list and removes inactive
// devices in case no devices are found by scan.
var updateTimer = null;

// UUID's used to control the button & LED
var SERVICE_UUID			= 	'edfec62e-9910-0bac-5241-d8bda6932a2f'; 
var COUNTER_UUID			= 	'0783b03e-8535-b5a0-7140-a304d2495cbc'; // Write char: Used to increase counter
var DATA_UUID				= 	'0783b03e-8535-b5a0-7140-a304d2495cbb'; // This characteristic tells us if new data is ready
var NOTIFICATION_DESCRIPTOR	=	'00002902-0000-1000-8000-00805f9b34fb'; // Notification descriptor used to enable notifications (Android only)

var scanTime = 15000; // default scan time in ms

function initialize()
{	
	setEventHandlers();
};

/**
 * The displayConnectStatus displays the connection status
 */
function displayConnectStatus(message)
{
	console.log(message);
	document.getElementById('scan-status').innerHTML = message;
};

// Called when Start Scan button is selected.
app.onStartScanButton = function()
{
	displayConnectStatus('Scanning for Bluetooth devices...');

	// Start scanning for devices.
	// If a device is found, set the timestamp and
	// insert the device into the array of devices
	evothings.easyble.startScan(
		function(device)
		{		
			// Set timestamp for device (this is used to remove
			// inactive devices).
			device.timeStamp = Date.now();

			// Insert the device into table of found devices.
			devices[device.address] = device;
		},
		function(error)
		{
			console.log('Scan error: ' + error);
		}
	);

	// Update the device list every 500ms
	updateTimer = setInterval(displayDeviceList, 500);

	// Automatically stop scanning after a certain time 
	setTimeout(
		function() 
		{
			if(device == null)
			{
				evothings.easyble.stopScan();
				displayConnectStatus('Not Connected');
				clearInterval(updateTimer);
			}
		}, 
		scanTime
	); 
};

// Called when Disconnect button is pressed.
app.onDisconnectButton = function()
{
	location = '#'; // Return to 'home' screen
	//evothings.easyble.closeConnectedDevices();
	
	devices = {}; // Remove all previously found devices
	displayConnectStatus('Disconnected');
	displayDeviceList();
	device.close(); // Disconnect device
	device = null;
};



// Display the device list
function displayDeviceList()
{
	// Clear device list
	document.getElementById('found-devices').innerHTML = '';

	for(address in devices)
	{
		var device = devices[address];

		// Only show devices that are updated during the last 10 seconds
		if(device.timeStamp + 10000 > Date.now() && device.rssi <= 0)
		{
			addDeviceToView(device);
		}
	}
}

function addDeviceToView(device)
{
	var rssiWidth = 100; // Used when RSSI is zero or greater
	if (device.rssi < -100) { rssiWidth = 0; }
	else if (device.rssi < 0) { rssiWidth = 100 + device.rssi; }

	// Create tag for device data.
	var element = 
		'<li >'
		+	'<strong>' + device.name + '</strong> <br />'
		// Do not show address on iOS since it can be confused
		// with an iBeacon UUID.
		+	(evothings.os.isIOS() ? '' : device.address + '<br />')
		+	'<button onclick="app.connect(\'' + device.address 
		+ '\')" class="red">CONNECT</button> <br />'
		+ 	 device.rssi 
		+ 	'<div style="background:rgb(225,0,0);height:20px;width:'
		+ 		rssiWidth + '%;">'
		+ 	'</div>'
		+ '</li>';

	document.getElementById('found-devices').innerHTML += element;
}

app.connect = function(address) 
{
	device = devices[address]; // Store device for future use
	devices = {};
	
	if(device === undefined)
	{
		return;
	}

	evothings.easyble.stopScan();

	displayConnectStatus('Connecting to: ' + device.name);

	device.connect(
		function(success)
		{	
			console.log('Connected to: ' + device.name);
			displayDeviceList();
			// No longer update the list of found devices
			clearInterval(updateTimer); 

			// Read service characteristics.
			device.readServices(
				[SERVICE_UUID],
				function()
				{
					console.log('Service characteristics read for: ' + device.name);

					// Finished reading services, enable data notification
					enableNotification();
				},
				function(error)
				{
					console.log('Error reading services: ' + error);
				}
			);
		},
		function(error)
		{
			// Connection error, clear screen
			devices = {};
			device = null;
			displayDeviceList();
			window.location = '#';
			displayConnectStatus('Connect error: '+ error);
		}
	);
};

app.onReadButton = function()	
{
	if(!device)
	{
		return;
	}

	// Reset counter to 1
	counter = 1;
	// Start writing the counter
	writeCounter();

}

function writeCounter()
{
	// Write counter to characteristic, the notification will tell us if new data is available
	device.writeServiceCharacteristic(
		SERVICE_UUID,
		COUNTER_UUID,
		new Uint8Array([counter]),
		function() 
		{ 
			console.log("write serviceCharacteristic succesfull: " + counter);
		},
		function(error) 
		{ 
			console.log("write serviceCharacteristic error: " + error);
		}
	);	
}

function enableNotification()
{
	console.log('Enabling notifications');

	// Enable data notification, only required for Android
	device.writeServiceDescriptor(
		SERVICE_UUID,
		DATA_UUID,
		NOTIFICATION_DESCRIPTOR,
		new Uint8Array([1,0]),
		function() 
		{
			console.log("write serviceDescriptor data notification succesfull");

			// All done, show the buttons
			window.location = '#connected';
		},
		function(error) 
		{
			console.log("write serviceDescriptor data notification error: " + error);
		}
	);

	// Start data notification
	device.enableServiceNotification(
		SERVICE_UUID,
		DATA_UUID,
		function(data) 
		{ 
			// Data callback, called everytime new data is available.
			showReadData(new Uint8Array(data));

			// Increase counter after succesfull notification and write new counter to characteristic
			if(counter < 10)
			{
				writeCounter(counter++);
			}
		},
		function(error) {
			console.log('Error enabling data notification: ' + error);
		}
	);
}

// Print array to screen
function showReadData(arr)
{			
	if(counter <= 1)
	{
		console.log('Clear screen');
		document.getElementById("table").innerHTML = "";
	}
	
	console.log('Data: ' + JSON.stringify(arr));

	var data = typedArrayToHexString(arr);
	
	var table =	"<th style='text-align: left; width: 35%'>counter: " + counter + "</th>";
	table +=	"<th style='text-align: right'>time: " + currentTime() + "</th>";
	table +=	"<tr>";
	table +=	"<td colspan='2'>" + data + "</td>";
	table += 	"</tr>";
	
	// Add new table to top of old table
	document.getElementById("table").innerHTML = table + document.getElementById("table").innerHTML;
}

function currentTime()
{
	var date = new Date();
	return (('0' + date.getHours()).slice(-2)
				 + ':' + ('0' + date.getMinutes()).slice(-2)
				 + ':' + ('0' + date.getSeconds()).slice(-2)
				 + '.' + ('00' + date.getMilliseconds()).slice(-3));
}

function setEventHandlers()
{
	document.addEventListener(
		"backbutton",
		function()
		{
			console.log("test backbutton");
			//disable backbutton
		},
		false
	);
}

// Shameless copy from evothings.util library
// Returns integer i in hexadecimal string form
function toHexString(i, byteCount)
{
	var string = (new Number(i)).toString(16);
	while(string.length < byteCount*2) {
		string = '0'+string;
	}
	return string;
}

// Return hexadecimal representation from ArrayBuffer or TypedArray
function typedArrayToHexString(data)
{
	// view data as a Uint8Array, unless it already is one.
	if(data.buffer) {
		if(!(data instanceof Uint8Array))
			data = new Uint8Array(data.buffer);
	} else if(data instanceof ArrayBuffer) {
		data = new Uint8Array(data);
	} else {
		throw "not an ArrayBuffer or TypedArray.";
	}
	var str = '';
	for(var i=0; i<data.length; i++) {
		str += '0x' + evothings.util.toHexString(data[i], 1) + ' '; 
	}
	return str;
}