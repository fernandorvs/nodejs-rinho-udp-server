exports.listDevice = {};

exports.calculateChecksum = function (cmd) {
	var checksum = 0;
	for(var i = 0; i < cmd.length; i++) {
		checksum = checksum ^ cmd.charCodeAt(i);
	}
	var hexsum = Number(checksum).toString(16).toUpperCase();
	if (hexsum.length < 2) {
		hexsum = ("00" + hexsum).slice(-2);
	}
	return hexsum;
}

exports.parserMessage = function(message) {
	var output = [];	
	var re = />(.*?)(;#([\w]{4})|)?;ID=([\w]*)(;|)/gm;
	var m; while ((m = re.exec(message)) != null) {
	    if (m.index === re.lastIndex) re.lastIndex++;
		var msgNum = null, IDDevice = null, body;
	    if (m[3]) msgNum = m[3];
	    if (m[4]) deviceId = m[4];
		if (m[1]) body = m[1];
		var data = { 
			body: body, deviceId: deviceId, 
			msgNum: msgNum, sourcePacket: m[00]
		};
		output.push(data);
	}
	return output;
}

exports.parserCQ = function(message) {
	var output = [];
	var reb = />RCQ([\w]{2})([\d]{2})([\d]{2})([\d]{2})([\d]{2})([\d]{2})([\d]{2})([+-]{1}[\d]{7})([+-]{1}[\d]{8})([\d]{3})([\d]{3})([\w]{2})([\w]{2})([\d]{3})([\w]{8})([\w]{1})([\w]{1})([\d]{2})([\d]{2})([\w]{4})([\d]{1})([\w]{1})([\w]{2})(;TXT=([\w\s]*)|)(;#([\w]{4})|)?;ID=([\w]*)(;|)/gm;
	var x; while ((x = reb.exec(message)) != null) {
		if (x.index === reb.lastIndex) reb.lastIndex++;
		var dateFormat = require('dateformat');
		var reportDateTime = new Date("20"+""+x[4], x[3]-1, x[2], x[5], x[6], x[7], 0);
		var data = { 
			deviceId:           x[28],
			reportType:         "CQ",
			reportId:           x[01],
			gpsDateTime:        null,
			reportDateTime:     dateFormat(reportDateTime, "yyyy-mm-dd hh:MM:ss"),
			latitude:           x[08]/100000,
			longitude:          x[09]/100000, 
			speed:              parseInt(x[10]),
			course:             parseInt(x[11]),
			altitude:           null,
			ign:                (parseInt(x[12],16) & (1<<7))?"1":"0",
			inputs:             x[12],
			outputs:            x[13],
			voltageMainPower:   x[14]/10,
			odometer:           parseInt(x[15], 16),
			gpsPower:           x[16],
			gpsFixMode:         x[17],
			gpsPdop:            x[18],
			gpsQtySat:          x[19],
			gpsAge:             parseInt(x[20], 16),
			gsmPower:           x[21],
			gsmStatus:          x[22],
			gsmLevel:           x[23] ,
			txtMessage:         x[24],
			msgNum:             x[27],
			sourcePacket:       x[00],
			createdAt:          "NOW()",
			modifiedAt:         "NOW()"
		};
		output.push(data);
	}
	return output;
}
