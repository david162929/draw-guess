const draw = io.connect("/draw");

draw.on("connect", () => {
    console.log(draw.id);
    console.log("draw connected.");
});

draw.on("update-index-room-list", (rooms) => {
    delete rooms.room_1;
    rooms = Object.values(rooms);
    //remove all child node
    let roomList = document.getElementById("room-list");
    while(roomList.firstChild) {
        roomList.removeChild(roomList.firstChild);
    }
    for (let i=0; i<rooms.length ;i++) {
        appendRoomList("room-list", i, rooms[i].roomId, rooms[i].clients.length);
    }
});