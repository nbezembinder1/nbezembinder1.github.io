# Dialog Semiconductor IoT Compass

This application demonstrates the functionality of the [DA14583 IoT Sensor](http://www.dialog-semiconductor.com/iotsensor). The IoT Sensor provides the means to gather and process sensor data among six different sensors.

```
BMI160 – 3 axis inertial sensor (accelerometer and gyroscope)
BMM150 – 3 axis geomagnetic sensor (magnetometer)
BME280 – pressure, humidity and temperature sensor
```

The data is gathered by the DA14583, process and transferred over Bluetooth Low Energy to the application running on the smartphone. The app uses the environmental sensors from the IoT Sensor to create a weather station.

## Firmware
The directory `DA14583` contains the binary for the IoT Sensor. Using [Dialog's SmartSnippets Bluetooth software platform](http://www.dialog-semiconductor.com/bluetooth-smart/development-tools) you can store the image file to flash memory of the device. The SmartSnippets can be found on [Dialog's customer support site](http://support.dialog-semiconductor.com/connectivity). (Registration required)

*The application requires the use of the SFL firmware*