<?php
class Database extends mysqli{
        private $servername = "hostname.ltd";
        private $username = "user";
        private $password = "pass";
        private $database = "php-wol";
        private $mysqli;
//      web gui user is every ldap user which is not in the database with level 1 rights
//      default web gui administrator is ldap Administrator account with level 3 rights
//      feel free to add more admin or extended user account(s) from your ldap with level 3 and 2 respectively rights manually

        function __construct() {
                // Create connection
                parent::__construct($this->servername, $this->username, $this->password);

                // Check connection
                if ($this->connect_error) {
                        die("Connection failed: " . $this->connect_error);
                }

                //check if database exists
                $result = $this->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{$this->database}'");
                if(mysqli_num_rows($result) <= 0) $this->create();
                else $this->query("USE `{$this->database}`");
        }

        /**
         * creates a new database
         */
        function create() {
                $query = "
CREATE DATABASE `{$this->database}`;
USE `{$this->database}`;
CREATE TABLE server (
  id varchar(45) NOT NULL PRIMARY KEY,
  name varchar(30) NOT NULL,
  ip varchar(16) NOT NULL,
  mac varchar(20) UNIQUE,
  broadcast varchar(16)
);

CREATE TABLE user (
  id int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  username varchar(30) NOT NULL UNIQUE,
  level int NOT NULL
);
INSERT INTO user VALUES (1, 'Administrator', 3);
                ";
                $this->multi_query($query);
        }
}
?>
