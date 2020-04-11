#!/usr/bin/php

// service utility to make password hash
<?php
$user_id = num;
$rights = num;
$password = 'password';

//    phpinfo();
    $hash = hash('sha512', $rights.'g$6|@#'.$user_id.$password);
    echo $hash;
?>
