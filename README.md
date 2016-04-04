# Dialog Semiconductor
The directory [dialog](dialog) contains all public files regarding the Dialog BLE App Development project. In order to provide more software support for Dialog's Bluetooth Low Energy hardware, this project is focused on mobile application development. These example applications are developed using cross-platform tools to build applications for multiple platforms.

Folder structure:

    apps
        Example applications built using Evothings Studio
    dialog-evothings
        Application used as an index page to open one of the example apps
    docs
        Documentation regarding the example applications or developed libraries
    libs
        JavaScript libraries

To run one of the example applications on your mobile device, install the [Evothings Viewer](https://evothings.com/doc/studio/evothings-viewer.html) and open the [dialog-evothings app](https://nbezembinder1.github.io/dialog/dialog-evothings/index.html) using the browser on your smartphone.


## Apps
Several applications are built using [Evothings Studio](http://evothings.com/). The source can be found in the [apps directory](dialog/apps).

### [blinky](dialog/apps/blinky)
TODO: Add information about blinky app.

### [beacons](dialog/apps/beacons)
This application provides a quick demonstration of the DA1458x. 
The Bluetooth device is able to broadcast multiple beacon formats such as Eddystone, iBeacon and AltBeacon. The app detects both Eddystone and iBeacon format. Once the mobile device gets close to the beacon the app will display some information.

### iotsensor
Coming soon


## Libraries
This [folder](dialog/libs) contains several JavaScript libraries used or created during the project. 

### easyble
Library for making BLE programming easier. See the [evothings-libraries repository ](https://github.com/evothings/evothings-libraries) for the latest version.

### iotsensor-library
JavaScript library used to communicate with the [IoT Sensor Development Kit](http://www.dialog-semiconductor.com/iotsensor). To use this library, place the `libs/evothings/iotsensor` folder in the root of your Evothings application. Make sure to also copy the easyble library.

TODO: Add more information

## Documentation
Documentation for both example applications and libraries can be found on [github.io](http://nbezembinder1.github.io/dialog/docs/iotsensor-library/index.html)

TODO: Create an index page on [github.io](http://nbezembinder1.github.io/dialog/docs)

To generate HTML documentation for Evothings JavaScript libraries yourself, install [JSDoc3](https://github.com/jsdoc3/jsdoc) and run the following command in the root folder of this repository:

    jsdoc -r ./libs/

