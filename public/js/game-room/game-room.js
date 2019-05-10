/* global userName:writable draw lastRoomId:writable roomId:writable gameStatus */
// Press Enter to send
const chatForm = document.getElementById("chat-form");
chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (document.getElementById("chat-input").value !== "") {
        sendMessage();
    }
});

// View message
/**
 * 產生聊天室對話內容
 * @param {string} tagId 被掛上對話內容的父元素
 * @param {string} userName 使用者名稱
 * @param {string} msg 對話訊息
 * @param {string} msgClass 訊息要套用的 style class
 */
function appendMessage(tagId, userName, msg, msgClass) {
    const div = document.createElement("div");
    const spanName = document.createElement("span");
    spanName.className = "chat-user";
    const spanMessage = document.createElement("span");
    spanMessage.className = msgClass;
    const userText = document.createTextNode(userName + " : ");
    const msgText = document.createTextNode(msg);

    spanName.appendChild(userText);
    spanMessage.appendChild(msgText);
    div.appendChild(spanName);
    div.appendChild(spanMessage);
    document.getElementById(tagId).appendChild(div);

    // 保持滾動在底部
    const chatContent = document.getElementById("chat-content");
    chatContent.scrollTop = chatContent.scrollHeight;
}

/**
 * 更改使用者名稱
 */
function changeUserName() {
    userName = document.getElementById("user-name-input").value;
    document.getElementById("user-name").innerHTML = userName;
    draw.emit("change-user-id", userName);
}

/**
 * 加入房間
 */
function joinRoom() {
    lastRoomId = roomId;
    roomId = document.getElementById("roomIdNew").value;
    document.getElementById("roomId").innerHTML = roomId;
    console.log(lastRoomId, roomId);
    draw.emit("join-room", lastRoomId, roomId);
}

/**
 * 發送對話訊息
 */
function sendMessage() {
    const msg = document.getElementById("chat-input").value;
    document.getElementById("chat-input").value = "";
    console.log(msg);
    if (gameStatus === "freeze") {
        console.log("freeze");
        draw.emit("send-answer-message", roomId, userName, msg);
    } else {
        console.log("other");
        draw.emit("send-chat-message", roomId, userName, msg);
    }
}

// 使用 cookie 當中的資訊幫使用者做加入房間跟改名
setTimeout(() => {
    userName = document.cookie.replace(/(?:^|.*;\s*)playerId\s*\=\s*([^;]*).*$|^.*$/, "$1");
    document.getElementById("user-name").innerHTML = userName;
    draw.emit("change-user-id", userName);

    roomId = document.cookie.replace(/(?:^|.*;\s*)roomId\s*\=\s*([^;]*).*$|^.*$/, "$1");
    document.getElementById("roomId").innerHTML = roomId;
    draw.emit("join-room", lastRoomId, roomId);
}, 1000);


// 動態 append color set
(function() {
    const color = [
        "#000000",
        "#FFFFFF",
        "#D3D3D3",
        "#808080",
        "#800000",
        "#FF0000",
        "#FF8C00",
        "#FFD700",
        "#00FF00",
        "#228B22",
        "#0000CD",
        "#00BFFF",
        "#FFC0CB",
        "#EE82EE",
        "#8A2BE2",
        "#8B4513",
        "#800080",
        "#8FBC8F"
    ];
    for (let i=0; i<color.length; i++) {
        const div = document.createElement("div");
        div.className = `square color${i}`;
        div.style = `background-color:${color[i]};`;
        document.getElementById("color-set").appendChild(div);
        div.addEventListener("click", () => {
            draw.emit("change-color", color[i]);
            draw.emit("change-line-width", document.getElementById("line-width-bar").value);
        });
    }
})();

// 自訂顏色
/**
 * 依據使用顏色選擇器選擇之顏色進行畫筆 style 更改
 */
function pickColor() {
    draw.emit("change-color", document.getElementById("color-picker").value);
    draw.emit("change-line-width", document.getElementById("line-width-bar").value);
}

// 橡皮擦
document.getElementById("eraser").addEventListener("click", () => {
    draw.emit("change-color", "#ffffff");
    draw.emit("change-line-width", 20);
});

// 清除全部


// 畫筆粗細
document.getElementById("line-width-bar").addEventListener("change", () => {
    draw.emit("change-line-width", document.getElementById("line-width-bar").value);
});
