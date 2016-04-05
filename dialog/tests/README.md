# Dialog BLE App Development tests

This folder contains several test suites to test both software and hardware

## IoT Sensor Test
The file iotsensor.html contains the following options to test the [IoT Sensor Development Kit](http://www.dialog-semiconductor.com/iotsensor):
    
    Connect: Start the test
    Reset:   Reload the application (reset connection)
    For each sensor:
        Sensor test:          Turn on sensor, print output and turn off.
    Basic configuration:
        Random configuration: Set a random configuration in device
        Get configuration:    Print current configuration from device
        Store in flash:       Save current configuration in flash memory
        Reset configuration:  Restore to default
    Calibration:
        Random Sfl coefficients:   Set random sfl coefficients in device
        TODO: Random Calibration
        Get calibration:           Print current sfl coefficients and calibration configuration
        Store in flash:            Save current sfl coefficients and calibration configuration in flash memory
        Reset Sfl and Calibration: Restore to default Sfl coefficients and calibration configuration
    Other:
        Firmware / Availability: Print the firmware version from device and sensor availability
        Test connection:         Connect and close 3 times   
        Running status:          Print running status

To run the test, create a new application in the Evothings Workbench. Copy `iotsensor.html` to the root of the application and rename it to `index.html`.

Download and install the firmware from [Dialog Semiconductor customer support](http://support.dialog-semiconductor.com/) site on your IoT Sensor.

In the html file, change the variable `type` to `evothings.iotsensor.SFL` or `evothings.iotsensor.RAW`, depending on the firmware you are using.

Connect your mobile device to the workbench, save your changes and run the test.

