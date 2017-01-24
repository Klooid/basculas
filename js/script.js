var option = "";
var weight = 31;
var height = 1.7;
var imc = 18.2;
var sexo = "";
var tarea = "";
var tasaejercicios = "";
var field = "calEdad";
var edad = 0;
var next = "";
var price = 0;
var ads = [];
var waitingInterval;
var dominio = "localhost";

$(function(){
			var w = window.innerWidth
			|| document.documentElement.clientWidth
			|| document.body.clientWidth;

			var h = window.innerHeight
			|| document.documentElement.clientHeight
			|| document.body.clientHeight; 

			getAds();

			$(".panel").css('height', h*0.8);
			$(".panel").hide();
			$("#panel1").show();

			// Para cambiar del panel 1 al 2
		    $("#newRequest").click(function(){
		    	$("#panel1").fadeOut("slow");
		    	document.getElementById('video').pause();
		    	$("#panel2").fadeIn("slow");
		    	$("#video").hide();
		    	$("#pictures").hide();
			});

			// Para cambiar del panel 2 al 3
		    $("#selected").click(function(){
		    	if(option != "")
		    	{
		    		$("#panel2").fadeOut("slow");
		    		tarea = option;
		    		$("#price").html(price);
		    		$("#panel3").fadeIn("slow");
		    		waiting_paid(price, tarea, "post");
		    	}
		    	else alert("Debe seleccionar 1");
		    	
			});

			// Para cambiar del panel 2 al 1
		    $("#cancel2").click(function(){
		    	$("#panel2").fadeOut("slow");
		    	$(".options").removeClass('active');
		    	option ="";
		    	changeAd();
		    	$("#panel1").fadeIn("slow");
			});

			// Para cambiar del panel 3 al 1
		    $("#cancel3").click(function(){
		    	$("#panel3").fadeOut("slow");
		    	changeAd();
		    	$(".options").removeClass('active');
		    	option ="";
		    	$("#panel1").fadeIn("slow");
		    	clearInterval(waitingInterval);
			});

			// Para cambiar del panel 3 al 4
		    $("#paid").click(function(){
		    	paid();	// TEST
			});

			// Para testear con resultados
			$("#gotResults").click(function(){
				gotResults(); // TEST
			});


			// Para seleccionar únicos
			$(".options").click(function(){
				$(".options").removeClass('active');
				$(this).addClass('active');
				option = $(this).attr('param');
				price = $(this).attr('price');
			});
			// Retornar a inicio
		    $("#cancel2").click(function(){
		    	$("#shareResults").fadeOut("slow");
		    	changeAd();
		    	$(".options").removeClass('active');
		    	option ="";
		    	$("#panel1").fadeIn("slow");
			});
			// Compartir
		    $(".share").click(function(){
		    	$(".panel").fadeOut("slow");
		    	// Temporalmente fuera
		    	//$("#shareResults").fadeIn("slow");
		    	changeAd();
		    	$("#panel1").fadeIn("slow");
		    	$(".options").removeClass('active');
			});
			// Retornar a inicio
		    $(".home").click(function(){
		    	$(".panel").fadeOut("slow");
		    	changeAd();
		    	$("#panel1").fadeIn("slow");
		    	$(".options").removeClass('active');
		    	option ="";
			});
			// Pasar a preguntar sobre ejercicios
		    $("#calorias_sexSubmit").click(function(){
		    	if(option == "male" || option == "female")
		    	{
		    		$("#calorias_preguntasSexo").fadeOut("slow");
		    		$(".options").removeClass('active');
		    		sexo = option;
		    		option ="";
		    		$("#calorias_preguntasEjercicio").fadeIn("slow");
		    	}
		    	else
		    		alert("Debe seleccionar alguna opción");
			});
			// Pasar a resultados
		    $("#calorias_ejercicioSubmit").click(function(){
		    	if(option == "1.2" || option == "1.375" || option == "1.55" || option == "1.725" || option == "1.9")
		    	{
		    		$("#calorias_preguntasEjercicio").fadeOut("slow");
			    	$(".options").removeClass('active');
			    	tasaejercicios = Number(option);
			    	option ="";
			    	// ----- EDIT
			    	field = "calEdad";
			    	next = "result_calorias";
			    	$("#edad").attr('next', "result_calorias");
			    	$("#edad").fadeIn("slow");
		    	}
		    	else
		    		alert("Debe seleccionar alguna opción");
			});
		    //  Keyboard
		    $(".keys").click(function(){
		    	if($(this).attr('val') == "DEL")
		    	{
		    		var str = $("#"+field).val();
		    		$("#"+field).val(str.slice(0,-1));
		    	}
		    	else
		    	{
		    		var str = $("#"+field).val() + $(this).attr('val');
		    		$("#"+field).val(str)
		    	}
		    });

		    $("#edadSubmit").click(function(){
		    	if($("#"+field).val() != "")
		    	{
		    		
			    	edad = Number($("#"+field).val());
			    	calc_Calories();
		    	}
		    	else
		    		alert("Debe digitar su edad para continuar");
			});


		});
		
