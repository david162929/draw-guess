const socket = io();
const draw = io.connect("/draw");

let roomId = "room_1";
let lastRoomId = "room_1";
let userName = "guest";
let gameStatus = "wait";
let roomOwner;

socket.on("connect", () => {
    console.log("connected.");
});
socket.on("disconnect", () => {
    console.log("disconnected.");
});

socket.on("online",(num) => {
    document.getElementById("onlineCount").innerHTML = num;
    
    //後進者要求當前畫布內容
    if (document.getElementById("onlineCount").innerHTML > 1) {
        console.log("fresh");
        draw.emit("reqDataURL");
    }
});

draw.on("connect", () => {
    console.log(draw.id);
    console.log("draw connected.");
});


draw.on("join-succeed", (roomUserNum) => {
    document.getElementById("onlineCount-room").innerHTML = roomUserNum;
});

draw.on("send-chat-message", (userName, msg) => {
    appendMessage("chat-content", userName, msg);
});

draw.on("leave-succeed", (roomUserNum) => {
    document.getElementById("onlineCount-room").innerHTML = roomUserNum;
});

draw.on("room-owner-status", (roomOwnerResult) => {
    //設定是否為創房者的狀態
    roomOwner = roomOwnerResult;
    console.log("roomOwner = " + roomOwner);
    if (roomOwner === true) {
        const button = document.createElement("button");
        button.id = "game-start-button";
        const buttonText = document.createTextNode("遊戲開始");
        button.appendChild(buttonText);
        document.getElementById("game-start").appendChild(button);

        //add event to start
        const startButton = document.getElementById("game-start-button");
        startButton.addEventListener("click", () => {
            gameStatus = "start";
            startButton.style = "display: none;";
            draw.emit("game-start", roomId, userName);
        });
    }
});

draw.on("toGetUpdateDataURL", () => {
    //後進者要求當前畫布內容
    if (true) {
        console.log("fresh");
        draw.emit("reqDataURL", roomId);
    }
});

draw.on("freeze", () => {
    gameStatus = "freeze";
});

draw.on("game-run", (topic) => {
    gameStatus = "draw";

    //view topic when draw
    const h3 = document.createElement("h3");
    const text = document.createTextNode("題目: ");
    h3.appendChild(text);
    const span = document.createElement("span");
    const topicText = document.createTextNode(topic);
    span.appendChild(topicText);
    h3.appendChild(span); 
    document.getElementById("topic").appendChild(h3);
});

draw.on("next-turn", () => {
    console.log("next-turn");
    const topic = document.getElementById("topic");
    if (topic.childNodes[0]) {      //存在才移除
        topic.removeChild(topic.childNodes[0]);
    }
});

draw.on("your-turn", () => {
    console.log("your-turn");
    draw.emit("new-round", roomId, userName);
});

draw.on("updateCurrentUser", (usr) => {
    document.getElementById("userCurrentTurn").innerHTML = usr;
});

draw.on("send-gameStatus", (gStatus) => {
    gameStatus = gStatus;
    if (gameStatus === "start") {
        draw.emit("join-after-game-start");
    }
});