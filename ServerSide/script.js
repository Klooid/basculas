/*
------------------------------------------------------------------------------------------------------------------------------------
Klooid Innovations
Departamentos de Energia e Innovacion
Codigo de servidor de basculas para control de videos
Desarrollado por:
	- Luis Leon (Diseño electrónico. Desarrollo web Backend y Arduino)
	- Christopher Quiros (Diseño web. Desarrollo web Frontend)
Horas invertidas: 
	7-05-2017: 3H
------------------------------------------------------------------------------------------------------------------------------------
*/

/*
	Importing libraries
*/
var mysql = require('/home/lleon95/node_modules/mysql'); // Database
var fs = require('fs');		 // File system

/*
	Start MySQL connection
*/
var conn = mysql.createConnection({
	host		: "localhost",
	user		: "root",
	password	: "",
	database    : "bascnet"
});
conn.connect();

/*
	Start cycle
*/
setInterval(function(){

	loop();

},5000);

/*
	Main cycle
*/
function loop()
{
	conn.query("SELECT * FROM mediasources", function(err,rows, fields){
		
		if(err) throw err;
		else
		{
			for(var i in rows)
			{
				viewDBmedia(rows, i);
			}
		}
	});
}

/*
	Debug - View DB data
*/
function viewDBmedia(rows, i)
{
	console.log("---------------------------")
	console.log("Owner: " + rows[i].ownerid);
	console.log("Path: " + rows[i].link);
	console.log("Show Type: " + rows[i].showtype);
	console.log("View In: " + rows[i].showin);
	console.log("Expiration: " + rows[i].expiration);
	console.log("Creation: " + rows[i].register);
	console.log("Status: " + rows[i].status);

	// Missing time to delete:
	var exp = new Date(rows[i].expiration);			// Traslate to date object
	var now = new Date();							// Acquire this moment's time
	var missing = exp.getTime() - now.getTime();	// Find the difference
	console.log("Missing: " + Math.round(missing/60000) + " minutes");
}