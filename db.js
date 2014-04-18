var util = require("./util.js");

exports.connection = null;
exports.init = function() {
	var callback = this;
    function kickWatchDog() {
		connection.end();
        setTimeout(function () { require('./db.js').init(); }, 5000);
    }
    util.log("DB INIT, Inicializa DB");
    var mysql = require('mysql');
    connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root',
        database : 'rinhonode'
    });
    connection.on('error', function(err) {
        util.log("DB ERROR, DB Disconected DB!");
		util.log("DB ERROR, " + err);
        kickWatchDog();
    });
    connection.connect(function(err) {
        if (err) {
            util.log("DB ERROR, Disconected DB!");
			util.log("DB ERROR, " + err);
            kickWatchDog();
        }
    });
}

exports.prepareInsert = function(data) {
	var values = [], keys = [];
	for (var key in data) {
		if (data[key] == null) values.push("NULL");
		else if (key == "createdAt" || key == "modifiedAt") values.push(data[key]);
		else values.push("'"+data[key]+"'");
		keys.push(key);
	}
	var sqlString = "INSERT INTO TRACKS (" + keys.join(',') + ") VALUES(" + values.join(',') + ")";
	return sqlString;
}