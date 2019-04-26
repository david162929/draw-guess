//for draw-board
function drawSocket (io, rooms, topic, GameDetail) {
    const draw = io.of("/draw");
    draw.on("connection", (socket) => {
        console.log("draw connected.");

        socket.join("room_1", () => {
            console.log(socket.rooms, socket.id);
            let roomTmp = socket.rooms.room_1;
            rooms[0].clients.push(socket.id);		//寫入使用者id
            console.log(rooms);
            //socket.to("room_1").emit('join-succeed', "1成功加入房間 room_1");		//除了自己以外全部都送
            draw.in('room_1').emit('join-succeed', rooms[0].clients.length);			//包含自己也送
            
            socket.on("disconnect", () => {
                console.log("draw disconnected: room: " + roomTmp + " socket.id: " + socket.id);


                findRoom("room_1", rooms, (roomObj) => {
                    let num = findClient(socket.id, roomObj);
                    roomObj.clients.splice(num, 1);
                });
                // for (let i=0; i<rooms.length; i++) {		//搜索整個 rooms
                //     if (rooms[i].roomId === roomTmp) {
                //         for (let j=0; j<rooms[i].clients.length; j++) {			//搜索整個 cliens
                //             if (rooms[i].clients[j] === socket.id) {
                //                 rooms[i].clients.splice(j, 1);			//刪除搜到的那項
                //             }					
                //         }
                //     }
                // }
                socket.to("room_1").emit("leave-succeed", rooms[0].clients.length);
                console.log(rooms);
            });
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
                console.log("離開成功");
                socket.emit("clearBoard");

                //remove user id in last room
                for (let i=0; i<rooms.length; i++) {		//搜索整個 rooms
                    if (rooms[i].roomId === lastRoomId) {
                        if (rooms[i].clients.length === 1 && rooms[i].roomId !== "room_1") {
                            rooms.splice(i, 1);			//如果是最後一位離開房間，就連同房間一起刪除
                        }
                        else {
                            for (let j=0; j<rooms[i].clients.length; j++) {			//搜索整個 cliens
                                if (rooms[i].clients[j] === socket.id) {
                                    rooms[i].clients.splice(j, 1);			//刪除搜到的那項
                                    socket.to(lastRoomId).emit("leave-succeed", rooms[i].clients.length);
                                }					
                            }
                        }
                    }
                }

                socket.join(roomId, () => {
                    console.log("加入成功：" + Object.keys(socket.rooms));
                    
                    //check rooms
                    let findout = -1;
                    let roomOwner = 0;
                    for (let x=0; x<rooms.length; x++) {
                        if (rooms[x].roomId === roomId) {
                            findout = x;
                        }
                    }
                    if (findout === -1) {
                        rooms.push({				//寫入房間
                            roomId: roomId,
                            clients: [],
                            gameDetail: new GameDetail()
                        });
                        findout = rooms.length-1;
                        roomOwner = 1;
                    }

                    rooms[findout].clients.push(socket.id);		//寫入使用者id

                    draw.to(socket.id).emit("room-owner-status", roomOwner);
                    draw.in(roomId).emit("join-succeed", rooms[findout].clients.length);
                    socket.emit("toGetUpdateDataURL");				//等於 draw.to(socket.id).emit
                    socket.emit("send-gameStatus", rooms[findout].gameDetail.gameStatus);
                    console.log(rooms);

                    socket.on("disconnect", () => {
                        console.log("draw disconnected.");
                        console.log(roomId, socket.id);
                        for (let i=0; i<rooms.length; i++) {		//搜索整個 rooms
                            if (rooms[i].roomId === roomId) {
                                if (rooms[i].clients.length === 1) {
                                    rooms.splice(i, 1);			//如果是最後一位離開房間，就連同房間一起刪除
                                }
                                else {
                                    for (let j=0; j<rooms[i].clients.length; j++) {			//搜索整個 cliens
                                        if (rooms[i].clients[j] === socket.id) {
                                            rooms[i].clients.splice(j, 1);			//刪除搜到的那項
                                            socket.to(roomId).emit("leave-succeed", rooms[i].clients.length);
                                        }					
                                    }
                                }
                            }
                        }
                        console.log(rooms);
                    });
                });
            });
        });

        //send message
        socket.on("send-chat-message", (roomId, userName, msg) => {
            draw.in(roomId).emit("send-chat-message", userName, msg);
        });

        //game start
        socket.on("game-start", (roomId, userName) => {
            for (let i=0; i<rooms.length; i++) {		//搜索整個 rooms
                if (rooms[i].roomId === roomId) {
                    rooms[i].gameDetail.gameStatus = "start";
                }
            }
            socket.to(roomId).emit("freeze");		//其他玩家凍結
            socket.emit("game-run", topic[0]);		//當前玩家開始
            draw.in(roomId).emit("clearBoard");		//所有玩家清空畫面
            draw.in(roomId).emit("updateCurrentUser", userName);
        });

        //answer message
        socket.on("send-answer-message", (roomId, userName, msg) => {
            for (let i=0; i<rooms.length; i++) {		//搜索整個 rooms
                if (rooms[i].roomId === roomId) {
                    let itemNum = rooms[i].gameDetail.orderNum % topic.length;
                    if (msg === topic[itemNum]) {
                        let tmp = 0;
                        //檢查是否重複
                        for (let x=0; x<rooms[i].gameDetail.correctClients.length; x++) {
                            if (rooms[i].gameDetail.correctClients[x] === socket.id) {
                                tmp = 1;
                            }
                        }
                        if (tmp === 1) {
                            socket.emit("send-chat-message", userName, "你已經猜對了。");
                        }
                        else {
                            rooms[i].gameDetail.correctClients.push(socket.id);
                            socket.to(roomId).emit("send-chat-message", userName, "猜對了！");
                            socket.emit("send-chat-message", userName, "猜對了！答案是： " + topic[itemNum]);
                            rooms[i].gameDetail.correct += 1;
                            if (rooms[i].gameDetail.correct === rooms[i].clients.length-1) {
                                console.log("rooms["+i+"].gameDetail.correct："+rooms[i].gameDetail.correct, "rooms["+i+"].clients.length-1："+(rooms[i].clients.length-1));
                                draw.in(roomId).emit("next-turn");
                                
                                //輪下一位
                                rooms[i].gameDetail.orderNum += 1;
                                let userNum = rooms[i].gameDetail.orderNum % rooms[i].clients.length;
                                let socketId = rooms[i].clients[userNum];
                                draw.to(socketId).emit("your-turn");
                            }
                        }
            
                    }
                    else {
                        draw.in(roomId).emit("send-chat-message", userName, msg);
                    }
                }
            }
        });

        //next turn
        socket.on("new-round", (roomId, userName) => {
            //重置
            for (let i=0; i<rooms.length; i++) {		//搜索整個 rooms
                if (rooms[i].roomId === roomId) {
                    rooms[i].gameDetail.correctClients = [];
                    rooms[i].gameDetail.correct = 0;
                    
                    //計算當前 topic
                    let itemNum = rooms[i].gameDetail.orderNum % topic.length;
                    socket.to(roomId).emit("freeze");		//其他玩家凍結
                    socket.emit("game-run", topic[itemNum]);		//當前玩家開始
                    draw.in(roomId).emit("clearBoard");		//所有玩家清空畫面
                    draw.in(roomId).emit("updateCurrentUser", userName);
                }
            }
        });

        //中途加入遊戲
        socket.on("join-after-game-start", () => {
            socket.emit("clearBoard");		//該玩家清空畫面
            socket.emit("freeze");			//該玩家凍結
            //socket.emit("updateCurrentUser");
        });
        
    });
}

function findRoom (targetRoomId, allRoomArray, callback) {
    for (let i=0; i<allRoomArray.length; i++) {		//搜索整個 rooms
        if (allRoomArray[i].roomId === targetRoomId) {
            callback(allRoomArray[i]);
            return i;
        }
    }
}

function findClient (targetClientId, targetRoomObj) {
    for (let j=0; j<targetRoomObj.clients.length; j++) {			//搜索整個 cliens
        if (targetRoomObj.clients[j] === targetClientId) {
            return j;
        }					
    }
}







module.exports = drawSocket;