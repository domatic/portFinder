const Panel = require('./panel');


// const panel = new Panel({ name: 'foo' });
const panel1 = new Panel({ name: 'panel1' });
const panel2 = new Panel({ name: 'panel2' });

panel1.on('log', message => console.log('panel1:', message));

// panel1.on('connected', data => console.log(`panel1: connected ${JSON.stringify(data)}`));
// panel1.on('disconnected', () => console.log('panel1: disconnected'));

panel2.on('log', message => console.log('panel2:', message));

// panel2.on('connected', data => console.log(`panel2: connected ${JSON.stringify(data)}`));
// panel2.on('disconnected', () => console.log('panel2: disconnected'));
