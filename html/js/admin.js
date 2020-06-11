var servers = [];
var timer, create = true, checked= false;
var serverName, mac, ip, id, broadcast, username, password, usernameDisplay, level;

function getServers(){
        $.post("servers.php", {action:"get"}).done(function(data) {
                servers = data;

                $("#serverlist").html("");
                for(var server in servers){
                        const thisServer = servers[server];
                        var row = $("<tr><td>" + thisServer.name + "</td><td>" + thisServer.ip + "</td><td></td><td></td></tr>");
                        var col = $('<div class="btn-group"/>');
                        col.append('<a disabled class="btn btn-primary wake"><i class="glyphicon glyphicon-play"></i> Разбудить</a>').children().addClass(thisServer.name);
                        col.append($('<a class="btn btn-default"><i class="glyphicon glyphicon-refresh"></i> Обновить</a>').click(function(){ping(thisServer);}));

                        if(level > 1){
                                col.append($('<a disabled class="btn btn-primary off require-level-2"><i class="glyphicon glyphicon-off"></i> Выключить</a>').addClass(thisServer.name)).off();
//                              $("a.btn.btn-primary.off.require-level-2." + server.name).attr('disabled',true).off('click');

                        }
                        if(level > 2){
        var addbutton = $('body > div.container > div.btn-group.pull-right > button.btn.btn-success.require-level-3');
                                var btngrp = $('<div class="btn-group"><a class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></a><ul class="dropdown-menu" role="menu"></ul></div>');
                                btngrp.children("ul").append($('<li><a><i class="glyphicon glyphicon-pencil"></i> Редактировать</a></li>').click(function(){edit(thisServer);}));
                                btngrp.children("ul").append($('<li><a><i class="glyphicon glyphicon-trash"></i> Удалить</a></li>').click(function(){remove(thisServer);}));
                        }

                        col.append(btngrp);



                        row.children(':last').append(col);
                        $("#serverlist").append(row);
                        thisServer.statusField = $("#serverlist tr:last td:nth-child(3)");
                }

                pingAll();
        });
}

function guid() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function addServer() {
        serverName.val("");
        mac.val("");
        ip.val("");
        broadcast.val("");
        id = guid();
        create = true;
//      if (!(checked)) {
//      $("#modal").modal('show');
            $("#modal").modal({backdrop: 'static', keyboard: false});
//      };
}

function edit(server) {
        serverName.val(server.name);
        mac.val(server.mac);
        ip.val(server.ip);
        broadcast.val(server.broadcast);
        id = server.id;
        create = false;
        $("#modal").modal({backdrop: 'static', keyboard: false});
//      $("#modal").modal('show');
}

function save() {
        if ((mac.val()=="")||(ip.val()=="")||(serverName.val()=="")||(broadcast.val()=="")) {
//          alert ("Все поля обязательны к заполнению!");
            bootbox.alert("Все поля обязательны к заполнению!");
//          checked = true;
//          addServer();
//          $("#modal").modal({backdrop: 'static', keyboard: false});
            return;
            //$("#modal").modal('show');
        } else {
            $.post("servers.php", {id:id, mac:mac.val(), ip:ip.val(),name:serverName.val(),broadcast:broadcast.val(), action: (create ? "add" : "modify")})

                .done(function(data){
                        bootbox.alert("Компьютер сохранен");
                        getServers();
                })
                .fail(function(data){
                        bootbox.alert("Ошибка:" + data.status);
                });
            $("#modal").modal('hide');
        }
}

function remove(server) {
        bootbox.confirm("Вы действительно хотите удалить компьютер \"" + server.name + '"', function(result){
                if(result){
                        $.post("servers.php", {id:server.id, action:"remove"})
                                .done(function(data){
                                        bootbox.alert("Компьютер удален");
                                        getServers();
                                })
                                .fail(function(data){
                                        bootbox.alert("Ошибка:" + data.status);
                                });
                }
        });
}

function wake(server) {
        $.post("wake.php", {mac:server.mac, broadcast: server.broadcast})
                .done(function(data){
                        bootbox.alert("Попытка разбудить компьютер сделана. Попробуйте обновить статус через несколько секунд.");
//                      ping(server);
                })
                .fail(function(data){
                        bootbox.alert("Ошибка:" + data.status);
                });
}



function ping(server){
        server.statusField.html("Проверка...");
        server.statusField.css({color:"blue"});

        $.post("ping.php", {ip:server.ip})
                .done(function(data){
                        if(data.response == "alive"){
                                server.statusField.html("Включен");
                                server.statusField.css({color:"limegreen"});
//                              $("a.btn.btn-primary.wake." + server.name).attr('disabled',true).prop('onclick', null);
                                $("a.btn.btn-primary.wake." + server.name).attr('disabled',true).off();
                                $("a.btn.btn-primary.off.require-level-2." + server.name).off();
                                $("a.btn.btn-primary.off.require-level-2." + server.name).attr('disabled',false).click(function(){shutdown(server);});
                        }
                        if(data.response == "dead"){
                                server.statusField.html("Отключен");
                                server.statusField.css({color:"red"});
//                               if ($("a.btn.btn-primary.wake." + server.name).attr('disabled') == 'true') {
//                                  $("a.btn.btn-primary.wake." + server.name).prop('onclick', null);
                                    $("a.btn.btn-primary.wake." + server.name).off();
                                    $("a.btn.btn-primary.wake." + server.name).attr('disabled',false).click(function(){wake(server);});
                                    var repl = $("a.btn.btn-primary.abort-off.require-level-2." + server.name).off();
                                    repl.replaceWith($('<a class="btn btn-primary off require-level-2"><i class="glyphicon glyphicon-off"></i> Выключить</a>').addClass(server.name));
                                    $("a.btn.btn-primary.off.require-level-2." + server.name).attr('disabled',true).off();
//                              }
                        }
                })
                .fail(function(data){
                        server.statusField.html("&lt;Ошибка&gt;");
                        server.statusField.css({color:"orange"});
                });
}

