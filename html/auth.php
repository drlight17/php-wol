<?php
include_once 'db.php';

class Auth {
        /**
         * Default constructor which checks for http authentication
         */
        function __construct() {
                if(!isset($_SESSION)) session_start();

                if(!empty($_SERVER['PHP_AUTH_USER']) && !empty($_SERVER['PHP_AUTH_PW'])) {
                        login($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
                }
        }

        /**
         * check if user has enough rights to do actions
         * Levels:
         * 0 - Not authenticated
         * 1 - Basic user (View)
         * 2 - Skilled user (1 + turn Off PC)
         * 3 - Admin (2 + Manage servers (Add, Remove ,Edit))
         * @param $min minimum level required to to that action
         */
/*      function hasLevel($min = 1) {
                if(empty($_SESSION['user'])) return $min <= 0;

                return $_SESSION['user']['level'] >= $min;
*/      }
        function hasLevel($min){
                if(empty($_SESSION['user'])) return 0;
                if ($_SESSION['user']['level']>=$min) return true;
                return false;
        }


        /**
         * @return the access level of the user
         */

        function getLevel(){
                if(empty($_SESSION['user'])) return 0;
                return $_SESSION['user']['level'];
        }


        /**
         * performs login and returns success
         *
         * @param $username the username of the user
         * @param $password the cleartext password of the user
         * @return bool if the login was sucessful
         */
        function login($username, $password){
                // ******************ldap config*****************
                $srv = "dc.domain.ltd";  // DC address
                $uname = $username."@domain.ltd"; // ldap username with read permissions
                $upasswd = $password;  // ldap user password
                $dn = "dc=domain,dc=ltd"; // main DN for binding
                //***********************************************
                $ds=ldap_connect($srv);
                if (!$ds) return false;
                $r=ldap_bind($ds, $uname, $upasswd);
                if (!$r) return false;
                $db = new Database();
                $rs = $db->query("SELECT * FROM user WHERE username = '" . mysqli_real_escape_string($db,$username) . "'")->fetch_assoc();
//              if(empty($rs)) return false;
                if(empty($rs)) {
//                  $rs = $db->query("SELECT * FROM user WHERE username = 'domain user'")->fetch_assoc();
                    $rs = array('id'=>null,'username'=>$username,'level'=>1);
                };
                $user = $rs;
//              $hash = hash('sha512', $user['level'].'g$6|@#'.$user['id'].$password);

//              if($user['password'] == $hash) {
                $_SESSION['user'] = $user;
                $_SESSION['password'] = $password;
                return true;
//              }

//              return false;
        }

        /**
         * performs logout for the user (if someone is logged in)
         */
        function logout() {
                unset($_SESSION['user']);
        }

        function getUsername(){
                return $_SESSION['user']['username'];
        }
}

        /**
         * stolen from https://stackoverflow.com/questions/2040240/php-function-to-generate-v4-uuid
         * but it may not even be used right now
         */
        function uuid() {
                return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                        // 32 bits for "time_low"
                        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),

                        // 16 bits for "time_mid"
                        mt_rand( 0, 0xffff ),

                        // 16 bits for "time_hi_and_version",
                        // four most significant bits holds version number 4
                        mt_rand( 0, 0x0fff ) | 0x4000,

                        // 16 bits, 8 bits for "clk_seq_hi_res",
                        // 8 bits for "clk_seq_low",
                        // two most significant bits holds zero and one for variant DCE1.1
                        mt_rand( 0, 0x3fff ) | 0x8000,

                        // 48 bits for "node"
                        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
}
?>
