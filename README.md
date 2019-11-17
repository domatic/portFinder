# portFinder

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
            