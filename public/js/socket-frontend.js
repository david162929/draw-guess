const socket = io();
const draw = io.connect("/draw");

let roomId = "room_1";
let lastRoomId = "room_1";
let userName = "";
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
    console.log("freeze");

    //啟動圖像 timer
    document.getElementById("timer").className = "draw-timer-start";

});

draw.on("game-run", (topic) => {
    gameStatus = "draw";
    console.log("runnnnn");

    //view topic when draw
    const h3 = document.createElement("h3");
    const text = document.createTextNode("題目: ");
    h3.appendChild(text);
    const span = document.createElement("span");
    const topicText = document.createTextNode(topic);
    span.appendChild(topicText);
    h3.appendChild(span); 
    document.getElementById("topic").appendChild(h3);

    //啟動圖像 timer
    document.getElementById("timer").className = "draw-timer-start";
});

//偵測到填滿的 transition 跑完，就重置成未填滿的樣子
document.getElementById("timer").addEventListener("transitionend", () => {    
    if (document.getElementById("timer").className === "draw-timer-start") {
        document.getElementById("timer").className = "draw-timer-end";
    }
    else if (document.getElementById("timer").className === "answer-timer-start") {
        document.getElementById("timer").className = "answer-timer-end";
    }
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
    draw.emit("game-start", roomId, userName);
});

draw.on("updateCurrentUser", (usr) => {
    document.getElementById("userCurrentTurn").innerHTML = usr;
});

draw.on("send-gameStatus", (gStatus) => {
    if (gStatus === "start") {
        draw.emit("join-after-game-start");
    }
});

draw.on("send-user-id", (userId) => {
    userName = userId;
    document.getElementById("user-name").innerHTML = userId;
});

draw.on("rankingList-update", (rankingList) => {
    console.log(rankingList);

    let ranking = document.getElementById("ranking-list");
    //remove all child node
    let num = ranking.childNodes.length;        //不能省
    for (let i=0; i<num ;i++) {
        ranking.removeChild(ranking.firstChild);
    }

    //append child
    for (let i=0; i<rankingList.length ;i++) {
        appendList("ranking-list", rankingList[i].userId, rankingList[i].score);
    }
    
});

function appendList (tagId, userId, score) {
    const div = document.createElement("div");
    const spanUserId = document.createElement("span");
    spanUserId.className = "ranking-user-id";
    const spanScore = document.createElement("span");
    spanScore.className = "ranking-score";
    const userIdText = document.createTextNode(userId + ": ");
    const scoreText = document.createTextNode(score);

    spanUserId.appendChild(userIdText);
    spanScore.appendChild(scoreText);
    div.appendChild(spanUserId);
    div.appendChild(spanScore);
    document.getElementById(tagId).appendChild(div);
}

draw.on("wait-next-turn", (gStatus, userName, topic) => {
    //啟動圖像 timer
    document.getElementById("timer").className = "answer-timer-start";
    if (gStatus === "no-one-hit") {
        printAnswer("hehe 都沒猜對", userName, topic);
    }
    else if (gStatus === "all-correct") {
        printAnswer("所有人都猜到了", userName, topic);
    }
    else if (gStatus === "part-correct") {
        printAnswer("公布答案~", userName, topic);
    }
    console.log("wait-next-turn");
});