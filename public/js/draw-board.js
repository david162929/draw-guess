
let cvs, ctx;

cvs = document.getElementById("cvs");         //抓 CanvasElement
ctx = cvs.getContext("2d");                   //抓 canvas 的 2d 繪圖(Context 物件)

/* ----- 繪畫動作 ----- */
let posX, posY, lastPosX = "init", lastPosY = "init";
let clickStatus = 0;

//畫布事件
cvs.addEventListener("mousedown", () => {
    if (gameStatus !== "freeze") {
        changePosition();

        if (lastPosX === "init") {
            lastPosX = posX;
            lastPosY = posY;
        }
        //畫點
        ctx.beginPath();
        ctx.arc(posX, posY, 1.2, 0, 2*Math.PI);
        ctx.fill();
        draw.emit("down-draw", roomId, posX, posY);
    }
      
});

cvs.addEventListener("mousemove", () => {
    if (gameStatus !== "freeze") {
        changePosition();
        if (clickStatus === 1) {
            //開畫
            ctx.lineWidth = 2;			//改粗細
            ctx.beginPath();
            ctx.moveTo(lastPosX, lastPosY);
            ctx.lineTo(posX, posY);
            ctx.closePath();
            ctx.stroke();
            draw.emit("move-draw", roomId, posX, posY, lastPosX, lastPosY);            
        }        
    
        lastPosX = posX;
        lastPosY = posY;
    }
});

cvs.addEventListener("mouseleave", () => {
    if (gameStatus !== "freeze") {
        if (clickStatus === 1) {
            changePosition();
    
            //開畫
            ctx.lineWidth = 2;			//改粗細
            ctx.beginPath();
            ctx.moveTo(lastPosX, lastPosY);
            ctx.lineTo(posX, posY);
            ctx.closePath();
            ctx.stroke();
            draw.emit("leave-draw", roomId, posX, posY, lastPosX, lastPosY);
        }
    
        //重置
        lastPosX = "init";
        lastPosY = "init";
    }
});

cvs.addEventListener("mouseenter", () => {
    if (gameStatus !== "freeze") {
        if (clickStatus === 1) {
            changePosition();
    
            //開畫
            ctx.lineWidth = 2;			//改粗細
            ctx.beginPath();
            ctx.moveTo(lastPosX, lastPosY);
            ctx.lineTo(posX, posY);
            ctx.closePath();
            ctx.stroke();
            draw.emit("enter-draw", roomId, posX, posY, lastPosX, lastPosY);
        }
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
    const e = event || window.event;
    lastPosX = e.pageX - cvs.getBoundingClientRect().x - window.pageXOffset || e.clientX - cvs.getBoundingClientRect().x;
    lastPosY = e.pageY - cvs.getBoundingClientRect().y - window.pageYOffset || e.clientY - cvs.getBoundingClientRect().y;
}, false);

function changePosition() {
    const e = event || window.event;
    posX = e.pageX - cvs.getBoundingClientRect().x - window.pageXOffset || e.clientX - cvs.getBoundingClientRect().x;
    posY = e.pageY - cvs.getBoundingClientRect().y - window.pageYOffset || e.clientY - cvs.getBoundingClientRect().y;
}

/* ----- DataURL 提供與接收 ----- */
draw.on("reqDataURL", () => {
    let dataURL = cvs.toDataURL("image/png");
    draw.emit("resDataURL", roomId, dataURL);
}); 

draw.on("resDataURL", (rDataURL) => {
    const img = new Image();
    img.src = rDataURL;
    img.onload = () => {
        ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
    };
});

/* ----- 接收同步的繪畫動作 ----- */
draw.on("down-draw", (rposX, rposY) => {
    //畫點
    ctx.beginPath();
    ctx.arc(rposX, rposY, 1.2, 0, 2*Math.PI);
    ctx.fill();
});

draw.on("move-draw", (rposX, rposY, rlastPosX, rlastPosY) => {
    ctx.lineWidth = 2;			//改粗細
    ctx.beginPath();
    ctx.moveTo(rlastPosX, rlastPosY);
    ctx.lineTo(rposX, rposY);
    ctx.closePath();
    ctx.stroke();
});

draw.on("leave-draw", (rposX, rposY, rlastPosX, rlastPosY) => {
    ctx.lineWidth = 2;			//改粗細
    ctx.beginPath();
    ctx.moveTo(rlastPosX, rlastPosY);
    ctx.lineTo(rposX, rposY);
    ctx.closePath();
    ctx.stroke();
});

draw.on("enter-draw", (rposX, rposY, rlastPosX, rlastPosY) => {
    ctx.lineWidth = 2;			//改粗細
    ctx.beginPath();
    ctx.moveTo(rlastPosX, rlastPosY);
    ctx.lineTo(rposX, rposY);
    ctx.closePath();
    ctx.stroke();
});

/* ----- 清空畫布 ----- */
draw.on("clearBoard", () => {
    ctx.clearRect(0, 0, cvs.width, cvs.height);         //清空畫面
});
