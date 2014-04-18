
// Requires
var util = require("./util.js");
var protocol = require("./protocol.js");
var network = require("./network.js");
var db = require("./db.js");

// UDP Server
var dgram = require("dgram");
var server = dgram.createSocket("udp4");
server.on("error", function (err) {
  util.log("UDP Server ERROR" + err.stack);
  server.close();
});

// On UDP Listening
server.on("listening", function () {
    var address = server.address();
    util.log("UDP Server INIT, listening on: " + address.address + ":" + address.port);
});

// On UDP Message
server.on("message", function (msg, rinfo) {
	util.log(rinfo.address + ":" + rinfo.port + " -> " + msg);
	protocol.parserMessage(msg).forEach(function(packet) {
        var msgNum = packet['msgNum'], deviceId = packet['deviceId'];
        protocol.updateDeviceList(packet, rinfo);
		var cqs = protocol.parserCQ(packet['sourcePacket']);
		cqs.forEach(function(data){
			var sqlString = db.prepareInsert(data, "tracks");
			db.connection.query(sqlString, function(err, rows, fields) {
				if (err) util.log("ERROR DB, " + err['code']); else {
                    if (msgNum && deviceId) {
					  network.sendAck(msgNum, deviceId, rinfo);
                    }
				}
			});
        });
        var msgNumDec = parseInt(msgNum, 16);
		if (cqs.length == 0 && (msgNum && deviceId && msgNumDec < 0x8000)) {
            network.sendAck(msgNum, deviceId, rinfo);
        }
        if (msgNumDec >= 0x8000) {
            var device = protocol.listDevice[deviceId];
            device.commands.forEach(function(command){
                for (var i = 0; i<device.commands.length; i++) {
                    if (device.commands[i].msgNum == msgNumDec) {
                        var sqlString = "update actions set status = 0, response = '" +
                            packet.sourcePacket + "' where id = '" +
                            device.commands[i].id + "' limit 1";
                        device.commands.splice(i, 1);
                        db.connection.query(sqlString, function(err, rows, fields) {
                            if (err) console.log(err);
                        });
                    }
                }                
            })
        }
	});	
});

// Load devices' commands from Mysql to Ram
setInterval(function() {
    for (var key in protocol.listDevice) {
        var deviceId = protocol.listDevice[key].deviceId;
        if (protocol.listDevice[key].commands.length == 0) {
            var sqlString = "select * from actions where deviceId = '" +
                deviceId + "' and status = 1 order by createdAt asc limit 1";
            db.connection.query(sqlString, function(err, rows, fields) {
                if (err) console.log("ERROR DB, " + err['code']); else {                    
                    rows.forEach(function(row) {       
                        protocol.listDevice[row.deviceId].commands.push(row);
                    });
                }
            });
        }
    }
}, 1000);

// Message Download Service
var globalMsgNum = 0xFFFF;
setInterval(function() {
    for (var key in protocol.listDevice) {
        if (protocol.listDevice[key].commands.length != 0) {
            var command, commandStr, device;
            device = protocol.listDevice[key];
            command = protocol.listDevice[key].commands[0];
            if (command.msgNum == undefined) {
                globalMsgNum = !(globalMsgNum>=0x8000&&globalMsgNum<0xFFFF)?0x8000:globalMsgNum+1;
                command.msgNum = globalMsgNum;
                command.timeout = 0;
            }
            if (!command.timeout--) {
                command.msgNum = globalMsgNum;
                command.timeout = 50;
                commandStr  = ">" + command.cmd + ";#" + command.msgNum.toString(16).toUpperCase();
                commandStr += ";ID=" + device.deviceId + ";*";
                commandStr += protocol.calculateChecksum(commandStr) + "<";
                network.sendMessage(commandStr, device.address, device.port);
            }
        }
    }
}, 100);

// Start DB Server
db.init();

// Start UDP Server
server.bind(5000);