/*

var UpdateUserValuesObj = { "username":username, "ual":login_val, "type":"POST", "op":"UPDATE_User", "device":control, "username":username,"fullname":fullname,"phone":phone,"email":email,"new_password":new_password,"new_password_confirmation":new_password_confirmation,"old_password":old_password};
			var UpdateUserValuesJSON = JSON.stringify(UpdateUserValuesObj);
			var UpdateUserdir = "modules/dataJSON.php?json=" + UpdateUserValuesJSON;

*/

// Awaiting to get paid
function waiting_paid(amount, tarea, mode)
{
	if(mode == "post")
	{
		var data = {"tarea":tarea, "monto":Number(amount), "op":"postPrice"};
		var dataJSON = JSON.stringify(data);
		var URL= "http://"+dominio+":3000/p?json=" + dataJSON;
		$.getJSON(URL,function(result){
			if(result.response == "OK")
			{
				waitingInterval = setInterval(function(){
					waiting_paid(amount, tarea, "get");
				},1000);
			}
		});
	}
	else if(mode == "get")
	{
		var data = {"op":"getCredit"};
		var dataJSON = JSON.stringify(data);
		var URL= "http://"+dominio+":3000/p?json=" + dataJSON;
		$.getJSON(URL,function(result){
			// Pago completado
			if(Number(result.completed))
			{
				clearInterval(waitingInterval);
				paid();
			}
			else
			{
				$("#price").html(Number(amount) - Number(result.credit));
			}
		});
	}
}

// When it gets paid
function paid()
{
	$("#panel3").fadeOut("slow");
	document.getElementById('video').pause();
 	$("#panel4").fadeIn("slow");
 	setTimeout(function(){
 		gettingResults();
 	},5000);
}
// When its getting results
function gettingResults()
{
	var data = {"op":"getResults"};
	var dataJSON = JSON.stringify(data);
	var URL= "http://"+dominio+":3000/p?json=" + dataJSON;
	$.getJSON(URL,function(result){
		// Getting results
		weight = Number(result.weight);
		height = Number(result.height);
		imc = weight / (height * height);
		imc = Number(imc.toFixed(2))
		gotResults();
	});
}


function gotResults()
{
	// Verificar tipo de resultados
	if(option == "peso")
	{
		$("#panel4").fadeOut("slow");
		$("#showWeight").html(weight);
 		$("#resultPeso").fadeIn("slow");
	}
	else if(option == "altura")
	{
		$("#panel4").fadeOut("slow");
		$("#showHeight").html(height);
 		$("#resultAltura").fadeIn("slow");
	}
	else if(option == "IMC")
	{
		$("#panel4").fadeOut("slow");
		$("#imcpeso").html(weight);
		$("#imcaltura").html(height);
		$("#imcresult").html(imc);
 		$("#resultIMC").fadeIn("slow");
	}
	else if(option == "calorias")
	{
		$("#panel4").fadeOut("slow");
 		$("#calorias_preguntasSexo").fadeIn("slow");
	}
	else if(option == "pesorecomendado")
	{
		$(".panel").fadeOut("slow");
		$("#pesorecomendado_actual").html(weight);
		var pesoMin = height*height*18.5;
		$("#pesorecomendado_sedentario").html(pesoMin.toFixed(2));
		var pesoMax = height*height*25;
		$("#pesorecomendado_activo").html(pesoMax.toFixed(2));
		$("#resultPesoRecomendado").fadeIn("slow");
	}
}

function calc_Calories()
{
	$("#edad").fadeOut("slow");
	// Calc
	var desface = 0;
	if(sexo = "male")
		desfase = 5;
	else if(sexo = "female")
		desfase = -161;
	else
		console.log("Hay error en sexo");
	var tmb = 10*weight + 6.25*100*height - edad*5 + desfase;
	$("#showCalories").html(tmb);
	$("#"+next).fadeIn("slow");
}



function videoreload()
{
	$("#video").fadeOut(1500);
	setTimeout(function(){
		changeAd();
		
	},2000);	

}
// This OK
function playagain()
{
	$("#video").fadeIn(1500);
}
var counter = 0;
// Get ads
function getAds()
{
	// Get ads
	var data = {"op":"getAds"};
	var dataJSON = JSON.stringify(data);
	var URL= "http://"+dominio+":3000/p?json=" + dataJSON;
	$.getJSON(URL,function(result){
		// Getting results
		ads = result;
		counter = 0;
		// Put first add
		changeAd();
	});
}
// First ad

function changeAd()
{
	if(ads.length > 0 && counter != ads.length)
	{

		if(ads[counter].type == "video")
		{
			$("#video").attr('src',"ads/" + ads[counter].filename);
			document.getElementById('video').play();
			counter++;
		}
		else if(ads[counter].type == "img")
		{
			$("#pictures").attr('src',"ads/" + ads[counter].filename);
			$("#pictures").fadeIn(1500);
			counter++;
			setTimeout(function(){
				$("#pictures").fadeOut(1500);
				setTimeout(function(){
					changeAd();
				},1500);
			},5000);
		}

	}
	else
		getAds();
}
