'use strict';

var serverSocket, mainPlayer;
var onOtherPlayerConnectedCallback;
var onOtherPlayerMove;
var onUpdatePlayerListCallback;
var onReceiveChatMessageCallback;

var networkManager = {
    connected: false,
    connect: function (player) {
        mainPlayer = player;
        serverSocket = io.connect();
        // connect to node server
        serverSocket.on('connect', onConnectedToServer);

        this.configureIncomingTraffic();

    },
    configureIncomingTraffic: function(){
        serverSocket.on('SERVER_PLAYER_ID', onReceivePlayerId);

        serverSocket.on('SERVER_PLAYER_CONNECTED', onPlayerConnected);
        serverSocket.on('SERVER_PLAYER_LIST', onReceivePlayerList);
        serverSocket.on('SERVER_OTHER_PLAYER_MOVED', onOtherPlayerMoved);
        //i have this function loaded on this file but not other files
        //serverSocket.on('SERVER_OTHER_PLAYER_SHOT', onOtherPlayerShot);
        serverSocket.on('SERVER_PLAYER_CHAT_MESSAGE', onReceiveChatMessage);
    },
    onOtherPlayerConnected: function(callback){
        onOtherPlayerConnectedCallback = callback;
    },
    onOtherPlayerMove: function(callback){
        onOtherPlayerMove = callback;
    },
    onOtherPlayerShot: function(callback){
        onOtherPlayerShot = callback;
    },
    notifyMovement: function(movementInfo){
        serverSocket.emit('CLIENT_NOTIFY_PLAYER_MOVEMENT', movementInfo);
    },
//     notifyShot: function(movementInfo){
//         serverSocket.emit('CLIENT_NOTIFY_PLAYER_SHOT, movementInfo);
//     },
    onUpdatePlayerList: function(callback){
        onUpdatePlayerListCallback = callback;
    },
    setOnReceiveChatMessage: function(callback){
        onReceiveChatMessageCallback = callback;
    },
    sendChatMessage: function(textMessage){
        serverSocket.emit('CLIENT_CHAT_MESSAGE', {
            uid: mainPlayer.uid,
            nickname: mainPlayer.nickname,
            text: textMessage
        });

    }
};

function onConnectedToServer() {
    networkManager.connected = true;
    serverSocket.emit('CLIENT_REQUEST_ID', mainPlayer.getInfo());
    serverSocket.emit('CLIENT_REQUEST_PLAYER_LIST');
}

function onReceivePlayerId(mainPlayerID) {
    mainPlayer.uid = mainPlayerID;
    console.log("mon id", mainPlayerID)
}

function onPlayerConnected(otherPlayer){
    console.log('a player is connected', otherPlayer);
    onOtherPlayerConnectedCallback(otherPlayer);
}
// player moved
function onOtherPlayerMoved(movementInfo){
    onOtherPlayerMove(movementInfo);
}

function onReceivePlayerList(listPlayers){
    onUpdatePlayerListCallback(listPlayers);
}

function onReceiveChatMessage(messageInfo){
    onReceiveChatMessageCallback(messageInfo);
}

module.exports = networkManager;