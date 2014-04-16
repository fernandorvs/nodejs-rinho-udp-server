
exports.getDateTime = function () {
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	var day = now.getDate();
	var hour = now.getHours();
	var minute = now.getMinutes();
	var second = now.getSeconds();
	if(month.toString().length == 1) {
		var month = '0'+month;
	}
	if(day.toString().length == 1) {
		var day = '0'+day;
	}
	if(hour.toString().length == 1) {
		var hour = '0'+hour;
	}
	if(minute.toString().length == 1) {
		var minute = '0'+minute;
	}
	if(second.toString().length == 1) {
		var second = '0'+second;
	}
	var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
	return dateTime;
}

exports.calculaChecksum = function (cmd) {
  // Compute the checksum by XORing all the character values in the string.
  var checksum = 0;
  for(var i = 0; i < cmd.length; i++) {
    checksum = checksum ^ cmd.charCodeAt(i);
  }
  // Convert it to hexadecimal (base-16, upper case, most significant nybble first).
  var hexsum = Number(checksum).toString(16).toUpperCase();
  if (hexsum.length < 2) {
    hexsum = ("00" + hexsum).slice(-2);
  }  
  // Display the result
  return hexsum;
}

// ----------------
// --- Parser RCY
/*
var re = />RCY([\w]{2})([\d]{2})([\d]{2})([\d]{2})([\d]{2})([\d]{2})([\d]{2})([+-]{1}[\d]{7})([+-]{1}[\d]{8})([\d]{3})([\d]{3})([+-]{1}[\d]{4})([\d]{2})(;D([\w]{6})|)?;IGN([01]{1});IN(.*?);XP(.*?)(;TXT=([\w\s]*)|)?(;#([\w]{4})|)?;ID=([\w]*);/gm;
var m; 
while ((m = re.exec(msg)) != null) {
    if (m.index === re.lastIndex) {
        re.lastIndex++;
    }
    console.log(m.index + " " + m);
    exit();
}
*/