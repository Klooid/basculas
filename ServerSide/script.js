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
	conn.query("SELECT * FROM mediasources ORDER BY expiration DESC LIMIT 1000", function(err,rows, fields){
		
		if(err) throw err;
		else
		{
			for(var i in rows)
			{
				// View if file exists
				viewFilemedia(rows, i,viewDBmedia);
				
			}
		}
	});
}

/*
	Debug - View DB data
*/
function viewDBmedia(rows, i, fstat)
{
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

	// See the status of the register
	if(rows[i].status == "Scheduled" && missing < 0 && fstat == "EXIST")
		// Take off the media
		deleteFilemedia(rows, i);
	else if(rows[i].status == "Scheduled" && missing != 0 && fstat != "EXIST")
		// Insert error message
		throwError(rows, i);
	else if(rows[i].status == "Error" && fstat == "EXIST")
		// Take off the media
		deleteFilemedia(rows, i);

}

/*
	Debug - View if file exists
*/
function viewFilemedia(rows, i, callback)
{
	
	fs.stat("media/"+rows[i].link,function(err, stat){
		console.log("---------------------------");
		if(err == null)
			{
				console.log("File '" + rows[i].link + "' exists");
				var fstat = "EXIST";
				callback(rows, i, fstat);
			}
		else if(err.code == 'ENOENT')
			{
				console.log("File '" + rows[i].link + "' not exists");
				var fstat = "NOTEXIST";
				callback(rows, i, fstat);
			}
		else
			{
				console.log("Error: " + err.code);
				var fstat = "ERROR";
				callback(rows, i, fstat);
			}
	});

	
}

/*
	Debug - Take off a media file
*/
function deleteFilemedia(rows, i)
{
	// From the database
	var sql = "UPDATE mediasources SET status = " + conn.escape("Expired") 	+ " WHERE id = '" + conn.escape(rows[i].id) + "'";

	conn.query(sql, 
				function(err,row, field){
					if(err) throw err;
					else console.log("Media file taken off");
	});	
	// From files
	fs.unlink("media/"+rows[i].link, function(err) {
	   if (err) {
	      return console.error(err);
	   }
	   console.log("Media file deleted");
	});
}

/*
	Debug - Put error message in DB
*/
function throwError(rows, i)
{
	// From the database
	var sql = "UPDATE mediasources SET status = " 
				+ conn.escape("Error") 
				+ " WHERE id = '" 
				+ conn.escape(rows[i].id) + "'";
			
	conn.query(sql, 
				function(err,row, field){
					if(err) throw err;
					else console.log("Media file taken off");
	});	
}

