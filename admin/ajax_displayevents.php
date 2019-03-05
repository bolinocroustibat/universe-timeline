<?php

header('Access-Control-Allow-Origin: *');
// header("Content-Type: application/json;");
header("charset=UTF-8"); 
include('../connex.php');

// construction du tableau des évènements
$req = $bdd->query('SELECT id, date, parent_period_id, name, description, image FROM frise_evenements');

/*
$rep = $req->fetchAll(PDO::FETCH_ASSOC);
print_r($rep);
*/

$outp = "";
while($rep = $req->fetch(PDO::FETCH_ASSOC)) {
    if ($outp != "") {$outp .= ",";}
	$outp .= '{"ID":"'  . $rep["id"] . '",';
	$outp .= '"Date":"'   . $rep["date"]        . '",';
	$outp .= '"Parent_period_id":"'   . $rep["parent_period_id"]        . '",';	
	$outp .= '"Name":"'. $rep["name"]     . '"}';
}
$outp ='{"records":['.$outp.']}';

echo($outp);
?>