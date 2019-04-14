/* ---------------Module--------------- */
const express = require("express");
const mysql = require('mysql2');
const Client = require('ssh2').Client;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require('fs');

const app = express();

/* --------------- Socket.io --------------- */
const http = require('http').Server(app);
const io = require('socket.io')(http);
//server side socket.io
let onlineCount = 0;
io.on("connection", (socket) => {
	onlineCount ++;
	io.emit("online", onlineCount);
	console.log("a user connected.");

	socket.on("disconnect", () => {
		console.log('user disconnected.');
		if (onlineCount > 0) {
			onlineCount -= 1;
		}
		io.emit("online", onlineCount);
	});

	socket.on("hello", (msg) => {
		socket.emit("hi", msg);
	});

	socket.on("send", (msg) => {
		//console.log(msg);
		io.emit("msg",msg);
	});

/* 	socket.on("join-room", (id) => {
		socket.join(id, () => {
			console.log(socket.rooms);
			io.in(id).emit("join-succeed", Object.keys(socket.rooms));
		});
	}); */
});

/* class Client{
	constructor(socket){
		this.socket=socket;
		this.data=null;
		socket.on("reqDataURL", () => {
			this.data=3;
			socket.broadcast.emit("reqDataURL");
		});
	}
} */

//let clients=[];
const gameDetail = {
	orderNum: 0,//計算當前回合玩家
	correctClients: [],
	correct: 0
};

const rooms = [
	{
		roomId: "room_1",
		clients: [],
		gameDetail: gameDetail
	}
];

const topic = ["蘋果", "香蕉", "鳳梨"];


