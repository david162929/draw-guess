const socket = io();
const draw = io.connect("/draw");

socket.on("connect", () => {
    console.log("connected.");
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

draw.on("join-succeed", (x) => {
    console.log(x);
});

socket.on("join-succeed", (x) => {
    console.log(x);
});
