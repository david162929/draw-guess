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
    appendMessage("chat-content", userName, msg, "chat-message");
});

draw.on("hit-correct-message", (userName, msg) => {
    appendMessage("chat-content", userName, msg, "correct-message");
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
        const buttonText = document.createTextNode("Game start");
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
    document.getElementById("outer-timer").removeChild(document.getElementById("timer"));
    let newTimer = document.createElement("div");
    newTimer.id = "timer";
    newTimer.className = "draw-timer";
    document.getElementById("outer-timer").appendChild(newTimer);
});

draw.on("game-run", (topic) => {
    gameStatus = "draw";
    console.log("runnnnn");

    //view topic when draw
    const h3 = document.createElement("h3");
    const text = document.createTextNode("Topic : ");
    h3.appendChild(text);
    const span = document.createElement("span");
    const topicText = document.createTextNode(topic);
    span.appendChild(topicText);
    h3.appendChild(span); 
    document.getElementById("topic").appendChild(h3);

    //啟動圖像 timer
    document.getElementById("outer-timer").removeChild(document.getElementById("timer"));
    let newTimer = document.createElement("div");
    newTimer.id = "timer";
    newTimer.className = "draw-timer";
    document.getElementById("outer-timer").appendChild(newTimer);

/*     document.getElementById("timer").className = "draw-timer-start";

    window.requestAnimationFrame(() => {
        document.getElementById("timer").className = "draw-timer-end";
    }); */
    // setTimeout(() => {
    //     document.getElementById("timer").className = "draw-timer-end";
    // }, 10);
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
    const userIdText = document.createTextNode(userId + " : ");
    const scoreText = document.createTextNode(score);

    spanUserId.appendChild(userIdText);
    spanScore.appendChild(scoreText);
    div.appendChild(spanUserId);
    div.appendChild(spanScore);
    document.getElementById(tagId).appendChild(div);
}

draw.on("wait-next-turn", (gStatus, userName, topic) => {
    //啟動圖像 timer
    document.getElementById("outer-timer").removeChild(document.getElementById("timer"));
    let newTimer = document.createElement("div");
    newTimer.id = "timer";
    newTimer.className = "middle-timer";
    document.getElementById("outer-timer").appendChild(newTimer);

    //初始化
    initDrawStyle();

    if (gStatus === "no-one-hit") {
        printAnswer("Nobody hit the answer.", userName, topic);
    }
    else if (gStatus === "all-correct") {
        printAnswer("Everybody hit the answer!", userName, topic);
    }
    else if (gStatus === "part-correct") {
        printAnswer("Time's up!", userName, topic);
    }
    console.log("wait-next-turn");
});

draw.on("provide-timer-process", (id) => {
    const width = document.getElementById("timer").offsetWidth;
    const color = getComputedStyle(document.getElementById("timer")).backgroundColor;
    console.log("provide-timer-process");
    draw.emit("return-timer-process", id, width, color);

    //const style = getComputedStyle(document.getElementById("timer"));
});

draw.on("update-timer-process", (width, color) => {
    console.log("update-timer-process");
    document.getElementById("timer").style = width;
    document.getElementById("timer").style.backgroundColor = color;
});
draw.on("freeze-only", () => {
    gameStatus = "freeze";
    console.log("freeze-only");
});

draw.on("provide-draw-status", (id) => {
    const style = {
        strokeStyle: ctx.strokeStyle,
        fillStyle: ctx.fillStyle,
        lineWidth: ctx.lineWidth
    };
    draw.emit("return-draw-status", id, style);
});
draw.on("update-draw-status", (style) => {
    console.log("update-draw-status");
    console.log(style)
    changeDrawColor(style.strokeStyle);
    changeLineWidth(style.lineWidth);
});