//for draw-board
const draw = io.of("/draw");
draw.on("connection", (socket) => {
	//clients.push(new Client(socket, clients.length));
	console.log("draw connected.");
	//console.log(roomId);
	socket.join("room_1", () => {
		console.log(socket.rooms, socket.id);
		let roomTmp = socket.rooms.room_1;
		rooms[0].clients.push(socket.id);		//寫入使用者id
		console.log(rooms);
		//socket.to("room_1").emit('join-succeed', "1成功加入房間 room_1");		//除了自己以外全部都送
		draw.in('room_1').emit('join-succeed', rooms[0].clients.length);			//包含自己也送
		
		socket.on("disconnect", () => {
			console.log("draw disconnected.");
			console.log(roomTmp, socket.id);
			for (let i=0; i<rooms.length; i++) {		//搜索整個 rooms
				if (rooms[i].roomId === roomTmp) {
					for (let j=0; j<rooms[i].clients.length; j++) {			//搜索整個 cliens
						if (rooms[i].clients[j] === socket.id) {
							rooms[i].clients.splice(j, 1);			//刪除搜到的那項
						}					
					}
				}
			}
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
						gameDetail: gameDetail
					});
					findout = rooms.length-1;
					roomOwner = 1;					
				}				

				rooms[findout].clients.push(socket.id);		//寫入使用者id

				draw.to(socket.id).emit("room-owner-status", roomOwner);
				draw.in(roomId).emit("join-succeed", rooms[findout].clients.length);
				socket.emit("toGetUpdateDataURL");				//等於 draw.to(socket.id).emit
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
										socket.to(lastRoomId).emit("leave-succeed", rooms[i].clients.length);
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
	socket.on("game-start", (roomId) => {
		socket.to(roomId).emit("freeze");		//其他玩家凍結
		socket.emit("game-run", topic[0]);		//當前玩家開始
		draw.in(roomId).emit("clearBoard");		//所有玩家清空畫面
	});

	//answer message
	socket.on("send-answer-message", (roomId, userName, msg) => {
		for (let i=0; i<rooms.length; i++) {		//搜索整個 rooms
			if (rooms[i].roomId === roomId) {
				let itemNum = rooms[i].gameDetail.orderNum % rooms[i].clients.length;
				if (msg === topic[itemNum]) {
					let tmp = 0;
					for (let i=0; i<rooms[i].gameDetail.correctClients.length; i++) {
						if (rooms[i].gameDetail.correctClients[i] === socket.id) {
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
							console.log(rooms[i].gameDetail.correct,rooms[i].clients.length-1);
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
	socket.on("new-round", (roomId) => {
		//重置
		for (let i=0; i<rooms.length; i++) {		//搜索整個 rooms
			if (rooms[i].roomId === roomId) {
				rooms[i].gameDetail.correctClients = [];
				rooms[i].gameDetail.correct = 0;
				
				//計算當前 topic
				let itemNum = rooms[i].gameDetail.orderNum % rooms[i].clients.length;
				socket.to(roomId).emit("freeze");		//其他玩家凍結
				socket.emit("game-run", topic[itemNum]);		//當前玩家開始
				draw.in(roomId).emit("clearBoard");		//所有玩家清空畫面
			}
		}
	});
	
});






//create TCP connection to MySQL over SSH by using mysql2 and ssh2 module
let sql;	//can't use const

const ssh = new Client();
ssh.on('ready', function() {
	ssh.forwardOut(
		'127.0.0.1',
		12345,
		'127.0.0.1',
		3306,
		function (err, stream) {
			if (err) throw err;
			// Create the connection pool. The pool-specific settings are the defaults
/* 			pool = mysql.createPool({
			  user: 'root',
			  database: 'stylish',
			  password: 'daviddata1357',
			  stream: stream,
			  waitForConnections: true,
			  connectionLimit: 100,
			  queueLimit: 0
			});	 */	
			
			sql = mysql.createConnection({
				user: 'root',
				database: 'stylish',
				password: 'daviddata1357',
				stream: stream // <--- this is the important part
			});
			
			// use sql connection as usual
			sql.query("SELECT id FROM product", function (err, result, fields) {
				if (err) throw err;
				console.log("Connect to MySQL succeed!");
			});
	
		});
	}).connect({
	// ssh connection config ...
	host: '52.15.89.192',
	port: 22,
	username: 'ec2-user',
	privateKey: require('fs').readFileSync("./../.ssh/2019-4-3-keyPair.pem")
}); 

//use bodyParser and cookieParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());								//receive POST request JOSN req.body
app.use(cookieParser());

//set pug
app.set("view engine", "pug");

//static files
app.use("/static", express.static("public"));




app.get("/", (req, res) => {
	let html = fs.readFileSync("./public/html/index.html", "utf8");
	
	res.send(html);
});

app.get("/2", (req, res) => {
	res.sendFile(__dirname + "/public/html/index.html");
});

app.get("/draw-board", (req, res) => {
	res.sendFile(__dirname + "/public/html/draw-board.html");
});

app.get("/image-change", (req, res) => {
	res.sendFile(__dirname + "/public/html/image-change.html");
});

app.get("/draw-board-test", (req, res) => {
	res.sendFile(__dirname + "/public/html/draw-board-test.html");
});

app.get("/test-board", (req, res) => {
	res.sendFile(__dirname + "/public/html/test-board.html");
});

app.get("/api/test", (req, res) => {
	let roomId = req.query.roomId;
	console.log("xxx");
	//for draw-board
	const draw2 = io.of("/draw");
	draw2.on("connection", (socket) => {
		console.log("draw connected.");
		console.log(roomId);
		draw.join(roomId, () => {
			console.log(draw.rooms);
			io.to(roomId).emit('a new user has joined the room');
		});
		socket.on("reqDataURL", () => {
			socket.broadcast.emit("reqDataURL");
		});
		
		socket.on("resDataURL", (dataURL) => {
			socket.broadcast.emit("resDataURL", dataURL);
		});
		
		socket.on("down-draw", (posX, posY) => {
			socket.broadcast.emit("down-draw", posX, posY);
		});
		
		socket.on("move-draw", (posX, posY, lastPosX, lastPosY) => {
			socket.broadcast.emit("move-draw", posX, posY, lastPosX, lastPosY);
		});
		
		socket.on("leave-draw", (posX, posY, lastPosX, lastPosY) => {
			socket.broadcast.emit("leave-draw", posX, posY, lastPosX, lastPosY);
		});
		
		socket.on("enter-draw", (posX, posY, lastPosX, lastPosY) => {
			socket.broadcast.emit("enter-draw", posX, posY, lastPosX, lastPosY);
		});
	});
	res.send(roomId);
});

/* ---------------Port--------------- */
http.listen(4000, () => {
	console.log("this app is running on port 4000.");
});