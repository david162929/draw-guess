//for draw-board
function drawSocket (io, rooms, topic, GameDetail, clients, ClientDetail) {
    const draw = io.of("/draw");
    draw.on("connection", (socket) => {
        console.log("draw connected.");

        socket.join("room_1", () => {
            console.log(socket.rooms, socket.id);

            rooms["room_1"].clients.push(socket.id);		//寫入使用者id
            clients[socket.id] = new ClientDetail(socket.id, "room_1");     //寫入房間資訊
            console.log(clients);
            console.log(rooms);
            //socket.to("room_1").emit('join-succeed', "1成功加入房間 room_1");		//除了自己以外全部都送
            draw.in('room_1').emit('join-succeed', rooms["room_1"].clients.length);			//包含自己也送
        });
        
        socket.on("reqDataURL", (roomId) => {
            socket.to(roomId).emit("reqDataURL");
        });
        
        socket.on("resDataURL", (roomId, dataURL) => {
            socket.to(roomId).emit("resDataURL", dataURL);
        });
        
        socket.on("down-draw", (roomId, posX, posY) => {
            socket.to(roomId).emit("down-draw", posX, posY);
        });
        
        socket.on("move-draw", (roomId, posX, posY, lastPosX, lastPosY) => {
            socket.to(roomId).emit("move-draw", posX, posY, lastPosX, lastPosY);
        });
        
        socket.on("leave-draw", (roomId, posX, posY, lastPosX, lastPosY) => {
            socket.to(roomId).emit("leave-draw", posX, posY, lastPosX, lastPosY);
        });
        
        socket.on("enter-draw", (roomId, posX, posY, lastPosX, lastPosY) => {
            socket.to(roomId).emit("enter-draw", posX, posY, lastPosX, lastPosY);
        });	

        //join room
        socket.on("join-room", (lastRoomId, roomId) => {
            socket.leave(lastRoomId, () => {
                console.log("離開成功 上一個 room: " + lastRoomId + "加入的 room: " + roomId);
                clients[socket.id].room = "";     //清空房間資訊
                console.log(clients);
                socket.emit("clearBoard");

                
                //remove user id in last room
                if (rooms[lastRoomId].clients.length === 1 && lastRoomId !== "room_1") {
                    delete rooms[lastRoomId];       //如果是最後一位離開房間，就連同房間一起刪除
                }
                else {
                    let clientIndex = findClient(socket.id, rooms[lastRoomId]);
                    rooms[lastRoomId].clients.splice(clientIndex, 1);           //刪除搜到的那項
                    socket.to(lastRoomId).emit("leave-succeed", rooms[lastRoomId].clients.length);
                }


                socket.join(roomId, () => {
                    console.log("加入成功：" + Object.keys(socket.rooms));
                    clients[socket.id].room = roomId;     //寫入房間資訊
                    console.log(clients);
                    
                    //check rooms
                    let roomOwner = false;
                    if (rooms[roomId]) {
                        console.log("room 存在");
                    }
                    else {
                        rooms[roomId] = {				//寫入房間
                            roomId: roomId,
                            clients: [],
                            gameDetail: new GameDetail()
                        };
                        roomOwner = true;
                    }

                    rooms[roomId].clients.push(socket.id);		//寫入使用者id

                    draw.to(socket.id).emit("room-owner-status", roomOwner);
                    draw.in(roomId).emit("join-succeed", rooms[roomId].clients.length);
                    socket.emit("toGetUpdateDataURL");				//等於 draw.to(socket.id).emit
                    socket.emit("send-gameStatus", rooms[roomId].gameDetail.gameStatus);
                    console.log(rooms);
                });
            });
        });

        //send message
        socket.on("send-chat-message", (roomId, userName, msg) => {
            draw.in(roomId).emit("send-chat-message", userName, msg);
        });

        //game start
        socket.on("game-start", (roomId, userName) => {
            rooms[roomId].gameDetail.gameStatus = "start";

            socket.to(roomId).emit("freeze");		//其他玩家凍結
            socket.emit("game-run", topic[0]);		//當前玩家開始
            draw.in(roomId).emit("clearBoard");		//所有玩家清空畫面
            draw.in(roomId).emit("updateCurrentUser", userName);
        });

        //answer message
        socket.on("send-answer-message", (roomId, userName, msg) => {
            let itemNum = rooms[roomId].gameDetail.orderNum % topic.length;         //計算當前題目是題目組的第幾個
            if (msg === topic[itemNum]) {
                let alreadyCorrect = false;
                //檢查是否重複
                for (let x=0; x<rooms[roomId].gameDetail.correctClients.length; x++) {
                    if (rooms[roomId].gameDetail.correctClients[x] === socket.id) {
                        alreadyCorrect = true;
                    }
                }
                if (alreadyCorrect === true) {
                    socket.emit("send-chat-message", userName, "你已經猜對了。");
                }
                else {
                    rooms[roomId].gameDetail.correctClients.push(socket.id);
                    socket.to(roomId).emit("send-chat-message", userName, "猜對了！");
                    socket.emit("send-chat-message", userName, "猜對了！答案是： " + topic[itemNum]);
                    rooms[roomId].gameDetail.correct += 1;
                    if (rooms[roomId].gameDetail.correct === rooms[roomId].clients.length-1) {
                        console.log("rooms["+roomId+"].gameDetail.correct："+rooms[roomId].gameDetail.correct, "rooms["+roomId+"].clients.length-1："+(rooms[roomId].clients.length-1));
                        draw.in(roomId).emit("next-turn");
                        
                        //輪下一位
                        rooms[roomId].gameDetail.orderNum += 1;
                        let userNum = rooms[roomId].gameDetail.orderNum % rooms[roomId].clients.length;
                        let socketId = rooms[roomId].clients[userNum];
                        draw.to(socketId).emit("your-turn");
                    }
                }
            }
            else {
                draw.in(roomId).emit("send-chat-message", userName, msg);
            }
        });

        //next turn
        socket.on("new-round", (roomId, userName) => {
            //重置
            rooms[roomId].gameDetail.correctClients = [];
            rooms[roomId].gameDetail.correct = 0;

            //計算當前 topic
            let itemNum = rooms[roomId].gameDetail.orderNum % topic.length;
            socket.to(roomId).emit("freeze");		//其他玩家凍結
            socket.emit("game-run", topic[itemNum]);		//當前玩家開始
            draw.in(roomId).emit("clearBoard");		//所有玩家清空畫面
            draw.in(roomId).emit("updateCurrentUser", userName);
        });

       //中途加入遊戲
        socket.on("join-after-game-start", () => {
            socket.emit("clearBoard");		//該玩家清空畫面
            socket.emit("freeze");			//該玩家凍結
            //socket.emit("updateCurrentUser");
        });
        

        socket.on("disconnect", () => {
            //console.log(Object.keys(socket));
            let disconRoom = clients[socket.id].room;
            console.log("draw disconnected: room: " + disconRoom + " socket.id: " + socket.id);

            if (rooms[disconRoom].clients.length === 1 && disconRoom !== "room_1") {
                delete rooms[disconRoom];               //如果是最後一位離開房間，就連同房間一起刪除
                delete clients[socket.id];              //刪除 clients 中的使用者
            }
            else {
                let clientIndex = findClient(socket.id, rooms[disconRoom]);
                rooms[disconRoom].clients.splice(clientIndex, 1);       //刪除搜到的那項
                delete clients[socket.id];              //刪除 clients 中的使用者
                socket.to(disconRoom).emit("leave-succeed", rooms[disconRoom].clients.length);
            }
            console.log(clients);
            console.log(rooms);
        });
    });
}


function findClient (targetClientId, targetRoomObj) {
    for (let j=0; j<targetRoomObj.clients.length; j++) {			//搜索整個 clients
        if (targetRoomObj.clients[j] === targetClientId) {
            return j;
        }
        else if (j === targetRoomObj.clients.length-1) {            //最後一項也沒找到就return false
            return false;
        }			
    }
}




module.exports = drawSocket;
