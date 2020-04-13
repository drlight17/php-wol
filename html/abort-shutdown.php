<?php
        include_once 'auth.php';
        $auth = new Auth();

        if($auth->hasLevel(2)){
                $status = null;
                if(isset($_POST['ip'])){
//                      $pingresult = exec("fping -c1 -t500 {$_POST['ip']}", $outcome, $status);
//                      echo $_SESSION['password'];
//                      $file = './tmp/wol.log';
//                      file_put_contents($file,$_SESSION['user']['username']);
//                      print_r($_SESSION['user']);
//                      $cmd = "net rpc abortshutdown -U KSC/Administrator%rkmSciZd8 -I 192.168.4.42";
                        $result = exec("net rpc abortshutdown -U KSC/{$_SESSION['user']['username']}%{$_SESSION['password']} -I {$_POST['ip']}", $outcome, $status);
//                      $result = exec("echo test", $outcome, $status);
                        if (0 == $status) {
                                $status = "success";
                        } else {
                                $status = "error";
                        }
                }
                else{
                        http_response_code(400);
                }
        }
        else http_response_code(401);

        $response = array(
                "status" => http_response_code(),
                "response" => $status
        );
        header('Content-Type: application/json');
        echo json_encode($response);
?>
