# portFinder

## Serial port connection manager for node-serialport (https://serialport.io)

When using multiple serial port devices, it can be tricky to match up your code to the actual device it needs to talk to.  Serial ports aren't named anything predictable, and the USB VID/PID really just describe the adapter.  To find the device you're looking for, you have to open it first.  

It's fine if you have only one serial device connected, but what do you do when you have a bunch of different types of serial devices you're trying to talk to from different code modules?  

PortFinder simplifies this process significantly.  Behind the scenes, it scans the host's serial ports and coordinates opening the ports, letting your code check validate the port, and automatically reconnecting if your port disappears and reappears.

## Usage

To use portFinder simply implement a class that extends portFinder.  In your class, implement these methods:

```constructor(options)```
options include

    name: a handy string for identifying this class.  Mainly for debugging/logging.
    
    parser:  a node transform stream instance that portFinder will attach to the port for you when opening it.

```validate(port)``` - your code to talk to the device and decide if it's the right one.  The port is already opened for you, just use it.  Return a promise with a single value, 'ok'.  Don't throw an error here.  portFinder just needs to know if its your port or not.

```onData(data)``` - receive data from the serial port.  This is either raw data, or the output of a parser you specified in your options argument to the constructor

```javascript

class PortFinder extends EventEmitter {
    constructor(options) {
        // options: {
        //      name: <string>
        //      parser: <transform stream to process incoming data>
        }
    }
    onData(data) {
        // receive data
    }
    onError(error) {
        // oops
    }
    onClose() {
        // you got closed.
    }
    validate(port) {
        // use port to validate if this is my port
        // returns promise that resolves to true or false
    }
    write(data) {
        // send data

    }
}
```

## PortFinder events

```on('connected', <port path>)``` - issued after port is validated

```on('disconnected')``` - issued when a connection is lost

```on('data', data)``` - data received.  Output of parser if specified

```on('error', error)```  - oopsies
            