# IoT Sensor Library

This JavaScript library is used to communicate with the [IoT Sensor Development Kit](http://www.dialog-semiconductor.com/iotsensor).

In order to use this library, build a Cordova app that contains the [BLE plugin](https://github.com/evothings/cordova-ble) or create a new application using the [Evothings Workbench](https://evothings.com/doc/studio/workbench.html).

To use this library, place the `libs/evothings/iotsensor` folder in the root of your Evothings application or `www` folder (Cordova). 

Make sure to also copy the easyble library to `libs/evothings/easyble`. You can find the latest version on the [evothings-libraries repository](https://github.com/evothings/evothings-libraries).

## Usage

Create a new iotsensor object by specifying the project type (RAW or SFL) you are using.

```javascript
// Device type we are connecting to, can either be RAW or SFL
var type = evothings.iotsensor.SFL;

// Create a new IoT Sensor SFL instance
var iotsensor = evothings.iotsensor.createInstance(type);
```

Now that we have created a new IoT Sensor instance, we can try to connect to the sensor using BLE.
The library provides the option to automatically connect to the closest IoT Sensor available using the `connectToClosestSensor(scanTime, callbackFun, disconnectFun)` function.

You can also connect to a device manually, see the [documentation](http://nbezembinder1.github.io/dialog/docs/iotsensor-library/evothings.iotsensor.instance_ble.html#connectToDevice__anchor) for more information.
```javascript
// Scan for 3000ms
iotsensor.connectToClosestSensor(
  3000,
  function()
  {
    console.log('We are connected!');
  },
  function(error)
  {
    console.log('Disconnect error: ' + error);
  }
);
```

The IoT Sensor provides a features report to see which sensors are available and the firmware version of the device connected.
It is good practice to use these options to determine the capabilities of the device.
```javascript
console.log('IoT Sensor device info:'
             + '\n Device model:  '	+ iotsensor.getDeviceModel()
             + '\n Firmware:      ' + iotsensor.getFirmwareString()
             + '\n Accelerometer: ' + iotsensor.isAccelerometerAvailable()
             + '\n Gyroscope:     ' + iotsensor.isGyroscopeAvailable()
             + '\n Magnetometer:  ' + iotsensor.isMagnetometerAvailable()
             + '\n Barometer:     ' + iotsensor.isBarometerAvailable()
             + '\n Temperature:   ' + iotsensor.isTemperatureAvailable()
             + '\n Humidity:      ' + iotsensor.isHumidityAvailable()
             + '\n Sensor Fusion: ' + iotsensor.isSflAvailable());
```

In order to receive data from one of the 7 'sensors', a callback function must be set. This function is called everytime new data is available from the sensor.
Once the callback is set, the sensor can be enabled. Note that Sensor Fusion is not available in RAW projects.
```javascript
// Set the accelerometer callback and turn on the accelerometer
iotsensor.accelerometerCallback(handleReply)
  .accelerometerOn();
  
function handleReply(data)
{
  console.log('Accelerometer: ' + 
              '\n x: ' + data.x + 
              '\n y: ' + data.y + 
              '\n z: ' + data.z);
}

