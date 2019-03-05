<?php

header('Access-Control-Allow-Origin: *');
// header("Content-Type: application/json;");
header("charset=UTF-8"); 
include('../connex.php');


$req = $bdd->query('SELECT name FROM frise_periodes WHERE id="2" ');
$rep = $req->fetch(PDO::FETCH_ASSOC);
print_r($rep[name]);

?>