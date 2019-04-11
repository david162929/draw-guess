
let cvs, ctx;

cvs = document.getElementById("cvs");         //抓 CanvasElement
ctx = cvs.getContext("2d");                   //抓 canvas 的 2d 繪圖(Context 物件)

/* ----- 繪畫動作 ----- */
let posX, posY, lastPosX = "init", lastPosY = "init";
let clickStatus = 0;

//畫布事件
cvs.addEventListener("mousedown", () => {
    changePosition();

    if (lastPosX === "init") {
        lastPosX = posX;
        lastPosY = posY;
    }
    //畫點
    ctx.beginPath();
    ctx.arc(posX, posY, 1.2, 0, 2*Math.PI);
    ctx.fill();
    socket.emit("down-draw", posX, posY);        
});

cvs.addEventListener("mousemove", () => {
    changePosition();
    if (clickStatus === 1) {
        //開畫
        ctx.lineWidth = 2;			//改粗細
        ctx.beginPath();
        ctx.moveTo(lastPosX, lastPosY);
        ctx.lineTo(posX, posY);
        ctx.closePath();
        ctx.stroke();
        socket.emit("move-draw", posX, posY, lastPosX, lastPosY);            
    }        

    lastPosX = posX;
    lastPosY = posY;
});

cvs.addEventListener("mouseleave", () => {
    if (clickStatus === 1) {
        changePosition();

        //開畫
        ctx.lineWidth = 2;			//改粗細
        ctx.beginPath();
        ctx.moveTo(lastPosX, lastPosY);
        ctx.lineTo(posX, posY);
        ctx.closePath();
        ctx.stroke();
        socket.emit("leave-draw", posX, posY, lastPosX, lastPosY);
    }

    //重置
    lastPosX = "init";
    lastPosY = "init";
});

cvs.addEventListener("mouseenter", () => {
    if (clickStatus === 1) {
        changePosition();

        //開畫
        ctx.lineWidth = 2;			//改粗細
        ctx.beginPath();
        ctx.moveTo(lastPosX, lastPosY);
        ctx.lineTo(posX, posY);
        ctx.closePath();
        ctx.stroke();
        socket.emit("enter-draw", posX, posY, lastPosX, lastPosY);
    }
});
//全域事件
document.addEventListener("mouseup", () => {
    clickStatus = 0;
}, true);
document.addEventListener("mousedown", () => {
    clickStatus = 1;
}, true);
document.addEventListener("mousemove", () => {
    e = event || window.event;
    lastPosX = e.pageX - cvs.getBoundingClientRect().x || e.clientX + window.pageXOffset - cvs.getBoundingClientRect().x;
    lastPosY = e.pageY - cvs.getBoundingClientRect().y || e.clientY + window.pageYOffset - cvs.getBoundingClientRect().y;
}, false);

function changePosition() {
    e = event || window.event;
    posX = e.pageX - cvs.getBoundingClientRect().x || e.clientX + window.pageXOffset - cvs.getBoundingClientRect().x;
    posY = e.pageY - cvs.getBoundingClientRect().y || e.clientY + window.pageYOffset - cvs.getBoundingClientRect().y;
}

/* ----- DataURL 提供與接收 ----- */
socket.on("reqDataURL", () => {
    let dataURL = cvs.toDataURL("image/png");
    socket.emit("resDataURL", dataURL);
}); 

socket.on("resDataURL", (rDataURL) => {
    const img = new Image();
    img.src = rDataURL;
    img.onload = () => {
        ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
    };
});


/* ----- 接收同步的繪畫動作 ----- */
socket.on("down-draw", (rposX, rposY) => {
    //畫點
    ctx.beginPath();
    ctx.arc(rposX, rposY, 1.2, 0, 2*Math.PI);
    ctx.fill();
});

socket.on("move-draw", (rposX, rposY, rlastPosX, rlastPosY) => {
    ctx.lineWidth = 2;			//改粗細
    ctx.beginPath();
    ctx.moveTo(rlastPosX, rlastPosY);
    ctx.lineTo(rposX, rposY);
    ctx.closePath();
    ctx.stroke();
});

socket.on("leave-draw", (rposX, rposY, rlastPosX, rlastPosY) => {
    ctx.lineWidth = 2;			//改粗細
    ctx.beginPath();
    ctx.moveTo(rlastPosX, rlastPosY);
    ctx.lineTo(rposX, rposY);
    ctx.closePath();
    ctx.stroke();
});

socket.on("enter-draw", (rposX, rposY, rlastPosX, rlastPosY) => {
    ctx.lineWidth = 2;			//改粗細
    ctx.beginPath();
    ctx.moveTo(rlastPosX, rlastPosY);
    ctx.lineTo(rposX, rposY);
    ctx.closePath();
    ctx.stroke();
});


