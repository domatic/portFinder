const Transform = require('stream').Transform;

class NullParser extends Transform {
    constructor(options = { maxBufferSize: 65535 }) {
        super({ ...options, ...{ readableObjectMode: true } });
    }

    _transform(chunk, encoding, cb) {
        // commented out because seems wrong but need to verify not breaking anything
        // this.push(this.currentESP3Packet);
        cb();
    }
}

module.exports = NullParser;
