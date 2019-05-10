/* global cst appendRoomList */
document.getElementById("play-button").addEventListener("mouseenter", () => {
    // event.preventDefault();
    const playerId = document.getElementById("playerId").value;
    const roomId = document.getElementById("roomId").value;
    document.cookie = `playerId=${playerId}`;
    document.cookie = `roomId=${roomId}`;
});

// 取得 rooms 資料
fetch(`${cst.host}/api/1.0/rooms-detail`, {
    headers: {"Content-Type": "application/json"},
    method: "get"
}).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.text();
}).then((res) => {
    let rooms = JSON.parse(res);
    delete rooms.room_1;
    rooms = Object.values(rooms);
    for (let i=0; i<rooms.length; i++) {
        console.log(rooms[i].roomId, rooms[i].clients.length);
        appendRoomList("room-list", i, rooms[i].roomId, rooms[i].clients.length);
    }
}).catch((e) => {
    console.log(e);
});
