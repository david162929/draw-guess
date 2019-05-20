/* eslint-disable no-unused-vars */

/* const cst = {
    host: "http://localhost:4000"
}; */

const cst = {
    host: "https://davidadm.com"
};


/* ----- index 頁面 ----- */
// append room list
/**
 * 依照房間現況顯示即時的資訊列表
 * @param {string} tagId 被掛上房間列表的父元素
 * @param {number} id 給每個房間元素一個特定的 id
 * @param {*} roomId 房名
 * @param {*} num 在房人數
 */
function appendRoomList(tagId, id, roomId, num) {
    const div = document.createElement("div");
    div.id = "item" + id;
    div.className = "room-list-item list-group-item";
    const divRoomId = document.createElement("div");
    divRoomId.className = "roomId";
    const divPlayerNum = document.createElement("div");
    divPlayerNum.className = "client-num";
    const iIcon = document.createElement("i");
    iIcon.className = "fas fa-user-friends";
    const roomIdText = document.createTextNode(roomId);
    const playNumText = document.createTextNode(" " + num + " / " + "∞");

    divRoomId.appendChild(roomIdText);
    divPlayerNum.appendChild(iIcon);
    divPlayerNum.appendChild(playNumText);

    div.appendChild(divRoomId);
    div.appendChild(divPlayerNum);

    document.getElementById(tagId).appendChild(div);

    div.addEventListener("click", () => {
        console.log(id, roomIdText, `${cst.host}/test-board`);
        const playerId = document.getElementById("playerId").value;
        document.cookie = `playerId=${playerId}`;
        document.cookie = `roomId=${roomId}`;
        window.location.href = `${cst.host}/test-board`;
    });
}

/* ----- Game-room 頁面 ----- */
