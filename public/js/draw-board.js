
let cvs, ctx;
window.onload = () => {
    cvs = document.getElementById("cvs");         //抓 CanvasElement
    ctx = cvs.getContext("2d");                   //抓 canvas 的 2d 繪圖(Context 物件)
    
    let posX, posY, lastPosX = "init", lastPosY = "init";
    let clickStatus = 0;

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
    });

    cvs.addEventListener("mousemove", (event) => {
        changePosition();
        if (clickStatus === 1) {
            //開畫
            ctx.lineWidth = 2;			//改粗細
            ctx.beginPath();
            ctx.moveTo(lastPosX, lastPosY);
            ctx.lineTo(posX, posY);
            ctx.closePath();
            ctx.stroke();
        }
        lastPosX = posX;
        lastPosY = posY;
    });
    cvs.addEventListener("mouseleave", (event) => {
        if (clickStatus === 1) {
            changePosition();
    
            //開畫
            ctx.lineWidth = 2;			//改粗細
            ctx.beginPath();
            ctx.moveTo(lastPosX, lastPosY);
            ctx.lineTo(posX, posY);
            ctx.closePath();
            ctx.stroke();
        }

        //重置
        lastPosX = "init";
        lastPosY = "init";
    });

    cvs.addEventListener("mouseenter", (event) => {
        if (clickStatus === 1) {
            changePosition();
    
            //開畫
            ctx.lineWidth = 2;			//改粗細
            ctx.beginPath();
            ctx.moveTo(lastPosX, lastPosY);
            ctx.lineTo(posX, posY);
            ctx.closePath();
            ctx.stroke();
        }
    });

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

    socket.on("reqImgData", () => {
        console.log("1");
        let imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        const pixel = [];
        console.log(imgData.data.length);
        for(let i = 0; i < imgData.data.length; i++) {
            pixel.push(imgData.data[i]);
        }
        const data = {
            width: imgData.width,
            height: imgData.height,
            pixel : pixel
        }

        socket.emit("resImgData", data);
    });
    socket.on("resImgData", (data) => {
        console.log("3");
        pixel = data.pixel;
   
        const imgData = ctx.createImageData(data.width, data.height);
        for(let i = 0; i < imgData.data.length; i++) {
            imgData.data[i] = pixel[i];
        }

        ctx.putImageData(imgData, 0, 0);
    });
}