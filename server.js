
var util = require("./util.js");
var dgram = require("dgram");
var server = dgram.createSocket("udp4");

server.on("error", function (err) {
  console.log("server error:\n" + err.stack);
  server.close();
});

server.on("message", function (msg, rinfo) {
	console.log(util.getDateTime() + " " + rinfo.address + ":" + rinfo.port + " -> " + msg);
	// http://regex101.com/
	var re = />(.*?)(;#([\w]{4})|)?;ID=([\w]*);/gm;
	var m; while ((m = re.exec(msg)) != null) {
	    if (m.index === re.lastIndex) re.lastIndex++;
		var MsgNum = null, IDDevice = null;
	    if (m[3]) MsgNum = m[3];
	    if (m[4]) IDDevice = m[4];
	    if (MsgNum && IDDevice) {
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
	}
});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

server.bind(5000);



var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);
//rl.setPrompt('OHAI> ');
rl.prompt();
rl.on('line', function(line) {
  switch(line.trim()) {
    case 'hello':
      console.log('world!');
      break;
    default:
      console.log('Say what? I might have heard `' + line.trim() + '`');
      break;
  }
  rl.prompt();
}).on('close', function() {
  console.log('Have a great day!');
  process.exit(0);
});




/* Example

>SCOPS4,2,"722310"<
>SCXAPNinternet.ctimovil.com.ar,,<
>SIP0190.31.152.81/5000<
>SIP1190.31.152.81/5000<

*/