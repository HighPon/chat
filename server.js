'use strict';

// モジュール
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql');

// オブジェクト
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const connection = mysql.createConnection({
    host: 'us-cdbr-east-03.cleardb.com',
    user: 'b8a5270bacec1d',
    password: 'c72d8b38',
    database: 'heroku_959a3c5f9e441b9'
});

// 定数
const PORT = process.env.PORT || 1337;
const SYSTEMNICKNAME = '**system**'

// グローバル変数
let iCountUser = 0; // ユーザー数
let maxId = 0; // DBに登録されているユーザ数
connection.query('SELECT COUNT(*) FROM users', function (error, results, fields) {
    if (error) throw error;
    console.log(results[0]['COUNT(*)']);
    maxId = Number(results[0]['COUNT(*)']);
});

// 接続時の処理
// ・サーバーとクライアントの接続が確立すると、
// 　サーバー側で、'connection'イベント
// 　クライアント側で、'connect'イベントが発生する
io.on(
    'connection',
    (socket) => {
        console.log('connection');

        let strNickname = '';	// コネクションごとで固有のニックネーム。イベントをまたいで使用される。

        // 切断時の処理
        // ・クライアントが切断したら、サーバー側では'disconnect'イベントが発生する
        socket.on(
            'disconnect',
            () => {
                console.log('disconnect');

                if (strNickname) {
                    // ユーザー数の更新
                    iCountUser--;

                    // メッセージオブジェクトに現在時刻を追加
                    const strNow = makeTimeString(new Date());

                    // システムメッセージの作成
                    const objMessage = {
                        strNickname: SYSTEMNICKNAME,
                        strMessage: strNickname + 'さんが退室しました。' + "現在の参加者は" + iCountUser + "人です。",
                        strDate: strNow
                    }

                    // 送信元含む全員に送信
                    io.emit('spread message', objMessage);
                }
            });


        // 入室時の処理
        // ・クライアント側のメッセージ送信時の「socket.emit( 'join', strNickname );」に対する処理
        socket.on(
            'join',
            (strNickname_) => {
                console.log('joined :', strNickname_);

                // コネクションごとで固有のニックネームに設定
                strNickname = strNickname_;

                // ユーザー数の更新
                iCountUser++;

                // メッセージオブジェクトに現在時刻を追加
                const strNow = makeTimeString(new Date());

                // システムメッセージの作成
                const objMessage = {
                    strNickname: SYSTEMNICKNAME,
                    strMessage: strNickname + 'さんが入室しました。' + "現在の参加者は" + iCountUser + "人です。",
                    strDate: strNow
                }

                // 送信元含む全員に送信
                io.emit('spread message', objMessage);
            });



        // 新しいメッセージ受信時の処理
        // ・クライアント側のメッセージ送信時の「socket.emit( 'new message', $( '#input_message' ).val() );」に対する処理
        socket.on(
            'new message',
            (strMessage) => {
                console.log('new message', strMessage);

                // 現在時刻の文字列の作成
                const strNow = makeTimeString(new Date());

                // メッセージオブジェクトの作成
                const objMessage = {
                    strNickname: strNickname,
                    strMessage: strMessage,
                    strDate: strNow
                }

                // 送信元含む全員に送信
                //io.emit( 'spread message', strMessage );
                io.emit('spread message', objMessage);
            });

        /*
        socket.on(
            'User Auth',
            (strMessage) => {
                console.log('user auth:', strMessage);
                connection.query('SELECT name FROM users WHERE id = ?', [Number(strMessage)], function (error, results, fields) {
                    if (error) throw error;
                    console.log('results', results[0]['name']);
                    // const strNow = makeTimeString(new Date());
                    // var objMessage = {
                    //     strNickname: '**system**',
                    //     strMessage: results[0]['name'],
                    //     strDate: strNow
                    // }
                    // io.to(socket.id).emit('spread message', objMessage);
                    // console.log('fields: ', fields);
                    io.to(socket.id).emit('Auth OK', "ok");
                });
            }
        )
        */

        //idから名前を検索
        socket.on(
            'get name',
            (strMessage) => {
                //console.log('user auth:', strMessage);
                if (Number(strMessage) > maxId) {
                    console.log('results', 'not exist');
                    const strNow = makeTimeString(new Date());
                    var objMessage = {
                        strNickname: '**system**',
                        strMessage: "idが" + Number(strMessage) + "のユーザは存在しません",
                        strDate: strNow
                    }
                    io.to(socket.id).emit('spread message', objMessage);
                } else {
                    connection.query('SELECT name FROM users WHERE id = ?', [Number(strMessage)], function (error, results, fields) {
                        if (error) throw error;
                        console.log('results', results[0]['name']);
                        const strNow = makeTimeString(new Date());
                        var objMessage = {
                            strNickname: '**system**',
                            strMessage: "idが" + Number(strMessage) + "のユーザの名前:" + results[0]['name'],
                            strDate: strNow
                        }
                        io.to(socket.id).emit('spread message', objMessage);
                        //console.log('fields: ', fields);
                    });
                }
            }
        )

        //ユーザをDBに登録
        socket.on(
            'User Reg',
            (strMessage) => {
                console.log('user reg:', strMessage);
                const assignId = ++maxId;
                connection.query('INSERT users values(?, ?)', [assignId, strMessage], function (error, results, fields) {
                    if (error) throw error;
                    const strNow = makeTimeString(new Date());
                    var objMessage = {
                        strNickname: '**system**',
                        strMessage: "あなたのid:" + assignId,
                        strDate: strNow
                    }
                    io.to(socket.id).emit('spread message', objMessage);
                    // console.log('fields: ', fields);
                    io.to(socket.id).emit('Reg OK', assignId);
                });
            }
        )

    });

// 公開フォルダの指定
app.use(express.static(__dirname + '/public'));

// サーバーの起動
server.listen(
    PORT,
    () => {
        console.log('Server on port %d', PORT);
    });

// 関数
// 数字を２桁の文字列に変換
const toDoubleDigitString =
    (num) => {
        return ("0" + num).slice(-2);   // slice( -2 )で後ろから２文字取り出す。
    };

// 時刻文字列の作成（書式は「YY/DD/MM hh:mm ss」）
const makeTimeString =
    (time) => {
        return toDoubleDigitString(time.getFullYear()) + '/' + toDoubleDigitString(time.getMonth() + 1) + '/' + toDoubleDigitString(time.getDate())
            + ' ' + toDoubleDigitString(time.getHours()) + ':' + toDoubleDigitString(time.getMinutes()) + ' ' + toDoubleDigitString(time.getSeconds());
    }
