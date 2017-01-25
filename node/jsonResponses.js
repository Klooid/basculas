// Modules for WebApp
var express = require('express');
var app = express();
var http = require("http").Server(app);
// Listing ads files in the Orange PI
//var localpath = "C:/xampp/htdocs/bascula/";//C:\Users\Luis Leon\Documents\GitHub
var localpath = "C:/Users/Luis Leon/Documents/GitHub/basculas/";
var glob = require("glob");
// Serial communication with ATMEGA328
var SerialPort = require('serialport');
// ttyS0: Orange's main serial port
var port = new SerialPort('COM6', { // Default: ttyS0
	baudRate: 9600
});

// Variables principales
// Non-debug variables

var peso = 0;
var altura = 0;
var credito = 0;
var completedFlag = 0;

// Debug variables
/*
var peso = 20.2;
var altura = 175.2; //cm
var credito = 0;
var completedFlag = 0;
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
  	else if(obj.op == "getAds")
  	{
  		sendVideos(localpath,res);
  	}

});

/*
    Send webapp files
*/
app.use('/', function(req,res){
	res.sendFile(localpath + req.originalUrl);
});

/*
    Create the app server
*/
http.listen(3000, function(){
    console.log('Express server listening on port 3000' );
});

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
    Send available videos in the Orange PI
*/

function sendVideos(path,res)
{
	glob(path + "ads/*", function (er, files) {
	  var response = [];
	  for(var i in files)
	    {
	    	var file = files[i].slice(files[i].indexOf("ads/") + 4);
	    	console.log(file);
	    	var extension = file.slice(file.lastIndexOf(".")+1);
	    	console.log(extension);
        // Image types
	    	if(extension == "jpg" || extension == "png" || extension == "gif" || extension == "svg" || extension == "jpeg")
	    	{
	    		ads = {"type":"img", "filename":file};
	    		response.push(ads);
	    	}
        // Video types
	    	else if(extension == "mp4")
	    	{
	    		ads = {"type":"video", "filename":file};
	    		response.push(ads);
	    	}
        // In case if type isn't know, it won't be added to queue

	    }
	    res.json(response);
	});
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

/*
    Klooid Feedback
*/

// Add Database
