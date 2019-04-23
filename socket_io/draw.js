//for draw-board
function drawSocket (io, rooms, topic, GameDetail, clients, ClientDetail, RoomDetail, Ranking) {
    const draw = io.of("/draw");
    draw.on("connection", (socket) => {
        console.log("draw connected.");

        //change user id
        socket.on("change-user-id", (userName) => {
            clients[socket.id].userId = userName;
        });

        socket.join("room_1", () => {
            console.log(socket.rooms, socket.id);

            rooms["room_1"].clients.push(socket.id);		//寫入使用者id
            clients[socket.id] = new ClientDetail(socket.id, "room_1");     //寫入房間資訊
            console.log(clients);
            console.log(rooms);
            //socket.to("room_1").emit('join-succeed', "1成功加入房間 room_1");		//除了自己以外全部都送
            draw.in('room_1').emit('join-succeed', rooms["room_1"].clients.length);			//包含自己也送
            socket.emit("send-user-id", clients[socket.id].userId);         //送出別名
        });
        
        socket.on("reqDataURL", (roomId) => {
            socket.to(roomId).emit("reqDataURL");
        });
        
        socket.on("resDataURL", (roomId, dataURL) => {
            socket.to(roomId).emit("resDataURL", dataURL);
        });
        
        socket.on("down-draw", (roomId, posX, posY) => {
            //驗證使用者與狀態
            if (socket.id === rooms[roomId].gameDetail.currentDraw && rooms[roomId].gameDetail.gameStatus === "start") {
                socket.to(roomId).emit("down-draw", posX, posY);
            }
        });
        
        socket.on("move-draw", (roomId, posX, posY, lastPosX, lastPosY) => {
            //驗證使用者與狀態
            if (socket.id === rooms[roomId].gameDetail.currentDraw && rooms[roomId].gameDetail.gameStatus === "start") {
                socket.to(roomId).emit("move-draw", posX, posY, lastPosX, lastPosY);
            }
        });
        
        socket.on("leave-draw", (roomId, posX, posY, lastPosX, lastPosY) => {
            //驗證使用者與狀態
            if (socket.id === rooms[roomId].gameDetail.currentDraw && rooms[roomId].gameDetail.gameStatus === "start") {
                socket.to(roomId).emit("leave-draw", posX, posY, lastPosX, lastPosY);
            }
        });
        
        socket.on("enter-draw", (roomId, posX, posY, lastPosX, lastPosY) => {
            //驗證使用者與狀態
            if (socket.id === rooms[roomId].gameDetail.currentDraw && rooms[roomId].gameDetail.gameStatus === "start") {
                socket.to(roomId).emit("enter-draw", posX, posY, lastPosX, lastPosY);
            }
        });	

        //join room
        socket.on("join-room", (lastRoomId, roomId) => {
            socket.leave(lastRoomId, () => {
                console.log("離開成功 上一個 room: " + lastRoomId + "加入的 room: " + roomId);
                clients[socket.id].room = "";     //清空房間資訊
                socket.emit("clearBoard");
                
                //remove user id in last room
                if (rooms[lastRoomId].clients.length === 1 && lastRoomId !== "room_1") {
                    delete rooms[lastRoomId];       //如果是最後一位離開房間，就連同房間一起刪除
                }
                else {
                    let clientIndex = findClient(socket.id, rooms[lastRoomId]);
                    rooms[lastRoomId].clients.splice(clientIndex, 1);           //刪除搜到的那項

                    let rankingIndex = findRanking(socket.id, rooms[lastRoomId]);
                    rooms[lastRoomId].rankingList.splice(rankingIndex, 1);      //刪除搜到的那項

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
                        rooms[roomId].rankingList.push(new Ranking(socket.id, clients[socket.id].userId));         //寫入排行榜
                    }
                    else {
                        rooms[roomId] = new RoomDetail(roomId);         //寫入房間
                        rooms[roomId].gameDetail.currentDraw = socket.id;       //設定第一回合者
                        rooms[roomId].rankingList.push(new Ranking(socket.id, clients[socket.id].userId));         //寫入排行榜
                        roomOwner = true;
                    }

                    rooms[roomId].clients.push(socket.id);		//寫入使用者id

                    draw.to(socket.id).emit("room-owner-status", roomOwner);
                    draw.in(roomId).emit("join-succeed", rooms[roomId].clients.length);
                    socket.emit("toGetUpdateDataURL");				//等於 draw.to(socket.id).emit
                    socket.emit("send-gameStatus", rooms[roomId].gameDetail.gameStatus);
                    console.log(rooms);
                    console.log(rooms[roomId].rankingList);
                });
            });
        });

        //send message
        socket.on("send-chat-message", (roomId, userName, msg) => {
            draw.in(roomId).emit("send-chat-message", userName, msg);
        });

        //game start
        let drawTimerId;
        socket.on("game-start", (roomId, userName) => {
            //驗證使用者
            if (socket.id === rooms[roomId].gameDetail.currentDraw) {
                rooms[roomId].gameDetail.gameStatus = "start";
                rooms[roomId].gameDetail.currentDraw = socket.id;
    
                //重置
                rooms[roomId].gameDetail.correctClients = [];
                rooms[roomId].gameDetail.correct = 0;
    
                //計算當前 topic
                let itemNum = rooms[roomId].gameDetail.orderNum % topic.length;
    
                socket.to(roomId).emit("freeze");		//其他玩家凍結
                socket.emit("game-run", topic[itemNum]);		//當前玩家開始
                draw.in(roomId).emit("clearBoard");		//所有玩家清空畫面
                draw.in(roomId).emit("updateCurrentUser", userName);
    
                //開始計時
                drawTimerId = setTimeout(() => {
                    if (rooms[roomId].gameDetail.correct === 0) {
                        rooms[roomId].gameDetail.gameStatus = "no-one-hit";
                    }
                    else if (rooms[roomId].gameDetail.correct === rooms[roomId].clients) {
                        rooms[roomId].gameDetail.gameStatus = "all-correct";
                    }
                    else {
                        rooms[roomId].gameDetail.gameStatus = "part-correct";
                    }
                    draw.in(roomId).emit("wait-next-turn", rooms[roomId].gameDetail.gameStatus, userName, topic[itemNum]);
                    middlePhaseTimer(draw, rooms, roomId);


                }, 10000);
                
                console.log(rooms);
            }         

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
                    //找 rankingList
                    let rankingIndex = findRanking(socket.id, rooms[roomId]);
                     
                    if (rankingIndex === false) throw Error("Do not find socketId in rankingList.");

                    //依照答對順序加分
                    if (rooms[roomId].gameDetail.correct > 2) {
                        rooms[roomId].rankingList[rankingIndex].score += 2;
                    }
                    else {
                        rooms[roomId].rankingList[rankingIndex].score += 5-rooms[roomId].gameDetail.correct;
                    }
                    let rankingIndex2 = findRanking(rooms[roomId].gameDetail.currentDraw, rooms[roomId]);
                    rooms[roomId].rankingList[rankingIndex2].score += 1;
                    rooms[roomId].rankingList.sort((a, b) => {return b.score-a.score;});        //大到小排序

                    draw.in(roomId).emit("rankingList-update", rooms[roomId].rankingList);
                    console.log(rooms[roomId].rankingList);


                    rooms[roomId].gameDetail.correctClients.push(socket.id);
                    socket.to(roomId).emit("send-chat-message", userName, "猜對了！");
                    socket.emit("send-chat-message", userName, "猜對了！答案是： " + topic[itemNum]);
                    rooms[roomId].gameDetail.correct += 1;
                    if (rooms[roomId].gameDetail.correct === rooms[roomId].clients.length-1) {
                        
                        //進入到間隔 phase
                        rooms[roomId].gameDetail.gameStatus = "all-correct";
                        draw.in(roomId).emit("wait-next-turn", rooms[roomId].gameDetail.gameStatus, rooms[roomId].rankingList[rankingIndex2].userId, topic[itemNum]);
                        clearTimeout(drawTimerId);        //清掉繪圖計時

                        middlePhaseTimer(draw, rooms, roomId);
                    }



                }
            }
            else {
                draw.in(roomId).emit("send-chat-message", userName, msg);
            }
        });

