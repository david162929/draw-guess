
let cvs, ctx;

cvs = document.getElementById("cvs");         //抓 CanvasElement
ctx = cvs.getContext("2d");                   //抓 canvas 的 2d 繪圖(Context 物件)

/* ----- 繪畫動作 ----- */
//初始化
let posX, posY, lastPosX = "init", lastPosY = "init";
let clickStatus = 0;
ctx.lineWidth = 2;
ctx.lineCap = "round";
ctx.lineJoin = "round";

/* ----- 繪圖工具列 ----- */
function changeDrawColor(rgb) {
    ctx.strokeStyle = rgb;
    ctx.fillStyle = rgb;
}
function changeLineWidth(value) {
    ctx.lineWidth = value;
}


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
            // ctx.lineWidth = 2;			//改粗細
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
            // ctx.lineWidth = 2;			//改粗細
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
            // ctx.lineWidth = 2;			//改粗細
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
    // ctx.lineWidth = 2;			//改粗細
    ctx.beginPath();
    ctx.moveTo(rlastPosX, rlastPosY);
    ctx.lineTo(rposX, rposY);
    ctx.closePath();
    ctx.stroke();
});

draw.on("leave-draw", (rposX, rposY, rlastPosX, rlastPosY) => {
    // ctx.lineWidth = 2;			//改粗細
    ctx.beginPath();
    ctx.moveTo(rlastPosX, rlastPosY);
    ctx.lineTo(rposX, rposY);
    ctx.closePath();
    ctx.stroke();
});

draw.on("enter-draw", (rposX, rposY, rlastPosX, rlastPosY) => {
    // ctx.lineWidth = 2;			//改粗細
    ctx.beginPath();
    ctx.moveTo(rlastPosX, rlastPosY);
    ctx.lineTo(rposX, rposY);
    ctx.closePath();
    ctx.stroke();
});

draw.on("change-color", (color) => {
    changeDrawColor(color);
});

draw.on("change-line-width", (width) => {
    changeLineWidth(width);
});



/* ----- 清空畫布 ----- */
draw.on("clearBoard", () => {
    ctx.clearRect(0, 0, cvs.width, cvs.height);         //清空畫面
});



/* ----- 狀態畫面 ----- */
//printAnswer("自訂訊息", "你好你好耶耶耶一耶耶", "蘋果蘋果蘋果");

function printAnswer (sentence, userId, word) {
    ctx.font = "24px Microsoft JhengHei, Heiti TC";
    ctx.textAlign = "center";

    let userIdTrans = userId;
    //id 太長就縮短
    if (ctx.measureText(userId).width > cvs.width/2 - 20) {
        let num = parseInt(userId.length * cvs.width /2 / ctx.measureText(userId).width / 1.75);        //多除 1.75 做加權，保險避免超出螢幕
        userIdTrans = userId.slice(0, num) + "...";
    }

    statusImg(sentence, userIdTrans, word);
    dotMove(sentence, userIdTrans, word);
    const intervalId = setInterval(() => {
        dotMove(sentence, userIdTrans, word);
    }, 1500);

    setTimeout(() => {
        clearInterval(intervalId);
    }, 4000);
}

function dotMove (sentence, userId, word) {
    setTimeout(() => {
        statusImg(sentence, userId, `${word} .`);
    }, 500);
    setTimeout(() => {
        statusImg(sentence, userId, `${word} ..`);
    }, 1000);
    setTimeout(() => {
        statusImg(sentence, userId, `${word} ...`);
    }, 1500);
}

function statusImg (sentence, userId, word) {
    ctx.clearRect(0, 0, cvs.width, cvs.height);         //清空畫面

    ctx.fillText(sentence, cvs.width/2, cvs.height/2 - 20);
    ctx.fillText(`${userId} 畫的是： ${word}`, cvs.width/2, cvs.height/2 + 10);
}