function pingAll(){
        for(var server in servers){
                ping(servers[server]);
        }
}

function logout(){
        $.post("login.php", {a:"logout"})
                .done(function(){
                        usernameDisplay.html("");
                        level = 0;
                        showLogin();
                });
}

function login(){
        $("#login-modal").modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        $.post("login.php", {a:"login", username:username.val(), password:password.val()})
                .done(function(data){
                        if(data.response){
                                showLogin();
                        }
                        else {
                                //alert ("Вы не ввели логин и/или пароль!")
                                showLogin(true);
                                getServers();
                        }
                })
                .fail(function(data){
                        bootbox.alert("Error");
                        console.log(data);
                });
}

function shutdown(server) {
        $.post("shutdown.php", {ip:server.ip})
                .done(function(data){
                    if(data.response == "success"){
                        bootbox.alert("Команда выключения компьютера успешно выполнена. Попробуйте обновить статус через несколько секунд.");
//                      var repl = $("a.btn.btn-primary.off.require-level-2." + server.name).prop('onclick', null);
                        var repl = $("a.btn.btn-primary.off.require-level-2." + server.name).off();
                        repl.replaceWith($('<a class="btn btn-primary abort-off require-level-2"><i class="glyphicon glyphicon-remove"></i> Отменить выключение</a>').addClass(server.name).click(function(){abortShutdown(server);}));
                    } else {
                        bootbox.alert("Команда выключения компьютера не выполнена! Может быть компьютер уже выключен?");
                    }
                    ping(server);
                })
                .fail(function(data){
                        bootbox.alert("Ошибка:" + data.status);
                });
}

function abortShutdown(server) {
        $.post("abort-shutdown.php", {ip:server.ip})
                .done(function(data){
                    if(data.response == "success"){
                        bootbox.alert("Команда отмены выключения компьютера успешно выполнена.");
                    } else {
                        bootbox.alert("Команда отмены выключения компьютера не выполнена! Может быть компьютер уже выключен?");
                    }
//                  var repl = $("a.btn.btn-primary.abort-off.require-level-2." + server.name).prop('onclick', null);;
                    var repl = $("a.btn.btn-primary.abort-off.require-level-2." + server.name).off();
                    repl.replaceWith($('<a class="btn btn-primary off require-level-2"><i class="glyphicon glyphicon-off"></i> Выключить</a>').addClass(server.name).click(function(){shutdown(server);}));
                    ping(server);
                })
                .fail(function(data){
                        bootbox.alert("Ошибка:" + data.status);
                });
}

function showLogin(nocheck = false){
        if(nocheck){
                alert ("Не введены или не верные данные авторизации!");
                $("#login-modal").modal({backdrop: 'static', keyboard: false});
                return;
        }
        $.post("login.php", {a: "status"})
                .done(function(data){
                        if (data.response == null){

                                $("#login-modal").modal({backdrop: 'static', keyboard: false});
                                }
                        else {
                                level = data.response.level;
                                if (level == 1) leveltext="пользователь";
                                if (level == 2) leveltext="продвинутый";
                                if (level == 3) leveltext="админ";
                                usernameDisplay.html("Вы вошли как: "+ "<strong>" + data.response.username + "</strong> | Уровень доступа: "+ "<strong>" + leveltext);
                                $('.require-level-2').css({display:(level >= 2)});
                                $('.require-level-1').css({display:(level >= 1)});
                                $('.require-level-3').css({display:(level >= 3)});
                                if(level<3) {addbutton.hide()} else {addbutton.show()};
                                getServers();
                        }
                });
}

window.onload = function(){
        //level = data.response.level;
        //11.06.2020 login focus fix on load and enter key action bind
        var input_pass = document.getElementById("password");
        var input_login = document.getElementById("username");

        $('#login-modal').on('shown.bs.modal', function() {
            input_login.focus();
        })

        input_login.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            //document.getElementById("enter").shake(4,6,700,'#CC2222');
            // Trigger the button element with a click
            input_pass.focus();
        }
        });

        input_pass.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click

            document.getElementById("enter").click();
        }
        });
        addbutton = $('body > div.container > div.btn-group.pull-right > button.btn.btn-success.require-level-3');
        //if (level<=1) addbutton.hide();
        level = 0;
        serverName = $("#name");
        mac = $("#mac");
        ip = $("#ip");
        username = $("#username");
        broadcast = $("#broadcast");
        usernameDisplay = $('#username-display');
        password = $('#password');
        showLogin();
