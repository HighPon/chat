const socket = io.connect();
//接続時の処理
socket.on(
    'connect',
    () =>
    {
        console.log('connect');
    }
);

//切断時の処理
socket.on(
    'disconnect',
    () =>
    {
        console.log('disconnect');
    }
);

//loginボタンを押した時の処理
$('form').submit(
    () =>
    {
        console.log('#logid:',$('#logid').val());
        console.log('#logpwd:',$('#logpwd').val());

        if($('#logid').val() && $('#logpwd').val()){
            //サーバにユーザネームとパスワードを送信
            socket.emit("login",{
                username:$('#logid').val(),
                password:$('#logpwd').val()
            });
            //テキストボックスを空に
            $('#logid').val('');
            $('#logpwd').val('');
        }
        return false; //フォーム送信はしない
    }
);

//認証成功した時
socket.on("AUTH_OK",
    location.href = "chat_test.html"
);

//認証失敗した時
socket.on("AUTH_NG",
    location.href = "login.html"
);