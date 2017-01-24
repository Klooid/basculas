// JS Backend
var express = require('express');
var app = express();
var http = require("http").Server(app);
var path = "C:/xampp/htdocs/bascula/";
var glob = require("glob");

// Variables principales
// Non-debug variables
/*
var peso = 0;
var altura = 0;
var credito = 0;
var completedFlag = 0;
*/
// Debug variables
var peso = 20.2;
var altura = 175.2; //cm
var credito = 0;
var completedFlag = 0;

// Rutina de llamadas
app.get('/p', function(req, res) {
  	var obj = JSON.parse(req.query.json);
  	console.log("Operacion: " + obj.op);
  	if(obj.op == "postPrice")
  	{
  		sendPrice(res, obj.tarea, obj.monto);
  	}
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
  	else if(obj.op == "getResults")
  	{
  		var response = {"weight":peso.toFixed(2), "height":(altura/100).toFixed(2)};
  		res.json(response);
  	}
  	else if(obj.op == "getAds")
  	{
  		sendVideos(path,res);
  	}
  	/*
  	if(obj.user == "lleon")
  		res.send("Bienvenido " + obj.user + " Su id es: " + obj.id);
  	res.json(obj);
  	*/
});

app.use('/', function(req,res){
	res.sendFile(path + req.originalUrl);
});


http.listen(3000, function(){
    console.log('Express server listening on port 3000' );
});


function sendPrice(res, tarea, monto)
{
	var response = {"response":"OK"};
  	res.json(response);
	setTimeout(function(){
		credito = monto;
		completedFlag = 1;

	},5000);
}

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
	    	if(extension == "jpg" || extension == "png" || extension == "gif" || extension == "svg" || extension == "jpeg")
	    	{
	    		ads = {"type":"img", "filename":file};
	    		response.push(ads);
	    	}
	    	else if(extension == "mp4")
	    	{
	    		ads = {"type":"video", "filename":file};
	    		response.push(ads);
	    	}


	    }
	    res.json(response);
	});
}
