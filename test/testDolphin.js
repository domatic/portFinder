const Dolphin = require('./dolphin');



const dolphin = new Dolphin();

dolphin.on('log', message => console.log(message));

dolphin.on('switch', swtch => console.log(`enocean: ${JSON.stringify(swtch)}`));