/*         //next turn
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
        }); */

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

                let rankingIndex = findRanking(socket.id, rooms[disconRoom]);
                rooms[disconRoom].rankingList.splice(rankingIndex, 1);      //刪除搜到的那項
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

function findRanking (targetClientId, targetRoomObj) {
    for (let i=0; i<targetRoomObj.rankingList.length ; i++) {
        if (targetRoomObj.rankingList[i].socketId === targetClientId) {
            return i;
        }
        else if (i === targetRoomObj.rankingList.length-1) {
            return false;
        }
    }
}

function middlePhaseTimer (draw, rooms, roomId) {
    setTimeout(() => {
        draw.in(roomId).emit("next-turn");
                        
        //輪下一位
        rooms[roomId].gameDetail.orderNum += 1;
        let userNum = findClient(rooms[roomId].gameDetail.currentDraw, rooms[roomId]);
        userNum += 1;                            
        let socketId = rooms[roomId].clients[userNum] || rooms[roomId].clients[0];
        rooms[roomId].gameDetail.currentDraw = socketId;
        draw.to(socketId).emit("your-turn");
        console.log(userNum, socketId);
        console.log(rooms);
    }, 5000);
}

// function timerRun (socket, io, roomId) {
//     io.in(roomId).emit("time-out");
// }


module.exports = drawSocket;
