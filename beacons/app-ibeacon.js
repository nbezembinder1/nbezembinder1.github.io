// JavaScript code for the Dialog iBeacon example app.

// Application object.
var ibeacon = {};

(function(){

// Regions that define which page to show for each beacon.
var beaconRegions =
[
	{
		id: 'page-ibeacon-elephant',
		uuid:'585CDE93-1B01-42CC-9A13-25009BEDC65E',
		major: 1,
		minor: 1
	},
	{
		id: 'page-ibeacon-giraffe',
		uuid:'595CDE93-1B01-42CC-9A13-25009BEDC65E', // Notice the difference in UUID
		major: 1,
		minor: 1
	}
];

// Currently displayed page.
var currentPage = 'page-ibeacon-default';

// Check for beacons with an rssi higher than this value
var rssiLimit = -60; 

// false when scanning is off. true when on.
var isScanning = false;

ibeacon.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(onDeviceReady) },
		false);
}

// Called when Cordova are plugins initialised,
// the iBeacon API is now available.
function onDeviceReady()
{
	// Specify a shortcut for the location manager that
	// has the iBeacon functions.
	window.locationManager = cordova.plugins.locationManager;
}

// Called when button is pressed
ibeacon.startStop = function()
{
	if(isScanning)
	{
		document.getElementById('ibeacon-start-stop').innerHTML = 'START IBEACON';
		stop();
	}
	else
	{
		document.getElementById('ibeacon-start-stop').innerHTML = 'STOP IBEACON';
		start();
	}
};


function start()
{
	isScanning = true;

	// Display default page
	gotoPage(currentPage);
	
	// Start tracking beacons!
	startScanForBeacons();
};

function stop()
{
	isScanning = false;
	
	// Hide the current page
	hidePage(currentPage);

	// Stop scanning beacons
	stopScanForBeacons();
};


function startScanForBeacons()
{
	//console.log('startScanForBeacons')

	// The delegate object contains iBeacon callback functions.
	var delegate = new cordova.plugins.locationManager.Delegate()

	delegate.didDetermineStateForRegion = function(pluginResult)
	{
		//console.log('didDetermineStateForRegion: ' + JSON.stringify(pluginResult))
	}

	delegate.didStartMonitoringForRegion = function(pluginResult)
	{
		//console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
	}

	delegate.didRangeBeaconsInRegion = function(pluginResult)
	{
		//console.log('didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult))
		didRangeBeaconsInRegion(pluginResult);
	}

	// Set the delegate object to use.
	locationManager.setDelegate(delegate);

	// Start monitoring and ranging our beacons.
	for (var r in beaconRegions)
	{
		var region = beaconRegions[r];

		var beaconRegion = new locationManager.BeaconRegion(
			region.id, region.uuid, region.major, region.minor);

		// Start monitoring.
		locationManager.startMonitoringForRegion(beaconRegion)
			.fail(console.error)
			.done();

		// Start ranging.
		locationManager.startRangingBeaconsInRegion(beaconRegion)
			.fail(console.error)
			.done();
	}
}

// Display pages depending of which beacon is close.
function didRangeBeaconsInRegion(pluginResult)
{
	// There must be a beacon within range.
	if (0 == pluginResult.beacons.length)
	{
		return;
	}

	// Our regions are defined so that there is one beacon per region.
	// Get the first (and only) beacon in range in the region.
	var beacon = pluginResult.beacons[0];

	// The region identifier is the page id.
	var pageId = pluginResult.region.identifier;

	// If the beacon is close and represents a new page, then show the page.
	if (beacon.rssi >= rssiLimit && currentPage != pageId)
	{
		gotoPage(pageId);
		return;
	}

	// If the beacon represents the current page but is far away,
	// then show the default page.
	if (beacon.rssi < rssiLimit && currentPage == pageId)
	{
		gotoPage('page-ibeacon-default');
		return;
	}
}

function stopScanForBeacons()
{
	// Stop monitoring and ranging our beacons.
	for (var r in beaconRegions)
	{
		var region = beaconRegions[r];

		var beaconRegion = new locationManager.BeaconRegion(
			region.id, region.uuid, region.major, region.minor);

		// Start monitoring.
		locationManager.stopMonitoringForRegion(beaconRegion)
			.fail(console.error)
			.done();

		// Start ranging.
		locationManager.stopRangingBeaconsInRegion(beaconRegion)
			.fail(console.error)
			.done();
	}
}

function gotoPage(pageId)
{
	hidePage(currentPage);
	showPage(pageId);
	currentPage = pageId;
}

function showPage(pageId)
{
	document.getElementById(pageId).style.display = 'block';
}

function hidePage(pageId)
{
	document.getElementById(pageId).style.display = 'none';
}

})(); // End of closure

// Initialize iBeacon
ibeacon.initialize()
