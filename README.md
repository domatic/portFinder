# portArbitor

```javascript

// singleton class that manages serial ports

class Master {
    register(client) {
        // register client in list of clients that are looking for a port
        // returns a promise that resolves when a match is made with the opened port 
    }
    disconnect(client) {
        // 
    }
}


class PortFinder extends EventEmitter {
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
    send(data) {

    }
}
```

PortFinder -> PortMaster, connect(me, options)

PortMaster
    for each port
        for each client
            client.connect(port)
            client.validate()
                if ok
                    next port
            