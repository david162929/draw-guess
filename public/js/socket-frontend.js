const socket = io();
socket.on("connect", () => {
    console.log("connected.");
});

socket.on("online",(num) => {
    document.getElementById("onlineCount").innerHTML = num;
    
    //後進者要求當前畫布內容
    if (document.getElementById("onlineCount").innerHTML > 1) {
        console.log("fresh");
        socket.emit("reqDataURL");
    }
});

