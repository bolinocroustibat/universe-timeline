<?php

header('Access-Control-Allow-Origin: *');
// header("Content-Type: application/json;");
header("charset=UTF-8"); 
include('../connex.php');

$parent_period_id = $_GET['parent_period_id'];

$outp = "";

// récupération de tutes les périodes
$req = $bdd->query('SELECT id, name FROM frise_periodes');

while($rep = $req->fetch(PDO::FETCH_ASSOC)) {
    if ($outp != "") {$outp .= ",";}
	$outp .= '{"ID":"'  . $rep["id"] . '",';
	$outp .= '"PeriodName":"'. $rep["name"]     . '"}';
}
$outp ='"periods":['.$outp.']';

// récupération du nom de la période parente
$req = $bdd->query('SELECT name FROM frise_periodes WHERE id='.$parent_period_id);
$rep = $req->fetch(PDO::FETCH_ASSOC);

$outp = '{"parent_period_name":"'.$rep[name].'",'.$outp.'}';

echo($outp);
?>