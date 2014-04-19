// Requires
var util = require("./util.js");

// DB Connection
exports.connection = null;

// Init DB
exports.init = function() {
    var callback = this;
    function kickWatchDog() {
        this.connection.end();
        setTimeout(function () { require('./db.js').init(); }, 5000);
    }
    util.log("DB INIT, Inicializa DB");
    var mysql = require('mysql');
    this.connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root',
        database : 'rinhonode'
    });
    this.connection.on('error', function(err) {
        util.log("DB ERROR, DB Disconected DB!");
        util.log("DB ERROR, " + err);
        kickWatchDog();
    });
    this.connection.connect(function(err) {
        if (err) {
            util.log("DB ERROR, Disconected DB!");
            util.log("DB ERROR, " + err);
            kickWatchDog();
        }
    });
}

// Prepares a SQL Insert  from an associative array
exports.prepareInsert = function(data, table) {
    var values = [], keys = [];
    for (var key in data) {
        if (data[key] == null) values.push("NULL");
        else if (key == "createdAt" || key == "modifiedAt") values.push(data[key]);
        else values.push("'"+data[key]+"'");
        keys.push(key);
    }
    var sqlString = "INSERT INTO "+ table +" (" + keys.join(',') + ") VALUES(" + values.join(',') + ")";
    return sqlString;
}
