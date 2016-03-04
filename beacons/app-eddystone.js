// JavaScript code for the Dialog Eddystone example app.

// Application object
var eddystone = {};

(function(){

// Dictionary of beacons.
var beacons = {};

// Timer that displays list of beacons.
var timer = null;

// Regions that define which page to show for each beacon.
var beaconData = {
	'B0:D8:4A:E8:F0:A6': 'page-eddystone-elephant',
	'B4:EA:C5:38:4E:0E': 'page-eddystone-giraffe'
};

// Currently displayed page.
var currentPage = 'page-eddystone-default';

// Check for beacons with an rssi higher than this value
var rssiLimit = -50; 
var rssiOffset = -30;

// false when scanning is off. true when on.
var isScanning = false;

eddystone.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(onDeviceReady) },
		false);
};

function onDeviceReady()
{
	// Not used.
	// Here you can update the UI to say that
	// the device (the phone/tablet) is ready
	// to use BLE and other Cordova functions.
};

// Called when button is pressed
eddystone.startStop = function()
{
	if(isScanning)
	{
		document.getElementById('eddystone-start-stop').innerHTML = 'START EDDYSTONE';
		stop();
	}
	else
	{
		document.getElementById('eddystone-start-stop').innerHTML = 'STOP EDDYSTONE';
		start();
	}
};

function start()
{
	isScanning = true;

	// Display default page
	gotoPage(currentPage);

	// Start tracking beacons!
	setTimeout(startScan, 500);
	
	// Timer that refreshes the display.
	timer = setInterval(updateBeaconList, 2000);
};

function stop()
{
	isScanning = false;

	// Stop tracking beacons
	evothings.eddystone.stopScan();

	// Clear beacons
	beacons = {};
	$('#found-eddystone-beacons').empty();

	// Cancel timer
	clearInterval(timer);

	// Clear screen
	hidePage(currentPage);
	currentPage = 'page-eddystone-default';
};

function startScan()
{
	console.log('Scan in progress.');
	evothings.eddystone.startScan(
		function(beacon)
		{
			// Update beacon data.
			// Only store beacons that are already defined
			if(beaconData[beacon.address]) 
			{
				beacon.timeStamp = Date.now();
				beacons[beacon.address] = beacon;
			}
		},
		function(error)
		{
			console.log('Eddystone scan error: ' + error);
		});
};

// Map the RSSI value to a value between 1 and 100.
function mapBeaconRSSI(rssi)
{
	if (rssi >= 0) return 1; // Unknown RSSI maps to 1.
	if (rssi < -100) return 100; // Max RSSI
	return 100 + rssi;
};

function getSortedBeaconList(beacons)
{
	var beaconList = [];
	for (var key in beacons)
	{	
		beaconList.push(beacons[key]);
	}

	beaconList.sort(function(beacon1, beacon2)
	{
		return mapBeaconRSSI(beacon1.rssi) < mapBeaconRSSI(beacon2.rssi);
	});
	return beaconList;
};

function updateBeaconList()
{
	removeOldBeacons();
	displayBeacon();
};

function removeOldBeacons()
{
	var timeNow = Date.now();
	for (var key in beacons)
	{
		// Only show beacons updated during the last 12.5 seconds.
		var beacon = beacons[key];
		if ((timeNow - beacon.timeStamp) > 12500)
		{
			delete beacons[key];
		}
	}
};

function displayBeacon()
{
	// Clear beacon list
	$('#found-eddystone-beacons').empty();

	var sortedList = getSortedBeaconList(beacons);

	if(sortedList.length == 0)
	{
		gotoPage('page-ibeacon-default');
		return;
	}

	var beacon = sortedList[0]; // We only care about the closest one
	// console.log('Eddystone: ' + beacon.address + ' RSSI: ' + beacon.rssi);

	// Map the RSSI value to a width in percent for the indicator.
	var rssiWidth = 1; // Used when RSSI is zero or greater.
	if (beacon.rssi < -100) { rssiWidth = 100; }
	else if (beacon.rssi < 0) { rssiWidth = 100 + beacon.rssi; }

	// Create tag to display beacon data.
	var element = $(
		'<li>'
		+	'<strong>Name</strong>: ' + beacon.name + '<br />'
		+	'<strong>MAC Address</strong>: ' + beacon.address + '<br />'
		+	'<strong>URL</strong>: ' + beacon.url + '<br />'
		+	'<strong>NID</strong>: ' + uint8ArrayToString(beacon.nid)+ '<br />'
		+	'<strong>BID</strong>: ' + uint8ArrayToString(beacon.bid) + '<br />'
		+	'<strong>Voltage</strong>: ' + beacon.url + '<br />'
		+	'<strong>Temperature</strong>: ' + beacon.temperature + '<br />'
		+	'<strong>RSSI</strong>: ' + beacon.rssi + '<br />'
		+ 	'<div style="background:rgb(128,64,255);height:20px;width:'
		+ 		rssiWidth + '%;"></div>'
		+ '</li>'
	);

	$('#found-eddystone-beacons').append(element);

	var pageId = beaconData[beacon.address];

	// If the beacon is close and represents a new page, then show the page.
	if(beacon.rssi >= rssiLimit && currentPage != pageId)
	{
		gotoPage(pageId); 
		return;
	}

	// If the beacon represents the current page but is far away,
	// then show the default page.
	if (beacon.rssi < (rssiLimit + rssiOffset) && currentPage == pageId)
	{
		gotoPage('page-eddystone-default');
		return;
	}

};

function uint8ArrayToString(uint8Array)
{
	function format(x)
	{
		var hex = x.toString(16);
		return hex.length < 2 ? '0' + hex : hex;
	}

	var result = '';
	for (var i = 0; i < uint8Array.length; ++i)
	{
		result += format(uint8Array[i]) + ' ';
	}
	return result;
};

function gotoPage(pageId)
{
	hidePage(currentPage);
	showPage(pageId);
	currentPage = pageId;
};

function showPage(pageId)
{
	document.getElementById(pageId).style.display = 'block';
};

function hidePage(pageId)
{
	document.getElementById(pageId).style.display = 'none';
};

})(); // End of closure.

// Initialize eddystone
eddystone.initialize();