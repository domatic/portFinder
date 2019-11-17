const EventEmitter = require('events').EventEmitter;
const _portMaster = require('./portMaster');

class PortFinder extends EventEmitter {
    constructor(options) {
        super(options);
        this.options = options || {};
        this.port = null;
        this.name = options.name || this.name;
        this.parser = options.parser;
        this.connected = false;
        _portMaster.register(this);
    }

    onData() {
        console.error('onData must be implemented');
    }

    onError(error) {
        console.log(`client ${this.name} error ${error}`);
        this.emit('error', error);
    }

    validate() {
        this.emit('connected', this.port.path);
        return Promise.resolve(true);
    }

    write(buf) {
        return new Promise((resolve, reject) => {
            if (this.port.isOpen) {
                this.port.write(buf, resolve);
            }
            else {
                reject(new Error(`writing to closed serial port: ${buf}`));
            }
        });
    }
}

module.exports = PortFinder;