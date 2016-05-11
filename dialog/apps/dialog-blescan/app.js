var scanTime = 30000; // Scan for 30 seconds
var devices = {};
var scanAddresses = ['80:EA:CA:00:00:FD', '80:EA:CA:00:01:FD'];
var updateTimer = null;

function onScanbutton()
{
	evothings.easyble.stopScan();
	displayStatus('Scanning for Bluetooth devices...');

	// Start scanning for devices.
	// If a device is found, set the timestamp and
	// insert the device into the array of devices
	evothings.easyble.startScan(
		function(device)
		{		
			if(device.rssi <= 0)
			{
				if(scanAddresses.indexOf(device.address) !== -1)
				{
					// Set timestamp for device (this is used to remove
					// inactive devices).
					device.timeStamp = Date.now();

					// Insert the device into table of found devices.
					devices[device.address] = device;
					console.debug('adding device to list' + JSON.stringify(device));
				}
				else
				{
					console.debug('else' + JSON.stringify(device));
				}
			}
		},
		function(error)
		{
			console.debug('Scan error: ' + error);
		}
	);

	// Update the device list every 500ms
	updateTimer = setInterval(displayDeviceList, 500);

	// Automatically stop scanning after a certain time 
	setTimeout(
		function() 
		{

			evothings.easyble.stopScan();
			displayStatus('Stopped Scanning');
			clearInterval(updateTimer);
		}, 
		scanTime
	); 
}


// Display the device list
function displayDeviceList()
{
	// Clear device list
	document.getElementById('found-devices').innerHTML = '';

	for(address in devices)
	{
		var device = devices[address];

		// Only show devices that are updated during the last 10 seconds
		if(device.rssi <= 0)
		{
			console.debug("blablabla");
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

function displayStatus(message)
{
	console.debug(message);
	document.getElementById('status').innerHTML = message;
};

function onInputButton()
{
	var address = prompt("Add new BD Address, for example: 80:EA:CA:00:D0:6D");
	scanAddresses.push(address);
}