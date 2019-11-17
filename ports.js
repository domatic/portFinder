const SerialPort = require('serialport');

const _omitPorts = ['/dev/tty', 'Bluetooth', 'Beats'];
const _includePorts = ['usb', '/dev/ttyACM'];

class Ports {
    constructor() {
        this._assigned = new Set();
    }

    assign(path) {
        this._assigned.add(path);
    }

    release(path) {
        this._assigned.delete(path);
    }

    _portMatch(portInfo, pattern) {
        return portInfo.path.toLowerCase().indexOf(pattern.toLowerCase()) >= 0;
    }

    async available() {
        const portsInfo = await SerialPort.list();
        return portsInfo.filter(portInfo => !this._assigned.has(portInfo.path) &&
            (_includePorts.some(ip => this._portMatch(portInfo, ip)) ||
                !_omitPorts.some(op => this._portMatch(portInfo, op))));
    }
}

module.exports = new Ports();
