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
        console.log('#reguname:',$('#reguname').val());
        console.log('#regpwd:',$('#regpwd').val());

        if($('#reguname').val() && $('#regpwd').val()){
            //サーバにユーザネームとパスワードを送信
            socket.emit("register",{
                username:$('#reguname').val(),
                password:$('#regpwd').val()
            });
            //テキストボックスを空に
            $('#reguname').val('');
            $('#regpwd').val('');
        }
        return false; //フォーム送信はしない
    }
);

//認証成功した時
socket.on("REG_OK",
    location.href = "chat_test.html"
);

//認証失敗した時
socket.on("REG_NG",
    location.href = "register.html"
);