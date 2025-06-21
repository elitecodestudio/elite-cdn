<?php 
session_start();
$ipaddress = getenv("REMOTE_ADDR") ;
Echo "Your IP Address is " . $ipaddress . " Contact Elite Code";

?>