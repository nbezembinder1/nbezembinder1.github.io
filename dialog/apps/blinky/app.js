var app = (function()
{
	// Application object
	var app = {};

	// Discovered devices
	var devices = {};

	// Reference to the device we are connecting to
	var connectee = null;

	// Handle to the connected device
	var deviceHandle = null;

	// Variables used to control the LED
	var blinkSpeedVal = 50;
	var ledStatus = 0;

	// Store characteristics as UUID/Characteristic map
	var characteristics = {};

	// Timer that updates the device list and removes inactive
	// devices in case no devices are found by scan.
	var updateTimer = null;

	// UUID's used to control the button & LED
	var CHAR_UUID_LED 					= '5a87b4ef-3bfa-76a8-e642-92933c31434f';
	var CHAR_UUID_BLINK 				= '8b7f8ebb-661d-c594-e511-4dd564cbb0d8';
	var CHAR_UUID_BUTTON 				= '6c290d2e-1c03-aca1-ab48-a9b908bae79e';
	var CHAR_CONFIGURATION_DESCRIPTOR 	= '00002902-0000-1000-8000-00805f9b34fb';

	var scanTime = 25000; // default scan time in ms

	app.initialize = function()
	{
		document.addEventListener(
			'deviceready',
			function() { evothings.scriptsLoaded(onDeviceReady) },
			false);
	};

	// Display a scan status message
	function displayConnectStatus(message)
	{
		$('#scan-status').html(message);
	};

	function onDeviceReady()
	{
		// Not used.
		// Here you can update the UI to say that
		// the device (the phone/tablet) is ready
		// to use BLE and other Cordova functions.
	};

	// Start the scan. Call the callback function when a device is found.
	// Format:
	//   callbackFun(deviceInfo, errorCode)
	//   deviceInfo: address, rssi, name
	//   errorCode: String
	function startScan(callbackFun)
	{
		disconnect(); // Only one device can be connected
		devices = {}; // Clear the list of devices before we start scanning

		evothings.ble.startScan(
			function(device)
			{
				// Report success. Sometimes an RSSI of +127 is reported.
				// We filter out these values here.
				if (device.rssi <= 0)
				{
					callbackFun(device, null);
				}
			},
			function(errorCode)
			{
				// Report error.
				callbackFun(null, errorCode);
			}
		);
	};

	// Disconnect from device.
	function disconnect()
	{
		evothings.ble.stopScan();
		evothings.ble.close(deviceHandle);
	};

	// Called when Start Scan button is selected.
	app.onStartScanButton = function()
	{
		startScan(deviceFound);
		displayConnectStatus('Scanning for Bluetooth devices...');
		updateTimer = setInterval(displayDeviceList, 500);
		// Automatically stop scanning after a certain time 
		setTimeout(
			function() {
				evothings.ble.stopScan();
				displayConnectStatus('Not Connected');
				clearInterval(updateTimer);
			}, 
			scanTime
		); 
	};

	// Called when Disconnect button is selected.
	app.onDisconnectButton = function()
	{
		disconnect();
		devices = {};
		displayConnectStatus('Disconnected');
		displayDeviceList();
		clearInterval(updateTimer);
	};

	// Called when a device is found.
	function deviceFound(device, errorCode)
	{
		if (device)
		{
			// Set timestamp for device (this is used to remove
			// inactive devices).
			device.timeStamp = Date.now();

			// Insert the device into table of found devices.
			devices[device.address] = device;
		}
		else if (errorCode)
		{
			displayConnectStatus('Scan Error: ' + errorCode);
		}
	};

	// Display the device list.
	function displayDeviceList() {
		
		// Clear device list.
		$('#found-devices').empty();

		var timeNow = Date.now();

		$.each(devices, function(key, device)
		{
			// Only show devices that are updated during the last 10 seconds.
			if (device.timeStamp + 10000 > timeNow)
			{
				// Map the RSSI value to a width in percent for the indicator.
				var rssiWidth = 100; // Used when RSSI is zero or greater.
				if (device.rssi < -100) { rssiWidth = 0; }
				else if (device.rssi < 0) { rssiWidth = 100 + device.rssi; }
				
				// Create tag for device data.
				var element = $(
					'<li >'
					+	'<strong>' + device.name + '</strong><br />'
					// Do not show address on iOS since it can be confused
					// with an iBeacon UUID.
					+	(evothings.os.isIOS() ? '' : device.address + '<br />')
					+	device.rssi
					+ ' <button onclick="app.connect(\'' + device.address + '\')" class="red right">CONNECT</button>'
					+ '</li>'
				);

				$('#found-devices').append(element);
			}
		});	
	};

	app.connect = function(address) {
		evothings.ble.stopScan();
		displayConnectStatus('Connecting...');
		evothings.ble.connect(
			address,
			function(connectInfo)
			{
				if (connectInfo.state == 2) // Connected
				{
					deviceHandle = connectInfo.deviceHandle;
					connectee = devices[address];
					displayConnectStatus('Connected to ' + connectee.name);

					readAll(deviceHandle);
					
					devices = {}; // Clear the list after connection
				
					window.location = '#connected';
				}
				else
				{
					displayConnectStatus('Disconnected');
					window.location = '#';
				}
			},
			
			function(errorCode)
			{
				window.location = '#';
				displayConnectStatus('Connect error: ' + errorCode);

			}
		);
	};

	function readAll(deviceHandle){
	    console.log('Reading services...');

	    evothings.ble.readAllServiceData(
			deviceHandle, 
			function(services)
			{
				for (var si in services)
				{
					var service = services[si];
					
					for (var ci in service.characteristics)
					{
						var characteristic = service.characteristics[ci];
						characteristics[characteristic.uuid] = characteristic;
						
						for(var di in characteristic.descriptors) 
						{
							var descriptor = characteristic.descriptors[di];
							characteristics[characteristic.uuid].descriptors[descriptor.uuid] = descriptor;
						}
					}
				}

				if(characteristics[CHAR_UUID_BUTTON].handle && characteristics[CHAR_UUID_BUTTON].descriptors[CHAR_CONFIGURATION_DESCRIPTOR].handle) 
				{	
					console.log("Start reading notifications");
					startReading(deviceHandle);
				}
				
			},
			function(errorCode)
			{
				console.log('readAll error: ' + errorCode);
			}
		);	
	};

	function startReading(deviceHandle)
	{
		
		// Turn notifications on
	   write(
	      'writeDescriptor',
	      deviceHandle,
	      characteristics[CHAR_UUID_BUTTON].descriptors[CHAR_CONFIGURATION_DESCRIPTOR].handle,
	      new Uint8Array([1,0]));

	   // Start reading notifications.
	   evothings.ble.enableNotification(
	      deviceHandle,
	      characteristics[CHAR_UUID_BUTTON].handle,
	      function(data)
	      {
	      	// Callback function for button notification
	      	var bg = document.getElementById('connected');

			if(bg.style.backgroundColor == 'white')
			{
				bg.style.backgroundColor = 'yellow';
			} else 
			{
				bg.style.backgroundColor = 'white';
			}
	      },
	      function(errorCode)
	      {
	         console.log('enableNotification error: ' + errorCode);
	      });
	};

	function write(writeFunc, deviceHandle, handle, value)
	{
		if (handle)
		{
			evothings.ble[writeFunc](
				deviceHandle,
				handle,
				value,
				function()
				{
					console.log(writeFunc + ': ' + handle + ' success.');
				},
				function(errorCode)
				{
					console.log(writeFunc + ': ' + handle + ' error: ' + errorCode);
				});
		}
	};

	// Called when Toggle button is selected
	app.toggle = function() 
	{
		ledStatus = !ledStatus;

		write(
			'writeCharacteristic',
			deviceHandle,
			characteristics[CHAR_UUID_LED].handle,
			new Uint8Array([ledStatus]));
	};

	// Called when Blink button/slider is selected
	app.blink = function(value)
	{	
		if(value != null)
		{
			blinkSpeedVal = 100 - value;
		}
		
		write(
			'writeCharacteristic',
			deviceHandle,
			characteristics[CHAR_UUID_BLINK].handle,
			new Uint8Array([blinkSpeedVal]));
		
		$('#speed-status').html(' LED speed ' + (100-blinkSpeedVal) + '%');
	};

	// Called when the Scan time slider is selected
	app.setScanTime = function(value)
	{
		scanTime = value * 1000; // we need time in ms
		$('#scan-time').html('Bluetooth scan time: ' + value + ' seconds');
	};

	return app;

})();

// Initialise app.
app.initialize();
