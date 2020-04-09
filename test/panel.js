const PortFinder = require('..');
const es = require('event-stream');

const SYNCPATTERN = [0x5a, 0xa5, 0x5a, 0xa5];
const QUERYPATTERN = [0xc0, 0xed, 0xba, 0xbe];

class Panel extends PortFinder {
    constructor(options) {
        options = options || {};
        options.name = options.name || 'panel';
        options.parser = es.split();
        super(options);
        this._data = null;
        this._callback = null;
        this._info = null;
        this._numPixels = 600;
        this._pixels = [];
        this._location = null;
    }

    onData(data) {
        try {
            const o = JSON.parse(data);
            if (this._callback) {
                this._callback(o);
            }
        } catch (e) {
            //            this.emit('log', e.message);
        }
    }

    connected(path) {
        console.log(`${this.name}: connected ${path}`);
    }

    disconnected() {
        console.log(`${this.name}: disconnected`);
    }

    _getInfo() {
        return new Promise((resolve, reject) => {
            let _timer = setTimeout(() => {
                this._callback = null;
                reject(new Error('_getConfig timeout on port' + (this.port ? this.port.path : 'unknown')));
            }, 1000);

            this._callback = o => {
                clearTimeout(_timer);
                this._callback = null;
                resolve(o);
            };
            if (this.options.simulated) return;
            this.write(Buffer.from(QUERYPATTERN));
        });
    }

    validate(port) {
        // this.emit('log', `validating port ${port.path}`);

        return this._getInfo()
            .then(info => {
                if (info.id) {
                    this._info = info;
                    this.emit('connected', `${this.name} connected to ${port.path}: ${JSON.stringify(info)}`);
                    return true;
                }
                return false;
            })
            .catch(() => {
                // this.emit('log', error.message);
                return false;
            });
    }

    get id() {
        return this._info ? `panel${this._info.id}` : null;
    }

    set count(l) {
        this._numPixels = l;
        this._ensureCount(l);
    }

    get count() {
        return this._numPixels;
    }

    get location() {
        return this._location;
    }

    get points() {
        return this._data.points;
    }

    set data(value) {
        this._data = value;
        this._numPixels = this._data.config.count;
        this._location = this._data.config.location;
    }

    _ensureCount(len) {
        if (len > this._pixels.length) {
            this._pixels.push(Array(len - this._pixels.length).fill(0));
        }
    }

    setPixel(i, pixel) {
        this._ensureCount(i + 1);
        this._pixels[i] = pixel;
    }

    fillPixels(pixel, start, end) {
        this._ensureCount(end + 1);
        this._pixels.fill(pixel, start, end);
    }

    render() {
        let packet = SYNCPATTERN.concat(this._numPixels >> 8, this._numPixels & 0xff);
        for (let i = 0; i < this._pixels.length; i++) {
            let pixel = this._pixels[i];
            packet.push((pixel >> 16) & 0xff);
            packet.push(pixel & 0xff);
            packet.push((pixel >> 8) & 0xff);
        }
        let bytes = Buffer.from(packet);
        if (this.options.simulated) return;
        return this.write(bytes);
    }
}

module.exports = Panel;
