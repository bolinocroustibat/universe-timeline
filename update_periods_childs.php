<?php
// script qui fait un update sur "has_child" et met à jour les champs pour dire que les périodes ont des enfants

header('Acess-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');
include('connex.php');

$req = $bdd->query('SELECT id FROM frise_periodes'); // requête sur toutes les lignes de la table
while ($rep = $req->fetch()) { // boucle sur chaque ligne
	$id = $rep[0];
	$req2 = $bdd->query('SELECT parent_period_id FROM frise_periodes WHERE id='.$id);
	$rep2 = $req2->fetch(PDO::FETCH_NUM); // récupère l'id du parent
	$req3 = $bdd->query('UPDATE frise_periodes SET has_child = 1 WHERE id='.$rep2[0]); // met à jour le parent correspondant, comme quoi il a un enfant
}

?>