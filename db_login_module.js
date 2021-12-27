const mysql = require("mysql");
const connection = mysql.createPool({
	connectionLimit : 100, 
	host:"localhost",
	user:"root",
	password:"Balaji1359#",
	database:"jobApplication"

	// database: "mydb"
});

exports.connection = connection;