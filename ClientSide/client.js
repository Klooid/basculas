/*
------------------------------------------------------------------------------------------------------------------------------------
	Klooid Innovations
	Departamentos de Energia e Innovacion
	Codigo de servidor de basculas para control de videos
	Desarrollado por:
		- Luis Leon (Diseño electrónico. Desarrollo web Backend y Arduino)
		- Christopher Quiros (Diseño web. Desarrollo web Frontend)
	Horas invertidas: 
		8-05-2017
------------------------------------------------------------------------------------------------------------------------------------
*/


/*
-----------------------------------------------------------------
	Important configs
-----------------------------------------------------------------
*/

/*
	Constants
*/

const device = "MACHINE1";
const mediaServer = "http://localhost/server_media_basculas/media/";

/*
	Importing libraries
*/

var mysql = require('/home/lleon95/node_modules/mysql'); // Database
var express = require('/home/lleon95/node_modules/express');
var app = express();
var http = require("http").Server(app);

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
    Create the app server
*/
http.listen(3000, function(){
	console.log("------------------------------------");
    console.log(" Client started and listing on 3000 ");
    console.log("------------------------------------");
});


/*
-----------------------------------------------------------------
	Management of JSON Calls - Only implemented for body machine
-----------------------------------------------------------------
*/
/*
    Managing calls - JSON
*/
app.get('/p', function(req, res) {
  	var obj = JSON.parse(req.query.json);
  	console.log("Operacion: " + obj.op);
  	// Getting how much money must be paid
  	if(obj.op == "postPrice")
  	{
  		sendPrice(res, obj.tarea, obj.monto);
  	}
    // Getting how much money has been paid
  	else if(obj.op == "getCredit")
  	{
  		var response = {"credit":credito, "completed":completedFlag};
  		res.json(response);
  		if(completedFlag)
  		{
  			completedFlag = 0;
  			credito = 0;
  		}
  	}
    // Send results to user
  	else if(obj.op == "getResults")
  	{
  		var response = {"weight":peso.toFixed(2), "height":(altura/100).toFixed(2)};
  		res.json(response);
  	}
  	elseif(obj.op == "getAds")
  	{
  		//sendVideos(localpath,res); OLD
  		getMedia(res, sendMedia);
  	}

});

/*
-----------------------------------------------------------------
	Acquisicion of new media data
-----------------------------------------------------------------
*/

/*
	Acquiring valid media
*/

// Getting from database
function getMedia(res,callback)
{
	var media = [];
	conn.query("SELECT * FROM mediasources WHERE status = 'Scheduled' ORDER BY expiration DESC LIMIT 1000", function(err,rows, fields){
		
		if(err) throw err;
		else
		{
			for(var i in rows)
			{
				media.push(mediaServer + rows[i].link);		
			}
			callback(res,media);
		}
	});
}

// Returning
function sendMedia(res,media)
{
	// Returning to JSON
	res.json(media);
}

/*
    Send webapp files
*/
app.use('/', function(req,res){
	res.sendFile(localpath + req.originalUrl);
});

/*
-----------------------------------------------------------------
	Aquí comienza el código viejo
-----------------------------------------------------------------
*/

/*
    Receive new request and send price to Arduino.
*/
function sendPrice(res, tarea, monto)
{
	var response = {"response":"OK"};
  res.json(response);
  // Sending price
  if(port.isOpen())
    port.write(monto.toString());
  // DEBUG!!
  /*
	setTimeout(function(){
		credito = monto;
		completedFlag = 1;

	},5000);
  */
  // END DEBUG!!
}

/*
    Receiving data from ATMEGA328
*/
var msg = "";
port.on('data', function(data){
  // Data has the following format: "Credito_en_monedas","Pago_Completo_0_o_1", "longitud_medida", "peso_medido"
  msg += data.toString();
  if(msg.endsWith("\n"))
  {
    var elements = msg.split(","); // data separate by commas
    credito = Number(elements[0]);
    completedFlag = Number(elements[1]);
    altura = Number(elements[2]) * 100; // Come as cm
    peso = Number(elements[3]);
    msg = "";

    // DEBUG!!
  	console.log('credito: ' + credito);
    console.log('completedFlag: ' + completedFlag);
    console.log('altura: ' + altura);
    console.log('peso: ' + peso);
    // END DEBUG!!
  }


  // DEBUG!!
	//console.log('Data: ' + msg);
  // END DEBUG!!
});