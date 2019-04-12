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
	let roomId;
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

	socket.on("join-room", (id) => {
		roomId = id;
		socket.join(id, () => {
			console.log(socket.rooms);
			io.in(id).emit("join-succeed", Object.keys(socket.rooms));
		});
	});
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

let clients=[];
//for draw-board
const draw = io.of("/draw");
draw.on("connection", (socket) => {
	//clients.push(new Client(socket, clients.length));
	console.log("draw connected.");
	//console.log(roomId);
	socket.join("room_1", () => {
		console.log(socket.rooms);
		socket.to("room_1").emit('join-succeed', "1成功加入房間 room_1");		//除了自己以外全部都送
		draw.in('room_1').emit('join-succeed', "2成功加入房間 room_1");			//包含自己也送
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
//draw.emit("ttt", "123");





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