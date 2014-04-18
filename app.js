var globalMsgNum = 0xFFFF;

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

server.on("message", function (msg, rinfo) {
	util.log(rinfo.address + ":" + rinfo.port + " -> " + msg);
	protocol.parserMessage(msg).forEach(function(packet){
		if (packet['msgNum'] && packet['deviceId']) {			
			var cqs = protocol.parserCQ(packet['sourcePacket']);
			cqs.forEach(function(data){
				var sqlString = db.prepareInsert(data);
				connection.query(db.prepareInsert(data), function(err, rows, fields) {
					if (err) {
						util.log("ERROR DB, " + err['code']); 
					} else {					
						network.sendAck(packet['msgNum'], packet['deviceId'], rinfo);
					}
				});
            });
			if (cqs.length == 0) {
				network.sendAck(packet['msgNum'], packet['deviceId'], rinfo);
			}
	    }
	});
	
});

server.on("listening", function () {
    var address = server.address();
    util.log("UDP Server INIT, lisenning on: " + address.address + ":" + address.port);
});

// Load command from Mysql to Ram
setInterval(function() {
    for (var key in protocol.listDevice) {
        var deviceId = protocol.listDevice[key].deviceId;
        // console.log(">>"); console.log(protocol.listDevice[key]); console.log("<<");
        if (protocol.listDevice[key].commands.length == 0) {
            var sqlString = "select * from actions where deviceId = '" + deviceId + "' and status = 1 order by createdAt asc limit 1";
            console.log("*" + key + " : " + sqlString);
            connection.query(sqlString, function(err, rows, fields) {
                if (err) console.log("ERROR DB, " + err['code']); else {                    
                    rows.forEach(function(row) {       
                        protocol.listDevice[row.deviceId].commands.push(row);
                        //console.log(protocol.listDevice);
                    });
                }
            });
        }
    }
}, 1000);

// Servicio de Descarga de Mensajes
setInterval(function() {
    for (var key in protocol.listDevice) {
        if (protocol.listDevice[key].commands.length != 0) {
            var command, commandStr, device;
            device = protocol.listDevice[key];
            command = protocol.listDevice[key].commands[0];
            if (command.msgNum == null) {
                globalMsgNum = !(globalMsgNum >= 0x8000 && globalMsgNum < 0xFFFF) ? 0x8000 : globalMsgNum + 1;
                command.msgNum = globalMsgNum;
                command.timeout = 0;
            }
            if (!command.timeout--) {
                command.msgNum = globalMsgNum;
                command.timeout = 50;
                commandStr = ">" + command.cmd + ";#" + command.msgNum.toString(16) + ";ID=" + device.deviceId + ";*";
                commandStr = commandStr + protocol.calculateChecksum(commandStr) + "<";
                network.sendMessage(commandStr, device.address, device.port);
            }
        }
    }
}, 100);

db.init();
server.bind(5000);

// >SIP0190.31.152.81/5000< >SIP1190.31.152.81/5000<
/*setInterval(function() {
	network.sendMessage(">RCQ00140114020454-3282041-060841740001057F022410364673E13011100011017;#6541;ID=CS009;*4E<", "localhost", 5000);
}, 2000);*/

