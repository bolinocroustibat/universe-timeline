<?php

header('Content-Type: text/html; charset=utf-8'); 
include('connex.php');

// The PHP json_encode function convert UTF-8 strings to hexadecimal entities.
// JSON_UNESCAPED_UNICODE is available on PHP Version 5.4 or later.
// The following code is for Version 5.3 :
function raw_json_encode($input) {
    return preg_replace_callback(
        '/\\\\u([0-9a-zA-Z]{4})/',
        function ($matches) {
            return mb_convert_encoding(pack('H*',$matches[1]),'UTF-8','UTF-16');
        },
        json_encode($input)
    );
}

// En entrée : startdate, enddate, zoom
$startdate = $_GET['startdate'];
$enddate = $_GET['enddate'];
$zoom = $_GET['zoom'];
// $enddate=2014;
// $zoom=4;
// $startdate=$enddate-pow(10,$zoom);

/*
echo '<hr/>PREMIERE ANNEE A AFFICHER : '.$startdate.'<br/>';
echo 'DERNIERE ANNEE A AFFICHER : '.$enddate.'<br/><hr/>';
*/

$data = array();

// construction du tableau des périodes
$req = $bdd->query('SELECT debut_periode, fin_periode, nom_periode, couleur_periode FROM frise_periodes WHERE (debut_periode>='.$startdate.' AND fin_periode<='.$enddate.') OR (debut_periode>='.$startdate.' AND debut_periode<='.$enddate.') OR (fin_periode>='.$startdate.' AND fin_periode<='.$enddate.') OR (fin_periode>='.$enddate.' AND debut_periode<='.$startdate.')');
$rep = $req->fetchAll(PDO::FETCH_ASSOC); // Ou PDO:FETCH_NUM si on veut des clefs qui ne soient que des chiffres
$data[periods]=$rep;

// Ajout, à la suite du tableau, des évènements
$req = $bdd->query('SELECT date_evenement, nom_evenement FROM frise_evenements WHERE '.$zoom.'>=zoom_mini_evenement AND date_evenement>='.$startdate.' AND date_evenement<='.$enddate);
$rep = $req->fetchAll(PDO::FETCH_ASSOC); // Ou PDO:FETCH_NUM si on veut des clefs qui ne soient que des chiffres
$data[events]=$rep; // on ajoute les deux tableaux

$data=raw_json_encode($data);
print_r($data);

?>