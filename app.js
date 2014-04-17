

var connection = null;

function initDbConnection() {
    function kickWatchDog() {
		connection.end();
        setTimeout(function () { initDbConnection(); }, 2000);
    }
    console.log("INIT DB, Inicializa DB");
    var mysql = require('mysql');
    connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root',
        database : 'rinhonode'
    });
    connection.on('error', function(err) {
        console.log("ERROR DB, DB Desconectada!");
        kickWatchDog();
    });
    connection.connect(function(err) {
        if (err) {
            console.log("ERROR DB, DB Desconectada!");
            kickWatchDog();
        }
    });
}


var util = require("./util.js");
var dgram = require("dgram");
var server = dgram.createSocket("udp4");

server.on("error", function (err) {
  console.log("server error:\n" + err.stack);
  server.close();
});

server.on("message", function (msg, rinfo) {

	console.log(util.getDateTime() + " " + rinfo.address + ":" + rinfo.port + " -> " + msg);

	function sendAck(MsgNum, IDDevice, rinfo) {
		var dgram = require('dgram');   
		var strMessage = ">ACK;#" + MsgNum + ";ID=" + IDDevice + ";*";
		strMessage = strMessage + util.calculaChecksum(strMessage) + "<";
		var message = new Buffer(strMessage);   
		var client = dgram.createSocket("udp4");
		client.send(message, 0, message.length, rinfo.port, rinfo.address, function(err, bytes) {
			if (!err) {
				console.log(util.getDateTime() + " " + rinfo.address + ":" + rinfo.port + " <- " + message);  
			}
			client.close();
		});
	}
	
	// http://regex101.com/
	var re = />(.*?)(;#([\w]{4})|)?;ID=([\w]*);/gm;
	var m; while ((m = re.exec(msg)) != null) {
	    if (m.index === re.lastIndex) re.lastIndex++;
		var MsgNum = null, IDDevice = null;
	    if (m[3]) MsgNum = m[3];
	    if (m[4]) IDDevice = m[4];

	    if (MsgNum && IDDevice) {

			var reportIdExist = null;
			
            var reb = />RCQ([\w]{2})([\d]{2})([\d]{2})([\d]{2})([\d]{2})([\d]{2})([\d]{2})([+-]{1}[\d]{7})([+-]{1}[\d]{8})([\d]{3})([\d]{3})([\w]{2})([\w]{2})([\d]{3})([\w]{8})([\w]{1})([\w]{1})([\d]{2})([\d]{2})([\w]{4})([\d]{1})([\w]{1})([\w]{2})(;TXT=([\w\s]*)|)(;#([\w]{4})|)?;ID=([\w]*);/gm;
            var x; while ((x = reb.exec(m[0])) != null) {

                if (x.index === reb.lastIndex) reb.lastIndex++;
                var dateFormat = require('dateformat');
                var reportDateTime = new Date("20"+""+x[4], x[3] - 1, x[2], x[5], x[6], x[7], 0);

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
                    ign:                null,
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

				reportIdExist = true;
				
                var values = [], keys = [];
                for (var key in data) {
                    if (data[key] == null) values.push("NULL");
                    else if (key == "createdAt" || key == "modifiedAt") values.push(data[key]);
                    else values.push("'"+data[key]+"'");
                    keys.push(key);
                }

                var sqlString = "INSERT INTO TRACKS (" + keys.join(',') + ") VALUES(" + values.join(',') + ")";
                // console.log(""); console.log(sqlString); console.log("");
				connection.query(sqlString, function(err, rows, fields) {
                    // if (rows) console.log(rows);
                    if (err) {
						console.log(err); 
					} else {					
						sendAck(MsgNum, IDDevice, rinfo);
                    }
                });
            }
			
			if (!reportIdExist) {
				sendAck(MsgNum, IDDevice, rinfo);
			}
			
	    }
	}
});

server.on("listening", function () {
  var address = server.address();
  console.log("INIT UDP Server, escuchando el puerto: " + address.address + ":" + address.port);
});


initDbConnection();

// >SIP0190.31.152.81/5000<
// >SIP1190.31.152.81/5000<

server.bind(5000);
