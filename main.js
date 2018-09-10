/************************************************************
 *                                                          *
 *                  RutenbeckLink adapter                   *
 *                                                          *
 ************************************************************/

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

// require the utils module and call adapter function
const utils =    require(__dirname + '/lib/utils'); // Get common adapter utils

// call the adapter function and pass a options object
const adapter = new utils.Adapter('rutenbecklink');

// adapter shuts down
adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});

// subscribed object changes
adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// subscribed state changes
adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

    // use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) {
        adapter.log.info('ack is not set!');
    }
});

// message was sent to adapter instance over message box
adapter.on('message', function (obj) {
    if (typeof obj === 'object' && obj.message) {
        if (obj.command === 'send') {
            // e.g. send email or pushover or whatever
            console.log('send command');

            // Send response in callback if required
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
});

// databases is connected and adapter received configuration
adapter.on('ready', function () {
    main();
});

function main() {

    // adapters config
    adapter.log.info('config IP-address: '    + adapter.config.address);
    adapter.log.info('config Port: '    + adapter.config.port);


    // io Variables
    adapter.setObject('testVariable', {
        type: 'state',
        common: {
            name: 'testVariable',
            type: 'boolean',
            role: 'indicator'
        },
        native: {}
    });

    // all states changes inside the adapters namespace are subscribed
    adapter.subscribeStates('*');


    // set states
    if (adapter.config.port == 22) {
        // the variable testVariable is set to true as command (ack=false)
        adapter.setState('testVariable', true);
        adapter.log.info('testVariable is true');
    }
    else{
        // the variable testVariable is set to false as command (ack=false)
        adapter.setState('testVariable', false);
    }
    
    // same thing, but the value is flagged "ack"
    // ack should be always set to true if the value is received from or acknowledged from the target system
    //adapter.setState('testVariable', {val: true, ack: true});

    // same thing, but the state is deleted after 30s (getState will return null afterwards)
    //adapter.setState('testVariable', {val: true, ack: true, expire: 30});

    var net = require('net');

    var client = new net.Socket();
    client.connect(adapter.config.port, adapter.config.address, function() {
        adapter.log.info('Connecting ' + adapter.config.address + ' on port ' + adapter.config.port);
    });

    client.on('connect', function() {
        adapter.log.info('Connected to ' + adapter.config.address + ' on port ' + adapter.config.port);
    });

    client.on('data', function(data) {
        adapter.log.info('Received: ' + data);
        client.destroy(); // kill client after server's response
    });

    client.on('close', function() {
        adapter.log.info('Connection closed');
    });

    client.on('error', function() {
        adapter.log.info('Error connecting to ' + adapter.config.address + ' on port ' + adapter.config.port);
    });

    // checkPassword/checkGroup functions
    adapter.checkPassword('admin', 'iobroker', function (res) {
        console.log('check user admin pw ioboker: ' + res);
    });

    adapter.checkGroup('admin', 'admin', function (res) {
        console.log('check group user admin group admin: ' + res);
    });



}
