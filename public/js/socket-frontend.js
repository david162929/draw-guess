const socket = io();
socket.on("connect", () => {
    console.log("connected.");
});

socket.on("online",(num) => {
    document.getElementById("onlineCount").innerHTML = num;
});
