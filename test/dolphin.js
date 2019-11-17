const PortFinder = require('../port-finder');
const Enocean = require('enocean-js');
const SerialportSender = Enocean.SerialportSender;
const ESP3Parser = Enocean.ESP3Parser;
const pretty = Enocean.pretty;

class Dolphin extends PortFinder {
    constructor(options) {
        options = options || {
            baudRate: 57600,
            pollPeriod: 1000
        };
        options.automatic = true;
        super(options);
        this._callback = null;
        this._info = {};

        this.parser = new ESP3Parser();
        this.parser.on('data', packet => this._onPacket(packet));
        this.lastRocker = {};
    }

    _onPacket(packet) {
        pretty.logESP3(packet);
        if (packet.data[0] !== 0xf6) {
            this.emit('log', `invalid EnOcean EEP: ${packet.data[0].toString(16)}`);
        }
        else {
            const id = packet.data.slice(2, 6).toString(16);
            const state = packet.data[1];
            const rocker = state & 0x40 ? 1 : 0;

            let rockerId = state === 0 ? this.lastRocker[id] : rocker;
            this.lastRocker[id] = rocker;

            const extendedId = id + rockerId.toString(16);

            const on = (state & 0x20) !== 0;
            const code = (state === 0) ? 'release' : (on ? 'on' : 'off');

            const switchEvent = {
                address: extendedId,
                state: code
            };

            this.emit('log', `enocean switch ${extendedId}: ${state.toString(16)}`);

            this.emit('switch', switchEvent);
        }
    }

    validate(port) {
        this.emit('log', `dolphin validating port ${port.path}`);
        const sender = SerialportSender({ port: port, parser: new ESP3Parser({ maxBufferSize: 2000 }) });
        var commander = new Enocean.Commander(sender);

        return commander.getVersion().then(version => {
            this.emit('log', `chipId: ${version.chipId}`);
            return (version.appDescription === 'GATEWAYCTRL');
        }).catch(() => {
            // this.emit('log', `Dolphin error: ${error}`);
            return false;
        });
    }

    connected() {
        this.emit('log', `dolphin connected to ${this.port.path}`);
        this.port.pipe(this.parser);
    }
}

module.exports = Dolphin;


/*
preamble: 55
dataLength: 0007
optionalLength: 07
packetType: 01
headerCRC: 7a
data: f6500036d76bb0
optionalData: 00ffffffff3000
dataCRC: 59
*/