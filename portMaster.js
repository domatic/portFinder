const SerialPort = require('serialport');
const ports = require('./ports');

const ap = require('async-promise-wrapper');

const MONITOR_INTERVAL = 1000;

class PortMaster {
    constructor() {
        this._clients = new Set();
        this._monitor();
    }

    register(client) {
        this._clients.add(client);
    }

    release(client) {
        this._clients.delete(client);
    }

    _connectClient(client, port) {
        // console.log(`connecting ${client.name} to ${port.path}`);
        ports.assign(port.path);
        client.port = port;

        if (client.parser) {
            client.port.pipe(client.parser);
            client.parser.addListener('data', client.onData.bind(client));
            client.parser.addListener('error', client.onError.bind(client));
        }
        else {
            client.port.addListener('data', client.onData.bind(client));
            client.port.addListener('error', client.onError.bind(client));
        }

        this._clients.delete(client);

        const onClose = () => {
            if (client.parser) {
                client.parser.removeAllListeners('data');
                client.parser.removeAllListeners('error');
                client.port.unpipe(client.parser);
            }
            else {
                client.port.removeAllListeners('data');
                client.port.removeAllListeners('error');
            }
            ports.release(client.port.path);

            client.port.removeListener('close', onClose);
            client.port = null;
            this._clients.add(client);
            if (client.connected) {
                client.connected = false;
                client.emit('disconnected');
                setImmediate(client.onDisconnected.bind(client));
            }
        };
        client.port.addListener('close', onClose.bind(this));
    }

    _unattached() {
        return [...this._clients].filter(client => !client.port);
    }

    _monitor() {
        ap.whilst(
            () => true,
            () => {
                if (this._unattached().size === 0)
                    return ap.delay(MONITOR_INTERVAL);

                return ports.available()
                    .then(portsInfo =>
                        ap.eachSeries(
                            portsInfo,
                            portInfo =>
                                ap.someSeries(
                                    this._unattached(),
                                    client => this._tryOpen(client, portInfo)
                                )
                        )
                    )
                    .then(() => ap.delay(MONITOR_INTERVAL));
            }
        );
    }

    _tryOpen(client, portInfo) {
        // console.log(`trying ${portInfo.path} for ${client.name}`);
        return new Promise(resolve => {
            const options = Object.assign({}, client.options, { autoOpen: false });
            const port = new SerialPort(portInfo.path, options);
            port.open(error => {
                if (error) {
                    // this.emit('log', `error opening port ${port.path} for client ${client.name}`);
                    if (port.isOpen) {
                        this.emit('log', `error port ${port.path} open after error`);
                        port.close();
                    }
                    resolve(null);
                }
                else {
                    this._connectClient(client, port);
                    client.validate(port)
                        .then(ok => {
                            if (!ok) {
                                // console.log(`port ${port.path} not a match for ${client.name}`);
                                port.close(error => {
                                    if (error) {
                                        client.emit('log', `error ${error} closing port ${port.path} for ${client.name}`);
                                    }
                                    resolve(false);
                                });
                            }
                            else {
                                // console.log(`serialport client ${client.name} connected to port ${port.path}`);
                                client.connected = true;
                                client.emit('connected', port.path);
                                setImmediate(client.onConnected.bind(client), port.path);
                                resolve(port);
                            }
                        });
                }
            });
        });
    }
}

module.exports = new PortMaster();
