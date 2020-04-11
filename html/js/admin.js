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
//                      var addbutton = $('body > div.container > div.btn-group.pull-right > button.btn.btn-success.require-level-2');
                        col.append('<a class="btn btn-primary"><i class="glyphicon glyphicon-off"></i> Разбудить</a>').children().click(function(){wake(thisServer);});
                        col.append($('<a class="btn btn-default"><i class="glyphicon glyphicon-refresh"></i> Обновить</a>').click(function(){ping(thisServer);}));

                        if(level > 1){

                                var btngrp = $('<div class="btn-group"><a class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></a><ul class="dropdown-menu" role="menu"></ul></div>');
        var addbutton = $('body > div.container > div.btn-group.pull-right > button.btn.btn-success.require-level-2');

                                btngrp.children("ul").append($('<li><a><i class="glyphicon glyphicon-pencil"></i> Редактировать</a></li>').click(function(){edit(thisServer);}));
                                btngrp.children("ul").append($('<li><a><i class="glyphicon glyphicon-trash"></i> Удалить</a></li>').click(function(){remove(thisServer);}));

                                col.append(btngrp);
                        } /*else {
;                           addbutton.hide();
*/                      }

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
                        ping(server);
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
                        }
                        if(data.response == "dead"){
                                server.statusField.html("Отключен");
                                server.statusField.css({color:"red"});
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
                                usernameDisplay.html("Вы вошли как: "+ "<strong>" + data.response.username + "</strong>");
                                level = data.response.level;
                                $('.require-level-2').css({display:(level >= 2)});
                                $('.require-level-1').css({display:(level >= 1)});
                                $('.require-level-3').css({display:(level >= 3)});
                                if(level<=1) {addbutton.hide()} else {addbutton.show()};
                                getServers();
                        }
                });
}

window.onload = function(){
        //level = data.response.level;
        addbutton = $('body > div.container > div.btn-group.pull-right > button.btn.btn-success.require-level-2');
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
}
