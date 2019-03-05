<?php
include('connex.php');
?>

<!DOCTYPE html>
<html lang="en">

<head>

	<meta charset="UTF-8" />

	<title>Frise interactive de l'histoire de l'univers - preprod</title>
	
	<link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
	<link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
	
	<meta name="Description" content="Adrien Carpentier" />
	<meta name="Generator" content="Notepad++" />
	<meta name="Keywords" content="" />
	
	<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />

	<link href="style/normalize.css" rel="stylesheet" type="text/css" media="all">
	<link href="style/style.css" rel="stylesheet" type="text/css" media="all">	
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
	<script type="text/javascript" src="./js/svg.js"></script> <!-- a utiliser pour developpement -->
	<!-- <script type="text/javascript" src="./js/svg.min.js"></script> <!-- a utiliser pour production -->
	
</head>

<body>
	
	<div id="main-wrapper">

		<div id="window-info"></div>
	
		<div id="zoom">
			ZOOM=<span></span>
			<br/>
			<input type="button" class="zoom-button" value="moins" onClick="zoom_less()">
			<input type="button" class="zoom-button" value="plus" onClick="zoom_more()">
		</div>
		
		<svg id="frise-wrapper" xmlns="http://www.w3.org/2000/svg" version="1.1" >	
		</svg>
		
	</div>
	
	<script type="text/javascript">
		/* création et valeurs par défaut des variables */
		var zoom=2; /* c'est un entier et non une chaîne de caractères donc à ne pas mettre entre guillemets */
		var enddate=2014;
		startdate=enddate-Math.pow(10,zoom);
		var draw = SVG('frise-wrapper').size('100%', '200px')
		/*
		var svg = document.querySelector('#frise-wrapper');
		svg.setAttribute('width', $(window).width());
		svg.setAttribute('height', '250px');
		*/
		
		$('#window-info').html('La fenêtre fait ' + $(window).width() + 'px de large</br>Premiere année : ' + startdate + '</br>Dernière année : ' + enddate); // DEBUG

		$('#zoom span').append(zoom);
		
		
		/* AU REDIMENSIONNEMENT DE LA FENETRE */
		$(window).resize(function() { // au redimensionnement de la fenêtre
			$('#window-info').html('La fenêtre fait ' + $(window).width() + 'px de large</br>Premiere année : ' + startdate + '</br>Dernière année : ' + enddate); // DEBUG
			// svg.setAttribute('width', $(window).width());
			// $('#frise-wrapper').css('width',$(window).width());
		});
		
		/* ON CHARGE LES DONNEES A AFFICHER */
	display_data(startdate,enddate,zoom);

		function zoom_less(){
			if (zoom>2) {
				zoom = zoom - 1;
				$( "#zoom span" ).replaceWith('<span>'+zoom+'</span>');
				startdate=enddate-Math.pow(10,zoom);
				$('#window-info').html('La fenêtre fait ' + $(window).width() + 'px de large</br>Premiere année : ' + startdate + '</br>Dernière année : ' + enddate); // DEBUG
				years_per_pixel=Math.pow(10,zoom)/$(window).width();
				display_data(startdate,enddate,zoom);
			}
		}

		function zoom_more(){
			if (zoom<10) {
				zoom = zoom + 1;
				$( "#zoom span" ).replaceWith('<span>'+zoom+'</span>');
				startdate=enddate-Math.pow(10,zoom);
				$('#window-info').html('La fenêtre fait ' + $(window).width() + 'px de large</br>Premiere année : ' + startdate + '</br>Dernière année : ' + enddate); // DEBUG
				years_per_pixel=Math.pow(10,zoom)/$(window).width();
				display_data(startdate,enddate,zoom);
			}
		}
		
		
		
		
		function display_data(startdate,enddate,zoom) {
			// si le cache n'est pas complet pour ce zoom, on le remplit
			get_data_from_bdd(startdate,enddate,zoom);
			console.log(bdd_array); // la xyntaxe pour récupérer un élémént est "console.log(data_array.events[1].date_evenement);"
			// si le cache est complet pour ce zoom on affiche
			console.log(cache_array);
			/*
			for (var i = 0; i < cache_array[periods].length; i++) {
				// console.log('evenement' + i + ':'); // debug
				// console.log(data_array[i]); // debug
				posx=((cache_array[i].date_evenement)-startdate)/years_per_pixel;
				console.log(posx); // debug
				var line = draw.line(posx, 0, posx, 200).stroke({ width: 1 });
				var text = draw.text(cache_array[i].nom_evenement).x(posx).y(180).font({family:'Helvetica',anchor:'middle'}).fill({ color: '#ff6' });
			};
			for (var i = 0; i < cache_array[events].length; i++) {
				// console.log('periode' + i + ':'); // debug
				// console.log(data_array[i]); // debug
				// console.log(years_per_pixel); // debug					
			};
			*/
		}


		/* FONCTION POUR ALLER CHERCHER DES DONNEES EN BDD POUR UNE PERIODE ET UN ZOOM DONNES */
		function get_data_from_bdd(startdate,enddate,zoom) {
			$.ajax({
				url : 'ajax_get_infos.php', // La ressource ciblée
				type : 'GET', // Le type de la requête HTTP
				data : 'startdate=' + startdate + '&enddate=' + enddate + '&zoom=' + zoom, // On fait passer nos variables au script ajax_get_infos.php
				contentType: "application/json; charset=utf-8", // Le type de données à recevoir, ici du JSON
				cache: true,
				success: function(reponse){
					var bdd_array = jQuery.parseJSON(reponse); // Nota : jQuery.parseJSON est mieux que JSON.parse (fait des test en plus)
					// console.log(bdd_array); // la xyntaxe pour récupérer un élémént est "console.log(data_array.events[1].date_evenement);"
					return bdd_array;
					//display_data(data_array);
				},
				error: function(){alert('La requête a échouée !');}
			});
		}

	
	cache = function() { // ceci est une classe, qui ne sera instanciée que par un seul objet
		this.data = array();
		this.getDataToDisplay = function(startdate,enddate,zoom){
			// méthode pour interroger le cache. Pas de requete Ajax là-dedans
		}
		this.loadNewData = function(startdate,enddate,zoom){ // méthode pour récupérer de nouvelles données et les ajouter au cache. on met les requetes ajax là-dedans

		}
	}
	
	
	// TEST ORIENTE OBJET
	/*
	function classedemo(param1, param2){
		this.x = param1;
		this.y = param2;	
	}
	
	objetdemo = new classedemo(1,2);
	
	objetdemo = new object();
	objetdemo{'x'} = 1;
	objetdemo{'y'} = 2;
	*/

	
	</script>

</body>

</html>