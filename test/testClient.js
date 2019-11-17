const PortFinder = require('../portFinder');

class TestClient extends PortClient {
    constructor(options) {
        super(options);
        this.options = options || {};
        this._lineBuffer = Buffer.from([]);
    }
}


const testClient = new TestClient();

testClient.on('log', message => console.log(message));

testClient.on('open', data => console.log(`testClient: open ${JSON.stringify(data)}`));
testClient.on('clost', data => console.log(`testClient: close ${JSON.stringify(data)}`));
testClient.on('error', data => console.log(`testClient: error ${JSON.stringify(data)}`));
