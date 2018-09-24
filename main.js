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
        clearInterval(UpdateIO);
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
    const UpdateIO = setInterval(() => {
        readIO(1);
        readIO(2);
    }, adapter.config.interval * 1000);

    main();
});

function sendUDP (message:Buffer, port:uint, address){
    var dgram = require('dgram');
    var client = dgram.createSocket('udp4');
        
    client.send(message, 0, message.length, port, address, function(err, bytes) {
        if (err) throw err;
            adapter.log.info('Message "'+ message + '" sent to ' + address +':'+ port);
        client.close();
    });
}

function readIO(IO:int){
    if (IO > 4 || IO < 0){
        adapter.log.error('Invalid IO number: ' + IO);
        return false;
    }
    else{
        var message = new Buffer('OUT' + IO + ' ?');
        sendUDP(message, adapter.config.port, adapter.config.address);
        return true;
    }
}

function writeIO(IO:int,newState:bool){
    if (IO > 4 || IO < 0){
        adapter.log.error('Invalid IO number: ' + IO);
    }
    else{   
        if (newState){
            var message = new Buffer('OUT' + IO + ' 1');
            sendUDP(message, adapter.config.port, adapter.config.address);
        }
        else{
            var message = new Buffer('OUT' + IO + ' 0');
            sendUDP(message, adapter.config.port, adapter.config.address);
        }
    }  
}

function main() {

    // adapters config
    adapter.log.info('config IP-address: '    + adapter.config.address);
    adapter.log.info('config Port: '    + adapter.config.port);


    // io Variables
    adapter.setObject('IO_1', {
        type: 'state',
        common: {
            name: 'IO_1',
            type: 'boolean',
            role: 'indicator'
        },
        native: {}
    });

    adapter.setObject('IO_2', {
        type: 'state',
        common: {
            name: 'IO_2',
            type: 'boolean',
            role: 'indicator'
        },
        native: {}
    });

    adapter.setObject('IO_3', {
        type: 'state',
        common: {
            name: 'IO_3',
            type: 'boolean',
            role: 'indicator'
        },
        native: {}
    });

    adapter.setObject('IO_4', {
        type: 'state',
        common: {
            name: 'IO_4',
            type: 'boolean',
            role: 'indicator'
        },
        native: {}
    });

    // all states changes inside the adapters namespace are subscribed
    adapter.subscribeStates('*');


    // set states
    // the variable testVariable is set to false as command (ack=false)
    //adapter.setState('testVariable', false);
    
    
    // same thing, but the value is flagged "ack"
    // ack should be always set to true if the value is received from or acknowledged from the target system
    //adapter.setState('testVariable', {val: true, ack: true});

    // same thing, but the state is deleted after 30s (getState will return null afterwards)
    //adapter.setState('testVariable', {val: true, ack: true, expire: 30});

    //Run function with defined interval

    // checkPassword/checkGroup functions
    adapter.checkPassword('admin', 'iobroker', function (res) {
        console.log('check user admin pw ioboker: ' + res);
    });

    adapter.checkGroup('admin', 'admin', function (res) {
        console.log('check group user admin group admin: ' + res);
    });



}
