// クライアントからサーバーへの接続要求
const socket = io.connect();

// 接続時の処理
// ・サーバーとクライアントの接続が確立すると、
// 　サーバー側で、'connection'イベント
// 　クライアント側で、'connect'イベントが発生する
socket.on(
    'connect',
    () => {
        console.log('connect');
    });

// 「Join」ボタンを押したときの処理
$('#join-form').submit(
    () => {
        console.log('#input_nickname :', $('#input_nickname').val());

        if ($('#input_nickname').val()) {
            // サーバーに、イベント名'join' で入力テキストを送信
            socket.emit('join', $('#input_nickname').val());
            // ユーザ登録
            socket.emit('User Reg', $('#input_nickname').val());

            $('#nickname').html($('#input_nickname').val());
            $('#join-screen').hide();
            $('#chat-screen').show();
        }

        return false;   // フォーム送信はしない
    });


// 「Send」ボタンを押したときの処理
$('form').submit(
    () => {
        console.log('#input_message :', $('#input_message').val());

        if ($('#input_message').val()) {
            // サーバーに、イベント名'new message' で入力テキストを送信
            socket.emit('new message', $('#input_message').val());

            $('#input_message').val('');    // テキストボックスを空に。
        }
        return false;   // フォーム送信はしない
    });

// 「Send」ボタンを押したときの処理(id検索)
$('#user-search-form').submit(
    () => {
        console.log('#input_id :', $('#input_id').val());

        if ($('#input_id').val()) {
            socket.emit('get name', $('#input_id').val());

            $('#input_id').val('');    // テキストボックスを空に。
        }
        return false;   // フォーム送信はしない
    });

// サーバーからのメッセージ拡散に対する処理
// ・サーバー側のメッセージ拡散時の「io.emit( 'spread message', strMessage );」に対する処理
socket.on(
    'spread message',
    //( strMessage ) =>
    (objMessage) => {
        //console.log( 'spread message :', strMessage );
        console.log('spread message :', objMessage);

        // メッセージの整形
        //const strText = objMessage.strDate + ' - ' + objMessage.strMessage;
        const strText = objMessage.strDate + ' - [' + objMessage.strNickname + '] ' + objMessage.strMessage;

        // 拡散されたメッセージをメッセージリストに追加
        //const li_element = $( '<li>' ).text( strMessage );
        const li_element = $('<li>').text(strText);
        $('#message_list').prepend(li_element); // リストの一番上に追加
        //$( '#message_list' ).append( li_element );    // リストの一番下に追加
    });
