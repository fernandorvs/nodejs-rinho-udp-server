var util = require("./util.js");
var protocol = require("./protocol.js");
exports.sendAck = function(MsgNum, deviceId, rinfo) {
	var dgram = require('dgram');   
	var strMessage = ">ACK;#" + MsgNum + ";ID=" + deviceId + ";*";
	strMessage = strMessage + protocol.calculateChecksum(strMessage) + "<";
	var message = new Buffer(strMessage);   
	var client = dgram.createSocket("udp4");

	if (protocol.listDevice[deviceId] === undefined) {
		protocol.listDevice[deviceId] = { 'deviceId': deviceId, address: rinfo.address, port: rinfo.port, tick: (new Date()).getTime(), commands: [] };
	} else {
		protocol.listDevice[deviceId].address = rinfo.address;
		protocol.listDevice[deviceId].port = rinfo.port;
		protocol.listDevice[deviceId].tick = (new Date()).getTime();
	}

	if (parseInt(MsgNum,16) < 0x8000) {
		client.send(message, 0, message.length, rinfo.port, rinfo.address, function(err, bytes) {
			if (!err) {
				util.log(rinfo.address + ":" + rinfo.port + " <- " + message);  
			}
			client.close();
		});
	} else {
		// Bajo de la Cola
		console.log("// Mensaje Recibido " + MsgNum);
		var device = protocol.listDevice[deviceId];
		device.commands.forEach(function(command){
			console.log("// Mensaje Recibido ::" + command.msgNum);
			if (command.msgNum == parseInt(MsgNum,16)) {
				// Mensaje Recibido
				console.log("// Mensaje Recibido :::" + MsgNum);
			}
		})
	}
}

exports.sendMessage = function (message, ip, port) {
	var dgram = require('dgram');   
	var message = new Buffer(message);   
	var client = dgram.createSocket("udp4");
	client.send(message, 0, message.length, port, ip, function(err, bytes) {
		if (!err) {
			util.log(ip + ":" + port + " <- " + message);  
		}
		client.close();
	});
}